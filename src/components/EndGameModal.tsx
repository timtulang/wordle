import { useState } from 'react';
import { type GameStatus, type GuessResult } from '../types/game';
import { calculateScore, generateShareText } from '../utils/gameUtils';

interface EndGameModalProps {
  status: GameStatus;
  guesses: GuessResult[];
  puzzleDate: string; // e.g., "Aug 16"
}

export function EndGameModal({ status, guesses, puzzleDate }: EndGameModalProps) {
  const [copied, setCopied] = useState(false);

  if (status === 'playing') return null;

  const score = calculateScore(guesses.length, status);
  const isWin = status === 'won';

  const handleShare = async () => {
    const text = generateShareText(guesses, status, puzzleDate);
    
    // Try native mobile sharing first, fallback to clipboard
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (e) {
        copyToClipboard(text);
      }
    } else {
      copyToClipboard(text);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full flex flex-col items-center p-6 bg-white border-4 border-[#064E3B] shadow-[8px_8px_0px_0px_#064E3B] animate-fade-in font-['Inter',_sans-serif]">
      <h2 className="font-['Anton',_sans-serif] text-4xl text-[#064E3B] uppercase mb-1">
        {isWin ? 'Step Taken' : 'Frozen'}
      </h2>
      <p className="text-[#57534E] font-medium mb-6 text-center text-sm">
        {isWin 
          ? "You unlocked another piece of the message." 
          : "Sometimes we hesitate. The next step is waiting tomorrow."}
      </p>

      {/* Stats Row */}
      <div className="flex gap-4 w-full justify-center mb-6">
        <StatBox label="Score" value={score.toString()} />
        <StatBox label="Guesses" value={isWin ? guesses.length.toString() : 'X'} />
        <StatBox label="Streak" value={isWin ? '1' : '0'} /> {/* We'll make this dynamic later */}
      </div>

      {/* Share Button */}
      <button 
        onClick={handleShare}
        className="w-full py-4 bg-[#FB923C] text-[#064E3B] font-['Anton',_sans-serif] text-2xl uppercase tracking-wider border-4 border-[#064E3B] shadow-[4px_4px_0px_0px_#064E3B] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
      >
        {copied ? 'COPIED TO CLIPBOARD!' : 'SHARE RESULT'}
      </button>
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 border-2 border-[#064E3B] bg-[#F8F9FA] min-w-[80px]">
      <div className="font-['Anton',_sans-serif] text-3xl text-[#064E3B]">{value}</div>
      <div className="text-xs font-bold uppercase tracking-widest text-[#57534E] mt-1">{label}</div>
    </div>
  );
}