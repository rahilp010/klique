import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Volume2, VolumeX, Zap, Sparkles } from 'lucide-react';
import {
   TABLE_WIDTH,
   TABLE_HEIGHT,
   BUMPERS,
   ROLLOVER_LANES,
   SLINGSHOTS,
   STATIC_WALLS,
   FLIPPER_CONFIG,
   createInitialPinballState,
   updatePinball,
} from './pinballLogic';
import { getGameHighScore, saveGameHighScore } from '../storage';
import { playTone, arcadeSounds } from '../sound';

export default function NeonPinball({ isFullscreen = false }) {
   const canvasRef = useRef(null);
   const [gameState, setGameState] = useState('ready'); // ready, playing, gameover
   const [score, setScore] = useState(0);
   const [multiplier, setMultiplier] = useState(1);
   const [ballsLeft, setBallsLeft] = useState(3);
   const [highScore, setHighScore] = useState(0);
   const [soundEnabled, setSoundEnabled] = useState(true);

   const simRef = useRef(null);
   const animRef = useRef(null);
   const trailRef = useRef([]);
   const particlesRef = useRef([]);
   const highScoreRef = useRef(0);
   highScoreRef.current = highScore;

   const inputsRef = useRef({
      leftFlipper: false,
      rightFlipper: false,
      plungerDown: false,
   });

   // Load saved high score
   useEffect(() => {
      const saved = getGameHighScore('pinball');
      if (saved && saved.bestScore) {
         setHighScore(saved.bestScore);
      }
   }, []);

   const playSfx = useCallback(
      (type) => {
         if (!soundEnabled) return;
         try {
            if (type === 'bumper') {
               playTone(520, 0.08, 'triangle', 0.2);
            } else if (type === 'slingshot') {
               playTone(400, 0.05, 'square', 0.15);
            } else if (type === 'flipper') {
               playTone(280, 0.03, 'sine', 0.08);
            } else if (type === 'launch') {
               playTone(600, 0.15, 'sawtooth', 0.15);
            } else if (type === 'rollover') {
               playTone(880, 0.08, 'sine', 0.18);
            } else if (type === 'multiplier') {
               playTone(1050, 0.18, 'triangle', 0.22);
            } else if (type === 'drain') {
               arcadeSounds.loseLife();
            } else if (type === 'gameover') {
               arcadeSounds.gameOver();
            }
         } catch {
            // Audio context may require user interaction
         }
      },
      [soundEnabled]
   );

   // Spawn visual spark particles
   const spawnSparks = (x, y, color = '#daf4aa', count = 8) => {
      for (let i = 0; i < count; i++) {
         const angle = Math.random() * Math.PI * 2;
         const spd = 1.5 + Math.random() * 3.5;
         particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            color,
            life: 1.0,
            decay: 0.04 + Math.random() * 0.03,
            radius: 2 + Math.random() * 2,
         });
      }
   };

   // Start fresh game
   const handleStart = () => {
      simRef.current = createInitialPinballState();
      trailRef.current = [];
      particlesRef.current = [];
      setScore(0);
      setMultiplier(1);
      setBallsLeft(3);
      setGameState('playing');
   };

   // Global keyboard listeners
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', 'Space'].includes(e.code) || ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
            e.preventDefault();
         }
         if (e.repeat) return;
         if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'KeyZ' || e.code === 'ShiftLeft') {
            inputsRef.current.leftFlipper = true;
         }
         if (e.code === 'ArrowRight' || e.code === 'KeyD' || e.code === 'Slash' || e.code === 'ShiftRight') {
            inputsRef.current.rightFlipper = true;
         }
         if (e.code === 'Space' || e.code === 'ArrowDown' || e.code === 'KeyS') {
            inputsRef.current.plungerDown = true;
         }
      };

      const handleKeyUp = (e) => {
         if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'KeyZ' || e.code === 'ShiftLeft') {
            inputsRef.current.leftFlipper = false;
         }
         if (e.code === 'ArrowRight' || e.code === 'KeyD' || e.code === 'Slash' || e.code === 'ShiftRight') {
            inputsRef.current.rightFlipper = false;
         }
         if (e.code === 'Space' || e.code === 'ArrowDown' || e.code === 'KeyS') {
            e.preventDefault();
            inputsRef.current.plungerDown = false;
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
         window.removeEventListener('keydown', handleKeyDown);
         window.removeEventListener('keyup', handleKeyUp);
      };
   }, []);

   // 60FPS Game Loop & Canvas Renderer
   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const loop = () => {
         // Physics update if playing
         if (gameState === 'playing' && simRef.current) {
            const events = [];
            simRef.current = updatePinball(simRef.current, inputsRef.current, events);

            // Handle simulation events
            events.forEach((ev) => {
               if (ev.type === 'launch') {
                  playSfx('launch');
                  spawnSparks(simRef.current.ball.x, simRef.current.ball.y, '#daf4aa', 12);
               } else if (ev.type === 'flipper_up') {
                  playSfx('flipper');
               } else if (ev.type === 'bumper_hit') {
                  playSfx('bumper');
                  spawnSparks(ev.bumper.x, ev.bumper.y, ev.bumper.color, 14);
               } else if (ev.type === 'slingshot_hit') {
                  playSfx('slingshot');
                  spawnSparks(simRef.current.ball.x, simRef.current.ball.y, '#38bdf8', 8);
               } else if (ev.type === 'rollover') {
                  playSfx('rollover');
                  spawnSparks(simRef.current.ball.x, simRef.current.ball.y, '#facc15', 10);
               } else if (ev.type === 'multiplier_up') {
                  playSfx('multiplier');
               } else if (ev.type === 'drain') {
                  playSfx('drain');
                  setBallsLeft(ev.ballsRemaining);
               } else if (ev.type === 'game_over') {
                  playSfx('gameover');
                  setGameState('gameover');
                  if (ev.finalScore > highScoreRef.current) {
                     setHighScore(ev.finalScore);
                     saveGameHighScore('pinball', { bestScore: ev.finalScore });
                  }
               }
            });

            // Update state mirrors for React UI
            setScore(simRef.current.score);
            setMultiplier(simRef.current.multiplier);

            // Add ball trail
            const b = simRef.current.ball;
            if (Math.hypot(b.vx, b.vy) > 1.5) {
               trailRef.current.unshift({ x: b.x, y: b.y, alpha: 0.5 });
               if (trailRef.current.length > 8) trailRef.current.pop();
            }
         }

         // Update particles
         particlesRef.current.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
         });
         particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

         // Fade trail
         trailRef.current.forEach((t) => (t.alpha *= 0.85));

         // ==========================================
         // RENDER PASS
         // ==========================================
         ctx.fillStyle = '#09090b';
         ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

         // Background subtle grid
         ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
         ctx.lineWidth = 1;
         for (let x = 20; x < TABLE_WIDTH; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, TABLE_HEIGHT);
            ctx.stroke();
         }
         for (let y = 20; y < TABLE_HEIGHT; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(TABLE_WIDTH, y);
            ctx.stroke();
         }

         // Decorative table playfield neon curves
         ctx.strokeStyle = 'rgba(218, 244, 170, 0.08)';
         ctx.lineWidth = 3;
         ctx.beginPath();
         ctx.arc(210, 190, 110, 0, Math.PI * 2);
         ctx.stroke();

         // Draw Static Walls
         ctx.strokeStyle = '#3f3f46';
         ctx.lineWidth = 4;
         ctx.lineCap = 'round';
         STATIC_WALLS.forEach((w) => {
            ctx.beginPath();
            ctx.moveTo(w.x1, w.y1);
            ctx.lineTo(w.x2, w.y2);
            ctx.stroke();
         });

         // Outer glowing rim
         ctx.strokeStyle = 'rgba(218, 244, 170, 0.25)';
         ctx.lineWidth = 2;
         STATIC_WALLS.forEach((w) => {
            ctx.beginPath();
            ctx.moveTo(w.x1, w.y1);
            ctx.lineTo(w.x2, w.y2);
            ctx.stroke();
         });

         const sim = simRef.current;

         // Draw Rollover Lanes
         const rollovers = sim ? sim.rollovers : ROLLOVER_LANES;
         rollovers.forEach((r) => {
            ctx.save();
            ctx.strokeStyle = r.lit ? '#daf4aa' : '#52525b';
            ctx.fillStyle = r.lit ? 'rgba(218, 244, 170, 0.3)' : 'rgba(39, 39, 42, 0.6)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(r.x - r.width / 2, r.y - r.height / 2, r.width, r.height, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = r.lit ? '#daf4aa' : '#71717a';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(r.label, r.x, r.y);
            ctx.restore();
         });

         // Draw Pop Bumpers
         BUMPERS.forEach((b) => {
            const isFlashing = sim && sim.bumperFlashes[b.id] > 0;
            ctx.save();

            // Glow aura
            if (isFlashing) {
               ctx.beginPath();
               ctx.arc(b.x, b.y, b.radius + 8, 0, Math.PI * 2);
               ctx.fillStyle = b.color + '44';
               ctx.fill();
            }

            // Outer ring
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = isFlashing ? '#ffffff' : '#18181b';
            ctx.strokeStyle = isFlashing ? '#ffffff' : b.color;
            ctx.lineWidth = isFlashing ? 5 : 3;
            ctx.fill();
            ctx.stroke();

            // Inner core
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius * 0.45, 0, Math.PI * 2);
            ctx.fillStyle = b.color;
            ctx.fill();

            // Score tag
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${b.score}`, b.x, b.y);

            ctx.restore();
         });

         // Draw Slingshots
         SLINGSHOTS.forEach((sling, idx) => {
            const isFlashing = sim && sim.slingshotFlashes[idx] > 0;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(sling.p1.x, sling.p1.y);
            ctx.lineTo(sling.p2.x, sling.p2.y);
            ctx.lineTo(sling.p3.x, sling.p3.y);
            ctx.closePath();

            ctx.fillStyle = isFlashing ? 'rgba(56, 189, 248, 0.4)' : 'rgba(24, 24, 27, 0.8)';
            ctx.fill();

            // Elastic rubber band (p1 to p2)
            ctx.strokeStyle = isFlashing ? '#ffffff' : '#38bdf8';
            ctx.lineWidth = isFlashing ? 4 : 2.5;
            ctx.beginPath();
            ctx.moveTo(sling.p1.x, sling.p1.y);
            ctx.lineTo(sling.p2.x, sling.p2.y);
            ctx.stroke();

            ctx.restore();
         });

         // Draw Flippers
         const drawFlipper = (config, angle, color) => {
            const tipX = config.pivotX + Math.cos(angle) * config.length;
            const tipY = config.pivotY + Math.sin(angle) * config.length;

            ctx.save();
            ctx.strokeStyle = color;
            ctx.fillStyle = '#27272a';
            ctx.lineWidth = config.thickness;
            ctx.lineCap = 'round';

            // Main arm
            ctx.beginPath();
            ctx.moveTo(config.pivotX, config.pivotY);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();

            // Pivot hub
            ctx.beginPath();
            ctx.arc(config.pivotX, config.pivotY, config.thickness + 2, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            ctx.restore();
         };

         if (sim) {
            drawFlipper(FLIPPER_CONFIG.left, sim.leftFlipper.angle, '#daf4aa');
            drawFlipper(FLIPPER_CONFIG.right, sim.rightFlipper.angle, '#daf4aa');
         } else {
            drawFlipper(FLIPPER_CONFIG.left, FLIPPER_CONFIG.left.restAngle, '#71717a');
            drawFlipper(FLIPPER_CONFIG.right, FLIPPER_CONFIG.right.restAngle, '#71717a');
         }

         // Draw Plunger Spring
         const plungerCharge = sim ? sim.plungerCharge : 0;
         const springTop = 590 + plungerCharge * 25;
         ctx.save();
         ctx.strokeStyle = '#a1a1aa';
         ctx.lineWidth = 2.5;
         ctx.beginPath();
         const coils = 6;
         for (let i = 0; i <= coils; i++) {
            const y = springTop + (i / coils) * (625 - springTop);
            const x = 392 + (i % 2 === 0 ? -6 : 6);
            if (i === 0) ctx.moveTo(392, springTop);
            else ctx.lineTo(x, y);
         }
         ctx.lineTo(392, 625);
         ctx.stroke();
         ctx.restore();

         // Draw Ball Trail
         trailRef.current.forEach((t) => {
            ctx.beginPath();
            ctx.arc(t.x, t.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(218, 244, 170, ${t.alpha * 0.4})`;
            ctx.fill();
         });

         // Draw Spark Particles
         particlesRef.current.forEach((p) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fill();
            ctx.globalAlpha = 1.0;
         });

         // Draw Ball
         if (sim && sim.ball) {
            const b = sim.ball;
            ctx.save();

            // Outer glow
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius + 3, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(218, 244, 170, 0.3)';
            ctx.fill();

            // Ball body (silver / lime gradient)
            const grad = ctx.createRadialGradient(
               b.x - b.radius * 0.3,
               b.y - b.radius * 0.3,
               1,
               b.x,
               b.y,
               b.radius
            );
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.5, '#daf4aa');
            grad.addColorStop(1, '#65a30d');

            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
         }

         animRef.current = requestAnimationFrame(loop);
      };

      animRef.current = requestAnimationFrame(loop);
      return () => {
         if (animRef.current) cancelAnimationFrame(animRef.current);
      };
   }, [gameState, playSfx]);

   // Touch / Mouse control handlers for UI buttons
   const handleLeftFlipperDown = () => {
      inputsRef.current.leftFlipper = true;
   };
   const handleLeftFlipperUp = () => {
      inputsRef.current.leftFlipper = false;
   };

   const handleRightFlipperDown = () => {
      inputsRef.current.rightFlipper = true;
   };
   const handleRightFlipperUp = () => {
      inputsRef.current.rightFlipper = false;
   };

   const handlePlungerDown = () => {
      inputsRef.current.plungerDown = true;
   };
   const handlePlungerUp = () => {
      inputsRef.current.plungerDown = false;
   };

   return (
      <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto select-none touch-none">
         {/* Top HUD */}
         <div className="flex items-center justify-between w-full max-w-[420px] px-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-t-xl text-xs font-mono backdrop-blur-md">
            <div className="flex items-center gap-3">
               <div>
                  <div className="text-zinc-500 uppercase tracking-widest text-[10px]">SCORE</div>
                  <div className="text-base font-bold text-lime-400">{score.toLocaleString()}</div>
               </div>
               <div>
                  <div className="text-zinc-500 uppercase tracking-widest text-[10px]">MULT</div>
                  <div className="text-base font-bold text-sky-400">{multiplier}x</div>
               </div>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-950/60 px-2 py-1 rounded border border-zinc-800/80">
               <span className="text-[10px] text-zinc-500 uppercase mr-1">BALLS:</span>
               {[1, 2, 3].map((b) => (
                  <span
                     key={b}
                     className={`w-2.5 h-2.5 rounded-full transition-all ${
                        b <= ballsLeft ? 'bg-lime-400 shadow-[0_0_8px_#daf4aa]' : 'bg-zinc-700 opacity-40'
                     }`}
                  />
               ))}
            </div>

            <div className="flex items-center gap-2">
               <div className="text-right">
                  <div className="text-zinc-500 uppercase tracking-widest text-[10px] flex items-center justify-end gap-1">
                     <Trophy className="w-2.5 h-2.5 text-amber-400" /> BEST
                  </div>
                  <div className="text-sm font-semibold text-zinc-300">{highScore.toLocaleString()}</div>
               </div>
               <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1 text-zinc-400 hover:text-white transition-colors"
                  aria-label="Toggle Sound">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-lime-400" /> : <VolumeX className="w-4 h-4 text-zinc-600" />}
               </button>
            </div>
         </div>

         {/* Canvas Arena Container */}
         <div className={`relative w-full max-w-[420px] ${isFullscreen ? 'max-h-[calc(100dvh-7.5rem)]' : 'max-h-[min(580px,calc(100dvh-9rem))]'} aspect-[420/640] bg-zinc-950 border-x border-zinc-800 overflow-hidden shadow-2xl`}>
            <canvas
               ref={canvasRef}
               width={TABLE_WIDTH}
               height={TABLE_HEIGHT}
               className="w-full h-full block cursor-pointer object-contain"
               onPointerDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  if (x > rect.width * 0.85) {
                     inputsRef.current.plungerDown = true;
                  } else if (x < rect.width * 0.5) {
                     inputsRef.current.leftFlipper = true;
                  } else {
                     inputsRef.current.rightFlipper = true;
                  }
               }}
               onPointerUp={(e) => {
                  inputsRef.current.leftFlipper = false;
                  inputsRef.current.rightFlipper = false;
                  inputsRef.current.plungerDown = false;
               }}
               onPointerLeave={() => {
                  inputsRef.current.leftFlipper = false;
                  inputsRef.current.rightFlipper = false;
                  inputsRef.current.plungerDown = false;
               }}
            />

            {/* Ready / Splash Overlay */}
            {gameState === 'ready' && (
               <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                     <Zap className="w-7 h-7" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-wide">NEON PINBALL</h2>
                  <p className="text-xs text-zinc-400 mt-2 max-w-xs leading-relaxed">
                     Dual flippers, pop bumpers, slingshots & combo multiplier lanes. Pull spring plunger to launch!
                  </p>
                  <button
                     onClick={handleStart}
                     className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-lg bg-lime-400 text-zinc-950 font-bold text-sm tracking-wide shadow-[0_0_20px_#daf4aa] hover:bg-lime-300 active:scale-95 transition-all">
                     <Play className="w-4 h-4 fill-current" /> LAUNCH TABLE
                  </button>
               </div>
            )}

            {/* Game Over Overlay */}
            {gameState === 'gameover' && (
               <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10 animate-fade-in">
                  <h2 className="text-3xl font-black text-rose-400 tracking-wider">TILT / GAME OVER</h2>
                  <p className="text-xs text-zinc-400 mt-2">All 3 balls expended</p>
                  <div className="mt-4 p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 w-full max-w-xs">
                     <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">FINAL SCORE</div>
                     <div className="text-3xl font-black text-lime-400 font-mono mt-1">{score.toLocaleString()}</div>
                     {score >= highScore && score > 0 && (
                        <div className="mt-2 text-xs text-amber-400 font-bold flex items-center justify-center gap-1">
                           <Sparkles className="w-3.5 h-3.5" /> NEW HIGH SCORE!
                        </div>
                     )}
                  </div>
                  <button
                     onClick={handleStart}
                     className="mt-5 flex items-center gap-2 px-6 py-2.5 rounded-lg bg-lime-400 text-zinc-950 font-bold text-sm tracking-wide shadow-[0_0_20px_#daf4aa] hover:bg-lime-300 active:scale-95 transition-all">
                     <RotateCcw className="w-4 h-4" /> PLAY AGAIN
                  </button>
               </div>
            )}
         </div>

         {/* Dedicated Touch Arcade Controls (Bottom Dock) */}
         <div className="w-full max-w-[420px] bg-zinc-900 border border-t-0 border-zinc-800 rounded-b-xl p-3 flex items-center justify-between gap-2 shadow-lg">
            <button
               onPointerDown={handleLeftFlipperDown}
               onPointerUp={handleLeftFlipperUp}
               onPointerLeave={handleLeftFlipperUp}
               className="flex-1 py-3.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-lime-400 active:text-zinc-950 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors border border-zinc-700/80 active:shadow-[0_0_15px_#daf4aa]">
               ◄ FLIP L (A)
            </button>

            <button
               onPointerDown={handlePlungerDown}
               onPointerUp={handlePlungerUp}
               onPointerLeave={handlePlungerUp}
               className="px-4 py-3.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 active:bg-rose-500 active:text-white text-rose-400 font-mono font-bold text-xs uppercase tracking-wider transition-colors border border-rose-800/60 active:shadow-[0_0_15px_#f43f5e]">
               ⚡ PULL (SPACE)
            </button>

            <button
               onPointerDown={handleRightFlipperDown}
               onPointerUp={handleRightFlipperUp}
               onPointerLeave={handleRightFlipperUp}
               className="flex-1 py-3.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-lime-400 active:text-zinc-950 text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors border border-zinc-700/80 active:shadow-[0_0_15px_#daf4aa]">
               FLIP R ► (D)
            </button>
         </div>
      </div>
   );
}

