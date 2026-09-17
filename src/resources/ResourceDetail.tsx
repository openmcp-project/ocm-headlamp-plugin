import { useHistory, useParams } from 'react-router-dom';
import { Resource, Deployer } from '../common/Resources';
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

export default function ResourceDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const history = useHistory();
  const [resources, error] = Resource.useList();
  const [deployers] = Deployer.useList();

  if (!resources && !error) {
    return <Box p={3} display="flex" gap={2} alignItems="center"><CircularProgress size={20} /><Typography>Loading…</Typography></Box>;
  }

  const resource = (resources ?? []).find(
    (r: any) => r.metadata?.name === name && r.metadata?.namespace === namespace
  );

  if (!resource) {
    return <Box p={3}><Typography color="error">Resource "{namespace}/{name}" not found.</Typography></Box>;
  }

  const base = clusterPrefix();
  const conds: any[] = resource.jsonData?.status?.conditions ?? [];
  const compRef: string = resource.jsonData?.spec?.componentVersionRef?.name ?? '';
  const resDeployers = (deployers ?? []).filter(
    (d: any) => d.jsonData?.spec?.resourceRef?.name === name && d.metadata?.namespace === namespace
  );

  return (
    <SectionBox title={name} headerProps={{ headerStyle: 'main' }}>
      <Box display="flex" gap={2} flexWrap="wrap">
        <Paper elevation={1} style={{ flex: 1, minWidth: 300, padding: 20 }}>
          <Typography variant="subtitle2" style={{ marginBottom: 12, fontWeight: 700 }}>Specification</Typography>
          <KV label="Name"           value={name} />
          <KV label="Namespace"      value={namespace} />
          <KV label="Resource Ref"   value={resource.jsonData?.spec?.resourceRef?.name ?? '—'} />
          <KV label="Type"           value={
            <span style={{ padding: '1px 7px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: '#1565c0', color: '#fff' }}>
              {resource.jsonData?.spec?.resourceRef?.type ?? '—'}
            </span>
          } />
          <KV label="Component"      value={
            compRef
              ? <span style={{ color: ocmColors.link, textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={() => history.push(`${base}/ocm/components/${namespace}/${compRef}`)}>
                  {compRef}
                </span>
              : '—'
          } />
          <KV label="Age"            value={age(resource.metadata?.creationTimestamp)} />
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
          {resource.jsonData?.status?.snapshotName && (
            <KV label="Snapshot" value={resource.jsonData.status.snapshotName} />
          )}
          {resource.jsonData?.status?.digest && (
            <KV label="Digest" value={resource.jsonData.status.digest} />
          )}
        </Paper>
      </Box>

      {resDeployers.length > 0 && (
        <Box mt={3}>
          <Typography variant="h6" style={{ marginBottom: 12 }}>Deployers ({resDeployers.length})</Typography>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' as const, background: '#fafafa' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Target Namespace</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Last Applied</th>
                <th style={{ padding: '8px 12px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {resDeployers.map((d: any) => {
                const dName: string = d.metadata?.name ?? '';
                const dNs: string   = d.metadata?.namespace ?? 'default';
                const dConds: any[] = d.jsonData?.status?.conditions ?? [];
                return (
                  <tr key={dName}
                    style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                    onClick={() => history.push(`${base}/ocm/deployers/${dNs}/${dName}`)}>
                    <td style={{ padding: '8px 12px', color: ocmColors.link, textDecoration: 'underline' }}>{dName}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{d.jsonData?.spec?.targetNamespace ?? dNs}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 11, color: '#666' }}>{d.jsonData?.status?.lastAppliedRevision ?? '—'}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: conditionColor(dConds), color: '#fff' }}>
                        {conditionLabel(dConds)}
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
