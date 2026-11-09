import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Trophy, Volume2, VolumeX, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import {
   CANVAS_WIDTH,
   CANVAS_HEIGHT,
   ROW_HEIGHT,
   ROW_TYPES,
   createRow,
   createInitialHopperState,
} from './hopperLogic';
import { getGameHighScore, saveGameHighScore } from '../storage';
import { playTone, arcadeSounds } from '../sound';

export default function NeonHopper({ isFullscreen = false }) {
   const canvasRef = useRef(null);
   const [gameState, setGameState] = useState('ready'); // ready, playing, gameover
   const [score, setScore] = useState(0);
   const [highScore, setHighScore] = useState(0);
   const [soundEnabled, setSoundEnabled] = useState(true);

   const simRef = useRef(null);
   const animRef = useRef(null);
   const highScoreRef = useRef(0);
   highScoreRef.current = highScore;

   // Load saved high score
   useEffect(() => {
      const saved = getGameHighScore('neon-hopper');
      if (saved && saved.bestScore) {
         setHighScore(saved.bestScore);
      }
   }, []);

   const playSfx = useCallback((type) => {
      if (!soundEnabled) return;
      try {
         if (type === 'hop') {
            playTone(480, 0.05, 'sine', 0.1);
         } else if (type === 'splash') {
            playTone(180, 0.12, 'sawtooth', 0.12);
         } else if (type === 'crash') {
            arcadeSounds.gameOver();
         }
      } catch (e) {
         // Ignore
      }
   }, [soundEnabled]);

   // Start fresh game
   const startGame = useCallback(() => {
      simRef.current = createInitialHopperState();
      simRef.current.state = 'playing';
      setGameState('playing');
      setScore(0);
   }, []);

   // Move Hopper in 4 directions
   const moveHopper = useCallback((dir) => {
      const sim = simRef.current;
      if (!sim) return;

      if (sim.state === 'ready' || sim.state === 'gameover') {
         startGame();
         return;
      }
      if (sim.state !== 'playing') return;

      const h = sim.hopper;
      const stepX = 32;

      if (dir === 'up') {
         h.row += 1;
         playSfx('hop');
         if (h.row > sim.maxRow) {
            sim.maxRow = h.row;
            sim.score = h.row;
            setScore(h.row);

            // Dynamically generate further rows
            while (sim.rows.length <= h.row + 15) {
               sim.rows.push(createRow(sim.rows.length));
            }
         }
      } else if (dir === 'down') {
         h.row = Math.max(0, h.row - 1);
         playSfx('hop');
      } else if (dir === 'left') {
         h.x = Math.max(10, h.x - stepX);
         playSfx('hop');
      } else if (dir === 'right') {
         h.x = Math.min(CANVAS_WIDTH - h.width - 10, h.x + stepX);
         playSfx('hop');
      }
   }, [startGame, playSfx]);

   // Keyboard controls
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (['ArrowUp', 'KeyW'].includes(e.code)) {
            e.preventDefault();
            moveHopper('up');
         } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
            e.preventDefault();
            moveHopper('down');
         } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
            e.preventDefault();
            moveHopper('left');
         } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
            e.preventDefault();
            moveHopper('right');
         } else if (e.code === 'Space') {
            e.preventDefault();
            if (gameState === 'ready' || gameState === 'gameover') {
               startGame();
            } else {
               moveHopper('up');
            }
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [gameState, startGame, moveHopper]);

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
            // Smooth Camera Scroll targeting hopper
            const targetCamY = sim.hopper.row * ROW_HEIGHT - CANVAS_HEIGHT / 2 + 100;
            sim.cameraY += (Math.max(0, targetCamY) - sim.cameraY) * 0.1;

            const h = sim.hopper;
            const currentRow = sim.rows[h.row];

            // Move road vehicles and river logs
            sim.rows.forEach((row) => {
               if (row.items && row.speed) {
                  row.items.forEach((item) => {
                     item.x += row.speed;
                     if (row.speed > 0 && item.x > CANVAS_WIDTH + 50) {
                        item.x = -item.width - 20;
                     } else if (row.speed < 0 && item.x + item.width < -50) {
                        item.x = CANVAS_WIDTH + 20;
                     }
                  });
               }
            });

            // Check Row Collisions
            if (currentRow) {
               if (currentRow.type === ROW_TYPES.ROAD) {
                  // Hit by car?
                  for (const car of currentRow.items) {
                     if (h.x + h.width > car.x && h.x < car.x + car.width) {
                        sim.state = 'gameover';
                        setGameState('gameover');
                        playSfx('crash');

                        if (sim.score > highScoreRef.current) {
                           setHighScore(sim.score);
                           saveGameHighScore('neon-hopper', { bestScore: sim.score });
                        }
                        break;
                     }
                  }
               } else if (currentRow.type === ROW_TYPES.RIVER) {
                  // Must be on log
                  let onLog = false;
                  for (const log of currentRow.items) {
                     if (h.x + h.width > log.x + 4 && h.x < log.x + log.width - 4) {
                        onLog = true;
                        h.x += currentRow.speed; // Ride the log!
                        break;
                     }
                  }

                  // Offscreen or drowned
                  if (!onLog || h.x < -10 || h.x > CANVAS_WIDTH + 10) {
                     sim.state = 'gameover';
                     setGameState('gameover');
                     playSfx('splash');

                     if (sim.score > highScoreRef.current) {
                        setHighScore(sim.score);
                        saveGameHighScore('neon-hopper', { bestScore: sim.score });
                     }
                  }
               }
            }
         }

         // ---------------- RENDER ----------------
         ctx.fillStyle = '#09090b';
         ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

         ctx.save();
         // Camera transform
         ctx.translate(0, sim.cameraY);

         // Render Rows
         sim.rows.forEach((row) => {
            const rowY = CANVAS_HEIGHT - (row.index + 1) * ROW_HEIGHT;

            // Only draw visible rows
            if (rowY + sim.cameraY < -ROW_HEIGHT || rowY + sim.cameraY > CANVAS_HEIGHT + ROW_HEIGHT) {
               return;
            }

            if (row.type === ROW_TYPES.GRASS) {
               ctx.fillStyle = '#141416';
               ctx.fillRect(0, rowY, CANVAS_WIDTH, ROW_HEIGHT);
               ctx.strokeStyle = '#27272a';
               ctx.lineWidth = 1;
               ctx.strokeRect(0, rowY, CANVAS_WIDTH, ROW_HEIGHT);
            } else if (row.type === ROW_TYPES.ROAD) {
               ctx.fillStyle = '#09090b';
               ctx.fillRect(0, rowY, CANVAS_WIDTH, ROW_HEIGHT);
               // Dashed lane line
               ctx.strokeStyle = '#27272a';
               ctx.setLineDash([12, 12]);
               ctx.beginPath();
               ctx.moveTo(0, rowY + ROW_HEIGHT / 2);
               ctx.lineTo(CANVAS_WIDTH, rowY + ROW_HEIGHT / 2);
               ctx.stroke();
               ctx.setLineDash([]);

               // Draw Cars
               row.items.forEach((car) => {
                  ctx.fillStyle = car.color;
                  ctx.shadowColor = car.color;
                  ctx.shadowBlur = 8;
                  ctx.beginPath();
                  ctx.roundRect(car.x, rowY + 8, car.width, ROW_HEIGHT - 16, 4);
                  ctx.fill();
                  ctx.shadowBlur = 0;
               });
            } else if (row.type === ROW_TYPES.RIVER) {
               ctx.fillStyle = '#0c2233';
               ctx.fillRect(0, rowY, CANVAS_WIDTH, ROW_HEIGHT);

               // Draw Logs
               row.items.forEach((log) => {
                  ctx.fillStyle = '#38bdf8';
                  ctx.shadowColor = '#38bdf8';
                  ctx.shadowBlur = 6;
                  ctx.beginPath();
                  ctx.roundRect(log.x, rowY + 6, log.width, ROW_HEIGHT - 12, 6);
                  ctx.fill();
                  ctx.shadowBlur = 0;
               });
            }
         });

         // Render Hopper (Green Neon Cube)
         const h = sim.hopper;
         const hopperY = CANVAS_HEIGHT - (h.row + 1) * ROW_HEIGHT + (ROW_HEIGHT - h.height) / 2;

         ctx.fillStyle = '#daf4aa';
         ctx.shadowColor = '#daf4aa';
         ctx.shadowBlur = 12;
         ctx.beginPath();
         ctx.roundRect(h.x, hopperY, h.width, h.height, 6);
         ctx.fill();
         ctx.shadowBlur = 0;

         // Eyes
         ctx.fillStyle = '#09090b';
         ctx.fillRect(h.x + 6, hopperY + 6, 4, 4);
         ctx.fillRect(h.x + h.width - 10, hopperY + 6, 4, 4);

         ctx.restore();
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
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Hops</div>
                  <div className="text-xl font-black font-mono text-[#daf4aa]">{score}</div>
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
            onClick={() => moveHopper('up')}
            className={`relative w-full max-w-[440px] ${isFullscreen ? 'max-h-[calc(100dvh-7.5rem)]' : 'max-h-[min(520px,calc(100dvh-9rem))]'} aspect-[440/560] rounded-2xl overflow-hidden border border-zinc-800 bg-[#09090b] shadow-2xl cursor-pointer`}>
            <canvas
               ref={canvasRef}
               width={CANVAS_WIDTH}
               height={CANVAS_HEIGHT}
               className="w-full h-full block object-contain"
            />

            {/* Start Screen */}
            {gameState === 'ready' && (
               <div className="absolute inset-0 bg-zinc-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-3 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
                     <Sparkles size={28} />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-1.5">Neon Hopper</h2>
                  <p className="text-xs text-zinc-400 max-w-xs mb-5">
                     Hop across speeding cyber highways and ride floating river logs to explore infinite distances!
                  </p>
                  <button
                     type="button"
                     onClick={(e) => {
                        e.stopPropagation();
                        startGame();
                     }}
                     className="px-6 py-2.5 rounded-xl font-bold bg-[#daf4aa] text-zinc-950 hover:bg-[#c9ee8e] transition-all shadow-lg shadow-[#daf4aa]/20 flex items-center gap-2">
                     <Play size={14} className="fill-current" />
                     <span>Start Hopping</span>
                  </button>
               </div>
            )}

            {/* Game Over Screen */}
            {gameState === 'gameover' && (
               <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-2xl font-black text-white mb-1">Route Terminated</h3>
                  <p className="text-xs text-zinc-400 mb-4">Traffic collision or river hazard detected</p>

                  <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-3 mb-5">
                     <div className="text-center">
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">Distance</div>
                        <div className="text-2xl font-black font-mono text-[#daf4aa]">{score}</div>
                     </div>
                     <div className="w-[1px] h-8 bg-zinc-800" />
                     <div className="text-center">
                        <div className="text-[10px] text-zinc-400 uppercase font-mono">Record</div>
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
                     <span>Hop Again</span>
                  </button>
               </div>
            )}
         </div>

         {/* Mobile On-Screen D-Pad */}
         <div className="flex flex-col items-center gap-1.5 pt-1">
            <button
               onPointerDown={(e) => {
                  e.preventDefault();
                  moveHopper('up');
               }}
               className="w-12 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 active:bg-[#daf4aa] active:text-zinc-950 active:scale-95 transition-all shadow-md">
               <ArrowUp size={18} />
            </button>
            <div className="flex items-center gap-2">
               <button
                  onPointerDown={(e) => {
                     e.preventDefault();
                     moveHopper('left');
                  }}
                  className="w-12 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 active:bg-[#daf4aa] active:text-zinc-950 active:scale-95 transition-all shadow-md">
                  <ArrowLeft size={18} />
               </button>
               <button
                  onPointerDown={(e) => {
                     e.preventDefault();
                     moveHopper('down');
                  }}
                  className="w-12 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 active:bg-[#daf4aa] active:text-zinc-950 active:scale-95 transition-all shadow-md">
                  <ArrowDown size={18} />
               </button>
               <button
                  onPointerDown={(e) => {
                     e.preventDefault();
                     moveHopper('right');
                  }}
                  className="w-12 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 active:bg-[#daf4aa] active:text-zinc-950 active:scale-95 transition-all shadow-md">
                  <ArrowRight size={18} />
               </button>
            </div>
         </div>

         {/* Controls Hint */}
         <div className="text-xs text-zinc-500 text-center">
            Tap arena or use <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">Arrow Keys</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">WASD</kbd> to hop
         </div>
      </div>
   );
}

