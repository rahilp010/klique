import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Volume2, VolumeX, Lightbulb, Sparkles, Timer, CheckCircle2 } from 'lucide-react';
import {
   createEmptyGrid,
   toggleCellAndNeighbors,
   generateSolvablePuzzle,
   checkAllLightsOut,
} from './matrixFlipLogic';
import { getGameHighScore, saveGameHighScore } from '../storage';
import { playTone, arcadeSounds } from '../sound';

export default function MatrixFlip() {
   const [size, setSize] = useState(4); // 3, 4, 5
   const [grid, setGrid] = useState(() => generateSolvablePuzzle(4, 8));
   const [moves, setMoves] = useState(0);
   const [startTime, setStartTime] = useState(Date.now());
   const [elapsed, setElapsed] = useState(0);
   const [isSolved, setIsSolved] = useState(false);
   const [highScore, setHighScore] = useState(null);
   const [soundEnabled, setSoundEnabled] = useState(true);

   // Load saved high score
   useEffect(() => {
      const saved = getGameHighScore('matrix-flip');
      if (saved && saved.bestMoves) {
         setHighScore(saved.bestMoves);
      }
   }, []);

   // Timer tick
   useEffect(() => {
      if (isSolved) return;
      const interval = setInterval(() => {
         setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
   }, [startTime, isSolved]);

   // Start fresh puzzle
   const resetPuzzle = useCallback((newSize = size) => {
      const shuffles = newSize === 3 ? 5 : newSize === 4 ? 9 : 14;
      setGrid(generateSolvablePuzzle(newSize, shuffles));
      setMoves(0);
      setStartTime(Date.now());
      setElapsed(0);
      setIsSolved(false);
   }, [size]);

   // Handle Cell Flip
   const handleCellClick = (r, c) => {
      if (isSolved) return;

      const nextGrid = toggleCellAndNeighbors(grid, r, c);
      setGrid(nextGrid);
      const newMoves = moves + 1;
      setMoves(newMoves);

      // Web Audio sound tone
      if (soundEnabled) {
         const freq = 340 + ((r * size + c) % 8) * 45;
         try {
            playTone(freq, 0.08, 'triangle', 0.12);
         } catch (e) {
            // Ignore
         }
      }

      // Check Victory
      if (checkAllLightsOut(nextGrid)) {
         setIsSolved(true);
         arcadeSounds.gameWin();
         if (!highScore || newMoves < highScore) {
            setHighScore(newMoves);
            saveGameHighScore('matrix-flip', { bestMoves: newMoves });
         }
      }
   };

   // Active lights count
   const activeLights = grid.flat().filter(Boolean).length;

   return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4 select-none touch-none">
         {/* Top HUD: Grid Size, Timer & Move Counter */}
         <div className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-md">
            {/* Grid Size Switcher */}
            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950 p-1">
               {[3, 4, 5].map((s) => (
                  <button
                     key={s}
                     type="button"
                     onClick={() => {
                        setSize(s);
                        resetPuzzle(s);
                     }}
                     className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-colors ${
                        size === s ? 'bg-purple-500 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                     }`}>
                     {s}×{s}
                  </button>
               ))}
            </div>

            {/* Counters */}
            <div className="flex items-center space-x-4 text-xs font-mono">
               <div>
                  <span className="text-zinc-500 text-[10px] uppercase block">Moves</span>
                  <span className="text-sm font-bold text-zinc-100">{moves}</span>
               </div>
               <div className="w-[1px] h-6 bg-zinc-800" />
               <div>
                  <span className="text-zinc-500 text-[10px] uppercase block">Time</span>
                  <span className="text-sm font-bold text-zinc-300">{elapsed}s</span>
               </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
               <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors">
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-zinc-500" />}
               </button>
               <button
                  type="button"
                  onClick={() => resetPuzzle(size)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors">
                  <RotateCcw size={16} />
               </button>
            </div>
         </div>

         {/* Light Matrix Status */}
         <div className="w-full flex items-center justify-between px-2 text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
               <Lightbulb size={13} className="text-purple-400" />
               <span>
                  Active Lights: <strong className="text-zinc-200 font-mono">{activeLights}</strong>
               </span>
            </div>

            {highScore && (
               <div className="flex items-center gap-1 text-[11px] text-amber-400">
                  <Trophy size={11} />
                  <span>Record: {highScore} moves</span>
               </div>
            )}
         </div>

         {/* Matrix Grid Container */}
         <div className="relative p-4 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl w-full max-w-[360px]">
            <div
               className="grid gap-2.5 sm:gap-3"
               style={{
                  gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
               }}>
               {grid.map((row, r) =>
                  row.map((isOn, c) => (
                     <button
                        key={`${r}-${c}`}
                        type="button"
                        onClick={() => handleCellClick(r, c)}
                        className={`aspect-square rounded-2xl border transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-90 ${
                           isOn
                              ? 'bg-purple-500 border-purple-300 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)]'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-700 hover:border-zinc-700'
                        }`}>
                        <span
                           className={`w-3 h-3 rounded-full transition-all ${
                              isOn ? 'bg-white shadow-[0_0_8px_white]' : 'bg-zinc-900 border border-zinc-800'
                           }`}
                        />
                     </button>
                  ))
               )}
            </div>

            {/* Solved Victory Overlay */}
            {isSolved && (
               <div className="absolute inset-0 rounded-3xl bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 shadow-[0_0_24px_rgba(168,85,247,0.3)]">
                     <Sparkles size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1">Matrix Cleared!</h3>
                  <p className="text-xs text-zinc-400 mb-4">All lights successfully extinguished</p>

                  <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-5">
                     <div className="text-center">
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">Moves</div>
                        <div className="text-xl font-black font-mono text-purple-400">{moves}</div>
                     </div>
                     <div className="w-[1px] h-8 bg-zinc-800" />
                     <div className="text-center">
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">Time</div>
                        <div className="text-xl font-black font-mono text-zinc-200">{elapsed}s</div>
                     </div>
                  </div>

                  <button
                     type="button"
                     onClick={() => resetPuzzle(size)}
                     className="px-6 py-2.5 rounded-xl font-bold bg-purple-500 text-white hover:bg-purple-400 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2">
                     <RotateCcw size={14} />
                     <span>Next Puzzle</span>
                  </button>
               </div>
            )}
         </div>

         {/* Instructions Hint */}
         <div className="text-xs text-zinc-500 text-center max-w-xs">
            Tapping a light inverts itself and its 4 neighbors. Turn every single light off to win!
         </div>
      </div>
   );
}

