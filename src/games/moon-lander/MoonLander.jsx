import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Volume2, VolumeX, Rocket, ArrowUp, ArrowLeft, ArrowRight, Gauge, CheckCircle2 } from 'lucide-react';
import {
   CANVAS_WIDTH,
   CANVAS_HEIGHT,
   GRAVITY,
   MAIN_THRUST,
   ROT_SPEED,
   createInitialLanderState,
} from './landerLogic';
import { getGameHighScore, saveGameHighScore } from '../storage';
import { playTone, arcadeSounds } from '../sound';

export default function MoonLander({ isFullscreen = false }) {
   const canvasRef = useRef(null);
   const [gameState, setGameState] = useState('ready'); // ready, flying, landed, crashed
   const [score, setScore] = useState(0);
   const [fuel, setFuel] = useState(800);
   const [verticalSpeed, setVerticalSpeed] = useState(0);
   const [horizontalSpeed, setHorizontalSpeed] = useState(0);
   const [highScore, setHighScore] = useState(0);
   const [soundEnabled, setSoundEnabled] = useState(true);

   const simRef = useRef(null);
   const keysRef = useRef({ left: false, right: false, up: false });
   const animRef = useRef(null);
   const highScoreRef = useRef(0);
   highScoreRef.current = highScore;

   // Load saved high score
   useEffect(() => {
      const saved = getGameHighScore('moon-lander');
      if (saved && saved.bestScore) {
         setHighScore(saved.bestScore);
      }
   }, []);

   const playSfx = useCallback((type) => {
      if (!soundEnabled) return;
      try {
         if (type === 'thrust') {
            playTone(120, 0.04, 'triangle', 0.08);
         } else if (type === 'touchdown') {
            arcadeSounds.gameWin();
         } else if (type === 'crash') {
            arcadeSounds.gameOver();
         }
      } catch (e) {
         // Ignore
      }
   }, [soundEnabled]);

   // Start fresh flight
   const startFlight = useCallback(() => {
      simRef.current = createInitialLanderState();
      simRef.current.state = 'flying';
      setGameState('flying');
      setFuel(800);
   }, []);

   // Keyboard controls
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (['ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD', 'ArrowUp', 'KeyW', 'ArrowDown', 'KeyS', 'Space'].includes(e.code)) {
            e.preventDefault();
         }
         if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = true;
         if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = true;
         if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) {
            keysRef.current.up = true;
         }
      };

      const handleKeyUp = (e) => {
         if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = false;
         if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = false;
         if (['ArrowUp', 'KeyW', 'Space'].includes(e.code)) keysRef.current.up = false;
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
         window.removeEventListener('keydown', handleKeyDown);
         window.removeEventListener('keyup', handleKeyUp);
      };
   }, []);

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

         if (sim.state === 'flying') {
            const l = sim.lander;

            // Rotation Thrusters
            if (keysRef.current.left) {
               l.angle -= ROT_SPEED;
               sim.fuel = Math.max(0, sim.fuel - 0.4);
            }
            if (keysRef.current.right) {
               l.angle += ROT_SPEED;
               sim.fuel = Math.max(0, sim.fuel - 0.4);
            }

            // Main Engine Thrust
            l.thrusting = keysRef.current.up && sim.fuel > 0;
            if (l.thrusting) {
               sim.fuel = Math.max(0, sim.fuel - 1.8);
               // Force applied in direction opposite to lander base
               const forceAngle = l.angle - Math.PI / 2;
               l.vx += Math.cos(forceAngle) * MAIN_THRUST;
               l.vy += Math.sin(forceAngle) * MAIN_THRUST;
               playSfx('thrust');

               // Thruster exhaust particles
               sim.particles.push({
                  x: l.x - Math.cos(forceAngle) * 12,
                  y: l.y - Math.sin(forceAngle) * 12,
                  vx: -Math.cos(forceAngle) * 3 + (Math.random() - 0.5) * 1.5,
                  vy: -Math.sin(forceAngle) * 3 + (Math.random() - 0.5) * 1.5,
                  color: '#e879f9',
                  life: 0.8,
               });
            }

            // Gravity
            l.vy += GRAVITY;
            l.x += l.vx;
            l.y += l.vy;

            // Update telemetry UI states
            setFuel(Math.floor(sim.fuel));
            setVerticalSpeed(Math.abs(Math.round(l.vy * 10) / 10));
            setHorizontalSpeed(Math.abs(Math.round(l.vx * 10) / 10));

            // Terrain Collision check
            const pad = sim.pad;
            const padTouch =
               l.x >= pad.x1 - 10 &&
               l.x <= pad.x2 + 10 &&
               l.y + l.height / 2 >= pad.y - 2;

            if (padTouch) {
               const safeVy = Math.abs(l.vy) <= 1.8;
               const safeVx = Math.abs(l.vx) <= 1.2;
               const safeAngle = Math.abs(l.angle) <= 0.25;

               if (safeVy && safeVx && safeAngle) {
                  // Successful Landing!
                  sim.state = 'landed';
                  setGameState('landed');
                  playSfx('touchdown');

                  const earned = Math.floor(sim.fuel * pad.multiplier);
                  sim.score = earned;
                  setScore(earned);

                  if (earned > highScoreRef.current) {
                     setHighScore(earned);
                     saveGameHighScore('moon-lander', { bestScore: earned });
                  }
               } else {
                  // Crash on pad due to high velocity or tilt!
                  sim.state = 'crashed';
                  setGameState('crashed');
                  playSfx('crash');
                  for (let i = 0; i < 24; i++) {
                     sim.particles.push({
                        x: l.x,
                        y: l.y,
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6,
                        color: '#f43f5e',
                        life: 1.0,
                     });
                  }
               }
            } else if (l.y + l.height / 2 >= 380 || l.x < -10 || l.x > CANVAS_WIDTH + 10) {
               // Crash on rough terrain
               sim.state = 'crashed';
               setGameState('crashed');
               playSfx('crash');
               for (let i = 0; i < 24; i++) {
                  sim.particles.push({
                     x: l.x,
                     y: l.y,
                     vx: (Math.random() - 0.5) * 6,
                     vy: (Math.random() - 0.5) * 6,
                     color: '#f43f5e',
                     life: 1.0,
                  });
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

         // Render Lunar Surface
         ctx.strokeStyle = '#3f3f46';
         ctx.lineWidth = 1.8;
         ctx.beginPath();
         sim.terrain.forEach((pt, i) => {
            if (i === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
         });
         ctx.stroke();

         // Render Landing Pad (Glowing Cyan Bar)
         const pad = sim.pad;
         ctx.strokeStyle = '#06b6d4';
         ctx.shadowColor = '#06b6d4';
         ctx.shadowBlur = 8;
         ctx.lineWidth = 3.5;
         ctx.beginPath();
         ctx.moveTo(pad.x1, pad.y);
         ctx.lineTo(pad.x2, pad.y);
         ctx.stroke();
         ctx.shadowBlur = 0;

         // Pad Multiplier Label
         ctx.fillStyle = '#06b6d4';
         ctx.font = 'bold 11px monospace';
         ctx.fillText(`${pad.multiplier}X PAD`, pad.x1 + 6, pad.y + 16);

         // Render Lander
         const l = sim.lander;
         if (sim.state !== 'crashed') {
            ctx.save();
            ctx.translate(l.x, l.y);
            ctx.rotate(l.angle);

            // Lunar Module Body
            ctx.strokeStyle = '#daf4aa';
            ctx.lineWidth = 1.8;
            ctx.fillStyle = '#18181b';
            ctx.beginPath();
            ctx.roundRect(-10, -10, 20, 16, 4);
            ctx.fill();
            ctx.stroke();

            // Landing Legs
            ctx.strokeStyle = '#a1a1aa';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            // Left leg
            ctx.moveTo(-8, 6);
            ctx.lineTo(-13, 13);
            ctx.lineTo(-16, 13);
            // Right leg
            ctx.moveTo(8, 6);
            ctx.lineTo(13, 13);
            ctx.lineTo(16, 13);
            ctx.stroke();

            // Engine Flame
            if (l.thrusting) {
               ctx.strokeStyle = '#e879f9';
               ctx.beginPath();
               ctx.moveTo(-4, 6);
               ctx.lineTo(0, 15 + Math.random() * 5);
               ctx.lineTo(4, 6);
               ctx.stroke();
            }

            ctx.restore();
         }

         // Render Particles
         sim.particles.forEach((p) => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
         });
         ctx.globalAlpha = 1.0;
      };

      animRef.current = requestAnimationFrame(loop);
      return () => {
         if (animRef.current) cancelAnimationFrame(animRef.current);
      };
   }, [playSfx]);

   const setTouchKey = (key, val) => {
      keysRef.current[key] = val;
   };

   return (
      <div className="flex flex-col items-center w-full max-w-lg mx-auto space-y-3 select-none touch-none">
         {/* Top HUD: Telemetry Gauges */}
         <div className="w-full grid grid-cols-4 gap-2 px-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-md text-center text-xs font-mono">
            <div>
               <div className="text-[10px] text-zinc-500 uppercase">Fuel</div>
               <div className={`font-bold ${fuel < 150 ? 'text-rose-400 animate-pulse' : 'text-[#daf4aa]'}`}>
                  {fuel}
               </div>
            </div>
            <div>
               <div className="text-[10px] text-zinc-500 uppercase">V-Speed</div>
               <div className={`font-bold ${verticalSpeed > 1.8 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {verticalSpeed} m/s
               </div>
            </div>
            <div>
               <div className="text-[10px] text-zinc-500 uppercase">H-Speed</div>
               <div className={`font-bold ${horizontalSpeed > 1.2 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {horizontalSpeed} m/s
               </div>
            </div>
            <div>
               <div className="text-[10px] text-zinc-500 uppercase">Best Score</div>
               <div className="font-bold text-amber-400">{highScore}</div>
            </div>
         </div>

         {/* Canvas Arena */}
         <div className="relative w-full max-w-[480px] max-h-[calc(100dvh-9rem)] aspect-[500/480] rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b] shadow-2xl">
            <canvas
               ref={canvasRef}
               width={CANVAS_WIDTH}
               height={CANVAS_HEIGHT}
               className="w-full h-full block object-contain"
            />

            {/* Start Screen */}
            {gameState === 'ready' && (
               <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400 mb-3 shadow-[0_0_20px_rgba(232,121,249,0.2)]">
                     <Rocket size={28} />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-1.5">Moon Lander</h2>
                  <p className="text-xs text-zinc-400 max-w-xs mb-5">
                     Fire thrusters and throttle against low gravity to touch down gently on designated landing pads!
                  </p>
                  <button
                     type="button"
                     onClick={startFlight}
                     className="px-6 py-2.5 rounded-xl font-bold bg-[#daf4aa] text-zinc-950 hover:bg-[#c9ee8e] transition-all shadow-lg shadow-[#daf4aa]/20 flex items-center gap-2">
                     <Play size={14} className="fill-current" />
                     <span>Start Descent</span>
                  </button>
               </div>
            )}

            {/* Landed Victory Screen */}
            {gameState === 'landed' && (
               <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-[0_0_24px_rgba(52,211,153,0.3)]">
                     <CheckCircle2 size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1">Touchdown Confirmed!</h3>
                  <p className="text-xs text-zinc-400 mb-4">Apollo module landed safely on the pad</p>

                  <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-5">
                     <div className="text-center">
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">Score</div>
                        <div className="text-2xl font-black font-mono text-emerald-400">{score}</div>
                     </div>
                     <div className="w-[1px] h-8 bg-zinc-800" />
                     <div className="text-center">
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">Record</div>
                        <div className="text-2xl font-black font-mono text-amber-400">{highScore}</div>
                     </div>
                  </div>

                  <button
                     type="button"
                     onClick={startFlight}
                     className="px-6 py-2.5 rounded-xl font-bold bg-[#daf4aa] text-zinc-950 hover:bg-[#c9ee8e] transition-all shadow-lg shadow-[#daf4aa]/20 flex items-center gap-2">
                     <RotateCcw size={14} />
                     <span>Fly Again</span>
                  </button>
               </div>
            )}

            {/* Crashed Screen */}
            {gameState === 'crashed' && (
               <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-2xl font-black text-white mb-1">Module Destroyed</h3>
                  <p className="text-xs text-zinc-400 mb-4">Descent velocity was too high or module tilted</p>

                  <button
                     type="button"
                     onClick={startFlight}
                     className="px-6 py-2.5 rounded-xl font-bold bg-[#daf4aa] text-zinc-950 hover:bg-[#c9ee8e] transition-all shadow-lg shadow-[#daf4aa]/20 flex items-center gap-2">
                     <RotateCcw size={14} />
                     <span>Try Descent Again</span>
                  </button>
               </div>
            )}
         </div>

         {/* Mobile Touch Thruster Controls */}
         <div className="w-full max-w-[480px] grid grid-cols-3 gap-2 pt-1 select-none">
            <button
               onPointerDown={(e) => {
                  e.preventDefault();
                  setTouchKey('left', true);
               }}
               onPointerUp={() => setTouchKey('left', false)}
               onPointerLeave={() => setTouchKey('left', false)}
               className="py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 active:bg-zinc-800 active:scale-95 transition-all">
               <ArrowLeft size={18} />
            </button>
            <button
               onPointerDown={(e) => {
                  e.preventDefault();
                  setTouchKey('up', true);
               }}
               onPointerUp={() => setTouchKey('up', false)}
               onPointerLeave={() => setTouchKey('up', false)}
               className="py-3.5 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-500/40 text-fuchsia-400 font-bold active:bg-fuchsia-500/30 active:scale-95 transition-all flex items-center justify-center gap-1">
               <ArrowUp size={18} />
               <span className="text-[11px]">THROTTLE</span>
            </button>
            <button
               onPointerDown={(e) => {
                  e.preventDefault();
                  setTouchKey('right', true);
               }}
               onPointerUp={() => setTouchKey('right', false)}
               onPointerLeave={() => setTouchKey('right', false)}
               className="py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 active:bg-zinc-800 active:scale-95 transition-all">
               <ArrowRight size={18} />
            </button>
         </div>

         {/* Controls Hint */}
         <div className="text-xs text-zinc-500 text-center">
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">&larr;</kbd> <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">&rarr;</kbd> Tilt Module &bull; <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">&uarr;</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">SPACE</kbd> Main Thruster (Keep V-Speed &lt; 1.8 m/s!)
         </div>
      </div>
   );
}

