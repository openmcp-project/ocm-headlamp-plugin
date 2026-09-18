import {
  ResourceListView,
  StatusLabel,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { Chip, Tooltip } from '@mui/material';
import { Resource } from '../common/Resources';
import { MOCK_RESOURCES } from '../common/mockData';

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

export default function ResourceList() {
  const columns = [
    {
      label: 'Name',
      getValue: (r: any) => r.metadata?.name ?? '',
    },
    {
      label: 'Namespace',
      getValue: (r: any) => r.metadata?.namespace ?? '',
    },
    {
      label: 'Resource Ref',
      getValue: (r: any) => r.jsonData?.spec?.resourceRef?.name ?? r.jsonData?.spec?.resource?.byReference?.resource?.name ?? '—',
      render: (r: any) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {r.jsonData?.spec?.resourceRef?.name ?? r.jsonData?.spec?.resource?.byReference?.resource?.name ?? '—'}
        </span>
      ),
    },
    {
      label: 'Type',
      getValue: (r: any) => r.jsonData?.spec?.resourceRef?.type ?? '—',
      render: (r: any) => {
        const t = r.jsonData?.spec?.resourceRef?.type ?? '';
        return t ? <Chip label={t} size="small" style={{ background: '#1565c0', color: '#fff', fontWeight: 600, fontSize: 11 }} /> : <span style={{ color: '#aaa' }}>—</span>;
      },
    },
    {
      label: 'Component',
      getValue: (r: any) => r.jsonData?.spec?.componentVersionRef?.name ?? r.jsonData?.spec?.componentRef?.name ?? '—',
    },
    {
      label: 'Snapshot',
      getValue: (r: any) => r.jsonData?.status?.snapshotName ?? '—',
      render: (r: any) => (
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#666' }}>
          {r.jsonData?.status?.snapshotName ?? '—'}
        </span>
      ),
    },
    {
      label: 'Status',
      getValue: (r: any) => r.jsonData?.status?.conditions?.find((c: any) => c.type === 'Ready')?.status ?? '',
      render: (r: any) => <OCMStatusLabel item={r} />,
    },
  ];

  if (USE_MOCK) {
    return <ResourceListView title="Resources" data={MOCK_RESOURCES as any} columns={columns as any} />;
  }
  return <ResourceListView title="Resources" resourceClass={Resource as any} columns={columns as any} />;
}
