import { K8s } from '@kinvolk/headlamp-plugin/lib';

const makeKubeObject: (name: string) => any =
  (K8s as any).makeKubeObject ??
  (() => Object.getPrototypeOf(K8s.ResourceClasses.CustomResourceDefinition));

// Repository – delivery.ocm.software/v1alpha1
// Points to an OCI registry hosting OCM components.
export class Repository extends makeKubeObject('Repository') {
  static apiVersion = 'delivery.ocm.software/v1alpha1';
  static kind = 'Repository';
  static apiName = 'repositories';
  static isNamespaced = true;

  get spec(): any { return this.jsonData.spec; }
  get status(): any { return this.jsonData.status; }
  get conditions(): any[] { return this.status?.conditions ?? []; }
  get url(): string { return this.spec?.url ?? ''; }
  get secretRef(): string { return this.spec?.secretRef?.name ?? ''; }
}

// ComponentVersion – delivery.ocm.software/v1alpha1
// Selects a component by name and semver constraint from a Repository.
export class ComponentVersion extends makeKubeObject('ComponentVersion') {
  static apiVersion = 'delivery.ocm.software/v1alpha1';
  static kind = 'ComponentVersion';
  static apiName = 'componentversions';
  static isNamespaced = true;

  get spec(): any { return this.jsonData.spec; }
  get status(): any { return this.jsonData.status; }
  get conditions(): any[] { return this.status?.conditions ?? []; }
  get component(): string { return this.spec?.component ?? ''; }
  get semver(): string { return this.spec?.version?.semver ?? ''; }
  get resolvedVersion(): string { return this.status?.reconciledVersion ?? ''; }
  get repositoryRef(): string { return this.spec?.repositoryRef?.name ?? ''; }
}

// Resource – delivery.ocm.software/v1alpha1
// Picks a specific artifact (blob, chart, image, …) from inside a ComponentVersion.
export class Resource extends makeKubeObject('Resource') {
  static apiVersion = 'delivery.ocm.software/v1alpha1';
  static kind = 'Resource';
  static apiName = 'resources';
  static isNamespaced = true;

  get spec(): any { return this.jsonData.spec; }
  get status(): any { return this.jsonData.status; }
  get conditions(): any[] { return this.status?.conditions ?? []; }
  get resourceRef(): any { return this.spec?.resourceRef ?? {}; }
  get componentVersionRef(): string { return this.spec?.componentVersionRef?.name ?? ''; }
  get snapshotName(): string { return this.status?.snapshotName ?? ''; }
}

// Deployer – delivery.ocm.software/v1alpha1
// Reads an OCM resource snapshot and applies it to the cluster.
export class Deployer extends makeKubeObject('Deployer') {
  static apiVersion = 'delivery.ocm.software/v1alpha1';
  static kind = 'Deployer';
  static apiName = 'deployers';
  static isNamespaced = true;

  get spec(): any { return this.jsonData.spec; }
  get status(): any { return this.jsonData.status; }
  get conditions(): any[] { return this.status?.conditions ?? []; }
  get resourceRef(): string { return this.spec?.resourceRef?.name ?? ''; }
  get targetNamespace(): string { return this.spec?.targetNamespace ?? ''; }
  get lastApplied(): string { return this.status?.lastAppliedRevision ?? ''; }
}
