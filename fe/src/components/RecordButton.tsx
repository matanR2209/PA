import React from 'react';

type ButtonSize = 'sm' | 'md' | 'lg';

interface RecordButtonProps {
  isRecording?: boolean;
  onPress: React.PointerEventHandler<HTMLButtonElement>;
  size?: ButtonSize;
  disabled?: boolean;
}

export function RecordButton({ isRecording, onPress, size = 'lg', disabled = false }: RecordButtonProps): React.ReactElement {
  const sizes: Record<ButtonSize, { btn: string; dot: string }> = {
    sm: { btn: 'w-12 h-12', dot: 'w-4 h-4' },
    md: { btn: 'w-16 h-16', dot: 'w-5 h-5' },
    lg: { btn: 'w-[72px] h-[72px]', dot: 'w-6 h-6' },
  };
  const s = sizes[size];

  return (
    <button
      onPointerDown={onPress}
      disabled={disabled}
      className={`
        ${s.btn} rounded-full flex items-center justify-center
        transition-all duration-200 active:scale-95 disabled:opacity-50
        ${isRecording ? 'bg-[#f0f0f0]' : ''}
      `}
      style={
        !isRecording
          ? {
              background: 'linear-gradient(135deg, #E24B4A, #D85A30)',
              boxShadow: '0 6px 24px rgba(226,75,74,0.4)',
            }
          : {}
      }
    >
      {isRecording ? (
        /* Stop: coral square */
        <div className="w-5 h-5 rounded-[4px] bg-[#E24B4A]" />
      ) : (
        /* Record: white circle */
        <div className={`${s.dot} rounded-full bg-white`} />
      )}
    </button>
  );
}
