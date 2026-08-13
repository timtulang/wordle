import { type GuessResult, type GameStatus } from '../types/game';

// 1 = 100, 2 = 90, 3 = 80, 4 = 70, 5 = 60, 6 = 50. Loss = 10.
export function calculateScore(guessCount: number, status: GameStatus): number {
  if (status === 'playing') return 0;
  if (status === 'lost') return 10;
  return 110 - (guessCount * 10);
}

export function generateShareText(
  guesses: GuessResult[], 
  status: GameStatus, 
  dayString: string
): string {
  const header = `LAST STEP SYNDROME\nDay: ${dayString}\n`;
  const score = calculateScore(guesses.length, status);
  const tries = status === 'won' ? guesses.length : 'X';
  const subheader = `Score: ${score} | ${tries}/6\n\n`;

  const grid = guesses.map(guess => {
    return guess.statuses.map(st => {
      if (st === 'correct') return '🟩';
      if (st === 'present') return '🟨';
      return '⬛';
    }).join('');
  }).join('\n');

  return header + subheader + grid;
}