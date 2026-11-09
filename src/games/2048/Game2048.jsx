import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
   ArrowUp,
   ArrowDown,
   ArrowLeft,
   ArrowRight,
   RotateCcw,
   Undo2,
   Trophy,
   Sparkles,
   Sliders,
   Layers,
} from 'lucide-react';
import {
   initializeBoard,
   moveBoard,
   spawnRandomTile,
   isGameOver,
   hasWon,
   getMaxTile,
} from './game2048Logic';
import { arcadeSounds } from '../sound';
import {
   getGameHighScore,
   saveGameHighScore,
   getArcadeSettings,
   saveArcadeSettings,
} from '../storage';
import GameResult from '../../components/games/GameResult';

// Tile styling generator adhering to Klique design system
const getTileStyle = (val) => {
   switch (val) {
      case 2:
         return 'bg-zinc-850 text-zinc-100 border border-zinc-750/70 shadow-sm';
      case 4:
         return 'bg-zinc-800 text-zinc-50 border border-zinc-700 shadow-sm';
      case 8:
         return 'bg-amber-950/70 text-amber-200 border border-amber-700/60 shadow-sm';
      case 16:
         return 'bg-orange-950/70 text-orange-200 border border-orange-700/60 shadow-sm';
      case 32:
         return 'bg-rose-950/80 text-rose-200 border border-rose-700/60 shadow-sm';
      case 64:
         return 'bg-red-950/80 text-red-100 border border-red-600/70 shadow-sm';
      case 128:
         return 'bg-emerald-950/80 text-emerald-200 border border-emerald-600/70 shadow-md';
      case 256:
         return 'bg-teal-950/80 text-teal-200 border border-teal-500/70 shadow-md';
      case 512:
         return 'bg-cyan-950/80 text-cyan-200 border border-cyan-400/80 shadow-md';
      case 1024:
         return 'bg-purple-950/90 text-purple-200 border border-purple-400/90 shadow-lg';
      case 2048:
         return 'bg-[#daf4aa] text-zinc-950 border border-white font-extrabold shadow-xl shadow-[#daf4aa]/30';
      default:
         return val > 2048
            ? 'bg-gradient-to-br from-[#daf4aa] to-emerald-400 text-zinc-950 font-black shadow-xl'
            : 'bg-zinc-900/40 text-transparent border border-zinc-800/40';
   }
};

