import React, { useState, useEffect, useRef } from 'react';
import {
   Play,
   RotateCcw,
   Volume2,
   VolumeX,
   Trophy,
   Sparkles,
   Zap,
} from 'lucide-react';
import {
   CANVAS_WIDTH,
   CANVAS_HEIGHT,
   ORB_RADIUS,
   GRAVITY,
   JUMP_VELOCITY,
   PILLAR_WIDTH,
   PILLAR_GAP,
   PILLAR_SPEED,
   checkOrbCollision,
} from './neonDashLogic';
import { arcadeSounds } from '../sound';
import {
   getGameHighScore,
   saveGameHighScore,
   getArcadeSettings,
   saveArcadeSettings,
} from '../storage';
import GameControls from '../../components/games/GameControls';
import GameResult from '../../components/games/GameResult';

export default function NeonDash({ isFullscreen = false }) {
   const canvasRef = useRef(null);
   const [score, setScore] = useState(0);
   const [highScore, setHighScore] = useState(0);
   const [gameState, setGameState] = useState('idle'); // 'idle' | 'running' | 'paused' | 'gameover'
   const [soundEnabled, setSoundEnabled] = useState(true);

   const orbRef = useRef({ x: 80, y: CANVAS_HEIGHT / 2, vy: 0 });
   const pillarsRef = useRef([]); // [{ x, topHeight, passed }]
   const particlesRef = useRef([]); // Trail
   const scoreRef = useRef(0);
   const animRef = useRef(null);
   const lastPillarSpawnRef = useRef(0);
   const gameStateRef = useRef('idle');

   useEffect(() => {
      const stored = getGameHighScore('neon-dash') || {};
      setHighScore(stored.bestScore || 0);
      const settings = getArcadeSettings();
      setSoundEnabled(settings.soundEnabled ?? true);
   }, []);

   const handleToggleSound = () => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      saveArcadeSettings({ soundEnabled: next });
   };

   // Flap / Jump Action
   const jump = () => {
      if (gameStateRef.current === 'idle' || gameStateRef.current === 'gameover') {
         startGame();
         return;
      }
      if (gameStateRef.current === 'running') {
         orbRef.current.vy = JUMP_VELOCITY;
         arcadeSounds.move();

         // Add jump burst particles
         for (let i = 0; i < 4; i++) {
            particlesRef.current.push({
               x: orbRef.current.x - 8,
               y: orbRef.current.y + (Math.random() * 6 - 3),
               vx: -(Math.random() * 2 + 1),
               vy: Math.random() * 2 - 1,
               life: 1.0,
            });
         }
      }
   };

   // Start Game
   const startGame = () => {
      orbRef.current = { x: 80, y: CANVAS_HEIGHT / 2, vy: JUMP_VELOCITY };
      pillarsRef.current = [];
      particlesRef.current = [];
      scoreRef.current = 0;
      lastPillarSpawnRef.current = Date.now();

      setScore(0);
      gameStateRef.current = 'running';
      setGameState('running');
      arcadeSounds.click();
   };

   // Main Physics & Render Loop
   useEffect(() => {
      let isSubscribed = true;

      const loop = () => {
         if (!isSubscribed) return;

         const canvas = canvasRef.current;
         if (!canvas) {
            animRef.current = requestAnimationFrame(loop);
            return;
         }

         const ctx = canvas.getContext('2d');
         const orb = orbRef.current;
         const pillars = pillarsRef.current;
         const particles = particlesRef.current;

         // Background
         ctx.fillStyle = '#09090b';
         ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

         // Moving Grid Background Lines (batched into single draw call for 60-120fps)
         ctx.strokeStyle = '#18181b';
         ctx.lineWidth = 1;
         ctx.beginPath();
         const lineGap = 32;
         for (let x = 0; x < CANVAS_WIDTH; x += lineGap) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, CANVAS_HEIGHT);
         }
         for (let y = 0; y < CANVAS_HEIGHT; y += lineGap) {
            ctx.moveTo(0, y);
            ctx.lineTo(CANVAS_WIDTH, y);
         }
         ctx.stroke();

         if (gameStateRef.current === 'running') {
            // Orb Physics
            orb.vy += GRAVITY;
            orb.y += orb.vy;

            // Spawn Pillars every 1350ms
            if (Date.now() - lastPillarSpawnRef.current > 1350) {
               const minH = 40;
               const maxH = CANVAS_HEIGHT - PILLAR_GAP - minH;
               const topHeight = Math.floor(Math.random() * (maxH - minH)) + minH;
               pillars.push({
                  x: CANVAS_WIDTH,
                  topHeight,
                  passed: false,
               });
               lastPillarSpawnRef.current = Date.now();
            }

            // Update Pillars
            for (let i = pillars.length - 1; i >= 0; i--) {
               const p = pillars[i];
               p.x -= PILLAR_SPEED;

               // Score Gate pass
               if (!p.passed && p.x + PILLAR_WIDTH < orb.x) {
                  p.passed = true;
                  scoreRef.current += 1;
                  setScore(scoreRef.current);
                  arcadeSounds.match();
               }

               // Remove offscreen
               if (p.x + PILLAR_WIDTH < 0) {
                  pillars.splice(i, 1);
               }
            }

            // Collision check
            if (checkOrbCollision(orb, pillars)) {
               gameStateRef.current = 'gameover';
               setGameState('gameover');
               arcadeSounds.gameOver();

               const stored = getGameHighScore('neon-dash') || {};
               if (scoreRef.current > (stored.bestScore || 0)) {
                  setHighScore(scoreRef.current);
                  saveGameHighScore('neon-dash', { bestScore: scoreRef.current });
               }
            }
         }

         // Draw Pillars
         pillars.forEach((p) => {
            ctx.fillStyle = '#18181b';
            ctx.strokeStyle = 'rgba(218, 244, 170, 0.4)';
            ctx.lineWidth = 1.5;

            // Top pillar
            ctx.fillRect(p.x, 0, PILLAR_WIDTH, p.topHeight);
            ctx.strokeRect(p.x, 0, PILLAR_WIDTH, p.topHeight);

            // Bottom pillar
            const bottomY = p.topHeight + PILLAR_GAP;
            const bottomH = CANVAS_HEIGHT - bottomY;
            ctx.fillRect(p.x, bottomY, PILLAR_WIDTH, bottomH);
            ctx.strokeRect(p.x, bottomY, PILLAR_WIDTH, bottomH);
         });

         // Draw Orb Trail Particles
         for (let i = particles.length - 1; i >= 0; i--) {
            const pt = particles[i];
            if (gameStateRef.current === 'running') {
               pt.x += pt.vx;
               pt.y += pt.vy;
               pt.life -= 0.05;
               if (pt.life <= 0) {
                  particles.splice(i, 1);
                  continue;
               }
            }
            ctx.fillStyle = '#daf4aa';
            ctx.globalAlpha = pt.life * 0.6;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
         }

         // Draw Glowing Orb
         ctx.fillStyle = '#daf4aa';
         ctx.shadowColor = '#daf4aa';
         ctx.shadowBlur = 14;
         ctx.beginPath();
         ctx.arc(orb.x, orb.y, ORB_RADIUS, 0, Math.PI * 2);
         ctx.fill();
         ctx.shadowBlur = 0;

         animRef.current = requestAnimationFrame(loop);
      };

      animRef.current = requestAnimationFrame(loop);
      return () => {
         isSubscribed = false;
         cancelAnimationFrame(animRef.current);
      };
   }, []);

   // Keyboard jump listeners
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW'].includes(e.code) || [' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            jump();
         }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [jump]);

   const isNewBest = score > highScore && score > 0;

   return (
      <div className="flex flex-col items-center select-none">
         {/* Top Controls & Status */}
         <div className="w-full max-w-sm mb-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
               <button
                  type="button"
                  onClick={startGame}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-4 py-2 text-xs font-bold text-zinc-950 transition-colors hover:bg-[#c9ee8e]">
                  <RotateCcw size={13} />
                  <span>{gameState === 'idle' ? 'Start Dash' : 'Restart'}</span>
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
               <span className="font-mono text-zinc-300 font-bold">
                  Gates: <span className="text-[#daf4aa] font-extrabold">{score}</span>
               </span>
               {highScore > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                     <Trophy size={11} className="text-[#daf4aa]" />
                     Best: {highScore}
                  </span>
               )}
            </div>
         </div>

         {/* Canvas Arena */}
         <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl">
            <canvas
               ref={canvasRef}
               width={CANVAS_WIDTH}
               height={CANVAS_HEIGHT}
               onClick={jump}
               onTouchStart={(e) => {
                  e.preventDefault();
                  jump();
               }}
               className="max-h-[min(500px,calc(100dvh-7.5rem))] max-w-[min(400px,calc(100vw-2rem))] aspect-[400/500] rounded-xl border border-zinc-800/80 bg-[#09090b] touch-none block w-auto h-auto object-contain cursor-pointer"
            />

            {/* Overlay: Start Screen */}
            {gameState === 'idle' && (
               <div
                  onClick={startGame}
                  className="absolute inset-3 flex flex-col items-center justify-center rounded-xl bg-black/85 backdrop-blur-sm p-6 text-center cursor-pointer">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#daf4aa]/30 bg-[#daf4aa]/10 text-[#daf4aa]">
                     <Zap size={28} className="fill-current" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Neon Dash</h3>
                  <p className="mt-1.5 max-w-xs text-xs text-zinc-400 leading-relaxed">
                     Tap screen or press Spacebar to defy gravity and soar through the glowing barrier gates.
                  </p>
                  <button
                     type="button"
                     onClick={startGame}
                     className="mt-6 rounded-xl bg-[#daf4aa] px-6 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-[#daf4aa]/10 hover:scale-105 transition-transform">
                     Tap to Fly
                  </button>
               </div>
            )}

            {/* Game Over Modal */}
            {gameState === 'gameover' && (
               <div className="absolute inset-3 flex items-center justify-center rounded-xl bg-black/85 backdrop-blur-md p-4">
                  <GameResult
                     status="gameover"
                     title="Gate Collided!"
                     score={`${score} gates cleared`}
                     scoreLabel="Distance Score"
                     bestScore={highScore}
                     isNewBest={isNewBest}
                     onRestart={startGame}
                  />
               </div>
            )}
         </div>
      </div>
   );
}

