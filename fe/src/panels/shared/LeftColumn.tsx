import React, { useState, useEffect, useRef } from 'react';
import type { Capture, CaptureNote, ActionItem } from '../../types';
import { getCategoryById } from '../../components/QuickActions';
import { useRecorder } from '../../hooks/useRecorder';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useLabels } from '../../hooks/useLabels';

function fmtFull(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

// Mic icon — indicates a voice-captured entry
function MicIcon(): React.ReactElement {
  return (
    <svg width="13" height="15" viewBox="0 0 13 15" fill="none" className="text-gray-400 shrink-0 mt-0.5">
      <rect x="3.5" y="0" width="6" height="9" rx="3" fill="currentColor"/>
      <path d="M1 7C1 10.314 3.462 13 6.5 13C9.538 13 12 10.314 12 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="6.5" y1="13" x2="6.5" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

// Pencil icon — indicates a manually typed note
function PencilIcon(): React.ReactElement {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="text-gray-400 shrink-0 mt-0.5">
      <path d="M9.5 1.5L11.5 3.5L4.5 10.5L2 11L2.5 8.5L9.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

interface LeftColumnProps {
  capture: Capture;
  onUpdate: (updated: Capture) => void;
  extraSections?: React.ReactNode;
}

export function LeftColumn({ capture, onUpdate, extraSections }: LeftColumnProps): React.ReactElement {
  const cat = getCategoryById(capture.category);
  const { labels: allLabels } = useLabels();
  const captureLabels = allLabels.filter(l =>
    ((capture.meta as Record<string, unknown>)?.labels as string[] ?? []).includes(l.id)
  );

  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(capture.title);
  const [editingContent, setEditingContent] = useState(false);
  const [content, setContent] = useState(capture.content);

  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteAdded, setNoteAdded] = useState(false);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const { isRecording, startRecording, stopRecording } = useRecorder();
  const { isSupported, transcript, interimTranscript, isListening, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    setTitle(capture.title);
    setContent(capture.content);
    setEditingTitle(false);
    setEditingContent(false);
    setNoteOpen(false);
    setNoteText('');
    setNoteAdded(false);
    resetTranscript();
  }, [capture.id]);

  useEffect(() => {
    if (transcript || interimTranscript) {
      setNoteText(transcript + (interimTranscript ? (transcript ? ' ' : '') + interimTranscript : ''));
    }
  }, [transcript, interimTranscript]);

  function saveTitle(): void {
    if (title.trim()) onUpdate({ ...capture, title: title.trim(), updatedAt: new Date().toISOString() });
    setEditingTitle(false);
  }

  function saveContent(): void {
    onUpdate({ ...capture, content, updatedAt: new Date().toISOString() });
    setEditingContent(false);
  }

  async function toggleVoiceNote(): Promise<void> {
    if (isRecording) {
      const [blob, text] = await Promise.all([
        stopRecording(),
        isSupported ? stopListening() : Promise.resolve(''),
      ]);
      const finalText = text || noteText;
      if (finalText.trim()) setNoteText(finalText.trim());
      if (blob.size > 0) {
        const rec = { url: URL.createObjectURL(blob), size: blob.size, mimeType: blob.type };
        onUpdate({ ...capture, recordings: [...(capture.recordings ?? []), rec], updatedAt: new Date().toISOString() });
      }
    } else {
      resetTranscript();
      setNoteText('');
      await startRecording();
      if (isSupported) startListening();
    }
  }

  function saveNote(): void {
    if (!noteText.trim()) return;
    const note: CaptureNote = {
      id: crypto.randomUUID(),
      text: noteText.trim(),
      createdAt: new Date().toISOString(),
    };
    onUpdate({ ...capture, notes: [...(capture.notes ?? []), note], updatedAt: new Date().toISOString() });
    setNoteText('');
    resetTranscript();
    setNoteAdded(true);
    setNoteOpen(false);
    setTimeout(() => setNoteAdded(false), 100);
  }

  function closeNote(): void {
    setNoteOpen(false);
    setNoteText('');
    resetTranscript();
  }

  const notes = capture.notes ?? [];

  return (
    <div className="flex flex-col px-8 py-7 gap-5 min-h-full">

      {/* ── Category badge + date + label circles ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {cat && (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-[12px] font-semibold text-gray-500">
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </span>
        )}
        <span className="text-[12px] text-gray-400">{fmtFull(capture.createdAt)}</span>
        {capture.updatedAt && <span className="text-[11px] text-gray-300">· edited</span>}
        {captureLabels.map(label => (
          <span
            key={label.id}
            title={label.name}
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
            style={{ backgroundColor: label.color }}
          >
            {label.name[0].toUpperCase()}
          </span>
        ))}
      </div>

      {/* ── Title ── */}
      {editingTitle ? (
        <div className="flex gap-2 items-start">
          <input
            autoFocus
            className="flex-1 text-[24px] font-bold text-[#1a1a1a] bg-[#f8f8f8] rounded-xl px-4 py-2.5 outline-none border border-[#E24B4A]/30"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') saveTitle();
              if (e.key === 'Escape') { setTitle(capture.title); setEditingTitle(false); }
            }}
            dir="auto"
          />
          <button onClick={saveTitle} className="mt-1 px-4 py-2.5 rounded-xl text-white text-[13px] font-semibold shrink-0" style={{ background: 'linear-gradient(135deg,#E24B4A,#D85A30)' }}>Save</button>
          <button onClick={() => { setTitle(capture.title); setEditingTitle(false); }} className="mt-1 px-4 py-2.5 rounded-xl bg-gray-100 text-[13px] font-semibold text-gray-600 shrink-0">Cancel</button>
        </div>
      ) : (
        <div className="group flex items-start gap-2 cursor-pointer" onClick={() => setEditingTitle(true)} title="Click to edit title">
          <h1 className="text-[24px] font-bold text-[#1a1a1a] leading-snug flex-1" dir="auto">{capture.title}</h1>
          <span className="opacity-0 group-hover:opacity-100 mt-1.5 text-[12px] text-gray-300 transition-opacity shrink-0">✏️</span>
        </div>
      )}

      {/* ── Context: original capture + all notes unified ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">Context</p>
        </div>

        {/* Original capture card */}
        {editingContent ? (
          <div className="flex flex-col gap-3">
            <textarea
              autoFocus
              className="w-full bg-[#f8f8f8] rounded-xl p-4 text-[15px] text-[#1a1a1a] leading-relaxed resize-none outline-none border border-[#E24B4A]/30 min-h-[140px]"
              value={content}
              onChange={e => setContent(e.target.value)}
              dir="auto"
            />
            <div className="flex gap-2">
              <button onClick={saveContent} className="px-5 py-2 rounded-lg text-white text-[13px] font-semibold" style={{ background: 'linear-gradient(135deg,#E24B4A,#D85A30)' }}>Save</button>
              <button onClick={() => { setContent(capture.content); setEditingContent(false); }} className="px-5 py-2 rounded-lg bg-gray-100 text-[13px] font-semibold text-gray-600">Cancel</button>
            </div>
          </div>
        ) : (
          <div
            className="group relative bg-[#f8f8f8] rounded-2xl p-4 cursor-pointer hover:bg-[#f0f0f0] transition-colors"
            onClick={() => { setContent(capture.content); setEditingContent(true); }}
          >
            <div className="flex items-start gap-3">
              <MicIcon />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-gray-400 mb-1.5">{fmtFull(capture.createdAt)}</p>
                <p className="text-[14px] text-[#333] leading-relaxed whitespace-pre-wrap" dir="auto">
                  {capture.content || <span className="italic text-gray-300">No content — click to add</span>}
                </p>
              </div>
              <span className="opacity-0 group-hover:opacity-100 text-[11px] text-gray-300 shrink-0 transition-opacity mt-0.5">✏️</span>
            </div>

            {/* Voice recordings inline */}
            {(capture.recordings?.length ?? 0) > 0 && (
              <div className="mt-3 space-y-1.5 pl-6">
                {capture.recordings.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400">Recording {i + 1}</span>
                    <span className="text-[11px] text-gray-300">·</span>
                    <span className="text-[11px] text-gray-400">{Math.round(r.size / 1024)} kb</span>
                    <audio controls src={r.url} className="h-6 ml-1" style={{ maxWidth: 160 }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Note cards */}
        {notes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            onDelete={() => onUpdate({ ...capture, notes: notes.filter(n => n.id !== note.id), updatedAt: new Date().toISOString() })}
            onSave={text => onUpdate({ ...capture, notes: notes.map(n => n.id === note.id ? { ...n, text } : n), updatedAt: new Date().toISOString() })}
          />
        ))}

        {/* Add note button / form */}
        {!noteOpen ? (
          <button
            onClick={() => { setNoteOpen(true); setTimeout(() => noteRef.current?.focus(), 50); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f8f8f8] hover:bg-[#f0f0f0] text-[13px] font-semibold text-gray-500 transition-colors w-full"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="0" y="6" width="13" height="1.4" rx="0.7" fill="currentColor"/>
              <rect x="6" y="0" width="1.4" height="13" rx="0.7" fill="currentColor"/>
            </svg>
            {noteAdded ? '✓ Note added' : 'Add note'}
          </button>
        ) : (
          <div className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PencilIcon />
                <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">New note</p>
              </div>
              <div className="flex items-center gap-2">
                {isSupported && (
                  <button
                    onClick={toggleVoiceNote}
                    title={isRecording ? 'Stop recording' : 'Record a voice note'}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 ${
                      isRecording ? 'bg-[#E24B4A] text-white animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {isRecording ? (
                      <><div className="w-2.5 h-2.5 rounded-sm bg-white" />Stop</>
                    ) : (
                      <>
                        <MicIcon />
                        Voice
                      </>
                    )}
                  </button>
                )}
                <button onClick={closeNote} className="text-[18px] leading-none text-gray-300 hover:text-gray-400 transition-colors" title="Cancel">×</button>
              </div>
            </div>

            {isListening && interimTranscript && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-[#E24B4A] animate-pulse shrink-0" />
                <p className="text-[12px] text-gray-500 italic truncate">{interimTranscript}</p>
              </div>
            )}

            <textarea
              ref={noteRef}
              className="w-full bg-[#f8f8f8] rounded-xl px-4 py-3 text-[14px] text-[#1a1a1a] leading-relaxed resize-none outline-none placeholder:text-gray-300 focus:bg-white border border-transparent focus:border-gray-200 transition-colors"
              rows={3}
              placeholder="Type a note…"
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              onKeyDown={e => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveNote();
                if (e.key === 'Escape') closeNote();
              }}
              dir="auto"
            />

            <div className="flex items-center justify-between">
              <p className="text-[11px] text-gray-300">⌘↵ to save · Esc to cancel</p>
              <button
                onClick={saveNote}
                disabled={!noteText.trim()}
                className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
                  noteText.trim() ? 'text-white' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
                style={noteText.trim() ? { background: 'linear-gradient(135deg,#E24B4A,#D85A30)' } : {}}
              >
                Save note
              </button>
            </div>
          </div>
        )}

        {/* Action items */}
        <ActionItemsSection capture={capture} onUpdate={onUpdate} />
      </div>

      {/* ── Extra sections (category-specific) ── */}
      {extraSections && (
        <div className="border-t border-gray-100 pt-5">
          {extraSections}
        </div>
      )}

    </div>
  );
}

// ── Individual note card ──────────────────────────────────────────────────────

interface NoteCardProps {
  note: CaptureNote;
  onDelete: () => void;
  onSave: (text: string) => void;
}

function NoteCard({ note, onDelete, onSave }: NoteCardProps): React.ReactElement {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.text);

  function handleSave(): void {
    if (text.trim()) { onSave(text.trim()); setEditing(false); }
  }

  return editing ? (
    <div className="border border-[#E24B4A]/30 rounded-2xl p-4 bg-white space-y-3">
      <textarea
        autoFocus
        className="w-full bg-[#f8f8f8] rounded-xl px-4 py-3 text-[14px] text-[#1a1a1a] leading-relaxed resize-none outline-none min-h-[80px]"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSave();
          if (e.key === 'Escape') { setText(note.text); setEditing(false); }
        }}
        dir="auto"
      />
      <div className="flex gap-2">
        <button onClick={handleSave} className="px-4 py-2 rounded-lg text-white text-[13px] font-semibold" style={{ background: 'linear-gradient(135deg,#E24B4A,#D85A30)' }}>Save</button>
        <button onClick={() => { setText(note.text); setEditing(false); }} className="px-4 py-2 rounded-lg bg-gray-100 text-[13px] font-semibold text-gray-600">Cancel</button>
      </div>
    </div>
  ) : (
    <div className="group relative bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition-colors">
      <div className="flex items-start gap-3">
        <PencilIcon />
        <div className="flex-1 min-w-0 pr-12">
          <p className="text-[11px] text-gray-400 mb-1.5">{fmtFull(note.createdAt)}</p>
          <p className="text-[14px] text-[#333] leading-relaxed whitespace-pre-wrap" dir="auto">{note.text}</p>
        </div>
      </div>
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setEditing(true)} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[11px] text-gray-500 transition-colors" title="Edit">✏️</button>
        <button onClick={onDelete} className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-50 hover:text-red-400 text-[11px] text-gray-400 transition-colors" title="Delete">✕</button>
      </div>
    </div>
  );
}

