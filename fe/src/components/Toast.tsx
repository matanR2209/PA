import React, { useEffect } from 'react';

/**
 * Slide-up toast notification.
 * Auto-dismisses after `duration` ms (default 3500).
 */
interface ToastProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, actionLabel, onAction, onDismiss, duration = 3500 }: ToastProps): React.ReactElement {
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  return (
    <div
      className="fixed bottom-24 left-4 right-4 z-50 flex items-center gap-3 bg-[#1a1a1a] text-white rounded-2xl px-4 py-3.5 shadow-xl animate-slide-up"
      style={{ maxWidth: 420, margin: '0 auto' }}
    >
      <span className="text-[18px]">✅</span>
      <p className="flex-1 text-[13px] font-medium leading-snug">{message}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="text-[13px] font-bold text-[#E24B4A] flex-shrink-0 active:opacity-70"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
