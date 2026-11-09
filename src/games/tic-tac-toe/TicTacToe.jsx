import React, { useState, useEffect, useCallback } from 'react';
import {
   X as IconX,
   Circle as IconO,
   Bot,
   Users,
   RotateCcw,
   Volume2,
   VolumeX,
   Trophy,
   Flame,
   Sliders,
} from 'lucide-react';
import {
   createEmptyBoard,
   checkWinner,
   isBoardFull,
   getAiMoveByDifficulty,
} from './ticTacToeLogic';
import { arcadeSounds } from '../sound';
import {
   getGameHighScore,
   saveGameHighScore,
   getArcadeSettings,
   saveArcadeSettings,
} from '../storage';
import GameResult from '../../components/games/GameResult';

export default function TicTacToe() {
   const [board, setBoard] = useState(createEmptyBoard);
   const [isVsAi, setIsVsAi] = useState(true);
   const [aiDifficulty, setAiDifficulty] = useState('medium'); // 'easy' | 'medium' | 'master'
   const [startPlayer, setStartPlayer] = useState('X'); // 'X' | 'O'
   const [turn, setTurn] = useState('X');
   const [winnerInfo, setWinnerInfo] = useState(null);
   const [isDraw, setIsDraw] = useState(false);
   const [isAiThinking, setIsAiThinking] = useState(false);
   const [streak, setStreak] = useState(0);
   const [record, setRecord] = useState({ wins: 0, losses: 0, draws: 0 });
   const [soundEnabled, setSoundEnabled] = useState(true);
   const [showSettings, setShowSettings] = useState(false);

   // Load stats from storage
   useEffect(() => {
      const stored = getGameHighScore('tic-tac-toe') || { wins: 0, losses: 0, draws: 0 };
      setRecord(stored);
      const settings = getArcadeSettings();
      setSoundEnabled(settings.soundEnabled ?? true);
   }, []);

   const handleToggleSound = () => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      saveArcadeSettings({ soundEnabled: next });
   };

   const updateRecord = useCallback((resultType) => {
      setRecord((prev) => {
         const next = {
            wins: resultType === 'win' ? prev.wins + 1 : prev.wins,
            losses: resultType === 'loss' ? prev.losses + 1 : prev.losses,
            draws: resultType === 'draw' ? prev.draws + 1 : prev.draws,
         };
         saveGameHighScore('tic-tac-toe', next);
         return next;
      });

      if (resultType === 'win') {
         setStreak((s) => s + 1);
      } else if (resultType === 'loss') {
         setStreak(0);
      }
   }, []);

   // Make human move
   const handleCellClick = (index) => {
      if (board[index] !== null || winnerInfo || isDraw || isAiThinking) return;

      const newBoard = [...board];
      newBoard[index] = turn;
      setBoard(newBoard);
      arcadeSounds.move();

      const win = checkWinner(newBoard);
      if (win) {
         setWinnerInfo(win);
         if (isVsAi) {
            if (win.winner === 'X') {
               arcadeSounds.win();
               updateRecord('win');
            } else {
               arcadeSounds.gameOver();
               updateRecord('loss');
            }
         } else {
            arcadeSounds.win();
         }
         return;
      }

      if (isBoardFull(newBoard)) {
         setIsDraw(true);
         arcadeSounds.click();
         if (isVsAi) updateRecord('draw');
         return;
      }

      const nextTurn = turn === 'X' ? 'O' : 'X';
      setTurn(nextTurn);
   };

   // AI Turn Trigger
   useEffect(() => {
      if (!isVsAi || turn !== 'O' || winnerInfo || isDraw) return;

      setIsAiThinking(true);
      const thinkTime = aiDifficulty === 'master' ? 400 : 250;
      const aiTimer = setTimeout(() => {
         const aiMove = getAiMoveByDifficulty(board, aiDifficulty, 'O', 'X');
         if (aiMove !== null) {
            const newBoard = [...board];
            newBoard[aiMove] = 'O';
            setBoard(newBoard);
            arcadeSounds.move();

            const win = checkWinner(newBoard);
            if (win) {
               setWinnerInfo(win);
               arcadeSounds.gameOver();
               updateRecord('loss');
            } else if (isBoardFull(newBoard)) {
               setIsDraw(true);
               arcadeSounds.click();
               updateRecord('draw');
            } else {
               setTurn('X');
            }
         }
         setIsAiThinking(false);
      }, thinkTime);

      return () => clearTimeout(aiTimer);
   }, [turn, isVsAi, board, winnerInfo, isDraw, aiDifficulty, updateRecord]);

   // Reset board
   const handleReset = (nextStarter = startPlayer) => {
      setBoard(createEmptyBoard());
      setTurn(nextStarter);
      setWinnerInfo(null);
      setIsDraw(false);
      setIsAiThinking(false);
      arcadeSounds.click();
   };

   return (
      <div className="flex flex-col items-center">
         {/* Top Controls & Switcher */}
         <div className="w-full max-w-sm mb-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
               {/* Mode Switcher */}
               <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-1">
                  <button
                     type="button"
                     onClick={() => {
                        setIsVsAi(true);
                        handleReset('X');
                     }}
                     className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        isVsAi
                           ? 'bg-[#daf4aa] text-zinc-950 shadow-sm'
                           : 'text-zinc-400 hover:text-white'
                     }`}>
                     <Bot size={13} />
                     <span>vs AI</span>
                  </button>

                  <button
                     type="button"
                     onClick={() => {
                        setIsVsAi(false);
                        handleReset('X');
                     }}
                     className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        !isVsAi
                           ? 'bg-[#daf4aa] text-zinc-950 shadow-sm'
                           : 'text-zinc-400 hover:text-white'
                     }`}>
                     <Users size={13} />
                     <span>2 Players</span>
                  </button>
               </div>

               {/* Right Actions */}
               <div className="flex items-center gap-1.5">
                  <button
                     type="button"
                     onClick={() => setShowSettings(!showSettings)}
                     aria-label="Settings"
                     className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                        showSettings
                           ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                           : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                     }`}>
                     <Sliders size={14} />
                  </button>
                  <button
                     type="button"
                     onClick={() => handleReset()}
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

            {/* Settings Drawer */}
            {showSettings && isVsAi && (
               <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 p-2.5 text-xs">
                  <span className="text-zinc-500">AI Level:</span>
                  <div className="flex items-center gap-1.5">
                     {[
                        { id: 'easy', label: 'Casual' },
                        { id: 'medium', label: 'Tactical' },
                        { id: 'master', label: 'Unbeatable' },
                     ].map((lvl) => (
                        <button
                           key={lvl.id}
                           type="button"
                           onClick={() => {
                              setAiDifficulty(lvl.id);
                              handleReset('X');
                           }}
                           className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                              aiDifficulty === lvl.id
                                 ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                                 : 'bg-zinc-800 text-zinc-400 hover:text-white'
                           }`}>
                           {lvl.label}
                        </button>
                     ))}
                  </div>
               </div>
            )}

            {/* Status & Record Bar */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 px-4 py-2 text-xs">
               <div className="flex items-center gap-2">
                  <span className="text-zinc-500">Turn:</span>
                  <span
                     className={`flex items-center gap-1 font-bold ${
                        turn === 'X' ? 'text-[#daf4aa]' : 'text-cyan-400'
                     }`}>
                     {turn === 'X' ? <IconX size={14} /> : <IconO size={13} />}
                     {isVsAi
                        ? turn === 'X'
                           ? 'Your Turn (X)'
                           : isAiThinking
                           ? 'AI Thinking...'
                           : 'AI Turn (O)'
                        : `Player ${turn === 'X' ? '1 (X)' : '2 (O)'}`}
                  </span>
               </div>

               <div className="flex items-center gap-3">
                  {streak > 1 && (
                     <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                        <Flame size={12} className="fill-current" />
                        <span>{streak} Streak!</span>
                     </span>
                  )}
                  {isVsAi && (
                     <div className="font-mono text-[11px] text-zinc-400">
                        <span className="text-emerald-400 font-semibold">{record.wins}W</span> -{' '}
                        <span className="text-red-400 font-semibold">{record.losses}L</span> -{' '}
                        <span className="text-zinc-500">{record.draws}D</span>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* 3x3 Grid Board */}
         <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-[280px] h-[280px] sm:w-[320px] sm:h-[320px]">
               {board.map((cell, idx) => {
                  const isWinningCell = winnerInfo?.line.includes(idx);
                  return (
                     <button
                        key={idx}
                        type="button"
                        onClick={() => handleCellClick(idx)}
                        disabled={cell !== null || Boolean(winnerInfo) || isDraw || isAiThinking}
                        className={`group relative flex items-center justify-center rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#daf4aa] ${
                           isWinningCell
                              ? 'border-[#daf4aa] bg-[#daf4aa]/20 text-[#daf4aa] shadow-xl shadow-[#daf4aa]/30 scale-[1.03]'
                              : cell
                              ? 'border-zinc-800 bg-zinc-900/90 text-zinc-100'
                              : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-850'
                        }`}>
                        {cell === 'X' && (
                           <IconX
                              size={44}
                              strokeWidth={2.5}
                              className={isWinningCell ? 'text-[#daf4aa]' : 'text-zinc-100'}
                           />
                        )}
                        {cell === 'O' && (
                           <IconO
                              size={40}
                              strokeWidth={2.5}
                              className={isWinningCell ? 'text-[#daf4aa]' : 'text-cyan-400'}
                           />
                        )}
                        {/* Hover Preview Ghost */}
                        {!cell && !winnerInfo && !isDraw && !isAiThinking && (
                           <div className="opacity-0 group-hover:opacity-20 transition-opacity">
                              {turn === 'X' ? (
                                 <IconX size={38} className="text-[#daf4aa]" />
                              ) : (
                                 <IconO size={34} className="text-cyan-400" />
                              )}
                           </div>
                        )}
                     </button>
                  );
               })}
            </div>

            {/* Victory / Draw Result Modal */}
            {(winnerInfo || isDraw) && (
               <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/85 backdrop-blur-md p-4">
                  <GameResult
                     status={
                        isDraw
                           ? 'draw'
                           : isVsAi
                           ? winnerInfo.winner === 'X'
                              ? 'win'
                              : 'gameover'
                           : 'win'
                     }
                     title={
                        isDraw
                           ? 'Cat’s Game! Draw'
                           : isVsAi
                           ? winnerInfo.winner === 'X'
                              ? 'You Won!'
                              : 'Computer Won!'
                           : `Player ${winnerInfo.winner} Won!`
                     }
                     score={
                        isVsAi
                           ? `${record.wins} Wins - ${record.losses} Losses`
                           : `Winner: Mark ${winnerInfo?.winner || 'None'}`
                     }
                     scoreLabel={isVsAi ? 'AI Match Record' : 'Outcome'}
                     onRestart={() => handleReset(winnerInfo?.winner || 'X')}
                     extraMessage={
                        isVsAi && winnerInfo?.winner === 'X' && streak > 1
                           ? `🔥 Amazing! ${streak}-game winning streak!`
                           : undefined
                     }
                  />
               </div>
            )}
         </div>
      </div>
   );
}
