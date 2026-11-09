import React, { useState, useEffect, useRef } from 'react';
import {
   Sparkles,
   Zap,
   Flame,
   Heart,
   Compass,
   Shield,
   Rocket,
   Key,
   Moon,
   Sun,
   Code2,
   Database,
   Terminal,
   Cpu,
   Bug,
   Globe,
   Braces,
   Lock,
   Wifi,
   GitBranch,
   RotateCcw,
   Volume2,
   VolumeX,
   Clock,
   Layers,
   Star,
   Sliders,
} from 'lucide-react';
import {
   SIZES,
   THEMES,
   createShuffledCards,
   checkCardsMatch,
   isGameCompleted,
   calculateStarRating,
} from './memoryLogic';
import { arcadeSounds } from '../sound';
import {
   getGameHighScore,
   saveGameHighScore,
   getArcadeSettings,
   saveArcadeSettings,
} from '../storage';
import GameResult from '../../components/games/GameResult';

const ICON_MAP = {
   Sparkles,
   Zap,
   Flame,
   Heart,
   Compass,
   Shield,
   Rocket,
   Key,
   Moon,
   Sun,
   Code2,
   Database,
   Terminal,
   Cpu,
   Bug,
   Globe,
   Braces,
   Lock,
   Wifi,
   GitBranch,
};

