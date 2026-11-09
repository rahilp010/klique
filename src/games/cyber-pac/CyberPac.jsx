import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Volume2, VolumeX, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Ghost } from 'lucide-react';
import {
   COLS,
   ROWS,
   TILE_SIZE,
   CANVAS_WIDTH,
   CANVAS_HEIGHT,
   createInitialPacState,
   canMoveTo,
} from './pacLogic';
import { getGameHighScore, saveGameHighScore } from '../storage';
import { playTone, arcadeSounds } from '../sound';

export default function CyberPac({ isFullscreen = false }) {
   const canvasRef = useRef(null);
   const [gameState, setGameState] = useState('ready'); // ready, playing, gameover, victory
   const [score, setScore] = useState(0);
   const [lives, setLives] = useState(3);
   const [highScore, setHighScore] = useState(0);
   const [soundEnabled, setSoundEnabled] = useState(true);

   const simRef = useRef(null);
   const animRef = useRef(null);
   const highScoreRef = useRef(0);
   highScoreRef.current = highScore;

   // Load saved high score
   useEffect(() => {
      const saved = getGameHighScore('cyber-pac');
      if (saved && saved.bestScore) {
         setHighScore(saved.bestScore);
      }
   }, []);

   const playSfx = useCallback((type) => {
      if (!soundEnabled) return;
      try {
         if (type === 'chomp') {
            playTone(380, 0.04, 'sine', 0.08);
         } else if (type === 'power') {
            playTone(660, 0.1, 'triangle', 0.12);
         } else if (type === 'eatGhost') {
            playTone(880, 0.12, 'sawtooth', 0.15);
         } else if (type === 'die') {
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
      simRef.current = createInitialPacState();
      simRef.current.state = 'playing';
      setGameState('playing');
      setScore(0);
      setLives(3);
   }, []);

   // Set desired movement direction
   const setDirection = useCallback((dx, dy) => {
      const sim = simRef.current;
      if (!sim) return;
      if (sim.state === 'ready' || sim.state === 'gameover') {
         startGame();
         return;
      }
      sim.pacman.nextDirX = dx;
      sim.pacman.nextDirY = dy;
   }, [startGame]);

   // Keyboard controls
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (['ArrowUp', 'KeyW'].includes(e.code)) {
            e.preventDefault();
            setDirection(0, -1);
         } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
            e.preventDefault();
            setDirection(0, 1);
         } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
            e.preventDefault();
            setDirection(-1, 0);
         } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
            e.preventDefault();
            setDirection(1, 0);
         } else if (e.code === 'Space') {
            e.preventDefault();
            if (gameState === 'ready' || gameState === 'gameover') {
               startGame();
            }
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [gameState, startGame, setDirection]);

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
            const p = sim.pacman;

            // Try turn towards next direction
            if (canMoveTo(sim.grid, p.x + p.nextDirX * p.speed, p.y + p.nextDirY * p.speed)) {
               p.dirX = p.nextDirX;
               p.dirY = p.nextDirY;
            }

            // Move Pac-man
            if (canMoveTo(sim.grid, p.x + p.dirX * p.speed, p.y + p.dirY * p.speed)) {
               p.x += p.dirX * p.speed;
               p.y += p.dirY * p.speed;

               // Mouth chomp animation
               if (p.mouthOpening) {
                  p.mouthAngle += 0.05;
                  if (p.mouthAngle >= 0.4) p.mouthOpening = false;
               } else {
                  p.mouthAngle -= 0.05;
                  if (p.mouthAngle <= 0.05) p.mouthOpening = true;
               }
            }

            // Tunnel Wrapping (row 10)
            if (p.x < -TILE_SIZE / 2) p.x = CANVAS_WIDTH + TILE_SIZE / 2;
            else if (p.x > CANVAS_WIDTH + TILE_SIZE / 2) p.x = -TILE_SIZE / 2;

            // Eat Pellets & Power Orbs
            const col = Math.floor(p.x / TILE_SIZE);
            const row = Math.floor(p.y / TILE_SIZE);

            if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
               if (sim.grid[row][col] === 2) {
                  // Regular Pellet
                  sim.grid[row][col] = 0;
                  sim.score += 10;
                  setScore(sim.score);
                  playSfx('chomp');
               } else if (sim.grid[row][col] === 3) {
                  // Power Orb!
                  sim.grid[row][col] = 0;
                  sim.score += 50;
                  setScore(sim.score);
                  sim.frightenedTimer = 360; // ~6 seconds
                  playSfx('power');
               }
            }

            // Frightened timer countdown
            if (sim.frightenedTimer > 0) sim.frightenedTimer--;

            // Move Ghosts
            sim.ghosts.forEach((g) => {
               // Move ghost
               let nextX = g.x + g.dirX * g.speed;
               let nextY = g.y + g.dirY * g.speed;

               // Check if hit wall or at intersection
               if (!canMoveTo(sim.grid, nextX, nextY) || Math.random() < 0.02) {
                  const dirs = [
                     { dx: 1, dy: 0 },
                     { dx: -1, dy: 0 },
                     { dx: 0, dy: 1 },
                     { dx: 0, dy: -1 },
                  ].filter((d) => !(d.dx === -g.dirX && d.dy === -g.dirY)); // avoid immediate 180 flip

                  const validDirs = dirs.filter((d) =>
                     canMoveTo(sim.grid, g.x + d.dx * g.speed, g.y + d.dy * g.speed)
                  );
                  if (validDirs.length > 0) {
                     const chosen = validDirs[Math.floor(Math.random() * validDirs.length)];
                     g.dirX = chosen.dx;
                     g.dirY = chosen.dy;
                  } else {
                     g.dirX *= -1;
                     g.dirY *= -1;
                  }
               } else {
                  g.x = nextX;
                  g.y = nextY;
               }

               // Tunnel wrapping
               if (g.x < -TILE_SIZE / 2) g.x = CANVAS_WIDTH + TILE_SIZE / 2;
               else if (g.x > CANVAS_WIDTH + TILE_SIZE / 2) g.x = -TILE_SIZE / 2;

               // Pac-man vs Ghost Collision
               const dist = Math.hypot(p.x - g.x, p.y - g.y);
               if (dist < TILE_SIZE * 0.75) {
                  if (sim.frightenedTimer > 0) {
                     // Eat Ghost!
                     sim.score += 200;
                     setScore(sim.score);
                     playSfx('eatGhost');
                     // Respawn ghost at center
                     g.x = 9 * TILE_SIZE + TILE_SIZE / 2;
                     g.y = 9 * TILE_SIZE + TILE_SIZE / 2;
                  } else {
                     // Pac-man dies!
                     sim.lives--;
                     setLives(sim.lives);
                     playSfx('die');

                     if (sim.lives <= 0) {
                        sim.state = 'gameover';
                        setGameState('gameover');
                        playSfx('gameover');

                        if (sim.score > highScoreRef.current) {
                           setHighScore(sim.score);
                           saveGameHighScore('cyber-pac', { bestScore: sim.score });
                        }
                     } else {
                        // Reset positions
                        p.x = 9 * TILE_SIZE + TILE_SIZE / 2;
                        p.y = 16 * TILE_SIZE + TILE_SIZE / 2;
                        p.dirX = 0;
                        p.dirY = 0;
                        p.nextDirX = 0;
                        p.nextDirY = 0;
                     }
                  }
               }
            });

            // Check if all pellets eaten
            const remainingPellets = sim.grid.flat().filter((cell) => cell === 2 || cell === 3).length;
            if (remainingPellets === 0) {
               sim.state = 'victory';
               setGameState('victory');
               arcadeSounds.gameWin();
               if (sim.score > highScoreRef.current) {
                  setHighScore(sim.score);
                  saveGameHighScore('cyber-pac', { bestScore: sim.score });
               }
            }
         }

         // ---------------- RENDER ----------------
         ctx.fillStyle = '#09090b';
         ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

         // Render Maze Walls & Pellets
         for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
               const val = sim.grid[r][c];
               const x = c * TILE_SIZE;
               const y = r * TILE_SIZE;

               if (val === 1) {
                  // Neon Wall
                  ctx.fillStyle = '#0e2433';
                  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                  ctx.strokeStyle = '#06b6d4';
                  ctx.lineWidth = 1;
                  ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
               } else if (val === 2) {
                  // Energy Pellet
                  ctx.fillStyle = '#daf4aa';
                  ctx.shadowColor = '#daf4aa';
                  ctx.shadowBlur = 4;
                  ctx.beginPath();
                  ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.shadowBlur = 0;
               } else if (val === 3) {
                  // Power Orb
                  ctx.fillStyle = '#facc15';
                  ctx.shadowColor = '#facc15';
                  ctx.shadowBlur = 8;
                  ctx.beginPath();
                  ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 5.5, 0, Math.PI * 2);
                  ctx.fill();
                  ctx.shadowBlur = 0;
               }
            }
         }

         // Render Pac-Man
         const p = sim.pacman;
         let angleOffset = 0;
         if (p.dirX === 1) angleOffset = 0;
         else if (p.dirX === -1) angleOffset = Math.PI;
         else if (p.dirY === 1) angleOffset = Math.PI / 2;
         else if (p.dirY === -1) angleOffset = -Math.PI / 2;

         ctx.fillStyle = '#facc15';
         ctx.shadowColor = '#facc15';
         ctx.shadowBlur = 8;
         ctx.beginPath();
         ctx.arc(
            p.x,
            p.y,
            TILE_SIZE / 2 - 2,
            angleOffset + p.mouthAngle,
            angleOffset + Math.PI * 2 - p.mouthAngle
         );
         ctx.lineTo(p.x, p.y);
         ctx.fill();
         ctx.shadowBlur = 0;

         // Render Ghosts
         sim.ghosts.forEach((g) => {
            const isScared = sim.frightenedTimer > 0;
            const ghostColor = isScared
               ? sim.frightenedTimer < 100 && Math.floor(sim.frightenedTimer / 10) % 2 === 0
                  ? '#ffffff'
                  : '#3b82f6'
               : g.color;

            ctx.fillStyle = ghostColor;
            ctx.shadowColor = ghostColor;
            ctx.shadowBlur = 8;

            const gx = g.x - TILE_SIZE / 2 + 2;
            const gy = g.y - TILE_SIZE / 2 + 2;
            const gw = TILE_SIZE - 4;
            const gh = TILE_SIZE - 4;

            // Ghost Dome & Skirt
            ctx.beginPath();
            ctx.arc(gx + gw / 2, gy + gw / 2, gw / 2, Math.PI, 0, false);
            ctx.lineTo(gx + gw, gy + gh);
            ctx.lineTo(gx + (gw * 3) / 4, gy + gh - 3);
            ctx.lineTo(gx + gw / 2, gy + gh);
            ctx.lineTo(gx + gw / 4, gy + gh - 3);
            ctx.lineTo(gx, gy + gh);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;

            // Eyes
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(gx + 5, gy + 7, 2.5, 0, Math.PI * 2);
            ctx.arc(gx + gw - 5, gy + 7, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Pupils
            ctx.fillStyle = '#09090b';
            ctx.beginPath();
            ctx.arc(gx + 5 + g.dirX, gy + 7 + g.dirY, 1.2, 0, Math.PI * 2);
            ctx.arc(gx + gw - 5 + g.dirX, gy + 7 + g.dirY, 1.2, 0, Math.PI * 2);
            ctx.fill();
         });
      };

      animRef.current = requestAnimationFrame(loop);
      return () => {
         if (animRef.current) cancelAnimationFrame(animRef.current);
      };
   }, [playSfx]);

   return (
      <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-3 select-none touch-none">
         {/* Top HUD */}
         <div className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border border-zinc-800 rounded-2xl backdrop-blur-md">
            <div className="flex items-center space-x-4">
               <div>
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Score</div>
                  <div className="text-xl font-black font-mono text-yellow-400">{score}</div>
               </div>
               <div className="w-[1px] h-6 bg-zinc-800" />
               <div>
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Lives</div>
                  <div className="flex items-center space-x-1 mt-0.5">
                     {Array.from({ length: 3 }).map((_, i) => (
                        <div
                           key={i}
                           className={`w-3.5 h-3.5 rounded-full ${
                              i < lives ? 'bg-yellow-400 shadow-[0_0_6px_#facc15]' : 'bg-zinc-800 border border-zinc-700'
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
         <div className={`relative w-full max-w-[418px] ${isFullscreen ? 'max-h-[calc(100dvh-7.5rem)]' : 'max-h-[min(480px,calc(100dvh-9rem))]'} aspect-[418/462] rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b] shadow-2xl`}>
            <canvas
               ref={canvasRef}
               width={CANVAS_WIDTH}
               height={CANVAS_HEIGHT}
               className="w-full h-full block object-contain"
            />

            {/* Start Screen */}
            {gameState === 'ready' && (
               <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 mb-3 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                     <Ghost size={28} />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-1.5">Cyber Pac</h2>
                  <p className="text-xs text-zinc-400 max-w-xs mb-5">
                     Chomp energy pellets through the neon maze and turn ghosts vulnerable with yellow power orbs!
                  </p>
                  <button
                     type="button"
                     onClick={startGame}
                     className="px-6 py-2.5 rounded-xl font-bold bg-[#daf4aa] text-zinc-950 hover:bg-[#c9ee8e] transition-all shadow-lg shadow-[#daf4aa]/20 flex items-center gap-2">
                     <Play size={14} className="fill-current" />
                     <span>Start Pac-Maze</span>
                  </button>
               </div>
            )}

            {/* Victory Screen */}
            {gameState === 'victory' && (
               <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <h3 className="text-2xl font-black text-[#daf4aa] mb-1">Maze Cleared!</h3>
                  <p className="text-xs text-zinc-300 mb-4">All cyber pellets collected</p>
                  <button
                     type="button"
                     onClick={startGame}
                     className="px-6 py-2.5 rounded-xl font-bold bg-[#daf4aa] text-zinc-950 hover:bg-[#c9ee8e] transition-all shadow-lg shadow-[#daf4aa]/20 flex items-center gap-2">
                     <RotateCcw size={14} />
                     <span>Play Again</span>
                  </button>
               </div>
            )}

            {/* Game Over Screen */}
            {gameState === 'gameover' && (
               <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-2xl font-black text-white mb-1">Cyber Pac Captured</h3>
                  <p className="text-xs text-zinc-400 mb-4">Ghost interception depleted all lives</p>
                  <button
                     type="button"
                     onClick={startGame}
                     className="px-6 py-2.5 rounded-xl font-bold bg-[#daf4aa] text-zinc-950 hover:bg-[#c9ee8e] transition-all shadow-lg shadow-[#daf4aa]/20 flex items-center gap-2">
                     <RotateCcw size={14} />
                     <span>Try Again</span>
                  </button>
               </div>
            )}
         </div>

         {/* Mobile Directional Pad */}
         <div className="flex flex-col items-center gap-1.5 pt-1">
            <button
               onPointerDown={(e) => {
                  e.preventDefault();
                  setDirection(0, -1);
               }}
               className="w-12 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 active:bg-yellow-400 active:text-zinc-950 active:scale-95 transition-all shadow-md">
               <ArrowUp size={18} />
            </button>
            <div className="flex items-center gap-2">
               <button
                  onPointerDown={(e) => {
                  e.preventDefault();
                  setDirection(-1, 0);
               }}
                  className="w-12 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 active:bg-yellow-400 active:text-zinc-950 active:scale-95 transition-all shadow-md">
                  <ArrowLeft size={18} />
               </button>
               <button
                  onPointerDown={(e) => {
                  e.preventDefault();
                  setDirection(0, 1);
               }}
                  className="w-12 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 active:bg-yellow-400 active:text-zinc-950 active:scale-95 transition-all shadow-md">
                  <ArrowDown size={18} />
               </button>
               <button
                  onPointerDown={(e) => {
                  e.preventDefault();
                  setDirection(1, 0);
               }}
                  className="w-12 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 active:bg-yellow-400 active:text-zinc-950 active:scale-95 transition-all shadow-md">
                  <ArrowRight size={18} />
               </button>
            </div>
         </div>

         {/* Controls Hint */}
         <div className="text-xs text-zinc-500 text-center">
            Use <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">Arrow Keys</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">WASD</kbd> to steer Cyber Pac
         </div>
      </div>
   );
}

