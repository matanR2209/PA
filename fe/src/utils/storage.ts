import type { Capture, Recording } from '../types';

const STORAGE_KEY = 'ideapa_captures';

// Migrate old key if needed
(function migrate() {
  try {
    const old = localStorage.getItem('ideapa_ideas');
    if (old && !localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, old);
    }
  } catch (_) {}
})();

export function getCaptures(): Capture[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Capture[];
  } catch {
    return [];
  }
}

export function saveCapture(capture: Capture): Capture {
  const captures = getCaptures();
  const existing = captures.findIndex(c => c.id === capture.id);
  if (existing >= 0) {
    captures[existing] = capture;
  } else {
    captures.unshift(capture);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(captures));
  return capture;
}

export function deleteCapture(id: string): void {
  const captures = getCaptures().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(captures));
}

interface CreateCaptureOptions {
  title?: string;
  type?: 'idea' | 'task';
  category?: string | null;
  recordings?: Recording[];
}

export function createCapture(content: string, { title, type = 'idea', category = null, recordings = [] }: CreateCaptureOptions = {}): Capture {
  const autoTitle = title || content.trim().split(/\s+/).slice(0, 5).join(' ') || 'Untitled';
  const capture: Capture = {
    id: Date.now().toString(),
    title: autoTitle,
    content,
    type,
    category,
    createdAt: new Date().toISOString(),
    recordings,
  };
  return saveCapture(capture);
}
