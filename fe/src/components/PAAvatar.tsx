type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<AvatarSize, { px: number; ring: number }> = {
  sm: { px: 36,  ring: 52  },
  md: { px: 56,  ring: 72  },
  lg: { px: 80,  ring: 100 },
  xl: { px: 96,  ring: 118 },
};

interface PAAvatarProps {
  size?: AvatarSize;
  animate?: boolean;
}

export function PAAvatar({ size = 'md', animate = true }: PAAvatarProps): React.ReactElement {
  const { px, ring } = SIZES[size];
  const id = `face-grad-${size}`;

  return (
    <div className="relative flex items-center justify-center" style={{ width: ring, height: ring }}>
      {/* Pulse ring */}
      {animate && (
        <div
          className="absolute rounded-full border-2 border-[#E24B4A]/20"
          style={{
            width: ring,
            height: ring,
            animation: 'pa-ring 2.2s ease-in-out infinite',
          }}
        />
      )}

      {/* Face SVG */}
      <svg
        width={px}
        height={px}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: `drop-shadow(0 4px 14px rgba(226,75,74,0.30))` }}
      >
        <defs>
          <radialGradient id={id} cx="38%" cy="32%" r="70%">
            <stop offset="0%"   stopColor="#FAB14A" />
            <stop offset="55%"  stopColor="#E24B4A" />
            <stop offset="100%" stopColor="#C43820" />
          </radialGradient>
        </defs>

        {/* Background circle */}
        <circle cx="40" cy="40" r="36" fill={`url(#${id})`} />

        {/* Left eye — white sclera */}
        <circle cx="29" cy="35" r="6" fill="white" opacity="0.95" />
        {/* Right eye — white sclera */}
        <circle cx="51" cy="35" r="6" fill="white" opacity="0.95" />

        {/* Left pupil */}
        <circle cx="30.5" cy="34" r="3" fill="#C43820" />
        {/* Right pupil */}
        <circle cx="52.5" cy="34" r="3" fill="#C43820" />

        {/* Left eye shine */}
        <circle cx="32" cy="32.5" r="1.2" fill="white" opacity="0.9" />
        {/* Right eye shine */}
        <circle cx="54" cy="32.5" r="1.2" fill="white" opacity="0.9" />

        {/* Smile */}
        <path
          d="M 27 50 Q 40 60 53 50"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.95"
        />
      </svg>

      <style>{`
        @keyframes pa-ring {
          0%, 100% { transform: scale(1);   opacity: 0.8; }
          50%       { transform: scale(1.1); opacity: 0.2; }
        }
      `}</style>
        TEST123
    </div>
  );
}
