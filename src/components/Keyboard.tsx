import { useMemo } from 'react';
import { type GuessResult, type LetterState } from '../types/game';

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  guesses: GuessResult[];
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace'],
];

export function Keyboard({ onKeyPress, guesses }: KeyboardProps) {
  // Calculate the highest status for each letter to color the keys correctly
  const keyStatuses = useMemo(() => {
    const statuses: Record<string, LetterState> = {};

    guesses.forEach((guess) => {
      guess.word.split('').forEach((letter, i) => {
        const currentStatus = statuses[letter];
        const newStatus = guess.statuses[i];

        // Status hierarchy: correct > present > absent
        if (currentStatus === 'correct') return;
        if (currentStatus === 'present' && newStatus === 'absent') return;
        
        statuses[letter] = newStatus;
      });
    });

    return statuses;
  }, [guesses]);

  return (
    <div className="flex flex-col items-center gap-2 w-full px-2">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1.5 w-full">
          {row.map((key) => {
            const isActionKey = key === 'Enter' || key === 'Backspace';
            const status = keyStatuses[key] || 'unused';

            return (
              <Key
                key={key}
                value={key}
                status={status as LetterState | 'unused'}
                isActionKey={isActionKey}
                onClick={() => onKeyPress(key)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

// --- Internal Key Component ---

interface KeyProps {
  value: string;
  status: LetterState | 'unused';
  isActionKey: boolean;
  onClick: () => void;
}

function Key({ value, status, isActionKey, onClick }: KeyProps) {
  // Map our Phase 1 brutalist visual system to the keys
  const statusStyles = {
    unused: 'bg-[#E5E7EB] text-[#064E3B] border-transparent hover:bg-[#D1D5DB]',
    absent: 'bg-[#57534E] text-white border-[#57534E]', // Muddy brown/gray
    present: "border-[#EAB308] bg-[#EAB308] text-[#064E3B]",
    correct: 'bg-[#4ADE80] text-[#064E3B] border-[#4ADE80]', // Grass green
    empty: '', 
    tbd: ''
  }[status];

  // Make action keys wider and slightly distinct
  const widthClass = isActionKey ? 'w-16 text-xs sm:w-20 sm:text-sm' : 'w-9 sm:w-11 text-lg';
  const displayValue = value === 'Backspace' ? 'DEL' : value;

  return (
    <button
      onClick={onClick}
      className={`
        ${widthClass} h-14 sm:h-16 flex items-center justify-center 
        font-bold rounded-sm uppercase transition-colors duration-200
        border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]
        active:translate-y-[2px] active:translate-x-[2px] active:shadow-none
        ${statusStyles}
      `}
      aria-label={value === 'Backspace' ? 'Delete' : value}
    >
      {displayValue}
    </button>
  );
}