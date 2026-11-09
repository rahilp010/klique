import React, { useState, useEffect, useCallback } from 'react';
import {
   RotateCcw,
   Volume2,
   VolumeX,
   Trophy,
   Calendar,
   Sparkles,
   Flame,
   Delete,
   Check,
} from 'lucide-react';
import {
   WORD_LENGTH,
   MAX_GUESSES,
   getRandomWord,
   getDailyWord,
   evaluateGuess,
} from './wordGuessLogic';
import { arcadeSounds } from '../sound';
import {
   getGameHighScore,
   saveGameHighScore,
   getArcadeSettings,
   saveArcadeSettings,
} from '../storage';
import GameResult from '../../components/games/GameResult';

const KEYBOARD_ROWS = [
   ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
   ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
   ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

export default function WordGuess() {
   const [mode, setMode] = useState('daily'); // 'daily' | 'practice'
   const [targetWord, setTargetWord] = useState(() => getDailyWord());
   const [guesses, setGuesses] = useState([]); // Array of strings
   const [currentInput, setCurrentInput] = useState('');
   const [gameState, setGameState] = useState('playing'); // 'playing' | 'won' | 'lost'
   const [streak, setStreak] = useState(0);
   const [soundEnabled, setSoundEnabled] = useState(true);

   // Load streak
   useEffect(() => {
      const stored = getGameHighScore('word-guess') || {};
      setStreak(stored.streak || 0);
      const settings = getArcadeSettings();
      setSoundEnabled(settings.soundEnabled ?? true);
   }, []);

   const handleToggleSound = () => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      saveArcadeSettings({ soundEnabled: next });
   };

   // Reset / New Game
   const startNewGame = (newMode = mode) => {
      setMode(newMode);
      setTargetWord(newMode === 'daily' ? getDailyWord() : getRandomWord());
      setGuesses([]);
      setCurrentInput('');
      setGameState('playing');
      arcadeSounds.click();
   };

   // Submit guess
   const handleEnter = useCallback(() => {
      if (gameState !== 'playing') return;
      if (currentInput.length !== WORD_LENGTH) {
         arcadeSounds.wrong();
         return;
      }

      const evalResult = evaluateGuess(currentInput, targetWord);
      const newGuesses = [...guesses, currentInput];
      setGuesses(newGuesses);
      setCurrentInput('');

      if (currentInput === targetWord) {
         // Won!
         arcadeSounds.win();
         setGameState('won');
         const newStreak = streak + 1;
         setStreak(newStreak);
         saveGameHighScore('word-guess', { streak: newStreak });
      } else if (newGuesses.length >= MAX_GUESSES) {
         // Lost
         arcadeSounds.gameOver();
         setGameState('lost');
         setStreak(0);
         saveGameHighScore('word-guess', { streak: 0 });
      } else {
         arcadeSounds.move();
      }
   }, [currentInput, targetWord, guesses, gameState, streak]);

   const handleKey = useCallback(
      (char) => {
         if (gameState !== 'playing') return;
         if (currentInput.length < WORD_LENGTH) {
            setCurrentInput((prev) => prev + char);
            arcadeSounds.click();
         }
      },
      [currentInput, gameState]
   );

   const handleBackspace = useCallback(() => {
      if (gameState !== 'playing') return;
      setCurrentInput((prev) => prev.slice(0, -1));
      arcadeSounds.click();
   }, [gameState]);

   // Physical keyboard listener
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (e.key === 'Enter') {
            handleEnter();
         } else if (e.key === 'Backspace') {
            handleBackspace();
         } else if (/^[a-zA-Z]$/.test(e.key)) {
            handleKey(e.key.toUpperCase());
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [handleEnter, handleBackspace, handleKey]);

   // Letter status mapping for on-screen keyboard
   const letterStatuses = {};
   guesses.forEach((guess) => {
      const evalRes = evaluateGuess(guess, targetWord);
      guess.split('').forEach((letter, i) => {
         const current = letterStatuses[letter];
         const status = evalRes[i];
         if (status === 'correct') {
            letterStatuses[letter] = 'correct';
         } else if (status === 'present' && current !== 'correct') {
            letterStatuses[letter] = 'present';
         } else if (!current) {
            letterStatuses[letter] = status;
         }
      });
   });

   return (
      <div className="flex flex-col items-center select-none">
         {/* Top Controls & Switcher */}
         <div className="w-full max-w-sm mb-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
               <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-1">
                  <button
                     type="button"
                     onClick={() => startNewGame('daily')}
                     className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        mode === 'daily'
                           ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                           : 'text-zinc-400 hover:text-white'
                     }`}>
                     <Calendar size={13} />
                     <span>Daily Word</span>
                  </button>

                  <button
                     type="button"
                     onClick={() => startNewGame('practice')}
                     className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        mode === 'practice'
                           ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                           : 'text-zinc-400 hover:text-white'
                     }`}>
                     <Sparkles size={13} />
                     <span>Practice</span>
                  </button>
               </div>

               <div className="flex items-center gap-1.5">
                  <button
                     type="button"
                     onClick={() => startNewGame(mode)}
                     aria-label="Restart"
                     className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white">
                     <RotateCcw size={14} />
                  </button>

                  <button
                     type="button"
                     onClick={handleToggleSound}
                     aria-label={soundEnabled ? 'Mute' : 'Unmute'}
                     className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white">
                     {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  </button>
               </div>
            </div>

            {/* Streak & Round Counter */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs">
               <span className="text-zinc-400">
                  Attempt: <span className="font-mono text-zinc-200 font-bold">{Math.min(guesses.length + 1, 6)}</span> / 6
               </span>

               {streak > 0 && (
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                     <Flame size={13} className="fill-current" />
                     <span>{streak} Win Streak</span>
                  </span>
               )}
            </div>
         </div>

         {/* 6x5 Letter Grid */}
         <div className="relative mb-5 flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
            {Array.from({ length: MAX_GUESSES }).map((_, rowIdx) => {
               const guess = guesses[rowIdx];
               const isCurrentRow = rowIdx === guesses.length;
               const evaluation = guess ? evaluateGuess(guess, targetWord) : null;

               return (
                  <div key={rowIdx} className="flex gap-2">
                     {Array.from({ length: WORD_LENGTH }).map((__, colIdx) => {
                        let letter = '';
                        let statusStyle = 'border-zinc-800 bg-zinc-900/40 text-white';

                        if (guess) {
                           letter = guess[colIdx];
                           const status = evaluation[colIdx];
                           if (status === 'correct') {
                              statusStyle = 'border-[#daf4aa] bg-[#daf4aa] text-zinc-950 font-black shadow-md shadow-[#daf4aa]/20';
                           } else if (status === 'present') {
                              statusStyle = 'border-amber-500 bg-amber-500/80 text-zinc-950 font-bold';
                           } else {
                              statusStyle = 'border-zinc-800 bg-zinc-850 text-zinc-400';
                           }
                        } else if (isCurrentRow) {
                           letter = currentInput[colIdx] || '';
                           if (letter) {
                              statusStyle = 'border-zinc-600 bg-zinc-850 text-white scale-[1.03]';
                           }
                        }

                        return (
                           <div
                              key={colIdx}
                              className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl border text-xl font-bold font-mono transition-all duration-200 ${statusStyle}`}>
                              {letter}
                           </div>
                        );
                     })}
                  </div>
               );
            })}

            {/* Victory / Game Over Overlay */}
            {gameState !== 'playing' && (
               <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/85 backdrop-blur-md p-4">
                  <GameResult
                     status={gameState === 'won' ? 'win' : 'gameover'}
                     title={gameState === 'won' ? 'Brilliant Guess!' : 'Word Missed!'}
                     score={`Word was: ${targetWord}`}
                     scoreLabel="Solution"
                     bestScore={streak > 0 ? `${streak} in a row` : null}
                     isNewBest={gameState === 'won' && streak > 1}
                     onRestart={() => startNewGame(mode)}
                     extraMessage={
                        gameState === 'won'
                           ? `Solved in ${guesses.length} / 6 tries!`
                           : 'Better luck next puzzle!'
                     }
                  />
               </div>
            )}
         </div>

         {/* Virtual QWERTY Keyboard */}
         <div className="w-full max-w-md space-y-1.5 px-2">
            {KEYBOARD_ROWS.map((row, rIdx) => (
               <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
                  {row.map((k) => {
                     const isEnter = k === 'ENTER';
                     const isBack = k === 'BACK';
                     const status = letterStatuses[k];

                     let keyStyle = 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700';
                     if (status === 'correct') {
                        keyStyle = 'border-[#daf4aa] bg-[#daf4aa] text-zinc-950 font-bold';
                     } else if (status === 'present') {
                        keyStyle = 'border-amber-500 bg-amber-500/80 text-zinc-950 font-bold';
                     } else if (status === 'absent') {
                        keyStyle = 'border-zinc-850 bg-zinc-900/40 text-zinc-600 opacity-60';
                     }

                     return (
                        <button
                           key={k}
                           type="button"
                           onClick={() => {
                              if (isEnter) handleEnter();
                              else if (isBack) handleBackspace();
                              else handleKey(k);
                           }}
                           className={`flex h-11 items-center justify-center rounded-lg border text-xs font-semibold transition-colors ${
                              isEnter || isBack ? 'px-2.5 sm:px-3 text-[10px]' : 'w-8 sm:w-10'
                           } ${keyStyle}`}>
                           {isBack ? <Delete size={14} /> : k}
                        </button>
                     );
                  })}
               </div>
            ))}
         </div>
      </div>
   );
}

