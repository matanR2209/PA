import React, { useMemo } from 'react';
import type { Capture } from '../types';
import { getCategoryById } from '../components/QuickActions';
import { PAAvatar } from '../components/PAAvatar';
import { toDateStr, greeting } from '../utils/dateUtils';
import { priorityOrder, priorityBorderStyle, type Priority } from '../utils/priorityUtils';
import { computeBarDays, computeThreeDays } from '../utils/dashboardUtils';

// ── Bar chart constants ─────────────────────────────────────────────────────

const CHART_W = 280;
const CHART_H = 68;
const BAR_W   = 24;
const ZONE_W  = CHART_W / 7;

function roundedTopPath(x: number, y: number, w: number, h: number, r = 3): string {
  if (h < 1) return '';
  const cr = Math.min(r, h / 2, w / 2);
  return [
    `M ${x + cr},${y}`,
    `H ${x + w - cr}`,
    `Q ${x + w},${y} ${x + w},${y + cr}`,
    `V ${y + h}`,
    `H ${x}`,
    `V ${y + cr}`,
    `Q ${x},${y} ${x + cr},${y} Z`,
  ].join(' ');
}

function flatRect(x: number, y: number, w: number, h: number): string {
  if (h < 1) return '';
  return `M ${x},${y} H ${x + w} V ${y + h} H ${x} Z`;
}

