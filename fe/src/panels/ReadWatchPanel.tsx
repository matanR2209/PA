import React from 'react';
import type { Capture, ReadWatchMeta } from '../types/capture.types';
import { LeftColumn } from './shared/LeftColumn';
import { ResizablePanelLayout } from './shared/ResizablePanelLayout';
import { Section, StatusWidget, TagsWidget, TextField, NumberField } from './shared/widgets';

const STATUS_OPTIONS = [
  { value: 'saved',       label: '🔖 Saved',    color: 'bg-gray-400' },
  { value: 'in-progress', label: '▶️ Reading',   color: 'bg-blue-500' },
  { value: 'done',        label: '✅ Done',       color: 'bg-green-500' },
];

const TYPE_OPTIONS = [
  { value: 'article', label: '📰 Article', color: 'bg-sky-500' },
  { value: 'book',    label: '📚 Book',    color: 'bg-violet-500' },
  { value: 'video',   label: '🎥 Video',   color: 'bg-red-500' },
  { value: 'podcast', label: '🎙️ Podcast', color: 'bg-amber-500' },
  { value: 'other',   label: '🗒️ Other',   color: 'bg-gray-400' },
];

interface ReadWatchPanelProps { capture: Capture; onUpdate: (c: Capture) => void; }

export function ReadWatchPanel({ capture, onUpdate }: ReadWatchPanelProps): React.ReactElement {
  const meta = (capture.meta ?? {}) as ReadWatchMeta;

  function patchMeta(patch: Partial<ReadWatchMeta>): void {
    onUpdate({ ...capture, meta: { ...meta, ...patch }, updatedAt: new Date().toISOString() });
  }

  return (
    <ResizablePanelLayout
      left={<LeftColumn capture={capture} onUpdate={onUpdate} />}
      right={<div className="px-6 py-7 space-y-6">

        <Section title="Status">
          <StatusWidget options={STATUS_OPTIONS} value={meta.status} onChange={v => patchMeta({ status: v as ReadWatchMeta['status'] })} />
        </Section>

        <Section title="Type">
          <StatusWidget options={TYPE_OPTIONS} value={meta.mediaType} onChange={v => patchMeta({ mediaType: v as ReadWatchMeta['mediaType'] })} />
        </Section>

        <Section title="Link">
          <TextField label="URL" value={meta.url} onChange={v => patchMeta({ url: v })} placeholder="https://…" />
          {meta.url && (
            <a href={meta.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-[12px] text-blue-500 hover:underline">
              Open link ↗
            </a>
          )}
        </Section>

        <Section title="Time estimate">
          <NumberField label="Estimated" value={meta.estimatedMinutes} onChange={v => patchMeta({ estimatedMinutes: v })} suffix="min" />
        </Section>

        <Section title="Tags">
          <TagsWidget tags={meta.tags} onChange={v => patchMeta({ tags: v })} />
        </Section>


      </div>}
    />
  );
}
