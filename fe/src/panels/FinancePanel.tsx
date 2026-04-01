import React from 'react';
import type { Capture, FinanceMeta } from '../types/capture.types';
import { LeftColumn } from './shared/LeftColumn';
import { ResizablePanelLayout } from './shared/ResizablePanelLayout';
import { Section, StatusWidget, TextField, NumberField, DateWidget } from './shared/widgets';

const TYPE_OPTIONS = [
  { value: 'expense',    label: '↓ Expense',    color: 'bg-[#E24B4A]' },
  { value: 'income',     label: '↑ Income',     color: 'bg-green-500' },
  { value: 'investment', label: '◈ Investment', color: 'bg-violet-500' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ Pending', color: 'bg-amber-400' },
  { value: 'done',    label: '✅ Done',     color: 'bg-green-500' },
];

interface FinancePanelProps { capture: Capture; onUpdate: (c: Capture) => void; }

export function FinancePanel({ capture, onUpdate }: FinancePanelProps): React.ReactElement {
  const meta = (capture.meta ?? {}) as FinanceMeta;

  function patchMeta(patch: Partial<FinanceMeta>): void {
    onUpdate({ ...capture, meta: { ...meta, ...patch }, updatedAt: new Date().toISOString() });
  }

  return (
    <ResizablePanelLayout
      left={<LeftColumn capture={capture} onUpdate={onUpdate} />}
      right={<div className="px-6 py-7 space-y-6">

        {meta.amount != null && (
          <div className="bg-[#f8f8f8] rounded-xl px-4 py-4 text-center">
            <p className="text-[11px] text-gray-400 mb-1 capitalize">{meta.financeType ?? 'Amount'}</p>
            <p className="text-[32px] font-bold text-[#1a1a1a]">
              {meta.currency ?? '$'}{meta.amount.toLocaleString()}
            </p>
          </div>
        )}

        <Section title="Type">
          <StatusWidget options={TYPE_OPTIONS} value={meta.financeType} onChange={v => patchMeta({ financeType: v as FinanceMeta['financeType'] })} />
        </Section>

        <Section title="Amount">
          <div className="flex gap-2">
            <div className="w-24 flex-shrink-0">
              <TextField label="Currency" value={meta.currency} onChange={v => patchMeta({ currency: v })} placeholder="$" />
            </div>
            <div className="flex-1">
              <NumberField label="Amount" value={meta.amount} onChange={v => patchMeta({ amount: v })} />
            </div>
          </div>
        </Section>

        <Section title="Date">
          <DateWidget value={meta.date} onChange={v => patchMeta({ date: v })} label="Transaction date" />
        </Section>

        <Section title="Status">
          <StatusWidget options={STATUS_OPTIONS} value={meta.status} onChange={v => patchMeta({ status: v as FinanceMeta['status'] })} />
        </Section>

      </div>}
    />
  );
}
