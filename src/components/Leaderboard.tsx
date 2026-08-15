// src/components/Leaderboard.tsx
import { useEffect, useState, useRef } from 'react';
import { getLiveLeaderboard } from '../services/gameService';
import { supabase } from '../services/supabase';

interface PlayerStat {
  id: string;
  rank: number;
  name: string;
  score: number;
  streak: number;
}

export function Leaderboard() {
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isUserVisible, setIsUserVisible] = useState(true);

  // Refs for tracking scroll position
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const userRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadLeaderboard() {
      // 1. Get the current logged-in user so we know who to highlight
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }

      // 2. Fetch the player list
      const data = await getLiveLeaderboard();
      setPlayers(data);
      setLoading(false);
    }
    loadLeaderboard();
  }, []);

  useEffect(() => {
    // 3. Set up the Intersection Observer to watch the user's row
    if (!userRowRef.current || !scrollContainerRef.current) {
      // If the user's row doesn't exist (e.g. they haven't scored yet) 
      // or isn't on screen, they are not visible.
      setIsUserVisible(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsUserVisible(entry.isIntersecting);
      },
      {
        root: scrollContainerRef.current,
        threshold: 0, // Trigger as soon as 1 pixel leaves or enters the box
      }
    );

    observer.observe(userRowRef.current);

    return () => observer.disconnect();
  }, [players, currentUserId]);

  if (loading) {
    return <div className="text-center font-bold text-[#064E3B] uppercase tracking-widest mt-10 animate-pulse">Loading Ranks...</div>;
  }

  const currentUserStat = players.find(p => p.id === currentUserId);

  // Helper function to render a player row (used for both the list and the sticky bar)
  const renderRow = (player: PlayerStat, isSticky: boolean = false) => {
    const isCurrentUser = player.id === currentUserId;
    const isTopThree = player.rank <= 3 && !isSticky;
    
    // Default Styling
    let bgClass = isTopThree ? 'bg-[#F8F9FA]' : 'bg-white';
    let textClass = 'text-[#064E3B]';
    let rankClass = player.rank === 1 && !isSticky ? 'text-[#FB923C]' : 'text-[#064E3B]';

    // Highlight Styling for Current User in the main list
    if (isCurrentUser && !isSticky) {
      bgClass = 'bg-[#FB923C]'; 
      textClass = 'text-[#064E3B]';
      rankClass = 'text-[#064E3B]';
    }

    // High Contrast Styling for the Sticky Bottom Bar
    if (isSticky) {
      bgClass = 'bg-[#064E3B] shadow-[4px_4px_0px_0px_#FB923C]'; 
      textClass = 'text-white';
      rankClass = 'text-[#FB923C]';
    }

    return (
      <div 
        key={isSticky ? `sticky-${player.id}` : player.id} 
        ref={isCurrentUser && !isSticky ? userRowRef : null}
        className={`flex items-center p-2 border-2 border-[#064E3B] transition-colors ${bgClass}`}
      >
        <div className={`w-12 font-['Anton',_sans-serif] text-2xl ${rankClass}`}>
          #{player.rank}
        </div>
        <div className={`flex-1 font-bold text-lg uppercase truncate pr-2 ${textClass}`}>
          {player.name} {isCurrentUser && !isSticky ? '(YOU)' : ''}
        </div>
        <div className={`w-16 text-center font-bold ${isSticky ? 'text-white' : 'text-[#FB923C]'}`}>
          {player.streak}
        </div>
        <div className={`w-20 text-right font-['Anton',_sans-serif] text-2xl ${textClass}`}>
          {player.score}
        </div>
      </div>
    );
  };

  return (
    // Set a fixed height (h-[600px] with a max of 75vh) and absolute relative positioning
    <div className="w-full max-w-lg mx-auto bg-white border-4 border-[#064E3B] shadow-[8px_8px_0px_0px_#064E3B] p-4 md:p-6 mb-8 animate-fade-in font-['Inter',_sans-serif] relative flex flex-col h-[600px] max-h-[75vh]">
      
      {/* Header (Shrink-0 prevents it from squishing) */}
      <div className="flex justify-between items-end mb-4 border-b-4 border-[#064E3B] pb-4 shrink-0">
        <h2 className="font-['Anton',_sans-serif] text-4xl md:text-5xl text-[#064E3B] uppercase leading-none">
          Standings
        </h2>
        <span className="text-sm font-bold text-[#FB923C] uppercase tracking-widest mb-1">
          Top 50
        </span>
      </div>

      {/* Column Titles */}
      <div className="flex text-xs font-black text-[#57534E] uppercase tracking-widest px-2 mb-2 shrink-0">
        <div className="w-12">Rank</div>
        <div className="flex-1">Player</div>
        <div className="w-16 text-center" title="Current Streak">🔥</div>
        <div className="w-20 text-right">Score</div>
      </div>

      {/* Scrollable Infinite Player List */}
      <div 
        ref={scrollContainerRef} 
        className="flex flex-col gap-3 overflow-y-auto pb-20 flex-1 pr-2"
      >
        {players.length === 0 ? (
          <div className="text-center p-4 text-gray-500 font-bold uppercase">No scores yet. Be the first!</div>
        ) : (
          players.map((player) => renderRow(player))
        )}
      </div>

      {/* Sticky Current User Bar (Renders ONLY when user is out of view) */}
      {!isUserVisible && currentUserStat && (
        <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-white via-white to-transparent pt-10">
          {renderRow(currentUserStat, true)}
        </div>
      )}

    </div>
  );
}