import type { Capture } from '../types';
import { addDays, toDateStr } from './dateUtils';
import { priorityOrder, type Priority } from './priorityUtils';

export interface BarDay {
  date:    Date;
  dateStr: string;
  label:   string;
  work:    number;
  home:    number;
  other:   number;
  total:   number;
}

export interface ThreeDay {
  date:      Date;
  dateStr:   string;
  label:     string;
  dateLabel: string;
  tasks:     Capture[];
}

export function computeBarDays(captures: Capture[], now: Date): BarDay[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d  = addDays(now, i);
    const ds = toDateStr(d);
    const day = captures.filter(c => (c.meta as Record<string, unknown>)?.dueDate === ds);
    return {
      date:    d,
      dateStr: ds,
      label:   d.toLocaleDateString('en-US', { weekday: 'short' }),
      work:    day.filter(c => c.category === 'work-task').length,
      home:    day.filter(c => c.category === 'home-task').length,
      other:   day.filter(c => !['work-task', 'home-task'].includes(c.category ?? '')).length,
      total:   day.length,
    };
  });
}

export function computeThreeDays(captures: Capture[], now: Date): ThreeDay[] {
  return [0, 1, 2].map(i => {
    const d  = addDays(now, i);
    const ds = toDateStr(d);
    const label =
      i === 0 ? 'Today' :
      i === 1 ? 'Tomorrow' :
      d.toLocaleDateString('en-US', { weekday: 'long' });
    return {
      date:      d,
      dateStr:   ds,
      label,
      dateLabel: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tasks: captures
        .filter(c => (c.meta as Record<string, unknown>)?.dueDate === ds)
        .sort((a, b) =>
          priorityOrder((a.meta as Record<string, unknown>)?.priority as Priority) -
          priorityOrder((b.meta as Record<string, unknown>)?.priority as Priority)
        ),
    };
  });
}
