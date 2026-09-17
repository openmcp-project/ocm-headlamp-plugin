// OCM state color tokens

export const ocmColors = {
  ready:     { bg: '#2e7d32', text: '#fff', faint: 'rgba(46,125,50,0.08)'   },
  notReady:  { bg: '#c62828', text: '#fff', faint: 'rgba(198,40,40,0.06)'   },
  synced:    { bg: '#1565c0', text: '#fff', faint: 'rgba(21,101,192,0.08)'  },
  notSynced: { bg: '#e65100', text: '#fff', faint: 'rgba(230,81,0,0.08)'    },
  healthy:   { bg: '#2e7d32', text: '#fff', faint: 'rgba(46,125,50,0.08)'   },
  degraded:  { bg: '#c62828', text: '#fff', faint: 'rgba(198,40,40,0.06)'   },
  warning:   { bg: '#e65100', text: '#fff', faint: 'rgba(230,81,0,0.08)'    },
  unknown:   { bg: '#616161', text: '#fff', faint: 'rgba(97,97,97,0.08)'    },
  pending:   { bg: '#0288d1', text: '#fff', faint: 'rgba(2,136,209,0.08)'   },
  link:      '#1565c0',
};

export function statusColor(conditions: any[]): string {
  const ready = conditions.find((c: any) => c.type === 'Ready');
  if (ready?.status === 'True')  return ocmColors.healthy.bg;
  if (ready?.status === 'False') return ocmColors.degraded.bg;
  return ocmColors.unknown.bg;
}

export const DOT: Record<string, string> = {
  ready:     ocmColors.ready.bg,
  'not-ready': ocmColors.notReady.bg,
  synced:    ocmColors.synced.bg,
  'not-synced': ocmColors.notSynced.bg,
  healthy:   ocmColors.healthy.bg,
  unhealthy: ocmColors.degraded.bg,
  unknown:   ocmColors.unknown.bg,
};
