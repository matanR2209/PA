import React, { useState } from 'react';
import { Home } from './pages/Home';
import { Inbox } from './pages/Inbox';
import { Tasks } from './pages/Tasks';
import { Search } from './pages/Search';
import { CaptureDetail } from './pages/CaptureDetail';
import { BottomNav } from './components/BottomNav';
import { AvatarShowcase } from './pages/AvatarShowcase';
import { Desktop } from './pages/Desktop';
import type { Capture } from './types';

type Tab = 'home' | 'inbox' | 'tasks' | 'search';
type NavigateTarget = Tab | 'detail';

export default function App(): React.ReactElement {
  const [tab, setTab] = useState<Tab>('home');
  const [detail, setDetail] = useState<Capture | null>(null);

  function handleNavigate(target: NavigateTarget, data?: Capture): void {
    if (target === 'detail') {
      setDetail(data ?? null);
    } else {
      setTab(target);
      setDetail(null);
    }
  }

  if (detail) {
    return <CaptureDetail capture={detail} onBack={() => setDetail(null)} />;
  }

  // DEV — remove before production
  if (window.location.search.includes('avatars')) {
    return <AvatarShowcase />;
  }

  // Desktop view
  if (window.location.pathname === '/desktop') {
    return <Desktop />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-md flex-1 relative">
        {tab === 'home'   && <Home  onNavigate={handleNavigate} />}
        {tab === 'inbox'  && <Inbox onNavigate={handleNavigate} />}
        {tab === 'tasks'  && <Tasks onNavigate={handleNavigate} />}
        {tab === 'search' && <Search onNavigate={handleNavigate} />}
        <BottomNav current={tab} onChange={(t) => setTab(t as Tab)} />
      </div>
    </div>
  );
}
