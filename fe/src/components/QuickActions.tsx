import React from 'react';
import type { Category } from '../types';

const STORAGE_KEY = 'ideapa_categories';

export const DEFAULT_CATEGORIES: Category[] = [
  // First 3 are mandatory — always present
  { id: 'idea',       emoji: '💡', label: 'Idea',         type: 'idea', mandatory: true  },
  { id: 'work-task',  emoji: '💼', label: 'Work',         type: 'task', mandatory: true  },
  { id: 'home-task',  emoji: '🏠', label: 'Home',         type: 'task', mandatory: true  },
  // Optional — user can remove/reorder via desktop
  { id: 'shopping',   emoji: '🛒', label: 'Shopping',     type: 'task', mandatory: false },
  { id: 'read-watch', emoji: '📖', label: 'Read / Watch', type: 'idea', mandatory: false },
  { id: 'finance',    emoji: '💰', label: 'Finance',      type: 'task', mandatory: false },
  { id: 'travel',     emoji: '✈️', label: 'Travel',       type: 'idea', mandatory: false },
  { id: 'other',      emoji: '🗒️', label: 'Other',        type: 'idea', mandatory: false },
];

export function CATEGORIES(): Category[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Category[];
  } catch (_) {}
  return DEFAULT_CATEGORIES;
}

export function getCategoryById(id: string | null): Category | undefined {
  if (!id) return undefined;
  return DEFAULT_CATEGORIES.find(c => c.id === id);
}

interface QuickActionsProps {
  selected: string | null;
  onSelect: (id: string | null) => void;
}

export function QuickActions({ selected, onSelect }: QuickActionsProps): React.ReactElement {
  const categories = CATEGORIES();

  return (
    <div className="w-full">
      {/* Horizontal scroll chip strip */}
      <div
        className="flex gap-2 overflow-x-auto px-5 pb-1"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {categories.map(({ id, emoji, label }) => {
          const isSelected = selected === id;
          return (
            <button
              key={id}
              onClick={() => onSelect(isSelected ? null : id)}
              className={`
                flex items-center gap-1.5 flex-shrink-0
                px-3.5 py-2 rounded-full
                text-[13px] font-semibold
                transition-all duration-150 active:scale-95
                ${isSelected
                  ? 'text-white shadow-sm'
                  : 'bg-[#f2f2f2] text-gray-600'
                }
              `}
              style={isSelected ? {
                background: 'linear-gradient(135deg, #E24B4A 0%, #D85A30 100%)',
              } : {}}
            >
              <span className="text-[16px] leading-none">{emoji}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="mt-2 px-5 text-[10px] text-gray-300 leading-snug">
        ✏️ Customise categories in the desktop app
      </p>
    </div>
  );
}
