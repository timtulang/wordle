import { useState, useEffect, useCallback } from 'react';
import { type GameStatus, type GuessResult, MAX_GUESSES, WORD_LENGTH } from '../types/game';
import { evaluateGuess } from '../utils/validation';

export function useGameEngine(dailyAnswer: string, validWordList: string[]) {
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  
  // ADDED: State for invalid word messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onKeyPress = useCallback((key: string) => {
    if (gameStatus !== 'playing') return;

    // Clear error message when they start typing again
    if (errorMessage) setErrorMessage(null);

    if (key === 'Enter') {
      if (currentGuess.length !== WORD_LENGTH) {
        showError("Not enough letters");
        return;
      }
      
      // ADDED: Dictionary Check!
      if (!validWordList.includes(currentGuess)) {
        showError("Not in word list");
        return;
      }
      
      const statuses = evaluateGuess(currentGuess, dailyAnswer);
      const newGuesses = [...guesses, { word: currentGuess, statuses }];
      
      setGuesses(newGuesses);
      setCurrentGuess('');

      if (currentGuess === dailyAnswer) {
        setGameStatus('won');
      } else if (newGuesses.length >= MAX_GUESSES) {
        setGameStatus('lost');
      }
    } else if (key === 'Backspace') {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Za-z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => (prev + key).toUpperCase());
    }
  }, [currentGuess, gameStatus, guesses, dailyAnswer, validWordList, errorMessage]);

  // Helper function to flash the error for 2 seconds
  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => onKeyPress(e.key);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress]);

  return { guesses, currentGuess, gameStatus, errorMessage, onKeyPress };
}