export default function MemoryMatch() {
   const [sizeKey, setSizeKey] = useState('standard');
   const [themeKey, setThemeKey] = useState('cosmic');
   const [cards, setCards] = useState(() => createShuffledCards('standard', 'cosmic'));
   const [flippedIndices, setFlippedIndices] = useState([]);
   const [isLocked, setIsLocked] = useState(false);
   const [moves, setMoves] = useState(0);
   const [combo, setCombo] = useState(0);
   const [seconds, setSeconds] = useState(0);
   const [isTimerRunning, setIsTimerRunning] = useState(false);
   const [isCompleted, setIsCompleted] = useState(false);
   const [bestScore, setBestScore] = useState(null);
   const [soundEnabled, setSoundEnabled] = useState(true);
   const [showSettings, setShowSettings] = useState(false);

   const timerRef = useRef(null);

   useEffect(() => {
      const stored = getGameHighScore('memory-match');
      setBestScore(stored);
      const settings = getArcadeSettings();
      setSoundEnabled(settings.soundEnabled ?? true);
   }, []);

   const handleToggleSound = () => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      saveArcadeSettings({ soundEnabled: next });
   };

   // Elapsed timer
   useEffect(() => {
      if (isTimerRunning && !isCompleted) {
         timerRef.current = setInterval(() => {
            setSeconds((s) => s + 1);
         }, 1000);
      } else {
         clearInterval(timerRef.current);
      }
      return () => clearInterval(timerRef.current);
   }, [isTimerRunning, isCompleted]);

   // Card Click
   const handleCardClick = (index) => {
      if (isLocked) return;
      if (cards[index].matched) return;
      if (flippedIndices.includes(index)) return;

      if (!isTimerRunning) {
         setIsTimerRunning(true);
      }

      arcadeSounds.flip();
      const nextFlipped = [...flippedIndices, index];
      setFlippedIndices(nextFlipped);

      if (nextFlipped.length === 2) {
         setIsLocked(true);
         setMoves((m) => m + 1);

         const [firstIdx, secondIdx] = nextFlipped;
         const firstCard = cards[firstIdx];
         const secondCard = cards[secondIdx];

         if (checkCardsMatch(firstCard, secondCard)) {
            // Match found!
            setTimeout(() => {
               arcadeSounds.match();
               setCombo((c) => c + 1);

               setCards((prev) => {
                  const updated = prev.map((card, i) =>
                     i === firstIdx || i === secondIdx ? { ...card, matched: true } : card
                  );
                  if (isGameCompleted(updated)) {
                     setIsCompleted(true);
                     setIsTimerRunning(false);
                     arcadeSounds.win();

                     const stored = getGameHighScore('memory-match');
                     const currentMoves = moves + 1;
                     if (!stored || currentMoves < stored.bestMoves) {
                        const newRecord = { bestMoves: currentMoves, bestTime: seconds };
                        setBestScore(newRecord);
                        saveGameHighScore('memory-match', newRecord);
                     }
                  }
                  return updated;
               });
               setFlippedIndices([]);
               setIsLocked(false);
            }, 300);
         } else {
            // Mismatch
            setTimeout(() => {
               arcadeSounds.wrong();
               setCombo(0); // reset combo
               setFlippedIndices([]);
               setIsLocked(false);
            }, 750);
         }
      }
   };

   // Reset / New Game
   const handleReset = (newSize = sizeKey, newTheme = themeKey) => {
      clearInterval(timerRef.current);
      setSizeKey(newSize);
      setThemeKey(newTheme);
      setCards(createShuffledCards(newSize, newTheme));
      setFlippedIndices([]);
      setIsLocked(false);
      setMoves(0);
      setCombo(0);
      setSeconds(0);
      setIsTimerRunning(false);
      setIsCompleted(false);
      arcadeSounds.click();
   };

   const currentSize = SIZES[sizeKey] || SIZES.standard;
   const starsEarned = calculateStarRating(moves, currentSize.pairs);
   const isNewBest = Boolean(isCompleted && (!bestScore || moves <= bestScore.bestMoves));

   return (
      <div className="flex flex-col items-center">
         {/* Top Stats Strip */}
         <div className="w-full max-w-md mb-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
               <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs text-zinc-300">
                  <span className="flex items-center gap-1">
                     <Layers size={13} className="text-[#daf4aa]" />
                     <span>Moves:</span>
                     <span className="font-mono font-bold text-white">{moves}</span>
                  </span>

                  <span className="text-zinc-600">•</span>

                  <span className="flex items-center gap-1">
                     <Clock size={13} className="text-cyan-400" />
                     <span>Time:</span>
                     <span className="font-mono font-bold text-white">{seconds}s</span>
                  </span>

                  {combo > 1 && (
                     <>
                        <span className="text-zinc-600">•</span>
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                           <Flame size={12} className="fill-current" />
                           Combo ×{combo}
                        </span>
                     </>
                  )}
               </div>

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
            {showSettings && (
               <div className="flex flex-col gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-xs">
                  <div className="flex items-center justify-between">
                     <span className="text-zinc-500">Board Size:</span>
                     <div className="flex items-center gap-1.5">
                        {Object.entries(SIZES).map(([key, cfg]) => (
                           <button
                              key={key}
                              type="button"
                              onClick={() => handleReset(key, themeKey)}
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                                 sizeKey === key
                                    ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                              }`}>
                              {cfg.label}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                     <span className="text-zinc-500">Icon Theme:</span>
                     <div className="flex items-center gap-1.5">
                        {Object.entries(THEMES).map(([key, t]) => (
                           <button
                              key={key}
                              type="button"
                              onClick={() => handleReset(sizeKey, key)}
                              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                                 themeKey === key
                                    ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                                 : 'bg-zinc-800 text-zinc-400 hover:text-white'
                              }`}>
                              {t.name}
                           </button>
                        ))}
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Memory Card Grid */}
         <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-3 sm:p-4 shadow-2xl">
            <div
               className="grid gap-2.5 sm:gap-3"
               style={{
                  gridTemplateColumns: `repeat(${currentSize.cols}, minmax(0, 1fr))`,
                  width: currentSize.cols === 5 ? '340px' : '290px',
                  maxWidth: '100%',
               }}>
               {cards.map((card, idx) => {
                  const isFlipped = flippedIndices.includes(idx) || card.matched;
                  const IconComp = ICON_MAP[card.icon] || Sparkles;

                  return (
                     <button
                        key={card.id}
                        type="button"
                        onClick={() => handleCardClick(idx)}
                        disabled={card.matched || isLocked}
                        className={`group relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#daf4aa] ${
                           card.matched
                              ? 'border-[#daf4aa]/40 bg-[#daf4aa]/15 text-[#daf4aa] shadow-sm'
                              : isFlipped
                              ? 'border-zinc-700 bg-zinc-800 text-white scale-[1.02]'
                              : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-600'
                        }`}>
                        {isFlipped ? (
                           <div className="animate-in fade-in zoom-in-75 duration-200">
                              <IconComp size={26} />
                           </div>
                        ) : (
                           <div className="h-2.5 w-2.5 rounded-full bg-zinc-700 group-hover:bg-[#daf4aa] group-hover:scale-125 transition-all" />
                        )}
                     </button>
                  );
               })}
            </div>

            {/* Victory Result Modal */}
            {isCompleted && (
               <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/85 backdrop-blur-md p-4">
                  <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 text-center shadow-2xl">
                     {/* Star Rating */}
                     <div className="flex items-center justify-center gap-1.5 mb-3">
                        {[1, 2, 3].map((star) => (
                           <Star
                              key={star}
                              size={24}
                              className={
                                 star <= starsEarned
                                    ? 'text-[#daf4aa] fill-[#daf4aa]'
                                    : 'text-zinc-700'
                              }
                           />
                        ))}
                     </div>

                     <h3 className="text-xl font-bold text-white">All Pairs Cleared!</h3>
                     <p className="mt-1 text-xs text-zinc-400">
                        {starsEarned === 3
                           ? 'Master memory! Virtually flawless run.'
                           : starsEarned === 2
                           ? 'Solid recall performance!'
                           : 'Good round! Practice to shave moves.'}
                     </p>

                     <div className="my-4 rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-center">
                        <div className="text-2xl font-extrabold text-white font-mono">
                           {moves} moves <span className="text-xs text-zinc-500 font-normal">({seconds}s)</span>
                        </div>
                        {isNewBest && (
                           <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#daf4aa]">
                              <Sparkles size={11} /> New High Score!
                           </div>
                        )}
                     </div>

                     <button
                        type="button"
                        onClick={() => handleReset()}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#daf4aa] py-2.5 text-xs font-semibold text-zinc-950 transition-colors hover:bg-[#c9ee8e]">
                        <RotateCcw size={14} />
                        <span>Play Again</span>
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
