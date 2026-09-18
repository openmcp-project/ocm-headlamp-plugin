import {
  ConditionsTable,
  MainInfoSection,
  SectionBox,
} from '@kinvolk/headlamp-plugin/lib/components/common';
import { useParams } from 'react-router-dom';
import { Deployer } from '../common/Resources';

export default function DeployerDetail() {
  const { namespace, name } = useParams<{ namespace: string; name: string }>();
  const [deployers] = Deployer.useList();

  const deployer = (deployers ?? []).find(
    (d: any) => d.metadata?.name === name && d.metadata?.namespace === namespace
  );

  if (!deployer) return null;

  const extraInfo = [
    { name: 'Resource Ref', value: deployer.jsonData?.spec?.resourceRef?.name ?? '—' },
    { name: 'Target Namespace', value: deployer.jsonData?.spec?.targetNamespace ?? deployer.metadata?.namespace ?? '—' },
    { name: 'Last Applied Revision', value: deployer.jsonData?.status?.lastAppliedRevision ?? '—' },
  ];

  return (
    <>
      <MainInfoSection resource={deployer as any} extraInfo={extraInfo} />
      <SectionBox title="Conditions">
        <ConditionsTable resource={deployer as any} />
      </SectionBox>
    </>
  );
}
