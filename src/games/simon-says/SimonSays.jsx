import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
   Play,
   RotateCcw,
   Volume2,
   VolumeX,
   Trophy,
   Sparkles,
   Flame,
} from 'lucide-react';
import { QUADRANTS, getNextStep, getStepSpeed } from './simonLogic';
import { playTone, arcadeSounds } from '../sound';
import {
   getGameHighScore,
   saveGameHighScore,
   getArcadeSettings,
   saveArcadeSettings,
} from '../storage';
import GameResult from '../../components/games/GameResult';

export default function SimonSays() {
   const [sequence, setSequence] = useState([]);
   const [playerIndex, setPlayerIndex] = useState(0);
   const [activeQuadrant, setActiveQuadrant] = useState(null); // id currently illuminated
   const [gameState, setGameState] = useState('idle'); // 'idle' | 'playback' | 'user' | 'gameover'
   const [round, setRound] = useState(0);
   const [highScore, setHighScore] = useState(0);
   const [soundEnabled, setSoundEnabled] = useState(true);

   const timeoutsRef = useRef([]);

   useEffect(() => {
      const stored = getGameHighScore('simon-says') || {};
      setHighScore(stored.bestRound || 0);
      const settings = getArcadeSettings();
      setSoundEnabled(settings.soundEnabled ?? true);

      return () => {
         timeoutsRef.current.forEach((t) => clearTimeout(t));
      };
   }, []);

   const handleToggleSound = () => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      saveArcadeSettings({ soundEnabled: next });
   };

   // Flash a quadrant with audio tone
   const flashQuadrant = useCallback((id, duration = 300) => {
      setActiveQuadrant(id);
      const quad = QUADRANTS[id];
      if (quad) {
         playTone(quad.freq, 'sine', duration / 1000, 0.15);
      }
      setTimeout(() => {
         setActiveQuadrant(null);
      }, duration);
   }, []);

   // Playback sequence
   const playSequence = useCallback(
      (seq) => {
         setGameState('playback');
         timeoutsRef.current.forEach((t) => clearTimeout(t));
         timeoutsRef.current = [];

         const speed = getStepSpeed(seq.length);

         seq.forEach((quadId, index) => {
            const timeout = setTimeout(() => {
               flashQuadrant(quadId, speed * 0.7);
               if (index === seq.length - 1) {
                  const endTimeout = setTimeout(() => {
                     setGameState('user');
                     setPlayerIndex(0);
                  }, speed * 0.8);
                  timeoutsRef.current.push(endTimeout);
               }
            }, (index + 1) * speed);
            timeoutsRef.current.push(timeout);
         });
      },
      [flashQuadrant]
   );

   // Start Game
   const startGame = () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      const firstStep = getNextStep();
      const initialSeq = [firstStep];
      setSequence(initialSeq);
      setRound(1);
      playSequence(initialSeq);
      arcadeSounds.click();
   };

   // Handle Player Press
   const handleQuadrantClick = (id) => {
      if (gameState !== 'user') return;

      flashQuadrant(id, 200);

      // Verify correct step
      if (id === sequence[playerIndex]) {
         const nextIndex = playerIndex + 1;

         if (nextIndex === sequence.length) {
            // Completed round!
            setGameState('playback');
            const nextRound = round + 1;
            setRound(nextRound);

            // Update high score
            if (nextRound - 1 > highScore) {
               setHighScore(nextRound - 1);
               saveGameHighScore('simon-says', { bestRound: nextRound - 1 });
            }

            const nextSeq = [...sequence, getNextStep()];
            setSequence(nextSeq);

            const roundDelay = setTimeout(() => {
               arcadeSounds.match();
               playSequence(nextSeq);
            }, 600);
            timeoutsRef.current.push(roundDelay);
         } else {
            setPlayerIndex(nextIndex);
         }
      } else {
         // Mistake! Game Over
         arcadeSounds.gameOver();
         setGameState('gameover');
         timeoutsRef.current.forEach((t) => clearTimeout(t));
      }
   };

   // Keyboard controls (1-4 or Q, W, A, S)
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (gameState !== 'user') return;
         if (e.key === '1' || e.key === 'q' || e.key === 'Q') handleQuadrantClick(0);
         else if (e.key === '2' || e.key === 'w' || e.key === 'W') handleQuadrantClick(1);
         else if (e.key === '3' || e.key === 'a' || e.key === 'A') handleQuadrantClick(2);
         else if (e.key === '4' || e.key === 's' || e.key === 'S') handleQuadrantClick(3);
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   });

   const isNewBest = round - 1 > highScore && round > 1;

   return (
      <div className="flex flex-col items-center select-none">
         {/* Top Controls & Status */}
         <div className="w-full max-w-sm mb-4 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
               <button
                  type="button"
                  onClick={startGame}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-4 py-2 text-xs font-bold text-zinc-950 transition-colors hover:bg-[#c9ee8e]">
                  <RotateCcw size={13} />
                  <span>{gameState === 'idle' ? 'Start Game' : 'Restart'}</span>
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
               <div className="flex items-center gap-2">
                  <span className="text-zinc-500">Status:</span>
                  <span
                     className={`font-bold ${
                        gameState === 'playback'
                           ? 'text-cyan-400 animate-pulse'
                           : gameState === 'user'
                           ? 'text-[#daf4aa]'
                           : 'text-zinc-400'
                     }`}>
                     {gameState === 'playback'
                        ? 'Memorize...'
                        : gameState === 'user'
                        ? 'Your Turn!'
                        : 'Ready to Play'}
                  </span>
               </div>

               <div className="flex items-center gap-3">
                  <span className="font-mono text-zinc-300 font-bold">
                     Round: <span className="text-white">{round}</span>
                  </span>
                  {highScore > 0 && (
                     <span className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                        <Trophy size={11} className="text-[#daf4aa]" />
                        Best: {highScore}
                     </span>
                  )}
               </div>
            </div>
         </div>

         {/* Circular Simon Pad */}
         <div className="relative flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 p-5 shadow-2xl">
            <div className="grid grid-cols-2 gap-3.5 w-[280px] h-[280px] sm:w-[320px] sm:h-[320px]">
               {QUADRANTS.map((quad) => {
                  const isActive = activeQuadrant === quad.id;

                  return (
                     <button
                        key={quad.id}
                        type="button"
                        onClick={() => handleQuadrantClick(quad.id)}
                        disabled={gameState !== 'user'}
                        style={{
                           borderTopLeftRadius: quad.id === 0 ? '100%' : '1.25rem',
                           borderTopRightRadius: quad.id === 1 ? '100%' : '1.25rem',
                           borderBottomLeftRadius: quad.id === 2 ? '100%' : '1.25rem',
                           borderBottomRightRadius: quad.id === 3 ? '100%' : '1.25rem',
                        }}
                        className={`group relative flex items-center justify-center border transition-all duration-150 focus-visible:outline-none ${
                           isActive
                              ? quad.activeClass + ' scale-[1.02]'
                              : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 active:scale-95'
                        }`}>
                        <div
                           className={`h-3 w-3 rounded-full transition-transform ${
                              isActive ? 'scale-150 bg-white' : 'opacity-40'
                           }`}
                           style={{ backgroundColor: quad.color }}
                        />
                        <span className="absolute bottom-3 text-[10px] font-mono text-zinc-600 opacity-60">
                           {quad.label}
                        </span>
                     </button>
                  );
               })}
            </div>

            {/* Center Console Badge */}
            <div className="pointer-events-none absolute flex h-20 w-20 flex-col items-center justify-center rounded-full border border-zinc-800 bg-zinc-950 shadow-xl">
               <span className="text-[10px] font-mono uppercase text-zinc-500">Simon</span>
               <span className="text-base font-black text-white font-mono">{round}</span>
            </div>

            {/* Game Over Modal */}
            {gameState === 'gameover' && (
               <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/85 backdrop-blur-md p-4">
                  <div className="max-w-xs text-center">
                     <GameResult
                        status="gameover"
                        title="Sequence Broken!"
                        score={`${round - 1} steps completed`}
                        scoreLabel="Final Score"
                        bestScore={highScore}
                        isNewBest={isNewBest}
                        onRestart={startGame}
                     />
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}

