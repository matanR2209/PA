import React, { useState, useEffect } from 'react';
import { PAAvatar } from '../components/PAAvatar';
import { useCaptures } from '../hooks/useCaptures';
import { DEFAULT_CATEGORIES } from '../components/QuickActions';
import { PanelRouter } from '../panels/PanelRouter';
import { DesktopSettings } from './DesktopSettings';
import { Dashboard } from './Dashboard';
import type { Capture, Category } from '../types';

const CAT_STORAGE_KEY = 'ideapa_categories';

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

// ── Sidebar item ───────────────────────────────────────────────────────────

interface SidebarItemProps {
  capture: Capture;
  active: boolean;
  onSelect: () => void;
}

function SidebarItem({ capture, active, onSelect }: SidebarItemProps): React.ReactElement {
  const priority = (capture.meta as Record<string, unknown>)?.priority as string | undefined;
  const priorityStripe =
    priority === 'high'   ? 'border-l-[3px] border-[#E24B4A]' :
    priority === 'medium' ? 'border-l-2 border-orange-400' :
    'border-l-[3px] border-transparent';

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 transition-colors group ${
        active ? 'bg-[#E6F1FB]' : 'hover:bg-gray-50'
      } ${priorityStripe}`}
    >
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-[#185FA5]' : 'bg-[#E24B4A]'}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] font-medium truncate leading-snug ${active ? 'text-[#185FA5]' : 'text-[#1a1a1a]'}`}>
          {capture.title}
        </p>
        <p className="text-[11px] text-gray-400">{fmtDate(capture.updatedAt ?? capture.createdAt)}</p>
      </div>
    </button>
  );
}

// ── Category group ─────────────────────────────────────────────────────────

interface CategoryGroupProps {
  cat: Category;
  captures: Capture[];
  activeId?: string;
  onSelect: (c: Capture) => void;
  enabled: boolean;
  onToggleEnabled: (id: string) => void;
}

function CategoryGroup({ cat, captures, activeId, onSelect, enabled, onToggleEnabled }: CategoryGroupProps): React.ReactElement {
  const [open, setOpen] = useState(true);
  const catCaptures = captures.filter(c => c.category === cat.id);

  return (
    <div className="mb-1">
      <div
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
      >
        <span
          className="text-[13px] text-gray-400 w-3.5 text-center transition-transform duration-150"
          style={{ display: 'inline-block', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}
        >›</span>
        <span className="text-[15px] leading-none">{cat.emoji}</span>
        <span className="flex-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{cat.label}</span>
        {catCaptures.length > 0 && (
          <span className="text-[11px] text-gray-300 font-medium">{catCaptures.length}</span>
        )}
        {!cat.mandatory ? (
          <button
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onToggleEnabled(cat.id); }}
            title={enabled ? 'Visible on mobile' : 'Hidden on mobile'}
            className={`ml-0.5 w-4 h-4 rounded flex items-center justify-center text-[9px] transition-colors ${
              enabled ? 'text-green-500 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'
            }`}
          >
            ●
          </button>
        ) : (
          <span className="ml-0.5 text-[9px] text-gray-300" title="Mandatory">🔒</span>
        )}
      </div>

      {open && (
        <div className="ml-4 mt-0.5">
          {catCaptures.length === 0 ? (
            <p className="text-[11px] text-gray-300 px-3 py-1.5 italic">No captures yet</p>
          ) : (
            catCaptures.map(c => (
              <SidebarItem
                key={c.id}
                capture={c}
                active={activeId === c.id}
                onSelect={() => onSelect(c)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Desktop root ───────────────────────────────────────────────────────────

export function Desktop(): React.ReactElement {
  const { captures, updateCapture } = useCaptures();
  const [activeCapture, setActiveCapture] = useState<Capture | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [enabledCategories, setEnabledCategories] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(CAT_STORAGE_KEY);
      if (stored) return (JSON.parse(stored) as Category[]).map(c => c.id);
    } catch (_) {}
    return DEFAULT_CATEGORIES.map(c => c.id);
  });

  // Sync active capture when data changes (e.g. another tab)
  useEffect(() => {
    if (activeCapture) {
      const fresh = captures.find(c => c.id === activeCapture.id);
      if (fresh) setActiveCapture(fresh);
    }
  }, [captures]);

  function toggleCategory(id: string): void {
    const cat = DEFAULT_CATEGORIES.find(c => c.id === id);
    if (cat?.mandatory) return;
    const next = enabledCategories.includes(id)
      ? enabledCategories.filter(c => c !== id)
      : [...enabledCategories, id];
    setEnabledCategories(next);
    const full = DEFAULT_CATEGORIES.filter(c => next.includes(c.id));
    localStorage.setItem(CAT_STORAGE_KEY, JSON.stringify(full));
  }

  function handleUpdate(updated: Capture): void {
    updateCapture(updated);
    setActiveCapture(updated);
  }

  if (showSettings) {
    return <DesktopSettings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="flex h-screen bg-[#f5f5f5] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-[260px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col">

        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
          <PAAvatar size="sm" animate={false} />
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-[#1a1a1a]">IdeaPA</p>
            <p className="text-[11px] text-gray-400">Desktop</p>
          </div>
        </div>

        {/* Home button */}
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={() => setActiveCapture(null)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-semibold transition-colors ${
              !activeCapture
                ? 'bg-[#E6F1FB] text-[#185FA5]'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
            Home
          </button>
        </div>

        {/* Category list */}
        <div className="flex-1 overflow-y-auto py-2 px-2">
          {DEFAULT_CATEGORIES.map(cat => (
            <CategoryGroup
              key={cat.id}
              cat={cat}
              captures={captures}
              activeId={activeCapture?.id}
              onSelect={setActiveCapture}
              enabled={enabledCategories.includes(cat.id)}
              onToggleEnabled={toggleCategory}
            />
          ))}
        </div>

        {/* Configure + footer */}
        <div className="px-3 py-3 border-t border-gray-100 space-y-2">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[13px] font-semibold text-gray-600 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2"/>
            </svg>
            Configure
          </button>
          <p className="text-[10px] text-gray-300 text-center">
            ● visible on mobile &nbsp;·&nbsp; 🔒 mandatory
          </p>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-hidden flex flex-col">

        {/* Top bar */}
        <header className="h-11 bg-white border-b border-gray-100 flex items-center px-6 gap-3">
          {activeCapture ? (
            <>
              {DEFAULT_CATEGORIES.find(c => c.id === activeCapture.category) && (
                <span className="text-[16px]">
                  {DEFAULT_CATEGORIES.find(c => c.id === activeCapture.category)?.emoji}
                </span>
              )}
              <span className="text-[14px] font-semibold text-[#1a1a1a] truncate flex-1">
                {activeCapture.title}
              </span>
              <span className="text-[12px] text-gray-400 flex-shrink-0">
                {fmtDate(activeCapture.updatedAt ?? activeCapture.createdAt)}
              </span>
            </>
          ) : (
            <span className="text-[14px] text-gray-400">No capture selected</span>
          )}
        </header>

        {activeCapture ? (
          <div className="flex-1 overflow-hidden">
            <PanelRouter
              capture={activeCapture}
              onUpdate={handleUpdate}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <Dashboard captures={captures} />
          </div>
        )}
      </main>
    </div>
  );
}
