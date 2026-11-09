import React, { useState, useEffect, useRef } from 'react';
import {
   Flag,
   Bomb,
   RotateCcw,
   Clock,
   Shield,
   Trophy,
   Volume2,
   VolumeX,
   Shovel,
} from 'lucide-react';
import {
   DIFFICULTIES,
   createEmptyGrid,
   populateMines,
   revealCell,
   checkMinesweeperWin,
} from './minesweeperLogic';
import { arcadeSounds } from '../sound';
import {
   getGameHighScore,
   saveGameHighScore,
   getArcadeSettings,
   saveArcadeSettings,
} from '../storage';
import GameResult from '../../components/games/GameResult';

const NUMBER_COLORS = [
   '',
   'text-cyan-400 font-bold',
   'text-emerald-400 font-bold',
   'text-rose-400 font-bold',
   'text-purple-400 font-bold',
   'text-amber-400 font-bold',
   'text-teal-400 font-bold',
   'text-pink-400 font-bold',
   'text-red-500 font-extrabold',
];

export default function Minesweeper() {
   const [difficultyKey, setDifficultyKey] = useState('easy');
   const diff = DIFFICULTIES[difficultyKey];

   const [grid, setGrid] = useState(() => createEmptyGrid(diff.rows, diff.cols));
   const [isFirstClick, setIsFirstClick] = useState(true);
   const [gameState, setGameState] = useState('playing'); // 'playing' | 'won' | 'lost'
   const [flagMode, setFlagMode] = useState(false); // Mobile toggle: Dig vs Flag
   const [flagsRemaining, setFlagsRemaining] = useState(diff.mines);
   const [seconds, setSeconds] = useState(0);
   const [isTimerRunning, setIsTimerRunning] = useState(false);
   const [bestTime, setBestTime] = useState(null);
   const [soundEnabled, setSoundEnabled] = useState(true);

   const timerRef = useRef(null);

   useEffect(() => {
      const stored = getGameHighScore('minesweeper');
      setBestTime(stored?.[difficultyKey] || null);
      const settings = getArcadeSettings();
      setSoundEnabled(settings.soundEnabled ?? true);
   }, [difficultyKey]);

   const handleToggleSound = () => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      saveArcadeSettings({ soundEnabled: next });
   };

   // Timer
   useEffect(() => {
      if (isTimerRunning && gameState === 'playing') {
         timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      } else {
         clearInterval(timerRef.current);
      }
      return () => clearInterval(timerRef.current);
   }, [isTimerRunning, gameState]);

   const startNewGame = (newKey = difficultyKey) => {
      clearInterval(timerRef.current);
      const newDiff = DIFFICULTIES[newKey];
      setDifficultyKey(newKey);
      setGrid(createEmptyGrid(newDiff.rows, newDiff.cols));
      setIsFirstClick(true);
      setGameState('playing');
      setFlagsRemaining(newDiff.mines);
      setSeconds(0);
      setIsTimerRunning(false);
      arcadeSounds.click();
   };

   // Handle Cell Interaction
   const handleCellAction = (r, c, forceFlag = false) => {
      if (gameState !== 'playing') return;

      const cell = grid[r][c];

      // Flagging
      if (forceFlag || flagMode) {
         if (cell.isRevealed) return;
         const newGrid = grid.map((row) => row.map((cl) => ({ ...cl })));
         const target = newGrid[r][c];

         if (!target.isFlagged && flagsRemaining > 0) {
            target.isFlagged = true;
            setFlagsRemaining((f) => f - 1);
            arcadeSounds.move();
         } else if (target.isFlagged) {
            target.isFlagged = false;
            setFlagsRemaining((f) => f + 1);
            arcadeSounds.click();
         }
         setGrid(newGrid);
         return;
      }

      // If cell is already flagged, don't reveal
      if (cell.isFlagged) return;

      let currentGrid = grid;
      if (isFirstClick) {
         setIsFirstClick(false);
         setIsTimerRunning(true);
         currentGrid = populateMines(grid, diff.rows, diff.cols, diff.mines, r, c);
      }

      const { grid: revealedGrid, hitMine } = revealCell(currentGrid, r, c, diff.rows, diff.cols);

      if (hitMine) {
         // Detonated!
         clearInterval(timerRef.current);
         arcadeSounds.gameOver();
         // Reveal all mines
         const fullRevealed = revealedGrid.map((row) =>
            row.map((cl) => (cl.isMine ? { ...cl, isRevealed: true } : cl))
         );
         setGrid(fullRevealed);
         setGameState('lost');
         return;
      }

      setGrid(revealedGrid);
      arcadeSounds.click();

      // Check win
      if (checkMinesweeperWin(revealedGrid, diff.rows, diff.cols, diff.mines)) {
         clearInterval(timerRef.current);
         arcadeSounds.win();
         setGameState('won');

         const stored = getGameHighScore('minesweeper') || {};
         const currentBest = stored[difficultyKey];
         if (!currentBest || seconds < currentBest) {
            const updated = { ...stored, [difficultyKey]: seconds };
            setBestTime(seconds);
            saveGameHighScore('minesweeper', updated);
         }
      }
   };

   const isNewBest = gameState === 'won' && (!bestTime || seconds <= bestTime);

   return (
      <div className="flex flex-col items-center">
         {/* Live Stats Strip */}
         <div className="w-full max-w-md mb-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
               {/* Difficulty Tabs */}
               <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-1">
                  {Object.entries(DIFFICULTIES).map(([k, d]) => (
                     <button
                        key={k}
                        type="button"
                        onClick={() => startNewGame(k)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                           difficultyKey === k
                              ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                              : 'text-zinc-400 hover:text-white'
                        }`}>
                        {d.label.split(' ')[0]}
                     </button>
                  ))}
               </div>

               {/* Right Actions */}
               <div className="flex items-center gap-1.5">
                  <button
                     type="button"
                     onClick={() => setFlagMode(!flagMode)}
                     aria-label="Toggle flag mode"
                     className={`flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                        flagMode
                           ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                           : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                     }`}>
                     {flagMode ? <Flag size={13} className="text-amber-400" /> : <Shovel size={13} />}
                     <span>{flagMode ? 'Flagging' : 'Digging'}</span>
                  </button>

                  <button
                     type="button"
                     onClick={() => startNewGame()}
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

            {/* Counters */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs">
               <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                     <Flag size={13} />
                     <span>{flagsRemaining}</span>
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="flex items-center gap-1 text-cyan-400 font-bold font-mono">
                     <Clock size={13} />
                     <span>{seconds}s</span>
                  </span>
               </div>

               {bestTime && (
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                     <Trophy size={11} className="text-[#daf4aa]" />
                     <span>Best: <span className="font-mono text-zinc-200">{bestTime}s</span></span>
                  </div>
               )}
            </div>
         </div>

         {/* Minesweeper Grid */}
         <div className="relative overflow-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-3 sm:p-4 shadow-2xl max-w-full">
            <div
               className="grid gap-1 sm:gap-1.5 select-none"
               style={{
                  gridTemplateColumns: `repeat(${diff.cols}, minmax(0, 1fr))`,
                  width: diff.cols === 16 ? '380px' : diff.cols === 12 ? '330px' : '290px',
               }}>
               {grid.map((row, r) =>
                  row.map((cell, c) => (
                     <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={() => handleCellAction(r, c, false)}
                        onContextMenu={(e) => {
                           e.preventDefault();
                           handleCellAction(r, c, true);
                        }}
                        className={`flex aspect-square items-center justify-center rounded-lg border text-xs sm:text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#daf4aa] ${
                           cell.isRevealed
                              ? cell.isMine
                                 ? 'border-red-600/60 bg-red-950/70 text-red-200'
                                 : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-300'
                              : cell.isFlagged
                              ? 'border-amber-600/60 bg-amber-950/40 text-amber-300'
                              : 'border-zinc-800 bg-zinc-900/90 hover:border-zinc-700 hover:bg-zinc-850 active:bg-zinc-800 text-transparent'
                        }`}>
                        {cell.isRevealed ? (
                           cell.isMine ? (
                              <Bomb size={14} className="text-red-400 fill-current animate-pulse" />
                           ) : cell.neighborCount > 0 ? (
                              <span className={NUMBER_COLORS[cell.neighborCount]}>
                                 {cell.neighborCount}
                              </span>
                           ) : (
                              ''
                           )
                        ) : cell.isFlagged ? (
                           <Flag size={13} className="text-amber-400 fill-current" />
                        ) : (
                           ''
                        )}
                     </button>
                  ))
               )}
            </div>

            {/* Win/Loss Modal */}
            {gameState !== 'playing' && (
               <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/85 backdrop-blur-md p-4">
                  <GameResult
                     status={gameState === 'won' ? 'win' : 'gameover'}
                     title={gameState === 'won' ? 'Minefield Cleared!' : 'Detonated!'}
                     score={gameState === 'won' ? `${seconds} seconds` : 'Stepped on a mine'}
                     scoreLabel={gameState === 'won' ? 'Clear Time' : 'Result'}
                     bestScore={bestTime ? `${bestTime}s` : null}
                     isNewBest={isNewBest}
                     onRestart={() => startNewGame()}
                  />
               </div>
            )}
         </div>
      </div>
   );
}

