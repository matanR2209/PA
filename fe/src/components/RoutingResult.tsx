import React, { useState } from 'react';
import { PAAvatar } from './PAAvatar';
import { DEFAULT_CATEGORIES } from './QuickActions';

interface RoutingResultProps {
  type: 'idea' | 'task';
  title: string;
  preview: string;
  onConfirm: (category: string | null) => void;
  onChange: () => void;
  category: string | null;
}

export function RoutingResult({ type, title, preview, onConfirm, onChange, category }: RoutingResultProps): React.ReactElement {
  const [localCategory, setLocalCategory] = useState<string | null>(category ?? null);

  const cat = DEFAULT_CATEGORIES.find(c => c.id === localCategory);
  const isIdea = type === 'idea';
  const emoji = cat?.emoji ?? (isIdea ? '💡' : '✓');
  const label = cat?.label ?? (isIdea ? 'Idea' : 'Task');
  const bgColor = isIdea ? '#E6F1FB' : '#EAF3DE';

  return (
    <div className="flex flex-col items-center px-5 pt-6 pb-4 text-center">
      <PAAvatar size="md" />

      <p className="text-[15px] font-semibold text-[#1a1a1a] mt-4">Got it! ✨</p>
      <p className="text-[13px] text-gray-500 mt-1 mb-5">Review before saving</p>

      {/* Captured preview card */}
      <div className="w-full bg-[#f8f8f8] rounded-xl p-4 text-left mb-4">
        <div className="flex items-center gap-2.5 mb-2.5">
          <div
            className="w-7 h-7 rounded-[6px] flex items-center justify-center text-sm"
            style={{ background: bgColor }}
          >
            {emoji}
          </div>
          <span className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">
            {label}
          </span>
        </div>
        <p className="text-[14px] font-semibold text-[#1a1a1a] mb-1">{title}</p>
        <p className="text-[13px] text-gray-500 leading-snug line-clamp-3" dir="auto">{preview}</p>
      </div>

      {/* ── Category picker ── */}
      <div className="w-full mb-5">
        <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2.5 text-left">
          Save under
        </p>
        <div className="grid grid-cols-4 gap-2">
          {DEFAULT_CATEGORIES.map(c => {
            const isSelected = localCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setLocalCategory(isSelected ? null : c.id)}
                className={`
                  flex flex-col items-center justify-center gap-1.5
                  rounded-2xl py-3 px-1
                  transition-all duration-150 active:scale-95
                  ${isSelected ? 'text-white shadow-md' : 'bg-[#f5f5f5] text-gray-600'}
                `}
                style={isSelected
                  ? { background: 'linear-gradient(135deg, #E24B4A 0%, #D85A30 100%)' }
                  : {}
                }
              >
                <span className="text-[22px] leading-none">{c.emoji}</span>
                <span className={`text-[10px] font-semibold leading-tight text-center ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2.5 w-full">
        <button
          onClick={onChange}
          className="flex-1 py-3 rounded-[10px] bg-[#f0f0f0] text-[13px] font-semibold text-[#333] active:opacity-70"
        >
          Change
        </button>
        <button
          onClick={() => onConfirm(localCategory)}
          className="flex-1 py-3 rounded-[10px] text-[13px] font-semibold text-white active:opacity-80"
          style={{ background: 'linear-gradient(135deg, #E24B4A, #D85A30)' }}
        >
          Looks good
        </button>
      </div>
    </div>
  );
}
