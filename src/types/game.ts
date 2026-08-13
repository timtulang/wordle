export type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';

export interface GuessResult {
  word: string;
  statuses: LetterState[];
}

export type GameStatus = 'playing' | 'won' | 'lost';

export const MAX_GUESSES = 6;
export const WORD_LENGTH = 5;