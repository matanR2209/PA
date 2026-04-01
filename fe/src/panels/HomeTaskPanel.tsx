import React from 'react';
import type { Capture, HomeTaskMeta } from '../types/capture.types';
import { LeftColumn } from './shared/LeftColumn';
import { ResizablePanelLayout } from './shared/ResizablePanelLayout';
import { Section, PriorityWidget, StatusWidget, DateWidget, TextField } from './shared/widgets';

const STATUS_OPTIONS = [
  { value: 'todo',        label: '○ To Do',       color: 'bg-gray-400' },
  { value: 'in-progress', label: '◑ In Progress', color: 'bg-amber-400' },
  { value: 'done',        label: '● Done',         color: 'bg-green-500' },
];

interface HomeTaskPanelProps { capture: Capture; onUpdate: (c: Capture) => void; }

export function HomeTaskPanel({ capture, onUpdate }: HomeTaskPanelProps): React.ReactElement {
  const meta = (capture.meta ?? {}) as HomeTaskMeta;

  function patchMeta(patch: Partial<HomeTaskMeta>): void {
    onUpdate({ ...capture, meta: { ...meta, ...patch }, updatedAt: new Date().toISOString() });
  }

  return (
    <ResizablePanelLayout
      left={<LeftColumn capture={capture} onUpdate={onUpdate} />}
      right={<div className="px-6 py-7 space-y-6">

        <Section title="Status">
          <StatusWidget options={STATUS_OPTIONS} value={meta.status} onChange={v => patchMeta({ status: v as HomeTaskMeta['status'] })} />
        </Section>

        <Section title="Priority">
          <PriorityWidget value={meta.priority} onChange={v => patchMeta({ priority: v as HomeTaskMeta['priority'] })} />
        </Section>

        <Section title="Due Date">
          <DateWidget value={meta.dueDate} onChange={v => patchMeta({ dueDate: v })} />
        </Section>

        <Section title="Location / Room">
          <TextField label="Where?" value={meta.location} onChange={v => patchMeta({ location: v })} placeholder="e.g. Kitchen, Garage, Garden…" />
        </Section>

      </div>}
    />
  );
}
