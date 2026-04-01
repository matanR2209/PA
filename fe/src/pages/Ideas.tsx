import React, { useState } from 'react';
import { IdeaCard } from '../components/IdeaCard';
import { PAAvatar } from '../components/PAAvatar';
import { useIdeas } from '../hooks/useIdeas';
import type { Capture } from '../types';

interface IdeasProps {
  onNavigate: (target: string, data?: Capture) => void;
}

export function Ideas({ onNavigate }: IdeasProps): React.ReactElement {
  const { ideas } = useIdeas();
  const [search, setSearch] = useState('');

  const filtered = ideas.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-white pb-24">
      {/* Header with small PA avatar */}
      <div className="flex items-center gap-3 px-5 pt-10 pb-4 border-b border-gray-100">
        <PAAvatar size="sm" animate={false} />
        <div>
          <p className="text-[13px] text-gray-500">{ideas.length} ideas brewing</p>
          <p className="text-[18px] font-semibold text-[#1a1a1a]">Your Ideas</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 py-3">
        <input
          type="search"
          placeholder="Search ideas..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="w-full bg-[#f5f5f5] text-[#1a1a1a] rounded-xl px-4 py-2.5 outline-none placeholder:text-gray-400 text-[14px]"
        />
      </div>

      {/* List */}
      <div className="px-4 flex flex-col gap-2 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-2">
            <p className="text-[32px]">💡</p>
            <p className="text-[14px] text-gray-400">No ideas yet. Start recording!</p>
          </div>
        ) : (
          filtered.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onPress={() => onNavigate('detail', idea)}
            />
          ))
        )}
      </div>
    </div>
  );
}
