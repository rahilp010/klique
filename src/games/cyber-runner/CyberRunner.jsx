import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Volume2, VolumeX, Flame, ArrowUp, ArrowDown } from 'lucide-react';
import {
   CANVAS_WIDTH,
   CANVAS_HEIGHT,
   GROUND_Y,
   GRAVITY,
   JUMP_VELOCITY,
   createInitialRunnerState,
   checkAABB,
} from './runnerLogic';
import { getGameHighScore, saveGameHighScore } from '../storage';
import { playTone, arcadeSounds } from '../sound';

export default function CyberRunner({ isFullscreen = false }) {
   const canvasRef = useRef(null);
   const [gameState, setGameState] = useState('ready'); // ready, running, gameover
   const [distance, setDistance] = useState(0);
   const [highScore, setHighScore] = useState(0);
   const [soundEnabled, setSoundEnabled] = useState(true);

   const simRef = useRef(null);
   const animRef = useRef(null);
   const highScoreRef = useRef(0);
   highScoreRef.current = highScore;

   // Load saved high score
   useEffect(() => {
      const saved = getGameHighScore('cyber-runner');
      if (saved && saved.bestDistance) {
         setHighScore(saved.bestDistance);
      }
   }, []);

   const playSfx = useCallback((type) => {
      if (!soundEnabled) return;
      try {
         if (type === 'jump') {
            playTone(450, 0.08, 'sine', 0.12);
         } else if (type === 'slide') {
            playTone(220, 0.06, 'triangle', 0.1);
         } else if (type === 'gameover') {
            arcadeSounds.gameOver();
         }
      } catch (e) {
         // Ignore
      }
   }, [soundEnabled]);

   // Start fresh run
   const startRun = useCallback(() => {
      simRef.current = createInitialRunnerState();
      simRef.current.state = 'running';
      setGameState('running');
      setDistance(0);
   }, []);

   // Jump trigger
   const handleJump = useCallback(() => {
      const sim = simRef.current;
      if (!sim) return;

      if (sim.state === 'ready' || sim.state === 'gameover') {
         startRun();
         return;
      }
      if (sim.state !== 'running') return;

      const r = sim.runner;
      if (r.jumpsLeft > 0) {
         r.vy = JUMP_VELOCITY;
         r.isGrounded = false;
         r.jumpsLeft -= 1;
         r.isDucking = false;
         r.height = 36;
         playSfx('jump');

         // Particle burst under feet
         for (let i = 0; i < 6; i++) {
            sim.particles.push({
               x: r.x + r.width / 2,
               y: r.y + r.height,
               vx: (Math.random() - 0.5) * 3,
               vy: Math.random() * 2,
               color: '#daf4aa',
               life: 0.8,
            });
         }
      }
   }, [startRun, playSfx]);

   // Slide trigger
   const setDucking = useCallback((ducking) => {
      const sim = simRef.current;
      if (!sim || sim.state !== 'running') return;
      const r = sim.runner;
      r.isDucking = ducking;
      if (ducking) {
         r.height = 20;
         r.y = GROUND_Y - 20;
         playSfx('slide');
      } else {
         r.height = 36;
         if (r.isGrounded) {
            r.y = GROUND_Y - 36;
         }
      }
   }, [playSfx]);

   // Keyboard controls
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS'].includes(e.code) || [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
         }
         if (['Space', 'ArrowUp', 'KeyW'].includes(e.code) || e.key === ' ') {
            handleJump();
         } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
            setDucking(true);
         }
      };

      const handleKeyUp = (e) => {
         if (['ArrowDown', 'KeyS'].includes(e.code)) {
            setDucking(false);
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
         window.removeEventListener('keydown', handleKeyDown);
         window.removeEventListener('keyup', handleKeyUp);
      };
   }, [handleJump, setDucking]);

   // Main Physics & Render Loop
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

         if (sim.state === 'running') {
            // Distance progression
            sim.distance += Math.floor(sim.speed * 0.1);
            setDistance(sim.distance);

            // Gradual speed scaling
            sim.speed = Math.min(11, 5.5 + sim.distance * 0.003);

            // Runner physics
            const r = sim.runner;
            if (!r.isGrounded) {
               r.vy += GRAVITY;
               r.y += r.vy;

               if (r.y + r.height >= GROUND_Y) {
                  r.y = GROUND_Y - r.height;
                  r.vy = 0;
                  r.isGrounded = true;
                  r.jumpsLeft = 2; // Reset double jump
               }
            }

            // Grid scroll
            sim.gridOffset = (sim.gridOffset + sim.speed) % 24;

            // Spawn obstacles
            sim.nextSpawnDistance -= sim.speed;
            if (sim.nextSpawnDistance <= 0) {
               const isFlyingDrone = Math.random() < 0.35 && sim.distance > 100;
               if (isFlyingDrone) {
                  // High flying drone (must slide under)
                  sim.obstacles.push({
                     x: CANVAS_WIDTH,
                     y: GROUND_Y - 50,
                     width: 32,
                     height: 18,
                     type: 'drone',
                     color: '#f43f5e',
                  });
               } else {
                  // Low ground barrier (must jump over)
                  const h = Math.random() > 0.5 ? 32 : 24;
                  sim.obstacles.push({
                     x: CANVAS_WIDTH,
                     y: GROUND_Y - h,
                     width: 22,
                     height: h,
                     type: 'barrier',
                     color: '#38bdf8',
                  });
               }
               sim.nextSpawnDistance = 140 + Math.random() * 180;
            }

            // Update obstacles & collisions
            for (let i = sim.obstacles.length - 1; i >= 0; i--) {
               const obs = sim.obstacles[i];
               obs.x -= sim.speed;

               // Check collision with runner
               if (checkAABB(r, obs)) {
                  sim.state = 'gameover';
                  setGameState('gameover');
                  playSfx('gameover');

                  if (sim.distance > highScoreRef.current) {
                     setHighScore(sim.distance);
                     saveGameHighScore('cyber-runner', { bestDistance: sim.distance });
                  }
                  break;
               }

               // Remove offscreen obstacles
               if (obs.x + obs.width < -20) {
                  sim.obstacles.splice(i, 1);
               }
            }

            // Particles update
            for (let i = sim.particles.length - 1; i >= 0; i--) {
               const p = sim.particles[i];
               p.x += p.vx - sim.speed * 0.4;
               p.y += p.vy;
               p.life -= 0.05;
               if (p.life <= 0) {
                  sim.particles.splice(i, 1);
               }
            }
         }

         // ---------------- RENDER ----------------
         ctx.fillStyle = '#09090b';
         ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

         // Moving Ground Line
         ctx.strokeStyle = '#27272a';
         ctx.lineWidth = 2;
         ctx.beginPath();
         ctx.moveTo(0, GROUND_Y);
         ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
         ctx.stroke();

         // Moving ground grid markers
         ctx.strokeStyle = '#18181b';
         ctx.lineWidth = 1;
         ctx.beginPath();
         for (let x = -sim.gridOffset; x < CANVAS_WIDTH; x += 24) {
            ctx.moveTo(x, GROUND_Y);
            ctx.lineTo(x - 20, CANVAS_HEIGHT);
         }
         ctx.stroke();

         // Draw Obstacles
         sim.obstacles.forEach((obs) => {
            ctx.fillStyle = obs.color;
            ctx.shadowColor = obs.color;
            ctx.shadowBlur = 8;
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

            if (obs.type === 'drone') {
               // Red scanner beam
               ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
               ctx.fillRect(obs.x - 8, obs.y + obs.height, obs.width + 16, 8);
            }
         });
         ctx.shadowBlur = 0;

         // Draw Runner
         const r = sim.runner;
         ctx.fillStyle = '#daf4aa';
         ctx.shadowColor = '#daf4aa';
         ctx.shadowBlur = 10;
         // Sleek geometric runner box / crouch
         ctx.fillRect(r.x, r.y, r.width, r.height);
         // Visor cutout
         ctx.fillStyle = '#09090b';
         ctx.fillRect(r.x + r.width - 8, r.y + 6, 6, 4);
         ctx.shadowBlur = 0;

         // Draw Particles
         sim.particles.forEach((p) => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fillRect(p.x, p.y, 3, 3);
         });
         ctx.globalAlpha = 1.0;
      };

      animRef.current = requestAnimationFrame(loop);
      return () => {
         if (animRef.current) cancelAnimationFrame(animRef.current);
      };
   }, [playSfx]);

   return (
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-3 select-none touch-none">
         {/* Top HUD */}
         <div className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-md">
            <div className="flex items-center space-x-4">
               <div>
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Distance</div>
                  <div className="text-xl font-black font-mono text-[#daf4aa]">{distance}m</div>
               </div>
            </div>

            <div className="flex items-center space-x-3">
               <div className="text-right">
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase flex items-center justify-end space-x-1">
                     <Trophy size={11} className="text-amber-400" />
                     <span>Best</span>
                  </div>
                  <div className="text-sm font-bold font-mono text-zinc-200">{highScore}m</div>
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
            onClick={handleJump}
            className={`relative w-full max-w-[580px] ${isFullscreen ? 'max-h-[calc(100dvh-7.5rem)]' : 'max-h-[min(320px,calc(100dvh-9rem))]'} aspect-[580/280] rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b] shadow-2xl cursor-pointer`}>
            <canvas
               ref={canvasRef}
               width={CANVAS_WIDTH}
               height={CANVAS_HEIGHT}
               className="w-full h-full block object-contain"
            />

            {/* Start Screen */}
            {gameState === 'ready' && (
               <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 mb-3 shadow-[0_0_20px_rgba(218,244,170,0.15)]">
                     <Flame size={28} />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-1.5">Cyber Runner</h2>
                  <p className="text-xs text-zinc-400 max-w-xs mb-5">
                     Leap over low cyber spikes with double-jump and slide under hovering laser drones!
                  </p>
                  <button
                     type="button"
                     onClick={(e) => {
                        e.stopPropagation();
                        startRun();
                     }}
                     className="px-6 py-2.5 rounded-xl font-bold bg-[#daf4aa] text-zinc-950 hover:bg-[#c9ee8e] transition-all shadow-lg shadow-[#daf4aa]/20 flex items-center gap-2">
                     <Play size={14} className="fill-current" />
                     <span>Start Running</span>
                  </button>
               </div>
            )}

            {/* Game Over Screen */}
            {gameState === 'gameover' && (
               <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-2xl font-black text-white mb-1">Impact Detected</h3>
                  <p className="text-xs text-zinc-400 mb-4">Obstacle collision breached the cyber runner</p>

                  <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-5">
                     <div className="text-center">
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">Distance</div>
                        <div className="text-2xl font-black font-mono text-[#daf4aa]">{distance}m</div>
                     </div>
                     <div className="w-[1px] h-8 bg-zinc-800" />
                     <div className="text-center">
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">Record</div>
                        <div className="text-2xl font-black font-mono text-amber-400">{highScore}m</div>
                     </div>
                  </div>

                  <button
                     type="button"
                     onClick={(e) => {
                        e.stopPropagation();
                        startRun();
                     }}
                     className="px-6 py-2.5 rounded-xl font-bold bg-[#daf4aa] text-zinc-950 hover:bg-[#c9ee8e] transition-all shadow-lg shadow-[#daf4aa]/20 flex items-center gap-2">
                     <RotateCcw size={14} />
                     <span>Run Again</span>
                  </button>
               </div>
            )}
         </div>

         {/* Mobile Tap Touch Controls Bar */}
         <div className="w-full max-w-[580px] grid grid-cols-2 gap-3 pt-1">
            <button
               onPointerDown={(e) => {
                  e.preventDefault();
                  handleJump();
               }}
               className="py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-[#daf4aa] font-bold text-xs flex items-center justify-center gap-2 active:bg-zinc-800 transition active:scale-95 shadow-md">
               <ArrowUp size={16} />
               <span>JUMP / DOUBLE JUMP</span>
            </button>

            <button
               onPointerDown={(e) => {
                  e.preventDefault();
                  setDucking(true);
               }}
               onPointerUp={() => setDucking(false)}
               onPointerLeave={() => setDucking(false)}
               className="py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-cyan-400 font-bold text-xs flex items-center justify-center gap-2 active:bg-zinc-800 transition active:scale-95 shadow-md">
               <ArrowDown size={16} />
               <span>SLIDE / DUCK</span>
            </button>
         </div>

         {/* Controls Hint */}
         <div className="text-xs text-zinc-500 text-center">
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">SPACE</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">&uarr;</kbd> Jump (Double Jump supported) &bull; <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">&darr;</kbd> Slide
         </div>
      </div>
   );
}

