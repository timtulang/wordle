import { useState, useEffect, useCallback } from 'react';
import { type GameStatus, type GuessResult, MAX_GUESSES, WORD_LENGTH } from '../types/game';
import { evaluateGuess } from '../utils/validation';

export function useGameEngine(dailyAnswer: string, validWordList: string[], puzzleId: string) {
  // Initialize state from LocalStorage if it exists for TODAY'S puzzle
  const [guesses, setGuesses] = useState<GuessResult[]>(() => {
    const saved = localStorage.getItem(`puzzle_${puzzleId}`);
    return saved ? JSON.parse(saved).guesses : [];
  });
  
  const [gameStatus, setGameStatus] = useState<GameStatus>(() => {
    const saved = localStorage.getItem(`puzzle_${puzzleId}`);
    return saved ? JSON.parse(saved).gameStatus : 'playing';
  });
  
  const [currentGuess, setCurrentGuess] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Save to LocalStorage every time guesses or gameStatus changes
  useEffect(() => {
    localStorage.setItem(`puzzle_${puzzleId}`, JSON.stringify({ guesses, gameStatus }));
  }, [guesses, gameStatus, puzzleId]);

  const onKeyPress = useCallback((key: string) => {
    if (gameStatus !== 'playing') return;

    if (errorMessage) setErrorMessage(null);

    if (key === 'Enter') {
      if (currentGuess.length !== WORD_LENGTH) {
        showError("Not enough letters");
        return;
      }
      
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