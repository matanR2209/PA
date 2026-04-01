import React from 'react';

// Heights match the wireframe: 12, 24, 32, 20, 28, 16, 24
const HEIGHTS: number[] = [12, 24, 32, 20, 28, 16, 24];

export function WaveformAnimation(): React.ReactElement {
  return (
    <div className="flex items-center gap-[3px] h-10">
      {HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="w-1 bg-[#E24B4A] rounded-sm"
          style={{
            height: h,
            animation: 'wave-bar 0.8s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes wave-bar {
          0%, 100% { transform: scaleY(1); }
          50%       { transform: scaleY(0.4); }
        }
      `}</style>
    </div>
  );
}
