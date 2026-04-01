import { useState, useEffect, useCallback } from 'react';
import type { Label } from '../types/label.types';

const API = '/api/labels';

// Distinct, visually pleasing palette (used when auto-assigning colors)
const LABEL_COLORS = [
  '#6366f1', // indigo
  '#22c55e', // green
  '#f97316', // orange
  '#ec4899', // pink
  '#14b8a6', // teal
  '#8b5cf6', // violet
  '#f43f5e', // rose
  '#3b82f6', // blue
  '#eab308', // yellow
  '#06b6d4', // cyan
  '#a855f7', // purple
  '#84cc16', // lime
];

interface UseLabelsReturn {
  labels: Label[];
  createLabel: (name: string) => Label;
  deleteLabel: (id: string) => void;
}

export function useLabels(): UseLabelsReturn {
  const [labels, setLabels] = useState<Label[]>([]);

  // Load on mount
  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then((data: Label[]) => setLabels(data))
      .catch(console.error);
  }, []);

  const createLabel = useCallback((name: string): Label => {
    const color = LABEL_COLORS[labels.length % LABEL_COLORS.length];
    const tempId = `temp_${Date.now()}`;
    const optimistic: Label = { id: tempId, name: name.trim(), color };

    setLabels(prev => [...prev, optimistic]);

    fetch(API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: name.trim(), color }),
    })
      .then(r => r.json())
      .then((saved: Label) =>
        setLabels(prev => prev.map(l => l.id === tempId ? saved : l))
      )
      .catch(console.error);

    return optimistic;
  }, [labels.length]);

  const deleteLabel = useCallback((id: string): void => {
    setLabels(prev => prev.filter(l => l.id !== id));
    fetch(`${API}/${id}`, { method: 'DELETE' }).catch(console.error);
  }, []);

  return { labels, createLabel, deleteLabel };
}
