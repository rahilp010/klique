import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
   Play,
   RotateCcw,
   Volume2,
   VolumeX,
   Trophy,
   Heart,
   Sparkles,
} from 'lucide-react';
import {
   CANVAS_WIDTH,
   CANVAS_HEIGHT,
   PADDLE_WIDTH,
   PADDLE_HEIGHT,
   BALL_RADIUS,
   createBricks,
} from './brickBreakerLogic';
import { arcadeSounds } from '../sound';
import {
   getGameHighScore,
   saveGameHighScore,
   getArcadeSettings,
   saveArcadeSettings,
} from '../storage';
import GameControls from '../../components/games/GameControls';
import GameResult from '../../components/games/GameResult';

export default function BrickBreaker({ isFullscreen = false }) {
   const canvasRef = useRef(null);
   const [score, setScore] = useState(0);
   const [highScore, setHighScore] = useState(0);
   const [lives, setLives] = useState(3);
   const [gameState, setGameState] = useState('idle'); // 'idle' | 'running' | 'paused' | 'won' | 'gameover'
   const [soundEnabled, setSoundEnabled] = useState(true);

   // Game Physics Refs
   const paddleRef = useRef({
      x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
      width: PADDLE_WIDTH,
   });
   const ballsRef = useRef([
      {
         x: CANVAS_WIDTH / 2,
         y: CANVAS_HEIGHT - 40,
         vx: 3,
         vy: -3.8,
      },
   ]);
   const bricksRef = useRef(createBricks());
   const particlesRef = useRef([]); // [{ x, y, vx, vy, color, life }]
   const powerupsRef = useRef([]); // [{ x, y, type: 'wide'|'multi', vy }]
   const scoreRef = useRef(0);
   const livesRef = useRef(3);
   const animRef = useRef(null);
   const gameStateRef = useRef('idle');

   // Load high score
   useEffect(() => {
      const stored = getGameHighScore('brick-breaker') || {};
      setHighScore(stored.bestScore || 0);
      const settings = getArcadeSettings();
      setSoundEnabled(settings.soundEnabled ?? true);
   }, []);

   const handleToggleSound = () => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      saveArcadeSettings({ soundEnabled: next });
   };

   const addParticles = (x, y, color) => {
      for (let i = 0; i < 10; i++) {
         const angle = Math.random() * Math.PI * 2;
         const spd = Math.random() * 3 + 1;
         particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            color,
            life: 1.0,
            decay: Math.random() * 0.05 + 0.04,
         });
      }
   };

   // Reset Game
   const resetGame = () => {
      paddleRef.current = {
         x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
         width: PADDLE_WIDTH,
      };
      ballsRef.current = [
         {
            x: CANVAS_WIDTH / 2,
            y: CANVAS_HEIGHT - 40,
            vx: (Math.random() > 0.5 ? 1 : -1) * 3,
            vy: -3.8,
         },
      ];
      bricksRef.current = createBricks();
      particlesRef.current = [];
      powerupsRef.current = [];
      scoreRef.current = 0;
      livesRef.current = 3;

      setScore(0);
      setLives(3);
      gameStateRef.current = 'running';
      setGameState('running');
      arcadeSounds.click();
   };

   const pauseGame = () => {
      if (gameStateRef.current === 'running') {
         gameStateRef.current = 'paused';
         setGameState('paused');
      }
   };

   const resumeGame = () => {
      if (gameStateRef.current === 'paused') {
         gameStateRef.current = 'running';
         setGameState('running');
      }
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
         const paddle = paddleRef.current;
         const bricks = bricksRef.current;
         const balls = ballsRef.current;
         const particles = particlesRef.current;
         const powerups = powerupsRef.current;

         // Clear canvas
         ctx.fillStyle = '#09090b';
         ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

         // Render Bricks
         let activeBricks = 0;
         bricks.forEach((b) => {
            if (b.status === 1) {
               activeBricks++;
               ctx.fillStyle = b.color;
               ctx.shadowColor = b.color;
               ctx.shadowBlur = 6;
               ctx.beginPath();
               ctx.roundRect(b.x, b.y, b.width, b.height, 3);
               ctx.fill();
               ctx.shadowBlur = 0;
            }
         });

         // Check Win condition
         if (activeBricks === 0 && gameStateRef.current === 'running') {
            gameStateRef.current = 'won';
            setGameState('won');
            arcadeSounds.win();
            const stored = getGameHighScore('brick-breaker') || {};
            if (scoreRef.current > (stored.bestScore || 0)) {
               setHighScore(scoreRef.current);
               saveGameHighScore('brick-breaker', { bestScore: scoreRef.current });
            }
         }

         // Render Paddle
         ctx.fillStyle = '#daf4aa';
         ctx.shadowColor = '#daf4aa';
         ctx.shadowBlur = 10;
         ctx.beginPath();
         ctx.roundRect(
            paddle.x,
            CANVAS_HEIGHT - 20,
            paddle.width,
            PADDLE_HEIGHT,
            5
         );
         ctx.fill();
         ctx.shadowBlur = 0;

         // Update & Render Balls
         if (gameStateRef.current === 'running') {
            for (let i = balls.length - 1; i >= 0; i--) {
               const ball = balls[i];
               ball.x += ball.vx;
               ball.y += ball.vy;

               // Wall Collisions
               if (ball.x - BALL_RADIUS <= 0 || ball.x + BALL_RADIUS >= CANVAS_WIDTH) {
                  ball.vx = -ball.vx;
                  arcadeSounds.move();
               }
               if (ball.y - BALL_RADIUS <= 0) {
                  ball.vy = -ball.vy;
                  arcadeSounds.move();
               }

               // Paddle Collision
               if (
                  ball.y + BALL_RADIUS >= CANVAS_HEIGHT - 20 &&
                  ball.y - BALL_RADIUS <= CANVAS_HEIGHT - 20 + PADDLE_HEIGHT &&
                  ball.x >= paddle.x &&
                  ball.x <= paddle.x + paddle.width
               ) {
                  arcadeSounds.move();
                  // Deflection angle based on where it hit paddle
                  const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
                  const maxBounceAngle = Math.PI / 3;
                  const bounceAngle = hitPoint * maxBounceAngle;
                  const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);

                  ball.vx = speed * Math.sin(bounceAngle);
                  ball.vy = -Math.abs(speed * Math.cos(bounceAngle));
               }

               // Brick Collisions
               for (const b of bricks) {
                  if (b.status === 1) {
                     if (
                        ball.x + BALL_RADIUS >= b.x &&
                        ball.x - BALL_RADIUS <= b.x + b.width &&
                        ball.y + BALL_RADIUS >= b.y &&
                        ball.y - BALL_RADIUS <= b.y + b.height
                     ) {
                        b.status = 0;
                        ball.vy = -ball.vy;
                        arcadeSounds.eat();
                        addParticles(b.x + b.width / 2, b.y + b.height / 2, b.color);

                        const added = b.points;
                        scoreRef.current += added;
                        setScore(scoreRef.current);

                        // Random powerup spawn (15% chance)
                        if (Math.random() < 0.15) {
                           powerups.push({
                              x: b.x + b.width / 2,
                              y: b.y + b.height / 2,
                              type: Math.random() > 0.5 ? 'wide' : 'multi',
                              vy: 2.2,
                           });
                        }
                        break;
                     }
                  }
               }

               // Ball Fell Out
               if (ball.y - BALL_RADIUS > CANVAS_HEIGHT) {
                  balls.splice(i, 1);
               }
            }

            // If all balls lost
            if (balls.length === 0) {
               livesRef.current -= 1;
               setLives(livesRef.current);
               arcadeSounds.wrong();

               if (livesRef.current <= 0) {
                  gameStateRef.current = 'gameover';
                  setGameState('gameover');
                  arcadeSounds.gameOver();

                  const stored = getGameHighScore('brick-breaker') || {};
                  if (scoreRef.current > (stored.bestScore || 0)) {
                     setHighScore(scoreRef.current);
                     saveGameHighScore('brick-breaker', { bestScore: scoreRef.current });
                  }
               } else {
                  // Respawn ball
                  ballsRef.current = [
                     {
                        x: paddle.x + paddle.width / 2,
                        y: CANVAS_HEIGHT - 40,
                        vx: 3,
                        vy: -3.8,
                     },
                  ];
               }
            }
         }

         // Draw Balls
         balls.forEach((b) => {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(b.x, b.y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
         });

         // Update & Draw Powerups
         for (let i = powerups.length - 1; i >= 0; i--) {
            const p = powerups[i];
            if (gameStateRef.current === 'running') {
               p.y += p.vy;

               // Caught by paddle
               if (
                  p.y >= CANVAS_HEIGHT - 20 &&
                  p.y <= CANVAS_HEIGHT &&
                  p.x >= paddle.x &&
                  p.x <= paddle.x + paddle.width
               ) {
                  arcadeSounds.match();
                  if (p.type === 'wide') {
                     paddle.width = Math.min(paddle.width + 24, 140);
                  } else if (p.type === 'multi') {
                     balls.push({
                        x: paddle.x + paddle.width / 2,
                        y: CANVAS_HEIGHT - 35,
                        vx: -3,
                        vy: -3.8,
                     });
                  }
                  powerups.splice(i, 1);
                  continue;
               }

               if (p.y > CANVAS_HEIGHT) {
                  powerups.splice(i, 1);
                  continue;
               }
            }

            ctx.fillStyle = p.type === 'wide' ? '#38bdf8' : '#facc15';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
            ctx.fill();
         }

         // Update & Draw Particles
         for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) {
               particles.splice(i, 1);
               continue;
            }

            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
         }

         animRef.current = requestAnimationFrame(loop);
      };

      animRef.current = requestAnimationFrame(loop);
      return () => {
         isSubscribed = false;
         cancelAnimationFrame(animRef.current);
      };
   }, []);

   // Mouse / Touch paddle mover
   const handlePointerMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const relativeX = clientX - rect.left;
      const scaleX = CANVAS_WIDTH / rect.width;
      const targetPaddleX = relativeX * scaleX - paddleRef.current.width / 2;

      paddleRef.current.x = Math.max(
         0,
         Math.min(targetPaddleX, CANVAS_WIDTH - paddleRef.current.width)
      );
   };

   // Keyboard controls
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
            e.preventDefault();
         }
         const step = 28;
         if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            paddleRef.current.x = Math.max(0, paddleRef.current.x - step);
         } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            paddleRef.current.x = Math.min(
               CANVAS_WIDTH - paddleRef.current.width,
               paddleRef.current.x + step
            );
         } else if (e.key === ' ') {
            if (gameStateRef.current === 'idle') resetGame();
            else if (gameStateRef.current === 'running') pauseGame();
            else if (gameStateRef.current === 'paused') resumeGame();
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, []);

   const isNewBest = score > highScore && score > 0;

   return (
      <div className="flex flex-col items-center">
         {/* Top Controls & Status Strip */}
         <div className="w-full max-w-md mb-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
               <GameControls
                  isPlaying={gameState === 'running'}
                  isPaused={gameState === 'paused'}
                  onStart={resetGame}
                  onPause={pauseGame}
                  onResume={resumeGame}
                  onRestart={resetGame}
                  soundEnabled={soundEnabled}
                  onToggleSound={handleToggleSound}
               />
            </div>

            {/* Counters */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs">
               <div className="flex items-center gap-1.5">
                  <span className="text-zinc-500">Lives:</span>
                  <div className="flex items-center gap-1 text-rose-500">
                     {Array.from({ length: 3 }).map((_, i) => (
                        <Heart
                           key={i}
                           size={14}
                           className={i < lives ? 'fill-current' : 'opacity-20'}
                        />
                     ))}
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <span className="font-mono text-zinc-300 font-bold">
                     Score: <span className="text-[#daf4aa]">{score}</span>
                  </span>
                  {highScore > 0 && (
                     <span className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono">
                        <Trophy size={11} className="text-[#daf4aa]" />
                        Best: {highScore}
                     </span>
                  )}
               </div>
            </div>
         </div>

         {/* Canvas Arena */}
         <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl">
            <canvas
               ref={canvasRef}
               width={CANVAS_WIDTH}
               height={CANVAS_HEIGHT}
               onMouseMove={handlePointerMove}
               onTouchMove={handlePointerMove}
               className="max-h-[min(480px,calc(100dvh-7.5rem))] max-w-[min(440px,calc(100vw-2rem))] aspect-[440/480] rounded-xl border border-zinc-800/80 bg-[#09090b] touch-none block cursor-ew-resize w-auto h-auto object-contain"
            />

            {/* Start Screen */}
            {gameState === 'idle' && (
               <div className="absolute inset-3 flex flex-col items-center justify-center rounded-xl bg-black/85 backdrop-blur-sm p-6 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#daf4aa]/30 bg-[#daf4aa]/10 text-[#daf4aa]">
                     <Play size={28} className="fill-current ml-0.5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Brick Breaker</h3>
                  <p className="mt-1.5 max-w-xs text-xs text-zinc-400">
                     Slide the paddle to deflect the ball, demolish colored bricks, and collect falling power-ups.
                  </p>
                  <button
                     type="button"
                     onClick={resetGame}
                     className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#daf4aa] px-6 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-[#daf4aa]/10 transition-transform hover:scale-105">
                     <Play size={14} className="fill-current" />
                     <span>Launch Ball</span>
                  </button>
               </div>
            )}

            {/* Paused Screen */}
            {gameState === 'paused' && (
               <div className="absolute inset-3 flex flex-col items-center justify-center rounded-xl bg-black/85 backdrop-blur-sm p-6 text-center">
                  <h3 className="text-xl font-bold text-white">Paused</h3>
                  <button
                     type="button"
                     onClick={resumeGame}
                     className="mt-5 rounded-xl bg-[#daf4aa] px-5 py-2.5 text-xs font-semibold text-zinc-950">
                     Resume Game
                  </button>
               </div>
            )}

            {/* Win / Loss Modal */}
            {(gameState === 'won' || gameState === 'gameover') && (
               <div className="absolute inset-3 flex items-center justify-center rounded-xl bg-black/85 backdrop-blur-md p-4">
                  <GameResult
                     status={gameState === 'won' ? 'win' : 'gameover'}
                     title={gameState === 'won' ? 'All Bricks Demolished!' : 'Ball Dropped!'}
                     score={`${score} points`}
                     scoreLabel="Final Score"
                     bestScore={highScore}
                     isNewBest={isNewBest}
                     onRestart={resetGame}
                  />
               </div>
            )}
         </div>
      </div>
   );
}

