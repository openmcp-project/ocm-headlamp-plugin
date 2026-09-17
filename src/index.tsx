import {
  registerRoute,
  registerSidebarEntry,
} from '@kinvolk/headlamp-plugin/lib';
import React from 'react';
import OCMOverview from './overview';
import RepositoryList from './repositories/RepositoryList';
import RepositoryDetail from './repositories/RepositoryDetail';
import ComponentList from './components/ComponentList';
import ComponentDetail from './components/ComponentDetail';
import ResourceList from './resources/ResourceList';
import ResourceDetail from './resources/ResourceDetail';
import DeployerList from './deployers/DeployerList';
import DeployerDetail from './deployers/DeployerDetail';

// OCM logo — from https://github.com/open-component-model/.github/tree/main/branding
const ocmIcon = {
  body: '<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="m328.697 36.155 4.746 20.59A210.6 210.6 0 0 1 373.585 79.6l20.128-6.43h.006a228 228 0 0 1 31.356 30.978v.007l-6.184 20.203a210.4 210.4 0 0 1 23.337 39.864l20.647 4.496.006.003a228 228 0 0 1 11.665 42.505l-.001.006-15.46 14.405a210.5 210.5 0 0 1 .281 46.191l15.632 14.217.003.007a228 228 0 0 1-11.15 42.643l-.005.003-20.59 4.745a210.6 210.6 0 0 1-22.854 40.143l6.431 20.128-.002.008a228 228 0 0 1-30.977 31.354l-.007.002-20.206-6.185a210.5 210.5 0 0 1-39.861 23.337l-4.496 20.645-.003.006a228 228 0 0 1-42.506 11.666l-.006-.002-14.405-15.458a210.5 210.5 0 0 1-46.191.28l-14.216 15.631-.007.003a228 228 0 0 1-42.644-11.15l-.003-.005-4.747-20.59a210.6 210.6 0 0 1-40.141-22.852l-20.128 6.43-.008-.003a228 228 0 0 1-31.354-30.977l-.003-.007 6.185-20.203a210.6 210.6 0 0 1-23.337-39.861l-20.648-4.496-.002-.006a227.7 227.7 0 0 1-11.667-42.503l.002-.008 15.459-14.405a210.4 210.4 0 0 1-.28-46.19l-15.632-14.217-.003-.005a228 228 0 0 1 11.15-42.643l.005-.005 20.59-4.746a210.4 210.4 0 0 1 22.852-40.143l-6.429-20.127.002-.006a227.6 227.6 0 0 1 30.977-31.356l.005-.001 20.206 6.185a210.5 210.5 0 0 1 39.862-23.339l4.495-20.645.006-.005a228 228 0 0 1 42.503-11.667l.008.002 14.405 15.46a210.6 210.6 0 0 1 46.19-.281l14.218-15.632.005-.003a228 228 0 0 1 42.643 11.15zm-102.925 220.35c-.626-2.37-.79-4.75-.835-6.876-.082-3.718 1.59-7.373 4.896-9.319a6.13 6.13 0 0 0 3-4.768c.168-1.98-.716-4.401-2.154-5.774a7 7 0 0 0-2.597-1.586c-1.938-.657-4.032-.085-5.752 1.024a6.07 6.07 0 0 0-2.778 5.053l-.005.123c-.032 3.852-2.564 7.01-5.93 8.786-1.708 1.333-3.758 2.276-6.164 2.813a1.4 1.4 0 0 1-1.016-.158l-23.768-13.722-65.149 37.612v75.225l65.147 37.613 65.149-37.612v-22.75a1.6 1.6 0 0 0-.155-.689l-.537-1.141a6.43 6.43 0 0 0-7.489-3.467l-4.315 1.163a11.112 11.112 0 0 1-14.003-10.731l-.001-.003a11.12 11.12 0 0 1 13.998-10.733l3.938 1.06a6.92 6.92 0 0 0 8.079-3.777l.377-.81a1.2 1.2 0 0 0 .107-.493v-22.854l-21.383-12.348a1.42 1.42 0 0 1-.66-.86m48.034-2.36c2.366.641 4.51 1.69 6.376 2.714 3.258 1.789 5.587 5.063 5.621 8.9a6.13 6.13 0 0 0 2.628 4.981c1.632 1.136 4.148 1.5 6.078 1.021 1.022-.253 1.895-.778 2.672-1.455 1.542-1.345 2.09-3.45 1.99-5.491a6.07 6.07 0 0 0-3.065-4.984c-3.317-1.954-4.231-5.805-4.774-9.56-.111-2.123.024-4.373.749-6.726.106-.34.338-.627.646-.806l23.766-13.72.003-75.227-65.15-37.612-65.146 37.612v75.226l19.702 11.374c.207.12.437.192.674.21l1.259.107a6.43 6.43 0 0 0 6.745-4.753l1.15-4.317a11.114 11.114 0 0 1 16.294-6.763l.004.003a11.11 11.11 0 0 1 2.294 17.488l-2.884 2.88a6.92 6.92 0 0 0-.769 8.886l.514.73c.097.14.225.256.372.34l19.792 11.428 21.385-12.345a1.42 1.42 0 0 1 1.074-.142m-21.9 42.161c-1.736 1.733-3.713 3.07-5.526 4.179-3.174 1.938-7.173 2.328-10.517.449a6.14 6.14 0 0 0-5.63-.2c-1.797.852-3.49 2.823-3.91 4.767-.22 1.014-.273 2.023-.066 3.041.407 2.004 1.952 3.53 3.774 4.458a6.07 6.07 0 0 0 5.765-.135l.101-.06c3.346-1.905 8.947-.912 11.052.286 1.85 1.051 3.435 2.514 5.076 4.354.23.26.359.595.36.943l.078 27.45 65.255 37.426 65.04-37.8-.215-75.225-65.254-37.426-19.671 11.432c-.205.12-.383.283-.518.48l-.718 1.038a6.43 6.43 0 0 0 .768 8.216l3.17 3.147a11.112 11.112 0 0 1-2.24 17.498l-.002.002a11.112 11.112 0 0 1-16.311-6.71l-1.063-3.936a6.924 6.924 0 0 0-7.326-5.088l-.89.082c-.17.016-.333.068-.48.154l-19.76 11.483.07 24.693c0 .375-.148.735-.413 1.002"/>',
  width: 500,
  height: 500,
};

