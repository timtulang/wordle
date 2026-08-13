// src/components/Leaderboard.tsx
import { useEffect, useState } from 'react';
import { getLiveLeaderboard } from '../services/gameService';

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

  useEffect(() => {
    async function loadLeaderboard() {
      const data = await getLiveLeaderboard();
      setPlayers(data);
      setLoading(false);
    }
    loadLeaderboard();
  }, []);

  if (loading) {
    return <div className="text-center font-bold text-[#064E3B] uppercase tracking-widest mt-10 animate-pulse">Loading Ranks...</div>;
  }

  return (
    <div className="w-full max-w-lg mx-auto bg-white border-4 border-[#064E3B] shadow-[8px_8px_0px_0px_#064E3B] p-4 md:p-6 mb-8 animate-fade-in font-['Inter',_sans-serif]">
      <div className="flex justify-between items-end mb-6 border-b-4 border-[#064E3B] pb-4">
        <h2 className="font-['Anton',_sans-serif] text-4xl md:text-5xl text-[#064E3B] uppercase leading-none">
          Standings
        </h2>
        <span className="text-sm font-bold text-[#FB923C] uppercase tracking-widest mb-1">
          Top 50
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {/* Header Row */}
        <div className="flex text-xs font-black text-[#57534E] uppercase tracking-widest px-2">
          <div className="w-12">Rank</div>
          <div className="flex-1">Player</div>
          <div className="w-16 text-center" title="Current Streak">🔥</div>
          <div className="w-20 text-right">Score</div>
        </div>

        {/* Player Rows */}
        {players.length === 0 ? (
          <div className="text-center p-4 text-gray-500 font-bold uppercase">No scores yet. Be the first!</div>
        ) : (
          players.map((player) => {
            const isTopThree = player.rank <= 3;
            return (
              <div 
                key={player.id} 
                className={`flex items-center p-2 border-2 border-[#064E3B] ${
                  isTopThree ? 'bg-[#F8F9FA]' : 'bg-white'
                }`}
              >
                <div className={`w-12 font-['Anton',_sans-serif] text-2xl ${
                  player.rank === 1 ? 'text-[#FB923C]' : 'text-[#064E3B]'
                }`}>
                  #{player.rank}
                </div>
                <div className="flex-1 font-bold text-lg text-[#064E3B] uppercase truncate pr-2">
                  {player.name}
                </div>
                <div className="w-16 text-center font-bold text-[#FB923C]">
                  {player.streak}
                </div>
                <div className="w-20 text-right font-['Anton',_sans-serif] text-2xl text-[#064E3B]">
                  {player.score}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}