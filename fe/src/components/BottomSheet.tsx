import React, { useEffect } from 'react';

/**
 * Simple slide-up bottom sheet with backdrop.
 * Usage:
 *   <BottomSheet open={bool} onClose={fn} title="…">
 *     …children…
 *   </BottomSheet>
 */
interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps): React.ReactElement | null {
  // Lock body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-3xl pb-10 shadow-2xl animate-slide-up">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Title */}
        {title && (
          <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider text-center pt-2 pb-4 border-b border-gray-100">
            {title}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}
