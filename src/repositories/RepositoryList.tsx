import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Repository } from '../common/Resources';
import { ocmColors } from '../common/colors';
import { clusterPrefix, conditionColor, conditionLabel, age } from '../helpers';

const { Typography, Box, CircularProgress, TextField, InputAdornment, Chip } =
  (window as any).pluginLib?.MuiCore ?? {};
const { SectionBox } = (window as any).pluginLib?.CommonComponents ?? {};

export default function RepositoryList() {
  const history = useHistory();
  const [repos, error] = Repository.useList();
  const [search, setSearch] = useState('');

  if (!repos && !error) {
    return <Box p={3} display="flex" alignItems="center" gap={2}><CircularProgress size={20} /><Typography>Loading repositories…</Typography></Box>;
  }
  if (error) {
    return <Box p={3}><Typography color="error">Failed to load repositories: {String(error)}</Typography></Box>;
  }

  const lc = search.toLowerCase();
  const filtered = (repos ?? []).filter((r: any) => {
    const name: string = r.metadata?.name ?? '';
    const url: string  = r.jsonData?.spec?.url ?? '';
    return !lc || name.toLowerCase().includes(lc) || url.toLowerCase().includes(lc);
  });

  const base = clusterPrefix();

  return (
    <SectionBox
      title="Repositories"
      headerProps={{
        headerStyle: 'main',
        actions: [
          <TextField
            size="small"
            placeholder="Search name or URL…"
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
        <Typography color="textSecondary">{search ? 'No repositories match the search.' : 'No repositories found.'}</Typography>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' as const, background: '#fafafa' }}>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Name</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Namespace</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>URL</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Auth</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Age</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r: any) => {
              const name: string  = r.metadata?.name ?? '';
              const ns: string    = r.metadata?.namespace ?? 'default';
              const url: string   = r.jsonData?.spec?.url ?? '—';
              const secret: string = r.jsonData?.spec?.secretRef?.name ?? '';
              const conds: any[]  = r.jsonData?.status?.conditions ?? [];
              const color = conditionColor(conds);
              const label = conditionLabel(conds);
              return (
                <tr key={`${ns}/${name}`}
                  style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                  onClick={() => history.push(`${base}/ocm/repositories/${ns}/${name}`)}
                >
                  <td style={{ padding: '8px 12px', color: ocmColors.link, textDecoration: 'underline' }}>{name}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12 }}>{ns}</td>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', fontSize: 12, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{url}</td>
                  <td style={{ padding: '8px 12px' }}>
                    {secret
                      ? <Chip label={secret} size="small" style={{ fontFamily: 'monospace', fontSize: 11 }} />
                      : <span style={{ color: '#aaa', fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: color, color: '#fff' }}>{label}</span>
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 12, color: '#666' }}>{age(r.metadata?.creationTimestamp)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </SectionBox>
  );
}
