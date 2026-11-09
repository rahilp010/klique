import React, { useState, useEffect, useRef } from 'react';
import {
   Zap,
   Timer,
   RotateCcw,
   Volume2,
   VolumeX,
   AlertCircle,
   Trophy,
   Sparkles,
   Ear,
   Eye,
   CheckCircle2,
   Activity,
} from 'lucide-react';
import { getRandomDelay, evaluateReaction } from './reactionLogic';
import { arcadeSounds, playTone } from '../sound';
import {
   getGameHighScore,
   saveGameHighScore,
   getArcadeSettings,
   saveArcadeSettings,
} from '../storage';

export default function ReactionTime() {
   const [mode, setMode] = useState('visual'); // 'visual' | 'auditory'
   const [state, setState] = useState('idle'); // 'idle' | 'waiting' | 'ready' | 'early' | 'result' | 'summary'
   const [lastMs, setLastMs] = useState(null);
   const [bestMs, setBestMs] = useState(null);
   const [rounds, setRounds] = useState([]); // Up to 5 rounds
   const [soundEnabled, setSoundEnabled] = useState(true);

   const startTimeRef = useRef(0);
   const timeoutRef = useRef(null);

   useEffect(() => {
      const stored = getGameHighScore('reaction-time');
      setBestMs(stored?.bestMs || null);
      const settings = getArcadeSettings();
      setSoundEnabled(settings.soundEnabled ?? true);

      return () => clearTimeout(timeoutRef.current);
   }, []);

   const handleToggleSound = () => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      saveArcadeSettings({ soundEnabled: next });
   };

   // Trigger Start of a Trial
   const handleAreaClick = () => {
      if (state === 'summary') {
         // Reset for new 5-round challenge
         setRounds([]);
         setState('idle');
         setLastMs(null);
         return;
      }

      if (state === 'idle' || state === 'early' || state === 'result') {
         setState('waiting');
         arcadeSounds.click();

         const delay = getRandomDelay();
         timeoutRef.current = setTimeout(() => {
            startTimeRef.current = performance.now();
            setState('ready');

            if (mode === 'auditory') {
               // Play prominent chime
               playTone(920, 'sine', 0.2, 0.25);
            } else {
               arcadeSounds.go();
            }
         }, delay);
      } else if (state === 'waiting') {
         // False Start
         clearTimeout(timeoutRef.current);
         arcadeSounds.wrong();
         setState('early');
      } else if (state === 'ready') {
         // Successful Tap
         const elapsed = Math.round(performance.now() - startTimeRef.current);
         setLastMs(elapsed);
         arcadeSounds.win();

         const updatedRounds = [...rounds, elapsed];
         setRounds(updatedRounds);

         // Update best score
         const stored = getGameHighScore('reaction-time');
         const currentBest = stored?.bestMs;
         if (!currentBest || elapsed < currentBest) {
            setBestMs(elapsed);
            saveGameHighScore('reaction-time', { bestMs: elapsed });
         }

         if (updatedRounds.length >= 5) {
            setState('summary');
         } else {
            setState('result');
         }
      }
   };

   // Keyboard spacebar trigger
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (e.code === 'Space') {
            e.preventDefault();
            handleAreaClick();
         }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   });

   const handleReset = () => {
      clearTimeout(timeoutRef.current);
      setState('idle');
      setLastMs(null);
      setRounds([]);
      arcadeSounds.click();
   };

   const averageMs =
      rounds.length > 0
         ? Math.round(rounds.reduce((acc, curr) => acc + curr, 0) / rounds.length)
         : null;

   const evaluation = lastMs ? evaluateReaction(lastMs) : null;
   const summaryEval = averageMs ? evaluateReaction(averageMs) : null;
   const isNewBest = lastMs && bestMs && lastMs <= bestMs;

   return (
      <div className="flex flex-col items-center">
         {/* Top Controls & Mode Switcher */}
         <div className="w-full max-w-lg mb-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
               {/* Mode Switcher */}
               <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-1">
                  <button
                     type="button"
                     disabled={state === 'waiting' || state === 'ready'}
                     onClick={() => {
                        setMode('visual');
                        handleReset();
                     }}
                     className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        mode === 'visual'
                           ? 'bg-[#daf4aa] text-zinc-950 font-bold shadow-sm'
                           : 'text-zinc-400 hover:text-white'
                     }`}>
                     <Eye size={13} />
                     <span>Visual Flash</span>
                  </button>

                  <button
                     type="button"
                     disabled={state === 'waiting' || state === 'ready'}
                     onClick={() => {
                        setMode('auditory');
                        handleReset();
                     }}
                     className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        mode === 'auditory'
                           ? 'bg-[#daf4aa] text-zinc-950 font-bold shadow-sm'
                           : 'text-zinc-400 hover:text-white'
                     }`}>
                     <Ear size={13} />
                     <span>Sound Chime</span>
                  </button>
               </div>

               {/* Right Actions */}
               <div className="flex items-center gap-1.5">
                  <button
                     type="button"
                     onClick={handleReset}
                     aria-label="Restart Benchmark"
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

            {/* Progress & Live Benchmark Strip */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/50 px-4 py-2 text-xs">
               <div className="flex items-center gap-2">
                  <span className="text-zinc-500">Challenge:</span>
                  <span className="font-mono font-bold text-white">
                     Round {Math.min(rounds.length + 1, 5)} of 5
                  </span>
               </div>

               <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                     <span
                        key={i}
                        className={`h-2 w-2 rounded-full transition-colors ${
                           i < rounds.length
                              ? 'bg-[#daf4aa]'
                              : i === rounds.length
                              ? 'bg-zinc-600 animate-pulse'
                              : 'bg-zinc-800'
                        }`}
                     />
                  ))}
               </div>
            </div>
         </div>

         {/* Reaction Canvas Button Area */}
         <button
            type="button"
            onClick={handleAreaClick}
            className={`relative flex h-[330px] w-full max-w-lg flex-col items-center justify-center rounded-3xl border p-8 text-center transition-all duration-200 select-none shadow-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20 ${
               state === 'waiting'
                  ? 'border-red-600/70 bg-red-950/70 text-red-200 cursor-pointer'
                  : state === 'ready'
                  ? mode === 'auditory'
                     ? 'border-cyan-400 bg-cyan-400 text-zinc-950 shadow-2xl shadow-cyan-400/40 cursor-pointer scale-[1.01]'
                     : 'border-[#daf4aa] bg-[#daf4aa] text-zinc-950 shadow-2xl shadow-[#daf4aa]/30 cursor-pointer scale-[1.01]'
                  : state === 'early'
                  ? 'border-amber-600/70 bg-amber-950/70 text-amber-200 cursor-pointer'
                  : state === 'summary'
                  ? 'border-zinc-800 bg-zinc-900/90 text-zinc-100 cursor-pointer'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-200 cursor-pointer'
            }`}>
            {/* IDLE */}
            {state === 'idle' && (
               <div className="space-y-3">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 text-[#daf4aa]">
                     <Zap size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Click to Start</h3>
                  <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                     {mode === 'visual'
                        ? 'When the screen flashes LIME GREEN, click as fast as possible!'
                        : 'Listen closely. When you hear the AUDIO CHIME, click instantly!'}
                  </p>
                  <div className="pt-2 text-[11px] font-mono text-zinc-500">
                     Keyboard: Spacebar is supported
                  </div>
               </div>
            )}

            {/* WAITING */}
            {state === 'waiting' && (
               <div className="space-y-2 animate-pulse">
                  <div className="text-3xl font-extrabold tracking-tight">
                     {mode === 'visual' ? 'Wait for Green...' : 'Listen closely...'}
                  </div>
                  <p className="text-xs text-red-300">Don’t click prematurely!</p>
               </div>
            )}

            {/* READY (GO!) */}
            {state === 'ready' && (
               <div className="space-y-2">
                  <div className="text-4xl sm:text-5xl font-black uppercase tracking-wider scale-105 transition-transform duration-100">
                     {mode === 'visual' ? 'CLICK NOW!' : 'CHIME! CLICK!'}
                  </div>
               </div>
            )}

            {/* EARLY (False start) */}
            {state === 'early' && (
               <div className="space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-900/60 text-amber-300">
                     <AlertCircle size={30} />
                  </div>
                  <h3 className="text-xl font-bold text-amber-100">Too Early!</h3>
                  <p className="text-xs text-amber-200">
                     You tapped before the signal. Click to retry this round.
                  </p>
               </div>
            )}

            {/* SINGLE ROUND RESULT */}
            {state === 'result' && (
               <div className="space-y-4">
                  <div className="text-[11px] uppercase tracking-wider text-zinc-400">
                     Round {rounds.length} Reaction
                  </div>
                  <div className="text-5xl font-black font-mono text-white">
                     {lastMs} <span className="text-2xl font-normal text-zinc-400">ms</span>
                  </div>

                  {evaluation && (
                     <div className="space-y-0.5">
                        <div className={`text-sm font-bold ${evaluation.color}`}>
                           {evaluation.rating}
                        </div>
                        <div className="text-xs text-zinc-500">
                           {evaluation.percentile}
                        </div>
                     </div>
                  )}

                  <div className="pt-2 text-xs text-zinc-400 font-medium">
                     Click to start Round {rounds.length + 1}
                  </div>
               </div>
            )}

            {/* 5-ROUND GRAND SUMMARY REPORT */}
            {state === 'summary' && (
               <div className="space-y-4 w-full max-w-sm">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#daf4aa]">
                     <CheckCircle2 size={16} /> Challenge Complete
                  </div>

                  <div>
                     <div className="text-[11px] uppercase tracking-wider text-zinc-500">
                        5-Round Average
                     </div>
                     <div className="text-4xl font-extrabold text-white font-mono mt-1">
                        {averageMs} <span className="text-xl font-normal text-zinc-400">ms</span>
                     </div>
                     {summaryEval && (
                        <div className={`text-xs font-bold mt-1 ${summaryEval.color}`}>
                           {summaryEval.rating} • {summaryEval.percentile}
                        </div>
                     )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-zinc-800">
                     <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5">
                        <div className="text-[10px] text-zinc-500 uppercase">Fastest Split</div>
                        <div className="text-sm font-mono font-bold text-[#daf4aa]">
                           {Math.min(...rounds)} ms
                        </div>
                     </div>
                     <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5">
                        <div className="text-[10px] text-zinc-500 uppercase">Personal Best</div>
                        <div className="text-sm font-mono font-bold text-white">
                           {bestMs || Math.min(...rounds)} ms
                        </div>
                     </div>
                  </div>

                  <div className="pt-2 text-xs text-zinc-400">
                     Click anywhere to start a new 5-round benchmark
                  </div>
               </div>
            )}
         </button>

         {/* 5-Round Attempts Strip */}
         {rounds.length > 0 && state !== 'summary' && (
            <div className="mt-5 w-full max-w-lg rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-3.5">
               <div className="flex items-center justify-between text-xs text-zinc-400 mb-2.5">
                  <span className="font-semibold text-zinc-300">Round Attempts</span>
                  <span className="font-mono text-zinc-400">Avg: {averageMs}ms</span>
               </div>
               <div className="flex items-center gap-2">
                  {[0, 1, 2, 3, 4].map((idx) => {
                     const roundScore = rounds[idx];
                     return (
                        <div
                           key={idx}
                           className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-center">
                           <div className="text-[10px] text-zinc-500 font-mono">R{idx + 1}</div>
                           <div className="text-xs font-mono font-bold text-zinc-200 mt-0.5">
                              {roundScore ? `${roundScore}ms` : '--'}
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         )}
      </div>
   );
}
