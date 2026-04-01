import React, { useState } from 'react';
import { useCaptures } from '../hooks/useCaptures';
import { useRecorder } from '../hooks/useRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { DEFAULT_CATEGORIES } from '../components/QuickActions';
import { BottomSheet } from '../components/BottomSheet';
import { TaskSchedulerSheet } from '../components/TaskSchedulerSheet';
import type { Capture, Task } from '../types';

type SheetType = 'actions' | 'task' | 'category' | 'delete' | null;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/* ─── Small action row button ─────────────────────────── */
interface SheetActionProps {
  emoji: string;
  label: string;
  sublabel?: string;
  danger?: boolean;
  onClick: () => void;
}

function SheetAction({ emoji, label, sublabel, danger, onClick }: SheetActionProps): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 active:bg-gray-50 transition-colors ${danger ? 'text-red-500' : 'text-[#1a1a1a]'}`}
    >
      <span className="text-[24px] w-8 text-center">{emoji}</span>
      <div className="text-left">
        <p className={`text-[15px] font-semibold ${danger ? 'text-red-500' : 'text-[#1a1a1a]'}`}>{label}</p>
        {sublabel && <p className="text-[12px] text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
    </button>
  );
}

/* ─── Category picker sheet ───────────────────────────── */
interface CategoryPickerProps {
  current: string | null;
  onPick: (id: string) => void;
  onClose: () => void;
}

function CategoryPicker({ current, onPick, onClose }: CategoryPickerProps): React.ReactElement {
  return (
    <div className="px-4 py-3 grid grid-cols-2 gap-2">
      {DEFAULT_CATEGORIES.map(cat => {
        const isActive = cat.id === current;
        return (
          <button
            key={cat.id}
            onClick={() => { onPick(cat.id); onClose(); }}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all active:scale-95 ${
              isActive
                ? 'border-[#E24B4A] bg-[#fff4f4]'
                : 'border-gray-100 bg-[#f9f9f9]'
            }`}
          >
            <span className="text-[22px]">{cat.emoji}</span>
            <span className={`text-[13px] font-semibold ${isActive ? 'text-[#E24B4A]' : 'text-[#1a1a1a]'}`}>
              {cat.label}
            </span>
            {isActive && <span className="ml-auto text-[#E24B4A] text-[16px]">✓</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Delete confirm sheet ────────────────────────────── */
interface DeleteConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirm({ onConfirm, onCancel }: DeleteConfirmProps): React.ReactElement {
  return (
    <div className="px-6 pt-4 pb-2 space-y-3">
      <p className="text-[15px] text-gray-600 text-center leading-relaxed">
        This capture will be permanently removed. This cannot be undone.
      </p>
      <button
        onClick={onConfirm}
        className="w-full py-4 rounded-2xl bg-red-500 text-white text-[16px] font-bold active:opacity-80 transition-opacity"
      >
        Delete Capture
      </button>
      <button
        onClick={onCancel}
        className="w-full py-3.5 rounded-2xl bg-[#f0f0f0] text-[15px] font-semibold text-gray-600 active:opacity-80"
      >
        Cancel
      </button>
    </div>
  );
}

/* ─── Main component ──────────────────────────────────── */
interface CaptureDetailProps {
  capture: Capture;
  onBack: () => void;
}

export function CaptureDetail({ capture: initial, onBack }: CaptureDetailProps): React.ReactElement {
  const { updateCapture, removeCapture, addNote } = useCaptures();
  const [capture, setCapture] = useState<Capture>(initial);

  // Editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitleText, setEditTitleText] = useState(initial.title);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(initial.content);

  // Add-more state
  const [addedNote, setAddedNote] = useState('');
  const [capturedNote, setCapturedNote] = useState('');

  // Sheet state
  const [sheet, setSheet] = useState<SheetType>(null);

  const { isRecording, startRecording, stopRecording } = useRecorder();
  const { isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  const cat = DEFAULT_CATEGORIES.find(c => c.id === capture.category);

  /* ── Recording add-more ── */
  async function handleRecordPress(): Promise<void> {
    if (isRecording) {
      const [, text] = await Promise.all([
        stopRecording(),
        isSupported ? stopListening() : Promise.resolve(''),
      ]);
      if (text && text.trim()) setCapturedNote(text.trim());
    } else {
      await startRecording();
      if (isSupported) startListening();
    }
  }

  /* ── Save title edit ── */
  function handleSaveTitle(): void {
    if (!editTitleText.trim()) return;
    const updated = { ...capture, title: editTitleText.trim() };
    updateCapture(updated);
    setCapture(updated);
    setEditingTitle(false);
  }

  /* ── Save content edit ── */
  function handleSaveEdit(): void {
    const updated = { ...capture, content: editText };
    updateCapture(updated);
    setCapture(updated);
    setEditing(false);
  }

  /* ── Add note via dedicated endpoint ── */
  async function handleAddNote(): Promise<void> {
    const text = (capturedNote || addedNote).trim();
    if (!text) return;
    await addNote(capture.id, text);
    // Refresh local state so the new note card appears immediately
    setCapture(prev => ({
      ...prev,
      notes: [...(prev.notes ?? []), { id: `temp_${Date.now()}`, text, createdAt: new Date().toISOString() }],
    }));
    resetTranscript();
    setCapturedNote('');
    setAddedNote('');
  }

  /* ── Move category ── */
  function handleMoveCategory(categoryId: string): void {
    const updated = { ...capture, category: categoryId };
    updateCapture(updated);
    setCapture(updated);
  }

  /* ── Schedule as task ── */
  function handleScheduleTask(taskData: Task): void {
    const updated = { ...capture, task: taskData };
    updateCapture(updated);
    setCapture(updated);
    setSheet(null);
  }

  /* ── Delete ── */
  function handleDelete(): void {
    removeCapture(capture.id);
    onBack();
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9]">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 bg-white border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[#E24B4A] text-[15px] font-semibold py-1 px-1 active:opacity-60"
        >
          <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
            <path d="M7 1L1 7L7 13" stroke="#E24B4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        <p className="text-[15px] font-bold text-[#1a1a1a] absolute left-1/2 -translate-x-1/2">
          {cat ? `${cat.emoji} ${cat.label}` : 'Capture'}
        </p>

        {/* ⋯ menu */}
        <button
          onClick={() => setSheet('actions')}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 active:bg-gray-100 text-[22px] font-bold"
        >
          ⋯
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-8 space-y-4">

        {/* Title + date */}
        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm">
          {editingTitle ? (
            <div className="space-y-2">
              <input
                className="w-full text-[20px] font-bold text-[#1a1a1a] bg-[#f8f8f8] rounded-xl px-3 py-2 outline-none border border-[#E24B4A]/30"
                value={editTitleText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitleText(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                dir="auto"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveTitle}
                  className="flex-1 py-2 rounded-xl text-white text-[13px] font-semibold"
                  style={{ background: 'linear-gradient(135deg,#E24B4A,#D85A30)' }}
                >Save</button>
                <button
                  onClick={() => { setEditTitleText(capture.title); setEditingTitle(false); }}
                  className="flex-1 py-2 rounded-xl bg-[#f0f0f0] text-[13px] font-semibold text-gray-600"
                >Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-[20px] font-bold text-[#1a1a1a] leading-snug flex-1" dir="auto">
                {capture.title}
              </h1>
              <button
                onClick={() => { setEditTitleText(capture.title); setEditingTitle(true); }}
                className="text-[12px] text-[#E24B4A] font-semibold flex-shrink-0 mt-1 active:opacity-60"
              >
                Edit
              </button>
            </div>
          )}
          <p className="text-[12px] text-gray-400 mt-1">{fmtDate(capture.createdAt)}</p>
        </div>

        {/* Task badge */}
        {capture.task && (
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
            <span className="text-[22px]">📋</span>
            <div className="flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Task</p>
              {capture.task.type === 'scheduled' ? (
                <p className="text-[14px] font-semibold text-[#1a1a1a]">
                  {new Date(capture.task.scheduledAt!).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              ) : (
                <p className="text-[14px] font-semibold text-[#1a1a1a]">
                  Flexible · {capture.task.duration}min · {new Date(capture.task.rangeFrom!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(capture.task.rangeTo!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
            <button
              onClick={() => setSheet('task')}
              className="text-[12px] text-[#E24B4A] font-semibold active:opacity-60"
            >
              Edit
            </button>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Content</p>
            {!editing && (
              <button
                onClick={() => { setEditText(capture.content); setEditing(true); }}
                className="text-[13px] text-[#E24B4A] font-semibold active:opacity-60"
              >
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <div className="px-4 pb-4 space-y-3">
              <textarea
                className="w-full bg-[#f8f8f8] rounded-xl px-4 py-3 text-[15px] text-[#1a1a1a] leading-relaxed outline-none resize-none border border-[#E24B4A]/25"
                rows={6}
                value={editText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditText(e.target.value)}
                dir="auto"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-2.5 rounded-xl text-white text-[14px] font-semibold"
                  style={{ background: 'linear-gradient(135deg,#E24B4A,#D85A30)' }}
                >Save</button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#f0f0f0] text-[14px] font-semibold text-gray-600"
                >Cancel</button>
              </div>
            </div>
          ) : (
            <p className="px-4 pb-5 text-[15px] text-[#333] leading-relaxed whitespace-pre-wrap" dir="auto">
              {capture.content || <span className="text-gray-400 italic">No content</span>}
            </p>
          )}
        </div>

        {/* Notes — each as its own card, in order added */}
        {(capture.notes ?? []).map((note, i) => (
          <div key={note.id ?? i} className="bg-white rounded-2xl px-4 py-4 shadow-sm space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Note</p>
            <p className="text-[15px] text-[#333] leading-relaxed whitespace-pre-wrap" dir="auto">{note.text}</p>
            <p className="text-[11px] text-gray-300">
              {new Date(note.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
        ))}

        {/* Voice recordings */}
        {capture.recordings?.length > 0 && (
          <div className="bg-white rounded-2xl px-4 py-4 shadow-sm space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">Voice recordings</p>
            {capture.recordings.map((r, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#f8f8f8] rounded-xl px-3 py-3">
                <span className="text-[18px]">🎤</span>
                <span className="text-[13px] text-gray-500 flex-1">Recording {i + 1}</span>
                <audio controls src={r.url} className="h-7" style={{ maxWidth: 140 }} />
              </div>
            ))}
          </div>
        )}

        {/* Add more */}
        <div className="bg-white rounded-2xl px-4 py-4 shadow-sm space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Add more</p>

          <div className="flex items-center gap-3">
            <button
              onPointerDown={handleRecordPress}
              className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                isRecording ? 'bg-[#E24B4A]' : 'bg-[#f0f0f0]'
              }`}
            >
              {isRecording
                ? <div className="w-4 h-4 rounded-[3px] bg-white" />
                : <svg width="14" height="18" viewBox="0 0 14 18" fill="none"><rect x="3" y="0" width="8" height="11" rx="4" fill="#E24B4A"/><path d="M0 8C0 11.314 3.134 14 7 14C10.866 14 14 11.314 14 8" stroke="#E24B4A" strokeWidth="1.8" strokeLinecap="round"/><line x1="7" y1="14" x2="7" y2="18" stroke="#E24B4A" strokeWidth="1.8" strokeLinecap="round"/></svg>
              }
            </button>
            <p className="text-[13px] text-gray-400">
              {isRecording ? 'Recording… tap to stop' : 'Tap to record a voice note'}
            </p>
          </div>

          {capturedNote && (
            <div className="bg-[#f0faf0] border border-green-200 rounded-xl px-3 py-2.5">
              <p className="text-[11px] text-green-600 font-semibold mb-1">Captured</p>
              <p className="text-[13px] text-[#333]" dir="auto">{capturedNote}</p>
            </div>
          )}

          <textarea
            className="w-full bg-[#f8f8f8] rounded-xl px-4 py-3 text-[14px] text-[#1a1a1a] outline-none placeholder:text-gray-400 resize-none"
            rows={2}
            placeholder="Or type a note…"
            value={addedNote}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAddedNote(e.target.value)}
            dir="auto"
          />

          {(capturedNote || addedNote.trim()) && (
            <button
              onClick={handleAddNote}
              className="w-full py-3 rounded-xl text-white text-[14px] font-semibold"
              style={{ background: 'linear-gradient(135deg,#E24B4A,#D85A30)' }}
            >
              Add to Capture
            </button>
          )}
        </div>
      </div>

      {/* ── Actions bottom sheet ── */}
      <BottomSheet open={sheet === 'actions'} onClose={() => setSheet(null)} title="Options">
        <div className="py-2">
          <SheetAction
            emoji={capture.task ? '✅' : '📋'}
            label={capture.task ? 'Reschedule task' : 'Create task'}
            sublabel={capture.task
              ? capture.task.type === 'scheduled'
                ? `Scheduled: ${new Date(capture.task.scheduledAt!).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`
                : `Flexible · ${capture.task.duration}min`
              : 'Set a date, time or let PA find a slot'}
            onClick={() => setSheet('task')}
          />
          <div className="h-px bg-gray-100 mx-6" />
          <SheetAction
            emoji="🗂️"
            label="Move to category"
            sublabel={cat ? `Currently in ${cat.label}` : 'No category set'}
            onClick={() => setSheet('category')}
          />
          <div className="h-px bg-gray-100 mx-6" />
          <SheetAction
            emoji="🗑️"
            label="Delete capture"
            sublabel="This cannot be undone"
            danger
            onClick={() => setSheet('delete')}
          />
        </div>
      </BottomSheet>

      {/* ── Task scheduler sheet ── */}
      <BottomSheet open={sheet === 'task'} onClose={() => setSheet(null)} title="Create task">
        <TaskSchedulerSheet
          capture={capture}
          onSchedule={handleScheduleTask}
          onClose={() => setSheet(null)}
        />
      </BottomSheet>

      {/* ── Category picker sheet ── */}
      <BottomSheet open={sheet === 'category'} onClose={() => setSheet(null)} title="Move to category">
        <CategoryPicker
          current={capture.category}
          onPick={handleMoveCategory}
          onClose={() => setSheet(null)}
        />
      </BottomSheet>

      {/* ── Delete confirm sheet ── */}
      <BottomSheet open={sheet === 'delete'} onClose={() => setSheet(null)} title="Delete capture?">
        <DeleteConfirm
          onConfirm={handleDelete}
          onCancel={() => setSheet(null)}
        />
      </BottomSheet>
    </div>
  );
}
