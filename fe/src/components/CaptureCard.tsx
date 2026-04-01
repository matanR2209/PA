import React from 'react';
import type { Capture } from '../types';
import { DEFAULT_CATEGORIES } from './QuickActions';

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

interface CaptureCardProps {
  capture: Capture;
  onPress: () => void;
}

export function CaptureCard({ capture, onPress }: CaptureCardProps): React.ReactElement {
  const cat = DEFAULT_CATEGORIES.find(c => c.id === capture.category);

  return (
    <div
      onClick={onPress}
      className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 flex items-center gap-3 active:bg-gray-50 transition-colors shadow-sm"
    >
      {/* Category icon */}
      <div className="w-10 h-10 rounded-xl bg-[#f5f5f5] flex items-center justify-center flex-shrink-0 text-[20px]">
        {cat?.emoji ?? '📝'}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-[#1a1a1a] leading-snug truncate">
          {capture.title}
        </p>
        {capture.content && (
          <p className="text-[12px] text-gray-400 mt-0.5 line-clamp-1" dir="auto">
            {capture.content}
          </p>
        )}
        <div className="flex items-center gap-1.5 mt-1">
          {cat && <span className="text-[10px] text-gray-400">{cat.label}</span>}
          {cat && <span className="text-[10px] text-gray-300">·</span>}
          <span className="text-[10px] text-gray-400">{fmtDate(capture.createdAt)}</span>
          {capture.recordings?.length > 0 && (
            <>
              <span className="text-[10px] text-gray-300">·</span>
              <span className="text-[10px] text-[#E24B4A]">🎤 {capture.recordings.length}</span>
            </>
          )}
        </div>
      </div>

      {/* Chevron */}
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="flex-shrink-0">
        <path d="M1 1L6 6L1 11" stroke="#ccc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}
