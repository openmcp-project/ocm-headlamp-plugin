import {
  ResourceListView,
  StatusLabel,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { Tooltip } from '@mui/material';
import { Repository } from '../common/Resources';
import { MOCK_REPOS } from '../common/mockData';

const USE_MOCK = false;

function OCMStatusLabel({ item }: { item: any }) {
  const ready = item?.jsonData?.status?.conditions?.find((c: any) => c.type === 'Ready');
  if (!ready) return <StatusLabel status="warning">Unknown</StatusLabel>;
  if (ready.status === 'True')
    return <StatusLabel status="success"><Tooltip title={ready.message ?? ''}><span>Ready</span></Tooltip></StatusLabel>;
  if (ready.status === 'False')
    return <StatusLabel status="error"><Tooltip title={ready.message ?? ''}><span>Not Ready</span></Tooltip></StatusLabel>;
  return <StatusLabel status="warning"><Tooltip title={ready.message ?? ''}><span>Unknown</span></Tooltip></StatusLabel>;
}

export default function RepositoryList() {
  const columns = [
    {
      label: 'Name',
      getValue: (r: any) => r.metadata?.name ?? '',
      render: (r: any) => r.metadata?.name ?? '',
    },
    {
      label: 'Namespace',
      getValue: (r: any) => r.metadata?.namespace ?? '',
    },
    {
      label: 'URL',
      getValue: (r: any) => r.jsonData?.spec?.repositorySpec?.baseUrl ?? r.jsonData?.spec?.url ?? '—',
      render: (r: any) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {r.jsonData?.spec?.repositorySpec?.baseUrl ?? r.jsonData?.spec?.url ?? '—'}
        </span>
      ),
    },
    {
      label: 'Auth',
      getValue: (r: any) => r.jsonData?.spec?.secretRef?.name ?? '',
      render: (r: any) => {
        const s = r.jsonData?.spec?.secretRef?.name ?? '';
        return s ? <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{s}</span> : <span style={{ color: '#aaa' }}>—</span>;
      },
    },
    {
      label: 'Status',
      getValue: (r: any) => r.jsonData?.status?.conditions?.find((c: any) => c.type === 'Ready')?.status ?? '',
      render: (r: any) => <OCMStatusLabel item={r} />,
    },
  ];

  if (USE_MOCK) {
    return <ResourceListView title="Repositories" data={MOCK_REPOS as any} columns={columns as any} />;
  }
  return <ResourceListView title="Repositories" resourceClass={Repository as any} columns={columns as any} />;
}
