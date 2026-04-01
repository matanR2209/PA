import { useState, useEffect, useCallback } from 'react';
import type { Capture, CaptureNote, Recording } from '../types';

const API = '/api/captures';

interface CreateCaptureOptions {
  title?: string;
  type?: 'idea' | 'task';
  category?: string | null;
  recordings?: Recording[];
}

export function useCaptures() {
  const [captures, setCaptures] = useState<Capture[]>([]);

  // Load on mount
  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then((data: Capture[]) => setCaptures(data))
      .catch(console.error);
  }, []);

  const addCapture = useCallback((content: string, options?: CreateCaptureOptions): Capture => {
    const autoTitle = options?.title || content.trim().split(/\s+/).slice(0, 5).join(' ') || 'Untitled';

    // Optimistic local capture so the UI responds immediately
    const tempId = `temp_${Date.now()}`;
    const optimistic: Capture = {
      id:         tempId,
      title:      autoTitle,
      content,
      type:       options?.type ?? 'idea',
      category:   options?.category ?? null,
      createdAt:  new Date().toISOString(),
      recordings: options?.recordings ?? [],
    };
    setCaptures(prev => [optimistic, ...prev]);

    // Persist and swap temp record for the real one
    fetch(API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title:      autoTitle,
        content,
        type:       options?.type ?? 'idea',
        category:   options?.category ?? null,
        recordings: options?.recordings ?? [],
      }),
    })
      .then(r => r.json())
      .then((saved: Capture) =>
        setCaptures(prev => prev.map(c => c.id === tempId ? saved : c))
      )
      .catch(console.error);

    return optimistic;
  }, []);

  const updateCapture = useCallback((capture: Capture): void => {
    // Optimistic update — UI stays snappy
    setCaptures(prev => prev.map(c => c.id === capture.id ? capture : c));

    fetch(`${API}/${capture.id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(capture),
    })
      .then(r => r.json())
      .then((saved: Capture) =>
        setCaptures(prev => prev.map(c => c.id === saved.id ? saved : c))
      )
      .catch(console.error);
  }, []);

  const removeCapture = useCallback((id: string): void => {
    setCaptures(prev => prev.filter(c => c.id !== id));
    fetch(`${API}/${id}`, { method: 'DELETE' }).catch(console.error);
  }, []);

  const addNote = useCallback(async (captureId: string, text: string): Promise<void> => {
    try {
      const res = await fetch(`${API}/${captureId}/notes`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text }),
      });
      const note = await res.json() as CaptureNote;
      setCaptures(prev => prev.map(c =>
        c.id === captureId
          ? { ...c, notes: [...(c.notes ?? []), note] }
          : c
      ));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const refresh = useCallback(() => {
    fetch(API)
      .then(r => r.json())
      .then((data: Capture[]) => setCaptures(data))
      .catch(console.error);
  }, []);

  return { captures, addCapture, updateCapture, removeCapture, addNote, refresh };
}
