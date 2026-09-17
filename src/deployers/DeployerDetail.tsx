import { useHistory, useParams } from 'react-router-dom';
import { Deployer, Resource } from '../common/Resources';
import { ocmColors } from '../common/colors';
import { clusterPrefix, conditionColor, conditionLabel, age } from '../helpers';

const { Typography, Box, Paper, CircularProgress } =
  (window as any).pluginLib?.MuiCore ?? {};
const { SectionBox } = (window as any).pluginLib?.CommonComponents ?? {};

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box display="flex" alignItems="baseline" gap={1} mb={0.75}>
      <Typography variant="caption" color="textSecondary" style={{ fontWeight: 600, minWidth: 160 }}>{label}</Typography>
      <Typography variant="body2" style={{ fontFamily: 'monospace' }}>{value}</Typography>
    </Box>
  );
}

export default function DeployerDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const history = useHistory();
  const [deployers, error] = Deployer.useList();
  const [resources] = Resource.useList();

  if (!deployers && !error) {
    return <Box p={3} display="flex" gap={2} alignItems="center"><CircularProgress size={20} /><Typography>Loading…</Typography></Box>;
  }

  const deployer = (deployers ?? []).find(
    (d: any) => d.metadata?.name === name && d.metadata?.namespace === namespace
  );

  if (!deployer) {
    return <Box p={3}><Typography color="error">Deployer "{namespace}/{name}" not found.</Typography></Box>;
  }

  const base = clusterPrefix();
  const conds: any[] = deployer.jsonData?.status?.conditions ?? [];
  const resRef: string = deployer.jsonData?.spec?.resourceRef?.name ?? '';
  const resource = (resources ?? []).find(
    (r: any) => r.metadata?.name === resRef && r.metadata?.namespace === namespace
  );

  return (
    <SectionBox title={name} headerProps={{ headerStyle: 'main' }}>
      <Box display="flex" gap={2} flexWrap="wrap">
        <Paper elevation={1} style={{ flex: 1, minWidth: 300, padding: 20 }}>
          <Typography variant="subtitle2" style={{ marginBottom: 12, fontWeight: 700 }}>Specification</Typography>
          <KV label="Name"             value={name} />
          <KV label="Namespace"        value={namespace} />
          <KV label="Resource Ref"     value={
            resRef
              ? <span style={{ color: ocmColors.link, textDecoration: 'underline', cursor: 'pointer' }}
                  onClick={() => history.push(`${base}/ocm/resources/${namespace}/${resRef}`)}>
                  {resRef}
                </span>
              : '—'
          } />
          <KV label="Target Namespace" value={deployer.jsonData?.spec?.targetNamespace ?? namespace} />
          <KV label="Interval"         value={deployer.jsonData?.spec?.interval ?? '—'} />
          <KV label="Prune"            value={deployer.jsonData?.spec?.prune !== undefined ? String(deployer.jsonData.spec.prune) : '—'} />
          <KV label="Age"              value={age(deployer.metadata?.creationTimestamp)} />
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
          {deployer.jsonData?.status?.lastAppliedRevision && (
            <KV label="Last Applied"   value={deployer.jsonData.status.lastAppliedRevision} />
          )}
          {deployer.jsonData?.status?.observedGeneration !== undefined && (
            <KV label="Observed Gen"   value={String(deployer.jsonData.status.observedGeneration)} />
          )}
        </Paper>
      </Box>

      {/* Linked resource summary */}
      {resource && (
        <Box mt={3}>
          <Typography variant="h6" style={{ marginBottom: 12 }}>Source Resource</Typography>
          <Paper elevation={1} style={{ padding: '12px 16px' }}>
            <Box display="flex" alignItems="center" gap={2}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: conditionColor(resource.jsonData?.status?.conditions ?? []), flexShrink: 0 }} />
              <Typography
                variant="subtitle2"
                style={{ color: ocmColors.link, textDecoration: 'underline', cursor: 'pointer' }}
                onClick={() => history.push(`${base}/ocm/resources/${namespace}/${resRef}`)}
              >
                {resRef}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                type: {resource.jsonData?.spec?.resourceRef?.type ?? '—'}
              </Typography>
              {resource.jsonData?.status?.snapshotName && (
                <Typography variant="caption" color="textSecondary" style={{ fontFamily: 'monospace' }}>
                  snapshot: {resource.jsonData.status.snapshotName}
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>
      )}
    </SectionBox>
  );
}
