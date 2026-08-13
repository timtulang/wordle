import { type GuessResult, MAX_GUESSES, WORD_LENGTH } from '../types/game';

interface BoardProps {
  guesses: GuessResult[];
  currentGuess: string;
}

export function Board({ guesses, currentGuess }: BoardProps) {
  const empties = MAX_GUESSES - guesses.length - 1;

  return (
    <div className="grid grid-rows-6 gap-2 w-full max-w-xs mx-auto mb-8">
      {/* Completed Guesses */}
      {guesses.map((guess, i) => (
        <div key={i} className="grid grid-cols-5 gap-2">
          {guess.statuses.map((status, j) => (
            <Tile key={j} letter={guess.word[j]} status={status} />
          ))}
        </div>
      ))}

      {/* Current Active Guess */}
      {guesses.length < MAX_GUESSES && (
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: WORD_LENGTH }).map((_, i) => (
            <Tile key={i} letter={currentGuess[i] || ''} status="tbd" />
          ))}
        </div>
      )}

      {/* Empty Remaining Rows */}
      {Array.from({ length: empties > 0 ? empties : 0 }).map((_, i) => (
        <div key={`empty-${i}`} className="grid grid-cols-5 gap-2">
          {Array.from({ length: WORD_LENGTH }).map((_, j) => (
            <Tile key={j} letter="" status="empty" />
          ))}
        </div>
      ))}
    </div>
  );
}

function Tile({ letter, status }: { letter: string; status: string }) {
  const baseStyles = "flex items-center justify-center text-3xl font-bold uppercase border-4 aspect-square transition-all duration-300";
  
  // Implementing the "Last Step" visual system
  const statusStyles = {
    empty: "border-[#064E3B] bg-[#F8F9FA] text-transparent",
    tbd: "border-[#064E3B] bg-white text-[#064E3B]",
    absent: "border-[#57534E] bg-[#57534E] text-white", // Gritty dirt brown/gray
    present: "border-[#EAB308] bg-[#EAB308] text-[#064E3B]",
    correct: "border-[#4ADE80] bg-[#4ADE80] text-[#064E3B]", // Grass green
  }[status];

  return <div className={`${baseStyles} ${statusStyles}`}>{letter}</div>;
}