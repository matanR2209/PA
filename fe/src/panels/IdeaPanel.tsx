import React from 'react';
import type { Capture, IdeaMeta, IdeaInsights, ActionItem } from '../types/capture.types';
import { LeftColumn } from './shared/LeftColumn';
import { ResizablePanelLayout } from './shared/ResizablePanelLayout';
import { Section, StatusWidget, TagsWidget, InnovationMeterWidget, ChecklistWidget } from './shared/widgets';
import { IdeaInsightsSection } from './IdeaInsightsSection';
import { useIdeaAnalyse } from '../hooks/useIdeaAnalyse';

const STATUS_OPTIONS = [
  { value: 'raw',        label: '🌱 Raw',        color: 'bg-gray-400' },
  { value: 'developing', label: '🔨 Developing',  color: 'bg-amber-400' },
  { value: 'ready',      label: '✅ Ready',        color: 'bg-green-500' },
];

const MIN_CONTENT = 40;

function innovationLabel(n: number): string {
  if (n <= 2) return `${n} — Incremental`;
  if (n <= 4) return `${n} — Iterative`;
  if (n <= 6) return `${n} — Distinctive`;
  if (n <= 8) return `${n} — Disruptive`;
  return `${n} — Breakthrough`;
}

interface IdeaPanelProps { capture: Capture; onUpdate: (c: Capture) => void; }

export function IdeaPanel({ capture, onUpdate }: IdeaPanelProps): React.ReactElement {
  const meta = (capture.meta ?? {}) as IdeaMeta;

  function patchMeta(patch: Partial<IdeaMeta>): void {
    onUpdate({ ...capture, meta: { ...meta, ...patch }, updatedAt: new Date().toISOString() });
  }

  // Hook lives here — auto-saves when analysis finishes
  const { insights: liveInsights, state, error, run } = useIdeaAnalyse((insights: IdeaInsights) => {
    patchMeta({ aiInsights: insights });
  });

  const displayInsights = liveInsights ?? meta.aiInsights ?? null;
  const isLoading = state === 'loading';
  const hasResult = !!displayInsights;
  const canAnalyse = capture.content.trim().length >= MIN_CONTENT;

  const insightsSection = (
    <IdeaInsightsSection
      insights={displayInsights}
      isLoading={isLoading}
      meta={meta}
      onExtractActions={(actions: string[]) => {
        const items: ActionItem[] = actions.map(text => ({
          id: crypto.randomUUID(),
          text,
          done: false,
          createdAt: new Date().toISOString(),
        }));
        patchMeta({ actionItems: [...(meta.actionItems ?? []), ...items] });
      }}
    />
  );

  return (
    <ResizablePanelLayout
      left={<LeftColumn capture={capture} onUpdate={onUpdate} extraSections={insightsSection} />}
      right={
        <div className="px-6 py-7 space-y-6">

          <Section title="Status">
            <StatusWidget options={STATUS_OPTIONS} value={meta.status} onChange={v => patchMeta({ status: v as IdeaMeta['status'] })} />
          </Section>

          <Section title="Target Audience">
            <TagsWidget tags={meta.audience} onChange={v => patchMeta({ audience: v })} placeholder="e.g. Startups, Gen Z…" />
          </Section>

          <Section title="Innovation Meter">
            <InnovationMeterWidget
              value={meta.innovationScore ?? 5}
              onChange={v => patchMeta({ innovationScore: v })}
              title={capture.title}
              content={capture.content}
              label="How novel is this?"
              renderValue={innovationLabel}
            />
          </Section>

          <Section title="Next Steps">
            <ChecklistWidget
              items={meta.nextSteps}
              onChange={v => patchMeta({ nextSteps: v })}
              placeholder="Add an action…"
            />
          </Section>

          <Section title="Tags">
            <TagsWidget tags={meta.tags} onChange={v => patchMeta({ tags: v })} placeholder="Add tag…" />
          </Section>

          {/* ── AI Says ── */}
          <Section title="AI Says">
            <div className="space-y-2.5">
              <button
                onClick={() => run(capture.title, capture.content)}
                disabled={!canAnalyse || isLoading}
                title={!canAnalyse ? 'Add more detail to enable analysis' : undefined}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${
                  !canAnalyse
                    ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                    : isLoading
                    ? 'bg-[#fdf2f2] text-[#E24B4A] border-[#f5c6c6] cursor-wait'
                    : 'bg-[#fdf2f2] text-[#E24B4A] border-[#f5c6c6] hover:bg-[#fce8e8]'
                }`}
              >
                {isLoading ? (
                  <span className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#E24B4A] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </span>
                ) : hasResult ? (
                  <>↺ Re-analyse</>
                ) : (
                  <>✦ Analyse this idea</>
                )}
              </button>

              {state === 'error' && error && (
                <p className="text-[11px] text-red-400 text-center">{error}</p>
              )}

              {hasResult && !isLoading && (
                <p className="text-[11px] text-gray-300 text-center">
                  Results shown in the main view
                </p>
              )}
            </div>
          </Section>

        </div>
      }
    />
  );
}
