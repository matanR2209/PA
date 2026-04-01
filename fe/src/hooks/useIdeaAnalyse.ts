import { useState, useCallback, useRef } from 'react';
import type { IdeaInsights } from '../types';

export type IdeaAnalyseState = 'idle' | 'loading' | 'done' | 'error';

interface UseIdeaAnalyseReturn {
  insights: IdeaInsights | null;
  state: IdeaAnalyseState;
  error: string | null;
  run: (title: string, content: string) => void;
  reset: () => void;
}

export function useIdeaAnalyse(onDone?: (insights: IdeaInsights) => void): UseIdeaAnalyseReturn {
  const [insights, setInsights] = useState<IdeaInsights | null>(null);
  const [state, setState] = useState<IdeaAnalyseState>('idle');
  const [error, setError] = useState<string | null>(null);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const run = useCallback(async (title: string, content: string) => {
    setState('loading');
    setError(null);
    setInsights(null);
    try {
      const res = await fetch('/api/analyse-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json() as IdeaInsights;
      setInsights(data);
      setState('done');
      onDoneRef.current?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setState('error');
    }
  }, []);

  const reset = useCallback(() => {
    setInsights(null);
    setState('idle');
    setError(null);
  }, []);

  return { insights, state, error, run, reset };
}
