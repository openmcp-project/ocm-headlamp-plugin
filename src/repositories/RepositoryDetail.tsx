import { useHistory, useParams } from 'react-router-dom';
import { Repository, ComponentVersion } from '../common/Resources';
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

export default function RepositoryDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const history = useHistory();
  const [repos, error] = Repository.useList();
  const [components] = ComponentVersion.useList();

  if (!repos && !error) {
    return <Box p={3} display="flex" gap={2} alignItems="center"><CircularProgress size={20} /><Typography>Loading…</Typography></Box>;
  }

  const repo = (repos ?? []).find(
    (r: any) => r.metadata?.name === name && r.metadata?.namespace === namespace
  );

  if (!repo) {
    return <Box p={3}><Typography color="error">Repository "{namespace}/{name}" not found.</Typography></Box>;
  }

  const base = clusterPrefix();
  const conds: any[] = repo.jsonData?.status?.conditions ?? [];
  const repoComponents = (components ?? []).filter(
    (c: any) => c.jsonData?.spec?.repositoryRef?.name === name && c.metadata?.namespace === namespace
  );

  return (
    <SectionBox title={name} headerProps={{ headerStyle: 'main' }}>
      <Box display="flex" gap={2} flexWrap="wrap">
        {/* Left panel — spec */}
        <Paper elevation={1} style={{ flex: 1, minWidth: 300, padding: 20 }}>
          <Typography variant="subtitle2" style={{ marginBottom: 12, fontWeight: 700 }}>Specification</Typography>
          <KV label="Name"      value={name} />
          <KV label="Namespace" value={namespace} />
          <KV label="URL"       value={repo.jsonData?.spec?.url ?? '—'} />
          <KV label="Secret Ref" value={repo.jsonData?.spec?.secretRef?.name ?? <span style={{ color: '#aaa' }}>none</span>} />
          <KV label="Age"       value={age(repo.metadata?.creationTimestamp)} />
        </Paper>

        {/* Right panel — status */}
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
        </Paper>
      </Box>

      {/* Components sourced from this repository */}
      {repoComponents.length > 0 && (
        <Box mt={3}>
          <Typography variant="h6" style={{ marginBottom: 12 }}>Components ({repoComponents.length})</Typography>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' as const, background: '#fafafa' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Component</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Semver</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Resolved</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {repoComponents.map((c: any) => {
                const cName: string = c.metadata?.name ?? '';
                const cNs: string   = c.metadata?.namespace ?? 'default';
                const cConds: any[] = c.jsonData?.status?.conditions ?? [];
                return (
                  <tr key={cName}
                    style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                    onClick={() => history.push(`${base}/ocm/components/${cNs}/${cName}`)}>
                    <td style={{ padding: '8px 12px', color: ocmColors.link, textDecoration: 'underline' }}>{cName}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{c.jsonData?.spec?.component ?? '—'}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{c.jsonData?.spec?.version?.semver ?? '—'}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{c.jsonData?.status?.reconciledVersion ?? '—'}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: conditionColor(cConds), color: '#fff' }}>
                        {conditionLabel(cConds)}
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