function PriorityBadge({ priority }: { priority: Priority }): React.ReactElement | null {
  if (!priority || priority === 'low') return null;
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
      priority === 'high' ? 'bg-red-50 text-[#E24B4A]' : 'bg-orange-50 text-orange-500'
    }`}>
      {priority === 'high' ? 'High' : 'Med'}
    </span>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

interface DashboardProps {
  captures: Capture[];
}

export function Dashboard({ captures }: DashboardProps): React.ReactElement {
  const now     = useMemo(() => new Date(), []);
  const todayStr = toDateStr(now);

  // Brief data
  const urgentCaptures = captures.filter(c => (c.meta as Record<string, unknown>)?.priority === 'high');
  const mediumCaptures = captures.filter(c => (c.meta as Record<string, unknown>)?.priority === 'medium');
  const rawIdeas       = captures.filter(c => c.category === 'idea' && (c.meta as Record<string, unknown>)?.status !== 'ready');
  const dueToday       = captures.filter(c => (c.meta as Record<string, unknown>)?.dueDate === todayStr);

  // Bar chart
  const barDays  = useMemo(() => computeBarDays(captures, now),  [captures, now]);
  const maxVal   = Math.max(...barDays.map(d => d.total), 3);
  const scale    = CHART_H / maxVal;

  // 3-day list
  const threeDays = useMemo(() => computeThreeDays(captures, now), [captures, now]);

  // Build brief text
  const briefParts: React.ReactNode[] = [];
  if (urgentCaptures.length > 0)
    briefParts.push(
      <span key="u">You have{' '}
        <span className="text-[#E24B4A] font-semibold">
          {urgentCaptures.length} urgent task{urgentCaptures.length > 1 ? 's' : ''}
        </span>{' '}
        that need{urgentCaptures.length === 1 ? 's' : ''} attention
      </span>
    );
  if (mediumCaptures.length > 0)
    briefParts.push(
      <span key="m">
        <span className="text-amber-600 font-semibold">
          {mediumCaptures.length} medium-priority item{mediumCaptures.length > 1 ? 's' : ''}
        </span>{' '}
        still open
      </span>
    );
  if (rawIdeas.length > 0)
    briefParts.push(
      <span key="i">
        <span className="text-purple-600 font-semibold">
          {rawIdeas.length} idea{rawIdeas.length > 1 ? 's' : ''}
        </span>{' '}
        waiting for your review
      </span>
    );

  return (
    <div className="flex-1 overflow-y-auto p-7 bg-[#f5f5f5]">

      {/* Greeting */}
      <div className="flex items-baseline gap-3 mb-6">
        <h2 className="text-[22px] font-bold text-[#1a1a1a]">{greeting(now)} 👋</h2>
        <span className="text-[13px] text-gray-400">
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="flex gap-5 items-start">

        {/* ── PA Briefing Card ─────────────────────────────── */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">

          {/* Header */}
          <div className="flex items-center gap-3">
            <PAAvatar size="sm" animate={false} />
            <div>
              <p className="text-[13px] font-bold text-[#1a1a1a]">IdeaPA</p>
              <p className="text-[11px] text-gray-400">Your morning brief</p>
            </div>
            <span className="ml-auto text-[11px] text-gray-300">
              {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </span>
          </div>

          {/* Bubble */}
          <div className="bg-[#f8f8f8] rounded-2xl rounded-tl-sm p-4 text-[14px] text-[#444] leading-relaxed">
            {briefParts.length === 0 ? (
              <span className="text-gray-400">
                All clear — nothing urgent on your plate. A good day to explore those ideas. ✨
              </span>
            ) : (
              briefParts.map((p, i) => (
                <React.Fragment key={i}>
                  {i > 0 ? '. ' : ''}
                  {p}
                  {i === briefParts.length - 1 ? '.' : ''}
                </React.Fragment>
              ))
            )}
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2">
            {urgentCaptures.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-red-50 text-[#E24B4A] border border-red-100">
                ⚡ {urgentCaptures.length} Urgent
              </span>
            )}
            {dueToday.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                📅 {dueToday.length} Due today
              </span>
            )}
            {rawIdeas.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold bg-purple-50 text-purple-600 border border-purple-100">
                💡 {rawIdeas.length} Ideas waiting
              </span>
            )}
          </div>

          {/* Urgent list */}
          {urgentCaptures.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] uppercase tracking-widest text-gray-300 font-semibold">Needs attention</p>
              {urgentCaptures.slice(0, 5).map(c => {
                const cat      = getCategoryById(c.category);
                const priority = (c.meta as Record<string, unknown>)?.priority as Priority;
                return (
                  <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#fafafa] border border-gray-100">
                    <div className={`w-[3px] h-7 rounded-full flex-shrink-0 ${priority === 'high' ? 'bg-[#E24B4A]' : 'bg-orange-400'}`} />
                    <span className="text-[14px] flex-shrink-0">{cat?.emoji ?? '📌'}</span>
                    <span className="flex-1 text-[13px] font-medium text-[#1a1a1a] truncate">{c.title}</span>
                    <PriorityBadge priority={priority} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right column ────────────────────────────────── */}
        <div className="w-[35%] flex-shrink-0 flex flex-col gap-4">

          {/* Stacked bar chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-4">
              Upcoming week — tasks due
            </p>

            <svg
              width="100%"
              viewBox={`0 0 ${CHART_W} ${CHART_H + 20}`}
              overflow="visible"
            >
              {/* Subtle gridlines */}
              {[1, 2, 3].filter(n => n <= maxVal).map(n => (
                <line
                  key={n}
                  x1={0} y1={CHART_H - n * scale}
                  x2={CHART_W} y2={CHART_H - n * scale}
                  stroke="#f3f3f3" strokeWidth="1"
                />
              ))}

              {/* Baseline */}
              <line x1={0} y1={CHART_H} x2={CHART_W} y2={CHART_H} stroke="#ececec" strokeWidth="1.5" />

              {barDays.map((day, i) => {
                const cx      = i * ZONE_W + ZONE_W / 2;
                const bx      = cx - BAR_W / 2;
                const isToday = day.dateStr === todayStr;

                const workH  = Math.round(day.work  * scale);
                const homeH  = Math.round(day.home  * scale);
                const otherH = Math.round(day.other * scale);

                // Stack from bottom: work → home → other
                const workY  = CHART_H - workH - homeH - otherH;
                const homeY  = CHART_H - homeH - otherH;
                const otherY = CHART_H - otherH;

                const topIsWork  = workH > 0 && homeH === 0 && otherH === 0;
                const topIsHome  = homeH > 0 && otherH === 0;
                const topIsOther = otherH > 0;

                return (
                  <g key={i}>
                    {/* Today column tint */}
                    {isToday && (
                      <rect
                        x={bx - 5} y={0}
                        width={BAR_W + 10} height={CHART_H}
                        rx={4} fill="#E24B4A" opacity={0.04}
                      />
                    )}

                    {/* Work (blue) */}
                    {workH > 0 && (
                      <path
                        d={topIsWork
                          ? roundedTopPath(bx, workY, BAR_W, workH)
                          : flatRect(bx, workY, BAR_W, workH)}
                        fill="#3b82f6"
                      />
                    )}

                    {/* Home (amber) */}
                    {homeH > 0 && (
                      <path
                        d={topIsHome
                          ? roundedTopPath(bx, homeY, BAR_W, homeH)
                          : flatRect(bx, homeY, BAR_W, homeH)}
                        fill="#f59e0b"
                      />
                    )}

                    {/* Other (red) */}
                    {otherH > 0 && (
                      <path
                        d={topIsOther ? roundedTopPath(bx, otherY, BAR_W, otherH) : flatRect(bx, otherY, BAR_W, otherH)}
                        fill="#E24B4A"
                      />
                    )}

                    {/* Count above bar */}
                    {day.total > 0 && (
                      <text
                        x={cx} y={CHART_H - day.total * scale - 4}
                        textAnchor="middle" fontSize="9"
                        fill="#bbb"
                        fontFamily="-apple-system, sans-serif"
                      >
                        {day.total}
                      </text>
                    )}

                    {/* Day label */}
                    <text
                      x={cx} y={CHART_H + 14}
                      textAnchor="middle" fontSize="9"
                      fontWeight={isToday ? '700' : '400'}
                      fill={isToday ? '#E24B4A' : '#bbb'}
                      fontFamily="-apple-system, sans-serif"
                    >
                      {day.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-2">
              {[
                { color: '#3b82f6', label: 'Work' },
                { color: '#f59e0b', label: 'Home' },
                { color: '#E24B4A', label: 'Other' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[11px] text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3-day to-do */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-4">Next 3 days</p>

            <div className="flex gap-3">
              {threeDays.map((day, i) => (
                <div key={i} className="flex-1 min-w-0">
                  <p className={`text-[12px] font-bold truncate ${i === 0 ? 'text-[#E24B4A]' : 'text-[#1a1a1a]'}`}>
                    {day.label}
                  </p>
                  <p className="text-[10px] text-gray-400 mb-2.5">{day.dateLabel}</p>

                  <div className="flex flex-col gap-1.5">
                    {day.tasks.length === 0 ? (
                      <p className="text-[11px] text-gray-300 italic">Nothing due</p>
                    ) : (
                      day.tasks.map(c => {
                        const cat      = getCategoryById(c.category);
                        const priority = (c.meta as Record<string, unknown>)?.priority as Priority;
                        return (
                          <div
                            key={c.id}
                            className="bg-[#fafafa] border border-gray-100 rounded-lg px-2 py-1.5 border-l-[3px]"
                            style={priorityBorderStyle(priority)}
                          >
                            <div className="flex items-start gap-1">
                              <span className="text-[11px] leading-snug flex-shrink-0">{cat?.emoji ?? '📌'}</span>
                              <span className="text-[11px] font-medium text-[#333] leading-snug line-clamp-2">
                                {c.title}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>{/* /right-col */}
      </div>
    </div>
  );
}
