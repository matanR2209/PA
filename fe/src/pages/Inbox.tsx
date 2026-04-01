import React, { useState } from 'react';
import { useCaptures } from '../hooks/useCaptures';
import { CaptureCard } from '../components/CaptureCard';
import { DEFAULT_CATEGORIES } from '../components/QuickActions';
import { PAAvatar } from '../components/PAAvatar';
import type { Capture, Category } from '../types';

type NavigateTarget = 'home' | 'inbox' | 'tasks' | 'search' | 'detail';

interface InboxProps {
  onNavigate: (target: NavigateTarget, data?: Capture) => void;
}

interface CategorySectionProps {
  cat: Pick<Category, 'emoji' | 'label'> & { id: string | null };
  captures: Capture[];
  onPress: (capture: Capture) => void;
}

function CategorySection({ cat, captures, onPress }: CategorySectionProps): React.ReactElement | null {
  const [open, setOpen] = useState(true);
  if (captures.length === 0) return null;

  return (
    <div className="mb-2">
      {/* Section header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-1 py-2 active:opacity-60 transition-opacity"
      >
        <span
          className="text-[13px] text-gray-400 transition-transform duration-200"
          style={{ display: 'inline-block', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >›</span>
        <span className="text-[16px] leading-none">{cat.emoji}</span>
        <span className="flex-1 text-left text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
          {cat.label}
        </span>
        <span className="text-[12px] text-gray-300 font-medium">{captures.length}</span>
      </button>

      {/* Items */}
      {open && (
        <div className="flex flex-col gap-2 pb-1">
          {captures.map(capture => (
            <CaptureCard
              key={capture.id}
              capture={capture}
              onPress={() => onPress(capture)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Inbox({ onNavigate }: InboxProps): React.ReactElement {
  const { captures } = useCaptures();

  // Captures with no category get an "uncategorised" bucket
  const uncategorised = captures.filter(c => !c.category);

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9] pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-12 pb-4 bg-white border-b border-gray-100 sticky top-0 z-10">
        <PAAvatar size="sm" animate={false} />
        <div>
          <p className="text-[13px] text-gray-500">{captures.length} captures total</p>
          <p className="text-[20px] font-bold text-[#1a1a1a]">Inbox</p>
        </div>
      </div>

      {captures.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 mt-24 px-8 text-center">
          <span className="text-[52px]">📥</span>
          <p className="text-[17px] font-semibold text-[#1a1a1a]">Your inbox is empty</p>
          <p className="text-[14px] text-gray-400 leading-relaxed">
            Go to Home and tap the record button to capture your first thought.
          </p>
        </div>
      ) : (
        <div className="px-4 pt-4">
          {DEFAULT_CATEGORIES.map(cat => {
            const catCaptures = captures.filter(c => c.category === cat.id);
            return (
              <CategorySection
                key={cat.id}
                cat={cat}
                captures={catCaptures}
                onPress={capture => onNavigate('detail', capture)}
              />
            );
          })}

          {/* Uncategorised */}
          {uncategorised.length > 0 && (
            <CategorySection
              cat={{ id: null, emoji: '🗂️', label: 'Uncategorised' }}
              captures={uncategorised}
              onPress={capture => onNavigate('detail', capture)}
            />
          )}
        </div>
      )}
    </div>
  );
}
