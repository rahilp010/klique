import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Pause, Volume2, VolumeX, Trophy, Shield, Crosshair, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import {
   CANVAS_WIDTH,
   CANVAS_HEIGHT,
   createInitialGameState,
   createAliens,
   createBunkers,
   checkAABB,
   createExplosion,
} from './spaceInvadersLogic';
import { getGameHighScore, saveGameHighScore } from '../storage';
import { playTone, arcadeSounds } from '../sound';

export default function SpaceInvaders({ isFullscreen = false }) {
   const canvasRef = useRef(null);
   const [gameState, setGameState] = useState('ready'); // ready, playing, paused, gameover, wave_cleared
   const [score, setScore] = useState(0);
   const [highScore, setHighScore] = useState(0);
   const [lives, setLives] = useState(3);
   const [wave, setWave] = useState(1);
   const [soundEnabled, setSoundEnabled] = useState(true);

   // Ref to hold the mutable game loop state to avoid re-renders at 60fps
   const simRef = useRef(null);
   const keysRef = useRef({ left: false, right: false, fire: false });
   const animFrameRef = useRef(null);
   const lastFrameTimeRef = useRef(0);
   const highScoreRef = useRef(highScore);
   highScoreRef.current = highScore;
   const playSfxRef = useRef(null);

   // Load saved high score
   useEffect(() => {
      const saved = getGameHighScore('space-invaders');
      if (saved && saved.bestScore) {
         setHighScore(saved.bestScore);
      }
   }, []);

   const playSfx = useCallback((type) => {
      if (!soundEnabled) return;
      try {
         if (type === 'laser') {
            playTone(850, 0.08, 'sawtooth', 0.1);
         } else if (type === 'hit') {
            playTone(220, 0.12, 'square', 0.15);
         } else if (type === 'bunker') {
            playTone(320, 0.05, 'triangle', 0.1);
         } else if (type === 'step') {
            playTone(110, 0.04, 'sine', 0.08);
         } else if (type === 'loseLife') {
            arcadeSounds.loseLife();
         } else if (type === 'waveCleared') {
            arcadeSounds.gameWin();
         } else if (type === 'gameOver') {
            arcadeSounds.gameOver();
         } else if (type === 'ufo') {
            playTone(600, 0.1, 'sine', 0.1);
         }
      } catch (err) {
         // Ignore audio failure
      }
   }, [soundEnabled]);
   playSfxRef.current = playSfx;

   // Start fresh game or next wave
   const initGame = useCallback((startingWave = 1, currentScore = 0, currentLives = 3) => {
      simRef.current = createInitialGameState(startingWave, currentScore, currentLives);
      simRef.current.state = 'playing';
      setGameState('playing');
      setScore(currentScore);
      setWave(startingWave);
      setLives(currentLives);
   }, []);

   const handleStart = () => {
      initGame(1, 0, 3);
   };

   const handleRestart = () => {
      initGame(1, 0, 3);
   };

   const handleTogglePause = () => {
      if (gameState === 'playing') {
         setGameState('paused');
         if (simRef.current) simRef.current.state = 'paused';
      } else if (gameState === 'paused') {
         setGameState('playing');
         if (simRef.current) simRef.current.state = 'playing';
      }
   };

   // Keyboard controls
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (['ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD', 'ArrowUp', 'KeyW', 'ArrowDown', 'KeyS', 'Space'].includes(e.code) || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
            e.preventDefault();
         }
         if (['ArrowLeft', 'KeyA'].includes(e.code)) {
            keysRef.current.left = true;
         } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
            keysRef.current.right = true;
         } else if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
            keysRef.current.fire = true;
         } else if (e.code === 'KeyP') {
            handleTogglePause();
         }
      };

      const handleKeyUp = (e) => {
         if (['ArrowLeft', 'KeyA'].includes(e.code)) {
            keysRef.current.left = false;
         } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
            keysRef.current.right = false;
         } else if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
            keysRef.current.fire = false;
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
         window.removeEventListener('keydown', handleKeyDown);
         window.removeEventListener('keyup', handleKeyUp);
      };
   }, [gameState]);

   // Main game tick and render loop
   useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const loop = (timestamp) => {
         animFrameRef.current = requestAnimationFrame(loop);
         const sim = simRef.current;
         if (!sim) {
            // Draw idle background
            ctx.fillStyle = '#09090b';
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            return;
         }

         // Update game simulation if playing
         if (sim.state === 'playing') {
            // Move Stars
            sim.stars.forEach((s) => {
               s.y += s.speed;
               if (s.y > CANVAS_HEIGHT) {
                  s.y = 0;
                  s.x = Math.random() * CANVAS_WIDTH;
               }
            });

            // Player movement
            if (keysRef.current.left) {
               sim.player.x = Math.max(10, sim.player.x - sim.player.speed);
            }
            if (keysRef.current.right) {
               sim.player.x = Math.min(CANVAS_WIDTH - sim.player.width - 10, sim.player.x + sim.player.speed);
            }

            // Player firing
            const now = Date.now();
            if (keysRef.current.fire && now - sim.lastFireTime > 260 && sim.playerBullets.length < 3) {
               sim.playerBullets.push({
                  x: sim.player.x + sim.player.width / 2 - 2,
                  y: sim.player.y - 6,
                  width: 4,
                  height: 12,
                  vy: -7.5,
               });
               sim.lastFireTime = now;
               playSfx('laser');
            }

            // Update player bullets
            for (let i = sim.playerBullets.length - 1; i >= 0; i--) {
               const b = sim.playerBullets[i];
               b.y += b.vy;
               if (b.y < -10) {
                  sim.playerBullets.splice(i, 1);
               }
            }

            // Update alien bullets
            for (let i = sim.alienBullets.length - 1; i >= 0; i--) {
               const b = sim.alienBullets[i];
               b.y += b.vy;

               // Hit player?
               if (checkAABB(b, sim.player)) {
                  sim.alienBullets.splice(i, 1);
                  sim.particles.push(...createExplosion(sim.player.x + sim.player.width / 2, sim.player.y, '#f43f5e', 24));
                  playSfx('loseLife');

                  const nextLives = sim.lives - 1;
                  sim.lives = nextLives;
                  setLives(nextLives);

                  if (nextLives <= 0) {
                     sim.state = 'gameover';
                     setGameState('gameover');
                     playSfx('gameOver');
                     // Update highscore
                     if (sim.score > highScore) {
                        setHighScore(sim.score);
                        saveGameHighScore('space-invaders', { bestScore: sim.score });
                     }
                  } else {
                     // Reset player position
                     sim.player.x = CANVAS_WIDTH / 2 - 18;
                  }
                  continue;
               }

               // Out of bounds?
               if (b.y > CANVAS_HEIGHT + 10) {
                  sim.alienBullets.splice(i, 1);
               }
            }

            // Alien fleet movement
            sim.alienStepTimer++;
            const liveAliens = sim.aliens.filter((a) => a.alive);

            // Dynamic speedup as aliens diminish
            const aliveRatio = liveAliens.length / sim.aliens.length;
            const currentInterval = Math.max(6, Math.floor(sim.alienStepInterval * aliveRatio));

            if (sim.alienStepTimer >= currentInterval) {
               sim.alienStepTimer = 0;
               let switchDir = false;

               // Check if any alive alien touches wall
               for (const alien of liveAliens) {
                  if (sim.alienDir === 1 && alien.x + alien.width >= CANVAS_WIDTH - 12) {
                     switchDir = true;
                     break;
                  } else if (sim.alienDir === -1 && alien.x <= 12) {
                     switchDir = true;
                     break;
                  }
               }

               if (switchDir) {
                  sim.alienDir *= -1;
                  for (const alien of liveAliens) {
                     alien.y += 12;
                     // Did aliens reach bunker level / player level?
                     if (alien.y + alien.height >= sim.player.y) {
                        sim.state = 'gameover';
                        setGameState('gameover');
                        playSfx('gameOver');
                        if (sim.score > highScore) {
                           setHighScore(sim.score);
                           saveGameHighScore('space-invaders', { bestScore: sim.score });
                        }
                        break;
                     }
                  }
               } else {
                  for (const alien of liveAliens) {
                     alien.x += sim.alienDir * 8;
                  }
               }

               playSfx('step');
            }

            // Alien firing (random bottom alien shoots)
            if (liveAliens.length > 0 && Math.random() < 0.02 + sim.wave * 0.005 && sim.alienBullets.length < 4) {
               const shooter = liveAliens[Math.floor(Math.random() * liveAliens.length)];
               sim.alienBullets.push({
                  x: shooter.x + shooter.width / 2 - 2,
                  y: shooter.y + shooter.height,
                  width: 4,
                  height: 10,
                  vy: 3.5 + Math.min(sim.wave * 0.4, 2),
               });
            }

            // UFO mothership spawn & move
            sim.ufoTimer--;
            if (sim.ufoTimer <= 0 && !sim.ufo) {
               sim.ufo = {
                  x: -40,
                  y: 35,
                  width: 36,
                  height: 16,
                  speed: 2.2,
                  score: [100, 200, 300][Math.floor(Math.random() * 3)],
               };
               sim.ufoTimer = 900 + Math.floor(Math.random() * 600);
               playSfx('ufo');
            }

            if (sim.ufo) {
               sim.ufo.x += sim.ufo.speed;
               if (sim.ufo.x > CANVAS_WIDTH + 50) {
                  sim.ufo = null;
               }
            }

            // Bullet vs UFO collision
            if (sim.ufo) {
               for (let i = sim.playerBullets.length - 1; i >= 0; i--) {
                  const b = sim.playerBullets[i];
                  if (checkAABB(b, sim.ufo)) {
                     const ufoScore = sim.ufo.score;
                     sim.playerBullets.splice(i, 1);
                     sim.particles.push(...createExplosion(sim.ufo.x + 18, sim.ufo.y + 8, '#fbbf24', 20));
                     sim.score += ufoScore;
                     setScore(sim.score);
                     sim.ufo = null;
                     playSfx('hit');
                     break;
                  }
               }
            }

            // Bullet vs Alien collisions
            for (let i = sim.playerBullets.length - 1; i >= 0; i--) {
               const b = sim.playerBullets[i];
               let bulletHit = false;

               for (const alien of liveAliens) {
                  if (alien.alive && checkAABB(b, alien)) {
                     alien.alive = false;
                     bulletHit = true;
                     sim.particles.push(...createExplosion(alien.x + alien.width / 2, alien.y + alien.height / 2, alien.color, 14));
                     sim.score += alien.score;
                     setScore(sim.score);
                     playSfx('hit');
                     break;
                  }
               }

               if (bulletHit) {
                  sim.playerBullets.splice(i, 1);
               }
            }

            // Bullet vs Bunker collisions
            for (const bunker of sim.bunkers) {
               for (const part of bunker.parts) {
                  if (part.hp <= 0) continue;

                  // Player bullets hitting bunker
                  for (let i = sim.playerBullets.length - 1; i >= 0; i--) {
                     if (checkAABB(sim.playerBullets[i], part)) {
                        part.hp -= 1;
                        sim.playerBullets.splice(i, 1);
                        sim.particles.push(...createExplosion(part.x + part.width / 2, part.y + part.height / 2, '#38bdf8', 4));
                        playSfx('bunker');
                        break;
                     }
                  }

                  // Alien bullets hitting bunker
                  for (let i = sim.alienBullets.length - 1; i >= 0; i--) {
                     if (checkAABB(sim.alienBullets[i], part)) {
                        part.hp -= 1;
                        sim.alienBullets.splice(i, 1);
                        sim.particles.push(...createExplosion(part.x + part.width / 2, part.y + part.height / 2, '#38bdf8', 4));
                        playSfx('bunker');
                        break;
                     }
                  }
               }
            }

            // Check if wave is cleared
            if (sim.aliens.every((a) => !a.alive)) {
               sim.state = 'wave_cleared';
               setGameState('wave_cleared');
               playSfx('waveCleared');
               setTimeout(() => {
                  initGame(sim.wave + 1, sim.score, sim.lives);
               }, 1400);
            }

            // Particles update
            for (let i = sim.particles.length - 1; i >= 0; i--) {
               const p = sim.particles[i];
               p.x += p.vx;
               p.y += p.vy;
               p.life--;
               if (p.life <= 0) {
                  sim.particles.splice(i, 1);
               }
            }
         }

         // ---------------- RENDER ----------------
         // 1. Background
         ctx.fillStyle = '#09090b';
         ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

         // 2. Stars
         sim.stars.forEach((s) => {
            ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
            ctx.fillRect(s.x, s.y, s.size, s.size);
         });

         // 3. Destructible Bunkers
         sim.bunkers.forEach((bunker) => {
            bunker.parts.forEach((part) => {
               if (part.hp > 0) {
                  const alpha = part.hp / 4;
                  ctx.fillStyle = `rgba(56, 189, 248, ${0.3 + alpha * 0.7})`;
                  ctx.fillRect(part.x, part.y, part.width - 1, part.height - 1);
               }
            });
         });

         // 4. Aliens
         sim.aliens.forEach((alien) => {
            if (!alien.alive) return;
            ctx.fillStyle = alien.color;
            // Draw retro pixel invader silhouette
            const x = alien.x;
            const y = alien.y;
            const w = alien.width;
            const h = alien.height;

            // Simplified crisp vector alien icon
            ctx.fillRect(x + 4, y, w - 8, h);
            ctx.fillRect(x, y + 4, w, h - 8);
            // Eye cutouts
            ctx.fillStyle = '#09090b';
            ctx.fillRect(x + 6, y + 4, 3, 4);
            ctx.fillRect(x + w - 9, y + 4, 3, 4);
         });

         // 5. UFO Mothership
         if (sim.ufo) {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.ellipse(sim.ufo.x + sim.ufo.width / 2, sim.ufo.y + sim.ufo.height / 2, sim.ufo.width / 2, sim.ufo.height / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            // Dome
            ctx.fillStyle = '#fde68a';
            ctx.beginPath();
            ctx.arc(sim.ufo.x + sim.ufo.width / 2, sim.ufo.y + 4, 6, 0, Math.PI, true);
            ctx.fill();
         }

         // 6. Player Bullets
         ctx.fillStyle = '#daf4aa';
         sim.playerBullets.forEach((b) => {
            ctx.shadowColor = '#daf4aa';
            ctx.shadowBlur = 6;
            ctx.fillRect(b.x, b.y, b.width, b.height);
         });
         ctx.shadowBlur = 0;

         // 7. Alien Bullets
         ctx.fillStyle = '#f43f5e';
         sim.alienBullets.forEach((b) => {
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 6;
            ctx.fillRect(b.x, b.y, b.width, b.height);
         });
         ctx.shadowBlur = 0;

         // 8. Player Starship
         const px = sim.player.x;
         const py = sim.player.y;
         const pw = sim.player.width;
         const ph = sim.player.height;

         // Body
         ctx.fillStyle = '#daf4aa';
         ctx.beginPath();
         ctx.moveTo(px + pw / 2, py);
         ctx.lineTo(px + pw, py + ph);
         ctx.lineTo(px + pw / 2, py + ph - 4);
         ctx.lineTo(px, py + ph);
         ctx.closePath();
         ctx.fill();

         // Cockpit
         ctx.fillStyle = '#09090b';
         ctx.fillRect(px + pw / 2 - 2, py + 6, 4, 5);

         // 9. Particle bursts
         sim.particles.forEach((p) => {
            const alpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.fillRect(p.x, p.y, p.size, p.size);
         });
         ctx.globalAlpha = 1.0;
      };

      animFrameRef.current = requestAnimationFrame(loop);
      return () => {
         if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
   }, [initGame]);

   // Mobile controls helper
   const setTouchKey = (key, pressed) => {
      keysRef.current[key] = pressed;
   };

   return (
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-4">
         {/* Top Stats HUD */}
         <div className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-5">
               <div>
                  <div className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Score</div>
                  <div className="text-xl font-bold font-mono text-zinc-100">{score}</div>
               </div>
               <div className="h-8 w-[1px] bg-zinc-800" />
               <div>
                  <div className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Wave</div>
                  <div className="text-xl font-bold font-mono text-lime-400">{wave}</div>
               </div>
               <div className="h-8 w-[1px] bg-zinc-800" />
               <div>
                  <div className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase">Lives</div>
                  <div className="flex items-center space-x-1 mt-0.5">
                     {Array.from({ length: 3 }).map((_, i) => (
                        <div
                           key={i}
                           className={`w-3.5 h-3.5 rounded-sm border ${
                              i < lives ? 'bg-lime-400 border-lime-300' : 'bg-zinc-800 border-zinc-700'
                           }`}
                        />
                     ))}
                  </div>
               </div>
            </div>

            <div className="flex items-center space-x-4">
               <div className="text-right hidden sm:block">
                  <div className="text-[11px] font-medium tracking-wider text-zinc-400 uppercase flex items-center justify-end space-x-1">
                     <Trophy className="w-3 h-3 text-amber-400" />
                     <span>High Score</span>
                  </div>
                  <div className="text-lg font-bold font-mono text-amber-400">{highScore}</div>
               </div>

               <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-lg transition-colors"
                  aria-label="Toggle sound">
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-zinc-500" />}
               </button>

               {gameState === 'playing' || gameState === 'paused' ? (
                  <button
                     onClick={handleTogglePause}
                     className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-lg transition-colors"
                     aria-label={gameState === 'paused' ? 'Resume' : 'Pause'}>
                     {gameState === 'paused' ? <Play className="w-5 h-5 text-lime-400" /> : <Pause className="w-5 h-5" />}
                  </button>
               ) : null}
            </div>
         </div>

         {/* Canvas Container with Overlays */}
         <div className={`relative w-full max-w-[480px] ${isFullscreen ? 'max-h-[calc(100dvh-7.5rem)]' : 'max-h-[min(560px,calc(100dvh-9rem))]'} aspect-[480/560] rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b] shadow-2xl`}>
            <canvas
               ref={canvasRef}
               width={CANVAS_WIDTH}
               height={CANVAS_HEIGHT}
               className="w-full h-full block object-contain"
               style={{ imageRendering: 'pixelated' }}
            />

            {/* Ready / Start Overlay */}
            {gameState === 'ready' && (
               <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center text-lime-400 mb-4 shadow-[0_0_24px_rgba(218,244,170,0.15)]">
                     <Crosshair className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-100 mb-2">Space Defend</h2>
                  <p className="text-sm text-zinc-400 max-w-xs mb-6">
                     Repel descending alien fleets, take cover behind defensive barriers, and eliminate the mystery mothership!
                  </p>
                  <button
                     onClick={handleStart}
                     className="px-6 py-2.5 rounded-xl font-semibold bg-lime-400 text-zinc-950 hover:bg-lime-300 transition-colors shadow-lg shadow-lime-400/20 flex items-center space-x-2">
                     <Play className="w-4 h-4 fill-current" />
                     <span>Engage Fleet</span>
                  </button>
               </div>
            )}

            {/* Paused Overlay */}
            {gameState === 'paused' && (
               <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-xl font-bold text-zinc-100 mb-4">Transmission Paused</h3>
                  <button
                     onClick={handleTogglePause}
                     className="px-5 py-2.5 rounded-xl font-medium bg-lime-400 text-zinc-950 hover:bg-lime-300 transition-colors flex items-center space-x-2">
                     <Play className="w-4 h-4 fill-current" />
                     <span>Resume Combat</span>
                  </button>
               </div>
            )}

            {/* Wave Cleared Banner */}
            {gameState === 'wave_cleared' && (
               <div className="absolute inset-0 bg-lime-950/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <div className="text-xs uppercase tracking-widest text-lime-400 font-bold mb-1">Fleet Neutralized</div>
                  <h3 className="text-3xl font-extrabold text-lime-300 mb-2 font-mono">Wave {wave} Cleared!</h3>
                  <p className="text-sm text-zinc-300">Incoming enemy reinforcements approaching...</p>
               </div>
            )}

            {/* Game Over Overlay */}
            {gameState === 'gameover' && (
               <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
                     <Shield className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-zinc-100 mb-1">Starship Down</h3>
                  <p className="text-sm text-zinc-400 mb-4">Alien fleet breached your defense sector</p>

                  <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6">
                     <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-left">
                        <div className="text-[11px] font-medium text-zinc-400 uppercase">Final Score</div>
                        <div className="text-xl font-bold font-mono text-zinc-100">{score}</div>
                     </div>
                     <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-left">
                        <div className="text-[11px] font-medium text-zinc-400 uppercase">Sector Wave</div>
                        <div className="text-xl font-bold font-mono text-lime-400">{wave}</div>
                     </div>
                  </div>

                  <button
                     onClick={handleRestart}
                     className="px-6 py-2.5 rounded-xl font-semibold bg-lime-400 text-zinc-950 hover:bg-lime-300 transition-colors shadow-lg shadow-lime-400/20 flex items-center space-x-2">
                     <RotateCcw className="w-4 h-4" />
                     <span>Deploy Again</span>
                  </button>
               </div>
            )}
         </div>

         {/* Mobile / Touch Controller Bar */}
         <div className="w-full max-w-[480px] grid grid-cols-3 gap-2 pt-1 select-none">
            <button
               onPointerDown={(e) => {
                  e.preventDefault();
                  setTouchKey('left', true);
               }}
               onPointerUp={() => setTouchKey('left', false)}
               onPointerLeave={() => setTouchKey('left', false)}
               className="py-4 rounded-xl bg-zinc-900 border border-zinc-800 active:bg-zinc-800 flex items-center justify-center text-zinc-300 active:scale-95 transition">
               <ArrowLeft className="w-6 h-6" />
            </button>

            <button
               onPointerDown={(e) => {
                  e.preventDefault();
                  setTouchKey('fire', true);
               }}
               onPointerUp={() => setTouchKey('fire', false)}
               onPointerLeave={() => setTouchKey('fire', false)}
               className="py-4 rounded-xl bg-lime-400/15 border border-lime-400/40 text-lime-400 active:bg-lime-400/30 flex items-center justify-center font-bold tracking-wider active:scale-95 transition">
               <Zap className="w-5 h-5 mr-1 fill-current" />
               <span>FIRE</span>
            </button>

            <button
               onPointerDown={(e) => {
                  e.preventDefault();
                  setTouchKey('right', true);
               }}
               onPointerUp={() => setTouchKey('right', false)}
               onPointerLeave={() => setTouchKey('right', false)}
               className="py-4 rounded-xl bg-zinc-900 border border-zinc-800 active:bg-zinc-800 flex items-center justify-center text-zinc-300 active:scale-95 transition">
               <ArrowRight className="w-6 h-6" />
            </button>
         </div>

         {/* Desktop keyboard hint */}
         <div className="text-xs text-zinc-500 text-center flex items-center justify-center space-x-3">
            <span>
               <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">
                  &larr;
               </kbd>{' '}
               <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">
                  &rarr;
               </kbd>{' '}
               or <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">A</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">D</kbd> Move
            </span>
            <span>&bull;</span>
            <span>
               <kbd className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">
                  SPACE
               </kbd>{' '}
               Fire Lasers
            </span>
            <span>&bull;</span>
            <span>
               <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">P</kbd> Pause
            </span>
         </div>
      </div>
   );
}

