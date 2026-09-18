import {
  ConditionsTable,
  MainInfoSection,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { useParams } from 'react-router-dom';
import { ComponentVersion } from '../common/Resources';

export default function ComponentDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [components] = ComponentVersion.useList();

  const component = (components ?? []).find(
    (c: any) => c.metadata?.name === name && c.metadata?.namespace === namespace
  );

  if (!component) return null;

  const extraInfo = [
    { name: 'Component', value: component.jsonData?.spec?.component ?? '—' },
    { name: 'Semver', value: component.jsonData?.spec?.semver ?? component.jsonData?.spec?.version?.semver ?? '—' },
    { name: 'Resolved Version', value: component.jsonData?.status?.reconciledVersion ?? '—' },
    { name: 'Repository', value: component.jsonData?.spec?.repositoryRef?.name ?? '—' },
    { name: 'Interval', value: component.jsonData?.spec?.interval ?? '—' },
  ];

  return (
    <>
      <MainInfoSection resource={component as any} extraInfo={extraInfo} />
      <SectionBox title="Conditions">
        <ConditionsTable resource={component as any} />
      </SectionBox>
    </>
  );
}
