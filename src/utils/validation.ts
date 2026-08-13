import { type LetterState, WORD_LENGTH } from '../types/game';

export function evaluateGuess(guess: string, answer: string): LetterState[] {
  const result: LetterState[] = Array(WORD_LENGTH).fill('absent');
  const answerLetters = answer.split('');
  const guessLetters = guess.split('');

  // Pass 1: Find all CORRECT (Green) letters
  guessLetters.forEach((letter, i) => {
    if (answerLetters[i] === letter) {
      result[i] = 'correct';
      answerLetters[i] = null as any; // Remove from pool to prevent double-counting
    }
  });

  // Pass 2: Find all PRESENT (Yellow) letters
  guessLetters.forEach((letter, i) => {
    if (result[i] !== 'correct' && answerLetters.includes(letter)) {
      result[i] = 'present';
      // Remove the matched letter from the pool
      answerLetters[answerLetters.indexOf(letter)] = null as any; 
    }
  });

  return result;
}