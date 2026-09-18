import {
  ConditionsTable,
  MainInfoSection,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { useParams } from 'react-router-dom';
import { Resource } from '../common/Resources';

export default function ResourceDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [resources] = Resource.useList();

  const resource = (resources ?? []).find(
    (r: any) => r.metadata?.name === name && r.metadata?.namespace === namespace
  );

  if (!resource) return null;

  const extraInfo = [
    { name: 'Resource Ref', value: resource.jsonData?.spec?.resourceRef?.name ?? resource.jsonData?.spec?.resource?.byReference?.resource?.name ?? '—' },
    { name: 'Type', value: resource.jsonData?.spec?.resourceRef?.type ?? '—', hide: !resource.jsonData?.spec?.resourceRef?.type },
    { name: 'Component Ref', value: resource.jsonData?.spec?.componentVersionRef?.name ?? resource.jsonData?.spec?.componentRef?.name ?? '—' },
    { name: 'Snapshot', value: resource.jsonData?.status?.snapshotName ?? '—' },
  ];

  return (
    <>
      <MainInfoSection resource={resource as any} extraInfo={extraInfo} />
      <SectionBox title="Conditions">
        <ConditionsTable resource={resource as any} />
      </SectionBox>
    </>
  );
}
