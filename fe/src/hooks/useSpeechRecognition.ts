import { useState, useRef, useEffect } from 'react';

// Extend Window to include webkit prefix
declare global {
  interface Window {
    SpeechRecognition?: typeof SpeechRecognition;
    webkitSpeechRecognition?: typeof SpeechRecognition;
  }
}

const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

// iOS Safari doesn't support continuous mode
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSupported] = useState(!!SpeechRecognitionAPI);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalRef = useRef('');
  const shouldRestartRef = useRef(false); // for iOS restart loop
  const stopResolveRef = useRef<((value: string) => void) | null>(null); // resolve fn for stopListening()

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      recognitionRef.current?.stop();
    };
  }, []);

  function createRecognition(): SpeechRecognition {
    const recognition = new SpeechRecognitionAPI!();
    recognition.lang = 'he-IL';
    recognition.interimResults = true;
    recognition.continuous = !isIOS; // iOS: false, others: true

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = '';
      let interimText = '';

      for (let i = 0; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }

      // On iOS, accumulate across sessions
      if (isIOS && finalText) {
        finalRef.current = (finalRef.current + ' ' + finalText).trim();
      } else if (finalText) {
        finalRef.current = finalText;
      }

      setTranscript(finalRef.current);
      setInterimTranscript(interimText);
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === 'aborted' || e.error === 'no-speech') return;
      console.error('Speech recognition error:', e.error);
      setSpeechError(e.error);
      setIsListening(false);
      shouldRestartRef.current = false;
    };

    recognition.onend = () => {
      setInterimTranscript('');

      // If stopListening() is waiting, resolve it
      if (stopResolveRef.current) {
        const resolve = stopResolveRef.current;
        stopResolveRef.current = null;
        setIsListening(false);
        resolve(finalRef.current);
        return;
      }

      // iOS: auto-restart if we're supposed to still be listening
      if (isIOS && shouldRestartRef.current) {
        const r = createRecognition();
        recognitionRef.current = r;
        try { r.start(); } catch (_) {}
        return;
      }

      setIsListening(false);
    };

    return recognition;
  }

  function startListening(): void {
    if (!SpeechRecognitionAPI) return;

    finalRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setSpeechError(null);
    shouldRestartRef.current = true;

    const recognition = createRecognition();
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  // Returns Promise<string> with the full final transcript once onend fires
  function stopListening(): Promise<string> {
    return new Promise((resolve) => {
      shouldRestartRef.current = false;

      const recognition = recognitionRef.current;
      if (!recognition) {
        resolve(finalRef.current);
        return;
      }

      stopResolveRef.current = resolve;
      recognition.stop();
      setIsListening(false);
    });
  }

  function resetTranscript(): void {
    finalRef.current = '';
    setSpeechError(null);
    setTranscript('');
    setInterimTranscript('');
  }

  return {
    transcript,
    interimTranscript,
    speechError,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
