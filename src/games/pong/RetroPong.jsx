import React, { useState, useEffect, useRef } from 'react';
import {
   Play,
   RotateCcw,
   Volume2,
   VolumeX,
   Trophy,
   Users,
   Bot,
   Sliders,
} from 'lucide-react';
import {
   COURT_WIDTH,
   COURT_HEIGHT,
   PADDLE_W,
   PADDLE_H,
   BALL_SIZE,
   WINNING_SCORE,
   createInitialState,
} from './pongLogic';
import { arcadeSounds } from '../sound';
import {
   getGameHighScore,
   saveGameHighScore,
   getArcadeSettings,
   saveArcadeSettings,
} from '../storage';
import GameControls from '../../components/games/GameControls';
import GameResult from '../../components/games/GameResult';

export default function RetroPong({ isFullscreen = false }) {
   const canvasRef = useRef(null);
   const [mode, setMode] = useState('ai'); // 'ai' | 'pvp'
   const [aiDifficulty, setAiDifficulty] = useState('medium'); // 'easy' | 'medium' | 'master'
   const [scoreP1, setScoreP1] = useState(0);
   const [scoreP2, setScoreP2] = useState(0);
   const [gameState, setGameState] = useState('idle'); // 'idle' | 'running' | 'paused' | 'won'
   const [winsTotal, setWinsTotal] = useState(0);
   const [soundEnabled, setSoundEnabled] = useState(true);

   // Refs
   const p1YRef = useRef((COURT_HEIGHT - PADDLE_H) / 2);
   const p2YRef = useRef((COURT_HEIGHT - PADDLE_H) / 2);
   const ballRef = useRef({
      x: COURT_WIDTH / 2,
      y: COURT_HEIGHT / 2,
      vx: 3.5,
      vy: 1.5,
   });
   const keysPressedRef = useRef({});
   const animRef = useRef(null);
   const gameStateRef = useRef('idle');

   useEffect(() => {
      const stored = getGameHighScore('pong') || {};
      setWinsTotal(stored.wins || 0);
      const settings = getArcadeSettings();
      setSoundEnabled(settings.soundEnabled ?? true);
   }, []);

   const handleToggleSound = () => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      saveArcadeSettings({ soundEnabled: next });
   };

   const resetBall = (serveToP1 = false) => {
      ballRef.current = {
         x: COURT_WIDTH / 2,
         y: COURT_HEIGHT / 2,
         vx: (serveToP1 ? -1 : 1) * 3.6,
         vy: (Math.random() * 2 - 1) * 2.2,
      };
   };

   const startGame = () => {
      p1YRef.current = (COURT_HEIGHT - PADDLE_H) / 2;
      p2YRef.current = (COURT_HEIGHT - PADDLE_H) / 2;
      resetBall();
      setScoreP1(0);
      setScoreP2(0);
      gameStateRef.current = 'running';
      setGameState('running');
      arcadeSounds.click();
   };

   // Main Physics & Render loop
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
         const ball = ballRef.current;
         const keys = keysPressedRef.current;

         // Clear
         ctx.fillStyle = '#09090b';
         ctx.fillRect(0, 0, COURT_WIDTH, COURT_HEIGHT);

         // Center Dashed Court Line
         ctx.strokeStyle = '#27272a';
         ctx.setLineDash([6, 6]);
         ctx.lineWidth = 2;
         ctx.beginPath();
         ctx.moveTo(COURT_WIDTH / 2, 0);
         ctx.lineTo(COURT_WIDTH / 2, COURT_HEIGHT);
         ctx.stroke();
         ctx.setLineDash([]);

         if (gameStateRef.current === 'running') {
            // Player 1 movement (W/S or Up/Down in single player)
            const pSpeed = 4.8;
            if (keys['w'] || keys['W']) {
               p1YRef.current = Math.max(0, p1YRef.current - pSpeed);
            }
            if (keys['s'] || keys['S']) {
               p1YRef.current = Math.min(COURT_HEIGHT - PADDLE_H, p1YRef.current + pSpeed);
            }

            // Player 2 or AI
            if (mode === 'pvp') {
               if (keys['ArrowUp']) {
                  p2YRef.current = Math.max(0, p2YRef.current - pSpeed);
               }
               if (keys['ArrowDown']) {
                  p2YRef.current = Math.min(COURT_HEIGHT - PADDLE_H, p2YRef.current + pSpeed);
               }
            } else {
               // AI tracker
               const aiSpd = aiDifficulty === 'master' ? 4.6 : aiDifficulty === 'medium' ? 3.5 : 2.4;
               const p2Center = p2YRef.current + PADDLE_H / 2;
               if (ball.y < p2Center - 6) {
                  p2YRef.current = Math.max(0, p2YRef.current - aiSpd);
               } else if (ball.y > p2Center + 6) {
                  p2YRef.current = Math.min(COURT_HEIGHT - PADDLE_H, p2YRef.current + aiSpd);
               }
            }

            // Move Ball
            ball.x += ball.vx;
            ball.y += ball.vy;

            // Top & Bottom boundary bounce
            if (ball.y <= 0 || ball.y + BALL_SIZE >= COURT_HEIGHT) {
               ball.vy = -ball.vy;
               arcadeSounds.move();
            }

            // Paddle 1 Collision (Left)
            if (
               ball.x <= 16 + PADDLE_W &&
               ball.x >= 16 &&
               ball.y + BALL_SIZE >= p1YRef.current &&
               ball.y <= p1YRef.current + PADDLE_H
            ) {
               arcadeSounds.move();
               ball.vx = Math.abs(ball.vx) * 1.04; // accelerate slightly
               const hitPoint = (ball.y - (p1YRef.current + PADDLE_H / 2)) / (PADDLE_H / 2);
               ball.vy = hitPoint * 3.8;
            }

            // Paddle 2 Collision (Right)
            if (
               ball.x + BALL_SIZE >= COURT_WIDTH - 16 - PADDLE_W &&
               ball.x + BALL_SIZE <= COURT_WIDTH - 16 &&
               ball.y + BALL_SIZE >= p2YRef.current &&
               ball.y <= p2YRef.current + PADDLE_H
            ) {
               arcadeSounds.move();
               ball.vx = -Math.abs(ball.vx) * 1.04;
               const hitPoint = (ball.y - (p2YRef.current + PADDLE_H / 2)) / (PADDLE_H / 2);
               ball.vy = hitPoint * 3.8;
            }

            // Goal detection
            if (ball.x < 0) {
               // P2 scores
               arcadeSounds.wrong();
               setScoreP2((s) => {
                  const next = s + 1;
                  if (next >= WINNING_SCORE) {
                     gameStateRef.current = 'won';
                     setGameState('won');
                     arcadeSounds.gameOver();
                  } else {
                     resetBall(false);
                  }
                  return next;
               });
            } else if (ball.x > COURT_WIDTH) {
               // P1 scores
               arcadeSounds.eat();
               setScoreP1((s) => {
                  const next = s + 1;
                  if (next >= WINNING_SCORE) {
                     gameStateRef.current = 'won';
                     setGameState('won');
                     arcadeSounds.win();
                     if (mode === 'ai') {
                        setWinsTotal((w) => {
                           const nw = w + 1;
                           saveGameHighScore('pong', { wins: nw });
                           return nw;
                        });
                     }
                  } else {
                     resetBall(true);
                  }
                  return next;
               });
            }
         }

         // Draw Paddle 1
         ctx.fillStyle = '#daf4aa';
         ctx.beginPath();
         ctx.roundRect(16, p1YRef.current, PADDLE_W, PADDLE_H, 4);
         ctx.fill();

         // Draw Paddle 2
         ctx.fillStyle = mode === 'pvp' ? '#38bdf8' : '#e4e4e7';
         ctx.beginPath();
         ctx.roundRect(COURT_WIDTH - 16 - PADDLE_W, p2YRef.current, PADDLE_W, PADDLE_H, 4);
         ctx.fill();

         // Draw Ball
         ctx.fillStyle = '#ffffff';
         ctx.shadowColor = '#ffffff';
         ctx.shadowBlur = 8;
         ctx.beginPath();
         ctx.arc(ball.x, ball.y, BALL_SIZE / 2, 0, Math.PI * 2);
         ctx.fill();
         ctx.shadowBlur = 0;

         animRef.current = requestAnimationFrame(loop);
      };

      animRef.current = requestAnimationFrame(loop);
      return () => {
         isSubscribed = false;
         cancelAnimationFrame(animRef.current);
      };
   }, [mode, aiDifficulty]);

   // Track keyboard press states
   useEffect(() => {
      const handleDown = (e) => {
         if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
         }
         keysPressedRef.current[e.key] = true;
      };
      const handleUp = (e) => {
         if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
         }
         keysPressedRef.current[e.key] = false;
      };
      window.addEventListener('keydown', handleDown);
      window.addEventListener('keyup', handleUp);
      return () => {
         window.removeEventListener('keydown', handleDown);
         window.removeEventListener('keyup', handleUp);
      };
   }, []);

   // Touch drag controls on mobile
   const handleTouchMove = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const touchY = e.touches[0].clientY - rect.top;
      const scaleY = COURT_HEIGHT / rect.height;
      p1YRef.current = Math.max(0, Math.min(touchY * scaleY - PADDLE_H / 2, COURT_HEIGHT - PADDLE_H));
   };

   return (
      <div className="flex flex-col items-center select-none">
         {/* Top Controls & Status */}
         <div className="w-full max-w-md mb-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
               {/* Mode Switcher */}
               <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900/80 p-1">
                  <button
                     type="button"
                     onClick={() => {
                        setMode('ai');
                        startGame();
                     }}
                     className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        mode === 'ai'
                           ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                           : 'text-zinc-400 hover:text-white'
                     }`}>
                     <Bot size={13} />
                     <span>vs AI</span>
                  </button>

                  <button
                     type="button"
                     onClick={() => {
                        setMode('pvp');
                        startGame();
                     }}
                     className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        mode === 'pvp'
                           ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                           : 'text-zinc-400 hover:text-white'
                     }`}>
                     <Users size={13} />
                     <span>2 Players</span>
                  </button>
               </div>

               <div className="flex items-center gap-1.5">
                  <button
                     type="button"
                     onClick={startGame}
                     aria-label="Restart Match"
                     className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white">
                     <RotateCcw size={14} />
                  </button>
                  <button
                     type="button"
                     onClick={handleToggleSound}
                     aria-label={soundEnabled ? 'Mute' : 'Unmute'}
                     className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white">
                     {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  </button>
               </div>
            </div>

            {/* Score Strip */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-2 text-xs">
               <span className="flex items-center gap-1.5 font-bold text-[#daf4aa] text-sm">
                  <span>Player 1:</span>
                  <span className="font-mono text-xl">{scoreP1}</span>
               </span>

               <span className="text-zinc-600 font-mono text-xs">First to 7</span>

               <span className="flex items-center gap-1.5 font-bold text-zinc-200 text-sm">
                  <span className="font-mono text-xl">{scoreP2}</span>
                  <span>:{mode === 'ai' ? 'Computer' : 'Player 2'}</span>
               </span>
            </div>
         </div>

         {/* Canvas Court */}
         <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl">
            <canvas
               ref={canvasRef}
               width={COURT_WIDTH}
               height={COURT_HEIGHT}
               onTouchMove={handleTouchMove}
               className="max-h-[min(340px,calc(100dvh-7.5rem))] max-w-[min(460px,calc(100vw-2rem))] aspect-[480/360] rounded-xl border border-zinc-800/80 bg-[#09090b] touch-none block w-auto h-auto object-contain"
            />

            {/* Start Screen */}
            {gameState === 'idle' && (
               <div className="absolute inset-3 flex flex-col items-center justify-center rounded-xl bg-black/85 backdrop-blur-sm p-6 text-center">
                  <h3 className="text-xl font-bold text-white">Retro Pong</h3>
                  <p className="mt-1 max-w-xs text-xs text-zinc-400">
                     Classic table tennis duel. Deflect the bouncing puck and score in opponent territory.
                  </p>
                  <button
                     type="button"
                     onClick={startGame}
                     className="mt-5 rounded-xl bg-[#daf4aa] px-6 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-[#daf4aa]/10 hover:scale-105 transition-transform">
                     Serve Ball
                  </button>
               </div>
            )}

            {/* Winner Overlay */}
            {gameState === 'won' && (
               <div className="absolute inset-3 flex items-center justify-center rounded-xl bg-black/85 backdrop-blur-md p-4">
                  <GameResult
                     status={scoreP1 >= WINNING_SCORE ? 'win' : 'gameover'}
                     title={scoreP1 >= WINNING_SCORE ? 'Player 1 Wins!' : 'Opponent Wins!'}
                     score={`${scoreP1} - ${scoreP2}`}
                     scoreLabel="Final Match Score"
                     bestScore={winsTotal > 0 ? `${winsTotal} total wins` : null}
                     onRestart={startGame}
                  />
               </div>
            )}
         </div>
      </div>
   );
}

