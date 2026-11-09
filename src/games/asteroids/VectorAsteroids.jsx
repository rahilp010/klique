import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, RotateCw, Trophy, Volume2, VolumeX, Shield, Rocket, ArrowUp, Zap } from 'lucide-react';
import {
   CANVAS_WIDTH,
   CANVAS_HEIGHT,
   SHIP_RADIUS,
   ROT_SPEED,
   THRUST,
   FRICTION,
   createAsteroid,
   createInitialAsteroidsState,
   wrapCoordinates,
} from './asteroidsLogic';
import { getGameHighScore, saveGameHighScore } from '../storage';
import { playTone, arcadeSounds } from '../sound';

export default function VectorAsteroids({ isFullscreen = false }) {
   const canvasRef = useRef(null);
   const [gameState, setGameState] = useState('ready'); // ready, playing, gameover
   const [score, setScore] = useState(0);
   const [lives, setLives] = useState(3);
   const [highScore, setHighScore] = useState(0);
   const [soundEnabled, setSoundEnabled] = useState(true);

   const simRef = useRef(null);
   const keysRef = useRef({ left: false, right: false, up: false, fire: false });
   const animRef = useRef(null);
   const highScoreRef = useRef(0);
   highScoreRef.current = highScore;

   // Load saved high score
   useEffect(() => {
      const saved = getGameHighScore('asteroids');
      if (saved && saved.bestScore) {
         setHighScore(saved.bestScore);
      }
   }, []);

   const playSfx = useCallback((type) => {
      if (!soundEnabled) return;
      try {
         if (type === 'laser') {
            playTone(880, 0.06, 'sawtooth', 0.1);
         } else if (type === 'explode') {
            playTone(220, 0.12, 'square', 0.12);
         } else if (type === 'crash') {
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
      simRef.current = createInitialAsteroidsState();
      simRef.current.state = 'playing';
      setGameState('playing');
      setScore(0);
      setLives(3);
   }, []);

   // Keyboard controls
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code) || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
            e.preventDefault();
         }
         if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = true;
         if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = true;
         if (['ArrowUp', 'KeyW'].includes(e.code)) {
            keysRef.current.up = true;
         }
         if (['Space', 'KeyJ'].includes(e.code) || e.key === ' ') {
            keysRef.current.fire = true;
         }
      };

      const handleKeyUp = (e) => {
         if (['ArrowLeft', 'KeyA'].includes(e.code)) keysRef.current.left = false;
         if (['ArrowRight', 'KeyD'].includes(e.code)) keysRef.current.right = false;
         if (['ArrowUp', 'KeyW'].includes(e.code)) keysRef.current.up = false;
         if (['Space', 'KeyJ'].includes(e.code) || e.key === ' ') keysRef.current.fire = false;
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

         if (sim.state === 'playing') {
            const ship = sim.ship;

            // Rotation
            if (keysRef.current.left) ship.angle -= ROT_SPEED;
            if (keysRef.current.right) ship.angle += ROT_SPEED;

            // Thrust
            ship.thrusting = keysRef.current.up;
            if (ship.thrusting) {
               ship.vx += Math.cos(ship.angle) * THRUST;
               ship.vy += Math.sin(ship.angle) * THRUST;

               // Exhaust thruster particles
               sim.particles.push({
                  x: ship.x - Math.cos(ship.angle) * SHIP_RADIUS,
                  y: ship.y - Math.sin(ship.angle) * SHIP_RADIUS,
                  vx: -Math.cos(ship.angle) * 3 + (Math.random() - 0.5) * 1.5,
                  vy: -Math.sin(ship.angle) * 3 + (Math.random() - 0.5) * 1.5,
                  color: '#daf4aa',
                  life: 0.8,
               });
            }

            // Apply friction and position
            ship.vx *= FRICTION;
            ship.vy *= FRICTION;
            ship.x += ship.vx;
            ship.y += ship.vy;
            wrapCoordinates(ship);

            // Invincibility countdown
            if (ship.invincibleTimer > 0) ship.invincibleTimer--;

            // Firing bullets
            const now = Date.now();
            if (keysRef.current.fire && now - sim.lastFireTime > 220 && sim.bullets.length < 5) {
               sim.bullets.push({
                  x: ship.x + Math.cos(ship.angle) * SHIP_RADIUS,
                  y: ship.y + Math.sin(ship.angle) * SHIP_RADIUS,
                  vx: Math.cos(ship.angle) * 8.5 + ship.vx * 0.4,
                  vy: Math.sin(ship.angle) * 8.5 + ship.vy * 0.4,
                  life: 55, // frames
               });
               sim.lastFireTime = now;
               playSfx('laser');
            }

            // Update Bullets
            for (let i = sim.bullets.length - 1; i >= 0; i--) {
               const b = sim.bullets[i];
               b.x += b.vx;
               b.y += b.vy;
               b.life--;
               wrapCoordinates(b);

               if (b.life <= 0) {
                  sim.bullets.splice(i, 1);
               }
            }

            // Update Asteroids
            sim.asteroids.forEach((a) => {
               a.x += a.vx;
               a.y += a.vy;
               a.angle += a.vRot;
               wrapCoordinates(a);
            });

            // Bullet vs Asteroid Collisions
            for (let i = sim.bullets.length - 1; i >= 0; i--) {
               const b = sim.bullets[i];
               let bulletHit = false;

               for (let j = sim.asteroids.length - 1; j >= 0; j--) {
                  const a = sim.asteroids[j];
                  const dist = Math.hypot(b.x - a.x, b.y - a.y);

                  if (dist < a.radius) {
                     bulletHit = true;
                     playSfx('explode');

                     // Score by tier
                     const pts = a.tier === 3 ? 20 : a.tier === 2 ? 50 : 100;
                     sim.score += pts;
                     setScore(sim.score);

                     // Explosion particles
                     for (let p = 0; p < 12; p++) {
                        sim.particles.push({
                           x: a.x,
                           y: a.y,
                           vx: (Math.random() - 0.5) * 4,
                           vy: (Math.random() - 0.5) * 4,
                           color: a.color,
                           life: 0.9,
                        });
                     }

                     // Split asteroid if tier > 1
                     if (a.tier > 1) {
                        sim.asteroids.push(createAsteroid(a.x, a.y, a.tier - 1));
                        sim.asteroids.push(createAsteroid(a.x, a.y, a.tier - 1));
                     }

                     sim.asteroids.splice(j, 1);
                     break;
                  }
               }

               if (bulletHit) {
                  sim.bullets.splice(i, 1);
               }
            }

            // Ship vs Asteroid Collisions
            if (ship.invincibleTimer === 0) {
               for (const a of sim.asteroids) {
                  const dist = Math.hypot(ship.x - a.x, ship.y - a.y);
                  if (dist < a.radius + SHIP_RADIUS - 3) {
                     // Ship destroyed!
                     sim.lives--;
                     setLives(sim.lives);
                     playSfx('crash');

                     for (let p = 0; p < 20; p++) {
                        sim.particles.push({
                           x: ship.x,
                           y: ship.y,
                           vx: (Math.random() - 0.5) * 6,
                           vy: (Math.random() - 0.5) * 6,
                           color: '#f43f5e',
                           life: 1.0,
                        });
                     }

                     if (sim.lives <= 0) {
                        sim.state = 'gameover';
                        setGameState('gameover');
                        playSfx('gameover');

                        if (sim.score > highScoreRef.current) {
                           setHighScore(sim.score);
                           saveGameHighScore('asteroids', { bestScore: sim.score });
                        }
                     } else {
                        // Respawn ship center
                        ship.x = CANVAS_WIDTH / 2;
                        ship.y = CANVAS_HEIGHT / 2;
                        ship.vx = 0;
                        ship.vy = 0;
                        ship.invincibleTimer = 90;
                     }
                     break;
                  }
               }
            }

            // Respawn wave if all asteroids cleared!
            if (sim.asteroids.length === 0) {
               for (let i = 0; i < 5; i++) {
                  const angle = (i * Math.PI * 2) / 5;
                  const dist = 180;
                  sim.asteroids.push(
                     createAsteroid(
                        CANVAS_WIDTH / 2 + Math.cos(angle) * dist,
                        CANVAS_HEIGHT / 2 + Math.sin(angle) * dist,
                        3
                     )
                  );
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

         // Render Asteroids (Vector Wireframe)
         sim.asteroids.forEach((a) => {
            ctx.save();
            ctx.translate(a.x, a.y);
            ctx.rotate(a.angle);
            ctx.strokeStyle = a.color;
            ctx.shadowColor = a.color;
            ctx.shadowBlur = 6;
            ctx.lineWidth = 1.5;
            ctx.beginPath();

            const numPoints = a.offsets.length;
            for (let i = 0; i < numPoints; i++) {
               const theta = (i * Math.PI * 2) / numPoints;
               const r = a.radius * a.offsets[i];
               const px = Math.cos(theta) * r;
               const py = Math.sin(theta) * r;
               if (i === 0) ctx.moveTo(px, py);
               else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.restore();
         });

         // Render Bullets
         ctx.fillStyle = '#38bdf8';
         ctx.shadowColor = '#38bdf8';
         ctx.shadowBlur = 6;
         sim.bullets.forEach((b) => {
            ctx.beginPath();
            ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
         });
         ctx.shadowBlur = 0;

         // Render Ship (Neon Vector Wedge)
         const ship = sim.ship;
         if (ship.invincibleTimer === 0 || Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.save();
            ctx.translate(ship.x, ship.y);
            ctx.rotate(ship.angle);
            ctx.strokeStyle = '#daf4aa';
            ctx.shadowColor = '#daf4aa';
            ctx.shadowBlur = 8;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            // Nose
            ctx.moveTo(SHIP_RADIUS + 4, 0);
            // Left wing
            ctx.lineTo(-SHIP_RADIUS, -SHIP_RADIUS + 3);
            // Inset engine
            ctx.lineTo(-SHIP_RADIUS + 4, 0);
            // Right wing
            ctx.lineTo(-SHIP_RADIUS, SHIP_RADIUS - 3);
            ctx.closePath();
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Thrust flame
            if (ship.thrusting) {
               ctx.strokeStyle = '#fbbf24';
               ctx.beginPath();
               ctx.moveTo(-SHIP_RADIUS + 4, -4);
               ctx.lineTo(-SHIP_RADIUS - 8, 0);
               ctx.lineTo(-SHIP_RADIUS + 4, 4);
               ctx.stroke();
            }

            ctx.restore();
         }

         // Render Particles
         sim.particles.forEach((p) => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
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
         {/* Top HUD */}
         <div className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-md">
            <div className="flex items-center space-x-4">
               <div>
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Score</div>
                  <div className="text-xl font-black font-mono text-cyan-400">{score}</div>
               </div>
               <div className="w-[1px] h-6 bg-zinc-800" />
               <div>
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Shields</div>
                  <div className="flex items-center space-x-1 mt-0.5">
                     {Array.from({ length: 3 }).map((_, i) => (
                        <div
                           key={i}
                           className={`w-3.5 h-3.5 rounded-sm border ${
                              i < lives ? 'bg-cyan-400 border-cyan-300' : 'bg-zinc-800 border-zinc-700'
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
         <div className={`relative w-full max-w-[480px] ${isFullscreen ? 'max-h-[calc(100dvh-7.5rem)]' : 'max-h-[min(480px,calc(100dvh-9rem))]'} aspect-square rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b] shadow-2xl`}>
            <canvas
               ref={canvasRef}
               width={CANVAS_WIDTH}
               height={CANVAS_HEIGHT}
               className="w-full h-full block object-contain"
            />

            {/* Start Screen */}
            {gameState === 'ready' && (
               <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                     <Rocket size={28} />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-1.5">Vector Asteroids</h2>
                  <p className="text-xs text-zinc-400 max-w-xs mb-5">
                     Pilot your ship with 360-degree rotational drift. Blast asteroids into fragments and avoid space debris!
                  </p>
                  <button
                     type="button"
                     onClick={startGame}
                     className="px-6 py-2.5 rounded-xl font-bold bg-[#daf4aa] text-zinc-950 hover:bg-[#c9ee8e] transition-all shadow-lg shadow-[#daf4aa]/20 flex items-center gap-2">
                     <Play size={14} className="fill-current" />
                     <span>Engage Thrusters</span>
                  </button>
               </div>
            )}

            {/* Game Over Screen */}
            {gameState === 'gameover' && (
               <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-2xl font-black text-white mb-1">Starship Obliterated</h3>
                  <p className="text-xs text-zinc-400 mb-4">Asteroid impact breached cockpit integrity</p>

                  <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-5">
                     <div className="text-center">
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">Score</div>
                        <div className="text-2xl font-black font-mono text-cyan-400">{score}</div>
                     </div>
                     <div className="w-[1px] h-8 bg-zinc-800" />
                     <div className="text-center">
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">Record</div>
                        <div className="text-2xl font-black font-mono text-amber-400">{highScore}</div>
                     </div>
                  </div>

                  <button
                     type="button"
                     onClick={startGame}
                     className="px-6 py-2.5 rounded-xl font-bold bg-[#daf4aa] text-zinc-950 hover:bg-[#c9ee8e] transition-all shadow-lg shadow-[#daf4aa]/20 flex items-center gap-2">
                     <RotateCcw size={14} />
                     <span>Launch Again</span>
                  </button>
               </div>
            )}
         </div>

         {/* Mobile Control Pad */}
         <div className="w-full max-w-[480px] grid grid-cols-4 gap-2 pt-1 select-none">
            <button
               onPointerDown={(e) => {
                  e.preventDefault();
                  setTouchKey('left', true);
               }}
               onPointerUp={() => setTouchKey('left', false)}
               onPointerLeave={() => setTouchKey('left', false)}
               className="py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 active:bg-zinc-800 active:scale-95 transition-all">
               <RotateCcw size={18} />
            </button>
            <button
               onPointerDown={(e) => {
                  e.preventDefault();
                  setTouchKey('up', true);
               }}
               onPointerUp={() => setTouchKey('up', false)}
               onPointerLeave={() => setTouchKey('up', false)}
               className="py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 active:bg-zinc-800 active:scale-95 transition-all">
               <ArrowUp size={18} />
            </button>
            <button
               onPointerDown={(e) => {
                  e.preventDefault();
                  setTouchKey('right', true);
               }}
               onPointerUp={() => setTouchKey('right', false)}
               onPointerLeave={() => setTouchKey('right', false)}
               className="py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 active:bg-zinc-800 active:scale-95 transition-all">
               <RotateCw size={18} />
            </button>
            <button
               onPointerDown={(e) => {
                  e.preventDefault();
                  setTouchKey('fire', true);
               }}
               onPointerUp={() => setTouchKey('fire', false)}
               onPointerLeave={() => setTouchKey('fire', false)}
               className="py-3.5 rounded-2xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 font-bold active:bg-cyan-500/30 active:scale-95 transition-all flex items-center justify-center gap-1">
               <Zap size={14} className="fill-current" />
               <span className="text-[11px]">FIRE</span>
            </button>
         </div>

         {/* Controls Hint */}
         <div className="text-xs text-zinc-500 text-center">
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">&larr;</kbd> <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">&rarr;</kbd> Rotate &bull; <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">&uarr;</kbd> Thrust &bull; <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">SPACE</kbd> Fire Lasers
         </div>
      </div>
   );
}

