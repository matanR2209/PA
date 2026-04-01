import React, { useState, useRef } from 'react';
import { useCaptures } from '../hooks/useCaptures';
import { CaptureCard } from '../components/CaptureCard';
import { DEFAULT_CATEGORIES } from '../components/QuickActions';
import type { Capture } from '../types';

type NavigateTarget = 'home' | 'inbox' | 'tasks' | 'search' | 'detail';

interface SearchProps {
  onNavigate: (target: NavigateTarget, data?: Capture) => void;
}

export function Search({ onNavigate }: SearchProps): React.ReactElement {
  const { captures } = useCaptures();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();

  const results = q.length < 2 ? [] : captures.filter(c =>
    c.title?.toLowerCase().includes(q) ||
    c.content?.toLowerCase().includes(q) ||
    DEFAULT_CATEGORIES.find(cat => cat.id === c.category)?.label.toLowerCase().includes(q)
  );

  const suggestions = ['idea', 'work', 'home', 'meeting', 'buy', 'travel', 'read'];

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9] pb-24">

      {/* Search bar */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-3">
        <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-2xl px-4 py-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
            <circle cx="10.5" cy="10.5" r="6.5" stroke="#bbb" strokeWidth="2"/>
            <path d="M15.5 15.5L20 20" stroke="#bbb" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            type="search"
            placeholder="Search captures…"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-[15px] text-[#1a1a1a] outline-none placeholder:text-gray-400"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 text-[18px] leading-none active:opacity-60">×</button>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 pt-4">

        {/* Empty — no query */}
        {!q && (
          <div className="space-y-5 mt-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-3.5 py-2 bg-white border border-gray-100 rounded-xl text-[13px] text-gray-600 font-medium shadow-sm active:bg-gray-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Browse by category</p>
              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_CATEGORIES.map(cat => {
                  const count = captures.filter(c => c.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setQuery(cat.label)}
                      className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-2xl px-3.5 py-3 shadow-sm active:bg-gray-50 text-left"
                    >
                      <span className="text-[20px]">{cat.emoji}</span>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1a1a1a]">{cat.label}</p>
                        <p className="text-[11px] text-gray-400">{count} capture{count !== 1 ? 's' : ''}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Query too short */}
        {q && q.length < 2 && (
          <p className="text-[14px] text-gray-400 text-center mt-12">Keep typing…</p>
        )}

        {/* Results */}
        {q.length >= 2 && (
          <>
            <p className="text-[12px] text-gray-400 mb-3">
              {results.length === 0
                ? `No results for "${query}"`
                : `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`
              }
            </p>

            {results.length === 0 ? (
              <div className="flex flex-col items-center mt-16 gap-3 text-center px-8">
                <span className="text-[44px]">🔍</span>
                <p className="text-[16px] font-semibold text-[#1a1a1a]">Nothing found</p>
                <p className="text-[13px] text-gray-400">Try a different word, or check the Inbox.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {results.map(capture => (
                  <CaptureCard
                    key={capture.id}
                    capture={capture}
                    onPress={() => onNavigate('detail', capture)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
