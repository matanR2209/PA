import React, { useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { RecordButton } from '../components/RecordButton';
import { WaveformAnimation } from '../components/WaveformAnimation';
import { useRecorder } from '../hooks/useRecorder';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useIdeas } from '../hooks/useIdeas';
import type { Capture } from '../types';

interface IdeaDetailProps {
  idea: Capture;
  onBack: () => void;
}

export function IdeaDetail({ idea: initialIdea, onBack }: IdeaDetailProps): React.ReactElement {
  const { updateIdea, removeIdea } = useIdeas();
  const [idea, setIdea] = useState<Capture>(initialIdea);
  const { isRecording, startRecording, stopRecording } = useRecorder();
  const { transcript, isListening, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const [addedNote, setAddedNote] = useState('');
  const [capturedNote, setCapturedNote] = useState('');

  async function handleRecordPress(): Promise<void> {
    if (isRecording) {
      const [, text] = await Promise.all([
        stopRecording(),
        isSupported ? stopListening() : Promise.resolve(''),
      ]);
      if (text && text.trim()) setCapturedNote(text.trim());
    } else {
      await startRecording();
      if (isSupported) startListening();
    }
  }

  function handleAddNote(): void {
    const note = capturedNote || addedNote;
    if (!note.trim()) return;
    const updated = { ...idea, content: idea.content + '\n\n' + note };
    updateIdea(updated);
    setIdea(updated);
    resetTranscript();
    setCapturedNote('');
    setAddedNote('');
  }

  function handleDelete(): void {
    if (confirm('Delete this idea?')) {
      removeIdea(idea.id);
      onBack();
    }
  }

  const dateStr = new Date(idea.createdAt).toLocaleDateString('he-IL', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 border-b border-gray-100">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-gray-400">
          <ArrowLeft size={22} />
        </button>
        <button onClick={handleDelete} className="w-10 h-10 flex items-center justify-center text-gray-400">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="px-5 pt-5 flex-1">
        <h1 className="text-[20px] font-semibold text-[#1a1a1a] mb-1" dir="auto">{idea.title}</h1>
        <p className="text-[12px] text-gray-400 mb-5">{dateStr}</p>

        <div className="bg-[#f8f8f8] rounded-xl p-4 mb-6">
          <p className="text-[15px] text-[#333] leading-relaxed whitespace-pre-wrap" dir="auto">{idea.content}</p>
        </div>

        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium mb-4">Add more</p>

        <div className="flex flex-col items-center gap-4">
          {(isRecording || isListening) && <WaveformAnimation />}

          <RecordButton
            isRecording={isRecording || isListening}
            onPress={handleRecordPress}
            size="md"
          />

          {capturedNote && (
            <div className="w-full bg-[#f0faf0] border border-green-200 rounded-xl p-4">
              <p className="text-[12px] text-green-600 font-medium mb-1">Captured</p>
              <p className="text-[14px] text-[#333]" dir="auto">{capturedNote}</p>
            </div>
          )}

          <textarea
            className="w-full bg-[#f8f8f8] text-[#1a1a1a] rounded-xl px-4 py-3 outline-none placeholder:text-gray-400 text-[14px] resize-none"
            rows={3}
            placeholder={capturedNote ? 'Or add a typed note...' : 'Add a note...'}
            value={addedNote}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setAddedNote(e.target.value)}
            dir="auto"
          />

          {(capturedNote || addedNote.trim()) && (
            <button
              onClick={handleAddNote}
              className="w-full py-2.5 rounded-xl text-white font-semibold text-[13px]"
              style={{ background: 'linear-gradient(135deg, #E24B4A, #D85A30)' }}
            >
              Add to Idea
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
