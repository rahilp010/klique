import React, { useState, useEffect, useRef } from 'react';
import {
   RotateCcw,
   Volume2,
   VolumeX,
   Clock,
   Trophy,
   Sparkles,
   CheckCircle2,
   Eraser,
} from 'lucide-react';
import {
   PUZZLES_6X6,
   PUZZLES_9X9,
   isConflict,
   isSudokuComplete,
} from './sudokuLogic';
import { arcadeSounds } from '../sound';
import {
   getGameHighScore,
   saveGameHighScore,
   getArcadeSettings,
   saveArcadeSettings,
} from '../storage';
import GameResult from '../../components/games/GameResult';

export default function SudokuGame() {
   const [size, setSize] = useState(6); // 6 or 9
   const [puzzleIndex, setPuzzleIndex] = useState(0);
   const [initialGrid, setInitialGrid] = useState(() => PUZZLES_6X6[0].initial);
   const [grid, setGrid] = useState(() => PUZZLES_6X6[0].initial.map((row) => [...row]));
   const [selectedCell, setSelectedCell] = useState([0, 0]); // [r, c]
   const [seconds, setSeconds] = useState(0);
   const [isTimerRunning, setIsTimerRunning] = useState(true);
   const [isSolved, setIsSolved] = useState(false);
   const [bestTime, setBestTime] = useState(null);
   const [soundEnabled, setSoundEnabled] = useState(true);

   const timerRef = useRef(null);

   useEffect(() => {
      const stored = getGameHighScore('sudoku') || {};
      setBestTime(stored[size] || null);
      const settings = getArcadeSettings();
      setSoundEnabled(settings.soundEnabled ?? true);
   }, [size]);

   const handleToggleSound = () => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      saveArcadeSettings({ soundEnabled: next });
   };

   // Timer
   useEffect(() => {
      if (isTimerRunning && !isSolved) {
         timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      } else {
         clearInterval(timerRef.current);
      }
      return () => clearInterval(timerRef.current);
   }, [isTimerRunning, isSolved]);

   // Start New Puzzle
   const loadPuzzle = (targetSize, pIdx = 0) => {
      clearInterval(timerRef.current);
      setSize(targetSize);
      setPuzzleIndex(pIdx);
      const pList = targetSize === 6 ? PUZZLES_6X6 : PUZZLES_9X9;
      const chosen = pList[pIdx % pList.length];
      setInitialGrid(chosen.initial);
      setGrid(chosen.initial.map((r) => [...r]));
      setSelectedCell([0, 0]);
      setSeconds(0);
      setIsSolved(false);
      setIsTimerRunning(true);
      arcadeSounds.click();
   };

   // Set Number in Selected Cell
   const handleSetNumber = (num) => {
      if (isSolved) return;
      const [r, c] = selectedCell;
      if (initialGrid[r][c] !== 0) return; // Cannot edit given initial cell

      const newGrid = grid.map((row) => [...row]);
      newGrid[r][c] = num;
      setGrid(newGrid);
      arcadeSounds.move();

      // Check if finished and valid
      if (isSudokuComplete(newGrid, size)) {
         setIsSolved(true);
         setIsTimerRunning(false);
         arcadeSounds.win();

         const stored = getGameHighScore('sudoku') || {};
         const currentBest = stored[size];
         if (!currentBest || seconds < currentBest) {
            const updated = { ...stored, [size]: seconds };
            setBestTime(seconds);
            saveGameHighScore('sudoku', updated);
         }
      }
   };

   // Physical keyboard listener
   useEffect(() => {
      const handleKeyDown = (e) => {
         const num = parseInt(e.key, 10);
         if (!isNaN(num) && num >= 1 && num <= size) {
            handleSetNumber(num);
         } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
            handleSetNumber(0);
         } else if (e.key === 'ArrowUp') {
            setSelectedCell(([r, c]) => [Math.max(0, r - 1), c]);
         } else if (e.key === 'ArrowDown') {
            setSelectedCell(([r, c]) => [Math.min(size - 1, r + 1), c]);
         } else if (e.key === 'ArrowLeft') {
            setSelectedCell(([r, c]) => [r, Math.max(0, c - 1)]);
         } else if (e.key === 'ArrowRight') {
            setSelectedCell(([r, c]) => [r, Math.min(size - 1, c + 1)]);
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   });

   const [selR, selC] = selectedCell;
   const boxRows = size === 6 ? 2 : 3;
   const boxCols = size === 6 ? 3 : 3;
   const isNewBest = isSolved && (!bestTime || seconds <= bestTime);

   return (
      <div className="flex flex-col items-center select-none">
         {/* Top Controls & Status */}
         <div className="w-full max-w-sm mb-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
               <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-1">
                  <button
                     type="button"
                     onClick={() => loadPuzzle(6, 0)}
                     className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        size === 6
                           ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                           : 'text-zinc-400 hover:text-white'
                     }`}>
                     6×6 Quick
                  </button>
                  <button
                     type="button"
                     onClick={() => loadPuzzle(9, 0)}
                     className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        size === 9
                           ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                           : 'text-zinc-400 hover:text-white'
                     }`}>
                     9×9 Classic
                  </button>
               </div>

               <div className="flex items-center gap-1.5">
                  <button
                     type="button"
                     onClick={() => loadPuzzle(size, puzzleIndex)}
                     aria-label="Restart Puzzle"
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
               <span className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold">
                  <Clock size={13} />
                  <span>{seconds}s</span>
               </span>

               {bestTime && (
                  <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                     <Trophy size={11} className="text-[#daf4aa]" />
                     Best: {bestTime}s
                  </span>
               )}
            </div>
         </div>

         {/* Sudoku Grid */}
         <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-3 sm:p-4 shadow-2xl">
            <div
               className="grid gap-[2px] bg-zinc-800 border-2 border-zinc-700 rounded-xl overflow-hidden"
               style={{
                  gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                  width: size === 9 ? '350px' : '290px',
               }}>
               {grid.map((row, r) =>
                  row.map((val, c) => {
                     const isInitial = initialGrid[r][c] !== 0;
                     const isSelected = selR === r && selC === c;
                     const isRelated = selR === r || selC === c;
                     const hasError = !isInitial && val > 0 && isConflict(grid, r, c, val, size);

                     // Thick block boundary styling
                     const isBottomBlock = (r + 1) % boxRows === 0 && r !== size - 1;
                     const isRightBlock = (c + 1) % boxCols === 0 && c !== size - 1;

                     return (
                        <button
                           key={`${r}-${c}`}
                           type="button"
                           onClick={() => setSelectedCell([r, c])}
                           className={`flex aspect-square items-center justify-center text-sm sm:text-base font-mono font-bold transition-all focus-visible:outline-none ${
                              isSelected
                                 ? 'bg-[#daf4aa] text-zinc-950 font-black scale-105 shadow-md z-10'
                                 : hasError
                                 ? 'bg-rose-950/80 text-rose-300'
                                 : isInitial
                                 ? 'bg-zinc-900 text-white font-extrabold'
                                 : isRelated
                                 ? 'bg-zinc-850/80 text-[#daf4aa]'
                                 : 'bg-zinc-900/60 text-zinc-200 hover:bg-zinc-800'
                           } ${isBottomBlock ? 'border-b-2 border-b-zinc-600' : ''} ${
                              isRightBlock ? 'border-r-2 border-r-zinc-600' : ''
                           }`}>
                           {val > 0 ? val : ''}
                        </button>
                     );
                  })
               )}
            </div>

            {/* Victory Modal */}
            {isSolved && (
               <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/85 backdrop-blur-md p-4">
                  <GameResult
                     status="win"
                     title="Puzzle Solved!"
                     score={`${seconds} seconds`}
                     scoreLabel="Solve Time"
                     bestScore={bestTime ? `${bestTime}s` : null}
                     isNewBest={isNewBest}
                     onRestart={() => loadPuzzle(size, puzzleIndex + 1)}
                  />
               </div>
            )}
         </div>

         {/* Number Keypad Bar */}
         <div className="mt-4 flex items-center justify-center gap-1.5 max-w-sm">
            {Array.from({ length: size }).map((_, i) => (
               <button
                  key={i + 1}
                  type="button"
                  onClick={() => handleSetNumber(i + 1)}
                  className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-base font-bold font-mono text-zinc-200 hover:border-[#daf4aa] hover:bg-[#daf4aa]/10 hover:text-[#daf4aa] active:scale-95 transition-all">
                  {i + 1}
               </button>
            ))}
            <button
               type="button"
               onClick={() => handleSetNumber(0)}
               aria-label="Erase"
               className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-red-500 hover:text-red-400 active:scale-95 transition-all">
               <Eraser size={16} />
            </button>
         </div>
      </div>
   );
}

