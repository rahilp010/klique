import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Volume2, VolumeX, Sparkles, Layers } from 'lucide-react';
import {
   CANVAS_WIDTH,
   CANVAS_HEIGHT,
   BLOCK_HEIGHT,
   PALETTES,
   getFloorColor,
   createInitialTowerState,
} from './stackerLogic';
import { getGameHighScore, saveGameHighScore } from '../storage';
import { playTone, arcadeSounds } from '../sound';

export default function TowerStacker({ isFullscreen = false }) {
   const canvasRef = useRef(null);
   const [gameState, setGameState] = useState('ready'); // ready, playing, gameover
   const [score, setScore] = useState(0);
   const [combo, setCombo] = useState(0);
   const [highScore, setHighScore] = useState(0);
   const [soundEnabled, setSoundEnabled] = useState(true);

   const simRef = useRef(null);
   const animRef = useRef(null);
   const highScoreRef = useRef(0);
   highScoreRef.current = highScore;

   // Load saved high score
   useEffect(() => {
      const saved = getGameHighScore('tower-stacker');
      if (saved && saved.bestFloors) {
         setHighScore(saved.bestFloors);
      }
   }, []);

   const playChime = useCallback((comboCount) => {
      if (!soundEnabled) return;
      try {
         // Ascending Pentatonic scale based on combo
         const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
         const freq = scale[Math.min(comboCount, scale.length - 1)];
         playTone(freq, 0.12, 'sine', 0.12);
      } catch (e) {
         // Ignore
      }
   }, [soundEnabled]);

   // Start fresh game
   const startGame = useCallback(() => {
      simRef.current = createInitialTowerState();
      simRef.current.state = 'playing';
      setGameState('playing');
      setScore(0);
      setCombo(0);
   }, []);

   // Handle slab placement (tap or space)
   const placeBlock = useCallback(() => {
      const sim = simRef.current;
      if (!sim) return;

      if (sim.state === 'ready') {
         startGame();
         return;
      }
      if (sim.state === 'gameover') {
         startGame();
         return;
      }
      if (sim.state !== 'playing') return;

      const active = sim.activeBlock;
      const topFloor = sim.tower[sim.tower.length - 1];
      const diff = active.x - topFloor.x;
      const absDiff = Math.abs(diff);

      // Miss completely?
      if (absDiff >= topFloor.width) {
         // Falling whole block
         sim.fallingSlices.push({
            x: active.x,
            y: active.y,
            width: active.width,
            height: active.height,
            color: active.color,
            vy: 2,
            rot: 0,
            vRot: (Math.random() - 0.5) * 0.1,
         });
         sim.state = 'gameover';
         setGameState('gameover');
         arcadeSounds.gameOver();

         if (sim.score > highScoreRef.current) {
            setHighScore(sim.score);
            saveGameHighScore('tower-stacker', { bestFloors: sim.score });
         }
         return;
      }

      // Check if Perfect Drop (< 3.5px difference)
      const isPerfect = absDiff <= 3.5;
      let newWidth = topFloor.width - (isPerfect ? 0 : absDiff);
      let newX = isPerfect ? topFloor.x : (diff > 0 ? active.x : topFloor.x);

      // Perfect combo rewards
      let nextCombo = isPerfect ? sim.combo + 1 : 0;
      sim.combo = nextCombo;
      setCombo(nextCombo);

      // Expand slab slightly if 3+ perfect drops in a row!
      if (nextCombo >= 3 && newWidth < 220) {
         newWidth = Math.min(220, newWidth + 8);
         newX = Math.max(10, newX - 4);
      }

      // Add placed slab to tower
      const placedSlab = {
         x: newX,
         y: active.y,
         width: newWidth,
         height: BLOCK_HEIGHT,
         color: active.color,
         floor: sim.tower.length + 1,
      };
      sim.tower.push(placedSlab);

      // Spawn slice that falls off (if not perfect)
      if (!isPerfect) {
         const sliceX = diff > 0 ? newX + newWidth : active.x;
         const sliceW = absDiff;
         sim.fallingSlices.push({
            x: sliceX,
            y: active.y,
            width: sliceW,
            height: BLOCK_HEIGHT,
            color: active.color,
            vy: 2.2,
            rot: 0,
            vRot: (diff > 0 ? 1 : -1) * 0.08,
         });
         playChime(0);
      } else {
         // Perfect particles burst
         playChime(nextCombo);
         for (let i = 0; i < 18; i++) {
            sim.particles.push({
               x: newX + Math.random() * newWidth,
               y: active.y + BLOCK_HEIGHT / 2,
               vx: (Math.random() - 0.5) * 5,
               vy: (Math.random() - 0.5) * 5,
               color: '#daf4aa',
               size: Math.random() * 3 + 1,
               life: 1.0,
            });
         }
      }

      // Update Score
      const newScore = sim.tower.length - 1;
      sim.score = newScore;
      setScore(newScore);

      // Move Camera up if tower reaches upper half
      const targetCameraY = Math.max(0, (sim.tower.length - 8) * BLOCK_HEIGHT);
      sim.targetCameraY = targetCameraY;

      // Spawn next active moving block
      const nextFloorIndex = sim.tower.length;
      const speed = Math.min(3.8 + nextFloorIndex * 0.1, 7.5);
      const startLeft = nextFloorIndex % 2 === 0;

      sim.activeBlock = {
         x: startLeft ? -newWidth : CANVAS_WIDTH,
         y: placedSlab.y - BLOCK_HEIGHT,
         width: newWidth,
         height: BLOCK_HEIGHT,
         speed: speed * (startLeft ? 1 : -1),
         dir: startLeft ? 1 : -1,
         color: getFloorColor(nextFloorIndex),
         floor: nextFloorIndex + 1,
      };
   }, [startGame, playChime]);

   // Keyboard controls
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (['Space', 'Enter', 'ArrowUp', 'KeyW'].includes(e.code) || e.key === ' ') {
            e.preventDefault();
            placeBlock();
         }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [placeBlock]);

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

         // Update Simulation
         if (sim.state === 'playing') {
            // Smooth Camera Interpolation
            if (sim.targetCameraY !== undefined) {
               sim.cameraY += (sim.targetCameraY - sim.cameraY) * 0.1;
            }

            // Move Active Block
            const active = sim.activeBlock;
            active.x += active.speed;
            if (active.speed > 0 && active.x + active.width >= CANVAS_WIDTH + 40) {
               active.speed *= -1;
            } else if (active.speed < 0 && active.x <= -40) {
               active.speed *= -1;
            }

            // Update Falling Slices
            for (let i = sim.fallingSlices.length - 1; i >= 0; i--) {
               const s = sim.fallingSlices[i];
               s.y += s.vy;
               s.vy += 0.35; // Gravity
               s.rot += s.vRot;
               if (s.y > CANVAS_HEIGHT + sim.cameraY + 50) {
                  sim.fallingSlices.splice(i, 1);
               }
            }

            // Update Particles
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

         ctx.save();
         // Apply Camera Scroll
         ctx.translate(0, sim.cameraY);

         // 1. Draw Tower Slabs
         sim.tower.forEach((slab) => {
            ctx.fillStyle = slab.color;
            ctx.shadowColor = slab.color;
            ctx.shadowBlur = 6;
            ctx.fillRect(slab.x, slab.y, slab.width, slab.height);

            // Subtle highlight line on top
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.fillRect(slab.x, slab.y, slab.width, 2);
         });
         ctx.shadowBlur = 0;

         // 2. Draw Falling Slices
         sim.fallingSlices.forEach((s) => {
            ctx.save();
            ctx.translate(s.x + s.width / 2, s.y + s.height / 2);
            ctx.rotate(s.rot);
            ctx.fillStyle = s.color;
            ctx.globalAlpha = 0.85;
            ctx.fillRect(-s.width / 2, -s.height / 2, s.width, s.height);
            ctx.restore();
         });

         // 3. Draw Active Moving Block
         if (sim.state === 'playing') {
            const ab = sim.activeBlock;
            ctx.fillStyle = ab.color;
            ctx.shadowColor = ab.color;
            ctx.shadowBlur = 12;
            ctx.fillRect(ab.x, ab.y, ab.width, ab.height);
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.fillRect(ab.x, ab.y, ab.width, 3);
         }

         // 4. Draw Particles
         sim.particles.forEach((p) => {
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
         });
         ctx.globalAlpha = 1.0;

         ctx.restore();
      };

      animRef.current = requestAnimationFrame(loop);
      return () => {
         if (animRef.current) cancelAnimationFrame(animRef.current);
      };
   }, []);

   return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-3 select-none touch-none">
         {/* Top HUD */}
         <div className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-md">
            <div className="flex items-center space-x-4">
               <div>
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Floor</div>
                  <div className="text-xl font-black font-mono text-cyan-400">{score}</div>
               </div>
               {combo > 1 && (
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-400 animate-pulse">
                     <Sparkles size={13} />
                     <span>{combo}x Perfect</span>
                  </div>
               )}
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

         {/* Canvas Area with Tap to Drop */}
         <div
            onClick={placeBlock}
            className={`relative w-full max-w-[400px] ${isFullscreen ? 'max-h-[calc(100dvh-7.5rem)]' : 'max-h-[min(520px,calc(100dvh-9rem))]'} aspect-[400/560] rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b] shadow-2xl cursor-pointer`}>
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
                     <Layers size={28} />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-1.5">Tower Stacker</h2>
                  <p className="text-xs text-zinc-400 max-w-xs mb-5">
                     Tap or press Spacebar at the exact right moment to stack moving slabs. Perfect drops expand your tower!
                  </p>
                  <button
                     type="button"
                     onClick={(e) => {
                        e.stopPropagation();
                        startGame();
                     }}
                     className="px-6 py-2.5 rounded-xl font-bold bg-cyan-400 text-zinc-950 hover:bg-cyan-300 transition-all shadow-lg shadow-cyan-400/20 flex items-center gap-2">
                     <Play size={14} className="fill-current" />
                     <span>Start Stacking</span>
                  </button>
               </div>
            )}

            {/* Game Over Screen */}
            {gameState === 'gameover' && (
               <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-2xl font-black text-white mb-1">Tower Collapsed</h3>
                  <p className="text-xs text-zinc-400 mb-4">Slab missed the foundation</p>

                  <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-5">
                     <div className="text-center">
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">Floors</div>
                        <div className="text-2xl font-black font-mono text-cyan-400">{score}</div>
                     </div>
                     <div className="w-[1px] h-8 bg-zinc-800" />
                     <div className="text-center">
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">High Score</div>
                        <div className="text-2xl font-black font-mono text-amber-400">{highScore}</div>
                     </div>
                  </div>

                  <button
                     type="button"
                     onClick={(e) => {
                        e.stopPropagation();
                        startGame();
                     }}
                     className="px-6 py-2.5 rounded-xl font-bold bg-[#daf4aa] text-zinc-950 hover:bg-[#c9ee8e] transition-all shadow-lg shadow-[#daf4aa]/20 flex items-center gap-2">
                     <RotateCcw size={14} />
                     <span>Build Again</span>
                  </button>
               </div>
            )}
         </div>

         {/* Controls Hint */}
         <div className="text-xs text-zinc-500 text-center">
            Tap screen anywhere or press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">SPACE</kbd> to place slab
         </div>
      </div>
   );
}

