import React, { useState } from 'react';
import { PAAvatar } from '../components/PAAvatar';
import { useCaptures } from '../hooks/useCaptures';
import { DEFAULT_CATEGORIES } from '../components/QuickActions';
import type { Capture, Task } from '../types';

type NavigateTarget = 'home' | 'inbox' | 'tasks' | 'search' | 'detail';

interface TasksProps {
  onNavigate: (target: NavigateTarget, data?: Capture) => void;
}

const DATE_PILLS = ['Upcoming', 'Flexible', 'Done'];

function fmtScheduled(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

interface TaskCardProps {
  capture: Capture;
  onToggle: () => void;
  onPress: () => void;
}

function TaskCard({ capture, onToggle, onPress }: TaskCardProps): React.ReactElement {
  const { task } = capture;
  const cat = DEFAULT_CATEGORIES.find(c => c.id === capture.category);

  return (
    <div
      onClick={onPress}
      className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm active:bg-gray-50 transition-colors"
    >
      {/* Checkbox */}
      <button
        onClick={e => { e.stopPropagation(); onToggle(); }}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          task!.done ? 'bg-green-500 border-green-500' : 'border-gray-300'
        }`}
      >
        {task!.done && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-semibold leading-snug truncate ${task!.done ? 'line-through text-gray-400' : 'text-[#1a1a1a]'}`}>
          {capture.title}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {cat && <span className="text-[11px] text-gray-400">{cat.emoji} {cat.label}</span>}
          {cat && task && <span className="text-[10px] text-gray-300">·</span>}
          {task!.type === 'scheduled' && (
            <span className="text-[11px] text-[#E24B4A] font-medium">{fmtScheduled(task!.scheduledAt!)}</span>
          )}
          {task!.type === 'flexible' && (
            <span className="text-[11px] text-[#7B6EF6] font-medium">
              🔄 {task!.duration}min · {new Date(task!.rangeFrom!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(task!.rangeTo!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" className="flex-shrink-0">
        <path d="M1 1L6 6L1 11" stroke="#ccc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

export function Tasks({ onNavigate }: TasksProps): React.ReactElement {
  const { captures, updateCapture } = useCaptures();
  const [activePill, setActivePill] = useState('Upcoming');

  // All captures that have a task scheduled
  const allTasks = captures.filter(c => c.task);

  const scheduled = allTasks.filter(c => c.task!.type === 'scheduled' && !c.task!.done)
    .sort((a, b) => new Date(a.task!.scheduledAt!).getTime() - new Date(b.task!.scheduledAt!).getTime());

  const flexible = allTasks.filter(c => c.task!.type === 'flexible' && !c.task!.done)
    .sort((a, b) => new Date(a.task!.rangeFrom!).getTime() - new Date(b.task!.rangeFrom!).getTime());

  const done = allTasks.filter(c => c.task!.done)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function toggleTask(capture: Capture): void {
    const updated: Capture = { ...capture, task: { ...capture.task!, done: !capture.task!.done } };
    updateCapture(updated);
  }

  const pendingCount = scheduled.length + flexible.length;

  const listForPill = activePill === 'Upcoming' ? scheduled
    : activePill === 'Flexible' ? flexible
    : done;

  return (
    <div className="flex flex-col min-h-screen bg-[#f9f9f9] pb-24">

      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <PAAvatar size="sm" animate={false} />
          <div>
            <p className="text-[13px] text-gray-500">
              {pendingCount > 0 ? `${pendingCount} pending task${pendingCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
            <p className="text-[20px] font-bold text-[#1a1a1a]">Tasks</p>
          </div>
        </div>

        {/* Pill filter */}
        <div className="flex gap-2 mt-3">
          {DATE_PILLS.map(pill => (
            <button
              key={pill}
              onClick={() => setActivePill(pill)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                activePill === pill
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-[#f0f0f0] text-gray-500'
              }`}
            >
              {pill}
              {pill === 'Upcoming' && scheduled.length > 0 && (
                <span className="ml-1.5 bg-[#E24B4A] text-white text-[10px] rounded-full px-1.5 py-0.5">{scheduled.length}</span>
              )}
              {pill === 'Flexible' && flexible.length > 0 && (
                <span className="ml-1.5 bg-[#7B6EF6] text-white text-[10px] rounded-full px-1.5 py-0.5">{flexible.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="px-4 pt-4 flex flex-col gap-2">
        {listForPill.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-3 text-center px-8">
            <span className="text-[48px]">
              {activePill === 'Done' ? '🎉' : '📋'}
            </span>
            <p className="text-[17px] font-semibold text-[#1a1a1a]">
              {activePill === 'Done' ? 'No completed tasks yet' : 'No tasks here'}
            </p>
            <p className="text-[13px] text-gray-400 leading-relaxed">
              {activePill === 'Done'
                ? 'Complete tasks and they will appear here.'
                : 'Open any capture and tap ⋯ → Create task to schedule it.'}
            </p>
          </div>
        ) : (
          listForPill.map(capture => (
            <TaskCard
              key={capture.id}
              capture={capture}
              onToggle={() => toggleTask(capture)}
              onPress={() => onNavigate?.('detail', capture)}
            />
          ))
        )}
      </div>
    </div>
  );
}
