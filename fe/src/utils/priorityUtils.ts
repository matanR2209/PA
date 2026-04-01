import type React from 'react';

export type Priority = 'high' | 'medium' | 'low' | undefined;

export function priorityOrder(p: Priority): number {
  return p === 'high' ? 0 : p === 'medium' ? 1 : 2;
}

export function priorityBorderStyle(p: Priority): React.CSSProperties {
  if (p === 'high')   return { borderLeftColor: '#E24B4A', borderLeftWidth: 3 };
  if (p === 'medium') return { borderLeftColor: '#fb923c', borderLeftWidth: 2 };
  return { borderLeftColor: 'transparent', borderLeftWidth: 3 };
}
