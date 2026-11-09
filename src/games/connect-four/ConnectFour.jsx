import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Volume2, VolumeX, Users, Bot, CircleDot, ArrowDown } from 'lucide-react';
import {
   ROWS,
   COLS,
   EMPTY,
   PLAYER_1,
   PLAYER_2,
   createEmptyBoard,
   getLowestEmptyRow,
   checkWin,
   getBestAiMove,
} from './connectFourLogic';
import { getGameHighScore, saveGameHighScore } from '../storage';
import { playTone, arcadeSounds } from '../sound';

export default function ConnectFour() {
   const [board, setBoard] = useState(createEmptyBoard);
   const [turn, setTurn] = useState(PLAYER_1);
   const [mode, setMode] = useState('ai'); // 'ai' | 'pvp'
   const [difficulty, setDifficulty] = useState('medium'); // 'easy' | 'medium' | 'hard'
   const [winResult, setWinResult] = useState(null); // { winner, cells }
   const [isAiThinking, setIsAiThinking] = useState(false);
   const [scores, setScores] = useState({ p1: 0, p2: 0, draws: 0 });
   const [soundEnabled, setSoundEnabled] = useState(true);
   const [hoverCol, setHoverCol] = useState(null);

   // Load saved scores
   useEffect(() => {
      const saved = getGameHighScore('connect-four');
      if (saved && saved.wins !== undefined) {
         setScores({
            p1: saved.wins || 0,
            p2: saved.losses || 0,
            draws: saved.draws || 0,
         });
      }
   }, []);

   const playDropSound = useCallback(() => {
      if (!soundEnabled) return;
      try {
         playTone(280, 0.08, 'sine', 0.15);
         setTimeout(() => playTone(220, 0.06, 'triangle', 0.12), 40);
      } catch (e) {
         // Ignore
      }
   }, [soundEnabled]);

   // Reset board
   const handleReset = useCallback(() => {
      setBoard(createEmptyBoard());
      setTurn(PLAYER_1);
      setWinResult(null);
      setIsAiThinking(false);
   }, []);

   // Drop disc in column
   const dropDisc = useCallback((col) => {
      if (winResult || isAiThinking) return;

      setBoard((prev) => {
         const row = getLowestEmptyRow(prev, col);
         if (row === -1) return prev; // Column full

         const next = prev.map((r) => [...r]);
         next[row][col] = turn;
         playDropSound();

         const result = checkWin(next);
         if (result) {
            setWinResult(result);
            if (result.winner === PLAYER_1) {
               arcadeSounds.gameWin();
               setScores((s) => {
                  const updated = { ...s, p1: s.p1 + 1 };
                  saveGameHighScore('connect-four', { wins: updated.p1, losses: updated.p2, draws: updated.draws });
                  return updated;
               });
            } else if (result.winner === PLAYER_2) {
               arcadeSounds.gameOver();
               setScores((s) => {
                  const updated = { ...s, p2: s.p2 + 1 };
                  saveGameHighScore('connect-four', { wins: updated.p1, losses: updated.p2, draws: updated.draws });
                  return updated;
               });
            } else if (result.winner === 'draw') {
               arcadeSounds.wrong();
               setScores((s) => {
                  const updated = { ...s, draws: s.draws + 1 };
                  saveGameHighScore('connect-four', { wins: updated.p1, losses: updated.p2, draws: updated.draws });
                  return updated;
               });
            }
         } else {
            // Next player's turn
            const nextTurn = turn === PLAYER_1 ? PLAYER_2 : PLAYER_1;
            setTurn(nextTurn);
         }

         return next;
      });
   }, [turn, winResult, isAiThinking, playDropSound]);

   // AI Turn Response
   useEffect(() => {
      if (mode === 'ai' && turn === PLAYER_2 && !winResult) {
         setIsAiThinking(true);
         const timer = setTimeout(() => {
            const aiCol = getBestAiMove(board, difficulty);
            setBoard((prev) => {
               const row = getLowestEmptyRow(prev, aiCol);
               if (row === -1) return prev;

               const next = prev.map((r) => [...r]);
               next[row][aiCol] = PLAYER_2;
               playDropSound();

               const result = checkWin(next);
               if (result) {
                  setWinResult(result);
                  arcadeSounds.gameOver();
                  setScores((s) => {
                     const updated = { ...s, p2: s.p2 + 1 };
                     saveGameHighScore('connect-four', { wins: updated.p1, losses: updated.p2, draws: updated.draws });
                     return updated;
                  });
               } else {
                  setTurn(PLAYER_1);
               }

               return next;
            });
            setIsAiThinking(false);
         }, 450);

         return () => clearTimeout(timer);
      }
   }, [turn, mode, winResult, board, difficulty, playDropSound]);

   // Keyboard keys 1-7 for column drop
   useEffect(() => {
      const handleKeyDown = (e) => {
         const digit = parseInt(e.key, 10);
         if (digit >= 1 && digit <= 7) {
            dropDisc(digit - 1);
         }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [dropDisc]);

   return (
      <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-4 select-none touch-none">
         {/* Top HUD: Mode & Scoreboard */}
         <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-md">
            {/* Mode Switcher */}
            <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950 p-1">
               <button
                  type="button"
                  onClick={() => {
                     setMode('ai');
                     handleReset();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                     mode === 'ai' ? 'bg-[#daf4aa] text-zinc-950' : 'text-zinc-400 hover:text-white'
                  }`}>
                  <Bot size={13} />
                  <span>Solo AI</span>
               </button>
               <button
                  type="button"
                  onClick={() => {
                     setMode('pvp');
                     handleReset();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                     mode === 'pvp' ? 'bg-[#daf4aa] text-zinc-950' : 'text-zinc-400 hover:text-white'
                  }`}>
                  <Users size={13} />
                  <span>2-Player</span>
               </button>
            </div>

            {/* Scoreboard Pill */}
            <div className="flex items-center gap-3 text-xs font-mono font-bold">
               <div className="flex items-center gap-1 text-[#daf4aa]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#daf4aa]" />
                  <span>{scores.p1}W</span>
               </div>
               <span className="text-zinc-600">:</span>
               <div className="flex items-center gap-1 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>{scores.p2}W</span>
               </div>
               {scores.draws > 0 && (
                  <span className="text-zinc-500 font-sans text-[11px]">({scores.draws}D)</span>
               )}
            </div>

            <div className="flex items-center gap-2">
               <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors">
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-zinc-500" />}
               </button>
               <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors">
                  <RotateCcw size={16} />
               </button>
            </div>
         </div>

         {/* Turn / Status Banner */}
         <div className="w-full flex items-center justify-between px-3 text-xs">
            <div className="flex items-center gap-2">
               <span
                  className={`w-3 h-3 rounded-full ${
                     turn === PLAYER_1 ? 'bg-[#daf4aa] shadow-[0_0_8px_#daf4aa]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                  }`}
               />
               <span className="font-semibold text-zinc-200">
                  {winResult
                     ? winResult.winner === 'draw'
                        ? 'Game Ended in a Draw!'
                        : `${winResult.winner === PLAYER_1 ? 'Player 1 (Lime)' : mode === 'ai' ? 'Computer (Amber)' : 'Player 2 (Amber)'} Won!`
                     : isAiThinking
                     ? 'Computer is calculating move...'
                     : `${turn === PLAYER_1 ? 'Player 1 (Lime)' : mode === 'ai' ? 'Computer' : 'Player 2 (Amber)'}'s Turn`}
               </span>
            </div>

            {mode === 'ai' && (
               <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <span>AI:</span>
                  {['easy', 'medium', 'hard'].map((d) => (
                     <button
                        key={d}
                        type="button"
                        onClick={() => {
                           setDifficulty(d);
                           handleReset();
                        }}
                        className={`capitalize px-1.5 py-0.2 rounded text-[10px] ${
                           difficulty === d ? 'bg-zinc-800 text-amber-400 font-bold' : 'text-zinc-500 hover:text-zinc-300'
                        }`}>
                        {d}
                     </button>
                  ))}
               </div>
            )}
         </div>

         {/* Column Drop Indicator Buttons */}
         <div className="grid grid-cols-7 gap-2 w-full max-w-[390px] px-2">
            {Array.from({ length: COLS }).map((_, c) => (
               <button
                  key={c}
                  type="button"
                  onClick={() => dropDisc(c)}
                  onMouseEnter={() => setHoverCol(c)}
                  onMouseLeave={() => setHoverCol(null)}
                  disabled={!!winResult || isAiThinking || board[0][c] !== EMPTY}
                  className="h-8 rounded-lg bg-zinc-900/60 border border-zinc-800/80 hover:border-[#daf4aa]/60 hover:bg-[#daf4aa]/10 flex items-center justify-center text-zinc-500 hover:text-[#daf4aa] transition-colors disabled:opacity-30 disabled:pointer-events-none">
                  <ArrowDown size={14} className={hoverCol === c ? 'animate-pulse text-[#daf4aa]' : ''} />
               </button>
            ))}
         </div>

         {/* Connect Four Physical Board */}
         <div className="relative p-3.5 rounded-3xl bg-zinc-900 border-2 border-zinc-800 shadow-2xl w-full max-w-[390px]">
            <div className="grid grid-cols-7 gap-2">
               {board.map((row, r) =>
                  row.map((cell, c) => {
                     const isWinCell =
                        winResult &&
                        winResult.cells &&
                        winResult.cells.some(([wr, wc]) => wr === r && wc === c);

                     return (
                        <div
                           key={`${r}-${c}`}
                           onClick={() => dropDisc(c)}
                           onMouseEnter={() => setHoverCol(c)}
                           onMouseLeave={() => setHoverCol(null)}
                           className="aspect-square rounded-full flex items-center justify-center cursor-pointer transition-all bg-[#09090b] border border-zinc-800/80 shadow-inner">
                           {cell === PLAYER_1 && (
                              <div
                                 className={`w-full h-full rounded-full bg-[#daf4aa] shadow-[0_0_12px_rgba(218,244,170,0.4)] ${
                                    isWinCell ? 'ring-4 ring-white animate-pulse' : ''
                                 }`}
                              />
                           )}
                           {cell === PLAYER_2 && (
                              <div
                                 className={`w-full h-full rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.4)] ${
                                    isWinCell ? 'ring-4 ring-white animate-pulse' : ''
                                 }`}
                              />
                           )}
                           {cell === EMPTY && hoverCol === c && !winResult && !isAiThinking && (
                              <div
                                 className={`w-2.5 h-2.5 rounded-full opacity-30 ${
                                    turn === PLAYER_1 ? 'bg-[#daf4aa]' : 'bg-amber-400'
                                 }`}
                              />
                           )}
                        </div>
                     );
                  })
               )}
            </div>
         </div>

         {/* Helper hint */}
         <div className="text-xs text-zinc-500 text-center">
            Tap a column or press keys <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">1</kbd> to <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">7</kbd> to drop
         </div>
      </div>
   );
}

