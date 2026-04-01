import React from 'react';

interface IconProps {
  active: boolean;
}

interface Tab {
  id: string;
  label: string;
  icon: (props: IconProps) => React.ReactElement;
}

const TABS: Tab[] = [
  {
    id: 'home',
    label: 'Home',
    icon: ({ active }: IconProps) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 10.5L12 3L21 10.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V10.5Z"
          fill={active ? '#E24B4A' : 'none'}
          stroke={active ? '#E24B4A' : '#bbb'}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'inbox',
    label: 'Inbox',
    icon: ({ active }: IconProps) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M2 12L5 4H19L22 12V19C22 19.55 21.55 20 21 20H3C2.45 20 2 19.55 2 19V12Z"
          fill={active ? '#7B6EF6' : 'none'}
          stroke={active ? '#7B6EF6' : '#bbb'}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M2 12H7L9 15H15L17 12H22"
          stroke={active ? 'white' : '#bbb'}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: ({ active }: IconProps) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect
          x="3" y="3" width="18" height="18" rx="4"
          fill={active ? '#22c55e' : 'none'}
          stroke={active ? '#22c55e' : '#bbb'}
          strokeWidth="1.8"
        />
        <path
          d="M7.5 12L10.5 15L16.5 9"
          stroke={active ? 'white' : '#bbb'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'search',
    label: 'Search',
    icon: ({ active }: IconProps) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle
          cx="10.5" cy="10.5" r="6.5"
          fill={active ? '#F59E0B' : 'none'}
          stroke={active ? '#F59E0B' : '#bbb'}
          strokeWidth="1.8"
        />
        <path
          d="M15.5 15.5L20 20"
          stroke={active ? '#F59E0B' : '#bbb'}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

interface BottomNavProps {
  current: string;
  onChange: (tab: string) => void;
}

export function BottomNav({ current, onChange }: BottomNavProps): React.ReactElement {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex safe-bottom">
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = current === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className="flex-1 flex flex-col items-center py-3 gap-1 transition-opacity active:opacity-60"
          >
            <Icon active={active} />
            <span className={`text-[11px] font-semibold ${active ? 'text-[#1a1a1a]' : 'text-gray-400'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
