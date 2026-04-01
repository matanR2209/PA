import React from 'react';
import type { Capture, WorkTaskMeta } from '../types/capture.types';
import { LeftColumn } from './shared/LeftColumn';
import { ResizablePanelLayout } from './shared/ResizablePanelLayout';
import { Section, PriorityWidget, StatusWidget, DateWidget, TextField, NumberField, LabelsWidget } from './shared/widgets';

const STATUS_OPTIONS = [
  { value: 'todo',        label: '○ To Do',       color: 'bg-gray-400' },
  { value: 'in-progress', label: '◑ In Progress', color: 'bg-blue-500' },
  { value: 'done',        label: '● Done',         color: 'bg-green-500' },
];

interface WorkTaskPanelProps { capture: Capture; onUpdate: (c: Capture) => void; }

export function WorkTaskPanel({ capture, onUpdate }: WorkTaskPanelProps): React.ReactElement {
  const meta = (capture.meta ?? {}) as WorkTaskMeta;

  function patchMeta(patch: Partial<WorkTaskMeta>): void {
    onUpdate({ ...capture, meta: { ...meta, ...patch }, updatedAt: new Date().toISOString() });
  }

  return (
    <ResizablePanelLayout
      left={<LeftColumn capture={capture} onUpdate={onUpdate} />}
      right={<div className="px-6 py-7 space-y-6">

        <Section title="Status">
          <StatusWidget options={STATUS_OPTIONS} value={meta.status} onChange={v => patchMeta({ status: v as WorkTaskMeta['status'] })} />
        </Section>

        <Section title="Priority">
          <PriorityWidget value={meta.priority} onChange={v => patchMeta({ priority: v as WorkTaskMeta['priority'] })} />
        </Section>

        <Section title="Due Date">
          <DateWidget value={meta.dueDate} onChange={v => patchMeta({ dueDate: v })} />
        </Section>

        <Section title="Details">
          <div className="space-y-2">
            <TextField label="Owner / Assignee" value={meta.owner} onChange={v => patchMeta({ owner: v })} placeholder="e.g. Me, John…" />
            <TextField label="Project" value={meta.project} onChange={v => patchMeta({ project: v })} placeholder="e.g. Q3 Launch…" />
            <NumberField label="Estimate" value={meta.estimatedMinutes} onChange={v => patchMeta({ estimatedMinutes: v })} suffix="min" />
          </div>
        </Section>

        <Section title="Labels">
          <LabelsWidget
            selectedIds={meta.labels}
            onChange={v => patchMeta({ labels: v })}
          />
        </Section>

      </div>}
    />
  );
}
