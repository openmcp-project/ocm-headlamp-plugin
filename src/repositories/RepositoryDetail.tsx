import {
  ConditionsTable,
  MainInfoSection,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { useParams } from 'react-router-dom';
import { Repository, ComponentVersion } from '../common/Resources';

export default function RepositoryDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [repos] = Repository.useList();
  const [components] = ComponentVersion.useList();

  const repo = (repos ?? []).find(
    (r: any) => r.metadata?.name === name && r.metadata?.namespace === namespace
  );

  if (!repo) return null;

  const repoComponents = (components ?? []).filter(
    (c: any) => c.jsonData?.spec?.repositoryRef?.name === name
  );

  const extraInfo = [
    { name: 'URL', value: repo.jsonData?.spec?.repositorySpec?.baseUrl ?? repo.jsonData?.spec?.url ?? '—' },
    { name: 'Auth Secret', value: repo.jsonData?.spec?.secretRef?.name ?? '—', hide: !repo.jsonData?.spec?.secretRef?.name },
    { name: 'Interval', value: repo.jsonData?.spec?.interval ?? '—' },
  ];

  return (
    <>
      <MainInfoSection resource={repo as any} extraInfo={extraInfo} />
      <SectionBox title="Conditions">
        <ConditionsTable resource={repo as any} />
      </SectionBox>
      {repoComponents.length > 0 && (
        <SectionBox title={`Components (${repoComponents.length})`}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' as const, background: '#fafafa' }}>
                {['Name', 'Component', 'Semver', 'Resolved'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {repoComponents.map((c: any) => (
                <tr key={c.metadata?.name} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 12px' }}>{c.metadata?.name}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{c.jsonData?.spec?.component ?? '—'}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{c.jsonData?.spec?.semver ?? c.jsonData?.spec?.version?.semver ?? '—'}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{c.jsonData?.status?.reconciledVersion ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </SectionBox>
      )}
    </>
  );
}
