import React, { useState, useEffect } from 'react';
import type { IdeaMeta, IdeaInsights } from '../types/capture.types';

// ── Shared card shell ──────────────────────────────────────────────────────

interface InsightCardProps {
  accent: string;
  icon: string;
  label: string;
  children: React.ReactNode;
}

function InsightCard({ accent, icon, label, children }: InsightCardProps): React.ReactElement {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 flex overflow-hidden">
      <div className={`w-1 ${accent} shrink-0`} />
      <div className="p-4 flex-1 min-w-0">
        <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2.5">
          <span>{icon}</span>
          <span>{label}</span>
        </p>
        {children}
      </div>
    </div>
  );
}

// ── Skeleton card ──────────────────────────────────────────────────────────

function SkeletonCard({ accent, lines = 2 }: { accent: string; lines?: number }): React.ReactElement {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 flex overflow-hidden animate-pulse">
      <div className={`w-1 ${accent} shrink-0 opacity-40`} />
      <div className="p-4 flex-1 space-y-2">
        <div className="h-2 bg-gray-100 rounded w-1/4" />
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className={`h-3 bg-gray-100 rounded ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface IdeaInsightsSectionProps {
  insights: IdeaInsights | null;
  isLoading: boolean;
  meta: IdeaMeta;
  onExtractActions: (actions: string[]) => void;
}

export function IdeaInsightsSection({
  insights,
  isLoading,
  meta,
  onExtractActions,
}: IdeaInsightsSectionProps): React.ReactElement | null {
  const [extracted, setExtracted] = useState(false);

  // Reset extracted flag whenever a fresh set of insights arrives
  useEffect(() => { setExtracted(false); }, [insights]);

  const hasAudienceTags = (meta.audience?.length ?? 0) > 0;

  // Don't render the section at all if there's nothing to show
  if (!isLoading && !insights && !hasAudienceTags) return null;

  return (
    <div className="flex flex-col gap-3">

      {/* ── Section header ── */}
      <div className="flex items-center gap-2">
        <span className="text-[13px]">✦</span>
        <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">AI Insights</p>
      </div>

      {/* ── Disclaimer ── */}
      {(insights || isLoading) && (
        <p className="text-[11px] text-gray-300 italic leading-relaxed -mt-1">
          AI-generated suggestions based on your idea. Review critically before acting.
        </p>
      )}

      {/* ── Audience tags (right-panel reflection) ── */}
      {hasAudienceTags && (
        <InsightCard accent="bg-purple-400" icon="🎯" label="Target Audience">
          <div className="flex flex-wrap gap-1.5">
            {meta.audience!.map(a => (
              <span
                key={a}
                className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[12px] font-semibold rounded-full border border-purple-100"
              >
                {a}
              </span>
            ))}
          </div>
        </InsightCard>
      )}

      {/* ── Loading skeletons ── */}
      {isLoading && (
        <>
          <SkeletonCard accent="bg-purple-300" lines={3} />
          <SkeletonCard accent="bg-red-400" lines={3} />
          <SkeletonCard accent="bg-amber-400" lines={2} />
          <SkeletonCard accent="bg-green-400" lines={3} />
        </>
      )}

      {/* ── AI insight cards ── */}
      {!isLoading && insights && (
        <>
          <InsightCard accent="bg-purple-300" icon="💬" label="Audience">
            <p className="text-[14px] text-[#333] leading-relaxed">{insights.audienceDescription}</p>
          </InsightCard>

          <InsightCard accent="bg-red-400" icon="⚠️" label="Key Risks">
            <ul className="space-y-2">
              {insights.keyRisks.map((risk, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[14px] text-[#333] leading-snug">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </InsightCard>

          <InsightCard accent="bg-amber-400" icon="💡" label="Additional Concerns">
            <p className="text-[14px] text-[#333] leading-relaxed">{insights.additionalConcerns}</p>
          </InsightCard>

          <InsightCard accent="bg-green-500" icon="✅" label="Verdict">
            <p className="text-[14px] text-[#333] leading-relaxed">{insights.verdict}</p>
          </InsightCard>

          {/* ── Extract action items ── */}
          {insights.actionItems.length > 0 && (
            <div className="px-1">
              {extracted ? (
                <p className="text-[12px] text-green-600 font-semibold flex items-center gap-1.5">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 6L4.5 9.5L11 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Action items added
                </p>
              ) : (
                <button
                  onClick={() => { onExtractActions(insights.actionItems); setExtracted(true); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg,#E24B4A,#D85A30)' }}
                >
                  + Extract action items ({insights.actionItems.length})
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
