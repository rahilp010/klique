import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Trophy, Volume2, VolumeX, Undo, Sparkles, CheckCircle2, Play } from 'lucide-react';
import {
   createInitialSolitaireState,
} from './solitaireLogic';
import { getGameHighScore, saveGameHighScore } from '../storage';
import { playTone, arcadeSounds } from '../sound';

export default function SpeedSolitaire() {
   const [state, setState] = useState(createInitialSolitaireState);
   const [elapsed, setElapsed] = useState(0);
   const [highScore, setHighScore] = useState(null);
   const [soundEnabled, setSoundEnabled] = useState(true);

   // Load saved high score
   useEffect(() => {
      const saved = getGameHighScore('solitaire');
      if (saved && saved.bestTime) {
         setHighScore(saved.bestTime);
      }
   }, []);

   // Timer tick
   useEffect(() => {
      if (state.isWon) return;
      const interval = setInterval(() => {
         setElapsed(Math.floor((Date.now() - state.startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
   }, [state.startTime, state.isWon]);

   const playCardSfx = useCallback((type) => {
      if (!soundEnabled) return;
      try {
         if (type === 'flip') {
            playTone(420, 0.04, 'sine', 0.1);
         } else if (type === 'foundation') {
            playTone(660, 0.08, 'triangle', 0.12);
         } else if (type === 'win') {
            arcadeSounds.gameWin();
         }
      } catch (e) {
         // Ignore
      }
   }, [soundEnabled]);

   // Start fresh game
   const handleNewGame = () => {
      setState(createInitialSolitaireState());
      setElapsed(0);
   };

   // Draw Card from Stock
   const drawCard = () => {
      if (state.isWon) return;

      setState((prev) => {
         const next = {
            ...prev,
            stock: [...prev.stock],
            waste: [...prev.waste],
            moves: prev.moves + 1,
         };

         if (next.stock.length > 0) {
            const card = next.stock.pop();
            card.faceUp = true;
            next.waste.push(card);
            playCardSfx('flip');
         } else {
            // Recycle waste into stock
            next.stock = next.waste.reverse().map((c) => ({ ...c, faceUp: false }));
            next.waste = [];
            playCardSfx('flip');
         }

         return next;
      });
   };

   // Try to auto-place a card to Foundation
   const tryMoveToFoundation = (card, sourceCol, sourceIndex, isWaste = false) => {
      for (let f = 0; f < 4; f++) {
         const pile = state.foundations[f];
         const top = pile[pile.length - 1];

         const isValid =
            (!top && card.rank === 1) || // Ace on empty
            (top && top.suit === card.suit && top.rank === card.rank - 1); // Ascending same suit

         if (isValid) {
            setState((prev) => {
               const nextFoundations = prev.foundations.map((p, idx) =>
                  idx === f ? [...p, card] : [...p]
               );
               let nextTableau = prev.tableau;
               let nextWaste = prev.waste;

               if (isWaste) {
                  nextWaste = prev.waste.slice(0, -1);
               } else {
                  nextTableau = prev.tableau.map((col, idx) => {
                     if (idx !== sourceCol) return [...col];
                     const newCol = col.slice(0, sourceIndex);
                     // Flip top card if hidden
                     if (newCol.length > 0 && !newCol[newCol.length - 1].faceUp) {
                        newCol[newCol.length - 1].faceUp = true;
                     }
                     return newCol;
                  });
               }

               // Check if won (all 4 foundations have 13 cards)
               const totalFound = nextFoundations.reduce((sum, p) => sum + p.length, 0);
               const isWon = totalFound === 52;

               if (isWon) {
                  playCardSfx('win');
                  const finalTime = Math.floor((Date.now() - prev.startTime) / 1000);
                  if (!highScore || finalTime < highScore) {
                     setHighScore(finalTime);
                     saveGameHighScore('solitaire', { bestTime: finalTime });
                  }
               } else {
                  playCardSfx('foundation');
               }

               return {
                  ...prev,
                  foundations: nextFoundations,
                  tableau: nextTableau,
                  waste: nextWaste,
                  moves: prev.moves + 1,
                  isWon,
               };
            });
            return true;
         }
      }
      return false;
   };

   // Try to auto-place a card onto Tableau
   const tryMoveToTableau = (cardsToMove, sourceCol, sourceIndex, isWaste = false) => {
      const movingCard = cardsToMove[0];

      for (let t = 0; t < 7; t++) {
         if (!isWaste && t === sourceCol) continue;
         const col = state.tableau[t];
         const top = col[col.length - 1];

         // King on empty column, or opposite color descending rank
         const isOppositeColor = top && top.color !== movingCard.color;
         const isDescending = top && top.rank === movingCard.rank + 1;
         const isValid = (!top && movingCard.rank === 13) || (isOppositeColor && isDescending);

         if (isValid) {
            setState((prev) => {
               let nextTableau = prev.tableau.map((c, idx) => {
                  if (idx === t) return [...c, ...cardsToMove];
                  if (!isWaste && idx === sourceCol) {
                     const newCol = c.slice(0, sourceIndex);
                     if (newCol.length > 0 && !newCol[newCol.length - 1].faceUp) {
                        newCol[newCol.length - 1].faceUp = true;
                     }
                     return newCol;
                  }
                  return [...c];
               });

               let nextWaste = prev.waste;
               if (isWaste) {
                  nextWaste = prev.waste.slice(0, -1);
               }

               playCardSfx('flip');
               return {
                  ...prev,
                  tableau: nextTableau,
                  waste: nextWaste,
                  moves: prev.moves + 1,
               };
            });
            return true;
         }
      }
      return false;
   };

   // Card Tap Handler
   const handleCardClick = (card, sourceCol, sourceIndex, isWaste = false) => {
      if (state.isWon || !card.faceUp) return;

      // 1. Try Foundation
      if (isWaste || sourceIndex === state.tableau[sourceCol].length - 1) {
         if (tryMoveToFoundation(card, sourceCol, sourceIndex, isWaste)) return;
      }

      // 2. Try Tableau
      const cardsToMove = isWaste ? [card] : state.tableau[sourceCol].slice(sourceIndex);
      tryMoveToTableau(cardsToMove, sourceCol, sourceIndex, isWaste);
   };

   return (
      <div className="flex flex-col items-center w-full max-w-xl mx-auto space-y-4 select-none touch-none">
         {/* Top HUD */}
         <div className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-md">
            <div className="flex items-center space-x-4 text-xs font-mono">
               <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Time</span>
                  <span className="text-sm font-bold text-zinc-100">{elapsed}s</span>
               </div>
               <div className="w-[1px] h-6 bg-zinc-800" />
               <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Moves</span>
                  <span className="text-sm font-bold text-cyan-400">{state.moves}</span>
               </div>
            </div>

            <div className="flex items-center gap-3">
               {highScore && (
                  <div className="text-right text-xs font-mono hidden sm:block">
                     <span className="text-[10px] text-zinc-500 uppercase flex items-center justify-end gap-1">
                        <Trophy size={11} className="text-amber-400" />
                        <span>Best</span>
                     </span>
                     <span className="font-bold text-amber-400">{highScore}s</span>
                  </div>
               )}

               <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors">
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-zinc-500" />}
               </button>

               <button
                  type="button"
                  onClick={handleNewGame}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg transition-colors">
                  <RotateCcw size={16} />
               </button>
            </div>
         </div>

         {/* Upper Arena: Stock + Waste on Left & 4 Foundations on Right */}
         <div className="w-full flex items-center justify-between gap-2 px-1">
            {/* Stock & Waste */}
            <div className="flex items-center gap-2">
               {/* Stock Deck */}
               <div
                  onClick={drawCard}
                  className="w-12 h-18 sm:w-14 sm:h-20 rounded-xl border border-zinc-700 bg-zinc-900 flex items-center justify-center cursor-pointer shadow-md hover:border-[#daf4aa]/60 transition-colors">
                  {state.stock.length > 0 ? (
                     <div className="w-full h-full rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-700/80 flex items-center justify-center text-[10px] font-mono text-zinc-400 font-bold">
                        {state.stock.length}
                     </div>
                  ) : (
                     <RotateCcw size={14} className="text-zinc-500" />
                  )}
               </div>

               {/* Waste Pile */}
               <div className="w-12 h-18 sm:w-14 sm:h-20 rounded-xl border border-zinc-800 bg-zinc-950/60 flex items-center justify-center">
                  {state.waste.length > 0 ? (
                     <div
                        onClick={() =>
                           handleCardClick(
                              state.waste[state.waste.length - 1],
                              null,
                              null,
                              true
                           )
                        }
                        className="w-full h-full rounded-xl bg-zinc-900 border border-zinc-700 p-1 flex flex-col justify-between cursor-pointer shadow-lg hover:scale-105 transition-transform"
                        style={{ color: state.waste[state.waste.length - 1].color }}>
                        <span className="font-mono font-bold text-[11px] leading-none">
                           {state.waste[state.waste.length - 1].label}
                        </span>
                        <span className="text-center text-sm leading-none">
                           {state.waste[state.waste.length - 1].symbol}
                        </span>
                        <span className="font-mono font-bold text-[11px] leading-none text-right">
                           {state.waste[state.waste.length - 1].label}
                        </span>
                     </div>
                  ) : null}
               </div>
            </div>

            {/* 4 Foundations */}
            <div className="flex items-center gap-1.5">
               {state.foundations.map((pile, f) => {
                  const top = pile[pile.length - 1];
                  return (
                     <div
                        key={f}
                        className="w-12 h-18 sm:w-14 sm:h-20 rounded-xl border border-zinc-800 bg-zinc-950/60 flex items-center justify-center text-zinc-600 font-mono text-xs">
                        {top ? (
                           <div
                              className="w-full h-full rounded-xl bg-zinc-900 border border-zinc-700 p-1 flex flex-col justify-between shadow-md"
                              style={{ color: top.color }}>
                              <span className="font-mono font-bold text-[11px] leading-none">
                                 {top.label}
                              </span>
                              <span className="text-center text-sm leading-none">{top.symbol}</span>
                              <span className="font-mono font-bold text-[11px] leading-none text-right">
                                 {top.label}
                              </span>
                           </div>
                        ) : (
                           <span>A</span>
                        )}
                     </div>
                  );
               })}
            </div>
         </div>

         {/* Tableau 7 Columns */}
         <div className="w-full grid grid-cols-7 gap-1.5 min-h-[300px] px-1">
            {state.tableau.map((col, cIdx) => (
               <div
                  key={cIdx}
                  onClick={() => {
                     if (col.length === 0 && state.waste.length > 0) {
                        const topWaste = state.waste[state.waste.length - 1];
                        if (topWaste.rank === 13) {
                           tryMoveToTableau([topWaste], null, null, true);
                        }
                     }
                  }}
                  className="flex flex-col items-center min-h-[220px] rounded-xl border border-dashed border-zinc-800/60 p-0.5">
                  {col.map((card, cardIdx) => (
                     <div
                        key={card.id}
                        onClick={(e) => {
                           e.stopPropagation();
                           handleCardClick(card, cIdx, cardIdx, false);
                        }}
                        className={`w-full h-16 sm:h-18 rounded-lg border transition-all duration-200 cursor-pointer ${
                           cardIdx > 0 ? '-mt-10 sm:-mt-11' : ''
                        } ${
                           card.faceUp
                              ? 'bg-zinc-900 border-zinc-700 p-1 shadow-md hover:translate-y-[-2px]'
                              : 'bg-gradient-to-br from-zinc-800 to-zinc-950 border-zinc-800'
                        }`}
                        style={{ color: card.faceUp ? card.color : undefined }}>
                        {card.faceUp ? (
                           <div className="flex flex-col justify-between h-full">
                              <span className="font-mono font-bold text-[10px] sm:text-[11px] leading-none">
                                 {card.label}
                              </span>
                              <span className="text-center text-xs sm:text-sm leading-none">
                                 {card.symbol}
                              </span>
                           </div>
                        ) : (
                           <div className="w-full h-full rounded border border-zinc-800 flex items-center justify-center">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#daf4aa]/30" />
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            ))}
         </div>

         {/* Victory Overlay */}
         {state.isWon && (
            <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
               <div className="w-14 h-14 rounded-2xl bg-[#daf4aa]/15 border border-[#daf4aa]/30 flex items-center justify-center text-[#daf4aa] mb-3 shadow-[0_0_24px_rgba(218,244,170,0.3)]">
                  <Sparkles size={28} />
               </div>
               <h3 className="text-3xl font-black text-white mb-1">Solitaire Solved!</h3>
               <p className="text-xs text-zinc-400 mb-4">All 52 cards placed onto foundations</p>

               <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-5">
                  <div className="text-center">
                     <div className="text-[10px] text-zinc-400 uppercase font-mono">Time</div>
                     <div className="text-2xl font-black font-mono text-[#daf4aa]">{elapsed}s</div>
                  </div>
                  <div className="w-[1px] h-8 bg-zinc-800" />
                  <div className="text-center">
                     <div className="text-[10px] text-zinc-400 uppercase font-mono">Moves</div>
                     <div className="text-2xl font-black font-mono text-cyan-400">{state.moves}</div>
                  </div>
               </div>

               <button
                  type="button"
                  onClick={handleNewGame}
                  className="px-6 py-2.5 rounded-xl font-bold bg-[#daf4aa] text-zinc-950 hover:bg-[#c9ee8e] transition-all shadow-lg shadow-[#daf4aa]/20 flex items-center gap-2">
                  <RotateCcw size={14} />
                  <span>Deal New Game</span>
               </button>
            </div>
         )}

         {/* Helper hint */}
         <div className="text-xs text-zinc-500 text-center">
            Tap cards to auto-place onto Foundations or Tableau &bull; Tap stock deck to draw
         </div>
      </div>
   );
}

