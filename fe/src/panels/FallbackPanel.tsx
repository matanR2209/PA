import React from 'react';
import type { Capture } from '../types/capture.types';
import { LeftColumn } from './shared/LeftColumn';
import { ResizablePanelLayout } from './shared/ResizablePanelLayout';
import { Section, TagsWidget } from './shared/widgets';

interface FallbackPanelProps { capture: Capture; onUpdate: (c: Capture) => void; }

export function FallbackPanel({ capture, onUpdate }: FallbackPanelProps): React.ReactElement {
  const meta = (capture.meta ?? {}) as { tags?: string[] };

  function patchMeta(patch: Partial<typeof meta>): void {
    onUpdate({ ...capture, meta: { ...meta, ...patch }, updatedAt: new Date().toISOString() });
  }

  return (
    <ResizablePanelLayout
      left={<LeftColumn capture={capture} onUpdate={onUpdate} />}
      right={<div className="px-6 py-7 space-y-6">
        <Section title="Tags">
          <TagsWidget tags={meta.tags} onChange={v => patchMeta({ tags: v })} />
        </Section>
      </div>}
    />
  );
}
