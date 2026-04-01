import { useState, useCallback } from 'react';
import { getCaptures, saveCapture, deleteCapture, createCapture } from '../utils/storage';
import type { Capture } from '../types';

interface CreateIdeaOptions {
  title?: string;
  category?: string | null;
  recordings?: Array<{ url: string; size: number; mimeType: string }>;
}

export function useIdeas() {
  const [ideas, setIdeas] = useState<Capture[]>(() => getCaptures().filter(c => c.type === 'idea'));

  const refresh = useCallback(() => {
    setIdeas(getCaptures().filter(c => c.type === 'idea'));
  }, []);

  const addIdea = useCallback((content: string, options?: CreateIdeaOptions): Capture => {
    const idea = createCapture(content, { ...options, type: 'idea' });
    setIdeas(getCaptures().filter(c => c.type === 'idea'));
    return idea;
  }, []);

  const updateIdea = useCallback((idea: Capture): void => {
    saveCapture(idea);
    setIdeas(getCaptures().filter(c => c.type === 'idea'));
  }, []);

  const removeIdea = useCallback((id: string): void => {
    deleteCapture(id);
    setIdeas(getCaptures().filter(c => c.type === 'idea'));
  }, []);

  return { ideas, addIdea, updateIdea, removeIdea, refresh };
}
