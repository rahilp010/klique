import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
   Play,
   RotateCcw,
   Volume2,
   VolumeX,
   Trophy,
   ArrowUp,
   ArrowDown,
   ArrowLeft,
   ArrowRight,
   Zap,
   Layers,
} from 'lucide-react';
import {
   BOARD_COLS,
   BOARD_ROWS,
   createEmptyBoard,
   getRandomPiece,
   checkCollision,
   rotateShape,
   lockPiece,
   clearFullLines,
   getGhostPosition,
} from './blockDropLogic';
import { arcadeSounds } from '../sound';
import {
   getGameHighScore,
   saveGameHighScore,
   getArcadeSettings,
   saveArcadeSettings,
} from '../storage';
import GameControls from '../../components/games/GameControls';
import GameResult from '../../components/games/GameResult';

export default function BlockDrop({ isFullscreen = false }) {
   const [board, setBoard] = useState(createEmptyBoard);
   const [currentPiece, setCurrentPiece] = useState(null);
   const [nextPiece, setNextPiece] = useState(null);
   const [holdPiece, setHoldPiece] = useState(null);
   const [canHold, setCanHold] = useState(true);
   const [score, setScore] = useState(0);
   const [lines, setLines] = useState(0);
   const [level, setLevel] = useState(1);
   const [highScore, setHighScore] = useState(0);
   const [gameState, setGameState] = useState('idle'); // 'idle' | 'running' | 'paused' | 'gameover'
   const [soundEnabled, setSoundEnabled] = useState(true);

   const dropIntervalRef = useRef(null);
   const boardRef = useRef(board);
   const currentPieceRef = useRef(currentPiece);
   const nextPieceRef = useRef(nextPiece);
   const gameStateRef = useRef(gameState);

   // Sync refs
   boardRef.current = board;
   currentPieceRef.current = currentPiece;
   nextPieceRef.current = nextPiece;
   gameStateRef.current = gameState;

   useEffect(() => {
      const stored = getGameHighScore('block-drop') || {};
      setHighScore(stored.bestScore || 0);
      const settings = getArcadeSettings();
      setSoundEnabled(settings.soundEnabled ?? true);

      return () => clearInterval(dropIntervalRef.current);
   }, []);

   const handleToggleSound = () => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      saveArcadeSettings({ soundEnabled: next });
   };

   // Lock piece, clear lines, and spawn next
   const handleLockPiece = useCallback(() => {
      const p = currentPieceRef.current;
      const b = boardRef.current;
      if (!p) return;

      const lockedBoard = lockPiece(b, p);
      const { newBoard, linesCleared } = clearFullLines(lockedBoard);

      if (linesCleared > 0) {
         arcadeSounds.match();
         const addedPoints = [0, 100, 300, 500, 800][linesCleared] * level;
         setScore((s) => s + addedPoints);
         setLines((l) => {
            const nextLines = l + linesCleared;
            setLevel(Math.floor(nextLines / 10) + 1);
            return nextLines;
         });
      } else {
         arcadeSounds.move();
      }

      // Check spawn next piece
      const next = nextPieceRef.current || getRandomPiece();
      const newNext = getRandomPiece();

      if (checkCollision(newBoard, next)) {
         // Blocked at spawn: Game Over
         arcadeSounds.gameOver();
         setGameState('gameover');
         clearInterval(dropIntervalRef.current);

         setScore((finalScore) => {
            if (finalScore > highScore) {
               setHighScore(finalScore);
               saveGameHighScore('block-drop', { bestScore: finalScore });
            }
            return finalScore;
         });
         return;
      }

      setBoard(newBoard);
      setCurrentPiece(next);
      setNextPiece(newNext);
      setCanHold(true);
   }, [level, highScore]);

   // Move piece down by 1
   const moveDown = useCallback(() => {
      if (gameStateRef.current !== 'running') return;
      const p = currentPieceRef.current;
      const b = boardRef.current;
      if (!p) return;

      if (!checkCollision(b, p, 0, 1)) {
         setCurrentPiece({ ...p, y: p.y + 1 });
      } else {
         handleLockPiece();
      }
   }, [handleLockPiece]);

   // Hard Drop (instant drop to ghost position)
   const hardDrop = useCallback(() => {
      if (gameStateRef.current !== 'running') return;
      const p = currentPieceRef.current;
      const b = boardRef.current;
      if (!p) return;

      const ghostY = getGhostPosition(b, p);
      const distance = ghostY - p.y;
      setScore((s) => s + distance * 2);
      currentPieceRef.current = { ...p, y: ghostY };
      handleLockPiece();
   }, [handleLockPiece]);

   // Move Left / Right
   const moveHorizontal = useCallback((dir) => {
      if (gameStateRef.current !== 'running') return;
      const p = currentPieceRef.current;
      const b = boardRef.current;
      if (!p) return;

      if (!checkCollision(b, p, dir, 0)) {
         setCurrentPiece({ ...p, x: p.x + dir });
         arcadeSounds.move();
      }
   }, []);

   // Rotate
   const rotate = useCallback(() => {
      if (gameStateRef.current !== 'running') return;
      const p = currentPieceRef.current;
      const b = boardRef.current;
      if (!p) return;

      const rotated = rotateShape(p.shape);
      // Basic wall kick check
      if (!checkCollision(b, p, 0, 0, rotated)) {
         setCurrentPiece({ ...p, shape: rotated });
         arcadeSounds.flip();
      } else if (!checkCollision(b, p, -1, 0, rotated)) {
         setCurrentPiece({ ...p, shape: rotated, x: p.x - 1 });
         arcadeSounds.flip();
      } else if (!checkCollision(b, p, 1, 0, rotated)) {
         setCurrentPiece({ ...p, shape: rotated, x: p.x + 1 });
         arcadeSounds.flip();
      }
   }, []);

   // Hold Piece
   const handleHold = useCallback(() => {
      if (gameStateRef.current !== 'running' || !canHold) return;
      const p = currentPieceRef.current;
      if (!p) return;

      arcadeSounds.click();
      setCanHold(false);

      if (!holdPiece) {
         setHoldPiece({ type: p.type, shape: p.shape, color: p.color });
         const next = nextPiece || getRandomPiece();
         setCurrentPiece(next);
         setNextPiece(getRandomPiece());
      } else {
         const currentType = p.type;
         const restored = getRandomPiece(); // fresh origin piece of hold type
         setHoldPiece({ type: currentType, shape: p.shape, color: p.color });
         setCurrentPiece({
            ...restored,
            type: holdPiece.type,
            shape: holdPiece.shape,
            color: holdPiece.color,
         });
      }
   }, [canHold, holdPiece, nextPiece]);

   // Start Game
   const startGame = () => {
      const p1 = getRandomPiece();
      const p2 = getRandomPiece();
      setBoard(createEmptyBoard());
      setCurrentPiece(p1);
      setNextPiece(p2);
      setHoldPiece(null);
      setCanHold(true);
      setScore(0);
      setLines(0);
      setLevel(1);
      setGameState('running');
      arcadeSounds.click();
   };

   const pauseGame = () => {
      if (gameState === 'running') setGameState('paused');
   };

   const resumeGame = () => {
      if (gameState === 'paused') setGameState('running');
   };

   // Gravity Drop Interval
   useEffect(() => {
      if (gameState === 'running') {
         const speed = Math.max(120, 800 - (level - 1) * 65);
         dropIntervalRef.current = setInterval(moveDown, speed);
      } else {
         clearInterval(dropIntervalRef.current);
      }
      return () => clearInterval(dropIntervalRef.current);
   }, [gameState, level, moveDown]);

   // Keyboard controls
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
         }

         if (e.key === ' ' || e.code === 'Space') {
            hardDrop();
         } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            rotate();
         } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            moveHorizontal(-1);
         } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            moveHorizontal(1);
         } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
            moveDown();
         } else if (e.key === 'c' || e.key === 'C') {
            handleHold();
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [hardDrop, rotate, moveHorizontal, moveDown, handleHold]);

   // Compute Ghost piece position
   const ghostY =
      currentPiece && gameState === 'running'
         ? getGhostPosition(board, currentPiece)
         : null;

   const isNewBest = score > highScore && score > 0;

   return (
      <div className="flex flex-col items-center select-none">
         {/* Top Controls & Status */}
         <div className="w-full max-w-sm mb-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
               <GameControls
                  isPlaying={gameState === 'running'}
                  isPaused={gameState === 'paused'}
                  onStart={startGame}
                  onPause={pauseGame}
                  onResume={resumeGame}
                  onRestart={startGame}
                  soundEnabled={soundEnabled}
                  onToggleSound={handleToggleSound}
               />
            </div>

            {/* Counters */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs">
               <div className="flex items-center gap-2">
                  <span className="text-zinc-400">
                     Lines: <span className="font-mono text-white font-bold">{lines}</span>
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="text-zinc-400">
                     Level: <span className="font-mono text-[#daf4aa] font-bold">{level}</span>
                  </span>
               </div>

               <div className="flex items-center gap-3">
                  <span className="font-mono text-zinc-300 font-bold">
                     Score: <span className="text-white">{score}</span>
                  </span>
                  {highScore > 0 && (
                     <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                        <Trophy size={11} className="text-[#daf4aa]" />
                        {highScore}
                     </span>
                  )}
               </div>
            </div>
         </div>

         {/* Matrix Arena with Sidebar Previews */}
         <div className="relative flex items-start gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 sm:p-4 shadow-2xl">
            {/* Hold Slot */}
            <div className="hidden sm:flex flex-col items-center w-16 rounded-xl border border-zinc-800 bg-zinc-900/40 p-2 text-[10px] text-zinc-500 font-mono">
               <span className="mb-2">HOLD (C)</span>
               <div className="h-10 w-10 flex items-center justify-center">
                  {holdPiece ? (
                     <div
                        className="h-3 w-3 rounded-sm shadow-sm"
                        style={{ backgroundColor: holdPiece.color }}
                     />
                  ) : (
                     <span className="text-zinc-700">Empty</span>
                  )}
               </div>
            </div>

            {/* 10x20 Main Board */}
            <div className="relative border border-zinc-800 bg-[#09090b] rounded-lg overflow-hidden flex items-center justify-center">
               <div
                  className="grid gap-[1px] bg-zinc-900 aspect-[1/2]"
                  style={{
                     gridTemplateColumns: `repeat(${BOARD_COLS}, minmax(0, 1fr))`,
                     width: 'min(240px, calc((100dvh - 8rem) / 2))',
                     height: 'min(480px, calc(100dvh - 8rem))',
                  }}>
                  {board.map((row, r) =>
                     row.map((cellColor, c) => {
                        let fill = cellColor || '#09090b';
                        let isGhost = false;

                        // Check current active piece
                        if (currentPiece) {
                           const pr = r - currentPiece.y;
                           const pc = c - currentPiece.x;
                           if (
                              pr >= 0 &&
                              pr < currentPiece.shape.length &&
                              pc >= 0 &&
                              pc < currentPiece.shape[0].length &&
                              currentPiece.shape[pr][pc] !== 0
                           ) {
                              fill = currentPiece.color;
                           }
                        }

                        // Check ghost piece
                        if (ghostY !== null && currentPiece) {
                           const gr = r - ghostY;
                           const gc = c - currentPiece.x;
                           if (
                              gr >= 0 &&
                              gr < currentPiece.shape.length &&
                              gc >= 0 &&
                              gc < currentPiece.shape[0].length &&
                              currentPiece.shape[gr][gc] !== 0 &&
                              fill === '#09090b'
                           ) {
                              isGhost = true;
                           }
                        }

                        return (
                           <div
                              key={`${r}-${c}`}
                              className="w-full h-full rounded-[2px]"
                              style={{
                                 backgroundColor: isGhost ? 'transparent' : fill,
                                 border: isGhost ? '1px dashed rgba(218, 244, 170, 0.4)' : 'none',
                                 boxShadow:
                                    fill !== '#09090b' && !isGhost
                                       ? `inset 0 0 4px rgba(255,255,255,0.2)`
                                       : 'none',
                              }}
                           />
                        );
                     })
                  )}
               </div>

               {/* Overlay: Start Screen */}
               {gameState === 'idle' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-4 text-center">
                     <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#daf4aa]/15 text-[#daf4aa]">
                        <Play size={24} className="fill-current ml-0.5" />
                     </div>
                     <h3 className="text-base font-bold text-white">Block Drop</h3>
                     <p className="mt-1 text-[11px] text-zinc-400 max-w-[180px]">
                        Stack blocks, clear complete lines, and push for a 4-line combo!
                     </p>
                     <button
                        type="button"
                        onClick={startGame}
                        className="mt-4 rounded-xl bg-[#daf4aa] px-5 py-2 text-xs font-bold text-zinc-950 transition-transform hover:scale-105">
                        Start Stacking
                     </button>
                  </div>
               )}

               {/* Game Over Modal */}
               {gameState === 'gameover' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md p-3">
                     <GameResult
                        status="gameover"
                        title="Board Full!"
                        score={`${score} points`}
                        scoreLabel="Final Score"
                        bestScore={highScore}
                        isNewBest={isNewBest}
                        onRestart={startGame}
                        extraMessage={`Cleared ${lines} lines (Level ${level})`}
                     />
                  </div>
               )}
            </div>

            {/* Next Piece Slot */}
            <div className="hidden sm:flex flex-col items-center w-16 rounded-xl border border-zinc-800 bg-zinc-900/40 p-2 text-[10px] text-zinc-500 font-mono">
               <span className="mb-2">NEXT</span>
               <div className="h-10 w-10 flex items-center justify-center">
                  {nextPiece && (
                     <div
                        className="h-3.5 w-3.5 rounded-sm shadow-sm"
                        style={{ backgroundColor: nextPiece.color }}
                     />
                  )}
               </div>
            </div>
         </div>

         {/* Mobile Touch Controller Bar */}
         <div className="mt-4 flex flex-col items-center gap-2 sm:hidden select-none">
            <div className="flex items-center gap-4">
               <button
                  type="button"
                  onClick={rotate}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 active:bg-[#daf4aa] active:text-zinc-950 text-zinc-200">
                  <ArrowUp size={20} />
               </button>
               <button
                  type="button"
                  onClick={hardDrop}
                  className="flex h-12 w-14 items-center justify-center rounded-xl border border-zinc-800 bg-[#daf4aa] text-zinc-950 font-bold text-xs">
                  DROP
               </button>
               <button
                  type="button"
                  onClick={handleHold}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 active:bg-[#daf4aa] active:text-zinc-950 text-zinc-200 text-xs font-mono">
                  HOLD
               </button>
            </div>
            <div className="flex items-center gap-6">
               <button
                  type="button"
                  onClick={() => moveHorizontal(-1)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 active:bg-[#daf4aa] active:text-zinc-950 text-zinc-200">
                  <ArrowLeft size={20} />
               </button>
               <button
                  type="button"
                  onClick={moveDown}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 active:bg-[#daf4aa] active:text-zinc-950 text-zinc-200">
                  <ArrowDown size={20} />
               </button>
               <button
                  type="button"
                  onClick={() => moveHorizontal(1)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 active:bg-[#daf4aa] active:text-zinc-950 text-zinc-200">
                  <ArrowRight size={20} />
               </button>
            </div>
         </div>
      </div>
   );
}

