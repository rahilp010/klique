import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Volume2, VolumeX, Users, Bot, Crown } from 'lucide-react';
import {
   BOARD_SIZE,
   EMPTY,
   P1_PIECE,
   P1_KING,
   P2_PIECE,
   P2_KING,
   isP1,
   isP2,
   isKing,
   createInitialCheckersBoard,
   getValidMovesForPiece,
   getAllMovesForPlayer,
   applyMove,
} from './checkersLogic';
import { getGameHighScore, saveGameHighScore } from '../storage';
import { playTone, arcadeSounds } from '../sound';

export default function NeonCheckers() {
   const [board, setBoard] = useState(createInitialCheckersBoard);
   const [turn, setTurn] = useState(true); // true = P1 (Lime), false = P2 (Pink)
   const [mode, setMode] = useState('ai'); // 'ai' | 'pvp'
   const [selectedPiece, setSelectedPiece] = useState(null); // { r, c }
   const [validMoves, setValidMoves] = useState([]);
   const [winner, setWinner] = useState(null); // 'p1' | 'p2' | null
   const [scores, setScores] = useState({ p1: 0, p2: 0 });
   const [soundEnabled, setSoundEnabled] = useState(true);
   const [isAiThinking, setIsAiThinking] = useState(false);

   // Load saved scores
   useEffect(() => {
      const saved = getGameHighScore('checkers');
      if (saved && saved.wins !== undefined) {
         setScores({
            p1: saved.wins || 0,
            p2: saved.losses || 0,
         });
      }
   }, []);

   const playMoveSfx = useCallback((isCapture) => {
      if (!soundEnabled) return;
      try {
         if (isCapture) {
            playTone(480, 0.08, 'sawtooth', 0.15);
         } else {
            playTone(320, 0.05, 'sine', 0.1);
         }
      } catch (e) {
         // Ignore
      }
   }, [soundEnabled]);

   // Start fresh game
   const handleReset = useCallback(() => {
      setBoard(createInitialCheckersBoard());
      setTurn(true);
      setSelectedPiece(null);
      setValidMoves([]);
      setWinner(null);
      setIsAiThinking(false);
   }, []);

   // Select piece
   const handleSquareClick = (r, c) => {
      if (winner || isAiThinking) return;

      const piece = board[r][c];

      // If clicking already selected destination move
      const targetMove = validMoves.find((m) => m.toR === r && m.toC === c);
      if (selectedPiece && targetMove) {
         executeMove(selectedPiece.r, selectedPiece.c, targetMove);
         return;
      }

      // Select piece of current player
      if (piece !== EMPTY && (turn ? isP1(piece) : isP2(piece))) {
         setSelectedPiece({ r, c });
         const moves = getValidMovesForPiece(board, r, c);
         setValidMoves(moves);
      } else {
         setSelectedPiece(null);
         setValidMoves([]);
      }
   };

   // Execute move
   const executeMove = (fromR, fromC, move) => {
      const nextBoard = applyMove(board, fromR, fromC, move.toR, move.toC, move.isJump, move.jumpOver);
      setBoard(nextBoard);
      playMoveSfx(move.isJump);
      setSelectedPiece(null);
      setValidMoves([]);

      // Check win condition
      const opponentMoves = getAllMovesForPlayer(nextBoard, !turn);
      if (opponentMoves.length === 0) {
         const win = turn ? 'p1' : 'p2';
         setWinner(win);
         if (win === 'p1') {
            arcadeSounds.gameWin();
            setScores((s) => {
               const updated = { ...s, p1: s.p1 + 1 };
               saveGameHighScore('checkers', { wins: updated.p1, losses: updated.p2 });
               return updated;
            });
         } else {
            arcadeSounds.gameOver();
            setScores((s) => {
               const updated = { ...s, p2: s.p2 + 1 };
               saveGameHighScore('checkers', { wins: updated.p1, losses: updated.p2 });
               return updated;
            });
         }
      } else {
         setTurn(!turn);
      }
   };

   // AI Turn Handler
   useEffect(() => {
      if (mode === 'ai' && !turn && !winner) {
         setIsAiThinking(true);
         const timer = setTimeout(() => {
            const aiMoves = getAllMovesForPlayer(board, false);
            if (aiMoves.length === 0) {
               setWinner('p1');
               arcadeSounds.gameWin();
               return;
            }

            // Prioritize jump captures
            let chosenMove = null;
            let chosenPiece = null;

            for (const pieceEntry of aiMoves) {
               const jump = pieceEntry.moves.find((m) => m.isJump);
               if (jump) {
                  chosenMove = jump;
                  chosenPiece = pieceEntry;
                  break;
               }
            }

            // Otherwise pick random valid move
            if (!chosenMove) {
               chosenPiece = aiMoves[Math.floor(Math.random() * aiMoves.length)];
               chosenMove = chosenPiece.moves[Math.floor(Math.random() * chosenPiece.moves.length)];
            }

            const nextBoard = applyMove(
               board,
               chosenPiece.fromR,
               chosenPiece.fromC,
               chosenMove.toR,
               chosenMove.toC,
               chosenMove.isJump,
               chosenMove.jumpOver
            );
            setBoard(nextBoard);
            playMoveSfx(chosenMove.isJump);

            // Check if Player 1 has any remaining moves
            const p1Moves = getAllMovesForPlayer(nextBoard, true);
            if (p1Moves.length === 0) {
               setWinner('p2');
               arcadeSounds.gameOver();
               setScores((s) => {
                  const updated = { ...s, p2: s.p2 + 1 };
                  saveGameHighScore('checkers', { wins: updated.p1, losses: updated.p2 });
                  return updated;
               });
            } else {
               setTurn(true);
            }
            setIsAiThinking(false);
         }, 500);

         return () => clearTimeout(timer);
      }
   }, [turn, mode, winner, board, playMoveSfx]);

   // Count pieces on board
   const p1Count = board.flat().filter((p) => isP1(p)).length;
   const p2Count = board.flat().filter((p) => isP2(p)).length;

   return (
      <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-4 select-none touch-none">
         {/* Top HUD: Mode & Score */}
         <div className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-md">
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

            {/* Scoreboard */}
            <div className="flex items-center gap-3 text-xs font-mono font-bold">
               <div className="flex items-center gap-1 text-[#daf4aa]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#daf4aa]" />
                  <span>{scores.p1}W</span>
               </div>
               <span className="text-zinc-600">:</span>
               <div className="flex items-center gap-1 text-pink-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                  <span>{scores.p2}W</span>
               </div>
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

         {/* Turn / Piece Counter Banner */}
         <div className="w-full flex items-center justify-between px-2 text-xs">
            <div className="flex items-center gap-2">
               <span
                  className={`w-3 h-3 rounded-full ${
                     turn ? 'bg-[#daf4aa] shadow-[0_0_8px_#daf4aa]' : 'bg-pink-500 shadow-[0_0_8px_#ec4899]'
                  }`}
               />
               <span className="font-semibold text-zinc-200">
                  {winner
                     ? `${winner === 'p1' ? 'Player 1 (Lime)' : mode === 'ai' ? 'Computer (Pink)' : 'Player 2 (Pink)'} Won!`
                     : isAiThinking
                     ? 'Computer thinking...'
                     : `${turn ? 'Player 1 (Lime)' : mode === 'ai' ? 'Computer' : 'Player 2 (Pink)'}'s Turn`}
               </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px] text-zinc-400">
               <span>Lime: {p1Count}</span>
               <span>Pink: {p2Count}</span>
            </div>
         </div>

         {/* 8x8 Checkers Board */}
         <div className="relative p-3.5 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl w-full max-w-[390px]">
            <div className="grid grid-cols-8 gap-0 rounded-2xl overflow-hidden border border-zinc-800">
               {board.map((row, r) =>
                  row.map((cell, c) => {
                     const isDarkSquare = (r + c) % 2 === 1;
                     const isSelected = selectedPiece && selectedPiece.r === r && selectedPiece.c === c;
                     const isValidDest = validMoves.some((m) => m.toR === r && m.toC === c);

                     return (
                        <div
                           key={`${r}-${c}`}
                           onClick={() => handleSquareClick(r, c)}
                           className={`aspect-square flex items-center justify-center relative cursor-pointer transition-colors ${
                              isDarkSquare ? 'bg-zinc-900/90' : 'bg-zinc-950'
                           } ${isSelected ? 'ring-2 ring-[#daf4aa] z-10' : ''}`}>
                           {/* Highlight valid move target dot */}
                           {isValidDest && (
                              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] z-20 animate-pulse pointer-events-none" />
                           )}

                           {/* Render Piece */}
                           {cell !== EMPTY && (
                              <div
                                 className={`w-[78%] h-[78%] rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-md ${
                                    isP1(cell)
                                       ? 'bg-[#daf4aa] text-zinc-950 border border-lime-300 shadow-[0_0_8px_rgba(218,244,170,0.3)]'
                                       : 'bg-pink-500 text-white border border-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.3)]'
                                 }`}>
                                 {isKing(cell) && (
                                    <Crown size={14} className="fill-current drop-shadow-sm" />
                                 )}
                              </div>
                           )}
                        </div>
                     );
                  })
               )}
            </div>
         </div>

         {/* Helper Hint */}
         <div className="text-xs text-zinc-500 text-center">
            Tap a piece to see valid diagonal moves &bull; Jump over opponent pieces to capture them!
         </div>
      </div>
   );
}

