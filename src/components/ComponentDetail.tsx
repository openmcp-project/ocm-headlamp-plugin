import { useHistory, useParams } from 'react-router-dom';
import { ComponentVersion, Resource } from '../common/Resources';
import { ocmColors } from '../common/colors';
import { clusterPrefix, conditionColor, conditionLabel, age } from '../helpers';

const { Typography, Box, Paper, CircularProgress } =
  (window as any).pluginLib?.MuiCore ?? {};
const { SectionBox } = (window as any).pluginLib?.CommonComponents ?? {};

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box display="flex" alignItems="baseline" gap={1} mb={0.75}>
      <Typography variant="caption" color="textSecondary" style={{ fontWeight: 600, minWidth: 140 }}>{label}</Typography>
      <Typography variant="body2" style={{ fontFamily: 'monospace' }}>{value}</Typography>
    </Box>
  );
}

export default function ComponentDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const history = useHistory();
  const [components, error] = ComponentVersion.useList();
  const [resources] = Resource.useList();

  if (!components && !error) {
    return <Box p={3} display="flex" gap={2} alignItems="center"><CircularProgress size={20} /><Typography>Loading…</Typography></Box>;
  }

  const component = (components ?? []).find(
    (c: any) => c.metadata?.name === name && c.metadata?.namespace === namespace
  );

  if (!component) {
    return <Box p={3}><Typography color="error">ComponentVersion "{namespace}/{name}" not found.</Typography></Box>;
  }

  const base = clusterPrefix();
  const conds: any[] = component.jsonData?.status?.conditions ?? [];
  const compResources = (resources ?? []).filter(
    (r: any) => r.jsonData?.spec?.componentVersionRef?.name === name && r.metadata?.namespace === namespace
  );

  return (
    <SectionBox title={name} headerProps={{ headerStyle: 'main' }}>
      <Box display="flex" gap={2} flexWrap="wrap">
        <Paper elevation={1} style={{ flex: 1, minWidth: 300, padding: 20 }}>
          <Typography variant="subtitle2" style={{ marginBottom: 12, fontWeight: 700 }}>Specification</Typography>
          <KV label="Name"      value={name} />
          <KV label="Namespace" value={namespace} />
          <KV label="Component" value={component.jsonData?.spec?.component ?? '—'} />
          <KV label="Semver"    value={component.jsonData?.spec?.version?.semver ?? '—'} />
          <KV label="Resolved"  value={component.jsonData?.status?.reconciledVersion ?? '—'} />
          <KV label="Repository" value={
            <span
              style={{ color: ocmColors.link, textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => history.push(`${base}/ocm/repositories/${namespace}/${component.jsonData?.spec?.repositoryRef?.name}`)}
            >
              {component.jsonData?.spec?.repositoryRef?.name ?? '—'}
            </span>
          } />
          <KV label="Age"       value={age(component.metadata?.creationTimestamp)} />
        </Paper>

        <Paper elevation={1} style={{ flex: 1, minWidth: 240, padding: 20 }}>
          <Typography variant="subtitle2" style={{ marginBottom: 12, fontWeight: 700 }}>Status</Typography>
          {conds.length === 0
            ? <Typography variant="caption" color="textSecondary">No conditions reported.</Typography>
            : conds.map((c: any) => (
              <Box key={c.type} display="flex" alignItems="center" gap={1} mb={0.75}>
                <span style={{ padding: '1px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                  background: conditionColor([c], c.type), color: '#fff' }}>
                  {conditionLabel([c], c.type)}
                </span>
                {c.message && <Typography variant="caption" color="textSecondary">{c.message}</Typography>}
              </Box>
            ))
          }
          {component.jsonData?.status?.observedGeneration !== undefined && (
            <KV label="Observed Gen" value={String(component.jsonData.status.observedGeneration)} />
          )}
        </Paper>
      </Box>

      {compResources.length > 0 && (
        <Box mt={3}>
          <Typography variant="h6" style={{ marginBottom: 12 }}>Resources ({compResources.length})</Typography>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' as const, background: '#fafafa' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Resource Ref</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Snapshot</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {compResources.map((r: any) => {
                const rName: string = r.metadata?.name ?? '';
                const rNs: string   = r.metadata?.namespace ?? 'default';
                const rConds: any[] = r.jsonData?.status?.conditions ?? [];
                return (
                  <tr key={rName}
                    style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                    onClick={() => history.push(`${base}/ocm/resources/${rNs}/${rName}`)}>
                    <td style={{ padding: '8px 12px', color: ocmColors.link, textDecoration: 'underline' }}>{rName}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{r.jsonData?.spec?.resourceRef?.name ?? '—'}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ padding: '2px 7px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: '#1565c0', color: '#fff' }}>
                        {r.jsonData?.spec?.resourceRef?.type ?? '—'}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: '#666' }}>{r.jsonData?.status?.snapshotName ?? '—'}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: conditionColor(rConds), color: '#fff' }}>
                        {conditionLabel(rConds)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      )}
    </SectionBox>
  );
}
