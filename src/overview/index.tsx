import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ocmColors } from '../common/colors';
import { clusterPrefix, conditionColor, age } from '../helpers';
import { MOCK_REPOS, MOCK_COMPONENTS, MOCK_RESOURCES, MOCK_DEPLOYERS } from '../common/mockData';
import { Repository, ComponentVersion, Resource, Deployer } from '../common/Resources';

const { Typography, Box, Paper, Chip, CircularProgress } =
  (window as any).pluginLib?.MuiCore ?? {};

// ── Donut chart (pure SVG) ────────────────────────────────────────────────────

interface DonutSlice { value: number; color: string; label: string; onClick?: () => void; }

function DonutChart({ slices, total, size = 100 }: { slices: DonutSlice[]; total: number; size?: number }) {
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  const segments = slices.map((s) => {
    const dash = total > 0 ? (s.value / total) * circumference : 0;
    const seg = { ...s, dash, offset };
    offset += dash;
    return seg;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e0e0e0" strokeWidth={size * 0.13} />
      {segments.map((s, i) =>
        s.dash > 0 ? (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={s.color} strokeWidth={size * 0.13}
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset} strokeLinecap="butt"
          />
        ) : null
      )}
    </svg>
  );
}

function DonutCard({ title, slices, total, size = 100 }: {
  title: string; slices: DonutSlice[]; total: number; size?: number;
}) {
  return (
    <Paper elevation={1} style={{ padding: '16px 20px', flex: '1 1 200px', minWidth: 200 }}>
      <Typography variant="subtitle2" color="textSecondary" gutterBottom style={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Box display="flex" alignItems="center" gap={3}>
        <Box position="relative" flexShrink={0} style={{ width: size, height: size }}>
          <DonutChart slices={slices} total={total} size={size} />
          <Box position="absolute" top={0} left={0} right={0} bottom={0}
            display="flex" alignItems="center" justifyContent="center" flexDirection="column">
            <Typography style={{ fontWeight: 700, fontSize: size * 0.22, lineHeight: 1 }}>{total}</Typography>
            <Typography variant="caption" color="textSecondary" style={{ fontSize: size * 0.11 }}>total</Typography>
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" gap={0.75}>
          {slices.map((s) => (
            <Box key={s.label} display="flex" alignItems="center" gap={1}
              style={{ cursor: s.onClick ? 'pointer' : 'default' }}
              onClick={s.onClick}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              <Typography variant="body2" style={{ fontWeight: 700 }}>{s.value}</Typography>
              <Typography variant="body2" color="textSecondary"
                style={{ textDecoration: s.onClick ? 'underline' : 'none' }}>
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

// ── Pipeline row ──────────────────────────────────────────────────────────────

function PipelineRow({ repo, components, resources, deployers }: {
  repo: any; components: any[]; resources: any[]; deployers: any[];
}) {
  const history = useHistory();
  const [expanded, setExpanded] = useState(false);
  const base = clusterPrefix();
  const ns: string = repo.metadata?.namespace ?? 'default';
  const name: string = repo.metadata?.name ?? '';
  const url: string = repo.jsonData?.spec?.url ?? '';
  const conds: any[] = repo.jsonData?.status?.conditions ?? [];
  const dotColor = conditionColor(conds);
  const isReady = conds.find((c: any) => c.type === 'Ready')?.status === 'True';
  const isBad = conds.find((c: any) => c.type === 'Ready')?.status === 'False';
  const borderColor = isReady ? '#4caf50' : isBad ? '#f44336' : '#ff9800';

  const repoComponents = components.filter((c: any) => c.jsonData?.spec?.repositoryRef?.name === name);
  const repoResources = resources.filter((r: any) =>
    repoComponents.some((c: any) => c.metadata?.name === (r.jsonData?.spec?.componentRef?.name ?? r.jsonData?.spec?.componentVersionRef?.name))
  );
  const repoDeployers = deployers.filter((d: any) =>
    repoResources.some((r: any) => r.metadata?.name === d.jsonData?.spec?.resourceRef?.name)
  );

  return (
    <Paper elevation={2} style={{ borderLeft: `4px solid ${borderColor}`, overflow: 'hidden' }}>
      <Box px={2} py={1.5} display="flex" alignItems="center" gap={1.5}
        style={{ cursor: 'pointer', borderBottom: expanded ? '1px solid #f0f0f0' : 'none' }}
        onClick={() => setExpanded(e => !e)}
      >
        <Box flex={1} minWidth={0}>
          <Typography
            variant="subtitle2"
            style={{ color: ocmColors.link, textDecoration: 'underline', cursor: 'pointer', display: 'inline' }}
            onClick={(e: any) => { e.stopPropagation(); history.push(`${base}/ocm/repositories/${ns}/${name}`); }}
          >
            {name}
          </Typography>
          <Typography variant="caption" color="textSecondary" style={{ fontFamily: 'monospace', display: 'block' }}>
            {url}
          </Typography>
        </Box>
        <Box display="flex" gap={1.5} mr={1}>
          {[
            { label: 'Components', count: repoComponents.length, path: `${base}/ocm/components` },
            { label: 'Resources', count: repoResources.length, path: `${base}/ocm/resources` },
            { label: 'Deployers', count: repoDeployers.length, path: `${base}/ocm/deployers` },
          ].map((item) => (
            <Box key={item.label} display="flex" flexDirection="column" alignItems="center"
              onClick={(e: any) => { e.stopPropagation(); if (item.count > 0) history.push(item.path); }}
              style={{ cursor: item.count > 0 ? 'pointer' : 'default', minWidth: 64 }}
            >
              <Typography style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>{item.count}</Typography>
              <Typography variant="caption" color="textSecondary" style={{ fontSize: 10 }}>{item.label}</Typography>
            </Box>
          ))}
        </Box>
        <Chip
          size="small"
          label={isReady ? 'Ready' : isBad ? 'Not Ready' : 'Unknown'}
          style={{ background: borderColor, color: '#fff', fontWeight: 600, fontSize: 11 }}
        />
        <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke="#999" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </Box>

      {expanded && repoComponents.length > 0 && (
        <Box style={{ padding: '12px 16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e0e0', textAlign: 'left' as const }}>
                {['Component', 'Version', 'Resources', 'Status'].map(h => (
                  <th key={h} style={{ padding: '3px 8px 5px 0', fontWeight: 600, color: '#666', fontSize: 11 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {repoComponents.map((c: any) => {
                const cName: string = c.metadata?.name ?? '';
                const cNs: string = c.metadata?.namespace ?? 'default';
                const version: string = c.jsonData?.status?.reconciledVersion ?? c.jsonData?.spec?.version?.semver ?? '—';
                const compResources = repoResources.filter((r: any) => (r.jsonData?.spec?.componentRef?.name ?? r.jsonData?.spec?.componentVersionRef?.name) === cName);
                const cConds: any[] = c.jsonData?.status?.conditions ?? [];
                const isCompReady = cConds.find((cc: any) => cc.type === 'Ready')?.status === 'True';
                const isCompBad = cConds.find((cc: any) => cc.type === 'Ready')?.status === 'False';
                const compBorderColor = isCompReady ? '#4caf50' : isCompBad ? '#f44336' : '#ff9800';
                return (
                  <tr key={cName}
                    style={{ borderBottom: '1px solid #fafafa', cursor: 'pointer' }}
                    onClick={(e: any) => { e.stopPropagation(); history.push(`${base}/ocm/components/${cNs}/${cName}`); }}
                  >
                    <td style={{ padding: '4px 8px 4px 0', fontFamily: 'monospace', color: ocmColors.link, textDecoration: 'underline' }}>{cName}</td>
                    <td style={{ padding: '4px 8px 4px 0', fontSize: 11, fontFamily: 'monospace' }}>{version}</td>
                    <td style={{ padding: '4px 8px 4px 0', fontSize: 11 }}>{compResources.length}</td>
                    <td style={{ padding: '4px 0' }}>
                      <Chip size="small" label={isCompReady ? 'Ready' : isCompBad ? 'Not Ready' : 'Unknown'}
                        style={{ background: compBorderColor, color: '#fff', fontWeight: 600, fontSize: 10, height: 18 }} />
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
  const [repos]      = Repository.useList();
  const [components] = ComponentVersion.useList();
  const [resources]  = Resource.useList();
  const [deployers]  = Deployer.useList();

  if (!repos || !components || !resources || !deployers) {
    return (
      <Box p={3} display="flex" alignItems="center" gap={2}>
        <CircularProgress size={20} />
        <Typography>Loading OCM…</Typography>
      </Box>
    );
  }
  const base = clusterPrefix();

  function slices(items: any[], path: string): DonutSlice[] {
    const isReady = (i: any) => i.jsonData?.status?.conditions?.find((c: any) => c.type === 'Ready')?.status === 'True';
    const isBad   = (i: any) => i.jsonData?.status?.conditions?.find((c: any) => c.type === 'Ready')?.status === 'False';
    const ready    = items.filter(isReady).length;
    const notReady = items.filter(isBad).length;
    const unknown  = items.length - ready - notReady;
    return [
      { value: ready,    color: '#4caf50', label: 'Ready',     onClick: ready    > 0 ? () => history.push(`${base}${path}`) : undefined },
      { value: notReady, color: '#f44336', label: 'Not Ready', onClick: notReady > 0 ? () => history.push(`${base}${path}`) : undefined },
      { value: unknown,  color: '#ff9800', label: 'Unknown',   onClick: unknown  > 0 ? () => history.push(`${base}${path}`) : undefined },
    ];
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>OCM Overview</Typography>

      <Typography variant="overline" color="textSecondary" style={{ letterSpacing: 1.5 }}>
        Resource Health
      </Typography>
      <Box display="flex" gap={2} mb={4} mt={0.5} flexWrap="wrap">
        <DonutCard title="Repositories" slices={slices(repos,      '/ocm/repositories')} total={repos.length} />
        <DonutCard title="Components"   slices={slices(components, '/ocm/components')}   total={components.length} />
        <DonutCard title="Resources"    slices={slices(resources,  '/ocm/resources')}    total={resources.length} />
        <DonutCard title="Deployers"    slices={slices(deployers,  '/ocm/deployers')}    total={deployers.length} />
      </Box>

      <Typography variant="overline" color="textSecondary" style={{ letterSpacing: 1.5 }}>
        Delivery Pipelines
      </Typography>
      <Box display="flex" flexDirection="column" gap={1.5} mt={0.5}>
        {repos.map((r: any) => (
          <PipelineRow
            key={`${r.metadata?.namespace}/${r.metadata?.name}`}
            repo={r}
            components={components}
            resources={resources}
            deployers={deployers}
          />
        ))}
      </Box>
    </Box>
  );
}
