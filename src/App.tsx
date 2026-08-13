// src/App.tsx
import { useEffect, useState } from 'react';
import { type Session } from '@supabase/supabase-js';
import { supabase } from './services/supabase';
import { Auth } from './components/Auth';
import { useGameEngine } from './hooks/gameEngine';
import { Board } from './components/Board';
import { Keyboard } from './components/Keyboard';
import { VerseProgress } from './components/VerseProgress';
import { EndGameModal } from './components/EndGameModal';
import { Leaderboard } from './components/Leaderboard';
import { VALID_WORDS } from './data/validWords';
import { submitGameAttempt, getTodayPuzzle, getUnlockedFragments } from './services/gameService';

// ----------------------------------------------------------------------
// 1. MAIN APP COMPONENT (Handles Authentication)
// ----------------------------------------------------------------------
export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-['Inter',_sans-serif]">
        <div className="font-black text-2xl text-[#064E3B] uppercase tracking-widest animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  // Load the LIVE game wrapper instead of the Dev one
  return <LiveGameWrapper session={session} />;
}

// ----------------------------------------------------------------------
// 2. LIVE GAME WRAPPER (Enforces daily puzzle logic)
// ----------------------------------------------------------------------
function LiveGameWrapper({  }: { session: Session }) {
  const [puzzle, setPuzzle] = useState<any>(null);
  const [unlockedFragments, setUnlockedFragments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDaily() {
      const todayPuzzle = await getTodayPuzzle();
      const fragments = await getUnlockedFragments();
      
      setPuzzle(todayPuzzle);
      setUnlockedFragments(fragments);
      setLoading(false);
    }
    loadDaily();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-['Inter',_sans-serif]">
        <div className="font-black text-2xl text-[#064E3B] uppercase tracking-widest animate-pulse">
          Syncing...
        </div>
      </div>
    );
  }

  // PRE-EVENT SCREEN: If there is no puzzle for today in the database
  if (!puzzle) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-['Inter',_sans-serif]">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#064E3B 1px, transparent 1px)', backgroundSize: '4px 4px' }}>
        </div>
        
        <h1 className="font-['Anton',_sans-serif] text-7xl md:text-9xl text-[#064E3B] uppercase leading-[0.8] shadow-sm mb-2 z-10">
          Last Step
        </h1>
        <span className="font-['Rock_Salt',_cursive] text-3xl md:text-5xl text-[#FB923C] -rotate-6 -mt-4 mb-16 z-10 drop-shadow-md">
          syndrome
        </span>
        
        <div className="bg-white p-8 md:p-12 border-4 border-[#064E3B] shadow-[8px_8px_0px_0px_#064E3B] z-10 max-w-lg w-full">
          <h2 className="font-['Anton',_sans-serif] text-4xl uppercase mb-4 text-[#064E3B] tracking-wide">
            Next Step Tomorrow
          </h2>
          <p className="text-gray-600 font-medium mb-8 text-lg leading-relaxed">
            There is no puzzle available for today. Come back when the event begins.
          </p>
        </div>
      </div>
    );
  }

  return <ActiveGame puzzle={puzzle} unlockedFragments={unlockedFragments} />;
}

// ----------------------------------------------------------------------
// 3. ACTIVE GAME COMPONENT
// ----------------------------------------------------------------------
function ActiveGame({ puzzle, unlockedFragments }: { puzzle: any, unlockedFragments: string[] }) {
  const [activeView, setActiveView] = useState<'game' | 'leaderboard'>('game');
  
  const { guesses, currentGuess, gameStatus, errorMessage, onKeyPress } = useGameEngine(
    puzzle.answer,
    VALID_WORDS 
  );

  const BYPASS_DB_SAVE = false;

  useEffect(() => {
    if (gameStatus === 'won' || gameStatus === 'lost') {
      const isSolved = gameStatus === 'won';
      
      if (BYPASS_DB_SAVE) return;

      submitGameAttempt(puzzle.id, guesses.length, isSolved)
        .then(() => console.log("Score securely saved!"))
        .catch(err => console.error("Failed to save score.", err));
    }
  }, [gameStatus, puzzle.id, guesses.length, BYPASS_DB_SAVE]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-between pt-6 pb-24 px-4 relative overflow-hidden font-['Inter',_sans-serif]">
      
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#064E3B 1px, transparent 1px)', backgroundSize: '4px 4px' }}>
      </div>

      <header className="w-full max-w-md flex flex-col items-center mt-2 mb-6 z-10 relative">
        <h1 className="font-['Anton',_sans-serif] text-5xl md:text-6xl text-[#064E3B] uppercase leading-[0.8] text-center shadow-sm">
          Last Step
        </h1>
        <span className="font-['Rock_Salt',_cursive] text-2xl text-[#FB923C] -mt-2 ml-16 -rotate-6 drop-shadow-md">
          syndrome
        </span>
        
        <div className="flex gap-4 mt-6">
          <button 
            onClick={() => setActiveView('game')}
            className={`px-6 py-2 font-['Anton',_sans-serif] uppercase tracking-widest text-lg border-4 border-[#064E3B] transition-all ${
              activeView === 'game' 
                ? 'bg-[#064E3B] text-white shadow-[4px_4px_0px_0px_#FB923C]' 
                : 'bg-white text-[#064E3B] hover:bg-gray-100'
            }`}
          >
            Play
          </button>
          <button 
            onClick={() => setActiveView('leaderboard')}
            className={`px-6 py-2 font-['Anton',_sans-serif] uppercase tracking-widest text-lg border-4 border-[#064E3B] transition-all ${
              activeView === 'leaderboard' 
                ? 'bg-[#064E3B] text-white shadow-[4px_4px_0px_0px_#FB923C]' 
                : 'bg-white text-[#064E3B] hover:bg-gray-100'
            }`}
          >
            Rankings
          </button>
        </div>
      </header>

      {activeView === 'game' ? (
        <>
          <main className="flex-1 w-full flex flex-col items-center z-10 max-w-lg relative animate-fade-in">
            <VerseProgress unlockedFragments={unlockedFragments} totalDays={15} />
            
            <div className="h-16 mb-2 flex items-center justify-center w-full relative">
              {errorMessage && (
                <div className="absolute z-50 top-2 px-4 py-2 bg-[#FB923C] text-[#064E3B] font-bold uppercase tracking-widest text-sm border-2 border-[#064E3B] shadow-[4px_4px_0px_0px_#064E3B] animate-fade-in">
                  {errorMessage}
                </div>
              )}
            </div>

            <Board guesses={guesses} currentGuess={currentGuess} />
          </main>

          <footer className="w-full max-w-lg z-10 mt-4 animate-fade-in">
            {gameStatus === 'playing' ? (
              <Keyboard onKeyPress={onKeyPress} guesses={guesses} />
            ) : (
              <EndGameModal status={gameStatus} guesses={guesses} puzzleDate={puzzle.puzzle_date} />
            )}
          </footer>
        </>
      ) : (
        <main className="flex-1 w-full flex flex-col items-center z-10 relative">
           <Leaderboard />
        </main>
      )}
    </div>
  );
}