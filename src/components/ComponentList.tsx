import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ComponentVersion } from '../common/Resources';
import { ocmColors } from '../common/colors';
import { clusterPrefix, conditionColor, conditionLabel, age } from '../helpers';

const { Typography, Box, CircularProgress, TextField, InputAdornment } =
  (window as any).pluginLib?.MuiCore ?? {};
const { SectionBox } = (window as any).pluginLib?.CommonComponents ?? {};

export default function ComponentList() {
  const history = useHistory();
  const [components, error] = ComponentVersion.useList();
  const [search, setSearch] = useState('');

  if (!components && !error) {
    return <Box p={3} display="flex" alignItems="center" gap={2}><CircularProgress size={20} /><Typography>Loading components…</Typography></Box>;
  }
  if (error) {
    return <Box p={3}><Typography color="error">Failed to load components: {String(error)}</Typography></Box>;
  }

  const lc = search.toLowerCase();
  const filtered = (components ?? []).filter((c: any) => {
    const name: string = c.metadata?.name ?? '';
    const comp: string = c.jsonData?.spec?.component ?? '';
    return !lc || name.toLowerCase().includes(lc) || comp.toLowerCase().includes(lc);
  });

  const base = clusterPrefix();

  return (
    <SectionBox
      title="Components"
      headerProps={{
        headerStyle: 'main',
        actions: [
          <TextField
            size="small"
            placeholder="Search name or component…"
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.45 }}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </InputAdornment>
              ),
            }}
            style={{ width: 240 }}
          />,
        ],
      }}
    >
      {filtered.length === 0 ? (
        <Typography color="textSecondary">{search ? 'No components match the search.' : 'No components found.'}</Typography>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' as const, background: '#fafafa' }}>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Namespace</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Component</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Semver</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Resolved</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Repository</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Age</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c: any) => {
              const name: string     = c.metadata?.name ?? '';
              const ns: string       = c.metadata?.namespace ?? 'default';
              const component: string = c.jsonData?.spec?.component ?? '—';
              const semver: string   = c.jsonData?.spec?.version?.semver ?? '—';
              const resolved: string = c.jsonData?.status?.reconciledVersion ?? '—';
              const repoRef: string  = c.jsonData?.spec?.repositoryRef?.name ?? '—';
              const conds: any[]     = c.jsonData?.status?.conditions ?? [];
              const color = conditionColor(conds);
              const label = conditionLabel(conds);
              return (
                <tr key={`${ns}/${name}`}
                  style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                  onClick={() => history.push(`${base}/ocm/components/${ns}/${name}`)}
                >
                  <td style={{ padding: '8px 12px', color: ocmColors.link, textDecoration: 'underline' }}>{name}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{ns}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{component}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{semver}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{resolved}</td>
                  <td style={{ padding: '8px 12px', color: ocmColors.link, textDecoration: 'underline', cursor: 'pointer', fontSize: 12 }}
                    onClick={(e: any) => { e.stopPropagation(); history.push(`${base}/ocm/repositories/${ns}/${repoRef}`); }}>
                    {repoRef}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: color, color: '#fff' }}>{label}</span>
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 12, color: '#666' }}>{age(c.metadata?.creationTimestamp)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </SectionBox>
  );
}