export default function Game2048({ isFullscreen = false }) {
   const [gridSize, setGridSize] = useState(4); // 3 | 4 | 5
   const [board, setBoard] = useState(() => initializeBoard(4));
   const [history, setHistory] = useState([]); // Up to 3 history states for multi-undo
   const [score, setScore] = useState(0);
   const [highScore, setHighScore] = useState(0);
   const [bestTile, setBestTile] = useState(2);
   const [scorePop, setScorePop] = useState(null); // { amount, id }
   const [gameWon, setGameWon] = useState(false);
   const [hasDismissedWin, setHasDismissedWin] = useState(false);
   const [gameOver, setGameOver] = useState(false);
   const [soundEnabled, setSoundEnabled] = useState(true);
   const [showSettings, setShowSettings] = useState(false);

   // Load high score
   useEffect(() => {
      const stored = getGameHighScore('2048') || {};
      setHighScore(stored.best || 0);
      setBestTile(stored.bestTile || 2);
      const settings = getArcadeSettings();
      setSoundEnabled(settings.soundEnabled ?? true);
   }, []);

   const handleToggleSound = () => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      saveArcadeSettings({ soundEnabled: next });
   };

   // Process Movement
   const handleMove = useCallback((direction) => {
      if (gameOver) return;

      const { newBoard, changed, addedScore } = moveBoard(board, direction);
      if (!changed) return;

      if (addedScore > 0) {
         arcadeSounds.merge();
         // Floating score pop
         setScorePop({ amount: addedScore, id: Date.now() });
      } else {
         arcadeSounds.move();
      }

      // Add to Undo History (max 3)
      setHistory((prev) => [{ board, score }, ...prev].slice(0, 3));

      // Spawn next tile
      const boardWithSpawn = spawnRandomTile(newBoard);
      const newScore = score + addedScore;
      const currentMaxTile = getMaxTile(boardWithSpawn);

      setBoard(boardWithSpawn);
      setScore(newScore);

      // Check High Score
      const stored = getGameHighScore('2048') || {};
      const newBestScore = Math.max(newScore, stored.best || 0);
      const newBestTile = Math.max(currentMaxTile, stored.bestTile || 2);
      if (newBestScore > (stored.best || 0) || newBestTile > (stored.bestTile || 2)) {
         setHighScore(newBestScore);
         setBestTile(newBestTile);
         saveGameHighScore('2048', { best: newBestScore, bestTile: newBestTile });
      }

      // Check 2048 Win
      if (!gameWon && !hasDismissedWin && hasWon(boardWithSpawn)) {
         arcadeSounds.win();
         setGameWon(true);
      }

      // Check Game Over
      if (isGameOver(boardWithSpawn)) {
         arcadeSounds.gameOver();
         setGameOver(true);
      }
   }, [board, score, gameOver, gameWon, hasDismissedWin]);

   // Undo move
   const handleUndo = () => {
      if (history.length === 0) return;
      const [previous, ...rest] = history;
      setBoard(previous.board);
      setScore(previous.score);
      setHistory(rest);
      setGameOver(false);
      arcadeSounds.click();
   };

   // Change Grid Size & New Game
   const handleGridSizeChange = (newSize) => {
      setGridSize(newSize);
      setBoard(initializeBoard(newSize));
      setHistory([]);
      setScore(0);
      setGameOver(false);
      setGameWon(false);
      setHasDismissedWin(false);
      arcadeSounds.click();
   };

   // Reset / New Game
   const handleNewGame = () => {
      setBoard(initializeBoard(gridSize));
      setHistory([]);
      setScore(0);
      setGameOver(false);
      setGameWon(false);
      setHasDismissedWin(false);
      arcadeSounds.click();
   };

   // Keyboard controls
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
         }

         switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
               handleMove('UP');
               break;
            case 'ArrowDown':
            case 's':
            case 'S':
               handleMove('DOWN');
               break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
               handleMove('LEFT');
               break;
            case 'ArrowRight':
            case 'd':
            case 'D':
               handleMove('RIGHT');
               break;
            case 'z':
            case 'Z':
               if (e.metaKey || e.ctrlKey) handleUndo();
               break;
            default:
               break;
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [handleMove]);

   // Touch swipe controls
   const touchStartRef = useRef({ x: 0, y: 0 });

   const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
   };

   const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) < 25) return;

      if (absDx > absDy) {
         handleMove(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
         handleMove(dy > 0 ? 'DOWN' : 'UP');
      }
   };

   const isNewBest = score > highScore && score > 0;
   const currentMax = getMaxTile(board);

   return (
      <div className="flex flex-col items-center justify-center max-w-full">
         {/* Live Controls & Mode Bar */}
         <div className={`w-full max-w-sm flex flex-col gap-2 ${isFullscreen ? 'mb-1.5' : 'mb-3'}`}>
            <div className="flex items-center justify-between gap-2">
               <div className="flex items-center gap-2">
                  <button
                     type="button"
                     onClick={handleNewGame}
                     className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-3.5 py-2 text-xs font-bold text-zinc-950 transition-colors hover:bg-[#c9ee8e]">
                     <RotateCcw size={13} />
                     <span>New Game</span>
                  </button>

                  <button
                     type="button"
                     onClick={handleUndo}
                     disabled={history.length === 0}
                     className="inline-flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
                     <Undo2 size={13} />
                     <span>Undo ({history.length})</span>
                  </button>
               </div>

               <div className="flex items-center gap-1.5">
                  <button
                     type="button"
                     onClick={() => setShowSettings(!showSettings)}
                     aria-label="Grid Settings"
                     className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                        showSettings
                           ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                           : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                     }`}>
                     <Sliders size={14} />
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

            {/* Grid Size Selector Drawer */}
            {showSettings && (
               <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 p-2.5 text-xs">
                  <span className="text-zinc-500">Board Size:</span>
                  <div className="flex items-center gap-1.5">
                     {[
                        { size: 3, label: '3×3 Express' },
                        { size: 4, label: '4×4 Classic' },
                        { size: 5, label: '5×5 Zen' },
                     ].map((cfg) => (
                        <button
                           key={cfg.size}
                           type="button"
                           onClick={() => handleGridSizeChange(cfg.size)}
                           className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                              gridSize === cfg.size
                                 ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                                 : 'bg-zinc-800 text-zinc-400 hover:text-white'
                           }`}>
                           {cfg.label}
                        </button>
                     ))}
                  </div>
               </div>
            )}

            {/* Floating Score Pop Indicator */}
            <div className="relative h-6 flex items-center justify-between px-1">
               <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <span>Max Tile:</span>
                  <span className="font-mono font-bold text-[#daf4aa]">{currentMax}</span>
               </div>

               {scorePop && (
                  <div
                     key={scorePop.id}
                     className="animate-out fade-out slide-out-to-top-3 duration-700 text-xs font-bold text-[#daf4aa] font-mono">
                     +{scorePop.amount}
                  </div>
               )}
            </div>
         </div>

         {/* 2048 Matrix Grid */}
         <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="relative select-none rounded-2xl border border-zinc-800 bg-zinc-950 p-2.5 sm:p-3.5 shadow-2xl touch-none overscroll-contain flex items-center justify-center">
            <div
               className="grid gap-2 sm:gap-2.5 max-h-[min(360px,calc(100dvh-10rem))] max-w-[min(360px,calc(100vw-2rem))] aspect-square w-[290px] h-[290px] sm:w-[360px] sm:h-[360px]"
               style={{
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
               }}>
               {board.map((row, r) =>
                  row.map((cell, c) => (
                     <div
                        key={`${r}-${c}`}
                        className={`flex items-center justify-center rounded-xl transition-all duration-150 font-bold select-none ${getTileStyle(
                           cell
                        )} ${
                           cell >= 1000
                              ? 'text-sm sm:text-base font-mono'
                              : cell >= 100
                              ? 'text-base sm:text-xl font-mono'
                              : gridSize === 5
                              ? 'text-base sm:text-xl'
                              : 'text-xl sm:text-3xl'
                        }`}>
                        {cell > 0 ? cell : ''}
                     </div>
                  ))
               )}
            </div>

            {/* Victory Modal */}
            {gameWon && !hasDismissedWin && (
               <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/85 backdrop-blur-md p-6 text-center">
                  <div className="max-w-xs">
                     <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#daf4aa]/15 text-[#daf4aa]">
                        <Sparkles size={28} />
                     </div>
                     <h3 className="text-xl font-extrabold text-white">You Made 2048!</h3>
                     <p className="mt-1.5 text-xs text-zinc-400">
                        Outstanding puzzle solving. You can keep playing to reach 4096 and higher!
                     </p>
                     <div className="mt-5 flex items-center justify-center gap-3">
                        <button
                           type="button"
                           onClick={() => setHasDismissedWin(true)}
                           className="rounded-xl bg-[#daf4aa] px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-[#c9ee8e]">
                           Keep Going
                        </button>
                        <button
                           type="button"
                           onClick={handleNewGame}
                           className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white">
                           New Game
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {/* Game Over Modal */}
            {gameOver && (
               <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/85 backdrop-blur-md p-6">
                  <GameResult
                     status="gameover"
                     title="No Moves Left"
                     score={score}
                     scoreLabel="Final Score"
                     bestScore={highScore}
                     isNewBest={isNewBest}
                     onRestart={handleNewGame}
                     extraMessage={`Highest tile unlocked: ${currentMax}`}
                  />
               </div>
            )}
         </div>

         {/* Mobile On-Screen Directional Pad */}
         <div className="mt-5 flex flex-col items-center gap-2 sm:hidden select-none">
            <button
               type="button"
               onClick={() => handleMove('UP')}
               className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 active:bg-[#daf4aa] active:text-zinc-950 text-zinc-300">
               <ArrowUp size={20} />
            </button>
            <div className="flex items-center gap-6">
               <button
                  type="button"
                  onClick={() => handleMove('LEFT')}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 active:bg-[#daf4aa] active:text-zinc-950 text-zinc-300">
                  <ArrowLeft size={20} />
               </button>
               <button
                  type="button"
                  onClick={() => handleMove('DOWN')}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 active:bg-[#daf4aa] active:text-zinc-950 text-zinc-300">
                  <ArrowDown size={20} />
               </button>
               <button
                  type="button"
                  onClick={() => handleMove('RIGHT')}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 active:bg-[#daf4aa] active:text-zinc-950 text-zinc-300">
                  <ArrowRight size={20} />
               </button>
            </div>
         </div>
      </div>
   );
}