// ── Sidebar ───────────────────────────────────────────────────────────────────

registerSidebarEntry({
  parent: null,
  name: 'ocm',
  label: 'OCM',
  url: '/ocm/overview',
  icon: ocmIcon,
});

registerSidebarEntry({
  parent: 'ocm',
  name: 'ocm-overview',
  label: 'Overview',
  url: '/ocm/overview',
});

registerSidebarEntry({
  parent: 'ocm',
  name: 'ocm-repositories',
  label: 'Repositories',
  url: '/ocm/repositories',
});

registerSidebarEntry({
  parent: 'ocm',
  name: 'ocm-components',
  label: 'Components',
  url: '/ocm/components',
});

registerSidebarEntry({
  parent: 'ocm',
  name: 'ocm-resources',
  label: 'Resources',
  url: '/ocm/resources',
});

registerSidebarEntry({
  parent: 'ocm',
  name: 'ocm-deployers',
  label: 'Deployers',
  url: '/ocm/deployers',
});

// ── Routes ────────────────────────────────────────────────────────────────────

registerRoute({
  path: '/ocm/overview',
  sidebar: 'ocm-overview',
  name: 'ocmOverview',
  exact: true,
  component: () => React.createElement(OCMOverview),
});

registerRoute({
  path: '/ocm/repositories',
  sidebar: 'ocm-repositories',
  name: 'ocmRepositories',
  exact: true,
  component: () => React.createElement(RepositoryList),
});

registerRoute({
  path: '/ocm/repositories/:namespace/:name',
  sidebar: 'ocm-repositories',
  name: 'ocmRepositoryDetail',
  exact: true,
  component: () => React.createElement(RepositoryDetail),
});

registerRoute({
  path: '/ocm/components',
  sidebar: 'ocm-components',
  name: 'ocmComponents',
  exact: true,
  component: () => React.createElement(ComponentList),
});

registerRoute({
  path: '/ocm/components/:namespace/:name',
  sidebar: 'ocm-components',
  name: 'ocmComponentDetail',
  exact: true,
  component: () => React.createElement(ComponentDetail),
});

registerRoute({
  path: '/ocm/resources',
  sidebar: 'ocm-resources',
  name: 'ocmResources',
  exact: true,
  component: () => React.createElement(ResourceList),
});

registerRoute({
  path: '/ocm/resources/:namespace/:name',
  sidebar: 'ocm-resources',
  name: 'ocmResourceDetail',
  exact: true,
  component: () => React.createElement(ResourceDetail),
});

registerRoute({
  path: '/ocm/deployers',
  sidebar: 'ocm-deployers',
  name: 'ocmDeployers',
  exact: true,
  component: () => React.createElement(DeployerList),
});

registerRoute({
  path: '/ocm/deployers/:namespace/:name',
  sidebar: 'ocm-deployers',
  name: 'ocmDeployerDetail',
  exact: true,
  component: () => React.createElement(DeployerDetail),
});
