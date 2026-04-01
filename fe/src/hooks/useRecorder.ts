import { useState, useRef } from 'react';

const isMediaRecorderSupported = typeof MediaRecorder !== 'undefined';

type MicError = 'not-allowed' | 'not-supported' | 'unknown' | null;

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [micError, setMicError] = useState<MicError>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording(): Promise<void> {
    if (!isMediaRecorderSupported) {
      setMicError('not-supported');
      throw new Error('not-supported');
    }
    try {
      setMicError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setAudioBlob(null);
    } catch (err) {
      const error = err as Error;
      const type: MicError = error?.name === 'NotAllowedError' ? 'not-allowed' : 'unknown';
      setMicError(type);
      throw err;
    }
  }

  // Returns a Promise<Blob | null> that resolves once onstop fires
  function stopRecording(): Promise<Blob | null> {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || !isRecording) {
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        recorder.stream?.getTracks().forEach(t => t.stop());
        resolve(blob);
      };

      recorder.stop();
      setIsRecording(false);
    });
  }

  function resetRecording(): void {
    setAudioBlob(null);
  }

  return { isRecording, startRecording, stopRecording, audioBlob, micError, resetRecording };
}
