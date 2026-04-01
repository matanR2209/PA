import React, { useState } from 'react';
import type { Capture, Task } from '../types';

interface DurationPreset {
  label: string;
  value: number;
}

const DURATION_PRESETS: DurationPreset[] = [
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 h',    value: 60 },
  { label: '2 h',    value: 120 },
  { label: '3 h+',   value: 180 },
];

function toDatetimeLocal(date: Date): string {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

function toDateOnly(date: Date): string {
  return toDatetimeLocal(date).slice(0, 10);
}

const tomorrow    = new Date(Date.now() + 86_400_000);
const dayAfter    = new Date(Date.now() + 172_800_000);
const tomorrowAt9 = new Date(tomorrow);
tomorrowAt9.setHours(9, 0, 0, 0);

type SchedulerMode = 'scheduled' | 'flexible';

interface TaskSchedulerSheetProps {
  capture: Capture;
  onSchedule: (task: Task) => void;
  onClose: () => void;
}

export function TaskSchedulerSheet({ capture, onSchedule, onClose }: TaskSchedulerSheetProps): React.ReactElement {
  const [mode, setMode] = useState<SchedulerMode>('scheduled');

  // Scheduled mode state
  const [scheduledAt, setScheduledAt] = useState(toDatetimeLocal(tomorrowAt9));

  // Flexible mode state
  const [duration, setDuration]   = useState<number | null>(null);
  const [rangeFrom, setRangeFrom] = useState(toDateOnly(tomorrow));
  const [rangeTo,   setRangeTo]   = useState(toDateOnly(dayAfter));

  function handleSubmit(): void {
    if (mode === 'scheduled') {
      onSchedule({
        type: 'scheduled',
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration: null,
        rangeFrom: null,
        rangeTo: null,
        done: false,
      });
    } else {
      if (!duration) return;
      onSchedule({
        type: 'flexible',
        scheduledAt: null,
        duration,
        rangeFrom: new Date(rangeFrom).toISOString(),
        rangeTo:   new Date(rangeTo).toISOString(),
        done: false,
      });
    }
  }

  const canSubmit = mode === 'scheduled' || (mode === 'flexible' && duration !== null);

  return (
    <div className="px-5 pt-3 pb-2 space-y-5">

      {/* Capture title reminder */}
      <div className="bg-[#f8f8f8] rounded-xl px-4 py-3">
        <p className="text-[12px] text-gray-400 mb-0.5">Scheduling</p>
        <p className="text-[14px] font-semibold text-[#1a1a1a] line-clamp-1" dir="auto">{capture.title}</p>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-[#f2f2f2] rounded-xl p-1 gap-1">
        {([
          { id: 'scheduled' as SchedulerMode, label: '📅 Scheduled' },
          { id: 'flexible' as SchedulerMode,  label: '🔄 Flexible' },
        ] as const).map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-all ${
              mode === m.id ? 'bg-white shadow-sm text-[#1a1a1a]' : 'text-gray-400'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Scheduled mode ── */}
      {mode === 'scheduled' && (
        <div className="space-y-2">
          <p className="text-[12px] font-semibold text-gray-500">Date & time</p>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setScheduledAt(e.target.value)}
            className="w-full bg-[#f8f8f8] rounded-xl px-4 py-3 text-[15px] text-[#1a1a1a] outline-none border border-transparent focus:border-[#E24B4A]/30"
          />
        </div>
      )}

      {/* ── Flexible mode ── */}
      {mode === 'flexible' && (
        <div className="space-y-4">

          {/* Duration */}
          <div>
            <p className="text-[12px] font-semibold text-gray-500 mb-2">How long will it take?</p>
            <div className="flex gap-2 flex-wrap">
              {DURATION_PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => setDuration(p.value)}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all active:scale-95 ${
                    duration === p.value
                      ? 'text-white shadow-sm'
                      : 'bg-[#f2f2f2] text-gray-600'
                  }`}
                  style={duration === p.value
                    ? { background: 'linear-gradient(135deg, #E24B4A, #D85A30)' }
                    : {}
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div>
            <p className="text-[12px] font-semibold text-gray-500 mb-2">Schedule between</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={rangeFrom}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRangeFrom(e.target.value)}
                className="flex-1 bg-[#f8f8f8] rounded-xl px-3 py-2.5 text-[14px] text-[#1a1a1a] outline-none"
              />
              <span className="text-gray-400 text-[13px]">→</span>
              <input
                type="date"
                value={rangeTo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRangeTo(e.target.value)}
                className="flex-1 bg-[#f8f8f8] rounded-xl px-3 py-2.5 text-[14px] text-[#1a1a1a] outline-none"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-2 text-center">
              PA will find the best time slot for you ✨
            </p>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-3.5 rounded-2xl text-white text-[15px] font-bold disabled:opacity-40 transition-opacity active:opacity-80"
        style={{ background: 'linear-gradient(135deg, #E24B4A, #D85A30)' }}
      >
        {mode === 'scheduled' ? 'Schedule task' : 'Find me a slot'}
      </button>
    </div>
  );
}
