import React, { useState } from 'react';
import { PAAvatar } from '../components/PAAvatar';
import { RecordButton } from '../components/RecordButton';
import { CaptureCard } from '../components/CaptureCard';
import { WaveformAnimation } from '../components/WaveformAnimation';
import { QuickActions } from '../components/QuickActions';
import { RoutingResult } from '../components/RoutingResult';
import { useRecorder } from '../hooks/useRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useCaptures } from '../hooks/useCaptures';
import { detectType, generateTitle } from '../utils/routing';
import { getRandomFixture } from '../utils/fixtures';
import { CATEGORIES, getCategoryById, DEFAULT_CATEGORIES } from '../components/QuickActions';
import { Toast } from '../components/Toast';
import type { Capture } from '../types';

type NavigateTarget = 'home' | 'inbox' | 'tasks' | 'search' | 'detail';
type HomePhase = 'idle' | 'recording' | 'stopping' | 'result' | 'manual' | 'mic-error';

interface ToastState {
  message: string;
  capture: Capture;
}

interface HomeProps {
  onNavigate: (target: NavigateTarget, data?: Capture) => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning! 👋';
  if (h < 17) return 'Good afternoon! 👋';
  return 'Good evening! 👋';
}

function getSubtitle(captures: Capture[]): string {
  if (!captures.length) return "What's on your mind?";
  const today = new Date().toDateString();
  const todayCount = captures.filter(c => new Date(c.createdAt).toDateString() === today).length;
  if (todayCount > 0) return `${todayCount} capture${todayCount > 1 ? 's' : ''} today`;
  const last = new Date(captures[0].createdAt);
  const diffH = Math.round((Date.now() - last.getTime()) / 3600000);
  if (diffH < 24) return `Last capture: ${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  return `Last capture: ${diffD}d ago`;
}

export function Home({ onNavigate }: HomeProps): React.ReactElement {
  const { isRecording, startRecording, stopRecording, micError } = useRecorder();
  const { transcript, interimTranscript, speechError, isListening, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const { captures, addCapture } = useCaptures();

  // 'idle' | 'recording' | 'stopping' | 'result' | 'manual' | 'mic-error'
  const [phase, setPhase] = useState<HomePhase>('idle');
  const [manualText, setManualText] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [detectedType, setDetectedType] = useState<'idea' | 'task'>('idea');
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [fixturesMode, setFixturesMode] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Recent: only pure captures (not ones that have been converted to tasks)
  const recentIdeas = [...captures]
    .filter(c => !c.task)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  async function handleRecordPress(): Promise<void> {
    // Fixtures mode — instant mock result, no mic needed
    if (fixturesMode) {
      const text = getRandomFixture(selectedCategory);
      setFinalTranscript(text);
      const catType = getCategoryById(selectedCategory)?.type;
      setDetectedType(catType || detectType(text));
      setCapturedBlob(null);
      setPhase('result');
      return;
    }

    if (phase === 'recording') {
      // Go to 'stopping' immediately so UI responds to the tap
      setPhase('stopping');

      // Await both async stops in parallel
      const [blob, text] = await Promise.all([
        stopRecording(),
        isSupported ? stopListening() : Promise.resolve(''),
      ]);

      setCapturedBlob(blob);
      setFinalTranscript(text);
      const catType = getCategoryById(selectedCategory)?.type;
      setDetectedType(catType || detectType(text));
      setPhase('result');
    } else {
      // Speech API not supported → skip straight to manual
      if (!isSupported) {
        setPhase('manual');
        return;
      }
      try {
        await startRecording();
        startListening();
        setPhase('recording');
      } catch {
        setPhase('mic-error');
      }
    }
  }

  function handleConfirm(confirmedCategory: string | null): void {
    const content = finalTranscript || manualText;
    if (!content.trim()) { setPhase('idle'); return; }
    const type = finalTranscript ? detectedType : detectType(manualText);
    const recordings = capturedBlob
      ? [{ url: URL.createObjectURL(capturedBlob), size: capturedBlob.size, mimeType: capturedBlob.type }]
      : [];
    // confirmedCategory comes from RoutingResult picker; fall back to selectedCategory
    const finalCategory = confirmedCategory ?? selectedCategory ?? null;
    const saved = addCapture(content, { title: generateTitle(content), type, recordings, category: finalCategory });
    resetTranscript();
    setFinalTranscript('');
    setManualText('');
    setCapturedBlob(null);
    setSelectedCategory(null);
    setPhase('idle');
    setToast({ message: `"${saved.title}" saved`, capture: saved });
  }

  function handleChange(): void {
    setManualText(finalTranscript);
    setPhase('manual');
  }

  function handleManualSave(): void {
    if (!manualText.trim()) return;
    const type = detectType(manualText);
    const saved = addCapture(manualText, { title: generateTitle(manualText), type, category: selectedCategory });
    setManualText('');
    setSelectedCategory(null);
    setPhase('idle');
    setToast({ message: `"${saved.title}" saved`, capture: saved });
  }

  function handleDiscard(): void {
    resetTranscript();
    setFinalTranscript('');
    setManualText('');
    setCapturedBlob(null);
    setSelectedCategory(null);
    setPhase('idle');
  }

  /* ── RECORDING STATE ── */
  if (phase === 'recording') {
    const liveText = transcript + (interimTranscript ? (transcript ? ' ' : '') + interimTranscript : '');

    return (
      <div className="flex flex-col items-center min-h-screen bg-white pt-16 pb-24 px-6">
        {/* Big pulsing avatar */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #E24B4A 0%, #D85A30 50%, #BA7517 100%)',
            animation: 'recording-glow 1.5s ease-in-out infinite',
          }}
        >
          <div className="w-7 h-7 rounded-full bg-white" />
        </div>

        <p className="text-[16px] font-semibold text-[#1a1a1a] mt-5">I'm listening...</p>
        <p className="text-[13px] text-gray-400 mt-1.5">Tell me everything</p>

        <div className="mt-6">
          <WaveformAnimation />
        </div>

        {/* Live transcript */}
        {liveText ? (
          <div className="mt-5 w-full bg-[#f8f8f8] rounded-2xl px-4 py-3 max-h-32 overflow-y-auto">
            <p className="text-[14px] text-[#1a1a1a] leading-relaxed" dir="auto">
              {/* committed text */}
              <span>{transcript}</span>
              {/* interim text — dimmed */}
              {interimTranscript && (
                <span className="text-gray-400">{transcript ? ' ' : ''}{interimTranscript}</span>
              )}
            </p>
          </div>
        ) : (
          <p className="mt-5 text-[12px] text-gray-300">Waiting for speech...</p>
        )}

        {/* Speech recognition error — shown inline, recording still active */}
        {speechError && (
          <div className="mt-4 w-full bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5">
            <p className="text-[12px] text-orange-600 text-center">
              {speechError === 'network'
                ? 'Speech service unavailable — your words may not appear but the audio is still recording.'
                : speechError === 'audio-capture'
                ? 'Could not access the microphone.'
                : `Speech error: "${speechError}". Stop and type instead if needed.`}
            </p>
          </div>
        )}

        {/* Stop button */}
        <button
          onPointerDown={() => handleRecordPress()}
          className="mt-6 w-14 h-14 rounded-full bg-[#f0f0f0] flex items-center justify-center active:scale-95 transition-transform"
        >
          <div className="w-5 h-5 rounded-[4px] bg-[#E24B4A]" />
        </button>

        <style>{`
          @keyframes recording-glow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(226,75,74,0.4); }
            50%       { box-shadow: 0 0 0 20px rgba(226,75,74,0); }
          }
        `}</style>
      </div>
    );
  }

  /* ── MIC ERROR ── */
  if (phase === 'mic-error') {
    const isBlocked = micError === 'not-allowed';
    const isUnsupported = micError === 'not-supported';
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white pb-24 gap-4 px-8 text-center">
        <p className="text-[40px]">🎙️</p>
        <p className="text-[16px] font-semibold text-[#1a1a1a]">
          {isBlocked ? 'Mic access blocked' : isUnsupported ? 'Recording not supported' : 'Microphone error'}
        </p>
        <p className="text-[13px] text-gray-400 leading-relaxed">
          {isBlocked
            ? 'Allow microphone access in your browser settings, then try again.'
            : isUnsupported
            ? "Your browser doesn't support audio recording. Type your idea instead."
            : 'Something went wrong with the microphone. You can type your idea instead.'}
        </p>
        <div className="flex gap-3 mt-2">
          {!isUnsupported && (
            <button
              onClick={() => setPhase('idle')}
              className="px-5 py-2.5 rounded-xl bg-[#f0f0f0] text-[13px] font-semibold text-[#333]"
            >
              Try again
            </button>
          )}
          <button
            onClick={() => setPhase('manual')}
            className="px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold"
            style={{ background: 'linear-gradient(135deg, #E24B4A, #D85A30)' }}
          >
            Type instead
          </button>
        </div>
      </div>
    );
  }

  /* ── STOPPING — waiting for async finalisation ── */
  if (phase === 'stopping') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white pb-24 gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #E24B4A 0%, #D85A30 100%)' }}
        >
          <div className="w-5 h-5 rounded-full bg-white opacity-80 animate-pulse" />
        </div>
        <p className="text-[14px] text-gray-400">Processing...</p>
      </div>
    );
  }

  /* ── ROUTING RESULT ── */
  if (phase === 'result') {
    const content = finalTranscript;
    const words = generateTitle(content);

    // Empty transcript — nothing was captured, go back
    if (!content.trim()) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white pb-24 gap-4 px-8 text-center">
          <p className="text-[32px]">🤔</p>
          <p className="text-[16px] font-semibold text-[#1a1a1a]">Didn't catch that</p>
          <p className="text-[13px] text-gray-400">No speech was detected. Try again or type it instead.</p>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setPhase('idle')}
              className="px-5 py-2.5 rounded-xl bg-[#f0f0f0] text-[13px] font-semibold text-[#333]"
            >
              Try again
            </button>
            <button
              onClick={() => setPhase('manual')}
              className="px-5 py-2.5 rounded-xl text-white text-[13px] font-semibold"
              style={{ background: 'linear-gradient(135deg, #E24B4A, #D85A30)' }}
            >
              Type it
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col min-h-screen bg-white pb-24">
        <RoutingResult
          type={detectedType}
          title={words || (detectedType === 'task' ? 'New task' : 'New idea')}
          preview={content}
          category={selectedCategory}
          onConfirm={handleConfirm}
          onChange={handleChange}
        />
      </div>
    );
  }

  /* ── MANUAL TEXT FALLBACK ── */
  if (phase === 'manual') {
    return (
      <div className="flex flex-col min-h-screen bg-white pb-24 px-5 pt-12">
        <h2 className="text-[17px] font-semibold text-[#1a1a1a] mb-1">What's on your mind?</h2>
        {!isSupported && (
          <p className="text-[12px] text-gray-400 mb-3">Voice not supported in this browser — type your idea below.</p>
        )}
        <textarea
          className="w-full bg-[#f8f8f8] rounded-xl px-4 py-3 text-[15px] text-[#1a1a1a] outline-none resize-none placeholder:text-gray-400"
          rows={5}
          placeholder="Type your idea..."
          value={manualText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setManualText(e.target.value)}
          dir="auto"
          autoFocus
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleManualSave}
            disabled={!manualText.trim()}
            className="flex-1 py-3 rounded-xl text-white font-semibold text-[13px] disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #E24B4A, #D85A30)' }}
          >
            Save Idea
          </button>
          <button
            onClick={handleDiscard}
            className="flex-1 py-3 rounded-xl bg-[#f0f0f0] text-[#333] font-semibold text-[13px]"
          >
            Discard
          </button>
        </div>
      </div>
    );
  }

  /* ── IDLE HOME ── */
  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">

      {/* ── Top bar: fixtures toggle ── */}
      <div className="flex justify-end px-4 pt-4">
        <button
          onClick={() => setFixturesMode(f => !f)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
            fixturesMode
              ? 'bg-amber-100 text-amber-700 border border-amber-300'
              : 'bg-gray-100 text-gray-400 border border-gray-200'
          }`}
        >
          <span>{fixturesMode ? '🧪' : '🎙️'}</span>
          <span>{fixturesMode ? 'Fixtures' : 'Live'}</span>
          <span className={`w-7 h-4 rounded-full flex items-center px-0.5 transition-colors ${fixturesMode ? 'bg-amber-400' : 'bg-gray-300'}`}>
            <span className={`w-3 h-3 rounded-full bg-white shadow transition-transform ${fixturesMode ? 'translate-x-3' : 'translate-x-0'}`} />
          </span>
        </button>
      </div>

      {/* ── Avatar + greeting ── */}
      <div className="flex flex-col items-center pt-2 pb-5 px-5">
        <PAAvatar size="md" />

        <div className="relative mt-4 bg-[#f8f8f8] rounded-2xl px-5 py-3.5 text-center w-full max-w-xs">
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid #f8f8f8',
            }}
          />
          <p className="text-[15px] font-semibold text-[#1a1a1a]">{getGreeting()}</p>
          <p className="text-[13px] text-gray-500 mt-0.5">{getSubtitle(captures)}</p>
        </div>
      </div>

      {/* ── Category chips ── */}
      <QuickActions selected={selectedCategory} onSelect={setSelectedCategory} />

      {/* ── Record button ── */}
      <div className="flex flex-col items-center mt-6 mb-2">
        <RecordButton onPress={() => handleRecordPress()} size="lg" />
        <p className="text-[12px] text-gray-400 mt-3">
          {selectedCategory
            ? `Tap to record · ${DEFAULT_CATEGORIES.find(c => c.id === selectedCategory)?.label}`
            : 'Tap to record · category optional'}
        </p>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          actionLabel="View →"
          onAction={() => { setToast(null); onNavigate('detail', toast.capture); }}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* ── Recent captures ── */}
      {recentIdeas.length > 0 && (
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">Recent</span>
            <button onClick={() => onNavigate('inbox')} className="text-[12px] text-[#E24B4A] font-semibold">
              See all →
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {recentIdeas.map(idea => (
              <CaptureCard
                key={idea.id}
                capture={idea}
                onPress={() => onNavigate('detail', idea)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
