import React, { useState } from 'react';
import type { Category } from '../types';
import { DEFAULT_CATEGORIES } from '../components/QuickActions';

const STORAGE_KEY = 'ideapa_categories';

const EMOJI_PRESETS = ['💡','💼','🏠','🛒','📖','💰','✈️','🗒️','🎯','🎨','🎵','📊','🔬','🏋️','🍽️','🧩','📝','🔑','🌱','⚡'];

function loadCategories(): Category[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Category[];
  } catch (_) {}
  return DEFAULT_CATEGORIES;
}

function saveCategories(cats: Category[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
  // Also update runtime so mobile chips update on next load
}

interface DesktopSettingsProps { onBack: () => void; }

export function DesktopSettings({ onBack }: DesktopSettingsProps): React.ReactElement {
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [newEmoji, setNewEmoji] = useState('🎯');
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState<'idea' | 'task'>('idea');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleMobile(id: string): void {
    const cat = categories.find(c => c.id === id);
    if (cat?.mandatory) return;
    const next = categories.map(c => c.id === id ? { ...c, mandatory: false } : c);
    setCategories(next);
  }

  function removeCategory(id: string): void {
    const cat = categories.find(c => c.id === id);
    if (cat?.mandatory) return;
    setCategories(categories.filter(c => c.id !== id));
  }

  function addCategory(): void {
    if (!newLabel.trim()) return;
    const id = newLabel.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const cat: Category = { id, emoji: newEmoji, label: newLabel.trim(), type: newType, mandatory: false };
    setCategories([...categories, cat]);
    setNewLabel('');
    setNewEmoji('🎯');
  }

  function handleSave(): void {
    saveCategories(categories);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const enabledOnMobile = categories.filter(c => !c.mandatory && DEFAULT_CATEGORIES.find(d => d.id === c.id));
  const customCats = categories.filter(c => !DEFAULT_CATEGORIES.find(d => d.id === c.id));

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f5f5]">

      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#E24B4A] text-[14px] font-semibold hover:opacity-75 transition-opacity">
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M6 1L1 6L6 11" stroke="#E24B4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <h1 className="text-[20px] font-bold text-[#1a1a1a]">Settings</h1>
        <div className="ml-auto flex items-center gap-3">
          {saved && <span className="text-[13px] text-green-600 font-semibold">✓ Saved</span>}
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-white text-[14px] font-semibold"
            style={{ background: 'linear-gradient(135deg,#E24B4A,#D85A30)' }}
          >
            Save changes
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-7 max-w-3xl mx-auto w-full space-y-8">

        {/* Default categories */}
        <section>
          <div className="mb-4">
            <h2 className="text-[16px] font-bold text-[#1a1a1a]">Default categories</h2>
            <p className="text-[13px] text-gray-400 mt-0.5">The first 3 are mandatory and always shown on mobile.</p>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {DEFAULT_CATEGORIES.map((cat, i) => (
              <div key={cat.id} className={`flex items-center gap-4 px-5 py-4 ${i < DEFAULT_CATEGORIES.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <span className="text-[22px] w-8 text-center">{cat.emoji}</span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-[#1a1a1a]">{cat.label}</p>
                  <p className="text-[12px] text-gray-400">{cat.type}</p>
                </div>
                {cat.mandatory ? (
                  <span className="flex items-center gap-1.5 text-[12px] text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                    🔒 Mandatory
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-400">Show on mobile</span>
                    <button
                      onClick={() => toggleMobile(cat.id)}
                      className={`relative w-10 h-5.5 rounded-full transition-colors ${
                        categories.find(c => c.id === cat.id) ? 'bg-[#E24B4A]' : 'bg-gray-200'
                      }`}
                      style={{ height: 22 }}
                    >
                      <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-transform ${
                        categories.find(c => c.id === cat.id) ? 'translate-x-5' : 'translate-x-0.5'
                      }`} style={{ width: 18, height: 18 }} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Custom categories */}
        {customCats.length > 0 && (
          <section>
            <div className="mb-4">
              <h2 className="text-[16px] font-bold text-[#1a1a1a]">Custom categories</h2>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {customCats.map((cat, i) => (
                <div key={cat.id} className={`flex items-center gap-4 px-5 py-4 ${i < customCats.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <span className="text-[22px] w-8 text-center">{cat.emoji}</span>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-[#1a1a1a]">{cat.label}</p>
                    <p className="text-[12px] text-gray-400">{cat.type}</p>
                  </div>
                  <button
                    onClick={() => removeCategory(cat.id)}
                    className="text-[13px] text-red-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Add category */}
        <section>
          <div className="mb-4">
            <h2 className="text-[16px] font-bold text-[#1a1a1a]">Add custom category</h2>
            <p className="text-[13px] text-gray-400 mt-0.5">Custom categories appear in both desktop and mobile.</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            {/* Emoji picker */}
            <div>
              <p className="text-[12px] text-gray-400 mb-2">Emoji</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowEmojiPicker(p => !p)}
                  className="w-12 h-12 rounded-xl bg-[#f8f8f8] text-[24px] flex items-center justify-center border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  {newEmoji}
                </button>
                <span className="text-[12px] text-gray-400">Click to change</span>
              </div>
              {showEmojiPicker && (
                <div className="mt-2 p-3 bg-[#f8f8f8] rounded-xl flex flex-wrap gap-2">
                  {EMOJI_PRESETS.map(e => (
                    <button
                      key={e}
                      onClick={() => { setNewEmoji(e); setShowEmojiPicker(false); }}
                      className={`w-9 h-9 rounded-lg text-[20px] flex items-center justify-center hover:bg-gray-200 transition-colors ${newEmoji === e ? 'bg-gray-200' : ''}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <p className="text-[12px] text-gray-400 mb-2">Name</p>
              <input
                className="w-full bg-[#f8f8f8] rounded-xl px-4 py-3 text-[15px] text-[#1a1a1a] outline-none border border-transparent focus:border-gray-200"
                placeholder="e.g. Health, Learning, Creative…"
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addCategory(); }}
              />
            </div>

            {/* Type */}
            <div>
              <p className="text-[12px] text-gray-400 mb-2">Type</p>
              <div className="flex gap-2">
                {(['idea', 'task'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setNewType(t)}
                    className={`px-4 py-2 rounded-xl text-[13px] font-semibold border transition-colors capitalize ${
                      newType === t ? 'text-white border-transparent' : 'bg-[#f8f8f8] border-gray-200 text-gray-600'
                    }`}
                    style={newType === t ? { background: 'linear-gradient(135deg,#E24B4A,#D85A30)' } : {}}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={addCategory}
              disabled={!newLabel.trim()}
              className="w-full py-3 rounded-xl text-white text-[14px] font-semibold disabled:opacity-40 transition-opacity"
              style={{ background: 'linear-gradient(135deg,#E24B4A,#D85A30)' }}
            >
              + Add category
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