// ── Action items section ──────────────────────────────────────────────────────

interface ActionItemsSectionProps {
  capture: Capture;
  onUpdate: (c: Capture) => void;
}

function ActionItemsSection({ capture, onUpdate }: ActionItemsSectionProps): React.ReactElement | null {
  const meta = (capture.meta ?? {}) as { actionItems?: ActionItem[] };
  const items = meta.actionItems ?? [];
  if (items.length === 0) return null;

  function toggle(id: string): void {
    const updated = items.map(i =>
      i.id === id ? { ...i, status: i.status === 'done' ? 'todo' : 'done' } : i
    ) as ActionItem[];
    onUpdate({ ...capture, meta: { ...meta, actionItems: updated }, updatedAt: new Date().toISOString() });
  }

  function remove(id: string): void {
    const updated = items.filter(i => i.id !== id);
    onUpdate({ ...capture, meta: { ...meta, actionItems: updated }, updatedAt: new Date().toISOString() });
  }

  const doneCount = items.filter(i => i.status === 'done').length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">Action items</p>
        <span className="text-[11px] text-gray-300">{doneCount}/{items.length} done</span>
      </div>
      {items.map(item => (
        <div
          key={item.id}
          className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
            item.status === 'done' ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-100 hover:border-gray-200'
          }`}
        >
          <button
            onClick={() => toggle(item.id)}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              item.status === 'done'
                ? 'bg-green-500 border-green-500'
                : item.status === 'in-progress'
                ? 'bg-orange-400 border-orange-400'
                : 'border-gray-300 hover:border-[#E24B4A]'
            }`}
          >
            {item.status === 'done' && (
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {item.status === 'in-progress' && (
              <span className="w-2 h-2 rounded-full bg-white" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <span className={`text-[13px] leading-snug ${item.status === 'done' ? 'line-through text-gray-300' : 'text-[#333]'}`}>
              {item.text}
            </span>
            {item.createdAt && (
              <p className="text-[10px] text-gray-300 mt-0.5">{fmtFull(item.createdAt)}</p>
            )}
          </div>
          <button
            onClick={() => remove(item.id)}
            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 text-[16px] leading-none transition-all"
            title="Remove"
          >×</button>
        </div>
      ))}
    </div>
  );
}
