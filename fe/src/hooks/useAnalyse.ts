import { useState, useRef, useCallback } from 'react';

export type AnalyseState = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

const ACTIONS_MARKER = 'ACTIONS:';

function parseResponse(raw: string): { prose: string; actions: string[] } {
  const idx = raw.indexOf(ACTIONS_MARKER);
  if (idx === -1) return { prose: raw.trim(), actions: [] };

  const prose = raw.slice(0, idx).trim();
  const jsonPart = raw.slice(idx + ACTIONS_MARKER.length).trim();
  try {
    const actions = JSON.parse(jsonPart) as string[];
    return { prose, actions: Array.isArray(actions) ? actions : [] };
  } catch {
    return { prose, actions: [] };
  }
}

interface UseAnalyseReturn {
  prose: string;
  actions: string[];
  state: AnalyseState;
  error: string | null;
  run: (title: string, content: string) => void;
  stop: () => void;
  reset: () => void;
}

export function useAnalyse(
  onDone?: (prose: string, actions: string[]) => void,
): UseAnalyseReturn {
  const [prose, setProse] = useState('');
  const [actions, setActions] = useState<string[]>([]);
  const [state, setState] = useState<AnalyseState>('idle');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setState(s => (s === 'streaming' || s === 'loading' ? 'done' : s));
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setProse('');
    setActions([]);
    setState('idle');
    setError(null);
  }, []);

  const run = useCallback((title: string, content: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setProse('');
    setActions([]);
    setError(null);
    setState('loading');

    (async () => {
      try {
        const res = await fetch('/api/analyse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) throw new Error(`Server error ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        setState('streaming');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const raw = trimmed.slice(5).trim();
            if (raw === '[DONE]') continue;

            const parsed = JSON.parse(raw) as { text?: string; error?: string };
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.text) {
              accumulated += parsed.text;
              // Stream only the prose portion so ACTIONS: line doesn't flash
              const { prose: liveProse } = parseResponse(accumulated);
              setProse(liveProse);
            }
          }
        }

        const { prose: finalProse, actions: finalActions } = parseResponse(accumulated);
        setProse(finalProse);
        setActions(finalActions);
        setState('done');
        onDone?.(finalProse, finalActions);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Unknown error');
        setState('error');
      }
    })();
  }, [onDone]);

  return { prose, actions, state, error, run, stop, reset };
}
