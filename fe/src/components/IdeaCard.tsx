import React from 'react';
import type { Capture } from '../types';

interface IdeaCardProps {
  idea: Capture;
  onPress: () => void;
  onRecord?: () => void;
  compact?: boolean;
}

export function IdeaCard({ idea, onPress, onRecord, compact = false }: IdeaCardProps): React.ReactElement {
  const date = new Date(idea.createdAt);
  const timeStr = date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
  const recCount = idea.recordings?.length ?? 0;
  const meta = recCount > 0
    ? `${recCount} הקלטות · ${dateStr}`
    : `${dateStr} · ${timeStr}`;

  return (
    <div
      className="bg-[#f8f8f8] rounded-xl p-3.5 flex items-center gap-3 active:bg-[#f0f0f0] transition-colors"
      onClick={onPress}
    >
      {/* Record dot button on the left */}
      <button
        onClick={e => { e.stopPropagation(); onRecord?.(); }}
        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0"
      >
        <div className="w-3.5 h-3.5 rounded-full bg-[#E24B4A]" />
      </button>

      {/* Text — RTL */}
      <div className="flex-1 text-right" dir="rtl">
        <p className="text-[15px] font-semibold text-[#1a1a1a] leading-snug line-clamp-1">
          {idea.title}
        </p>
        {!compact && idea.content && (
          <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-1">{idea.content}</p>
        )}
        <p className="text-[11px] text-gray-400 mt-0.5">{meta}</p>
      </div>
    </div>
  );
}
