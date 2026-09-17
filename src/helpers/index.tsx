import { ocmColors } from '../common/colors';

// ── Cluster-aware routing ────────────────────────────────────────────────────

export function clusterPrefix(): string {
  const base = (window as any).headlampBaseUrl ?? '';
  // Headlamp desktop (Electron) uses hash routing: #/c/:cluster/...
  // Headlamp web uses pathname routing: /c/:cluster/...
  const hashPath = window.location.hash.startsWith('#/') ? window.location.hash.slice(1) : null;
  const rawPath = hashPath ?? window.location.pathname;
  const pathname = base && rawPath.startsWith(base) ? rawPath.slice(base.length) : rawPath;
  const match = pathname.match(/^(\/c\/[^/]+)/);
  return match?.[1] ?? '';
}

// ── Status badge ─────────────────────────────────────────────────────────────

export function conditionColor(conditions: any[], type = 'Ready'): string {
  const cond = conditions?.find((c: any) => c.type === type);
  if (!cond) return ocmColors.unknown.bg;
  if (cond.status === 'True') return ocmColors.ready.bg;
  if (cond.status === 'False') return ocmColors.notReady.bg;
  return ocmColors.unknown.bg;
}

export function conditionLabel(conditions: any[], type = 'Ready'): string {
  const cond = conditions?.find((c: any) => c.type === type);
  if (!cond) return 'Unknown';
  if (cond.status === 'True') return type;
  if (cond.status === 'False') return `Not ${type}`;
  return 'Unknown';
}

interface BadgeProps {
  label: string;
  color: string;
  small?: boolean;
}

export function badge({ label, color, small = false }: BadgeProps): any {
  const { createElement: h } = (window as any).React ?? require('react');
  return h('span', {
    style: {
      padding: small ? '1px 6px' : '2px 9px',
      borderRadius: 10,
      fontSize: small ? 10 : 11,
      fontWeight: 600,
      background: color,
      color: '#fff',
      whiteSpace: 'nowrap',
    },
  }, label);
}

// ── Age formatter ─────────────────────────────────────────────────────────────

export function age(ts: string | undefined): string {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString();
}
