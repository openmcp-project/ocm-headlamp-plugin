# OCM — Headlamp Plugin

A [Headlamp](https://headlamp.dev) plugin for the [Open Component Model (OCM)](https://ocm.software) — visualizes the full OCM delivery pipeline on any ControlPlane running the OCM controller (`delivery.ocm.software/v1alpha1`).

## What it does

- **OCM Overview** — donut charts for Repository / Component / Resource / Deployer health, plus a collapsible Delivery Pipelines tree linking repositories to their components, resources, and deployers
- **Repositories** — list and detail view with URL, auth secret, conditions
- **Components** — list and detail view with semver constraint, resolved version, repository reference
- **Resources** — list and detail view with artifact reference, type chip, component link, snapshot name
- **Deployers** — list and detail view with resource reference, target namespace, last applied revision

All views use Headlamp's native `ResourceListView`, `MainInfoSection`, and `ConditionsTable` for a consistent look with sorting, filtering, column toggles, and YAML inspection.

## Prerequisites

The OCM controller must be installed on the target cluster:

```yaml
apiVersion: ocm.services.open-control-plane.io/v1alpha1
kind: OCM
metadata:
  name: <controlplane-name>
  namespace: <workspace-namespace>
spec:
  version: "v0.13.0"
```

## OCM delivery pipeline

```
Repository → Component → Resource → Deployer
```

1. **Repository** — points to an OCI registry hosting OCM components
2. **Component** — selects a component + semver constraint from a Repository
3. **Resource** — picks a specific artifact from inside the Component
4. **Deployer** — reads the artifact and applies it to the cluster

## Installation

Install via Headlamp's built-in plugin manager by searching for **OCM** on [ArtifactHub](https://artifacthub.io/packages/headlamp/ocm-headlamp-plugin/headlamp-ocm).

## Manual deploy

```bash
kubectl cp dist/main.js <headlamp-pod>:/headlamp/plugins/headlamp-ocm/main.js -n headlamp
kubectl cp package.json <headlamp-pod>:/headlamp/plugins/headlamp-ocm/package.json -n headlamp
```
