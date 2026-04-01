import React from 'react';
import type { Capture, TravelMeta } from '../types/capture.types';
import { LeftColumn } from './shared/LeftColumn';
import { ResizablePanelLayout } from './shared/ResizablePanelLayout';
import { Section, StatusWidget, TextField, NumberField, DateWidget } from './shared/widgets';

const STATUS_OPTIONS = [
  { value: 'planning', label: '🗺️ Planning', color: 'bg-sky-500' },
  { value: 'booked',   label: '✈️ Booked',   color: 'bg-violet-500' },
  { value: 'done',     label: '✅ Done',       color: 'bg-green-500' },
];

interface TravelPanelProps { capture: Capture; onUpdate: (c: Capture) => void; }

export function TravelPanel({ capture, onUpdate }: TravelPanelProps): React.ReactElement {
  const meta = (capture.meta ?? {}) as TravelMeta;

  function patchMeta(patch: Partial<TravelMeta>): void {
    onUpdate({ ...capture, meta: { ...meta, ...patch }, updatedAt: new Date().toISOString() });
  }

  return (
    <ResizablePanelLayout
      left={<LeftColumn capture={capture} onUpdate={onUpdate} />}
      right={<div className="px-6 py-7 space-y-6">

        <Section title="Status">
          <StatusWidget options={STATUS_OPTIONS} value={meta.status} onChange={v => patchMeta({ status: v as TravelMeta['status'] })} />
        </Section>

        <Section title="Destination">
          <TextField label="Where to?" value={meta.destination} onChange={v => patchMeta({ destination: v })} placeholder="e.g. Tokyo, Japan…" />
        </Section>

        <Section title="Dates">
          <div className="space-y-2">
            <DateWidget value={meta.startDate} onChange={v => patchMeta({ startDate: v })} label="Departure" />
            <DateWidget value={meta.endDate} onChange={v => patchMeta({ endDate: v })} label="Return" />
          </div>
        </Section>

        <Section title="Budget">
          <NumberField label="Estimated budget" value={meta.budget} onChange={v => patchMeta({ budget: v })} prefix="$" />
        </Section>


      </div>}
    />
  );
}
