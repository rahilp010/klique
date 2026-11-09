import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Volume2, VolumeX, Shield, Zap, Keyboard } from 'lucide-react';
import {
   CANVAS_WIDTH,
   CANVAS_HEIGHT,
   BASE_LINE_Y,
   getRandomWord,
   createInitialStormState,
} from './typeStormLogic';
import { getGameHighScore, saveGameHighScore } from '../storage';
import { playTone, arcadeSounds } from '../sound';

export default function TypeStorm() {
   const canvasRef = useRef(null);
   const [gameState, setGameState] = useState('ready'); // ready, playing, gameover
   const [score, setScore] = useState(0);
   const [shields, setShields] = useState(3);
   const [wpm, setWpm] = useState(0);
   const [accuracy, setAccuracy] = useState(100);
   const [highScore, setHighScore] = useState(0);
   const [soundEnabled, setSoundEnabled] = useState(true);

   const simRef = useRef(null);
   const animRef = useRef(null);
   const highScoreRef = useRef(0);
   highScoreRef.current = highScore;

   // Hidden mobile input ref for virtual keyboard trigger
   const inputRef = useRef(null);

   // Load saved high score
   useEffect(() => {
      const saved = getGameHighScore('type-storm');
      if (saved && saved.bestScore) {
         setHighScore(saved.bestScore);
      }
   }, []);

   const playSfx = useCallback((type) => {
      if (!soundEnabled) return;
      try {
         if (type === 'type') {
            playTone(600, 0.04, 'triangle', 0.1);
         } else if (type === 'blast') {
            playTone(850, 0.08, 'sawtooth', 0.15);
         } else if (type === 'breach') {
            arcadeSounds.loseLife();
         } else if (type === 'gameover') {
            arcadeSounds.gameOver();
         }
      } catch (e) {
         // Ignore
      }
   }, [soundEnabled]);

   // Start fresh game
   const startGame = useCallback(() => {
      simRef.current = createInitialStormState();
      simRef.current.state = 'playing';
      setGameState('playing');
      setScore(0);
      setShields(3);
      setWpm(0);
      setAccuracy(100);
      if (inputRef.current) inputRef.current.focus();
   }, []);

   // Handle single character key press
   const handleKeyPress = useCallback((char) => {
      const sim = simRef.current;
      if (!sim || sim.state !== 'playing') return;

      const lower = char.toLowerCase();
      if (!/^[a-z]$/.test(lower)) return;

      sim.totalKeysPressed++;

      // If already targeting a word
      if (sim.targetWordId) {
         const target = sim.words.find((w) => w.id === sim.targetWordId);
         if (target) {
            const nextChar = target.text[target.typedIndex];
            if (lower === nextChar) {
               target.typedIndex++;
               sim.correctKeysPressed++;
               playSfx('type');

               // Word completed!
               if (target.typedIndex >= target.text.length) {
                  playSfx('blast');
                  // Particle burst
                  for (let i = 0; i < 16; i++) {
                     sim.particles.push({
                        x: target.x + target.width / 2,
                        y: target.y,
                        vx: (Math.random() - 0.5) * 5,
                        vy: (Math.random() - 0.5) * 5,
                        color: '#34d399',
                        life: 1.0,
                     });
                  }
                  sim.score += target.text.length * 10;
                  sim.typedCount++;
                  setScore(sim.score);

                  // Remove word
                  sim.words = sim.words.filter((w) => w.id !== target.id);
                  sim.targetWordId = null;
               }
               return;
            }
         }
      }

      // No target yet: Find lowest word starting with this char
      const candidates = sim.words.filter(
         (w) => w.text[0] === lower && w.typedIndex === 0
      );
      if (candidates.length > 0) {
         candidates.sort((a, b) => b.y - a.y);
         const chosen = candidates[0];
         chosen.typedIndex = 1;
         sim.targetWordId = chosen.id;
         sim.correctKeysPressed++;
         playSfx('type');

         // If 1-letter word (rare)
         if (chosen.typedIndex >= chosen.text.length) {
            playSfx('blast');
            sim.score += chosen.text.length * 10;
            sim.typedCount++;
            setScore(sim.score);
            sim.words = sim.words.filter((w) => w.id !== chosen.id);
            sim.targetWordId = null;
         }
      }
   }, [playSfx]);

   // Global key listener
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (gameState === 'ready' || gameState === 'gameover') {
            if (e.code === 'Space' || e.code === 'Enter') {
               e.preventDefault();
               startGame();
               return;
            }
         }

         if (e.key.length === 1) {
            handleKeyPress(e.key);
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [gameState, startGame, handleKeyPress]);

   // Main Simulation & Render Loop
   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const loop = () => {
         animRef.current = requestAnimationFrame(loop);
         const sim = simRef.current;
         if (!sim) {
            ctx.fillStyle = '#09090b';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            return;
         }

         if (sim.state === 'playing') {
            // WPM & Accuracy calculation
            const elapsedMins = (Date.now() - sim.startTime) / 60000;
            if (elapsedMins > 0.05) {
               const calculatedWpm = Math.floor((sim.correctKeysPressed / 5) / elapsedMins);
               setWpm(calculatedWpm);
               const acc = Math.floor((sim.correctKeysPressed / Math.max(1, sim.totalKeysPressed)) * 100);
               setAccuracy(acc);
            }

            // Word Spawning
            sim.spawnTimer++;
            const currentInterval = Math.max(60, 130 - Math.floor(sim.score / 50));
            if (sim.spawnTimer >= currentInterval) {
               sim.spawnTimer = 0;
               const tier = sim.score > 250 ? 3 : sim.score > 100 ? 2 : 1;
               const text = getRandomWord(tier);
               ctx.font = 'bold 15px monospace';
               const textWidth = ctx.measureText(text).width + 16;
               const x = 20 + Math.random() * (CANVAS_WIDTH - textWidth - 40);

               sim.words.push({
                  id: Math.random().toString(36).substring(7),
                  text,
                  x,
                  y: -15,
                  width: textWidth,
                  height: 24,
                  vy: 0.8 + Math.min(sim.score * 0.003, 1.8),
                  typedIndex: 0,
               });
            }

            // Move Words & Breach detection
            for (let i = sim.words.length - 1; i >= 0; i--) {
               const w = sim.words[i];
               w.y += w.vy;

               // Reached Defense Shield Base?
               if (w.y >= BASE_LINE_Y) {
                  sim.shields--;
                  setShields(sim.shields);
                  playSfx('breach');

                  if (sim.targetWordId === w.id) {
                     sim.targetWordId = null;
                  }
                  sim.words.splice(i, 1);

                  if (sim.shields <= 0) {
                     sim.state = 'gameover';
                     setGameState('gameover');
                     playSfx('gameover');

                     if (sim.score > highScoreRef.current) {
                        setHighScore(sim.score);
                        saveGameHighScore('type-storm', { bestScore: sim.score });
                     }
                     break;
                  }
               }
            }

            // Particles update
            for (let i = sim.particles.length - 1; i >= 0; i--) {
               const p = sim.particles[i];
               p.x += p.vx;
               p.y += p.vy;
               p.life -= 0.04;
               if (p.life <= 0) {
                  sim.particles.splice(i, 1);
               }
            }
         }

         // ---------------- RENDER ----------------
         ctx.fillStyle = '#09090b';
         ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

         // Star background grid
         ctx.strokeStyle = '#18181b';
         ctx.lineWidth = 1;
         ctx.beginPath();
         for (let x = 0; x < CANVAS_WIDTH; x += 40) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
         }
         ctx.stroke();

         // Defense Shield Barrier
         ctx.strokeStyle = '#34d399';
         ctx.lineWidth = 2;
         ctx.shadowColor = '#34d399';
         ctx.shadowBlur = 8;
         ctx.beginPath();
         ctx.moveTo(0, BASE_LINE_Y);
         ctx.lineTo(CANVAS_WIDTH, BASE_LINE_Y);
         ctx.stroke();
         ctx.shadowBlur = 0;

         // Laser Targeting Beam from bottom turret to target word
         if (sim.state === 'playing' && sim.targetWordId) {
            const target = sim.words.find((w) => w.id === sim.targetWordId);
            if (target) {
               ctx.strokeStyle = 'rgba(52, 211, 153, 0.4)';
               ctx.lineWidth = 1.5;
               ctx.beginPath();
               ctx.moveTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
               ctx.lineTo(target.x + target.width / 2, target.y + target.height / 2);
               ctx.stroke();
            }
         }

         // Render Words
         ctx.font = 'bold 15px monospace';
         sim.words.forEach((w) => {
            const isTarget = sim.targetWordId === w.id;

            // Box Container
            ctx.fillStyle = isTarget ? 'rgba(52, 211, 153, 0.15)' : 'rgba(24, 24, 27, 0.8)';
            ctx.strokeStyle = isTarget ? '#34d399' : '#3f3f46';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(w.x, w.y, w.width, w.height, 6);
            ctx.fill();
            ctx.stroke();

            // Word Text (Typed green vs remaining gray)
            let currX = w.x + 8;
            for (let i = 0; i < w.text.length; i++) {
               const char = w.text[i];
               const charWidth = ctx.measureText(char).width;

               if (i < w.typedIndex) {
                  ctx.fillStyle = '#34d399';
                  ctx.shadowColor = '#34d399';
                  ctx.shadowBlur = 6;
               } else {
                  ctx.fillStyle = isTarget ? '#f4f4f5' : '#a1a1aa';
                  ctx.shadowBlur = 0;
               }

               ctx.fillText(char, currX, w.y + 17);
               ctx.shadowBlur = 0;
               currX += charWidth;
            }
         });

         // Render Particles
         sim.particles.forEach((p) => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
         });
         ctx.globalAlpha = 1.0;

         // Laser Cannon Turret at bottom center
         ctx.fillStyle = '#34d399';
         ctx.beginPath();
         ctx.arc(CANVAS_WIDTH / 2, CANVAS_HEIGHT - 10, 16, Math.PI, 0, false);
         ctx.fill();
      };

      animRef.current = requestAnimationFrame(loop);
      return () => {
         if (animRef.current) cancelAnimationFrame(animRef.current);
      };
   }, [playSfx]);

   return (
      <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-3 select-none">
         {/* Top HUD */}
         <div className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-md">
            <div className="flex items-center space-x-4">
               <div>
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Score</div>
                  <div className="text-xl font-black font-mono text-emerald-400">{score}</div>
               </div>
               <div className="w-[1px] h-6 bg-zinc-800" />
               <div>
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">WPM</div>
                  <div className="text-base font-bold font-mono text-zinc-200">{wpm}</div>
               </div>
               <div className="w-[1px] h-6 bg-zinc-800" />
               <div>
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Shields</div>
                  <div className="flex items-center space-x-1 mt-0.5">
                     {Array.from({ length: 3 }).map((_, i) => (
                        <div
                           key={i}
                           className={`w-3.5 h-3.5 rounded-sm border ${
                              i < shields ? 'bg-emerald-400 border-emerald-300' : 'bg-zinc-800 border-zinc-700'
                           }`}
                        />
                     ))}
                  </div>
               </div>
            </div>

            <div className="flex items-center space-x-3">
               <div className="text-right">
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase flex items-center justify-end space-x-1">
                     <Trophy size={11} className="text-amber-400" />
                     <span>Best</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-zinc-200">{highScore}</div>
               </div>

               <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-xl transition-colors">
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-zinc-500" />}
               </button>
            </div>
         </div>

         {/* Canvas Arena */}
         <div
            onClick={() => {
               if (gameState === 'ready' || gameState === 'gameover') startGame();
               if (inputRef.current) inputRef.current.focus();
            }}
            className="relative w-full max-w-[480px] aspect-[480/540] rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b] shadow-2xl cursor-pointer">
            <canvas
               ref={canvasRef}
               width={CANVAS_WIDTH}
               height={CANVAS_HEIGHT}
               className="w-full h-full block"
            />

            {/* Hidden Input for Mobile Soft Keyboard */}
            <input
               ref={inputRef}
               type="text"
               className="absolute opacity-0 pointer-events-none w-0 h-0"
               onChange={(e) => {
                  const val = e.target.value;
                  if (val.length > 0) {
                     handleKeyPress(val[val.length - 1]);
                     e.target.value = '';
                  }
               }}
            />

            {/* Start Screen */}
            {gameState === 'ready' && (
               <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
                     <Keyboard size={28} />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-1.5">Type Storm</h2>
                  <p className="text-xs text-zinc-400 max-w-xs mb-5">
                     Type falling code words to lock laser turrets and blast them before they breach the perimeter shields!
                  </p>
                  <button
                     type="button"
                     onClick={(e) => {
                        e.stopPropagation();
                        startGame();
                     }}
                     className="px-6 py-2.5 rounded-xl font-bold bg-emerald-400 text-zinc-950 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-400/20 flex items-center gap-2">
                     <Play size={14} className="fill-current" />
                     <span>Engage Defense</span>
                  </button>
               </div>
            )}

            {/* Game Over Screen */}
            {gameState === 'gameover' && (
               <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-2xl font-black text-white mb-1">Defense Breached</h3>
                  <p className="text-xs text-zinc-400 mb-4">City energy shields collapsed</p>

                  <div className="grid grid-cols-3 gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-5 w-full max-w-xs text-center">
                     <div>
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">Score</div>
                        <div className="text-lg font-black font-mono text-emerald-400">{score}</div>
                     </div>
                     <div>
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">WPM</div>
                        <div className="text-lg font-black font-mono text-zinc-200">{wpm}</div>
                     </div>
                     <div>
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">Accuracy</div>
                        <div className="text-lg font-black font-mono text-cyan-400">{accuracy}%</div>
                     </div>
                  </div>

                  <button
                     type="button"
                     onClick={(e) => {
                        e.stopPropagation();
                        startGame();
                     }}
                     className="px-6 py-2.5 rounded-xl font-bold bg-emerald-400 text-zinc-950 hover:bg-emerald-300 transition-all shadow-lg shadow-emerald-400/20 flex items-center gap-2">
                     <RotateCcw size={14} />
                     <span>Defend Again</span>
                  </button>
               </div>
            )}
         </div>

         {/* Mobile Keyboard Trigger button */}
         <div className="text-xs text-zinc-500 text-center">
            Type on your keyboard to target and blast incoming words &bull;{' '}
            <button
               type="button"
               onClick={() => {
                  if (inputRef.current) inputRef.current.focus();
               }}
               className="text-emerald-400 underline font-semibold">
               Tap to Open Mobile Keyboard
            </button>
         </div>
      </div>
   );
}

