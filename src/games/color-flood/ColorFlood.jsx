import React, { useState, useEffect } from 'react';
import {
   RotateCcw,
   Volume2,
   VolumeX,
   Trophy,
   Sparkles,
   Layers,
} from 'lucide-react';
import {
   FLOOD_SIZE,
   MAX_STEPS,
   FLOOD_COLORS,
   createRandomFloodGrid,
   performFlood,
   isFloodComplete,
} from './floodLogic';
import { arcadeSounds } from '../sound';
import {
   getGameHighScore,
   saveGameHighScore,
   getArcadeSettings,
   saveArcadeSettings,
} from '../storage';
import GameResult from '../../components/games/GameResult';

export default function ColorFlood() {
   const [grid, setGrid] = useState(() => createRandomFloodGrid(FLOOD_SIZE));
   const [steps, setSteps] = useState(0);
   const [gameState, setGameState] = useState('playing'); // 'playing' | 'won' | 'lost'
   const [bestMoves, setBestMoves] = useState(null);
   const [soundEnabled, setSoundEnabled] = useState(true);

   useEffect(() => {
      const stored = getGameHighScore('color-flood') || {};
      setBestMoves(stored.bestMoves || null);
      const settings = getArcadeSettings();
      setSoundEnabled(settings.soundEnabled ?? true);
   }, []);

   const handleToggleSound = () => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      saveArcadeSettings({ soundEnabled: next });
   };

   const startNewGame = () => {
      setGrid(createRandomFloodGrid(FLOOD_SIZE));
      setSteps(0);
      setGameState('playing');
      arcadeSounds.click();
   };

   // Player Picks a Color
   const handleColorPick = (colorIndex) => {
      if (gameState !== 'playing') return;
      if (grid[0][0] === colorIndex) return; // Same color as current flood head

      const newGrid = performFlood(grid, colorIndex, FLOOD_SIZE);
      const newSteps = steps + 1;
      setGrid(newGrid);
      setSteps(newSteps);
      arcadeSounds.move();

      if (isFloodComplete(newGrid, FLOOD_SIZE)) {
         arcadeSounds.win();
         setGameState('won');

         const stored = getGameHighScore('color-flood') || {};
         const currentBest = stored.bestMoves;
         if (!currentBest || newSteps < currentBest) {
            setBestMoves(newSteps);
            saveGameHighScore('color-flood', { bestMoves: newSteps });
         }
      } else if (newSteps >= MAX_STEPS) {
         arcadeSounds.gameOver();
         setGameState('lost');
      }
   };

   const isNewBest = gameState === 'won' && (!bestMoves || steps <= bestMoves);

   return (
      <div className="flex flex-col items-center select-none">
         {/* Top Controls & Status */}
         <div className="w-full max-w-sm mb-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
               <button
                  type="button"
                  onClick={startNewGame}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-4 py-2 text-xs font-bold text-zinc-950 transition-colors hover:bg-[#c9ee8e]">
                  <RotateCcw size={13} />
                  <span>New Grid</span>
               </button>

               <button
                  type="button"
                  onClick={handleToggleSound}
                  aria-label={soundEnabled ? 'Mute' : 'Unmute'}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white">
                  {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
               </button>
            </div>

            {/* Counters */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs">
               <span className="font-mono text-zinc-300 font-bold">
                  Steps: <span className={steps >= 20 ? 'text-rose-400' : 'text-[#daf4aa]'}>{steps}</span> / {MAX_STEPS}
               </span>

               {bestMoves && (
                  <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                     <Trophy size={11} className="text-[#daf4aa]" />
                     Best: {bestMoves} steps
                  </span>
               )}
            </div>
         </div>

         {/* 14x14 Grid Board */}
         <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-3 sm:p-4 shadow-2xl">
            <div
               className="grid gap-[2px] bg-zinc-900 rounded-xl overflow-hidden"
               style={{
                  gridTemplateColumns: `repeat(${FLOOD_SIZE}, minmax(0, 1fr))`,
                  width: '280px',
                  height: '280px',
                  maxWidth: '100%',
               }}>
               {grid.map((row, r) =>
                  row.map((colorIdx, c) => (
                     <div
                        key={`${r}-${c}`}
                        className="w-full h-full rounded-[1px] transition-colors duration-200"
                        style={{ backgroundColor: FLOOD_COLORS[colorIdx] }}
                     />
                  ))
               )}
            </div>

            {/* Victory / Defeat Modal */}
            {gameState !== 'playing' && (
               <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/85 backdrop-blur-md p-4">
                  <GameResult
                     status={gameState === 'won' ? 'win' : 'gameover'}
                     title={gameState === 'won' ? 'Board Unified!' : 'Steps Exhausted!'}
                     score={`${steps} steps taken`}
                     scoreLabel="Efficiency"
                     bestScore={bestMoves ? `${bestMoves} steps` : null}
                     isNewBest={isNewBest}
                     onRestart={startNewGame}
                  />
               </div>
            )}
         </div>

         {/* Color Selection Palette Buttons */}
         <div className="mt-5 flex items-center justify-center gap-3">
            {FLOOD_COLORS.map((colorHex, idx) => {
               const isCurrentHead = grid[0][0] === idx;
               return (
                  <button
                     key={idx}
                     type="button"
                     onClick={() => handleColorPick(idx)}
                     disabled={isCurrentHead || gameState !== 'playing'}
                     style={{ backgroundColor: colorHex }}
                     className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border-2 transition-transform active:scale-90 focus-visible:outline-none ${
                        isCurrentHead
                           ? 'border-white scale-110 shadow-lg ring-2 ring-white/30 cursor-default'
                           : 'border-transparent hover:scale-105 hover:border-white/50 cursor-pointer shadow-md'
                     }`}
                  />
               );
            })}
         </div>
      </div>
   );
}

