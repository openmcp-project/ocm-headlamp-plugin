[![Artifact Hub](https://img.shields.io/endpoint?url=https://artifacthub.io/badge/repository/ocm-headlamp-plugin)](https://artifacthub.io/packages/search?repo=ocm-headlamp-plugin)

# ocm-headlamp-plugin

A [Headlamp™](https://headlamp.dev) plugin for the [Open Component Model (OCM)](https://ocm.software): visualizes the full OCM delivery pipeline on any ControlPlane running the OCM controller (`delivery.ocm.software/v1alpha1`).

## What it does

- **OCM Overview** — donut charts for Repository / Component / Resource / Deployer health, plus a collapsible Delivery Pipelines tree linking repositories to their components, resources, and deployers
- **Repositories** — list and detail view with URL, auth secret, and conditions
- **Components** — list and detail view with semver constraint, resolved version, and repository reference
- **Resources** — list and detail view with artifact reference, type, component link, and snapshot name
- **Deployers** — list and detail view with resource reference, target namespace, and last applied revision

All views use Headlamp's native `ResourceListView`, `MainInfoSection`, and `ConditionsTable` — consistent look with sorting, filtering, column toggles, and YAML inspection built in.

## OCM delivery pipeline

```
Repository → Component → Resource → Deployer
```

1. **Repository** — points to an OCI registry hosting OCM components
2. **Component** — selects a component + semver constraint from a Repository
3. **Resource** — picks a specific artifact (image, chart, blob, …) from inside the Component
4. **Deployer** — reads the artifact snapshot and applies it to the cluster

## Development

### Prerequisites

- Node.js >= 18
- npm
- `kind`, `kubectl`, `helm` (for local cluster)

```bash
npm install
```

### Local dev cluster (kind)

The cluster setup and plugin iteration is managed centrally from the `ui-frontend` repo.

**One-time setup** (creates the kind cluster, deploys Headlamp with latest ArtifactHub plugin releases, port-forwards to `localhost:8090`):

```bash
# from ui-frontend/ or from this repo
task dev
```

**Every time you change plugin code** (builds + hot-syncs all local plugins into the pod, no restart needed):

```bash
# from ui-frontend/ or from this repo
task update
```

Then hard-refresh the browser (`Cmd+Shift+R`) to pick up the new build.

### Build for production

```bash
npm run build
# Output: dist/main.js
```

## Release

Trigger a release via the [GitHub Actions release workflow](../../actions/workflows/release.yml) by clicking **Run workflow** and entering the semver version (e.g. `v0.2.0`). The workflow:

- Creates a git tag
- Builds the plugin and uploads `main.js` + a `headlamp-ocm-<version>.tar.gz` as GitHub Release assets
- Updates `artifacthub/<version>/artifacthub-pkg.yml` with the correct checksum and commits it

Once published, the plugin is installable via Headlamp's plugin manager using its ArtifactHub URL.

## Support, Feedback, Contributing

This project is open to feature requests/suggestions, bug reports etc. via [GitHub issues](https://github.com/openmcp-project/ocm-headlamp-plugin/issues). Contribution and feedback are encouraged and always welcome. For more information about how to contribute, the project structure, as well as additional contribution information, see our [Contribution Guidelines](https://github.com/openmcp-project/.github/blob/main/CONTRIBUTING.md).

## Code of Conduct

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone. By participating in this project, you agree to abide by its [Code of Conduct](https://github.com/openmcp-project/.github/blob/main/CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright © Linux Foundation Europe. OpenControlPlane is a project of NeoNephos Foundation. For applicable policies including privacy policy, terms of use and trademark usage guidelines, please see https://linuxfoundation.eu. Linux is a registered trademark of Linus Torvalds.
Please see our [LICENSE](LICENSE) for copyright and license information. Detailed information including third-party components and their licensing/copyright information is available [via the REUSE tool](https://api.reuse.software/info/github.com/openmcp-project/ocm-headlamp-plugin).

<p align="center"><img alt="NeoNephos foundation logo" src="https://raw.githubusercontent.com/neonephos/.github/refs/heads/main/assets/logo.svg" width="400"/></p>
