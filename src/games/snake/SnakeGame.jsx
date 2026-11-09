import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
   ArrowUp,
   ArrowDown,
   ArrowLeft,
   ArrowRight,
   Play,
   RotateCcw,
   Volume2,
   VolumeX,
   Trophy,
   Sliders,
   Sparkles,
   Flame,
   Shield,
} from 'lucide-react';
import {
   GRID_SIZE,
   DIRECTIONS,
   INITIAL_SNAKE,
   INITIAL_DIRECTION,
   SPEEDS,
   isOppositeDirection,
   spawnFood,
   getNextHead,
   checkCollision,
   calculateSpeed,
} from './snakeLogic';
import { arcadeSounds } from '../sound';
import {
   getGameHighScore,
   saveGameHighScore,
   getArcadeSettings,
   saveArcadeSettings,
} from '../storage';
import GameControls from '../../components/games/GameControls';
import GameResult from '../../components/games/GameResult';

export default function SnakeGame({ isFullscreen = false }) {
   const canvasRef = useRef(null);
   const [score, setScore] = useState(0);
   const [highScore, setHighScore] = useState(0);
   const [gameState, setGameState] = useState('idle'); // 'idle' | 'running' | 'paused' | 'gameover'
   const [difficulty, setDifficulty] = useState('normal'); // 'chill' | 'normal' | 'fast'
   const [wallMode, setWallMode] = useState('classic'); // 'classic' | 'wrap'
   const [soundEnabled, setSoundEnabled] = useState(true);
   const [showSettings, setShowSettings] = useState(false);
   const [goldenFoodRemaining, setGoldenFoodRemaining] = useState(0);

   // Refs for game loop state
   const snakeRef = useRef(INITIAL_SNAKE);
   const directionRef = useRef(INITIAL_DIRECTION);
   const nextDirectionRef = useRef(INITIAL_DIRECTION);
   const foodRef = useRef({ x: 15, y: 10 });
   const goldenFoodRef = useRef(null); // { x, y, expiresAt }
   const particlesRef = useRef([]); // [{ x, y, vx, vy, life, color }]
   const scoreRef = useRef(0);
   const foodEatenCountRef = useRef(0);
   const gameStateRef = useRef('idle');
   const gameLoopTimeoutRef = useRef(null);
   const animFrameRef = useRef(null);

   // Load high score
   useEffect(() => {
      const best = getGameHighScore('snake') || 0;
      setHighScore(best);
      const settings = getArcadeSettings();
      setSoundEnabled(settings.soundEnabled ?? true);
   }, []);

   const updateGameState = (newState) => {
      gameStateRef.current = newState;
      setGameState(newState);
   };

   const handleToggleSound = () => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      saveArcadeSettings({ soundEnabled: next });
   };

   // Add Particle Burst on eat
   const addParticles = (x, y, color = '#daf4aa', count = 12) => {
      for (let i = 0; i < count; i++) {
         const angle = Math.random() * Math.PI * 2;
         const speed = Math.random() * 3 + 1;
         particlesRef.current.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: Math.random() * 0.05 + 0.03,
            color,
            size: Math.random() * 3 + 2,
         });
      }
   };

   // Render Canvas
   const draw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
      const cellSize = width / GRID_SIZE;

      // Dark background
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, width, height);

      // Subtle grid
      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 1;
      for (let i = 0; i <= GRID_SIZE; i++) {
         ctx.beginPath();
         ctx.moveTo(i * cellSize, 0);
         ctx.lineTo(i * cellSize, height);
         ctx.stroke();

         ctx.beginPath();
         ctx.moveTo(0, i * cellSize);
         ctx.lineTo(width, i * cellSize);
         ctx.stroke();
      }

      // Border glow if classic mode
      if (wallMode === 'classic') {
         ctx.strokeStyle = 'rgba(218, 244, 170, 0.2)';
         ctx.lineWidth = 2;
         ctx.strokeRect(1, 1, width - 2, height - 2);
      }

      // Draw Normal Food (Lime Glow)
      const currentFood = foodRef.current;
      if (currentFood) {
         ctx.fillStyle = '#daf4aa';
         ctx.shadowColor = '#daf4aa';
         ctx.shadowBlur = 12;
         ctx.beginPath();
         ctx.arc(
            currentFood.x * cellSize + cellSize / 2,
            currentFood.y * cellSize + cellSize / 2,
            cellSize / 2.3,
            0,
            Math.PI * 2
         );
         ctx.fill();
         ctx.shadowBlur = 0;
      }

      // Draw Golden Bonus Food if active
      const gFood = goldenFoodRef.current;
      if (gFood) {
         ctx.fillStyle = '#facc15'; // Amber 400
         ctx.shadowColor = '#facc15';
         ctx.shadowBlur = 18;
         ctx.beginPath();
         ctx.arc(
            gFood.x * cellSize + cellSize / 2,
            gFood.y * cellSize + cellSize / 2,
            cellSize / 2.1,
            0,
            Math.PI * 2
         );
         ctx.fill();
         ctx.shadowBlur = 0;
      }

      // Draw Snake
      const currentSnake = snakeRef.current;
      const dir = directionRef.current;

      currentSnake.forEach((segment, index) => {
         const isHead = index === 0;
         const x = segment.x * cellSize;
         const y = segment.y * cellSize;
         const padding = 1.5;

         ctx.fillStyle = isHead ? '#ffffff' : '#a1a1aa';
         if (isHead) {
            ctx.shadowColor = 'rgba(218, 244, 170, 0.4)';
            ctx.shadowBlur = 8;
         }

         ctx.beginPath();
         const radius = isHead ? 5 : 2;
         ctx.roundRect(
            x + padding,
            y + padding,
            cellSize - padding * 2,
            cellSize - padding * 2,
            radius
         );
         ctx.fill();
         ctx.shadowBlur = 0;

         // Draw Eyes on Head
         if (isHead) {
            ctx.fillStyle = '#09090b';
            const eyeOffset = cellSize / 4;
            const eyeSize = 2.2;
            let eye1X = x + cellSize / 2;
            let eye1Y = y + cellSize / 2;
            let eye2X = x + cellSize / 2;
            let eye2Y = y + cellSize / 2;

            if (dir === DIRECTIONS.UP) {
               eye1X -= eyeOffset;
               eye2X += eyeOffset;
               eye1Y -= eyeOffset / 1.5;
               eye2Y -= eyeOffset / 1.5;
            } else if (dir === DIRECTIONS.DOWN) {
               eye1X -= eyeOffset;
               eye2X += eyeOffset;
               eye1Y += eyeOffset / 1.5;
               eye2Y += eyeOffset / 1.5;
            } else if (dir === DIRECTIONS.LEFT) {
               eye1X -= eyeOffset / 1.5;
               eye2X -= eyeOffset / 1.5;
               eye1Y -= eyeOffset;
               eye2Y += eyeOffset;
            } else {
               eye1X += eyeOffset / 1.5;
               eye2X += eyeOffset / 1.5;
               eye1Y -= eyeOffset;
               eye2Y += eyeOffset;
            }

            ctx.beginPath();
            ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
            ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
            ctx.fill();
         }
      });

      // Update & Draw Particles
      const particles = particlesRef.current;
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
         ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
         ctx.fill();
         ctx.globalAlpha = 1.0;
      }
   }, [wallMode]);

   // Continuous animation frame for smooth particles
   useEffect(() => {
      let isSubscribed = true;
      const loop = () => {
         if (!isSubscribed) return;
         if (particlesRef.current.length > 0 || gameStateRef.current === 'running') {
            draw();
         }
         animFrameRef.current = requestAnimationFrame(loop);
      };
      animFrameRef.current = requestAnimationFrame(loop);
      return () => {
         isSubscribed = false;
         cancelAnimationFrame(animFrameRef.current);
      };
   }, [draw]);

   // Game Step Tick
   const tick = useCallback(() => {
      if (gameStateRef.current !== 'running') return;

      directionRef.current = nextDirectionRef.current;
      const head = snakeRef.current[0];
      const nextHead = getNextHead(head, directionRef.current, wallMode);

      // Check wall or self collision
      if (checkCollision(nextHead, snakeRef.current, wallMode)) {
         arcadeSounds.gameOver();
         updateGameState('gameover');

         const currentScore = scoreRef.current;
         const best = getGameHighScore('snake') || 0;
         if (currentScore > best) {
            setHighScore(currentScore);
            saveGameHighScore('snake', currentScore);
         }
         return;
      }

      const newSnake = [nextHead, ...snakeRef.current];
      let hasEaten = false;
      const cellSize = (canvasRef.current?.width || 400) / GRID_SIZE;

      // Check Normal Food
      if (nextHead.x === foodRef.current.x && nextHead.y === foodRef.current.y) {
         arcadeSounds.eat();
         addParticles(
            nextHead.x * cellSize + cellSize / 2,
            nextHead.y * cellSize + cellSize / 2,
            '#daf4aa',
            14
         );
         const newScore = scoreRef.current + 1;
         scoreRef.current = newScore;
         setScore(newScore);
         foodEatenCountRef.current += 1;
         hasEaten = true;

         // Check if we should spawn Golden Food (every 5 normal foods)
         if (foodEatenCountRef.current % 5 === 0 && !goldenFoodRef.current) {
            const gPos = spawnFood(newSnake, [foodRef.current]);
            if (gPos) {
               goldenFoodRef.current = {
                  ...gPos,
                  expiresAt: Date.now() + 7000,
               };
               setGoldenFoodRemaining(7);
            }
         }

         const nextFood = spawnFood(newSnake, goldenFoodRef.current ? [goldenFoodRef.current] : []);
         if (!nextFood) {
            arcadeSounds.win();
            updateGameState('gameover');
            return;
         }
         foodRef.current = nextFood;
      }

      // Check Golden Food
      const gFood = goldenFoodRef.current;
      if (gFood) {
         if (Date.now() > gFood.expiresAt) {
            goldenFoodRef.current = null;
            setGoldenFoodRemaining(0);
         } else if (nextHead.x === gFood.x && nextHead.y === gFood.y) {
            arcadeSounds.match();
            addParticles(
               nextHead.x * cellSize + cellSize / 2,
               nextHead.y * cellSize + cellSize / 2,
               '#facc15',
               22
            );
            const newScore = scoreRef.current + 3;
            scoreRef.current = newScore;
            setScore(newScore);
            goldenFoodRef.current = null;
            setGoldenFoodRemaining(0);
            hasEaten = true;
         } else {
            const rem = Math.max(0, Math.ceil((gFood.expiresAt - Date.now()) / 1000));
            setGoldenFoodRemaining(rem);
         }
      }

      if (!hasEaten) {
         newSnake.pop();
      }

      snakeRef.current = newSnake;
      draw();

      const speed = calculateSpeed(scoreRef.current, difficulty);
      gameLoopTimeoutRef.current = setTimeout(tick, speed);
   }, [wallMode, difficulty, draw]);

   // Start Game
   const startGame = () => {
      const initialF = spawnFood(INITIAL_SNAKE) || { x: 15, y: 10 };
      snakeRef.current = INITIAL_SNAKE;
      directionRef.current = INITIAL_DIRECTION;
      nextDirectionRef.current = INITIAL_DIRECTION;
      foodRef.current = initialF;
      goldenFoodRef.current = null;
      scoreRef.current = 0;
      foodEatenCountRef.current = 0;
      particlesRef.current = [];

      setScore(0);
      setGoldenFoodRemaining(0);
      updateGameState('running');
      draw();

      clearTimeout(gameLoopTimeoutRef.current);
      const startSpeed = SPEEDS[difficulty]?.initial || 130;
      gameLoopTimeoutRef.current = setTimeout(tick, startSpeed);
   };

   const pauseGame = () => {
      if (gameStateRef.current === 'running') {
         clearTimeout(gameLoopTimeoutRef.current);
         updateGameState('paused');
      }
   };

   const resumeGame = () => {
      if (gameStateRef.current === 'paused') {
         updateGameState('running');
         const speed = calculateSpeed(scoreRef.current, difficulty);
         gameLoopTimeoutRef.current = setTimeout(tick, speed);
      }
   };

   const handleDirectionChange = useCallback((newDir) => {
      if (gameStateRef.current !== 'running') return;
      if (!isOppositeDirection(directionRef.current, newDir)) {
         nextDirectionRef.current = newDir;
      }
   }, []);

   // Keyboard controls
   useEffect(() => {
      const handleKeyDown = (e) => {
         if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
            e.preventDefault();
         }

         if (e.key === ' ' || e.key === 'Escape') {
            if (gameStateRef.current === 'running') pauseGame();
            else if (gameStateRef.current === 'paused') resumeGame();
            else if (gameStateRef.current === 'idle' || gameStateRef.current === 'gameover') startGame();
            return;
         }

         switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
               handleDirectionChange(DIRECTIONS.UP);
               break;
            case 'ArrowDown':
            case 's':
            case 'S':
               handleDirectionChange(DIRECTIONS.DOWN);
               break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
               handleDirectionChange(DIRECTIONS.LEFT);
               break;
            case 'ArrowRight':
            case 'd':
            case 'D':
               handleDirectionChange(DIRECTIONS.RIGHT);
               break;
            default:
               break;
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [handleDirectionChange]);

   // Touch swipe
   const touchStartRef = useRef({ x: 0, y: 0 });

   const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
   };

   const handleTouchEnd = (e) => {
      if (gameStateRef.current !== 'running') return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) < 20) return;

      if (absDx > absDy) {
         handleDirectionChange(dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
      } else {
         handleDirectionChange(dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
      }
   };

   useEffect(() => {
      draw();
      return () => clearTimeout(gameLoopTimeoutRef.current);
   }, [draw]);

   const isNewBest = score > highScore && score > 0;

   return (
      <div className="flex flex-col items-center justify-center max-w-full">
         {/* Live Controls & Mode Bar (Streamlined in Fullscreen to prevent overflow) */}
         <div className={`w-full max-w-md flex flex-col gap-2 ${isFullscreen ? 'mb-1.5' : 'mb-3'}`}>
            {!isFullscreen && (
               <div className="flex items-center justify-between gap-2">
                  <GameControls
                     isPlaying={gameState === 'running'}
                     isPaused={gameState === 'paused'}
                     onStart={startGame}
                     onPause={pauseGame}
                     onResume={resumeGame}
                     onRestart={startGame}
                     soundEnabled={soundEnabled}
                     onToggleSound={handleToggleSound}
                  />

                  <button
                     type="button"
                     onClick={() => setShowSettings(!showSettings)}
                     aria-label="Game Settings"
                     className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                        showSettings
                           ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                           : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                     }`}>
                     <Sliders size={15} />
                  </button>
               </div>
            )}

            {/* Collapsible Settings Drawer */}
            {showSettings && (
               <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 text-xs">
                  {/* Speed Difficulty */}
                  <div className="flex items-center gap-1.5">
                     <span className="text-zinc-500">Speed:</span>
                     {Object.entries(SPEEDS).map(([key, val]) => (
                        <button
                           key={key}
                           type="button"
                           disabled={gameState === 'running'}
                           onClick={() => setDifficulty(key)}
                           className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
                              difficulty === key
                                 ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                                 : 'bg-zinc-800 text-zinc-400 hover:text-white'
                           }`}>
                           {val.label}
                        </button>
                     ))}
                  </div>

                  {/* Wall Collision Mode */}
                  <div className="flex items-center gap-1.5">
                     <span className="text-zinc-500">Walls:</span>
                     <button
                        type="button"
                        disabled={gameState === 'running'}
                        onClick={() => setWallMode('classic')}
                        className={`rounded-lg px-2.5 py-1 font-semibold transition-colors disabled:opacity-50 ${
                           wallMode === 'classic'
                              ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                              : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}>
                        Classic
                     </button>
                     <button
                        type="button"
                        disabled={gameState === 'running'}
                        onClick={() => setWallMode('wrap')}
                        className={`rounded-lg px-2.5 py-1 font-semibold transition-colors disabled:opacity-50 ${
                           wallMode === 'wrap'
                              ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                              : 'bg-zinc-800 text-zinc-400 hover:text-white'
                        }`}>
                        Wrap
                     </button>
                  </div>
               </div>
            )}

            {/* Golden Food Active Alert */}
            {goldenFoodRemaining > 0 && (
               <div className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300 animate-pulse">
                  <span className="flex items-center gap-1.5 font-bold">
                     <Sparkles size={13} className="text-amber-400" />
                     <span>Golden Apple Active (+3 pts)!</span>
                  </span>
                  <span className="font-mono font-bold text-amber-200">{goldenFoodRemaining}s</span>
               </div>
            )}
         </div>

         {/* Board Wrapper - Screen-wise contained */}
         <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950 p-2 sm:p-3 shadow-2xl flex items-center justify-center">
            <canvas
               ref={canvasRef}
               width={400}
               height={400}
               onTouchStart={handleTouchStart}
               onTouchEnd={handleTouchEnd}
               className="max-h-[min(400px,calc(100dvh-7.5rem))] max-w-[min(400px,calc(100vw-2rem))] aspect-square rounded-xl border border-zinc-800/80 bg-[#09090b] touch-none block w-auto h-auto object-contain"
            />

            {/* Start Screen Overlay */}
            {gameState === 'idle' && (
               <div className="absolute inset-3 flex flex-col items-center justify-center rounded-xl bg-black/85 backdrop-blur-sm p-6 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#daf4aa]/30 bg-[#daf4aa]/10 text-[#daf4aa]">
                     <Play size={28} className="fill-current ml-0.5" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Classic Snake</h3>
                  <p className="mt-1.5 max-w-xs text-xs text-zinc-400">
                     Eat lime dots to grow. Grab rare Golden Apples for +3 bonus points.
                  </p>
                  <button
                     type="button"
                     onClick={startGame}
                     className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#daf4aa] px-6 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-[#daf4aa]/10 transition-transform hover:scale-105">
                     <Play size={14} className="fill-current" />
                     <span>Start Playing</span>
                  </button>
               </div>
            )}

            {/* Paused Screen Overlay */}
            {gameState === 'paused' && (
               <div className="absolute inset-3 flex flex-col items-center justify-center rounded-xl bg-black/85 backdrop-blur-sm p-6 text-center">
                  <h3 className="text-xl font-bold text-white">Game Paused</h3>
                  <p className="mt-1 text-xs text-zinc-400">Press Resume or Space to continue</p>
                  <button
                     type="button"
                     onClick={resumeGame}
                     className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#daf4aa] px-5 py-2.5 text-xs font-semibold text-zinc-950">
                     <Play size={14} className="fill-current" />
                     <span>Resume</span>
                  </button>
               </div>
            )}

            {/* Game Over Overlay */}
            {gameState === 'gameover' && (
               <div className="absolute inset-3 flex items-center justify-center rounded-xl bg-black/85 backdrop-blur-sm p-4">
                  <GameResult
                     status="gameover"
                     title="Crashed!"
                     score={score}
                     scoreLabel="Points"
                     bestScore={Math.max(score, highScore)}
                     isNewBest={isNewBest}
                     onRestart={startGame}
                  />
               </div>
            )}
         </div>

         {/* Mobile D-Pad */}
         <div className="mt-2.5 flex flex-col items-center gap-1.5 sm:hidden select-none">
            <button
               type="button"
               onClick={() => handleDirectionChange(DIRECTIONS.UP)}
               className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 active:bg-[#daf4aa] active:text-zinc-950 text-zinc-300">
               <ArrowUp size={18} />
            </button>
            <div className="flex items-center gap-4">
               <button
                  type="button"
                  onClick={() => handleDirectionChange(DIRECTIONS.LEFT)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 active:bg-[#daf4aa] active:text-zinc-950 text-zinc-300">
                  <ArrowLeft size={18} />
               </button>
               <button
                  type="button"
                  onClick={() => handleDirectionChange(DIRECTIONS.DOWN)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 active:bg-[#daf4aa] active:text-zinc-950 text-zinc-300">
                  <ArrowDown size={18} />
               </button>
               <button
                  type="button"
                  onClick={() => handleDirectionChange(DIRECTIONS.RIGHT)}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 active:bg-[#daf4aa] active:text-zinc-950 text-zinc-300">
                  <ArrowRight size={18} />
               </button>
            </div>
         </div>
      </div>
   );
}
