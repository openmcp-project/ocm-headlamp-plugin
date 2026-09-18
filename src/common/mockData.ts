const NOW = '2026-09-17T13:00:00Z';
const d = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

function item(kind: string, name: string, ns: string, spec: any, status: any) {
  return {
    metadata: { name, namespace: ns, creationTimestamp: d(Math.ceil(Math.random() * 30 + 1)) },
    jsonData: { metadata: { name, namespace: ns, creationTimestamp: NOW }, spec, status },
  };
}

function ready(message = 'Reconciled successfully') {
  return { conditions: [{ type: 'Ready', status: 'True', reason: 'Succeeded', message }] };
}
function notReady(message = 'Reconciliation failed') {
  return { conditions: [{ type: 'Ready', status: 'False', reason: 'Failed', message }] };
}
function unknown(message = 'Waiting for reconciliation') {
  return { conditions: [{ type: 'Ready', status: 'Unknown', reason: 'Progressing', message }] };
}

export const MOCK_REPOS = [
  item('Repository', 'ocm-demo-registry',  'default', { url: 'ghcr.io/open-component-model/demo',         secretRef: { name: 'ocm-registry-secret' } }, ready('Repository is ready')),
  item('Repository', 'internal-registry',   'default', { url: 'registry.internal.sap.com/ocm',             secretRef: { name: 'internal-secret' }      }, notReady('Failed to authenticate to registry')),
  item('Repository', 'staging-registry',    'default', { url: 'ghcr.io/openmcp-project/staging',           secretRef: { name: '' }                     }, ready('Repository is ready')),
];

export const MOCK_COMPONENTS = [
  item('ComponentVersion', 'crossplane-provider', 'default',
    { component: 'github.com/openmcp-project/crossplane-provider-btp', version: { semver: '>=1.0.0' }, repositoryRef: { name: 'ocm-demo-registry' } },
    { reconciledVersion: '1.2.3', ...ready('Component version reconciled') }),
  item('ComponentVersion', 'headlamp-plugin', 'default',
    { component: 'github.com/openmcp-project/opencontrolplane-headlamp-plugin', version: { semver: '>=0.0.1' }, repositoryRef: { name: 'ocm-demo-registry' } },
    { reconciledVersion: '0.0.5', ...ready('Component version reconciled') }),
  item('ComponentVersion', 'flux-operator', 'default',
    { component: 'github.com/fluxcd/flux-operator', version: { semver: '>=2.0.0' }, repositoryRef: { name: 'staging-registry' } },
    { reconciledVersion: '2.1.0', ...unknown('Waiting for source') }),
  item('ComponentVersion', 'cert-manager', 'default',
    { component: 'github.com/cert-manager/cert-manager', version: { semver: '>=1.14.0' }, repositoryRef: { name: 'ocm-demo-registry' } },
    { reconciledVersion: '1.14.5', ...ready('Component version reconciled') }),
  item('ComponentVersion', 'external-secrets', 'production',
    { component: 'github.com/external-secrets/external-secrets', version: { semver: '>=0.9.0' }, repositoryRef: { name: 'internal-registry' } },
    { reconciledVersion: '', ...notReady('Repository not ready') }),
];

export const MOCK_RESOURCES = [
  item('Resource', 'provider-chart', 'default',
    { resourceRef: { name: 'chart', version: '1.2.3', type: 'helmChart' }, componentVersionRef: { name: 'crossplane-provider' } },
    { snapshotName: 'provider-chart-v1.2.3', ...ready('Resource snapshot created') }),
  item('Resource', 'provider-image', 'default',
    { resourceRef: { name: 'manager', version: '1.2.3', type: 'ociImage' }, componentVersionRef: { name: 'crossplane-provider' } },
    { snapshotName: 'provider-image-v1.2.3', ...ready('Resource snapshot created') }),
  item('Resource', 'plugin-bundle', 'default',
    { resourceRef: { name: 'plugin-js', version: '0.0.5', type: 'blob' }, componentVersionRef: { name: 'headlamp-plugin' } },
    { snapshotName: '', ...notReady('Failed to create snapshot') }),
  item('Resource', 'flux-manifests', 'default',
    { resourceRef: { name: 'manifests', version: '2.1.0', type: 'kustomize' }, componentVersionRef: { name: 'flux-operator' } },
    { snapshotName: '', ...unknown('Waiting for component') }),
  item('Resource', 'cert-manager-chart', 'default',
    { resourceRef: { name: 'chart', version: '1.14.5', type: 'helmChart' }, componentVersionRef: { name: 'cert-manager' } },
    { snapshotName: 'cert-manager-chart-v1.14.5', ...ready('Resource snapshot created') }),
];

export const MOCK_DEPLOYERS = [
  item('Deployer', 'crossplane-provider-deployer', 'default',
    { resourceRef: { name: 'provider-chart' }, targetNamespace: 'crossplane-system' },
    { lastAppliedRevision: '1.2.3', ...ready('Helm release applied successfully') }),
  item('Deployer', 'provider-image-deployer', 'default',
    { resourceRef: { name: 'provider-image' }, targetNamespace: 'crossplane-system' },
    { lastAppliedRevision: '', ...notReady('Failed to apply manifest: ImagePullBackOff') }),
  item('Deployer', 'cert-manager-deployer', 'default',
    { resourceRef: { name: 'cert-manager-chart' }, targetNamespace: 'cert-manager' },
    { lastAppliedRevision: '1.14.5', ...ready('Helm release applied successfully') }),
  item('Deployer', 'flux-deployer', 'default',
    { resourceRef: { name: 'flux-manifests' }, targetNamespace: 'flux-system' },
    { lastAppliedRevision: '', ...unknown('Waiting for resource snapshot') }),
];
