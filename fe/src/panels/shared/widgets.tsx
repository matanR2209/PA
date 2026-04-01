import React, { useState, useEffect, useRef } from 'react';

// ── Section wrapper ────────────────────────────────────────────────────────

interface SectionProps { title: string; children: React.ReactNode; }
export function Section({ title, children }: SectionProps): React.ReactElement {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-2.5">{title}</p>
      {children}
    </div>
  );
}

// ── Status selector ────────────────────────────────────────────────────────

interface StatusOption { value: string; label: string; color: string; }
interface StatusProps { options: StatusOption[]; value?: string; onChange: (v: string) => void; }
export function StatusWidget({ options, value, onChange }: StatusProps): React.ReactElement {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors ${
            value === o.value
              ? `${o.color} text-white border-transparent`
              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Priority selector ──────────────────────────────────────────────────────

const PRIORITIES = [
  { value: 'low',    label: '↓ Low',    color: 'bg-gray-400' },
  { value: 'medium', label: '→ Medium', color: 'bg-amber-400' },
  { value: 'high',   label: '↑ High',   color: 'bg-[#E24B4A]' },
];
interface PriorityProps { value?: string; onChange: (v: string) => void; }
export function PriorityWidget({ value, onChange }: PriorityProps): React.ReactElement {
  return <StatusWidget options={PRIORITIES} value={value} onChange={onChange} />;
}

// ── Tags input ─────────────────────────────────────────────────────────────

interface TagsProps { tags?: string[]; onChange: (tags: string[]) => void; placeholder?: string; }
export function TagsWidget({ tags = [], onChange, placeholder = 'Add tag…' }: TagsProps): React.ReactElement {
  const [input, setInput] = useState('');
  function add(): void {
    const t = input.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  }
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map(t => (
          <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded-full text-[12px] text-gray-600 font-medium">
            {t}
            <button onClick={() => onChange(tags.filter(x => x !== t))} className="text-gray-400 hover:text-gray-600 ml-0.5 leading-none">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 bg-[#f8f8f8] rounded-lg px-3 py-2 text-[13px] outline-none border border-transparent focus:border-gray-200 placeholder:text-gray-300"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add(); }}
        />
        <button onClick={add} className="px-3 py-2 bg-gray-100 rounded-lg text-[13px] text-gray-500 hover:bg-gray-200 font-semibold">+ Add</button>
      </div>
    </div>
  );
}

// ── Date input ─────────────────────────────────────────────────────────────

interface DateProps { value?: string; onChange: (v: string) => void; label?: string; }
export function DateWidget({ value, onChange, label = 'Due date' }: DateProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between bg-[#f8f8f8] rounded-xl px-4 py-3">
      <span className="text-[13px] text-gray-500">{label}</span>
      <input
        type="date"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="text-[13px] font-medium text-[#1a1a1a] bg-transparent outline-none"
      />
    </div>
  );
}

// ── Text field ─────────────────────────────────────────────────────────────

interface TextFieldProps { value?: string; onChange: (v: string) => void; placeholder?: string; label: string; }
export function TextField({ value, onChange, placeholder, label }: TextFieldProps): React.ReactElement {
  return (
    <div className="bg-[#f8f8f8] rounded-xl px-4 py-3">
      <p className="text-[11px] text-gray-400 mb-1">{label}</p>
      <input
        className="w-full bg-transparent text-[14px] text-[#1a1a1a] outline-none placeholder:text-gray-300"
        placeholder={placeholder}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

// ── Number field ───────────────────────────────────────────────────────────

interface NumberFieldProps { value?: number; onChange: (v: number) => void; label: string; prefix?: string; suffix?: string; }
export function NumberField({ value, onChange, label, prefix, suffix }: NumberFieldProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between bg-[#f8f8f8] rounded-xl px-4 py-3">
      <span className="text-[13px] text-gray-500">{label}</span>
      <div className="flex items-center gap-1.5">
        {prefix && <span className="text-[13px] text-gray-400">{prefix}</span>}
        <input
          type="number"
          className="w-20 text-right text-[14px] font-medium text-[#1a1a1a] bg-transparent outline-none"
          value={value ?? ''}
          onChange={e => onChange(Number(e.target.value))}
        />
        {suffix && <span className="text-[13px] text-gray-400">{suffix}</span>}
      </div>
    </div>
  );
}

// ── Slider ─────────────────────────────────────────────────────────────────

interface SliderProps { value?: number; min?: number; max?: number; onChange: (v: number) => void; label: string; renderValue?: (v: number) => string; }
export function SliderWidget({ value = 5, min = 1, max = 10, onChange, label, renderValue }: SliderProps): React.ReactElement {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[13px] text-gray-500">{label}</span>
        <span className="text-[13px] font-bold text-[#E24B4A]">{renderValue ? renderValue(value) : value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-[#E24B4A]"
      />
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-gray-300">{min}</span>
        <span className="text-[10px] text-gray-300">{max}</span>
      </div>
    </div>
  );
}

// ── Innovation Meter ────────────────────────────────────────────────────────

import { useInnovationScore } from '../../hooks/useInnovationScore.js';
import { useLabels } from '../../hooks/useLabels.js';

const BLOCK_COLORS = [
  'bg-gray-300',    // 1
  'bg-gray-300',    // 2
  'bg-yellow-400',  // 3
  'bg-yellow-400',  // 4
  'bg-amber-400',   // 5
  'bg-amber-400',   // 6
  'bg-orange-500',  // 7
  'bg-orange-500',  // 8
  'bg-[#E24B4A]',   // 9
  'bg-[#E24B4A]',   // 10
];

const MIN_CONTENT = 40;

interface InnovationMeterProps {
  value: number;
  onChange: (v: number) => void;
  title: string;
  content: string;
  label: string;
  renderValue: (v: number) => string;
}

export function InnovationMeterWidget({ value, onChange, title, content, label, renderValue }: InnovationMeterProps): React.ReactElement {
  const canScore = content.trim().length >= MIN_CONTENT;
  const { score: aiScore, reasoning, state, error, run, reset } = useInnovationScore();
  const [displayScore, setDisplayScore] = useState(value);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep displayScore synced with manual value when no AI result is pending
  useEffect(() => {
    if (aiScore === null) setDisplayScore(value);
  }, [value, aiScore]);

  // Animate blocks when AI result arrives
  useEffect(() => {
    if (aiScore === null || state !== 'done') return;
    if (animRef.current) clearInterval(animRef.current);
    let current = value;
    const target = aiScore;
    const dir = target >= current ? 1 : -1;
    if (current === target) { setDisplayScore(target); return; }
    animRef.current = setInterval(() => {
      current += dir;
      setDisplayScore(current);
      if (current === target) {
        clearInterval(animRef.current!);
        animRef.current = null;
      }
    }, 90);
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [aiScore, state]);

  function handleAccept(): void {
    if (aiScore !== null) onChange(aiScore);
    reset();
  }

  function handleDismiss(): void {
    reset();
    setDisplayScore(value);
  }

  const isAnimating = animRef.current !== null;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-gray-500">{label}</span>
        <button
          onClick={() => run(title, content)}
          disabled={!canScore || state === 'loading'}
          title={!canScore ? 'Add more detail to enable AI scoring' : 'Score with AI'}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold border transition-all shadow-sm ${
            !canScore
              ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed shadow-none'
              : state === 'loading'
              ? 'bg-amber-100 text-amber-400 border-amber-200 cursor-wait shadow-none'
              : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white border-transparent hover:from-amber-500 hover:to-orange-500 shadow-amber-200'
          }`}
        >
          {state === 'loading' ? (
            <span className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <span key={i} className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
          ) : (
            <>✨ Score</>
          )}
        </button>
      </div>

      {/* Segmented bar */}
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`flex-1 h-8 rounded-lg transition-all duration-100 ${
              i < displayScore ? BLOCK_COLORS[i] : 'bg-gray-100'
            } ${isAnimating && i === displayScore - 1 ? 'scale-y-110' : ''}`}
          />
        ))}
      </div>

      {/* Score label */}
      <p className="text-[13px] font-bold text-[#E24B4A]">{renderValue(displayScore || value)}</p>

      {/* AI reasoning card */}
      {state === 'done' && reasoning && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#D97706] flex items-center justify-center text-white text-[9px] font-bold shrink-0">C</div>
            <span className="text-[11px] font-semibold text-amber-700">Claude scored this {aiScore}/10</span>
          </div>
          <p className="text-[12px] text-amber-800 leading-relaxed">{reasoning}</p>
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#D97706,#B45309)' }}
            >
              ✓ Accept {aiScore}
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {state === 'error' && error && (
        <div className="space-y-1">
          <p className="text-[12px] text-red-500">{error}</p>
          <button onClick={() => run(title, content)} className="text-[11px] text-amber-600 font-semibold hover:underline">Try again</button>
        </div>
      )}
    </div>
  );
}

// ── AI Says ────────────────────────────────────────────────────────────────

import { useAnalyse } from '../../hooks/useAnalyse.js';

interface AISaysProps {
  title: string;
  content: string;
  cached?: string;
  onCache: (prose: string, actions: string[]) => void;
  onExtractActions: (actions: string[]) => void;
  hasActions: boolean;
}

export function AISaysWidget({ title, content, cached, onCache, onExtractActions, hasActions }: AISaysProps): React.ReactElement {
  const { prose, actions, state, error, run, stop, reset } = useAnalyse(onCache);

  const displayProse = state === 'idle' ? cached : prose;
  const isActive = state === 'loading' || state === 'streaming';
  const isDone = state === 'done';
  const canExtract = (isDone && actions.length > 0) || (state === 'idle' && cached && !hasActions);

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-[#D97706] flex items-center justify-center text-white text-[10px] font-bold">C</div>
        <span className="text-[12px] font-semibold text-amber-700">Claude says</span>
        {isActive && (
          <span className="ml-1 flex gap-0.5">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-1 h-1 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
        )}
        <div className="ml-auto flex gap-2">
          {isActive ? (
            <button onClick={stop} className="text-[11px] text-amber-500 hover:text-amber-700 font-semibold">Stop</button>
          ) : displayProse ? (
            <button onClick={() => { reset(); setTimeout(() => run(title, content), 0); }} className="text-[11px] text-amber-500 hover:text-amber-700 font-semibold">Re-analyse</button>
          ) : null}
        </div>
      </div>

      {/* Prose */}
      {error ? (
        <div className="space-y-2">
          <p className="text-[12px] text-red-500">{error}</p>
          <button onClick={() => run(title, content)} className="text-[11px] text-amber-600 font-semibold hover:underline">Try again</button>
        </div>
      ) : displayProse ? (
        <p className="text-[13px] text-amber-800 leading-relaxed whitespace-pre-wrap">{displayProse}</p>
      ) : (
        <div className="space-y-2">
          <p className="text-[13px] text-amber-500 italic">Get Claude's take on market potential, risks, and next steps.</p>
          <button
            onClick={() => run(title, content)}
            disabled={!content.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#D97706,#B45309)' }}
          >
            Analyse →
          </button>
        </div>
      )}

      {/* Extract action items */}
      {canExtract && !hasActions && (
        <button
          onClick={() => onExtractActions(actions)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-amber-200 bg-white text-[12px] font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Extract action items
        </button>
      )}
      {hasActions && (
        <p className="text-[11px] text-amber-400 text-center">✓ Action items added to this capture</p>
      )}
    </div>
  );
}

// ── Checklist ──────────────────────────────────────────────────────────────

interface ChecklistProps { items?: string[]; onChange: (items: string[]) => void; placeholder?: string; label?: string; }
export function ChecklistWidget({ items = [], onChange, placeholder = 'Add step…', label }: ChecklistProps): React.ReactElement {
  const [input, setInput] = useState('');
  function add(): void {
    const t = input.trim();
    if (t) { onChange([...items, t]); setInput(''); }
  }
  return (
    <div>
      {label && <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2.5">{label}</p>}
      <div className="space-y-1.5 mb-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 bg-[#f8f8f8] rounded-lg px-3 py-2.5">
            <span className="text-[11px] text-gray-400 font-mono w-4 text-right">{i + 1}.</span>
            <span className="flex-1 text-[13px] text-[#333]">{item}</span>
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 text-[15px] leading-none">×</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 bg-[#f8f8f8] rounded-lg px-3 py-2 text-[13px] outline-none border border-transparent focus:border-gray-200 placeholder:text-gray-300"
          placeholder={placeholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add(); }}
        />
        <button onClick={add} className="px-3 py-2 bg-gray-100 rounded-lg text-[13px] text-gray-500 hover:bg-gray-200 font-semibold">+ Add</button>
      </div>
    </div>
  );
}

// ── Shopping item list ─────────────────────────────────────────────────────

import type { ShoppingItem } from '../../types/capture.types';

interface ShoppingListProps { items?: ShoppingItem[]; onChange: (items: ShoppingItem[]) => void; }
export function ShoppingListWidget({ items = [], onChange }: ShoppingListProps): React.ReactElement {
  const [input, setInput] = useState('');
  function add(): void {
    const t = input.trim();
    if (t) {
      onChange([...items, { id: Date.now().toString(), name: t, qty: 1, checked: false }]);
      setInput('');
    }
  }
  function toggle(id: string): void {
    onChange(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  }
  function remove(id: string): void {
    onChange(items.filter(i => i.id !== id));
  }
  function setQty(id: string, qty: number): void {
    onChange(items.map(i => i.id === id ? { ...i, qty } : i));
  }
  return (
    <div>
      <div className="space-y-1.5 mb-2">
        {items.map(item => (
          <div key={item.id} className={`flex items-center gap-2.5 bg-[#f8f8f8] rounded-lg px-3 py-2.5 ${item.checked ? 'opacity-50' : ''}`}>
            <button onClick={() => toggle(item.id)} className={`w-4.5 h-4.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300 bg-white'}`}>
              {item.checked && <span className="text-white text-[10px]">✓</span>}
            </button>
            <span className={`flex-1 text-[13px] ${item.checked ? 'line-through text-gray-400' : 'text-[#333]'}`}>{item.name}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setQty(item.id, Math.max(1, item.qty - 1))} className="w-5 h-5 rounded bg-gray-200 text-[12px] font-bold text-gray-600 leading-none hover:bg-gray-300">−</button>
              <span className="text-[12px] w-4 text-center font-medium">{item.qty}</span>
              <button onClick={() => setQty(item.id, item.qty + 1)} className="w-5 h-5 rounded bg-gray-200 text-[12px] font-bold text-gray-600 leading-none hover:bg-gray-300">+</button>
            </div>
            <button onClick={() => remove(item.id)} className="text-gray-300 hover:text-red-400 text-[15px] leading-none">×</button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 bg-[#f8f8f8] rounded-lg px-3 py-2 text-[13px] outline-none border border-transparent focus:border-gray-200 placeholder:text-gray-300"
          placeholder="Add item…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add(); }}
        />
        <button onClick={add} className="px-3 py-2 bg-gray-100 rounded-lg text-[13px] text-gray-500 hover:bg-gray-200 font-semibold">+ Add</button>
      </div>
    </div>
  );
}

// ── Labels ──────────────────────────────────────────────────────────────────

interface LabelsWidgetProps {
  selectedIds?: string[];
  onChange: (ids: string[]) => void;
}

export function LabelsWidget({ selectedIds = [], onChange }: LabelsWidgetProps): React.ReactElement {
  const { labels, createLabel } = useLabels();
  const [input, setInput] = useState('');

  const inputTrimmed = input.trim();
  const matchesExisting = labels.some(l => l.name.toLowerCase() === inputTrimmed.toLowerCase());
  const filtered = inputTrimmed
    ? labels.filter(l => l.name.toLowerCase().includes(inputTrimmed.toLowerCase()))
    : labels;

  function toggleLabel(id: string): void {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  function handleCreate(): void {
    if (!inputTrimmed || matchesExisting) return;
    const label = createLabel(inputTrimmed);
    onChange([...selectedIds, label.id]);
    setInput('');
  }

  return (
    <div className="space-y-3">
      {filtered.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filtered.map(label => {
            const selected = selectedIds.includes(label.id);
            return (
              <button
                key={label.id}
                onClick={() => toggleLabel(label.id)}
                className={`flex items-center gap-1.5 pl-2 pr-2.5 py-1 rounded-full text-[12px] font-semibold border transition-all ${
                  selected
                    ? 'text-white border-transparent'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
                style={selected ? { backgroundColor: label.color, borderColor: label.color } : {}}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: selected ? 'rgba(255,255,255,0.55)' : label.color }}
                />
                {label.name}
                {selected && <span className="ml-0.5 opacity-75 text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="flex-1 bg-[#f8f8f8] rounded-lg px-3 py-2 text-[13px] outline-none border border-transparent focus:border-gray-200 placeholder:text-gray-300"
          placeholder={labels.length === 0 ? 'Create a label…' : 'Find or create…'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleCreate(); }}
        />
        {inputTrimmed && !matchesExisting && (
          <button
            onClick={handleCreate}
            className="px-3 py-2 rounded-lg text-[12px] font-semibold text-white flex-shrink-0 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg,#E24B4A,#D85A30)' }}
          >
            + Create
          </button>
        )}
      </div>
    </div>
  );
}
