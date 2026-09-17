#!/usr/bin/env node
/**
 * Mock Kubernetes API server for local OCM plugin development.
 *
 * Usage:
 *   node mock-cluster/server.mjs
 *
 * Add to kubeconfig (run once):
 *   node mock-cluster/server.mjs --print-kubeconfig >> ~/.kube/config
 *
 * Then in Headlamp: switch to the "ocm-mock" cluster.
 */

import http from 'http';
import { URL } from 'url';

const PORT = 9648;

if (process.argv.includes('--print-kubeconfig')) {
  console.log(`
- cluster:
    server: http://localhost:${PORT}
    insecure-skip-tls-verify: true
  name: ocm-mock`);
  console.log(`contexts:
- context:
    cluster: ocm-mock
    user: ocm-mock-user
  name: ocm-mock
users:
- name: ocm-mock-user
  user: {}
`);
  process.exit(0);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const API = 'delivery.ocm.software/v1alpha1';

function makeConditions(state) {
  const now = '2025-01-15T10:00:00Z';
  if (state === 'ready') return [
    { type: 'Ready', status: 'True', reason: 'Succeeded', lastTransitionTime: now },
  ];
  if (state === 'degraded') return [
    { type: 'Ready', status: 'False', reason: 'ReconciliationFailed', message: 'failed to fetch component: connection timeout', lastTransitionTime: now },
  ];
  return [];
}

// ── Repositories ──────────────────────────────────────────────────────────────

const REPOSITORIES = [
  {
    apiVersion: API, kind: 'Repository',
    metadata: { name: 'prod-registry',    namespace: 'ocm-system', uid: 'repo-001', creationTimestamp: '2025-01-01T00:00:00Z', resourceVersion: '1' },
    spec: { url: 'oci://registry.example.com/prod', secretRef: { name: 'prod-registry-creds' } },
    status: { conditions: makeConditions('ready') },
    jsonData: {
      spec:   { url: 'oci://registry.example.com/prod', secretRef: { name: 'prod-registry-creds' } },
      status: { conditions: makeConditions('ready') },
    },
  },
  {
    apiVersion: API, kind: 'Repository',
    metadata: { name: 'staging-registry', namespace: 'ocm-system', uid: 'repo-002', creationTimestamp: '2025-01-05T00:00:00Z', resourceVersion: '2' },
    spec: { url: 'oci://registry.example.com/staging', secretRef: { name: 'staging-registry-creds' } },
    status: { conditions: makeConditions('ready') },
    jsonData: {
      spec:   { url: 'oci://registry.example.com/staging' },
      status: { conditions: makeConditions('ready') },
    },
  },
  {
    apiVersion: API, kind: 'Repository',
    metadata: { name: 'dev-registry',     namespace: 'dev',        uid: 'repo-003', creationTimestamp: '2025-02-01T00:00:00Z', resourceVersion: '3' },
    spec: { url: 'oci://dev.registry.internal/components' },
    status: { conditions: makeConditions('degraded') },
    jsonData: {
      spec:   { url: 'oci://dev.registry.internal/components' },
      status: { conditions: makeConditions('degraded') },
    },
  },
];

// ── ComponentVersions ─────────────────────────────────────────────────────────

const COMPONENTS = [
  // prod-registry components
  {
    apiVersion: API, kind: 'ComponentVersion',
    metadata: { name: 'payment-service', namespace: 'ocm-system', uid: 'cv-001', creationTimestamp: '2025-01-10T00:00:00Z', resourceVersion: '10' },
    spec: { component: 'github.com/myorg/payment-service', version: { semver: '>=1.2.0' }, repositoryRef: { name: 'prod-registry' } },
    status: { reconciledVersion: '1.3.2', observedGeneration: 3, conditions: makeConditions('ready') },
    jsonData: {
      spec:   { component: 'github.com/myorg/payment-service', version: { semver: '>=1.2.0' }, repositoryRef: { name: 'prod-registry' } },
      status: { reconciledVersion: '1.3.2', observedGeneration: 3, conditions: makeConditions('ready') },
    },
  },
  {
    apiVersion: API, kind: 'ComponentVersion',
    metadata: { name: 'frontend-app', namespace: 'ocm-system', uid: 'cv-002', creationTimestamp: '2025-01-12T00:00:00Z', resourceVersion: '11' },
    spec: { component: 'github.com/myorg/frontend', version: { semver: '>=2.0.0' }, repositoryRef: { name: 'prod-registry' } },
    status: { reconciledVersion: '2.1.0', observedGeneration: 1, conditions: makeConditions('ready') },
    jsonData: {
      spec:   { component: 'github.com/myorg/frontend', version: { semver: '>=2.0.0' }, repositoryRef: { name: 'prod-registry' } },
      status: { reconciledVersion: '2.1.0', observedGeneration: 1, conditions: makeConditions('ready') },
    },
  },
  {
    apiVersion: API, kind: 'ComponentVersion',
    metadata: { name: 'data-pipeline', namespace: 'ocm-system', uid: 'cv-003', creationTimestamp: '2025-01-20T00:00:00Z', resourceVersion: '12' },
    spec: { component: 'github.com/myorg/data-pipeline', version: { semver: '>=0.5.0' }, repositoryRef: { name: 'prod-registry' } },
    status: { reconciledVersion: '0.6.1', observedGeneration: 2, conditions: makeConditions('ready') },
    jsonData: {
      spec:   { component: 'github.com/myorg/data-pipeline', version: { semver: '>=0.5.0' }, repositoryRef: { name: 'prod-registry' } },
      status: { reconciledVersion: '0.6.1', observedGeneration: 2, conditions: makeConditions('ready') },
    },
  },
  // staging-registry components
  {
    apiVersion: API, kind: 'ComponentVersion',
    metadata: { name: 'payment-service-staging', namespace: 'ocm-system', uid: 'cv-004', creationTimestamp: '2025-02-01T00:00:00Z', resourceVersion: '13' },
    spec: { component: 'github.com/myorg/payment-service', version: { semver: '>=1.4.0-rc' }, repositoryRef: { name: 'staging-registry' } },
    status: { reconciledVersion: '1.4.0-rc.3', observedGeneration: 5, conditions: makeConditions('ready') },
    jsonData: {
      spec:   { component: 'github.com/myorg/payment-service', version: { semver: '>=1.4.0-rc' }, repositoryRef: { name: 'staging-registry' } },
      status: { reconciledVersion: '1.4.0-rc.3', observedGeneration: 5, conditions: makeConditions('ready') },
    },
  },
  // dev-registry (degraded upstream)
  {
    apiVersion: API, kind: 'ComponentVersion',
    metadata: { name: 'experimental-feature', namespace: 'dev', uid: 'cv-005', creationTimestamp: '2025-03-01T00:00:00Z', resourceVersion: '14' },
    spec: { component: 'github.com/myorg/experimental', version: { semver: '>=0.1.0' }, repositoryRef: { name: 'dev-registry' } },
    status: { conditions: makeConditions('degraded') },
    jsonData: {
      spec:   { component: 'github.com/myorg/experimental', version: { semver: '>=0.1.0' }, repositoryRef: { name: 'dev-registry' } },
      status: { conditions: makeConditions('degraded') },
    },
  },
];

// ── Resources ─────────────────────────────────────────────────────────────────

const RESOURCES = [
  // payment-service resources
  {
    apiVersion: API, kind: 'Resource',
    metadata: { name: 'payment-service-helm', namespace: 'ocm-system', uid: 'res-001', creationTimestamp: '2025-01-10T06:00:00Z', resourceVersion: '20' },
    spec: { resourceRef: { name: 'helm-chart', type: 'helmChart' }, componentVersionRef: { name: 'payment-service' } },
    status: { snapshotName: 'payment-service-helm-abc123', digest: 'sha256:aabbcc', conditions: makeConditions('ready') },
    jsonData: {
      spec:   { resourceRef: { name: 'helm-chart', type: 'helmChart' }, componentVersionRef: { name: 'payment-service' } },
      status: { snapshotName: 'payment-service-helm-abc123', digest: 'sha256:aabbcc', conditions: makeConditions('ready') },
    },
  },
  {
    apiVersion: API, kind: 'Resource',
    metadata: { name: 'payment-service-config', namespace: 'ocm-system', uid: 'res-002', creationTimestamp: '2025-01-10T06:05:00Z', resourceVersion: '21' },
    spec: { resourceRef: { name: 'config', type: 'configmap' }, componentVersionRef: { name: 'payment-service' } },
    status: { snapshotName: 'payment-service-config-def456', digest: 'sha256:ddeeff', conditions: makeConditions('ready') },
    jsonData: {
      spec:   { resourceRef: { name: 'config', type: 'configmap' }, componentVersionRef: { name: 'payment-service' } },
      status: { snapshotName: 'payment-service-config-def456', digest: 'sha256:ddeeff', conditions: makeConditions('ready') },
    },
  },
  // frontend resources
  {
    apiVersion: API, kind: 'Resource',
    metadata: { name: 'frontend-helm', namespace: 'ocm-system', uid: 'res-003', creationTimestamp: '2025-01-12T06:00:00Z', resourceVersion: '22' },
    spec: { resourceRef: { name: 'helm-chart', type: 'helmChart' }, componentVersionRef: { name: 'frontend-app' } },
    status: { snapshotName: 'frontend-helm-ghi789', digest: 'sha256:112233', conditions: makeConditions('ready') },
    jsonData: {
      spec:   { resourceRef: { name: 'helm-chart', type: 'helmChart' }, componentVersionRef: { name: 'frontend-app' } },
      status: { snapshotName: 'frontend-helm-ghi789', digest: 'sha256:112233', conditions: makeConditions('ready') },
    },
  },
  // data-pipeline
  {
    apiVersion: API, kind: 'Resource',
    metadata: { name: 'pipeline-kustomize', namespace: 'ocm-system', uid: 'res-004', creationTimestamp: '2025-01-20T06:00:00Z', resourceVersion: '23' },
    spec: { resourceRef: { name: 'kustomize', type: 'kustomization' }, componentVersionRef: { name: 'data-pipeline' } },
    status: { snapshotName: 'pipeline-kustomize-jkl012', digest: 'sha256:445566', conditions: makeConditions('ready') },
    jsonData: {
      spec:   { resourceRef: { name: 'kustomize', type: 'kustomization' }, componentVersionRef: { name: 'data-pipeline' } },
      status: { snapshotName: 'pipeline-kustomize-jkl012', digest: 'sha256:445566', conditions: makeConditions('ready') },
    },
  },
  // staging resource (degraded)
  {
    apiVersion: API, kind: 'Resource',
    metadata: { name: 'payment-staging-helm', namespace: 'ocm-system', uid: 'res-005', creationTimestamp: '2025-02-01T06:00:00Z', resourceVersion: '24' },
    spec: { resourceRef: { name: 'helm-chart', type: 'helmChart' }, componentVersionRef: { name: 'payment-service-staging' } },
    status: { conditions: makeConditions('degraded') },
    jsonData: {
      spec:   { resourceRef: { name: 'helm-chart', type: 'helmChart' }, componentVersionRef: { name: 'payment-service-staging' } },
      status: { conditions: makeConditions('degraded') },
    },
  },
];

// ── Deployers ─────────────────────────────────────────────────────────────────

const DEPLOYERS = [
  {
    apiVersion: API, kind: 'Deployer',
    metadata: { name: 'payment-service-deployer', namespace: 'ocm-system', uid: 'dep-001', creationTimestamp: '2025-01-10T08:00:00Z', resourceVersion: '30' },
    spec: { resourceRef: { name: 'payment-service-helm' }, targetNamespace: 'payment', interval: '5m', prune: true },
    status: { lastAppliedRevision: '1.3.2', observedGeneration: 3, conditions: makeConditions('ready') },
    jsonData: {
      spec:   { resourceRef: { name: 'payment-service-helm' }, targetNamespace: 'payment', interval: '5m', prune: true },
      status: { lastAppliedRevision: '1.3.2', observedGeneration: 3, conditions: makeConditions('ready') },
    },
  },
  {
    apiVersion: API, kind: 'Deployer',
    metadata: { name: 'payment-config-deployer', namespace: 'ocm-system', uid: 'dep-002', creationTimestamp: '2025-01-10T08:05:00Z', resourceVersion: '31' },
    spec: { resourceRef: { name: 'payment-service-config' }, targetNamespace: 'payment', interval: '10m', prune: false },
    status: { lastAppliedRevision: '1.3.2', observedGeneration: 2, conditions: makeConditions('ready') },
    jsonData: {
      spec:   { resourceRef: { name: 'payment-service-config' }, targetNamespace: 'payment', interval: '10m', prune: false },
      status: { lastAppliedRevision: '1.3.2', observedGeneration: 2, conditions: makeConditions('ready') },
    },
  },
  {
    apiVersion: API, kind: 'Deployer',
    metadata: { name: 'frontend-deployer', namespace: 'ocm-system', uid: 'dep-003', creationTimestamp: '2025-01-12T08:00:00Z', resourceVersion: '32' },
    spec: { resourceRef: { name: 'frontend-helm' }, targetNamespace: 'frontend', interval: '5m', prune: true },
    status: { lastAppliedRevision: '2.1.0', observedGeneration: 1, conditions: makeConditions('ready') },
    jsonData: {
      spec:   { resourceRef: { name: 'frontend-helm' }, targetNamespace: 'frontend', interval: '5m', prune: true },
      status: { lastAppliedRevision: '2.1.0', observedGeneration: 1, conditions: makeConditions('ready') },
    },
  },
  {
    apiVersion: API, kind: 'Deployer',
    metadata: { name: 'pipeline-deployer', namespace: 'ocm-system', uid: 'dep-004', creationTimestamp: '2025-01-20T08:00:00Z', resourceVersion: '33' },
    spec: { resourceRef: { name: 'pipeline-kustomize' }, targetNamespace: 'data', interval: '15m', prune: true },
    status: { lastAppliedRevision: '0.6.1', observedGeneration: 2, conditions: makeConditions('ready') },
    jsonData: {
      spec:   { resourceRef: { name: 'pipeline-kustomize' }, targetNamespace: 'data', interval: '15m', prune: true },
      status: { lastAppliedRevision: '0.6.1', observedGeneration: 2, conditions: makeConditions('ready') },
    },
  },
  {
    apiVersion: API, kind: 'Deployer',
    metadata: { name: 'payment-staging-deployer', namespace: 'ocm-system', uid: 'dep-005', creationTimestamp: '2025-02-01T08:00:00Z', resourceVersion: '34' },
    spec: { resourceRef: { name: 'payment-staging-helm' }, targetNamespace: 'payment-staging', interval: '2m', prune: true },
    status: { conditions: makeConditions('degraded') },
    jsonData: {
      spec:   { resourceRef: { name: 'payment-staging-helm' }, targetNamespace: 'payment-staging', interval: '2m', prune: true },
      status: { conditions: makeConditions('degraded') },
    },
  },
];

// ── Index maps ────────────────────────────────────────────────────────────────

const repoByName       = new Map(REPOSITORIES.map(r => [r.metadata.name, r]));
const componentByName  = new Map(COMPONENTS.map(c => [c.metadata.name, c]));
const resourceByName   = new Map(RESOURCES.map(r => [r.metadata.name, r]));
const deployerByName   = new Map(DEPLOYERS.map(d => [d.metadata.name, d]));

console.log(`✓ OCM mock cluster ready`);
console.log(`  ${REPOSITORIES.length} repositories, ${COMPONENTS.length} components, ${RESOURCES.length} resources, ${DEPLOYERS.length} deployers`);

// ── HTTP helpers ──────────────────────────────────────────────────────────────

function list(kind, apiVersion, items) {
  return { kind: `${kind}List`, apiVersion, metadata: { resourceVersion: '999' }, items };
}

function notFound(res, path) {
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ kind: 'Status', apiVersion: 'v1', status: 'Failure', message: `${path} not found`, reason: 'NotFound', code: 404 }));
}

