import React from 'react';
import type { Capture, ShoppingMeta } from '../types/capture.types';
import { LeftColumn } from './shared/LeftColumn';
import { ResizablePanelLayout } from './shared/ResizablePanelLayout';
import { Section, StatusWidget, TextField, NumberField, ShoppingListWidget } from './shared/widgets';

const STATUS_OPTIONS = [
  { value: 'need',    label: '🛒 Need to buy', color: 'bg-gray-400' },
  { value: 'ordered', label: '📦 Ordered',     color: 'bg-blue-500' },
  { value: 'done',    label: '✅ Got it',       color: 'bg-green-500' },
];

interface ShoppingPanelProps { capture: Capture; onUpdate: (c: Capture) => void; }

export function ShoppingPanel({ capture, onUpdate }: ShoppingPanelProps): React.ReactElement {
  const meta = (capture.meta ?? {}) as ShoppingMeta;

  function patchMeta(patch: Partial<ShoppingMeta>): void {
    onUpdate({ ...capture, meta: { ...meta, ...patch }, updatedAt: new Date().toISOString() });
  }

  const done  = (meta.items ?? []).filter(i => i.checked).length;
  const total = (meta.items ?? []).length;

  return (
    <ResizablePanelLayout
      left={<LeftColumn capture={capture} onUpdate={onUpdate} />}
      right={<div className="px-6 py-7 space-y-6">

        {total > 0 && (
          <div className="bg-[#f8f8f8] rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-[13px] text-gray-500">Progress</span>
            <span className="text-[13px] font-bold text-[#E24B4A]">{done} / {total}</span>
          </div>
        )}

        <Section title="Items">
          <ShoppingListWidget items={meta.items} onChange={v => patchMeta({ items: v })} />
        </Section>

        <Section title="Status">
          <StatusWidget options={STATUS_OPTIONS} value={meta.status} onChange={v => patchMeta({ status: v as ShoppingMeta['status'] })} />
        </Section>

        <Section title="Details">
          <div className="space-y-2">
            <TextField label="Preferred store" value={meta.store} onChange={v => patchMeta({ store: v })} placeholder="e.g. Amazon, IKEA…" />
            <NumberField label="Budget" value={meta.budget} onChange={v => patchMeta({ budget: v })} prefix="$" />
          </div>
        </Section>

      </div>}
    />
  );
}
