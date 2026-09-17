import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Repository, ComponentVersion, Resource, Deployer } from '../common/Resources';
import { ocmColors } from '../common/colors';
import { clusterPrefix, conditionColor, age } from '../helpers';

const { Typography, Box, Paper, CircularProgress, Alert } =
  (window as any).pluginLib?.MuiCore ?? {};
const { SectionBox } = (window as any).pluginLib?.CommonComponents ?? {};

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  title,
  total,
  ready,
  notReady,
  unknown,
  onClick,
}: {
  title: string;
  total: number;
  ready: number;
  notReady: number;
  unknown: number;
  onClick?: () => void;
}) {
  const r = 30;
  const cx = 40;
  const cy = 40;
  const circ = 2 * Math.PI * r;

  const slices = [
    { value: ready,    color: ocmColors.ready.bg    },
    { value: notReady, color: ocmColors.notReady.bg  },
    { value: unknown,  color: ocmColors.unknown.bg   },
  ];

  let offset = 0;
  const segs = slices.map((s) => {
    const dash = total > 0 ? (s.value / total) * circ : 0;
    const seg = { ...s, dash, offset };
    offset += dash;
    return seg;
  });

  return (
    <Paper
      elevation={1}
      style={{ padding: '16px 20px', minWidth: 180, cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <Typography variant="caption" color="textSecondary" style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>
        {title}
      </Typography>
      <Box display="flex" alignItems="center" gap={2}>
        {/* donut */}
        <Box position="relative" flexShrink={0} style={{ width: 80, height: 80 }}>
          <svg width={80} height={80} viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e0e0e0" strokeWidth={10} />
            {segs.map((s, i) =>
              s.dash > 0 ? (
                <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                  stroke={s.color} strokeWidth={10}
                  strokeDasharray={`${s.dash} ${circ - s.dash}`}
                  strokeDashoffset={-s.offset}
                />
              ) : null
            )}
          </svg>
          <Box position="absolute" top={0} left={0} right={0} bottom={0}
            display="flex" alignItems="center" justifyContent="center">
            <Typography style={{ fontWeight: 700, fontSize: 18, lineHeight: 1 }}>{total}</Typography>
          </Box>
        </Box>

        {/* legend */}
        <Box display="flex" flexDirection="column" gap={0.5}>
          {[
            { label: 'Ready',    value: ready,    color: ocmColors.ready.bg    },
            { label: 'Not Ready', value: notReady, color: ocmColors.notReady.bg  },
            { label: 'Unknown',   value: unknown,  color: ocmColors.unknown.bg   },
          ].map((row) => (
            <Box key={row.label} display="flex" alignItems="center" gap={0.75}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: row.color, flexShrink: 0 }} />
              <Typography variant="caption" style={{ fontWeight: 700 }}>{row.value}</Typography>
              <Typography variant="caption" color="textSecondary">{row.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

// ── Pipeline row ──────────────────────────────────────────────────────────────

function PipelineRow({
  repo,
  components,
  resources,
  deployers,
}: {
  repo: any;
  components: any[];
  resources: any[];
  deployers: any[];
}) {
  const history = useHistory();
  const [expanded, setExpanded] = useState(false);
  const base = clusterPrefix();
  const ns: string = repo.metadata?.namespace ?? 'default';
  const name: string = repo.metadata?.name ?? '';
  const conds: any[] = repo.jsonData?.status?.conditions ?? [];
  const dotColor = conditionColor(conds);

  const repoComponents = components.filter(
    (c: any) => c.jsonData?.spec?.repositoryRef?.name === name
  );
  const repoResources = resources.filter((r: any) =>
    repoComponents.some((c: any) => c.metadata?.name === r.jsonData?.spec?.componentVersionRef?.name)
  );
  const repoDeployers = deployers.filter((d: any) =>
    repoResources.some((r: any) => r.metadata?.name === d.jsonData?.spec?.resourceRef?.name)
  );

  return (
    <Paper elevation={1} style={{ overflow: 'hidden' }}>
      <Box px={2} py={1.25} display="flex" alignItems="center" gap={1.5}
        style={{ cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}
      >
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
        <Box flex={1} minWidth={0}>
          <Typography
            variant="subtitle2"
            style={{ color: ocmColors.link, textDecoration: 'underline', cursor: 'pointer', display: 'inline' }}
            onClick={(e: any) => { e.stopPropagation(); history.push(`${base}/ocm/repositories/${ns}/${name}`); }}
          >
            {name}
          </Typography>
          <Typography variant="caption" color="textSecondary" style={{ fontFamily: 'monospace', display: 'block' }}>
            {repo.jsonData?.spec?.url ?? ''}
          </Typography>
        </Box>

        <Box display="flex" gap={1.5} mr={1}>
          {[
            { label: 'Components', count: repoComponents.length, path: `${base}/ocm/components` },
            { label: 'Resources',  count: repoResources.length,  path: `${base}/ocm/resources`  },
            { label: 'Deployers',  count: repoDeployers.length,  path: `${base}/ocm/deployers`  },
          ].map((item) => (
            <Box key={item.label} display="flex" flexDirection="column" alignItems="center"
              onClick={(e: any) => { e.stopPropagation(); if (item.count > 0) history.push(item.path); }}
              style={{ cursor: item.count > 0 ? 'pointer' : 'default', minWidth: 56 }}
            >
              <Typography style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>{item.count}</Typography>
              <Typography variant="caption" color="textSecondary" style={{ fontSize: 10 }}>{item.label}</Typography>
            </Box>
          ))}
        </Box>

        <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke="#999" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
          <path d="M3 4.5l3 3 3-3"/>
        </svg>
      </Box>

      {expanded && repoComponents.length > 0 && (
        <Box style={{ borderTop: '1px solid #f5f5f5', padding: '12px 16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e0e0', textAlign: 'left' as const }}>
                <th style={{ padding: '3px 8px 5px 0', fontWeight: 600, color: '#666', fontSize: 11 }}>Component</th>
                <th style={{ padding: '3px 8px 5px 0', fontWeight: 600, color: '#666', fontSize: 11 }}>Version</th>
                <th style={{ padding: '3px 8px 5px 0', fontWeight: 600, color: '#666', fontSize: 11 }}>Resources</th>
                <th style={{ padding: '3px 0 5px 0',   fontWeight: 600, color: '#666', fontSize: 11 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {repoComponents.map((c: any) => {
                const cName: string = c.metadata?.name ?? '';
                const cNs: string = c.metadata?.namespace ?? 'default';
                const version: string = c.jsonData?.status?.reconciledVersion ?? c.jsonData?.spec?.version?.semver ?? '—';
                const compResources = repoResources.filter(
                  (r: any) => r.jsonData?.spec?.componentVersionRef?.name === cName
                );
                const cConds: any[] = c.jsonData?.status?.conditions ?? [];
                const dotCol = conditionColor(cConds);
                return (
                  <tr key={cName}
                    style={{ borderBottom: '1px solid #fafafa', cursor: 'pointer' }}
                    onClick={(e: any) => { e.stopPropagation(); history.push(`${base}/ocm/components/${cNs}/${cName}`); }}
                  >
                    <td style={{ padding: '4px 8px 4px 0', fontFamily: 'monospace', color: ocmColors.link, textDecoration: 'underline' }}>
                      {cName}
                    </td>
                    <td style={{ padding: '4px 8px 4px 0', fontSize: 11, fontFamily: 'monospace' }}>{version}</td>
                    <td style={{ padding: '4px 8px 4px 0', fontSize: 11 }}>{compResources.length}</td>
                    <td style={{ padding: '4px 0' }}>
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: dotCol }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      )}
    </Paper>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function OCMOverview() {
  const history = useHistory();
  const [repos, repoErr]       = Repository.useList();
  const [components, compErr]  = ComponentVersion.useList();
  const [resources, resErr]    = Resource.useList();
  const [deployers, depErr]    = Deployer.useList();

  const anyErr = repoErr || compErr || resErr || depErr;
  const loading = !repos || !components || !resources || !deployers;

  if (anyErr) {
    const msg = String((anyErr as any)?.message ?? anyErr ?? '').toLowerCase();
    const notInstalled = msg.includes('404') || msg.includes('not found') || msg.includes('no kind');
    return (
      <Box p={3}>
        <Alert severity={notInstalled ? 'info' : 'warning'}>
          {notInstalled
            ? 'OCM controller is not installed on this cluster — the CRDs were not found.'
            : `Could not load OCM resources: ${String((anyErr as any)?.message ?? anyErr)}`}
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box p={3} display="flex" alignItems="center" gap={2}>
        <CircularProgress size={20} />
        <Typography>Loading OCM…</Typography>
      </Box>
    );
  }

  const base = clusterPrefix();

  function stats(items: any[]) {
    const conds = (i: any): any[] => i.jsonData?.status?.conditions ?? [];
    const isReady = (i: any) => conds(i).find((c: any) => c.type === 'Ready')?.status === 'True';
    const isBad   = (i: any) => conds(i).find((c: any) => c.type === 'Ready')?.status === 'False';
    const ready    = items.filter(isReady).length;
    const notReady = items.filter(isBad).length;
    const unknown  = items.length - ready - notReady;
    return { total: items.length, ready, notReady, unknown };
  }

  return (
    <SectionBox title="OCM Overview" headerProps={{ headerStyle: 'main' }}>

      {/* Summary cards */}
      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <StatCard title="Repositories" {...stats(repos!)}
          onClick={() => history.push(`${base}/ocm/repositories`)} />
        <StatCard title="Components"   {...stats(components!)}
          onClick={() => history.push(`${base}/ocm/components`)} />
        <StatCard title="Resources"    {...stats(resources!)}
          onClick={() => history.push(`${base}/ocm/resources`)} />
        <StatCard title="Deployers"    {...stats(deployers!)}
          onClick={() => history.push(`${base}/ocm/deployers`)} />
      </Box>

      {/* Pipeline tree — one row per repository */}
      <Typography variant="h6" style={{ marginBottom: 12 }}>
        Delivery Pipelines
      </Typography>

      {(repos as any[]).length === 0 ? (
        <Alert severity="info">No OCM Repositories found on this cluster.</Alert>
      ) : (
        <Box display="flex" flexDirection="column" gap={1.5}>
          {(repos as any[]).map((r: any) => (
            <PipelineRow
              key={`${r.metadata?.namespace}/${r.metadata?.name}`}
              repo={r}
              components={components as any[]}
              resources={resources as any[]}
              deployers={deployers as any[]}
            />
          ))}
        </Box>
      )}
    </SectionBox>
  );
}