function ok(res, body) {
  const payload = JSON.stringify(body);
  res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) });
  res.end(payload);
}

function handleWatch(res) {
  res.writeHead(200, { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' });
  const iv = setInterval(() => {
    try {
      res.write(JSON.stringify({ type: 'BOOKMARK', object: { kind: 'Status', metadata: { resourceVersion: '999' } } }) + '\n');
    } catch { clearInterval(iv); }
  }, 15000);
  res.on('close', () => clearInterval(iv));
}

// ── Router ────────────────────────────────────────────────────────────────────

function route(req, res) {
  const u = new URL(req.url, `http://localhost:${PORT}`);
  const path = u.pathname;
  const isWatch = u.searchParams.get('watch') === 'true' || u.searchParams.get('watch') === '1';
  const method = req.method;

  // Log every request so we can see what Headlamp is asking for
  const auth = req.headers['authorization'];
  const authTag = auth ? (auth.startsWith('Bearer ') ? `[token:${auth.slice(7, 17)}…]` : '[auth]') : '[NO-AUTH]';
  if (!isWatch) console.log(`${method} ${path} ${authTag}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (isWatch) { handleWatch(res); return; }

  // ── k8s discovery ──────────────────────────────────────────────────────────
  if (path === '/version') return ok(res, { gitVersion: 'v1.29.0', major: '1', minor: '29' });
  if (path === '/healthz' || path === '/livez' || path === '/readyz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end('ok'); return;
  }
  if (path === '/api') return ok(res, { kind: 'APIVersions', versions: ['v1'], serverAddressByClientCIDRs: [] });
  if (path === '/api/v1') return ok(res, { kind: 'APIResourceList', groupVersion: 'v1', resources: [
    { name: 'namespaces', singularName: '', namespaced: false, kind: 'Namespace', verbs: ['list', 'get', 'watch'] },
    { name: 'events',     singularName: '', namespaced: true,  kind: 'Event',     verbs: ['list', 'get', 'watch'] },
  ]});
  if (path === '/api/v1/namespaces') return ok(res, list('Namespace', 'v1', [
    { apiVersion: 'v1', kind: 'Namespace', metadata: { name: 'ocm-system',       uid: 'ns-1', creationTimestamp: '2025-01-01T00:00:00Z', resourceVersion: '1' }, status: { phase: 'Active' } },
    { apiVersion: 'v1', kind: 'Namespace', metadata: { name: 'payment',          uid: 'ns-2', creationTimestamp: '2025-01-01T00:00:00Z', resourceVersion: '2' }, status: { phase: 'Active' } },
    { apiVersion: 'v1', kind: 'Namespace', metadata: { name: 'frontend',         uid: 'ns-3', creationTimestamp: '2025-01-01T00:00:00Z', resourceVersion: '3' }, status: { phase: 'Active' } },
    { apiVersion: 'v1', kind: 'Namespace', metadata: { name: 'data',             uid: 'ns-4', creationTimestamp: '2025-01-01T00:00:00Z', resourceVersion: '4' }, status: { phase: 'Active' } },
    { apiVersion: 'v1', kind: 'Namespace', metadata: { name: 'dev',              uid: 'ns-5', creationTimestamp: '2025-01-01T00:00:00Z', resourceVersion: '5' }, status: { phase: 'Active' } },
    { apiVersion: 'v1', kind: 'Namespace', metadata: { name: 'payment-staging',  uid: 'ns-6', creationTimestamp: '2025-01-01T00:00:00Z', resourceVersion: '6' }, status: { phase: 'Active' } },
  ]));

  if (path === '/apis') return ok(res, { kind: 'APIGroupList', apiVersion: 'v1', groups: [
    { name: 'delivery.ocm.software', versions: [{ groupVersion: 'delivery.ocm.software/v1alpha1', version: 'v1alpha1' }], preferredVersion: { groupVersion: 'delivery.ocm.software/v1alpha1', version: 'v1alpha1' } },
    { name: 'apiextensions.k8s.io', versions: [{ groupVersion: 'apiextensions.k8s.io/v1', version: 'v1' }], preferredVersion: { groupVersion: 'apiextensions.k8s.io/v1', version: 'v1' } },
    { name: 'authorization.k8s.io', versions: [{ groupVersion: 'authorization.k8s.io/v1', version: 'v1' }], preferredVersion: { groupVersion: 'authorization.k8s.io/v1', version: 'v1' } },
    { name: 'authentication.k8s.io', versions: [{ groupVersion: 'authentication.k8s.io/v1', version: 'v1' }], preferredVersion: { groupVersion: 'authentication.k8s.io/v1', version: 'v1' } },
  ]});

  if (path === '/apis/authorization.k8s.io/v1') return ok(res, { kind: 'APIResourceList', groupVersion: 'authorization.k8s.io/v1', resources: [
    { name: 'selfsubjectaccessreviews', singularName: '', namespaced: false, kind: 'SelfSubjectAccessReview', verbs: ['create'] },
    { name: 'selfsubjectrulesreviews',  singularName: '', namespaced: false, kind: 'SelfSubjectRulesReview',  verbs: ['create'] },
    { name: 'subjectaccessreviews',     singularName: '', namespaced: false, kind: 'SubjectAccessReview',     verbs: ['create'] },
  ]});

  if (path === '/apis/authentication.k8s.io/v1') return ok(res, { kind: 'APIResourceList', groupVersion: 'authentication.k8s.io/v1', resources: [
    { name: 'tokenreviews',       singularName: '', namespaced: false, kind: 'TokenReview',       verbs: ['create'] },
    { name: 'selfsubjectreviews', singularName: '', namespaced: false, kind: 'SelfSubjectReview', verbs: ['create'] },
  ]});

  if (path === '/apis/authentication.k8s.io/v1/tokenreviews' && method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => ok(res, { apiVersion: 'authentication.k8s.io/v1', kind: 'TokenReview', status: { authenticated: true, user: { username: 'mock-user', uid: 'mock-uid', groups: ['system:masters'] } } }));
    return;
  }

  if (path === '/apis/delivery.ocm.software/v1alpha1') return ok(res, { kind: 'APIResourceList', groupVersion: 'delivery.ocm.software/v1alpha1', resources: [
    { name: 'repositories',     singularName: 'repository',     namespaced: true, kind: 'Repository',     verbs: ['list', 'get', 'watch'] },
    { name: 'componentversions',singularName: 'componentversion',namespaced: true, kind: 'ComponentVersion',verbs: ['list', 'get', 'watch'] },
    { name: 'resources',        singularName: 'resource',        namespaced: true, kind: 'Resource',        verbs: ['list', 'get', 'watch'] },
    { name: 'deployers',        singularName: 'deployer',        namespaced: true, kind: 'Deployer',        verbs: ['list', 'get', 'watch'] },
  ]});

  // ── RBAC ──────────────────────────────────────────────────────────────────
  if (path === '/apis/authorization.k8s.io/v1/selfsubjectaccessreviews' && method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => ok(res, { apiVersion: 'authorization.k8s.io/v1', kind: 'SelfSubjectAccessReview', status: { allowed: true } }));
    return;
  }
  if (path === '/apis/authorization.k8s.io/v1/selfsubjectrulesreviews' && method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => ok(res, { apiVersion: 'authorization.k8s.io/v1', kind: 'SelfSubjectRulesReview', status: { resourceRules: [{ verbs: ['*'], apiGroups: ['*'], resources: ['*'] }], nonResourceRules: [{ verbs: ['*'], nonResourceURLs: ['*'] }], incomplete: false } }));
    return;
  }
  if (path === '/apis/authentication.k8s.io/v1/selfsubjectreviews' && method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => ok(res, { apiVersion: 'authentication.k8s.io/v1', kind: 'SelfSubjectReview', status: { userInfo: { username: 'mock-user', uid: 'mock-uid', groups: ['system:masters'] } } }));
    return;
  }

  // ── CRD list (minimal — keeps Headlamp happy) ─────────────────────────────
  if (path === '/apis/apiextensions.k8s.io/v1/customresourcedefinitions') {
    const crds = [
      'repositories.delivery.ocm.software',
      'componentversions.delivery.ocm.software',
      'resources.delivery.ocm.software',
      'deployers.delivery.ocm.software',
    ].map((name, i) => {
      const [plural, ...groupParts] = name.split('.');
      const group = groupParts.join('.');
      const kindMap = { repositories: 'Repository', componentversions: 'ComponentVersion', resources: 'Resource', deployers: 'Deployer' };
      return {
        apiVersion: 'apiextensions.k8s.io/v1', kind: 'CustomResourceDefinition',
        metadata: { name, uid: `crd-${i}`, creationTimestamp: '2025-01-01T00:00:00Z', resourceVersion: '100' },
        spec: { group, scope: 'Namespaced', names: { kind: kindMap[plural] ?? plural, plural, singular: plural.replace(/s$/, '') }, versions: [{ name: 'v1alpha1', served: true, storage: true }] },
        status: { conditions: [{ type: 'Established', status: 'True' }] },
      };
    });
    return ok(res, list('CustomResourceDefinition', 'apiextensions.k8s.io/v1', crds));
  }
  // v1beta1 CRDs — Headlamp probes this too; return empty list
  if (path === '/apis/apiextensions.k8s.io/v1beta1/customresourcedefinitions')
    return ok(res, list('CustomResourceDefinition', 'apiextensions.k8s.io/v1beta1', []));

  // Events — return empty list (Headlamp loads these for the home screen)
  if (path.endsWith('/events') || path === '/api/v1/events')
    return ok(res, list('Event', 'v1', []));

  // ── OCM resources ──────────────────────────────────────────────────────────

  // List endpoints (cross-namespace)
  if (path === '/apis/delivery.ocm.software/v1alpha1/repositories')
    return ok(res, list('Repository', API, REPOSITORIES));
  if (path === '/apis/delivery.ocm.software/v1alpha1/componentversions')
    return ok(res, list('ComponentVersion', API, COMPONENTS));
  if (path === '/apis/delivery.ocm.software/v1alpha1/resources')
    return ok(res, list('Resource', API, RESOURCES));
  if (path === '/apis/delivery.ocm.software/v1alpha1/deployers')
    return ok(res, list('Deployer', API, DEPLOYERS));

  // Namespaced list endpoints
  const nsListMatch = path.match(/^\/apis\/delivery\.ocm\.software\/v1alpha1\/namespaces\/([^/]+)\/([^/]+)$/);
  if (nsListMatch) {
    const [, ns, plural] = nsListMatch;
    const allMap = { repositories: REPOSITORIES, componentversions: COMPONENTS, resources: RESOURCES, deployers: DEPLOYERS };
    const allItems = allMap[plural] ?? [];
    return ok(res, list(plural, API, allItems.filter(i => i.metadata.namespace === ns)));
  }

  // Namespaced item endpoints
  const nsItemMatch = path.match(/^\/apis\/delivery\.ocm\.software\/v1alpha1\/namespaces\/([^/]+)\/([^/]+)\/([^/]+)$/);
  if (nsItemMatch) {
    const [, , plural, name] = nsItemMatch;
    const lookupMap = { repositories: repoByName, componentversions: componentByName, resources: resourceByName, deployers: deployerByName };
    const item = lookupMap[plural]?.get(name);
    return item ? ok(res, item) : notFound(res, path);
  }

  // ── API group version discovery ────────────────────────────────────────────
  const apiGroupMatch = path.match(/^\/apis\/([^/]+)\/([^/]+)$/);
  if (apiGroupMatch) {
    return ok(res, { kind: 'APIResourceList', groupVersion: `${apiGroupMatch[1]}/${apiGroupMatch[2]}`, resources: [] });
  }

  console.log(`  [unhandled] ${method} ${path}`);
  notFound(res, path);
}

// ── Start server ──────────────────────────────────────────────────────────────

const server = http.createServer(route);
server.listen(PORT, '127.0.0.1', () => {
  console.log(`\nOCM mock cluster listening on http://localhost:${PORT}`);
  console.log(`  Add to kubeconfig: node mock-cluster/server.mjs --print-kubeconfig >> ~/.kube/config`);
  console.log(`  Then switch to context "ocm-mock" in Headlamp.\n`);
});

server.on('error', err => {
  console.error('Server error:', err.message);
  process.exit(1);
});
