import {
  ResourceListView,
  StatusLabel,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { Tooltip } from '@mui/material';
import { ComponentVersion } from '../common/Resources';
import { MOCK_COMPONENTS } from '../common/mockData';

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

export default function ComponentList() {
  const columns = [
    {
      label: 'Name',
      getValue: (c: any) => c.metadata?.name ?? '',
    },
    {
      label: 'Namespace',
      getValue: (c: any) => c.metadata?.namespace ?? '',
    },
    {
      label: 'Component',
      getValue: (c: any) => c.jsonData?.spec?.component ?? '—',
      render: (c: any) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.jsonData?.spec?.component ?? '—'}</span>
      ),
    },
    {
      label: 'Semver',
      getValue: (c: any) => c.jsonData?.spec?.semver ?? c.jsonData?.spec?.version?.semver ?? '—',
      render: (c: any) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {c.jsonData?.spec?.semver ?? c.jsonData?.spec?.version?.semver ?? '—'}
        </span>
      ),
    },
    {
      label: 'Resolved',
      getValue: (c: any) => c.jsonData?.status?.reconciledVersion ?? '—',
      render: (c: any) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {c.jsonData?.status?.reconciledVersion ?? '—'}
        </span>
      ),
    },
    {
      label: 'Repository',
      getValue: (c: any) => c.jsonData?.spec?.repositoryRef?.name ?? '—',
    },
    {
      label: 'Status',
      getValue: (c: any) => c.jsonData?.status?.conditions?.find((cc: any) => cc.type === 'Ready')?.status ?? '',
      render: (c: any) => <OCMStatusLabel item={c} />,
    },
  ];

  if (USE_MOCK) {
    return <ResourceListView title="Components" data={MOCK_COMPONENTS as any} columns={columns as any} />;
  }
  return <ResourceListView title="Components" resourceClass={ComponentVersion as any} columns={columns as any} />;
}
