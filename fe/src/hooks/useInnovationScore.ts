import { useState, useCallback } from 'react';

export type InnovationScoreState = 'idle' | 'loading' | 'done' | 'error';

interface UseInnovationScoreReturn {
  score: number | null;
  reasoning: string | null;
  state: InnovationScoreState;
  error: string | null;
  run: (title: string, content: string) => void;
  reset: () => void;
}

export function useInnovationScore(): UseInnovationScoreReturn {
  const [score, setScore] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [state, setState] = useState<InnovationScoreState>('idle');
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (title: string, content: string) => {
    setState('loading');
    setError(null);
    setScore(null);
    setReasoning(null);
    try {
      const res = await fetch('/api/innovation-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json() as { score: number; reasoning: string };
      setScore(data.score);
      setReasoning(data.reasoning);
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setState('error');
    }
  }, []);

  const reset = useCallback(() => {
    setScore(null);
    setReasoning(null);
    setState('idle');
    setError(null);
  }, []);

  return { score, reasoning, state, error, run, reset };
}
