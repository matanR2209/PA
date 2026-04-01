/**
 * DEV ONLY — Avatar concept showcase
 * Remove this file before production
 */
import React from 'react';

interface AvatarOption {
  id: number;
  name: string;
  desc: string;
  svg: React.ReactElement;
}

const options: AvatarOption[] = [
  {
    id: 1,
    name: 'Orb (current)',
    desc: 'Warm gradient orb with white dot',
    svg: (
      <svg viewBox="0 0 80 80" width="72" height="72">
        <defs>
          <radialGradient id="o1" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#F06A4A" />
            <stop offset="100%" stopColor="#C04020" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="36" fill="url(#o1)" />
        <circle cx="40" cy="40" r="10" fill="white" opacity="0.9" />
      </svg>
    ),
  },
  {
    id: 2,
    name: 'Pulse Ring',
    desc: 'Soft glow with concentric rings',
    svg: (
      <svg viewBox="0 0 80 80" width="72" height="72">
        <defs>
          <radialGradient id="o2" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#7B6EF6" />
            <stop offset="100%" stopColor="#4A3DD1" />
          </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="36" fill="url(#o2)" opacity="0.15" />
        <circle cx="40" cy="40" r="28" fill="url(#o2)" opacity="0.3" />
        <circle cx="40" cy="40" r="20" fill="url(#o2)" />
        <circle cx="40" cy="40" r="7" fill="white" />
      </svg>
    ),
  },
  {
    id: 3,
    name: 'Spark Face',
    desc: 'Minimal eyes + smile, friendly AI',
    svg: (
      <svg viewBox="0 0 80 80" width="72" height="72">
        <defs>
          <linearGradient id="o3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F9A03F" />
            <stop offset="100%" stopColor="#E24B4A" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r="36" fill="url(#o3)" />
        <circle cx="30" cy="36" r="5" fill="white" />
        <circle cx="50" cy="36" r="5" fill="white" />
        <circle cx="31" cy="35" r="2.5" fill="#E24B4A" />
        <circle cx="51" cy="35" r="2.5" fill="#E24B4A" />
        <path d="M 28 50 Q 40 58 52 50" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 4,
    name: 'Neural',
    desc: 'Connected nodes — brain / AI network',
    svg: (
      <svg viewBox="0 0 80 80" width="72" height="72">
        <defs>
          <linearGradient id="o4" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#11C5A0" />
            <stop offset="100%" stopColor="#0A8A72" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r="36" fill="url(#o4)" />
        <circle cx="40" cy="24" r="5" fill="white" opacity="0.9" />
        <circle cx="24" cy="46" r="5" fill="white" opacity="0.9" />
        <circle cx="56" cy="46" r="5" fill="white" opacity="0.9" />
        <circle cx="40" cy="56" r="4" fill="white" opacity="0.6" />
        <line x1="40" y1="24" x2="24" y2="46" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <line x1="40" y1="24" x2="56" y2="46" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <line x1="24" y1="46" x2="56" y2="46" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <line x1="24" y1="46" x2="40" y2="56" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <line x1="56" y1="46" x2="40" y2="56" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <circle cx="40" cy="40" r="4" fill="white" />
      </svg>
    ),
  },
  {
    id: 5,
    name: 'Gem',
    desc: 'Sharp geometric diamond — precise, premium',
    svg: (
      <svg viewBox="0 0 80 80" width="72" height="72">
        <defs>
          <linearGradient id="o5" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r="36" fill="#EFF6FF" />
        <polygon points="40,14 62,36 40,66 18,36" fill="url(#o5)" />
        <polygon points="40,14 62,36 40,36" fill="#93C5FD" opacity="0.6" />
        <polygon points="18,36 40,36 40,66" fill="#1D4ED8" opacity="0.4" />
        <line x1="18" y1="36" x2="62" y2="36" stroke="white" strokeWidth="1" opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 6,
    name: 'Waveform',
    desc: 'Audio bars inside a circle — voice-first',
    svg: (
      <svg viewBox="0 0 80 80" width="72" height="72">
        <defs>
          <linearGradient id="o6" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E24B4A" />
            <stop offset="100%" stopColor="#D85A30" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r="36" fill="url(#o6)" />
        {([
          [22, 14], [29, 22], [36, 10], [43, 26], [50, 10], [57, 20], [64, 16]
        ] as [number, number][]).map(([x, h], i) => (
          <rect key={i} x={x - 2.5} y={40 - h / 2} width="5" height={h} rx="3" fill="white" opacity="0.9" />
        ))}
      </svg>
    ),
  },
  {
    id: 7,
    name: 'Infinity',
    desc: 'Endless ideas, continuous loop',
    svg: (
      <svg viewBox="0 0 80 80" width="72" height="72">
        <defs>
          <linearGradient id="o7" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r="36" fill="url(#o7)" />
        <path
          d="M 22 40 C 22 30, 32 30, 40 40 C 48 50, 58 50, 58 40 C 58 30, 48 30, 40 40 C 32 50, 22 50, 22 40 Z"
          fill="none" stroke="white" strokeWidth="4" strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 8,
    name: 'Star Burst',
    desc: 'Siri-like sparkle — magical assistant',
    svg: (
      <svg viewBox="0 0 80 80" width="72" height="72">
        <defs>
          <linearGradient id="o8" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <circle cx="40" cy="40" r="36" fill="url(#o8)" />
        <path d="M40 16 L44 36 L64 40 L44 44 L40 64 L36 44 L16 40 L36 36 Z" fill="white" opacity="0.95" />
        <circle cx="40" cy="40" r="5" fill="white" />
      </svg>
    ),
  },
];

export function AvatarShowcase(): React.ReactElement {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f9f9f9', minHeight: '100vh', padding: '24px 16px' }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>PA Avatar Options</h1>
      <p style={{ fontSize: 12, color: '#888', marginBottom: 24 }}>Pick your favourite — I'll replace the current one</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {options.map(({ id, name, desc, svg }) => (
          <div key={id} style={{
            background: 'white',
            borderRadius: 20,
            padding: '20px 12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          }}>
            {svg}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{id}. {name}</p>
              <p style={{ fontSize: 11, color: '#999', margin: '3px 0 0' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
