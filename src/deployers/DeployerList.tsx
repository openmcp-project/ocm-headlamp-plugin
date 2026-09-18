import {
  ResourceListView,
  StatusLabel,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { Tooltip } from '@mui/material';
import { Deployer } from '../common/Resources';
import { MOCK_DEPLOYERS } from '../common/mockData';

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

export default function DeployerList() {
  const columns = [
    {
      label: 'Name',
      getValue: (d: any) => d.metadata?.name ?? '',
    },
    {
      label: 'Namespace',
      getValue: (d: any) => d.metadata?.namespace ?? '',
    },
    {
      label: 'Resource Ref',
      getValue: (d: any) => d.jsonData?.spec?.resourceRef?.name ?? '—',
    },
    {
      label: 'Target Namespace',
      getValue: (d: any) => d.jsonData?.spec?.targetNamespace ?? d.metadata?.namespace ?? '—',
      render: (d: any) => (
        <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {d.jsonData?.spec?.targetNamespace ?? d.metadata?.namespace ?? '—'}
        </span>
      ),
    },
    {
      label: 'Last Applied',
      getValue: (d: any) => d.jsonData?.status?.lastAppliedRevision ?? '—',
      render: (d: any) => (
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#666' }}>
          {d.jsonData?.status?.lastAppliedRevision ?? '—'}
        </span>
      ),
    },
    {
      label: 'Status',
      getValue: (d: any) => d.jsonData?.status?.conditions?.find((c: any) => c.type === 'Ready')?.status ?? '',
      render: (d: any) => <OCMStatusLabel item={d} />,
    },
  ];

  if (USE_MOCK) {
    return <ResourceListView title="Deployers" data={MOCK_DEPLOYERS as any} columns={columns as any} />;
  }
  return <ResourceListView title="Deployers" resourceClass={Deployer as any} columns={columns as any} />;
}
