import React from 'react';
import { Link } from 'react-router-dom';
import {
   ArrowUpRight,
   Trophy,
   Gamepad2,
   Zap,
   Brain,
   Bomb,
   Type,
   Boxes,
   Disc3,
   Rocket,
   Sliders,
   Grid3X3,
   Palette,
   Crosshair,
   Layers,
   Joystick,
   Flame,
   Play,
   Ghost,
   Crown,
   Terminal,
   Footprints,
   CircleDot,
   Sparkles,
   Navigation,
   Orbit,
   Lightbulb,
   Disc,
} from 'lucide-react';
import { preloadRoute } from '../../App';

// Primary icon mapping for each game
const getGameIcon = (id, accentColor) => {
   const iconProps = {
      size: 20,
      className: 'transition-transform duration-300 group-hover:scale-110',
      style: { color: accentColor },
   };

   switch (id) {
      case 'snake':
         return <Joystick {...iconProps} />;
      case '2048':
         return <Layers {...iconProps} />;
      case 'tic-tac-toe':
         return <Crosshair {...iconProps} />;
      case 'memory-match':
         return <Brain {...iconProps} />;
      case 'reaction-time':
         return <Zap {...iconProps} />;
      case 'minesweeper':
         return <Bomb {...iconProps} />;
      case 'word-guess':
         return <Type {...iconProps} />;
      case 'brick-breaker':
         return <Boxes {...iconProps} />;
      case 'simon-says':
         return <Disc3 {...iconProps} />;
      case 'block-drop':
         return <Boxes {...iconProps} />;
      case 'neon-dash':
         return <Flame {...iconProps} />;
      case 'pong':
         return <Sliders {...iconProps} />;
      case 'sudoku':
         return <Grid3X3 {...iconProps} />;
      case 'color-flood':
         return <Palette {...iconProps} />;
      case 'space-invaders':
         return <Rocket {...iconProps} />;
      case 'tower-stacker':
         return <Layers {...iconProps} />;
      case 'connect-four':
         return <CircleDot {...iconProps} />;
      case 'matrix-flip':
         return <Lightbulb {...iconProps} />;
      case 'cyber-runner':
         return <Footprints {...iconProps} />;
      case 'type-storm':
         return <Terminal {...iconProps} />;
      case 'neon-hopper':
         return <Navigation {...iconProps} />;
      case 'asteroids':
         return <Orbit {...iconProps} />;
      case 'moon-lander':
         return <Rocket {...iconProps} />;
      case 'checkers':
         return <Crown {...iconProps} />;
      case 'cyber-pac':
         return <Ghost {...iconProps} />;
      case 'solitaire':
         return <Sparkles {...iconProps} />;
      case 'pinball':
         return <Disc {...iconProps} />;
      default:
         return <Gamepad2 {...iconProps} />;
   }
};

// Interactive animated micro-visual for all 15 arcade titles
const renderMiniVisual = (id, accentColor) => {
   switch (id) {
      case 'snake':
         return (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="h-2 w-2 rounded-full bg-[#daf4aa] shadow-[0_0_8px_#daf4aa] transition-transform duration-300 group-hover:translate-x-1" />
               <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 transition-transform duration-300 group-hover:translate-x-0.5" />
               <span className="h-1 w-1 rounded-full bg-zinc-600" />
               <span className="h-1.5 w-1.5 rounded-full bg-rose-500/80 ml-2 animate-pulse" />
            </div>
         );
      case '2048':
         return (
            <div className="grid grid-cols-2 gap-0.5 text-[8px] font-mono font-bold p-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="rounded bg-zinc-800 px-1 py-0.5 text-zinc-300">2</span>
               <span className="rounded bg-amber-500/20 text-amber-300 px-1 py-0.5">8</span>
               <span className="rounded bg-rose-500/20 text-rose-300 px-1 py-0.5">64</span>
               <span className="rounded bg-[#fbbf24] px-1 py-0.5 text-zinc-950 font-black shadow-[0_0_6px_rgba(251,191,36,0.4)] transition-transform duration-300 group-hover:scale-105">
                  2K
               </span>
            </div>
         );
      case 'tic-tac-toe':
         return (
            <div className="flex items-center gap-1.5 font-bold text-xs px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80 font-mono">
               <span className="text-[#38bdf8] drop-shadow-[0_0_6px_rgba(56,189,248,0.5)] transition-transform duration-300 group-hover:scale-110">X</span>
               <span className="text-zinc-700">|</span>
               <span className="text-[#daf4aa] drop-shadow-[0_0_6px_rgba(218,244,170,0.5)] transition-transform duration-300 group-hover:scale-110">O</span>
            </div>
         );
      case 'memory-match':
         return (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="h-4 w-3 rounded border border-zinc-700 bg-zinc-800 transition-all duration-300 group-hover:rotate-6" />
               <span className="h-4 w-3 rounded border border-purple-400 bg-purple-500/20 flex items-center justify-center text-[9px] text-purple-300 font-bold transition-all duration-300 group-hover:-rotate-6">
                  ★
               </span>
            </div>
         );
      case 'reaction-time':
         return (
            <div className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="h-1.5 w-1.5 rounded-full bg-rose-500 transition-colors duration-300 group-hover:bg-emerald-400 group-hover:shadow-[0_0_8px_#34d399]" />
               <span className="text-zinc-400 group-hover:text-emerald-400 font-bold transition-colors">184ms</span>
            </div>
         );
      case 'minesweeper':
         return (
            <div className="flex items-center gap-1 text-[9px] font-mono font-bold px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="text-blue-400">1</span>
               <span className="text-emerald-400">2</span>
               <span className="text-orange-400 drop-shadow-[0_0_4px_rgba(249,115,22,0.6)]">🚩</span>
            </div>
         );
      case 'word-guess':
         return (
            <div className="flex items-center gap-0.5 text-[8px] font-mono font-bold px-1.5 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="w-3.5 h-3.5 flex items-center justify-center rounded bg-emerald-500 text-zinc-950">K</span>
               <span className="w-3.5 h-3.5 flex items-center justify-center rounded bg-amber-500 text-zinc-950">L</span>
               <span className="w-3.5 h-3.5 flex items-center justify-center rounded bg-emerald-500 text-zinc-950">Q</span>
            </div>
         );
      case 'brick-breaker':
         return (
            <div className="flex flex-col items-center gap-1 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <div className="flex gap-1">
                  <span className="w-2.5 h-1 rounded-sm bg-fuchsia-400" />
                  <span className="w-2.5 h-1 rounded-sm bg-cyan-400" />
                  <span className="w-2.5 h-1 rounded-sm bg-amber-400" />
               </div>
               <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_white] transition-transform duration-300 group-hover:-translate-y-0.5" />
            </div>
         );
      case 'simon-says':
         return (
            <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-zinc-950/80 border border-zinc-800/80">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:shadow-[0_0_6px_#34d399]" />
               <span className="w-1.5 h-1.5 rounded-full bg-rose-400 group-hover:shadow-[0_0_6px_#f43f5e]" />
               <span className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:shadow-[0_0_6px_#fbbf24]" />
               <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:shadow-[0_0_6px_#22d3ee]" />
            </div>
         );
      case 'block-drop':
         return (
            <div className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <div className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-sm bg-purple-500" />
                  <span className="w-1.5 h-1.5 rounded-sm bg-purple-500" />
                  <span className="w-1.5 h-1.5 rounded-sm bg-purple-500" />
               </div>
               <span className="w-1.5 h-1.5 rounded-sm bg-purple-500" />
            </div>
         );
      case 'neon-dash':
         return (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="w-1 h-3 rounded-full bg-zinc-700" />
               <span className="w-2 h-2 rounded-full bg-[#daf4aa] shadow-[0_0_8px_#daf4aa] transition-transform duration-300 group-hover:-translate-y-1" />
               <span className="w-1 h-3 rounded-full bg-zinc-700" />
            </div>
         );
      case 'pong':
         return (
            <div className="flex items-center justify-between w-10 px-1 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="w-0.5 h-3 rounded-full bg-cyan-400" />
               <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_4px_white] transition-transform duration-300 group-hover:translate-x-1" />
               <span className="w-0.5 h-3 rounded-full bg-zinc-500" />
            </div>
         );
      case 'sudoku':
         return (
            <div className="grid grid-cols-2 gap-0.5 text-[8px] font-mono font-bold px-1.5 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80 text-blue-400">
               <span>3</span>
               <span className="text-zinc-600">.</span>
               <span className="text-zinc-600">.</span>
               <span>9</span>
            </div>
         );
      case 'color-flood':
         return (
            <div className="grid grid-cols-2 gap-0.5 p-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="w-2 h-2 rounded-sm bg-pink-500" />
               <span className="w-2 h-2 rounded-sm bg-purple-500" />
               <span className="w-2 h-2 rounded-sm bg-cyan-500" />
               <span className="w-2 h-2 rounded-sm bg-amber-500" />
            </div>
         );
      case 'space-invaders':
         return (
            <div className="flex flex-col items-center gap-1 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="w-2.5 h-1.5 rounded-sm bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]" />
               <span className="w-0.5 h-1 bg-[#daf4aa] transition-transform duration-300 group-hover:-translate-y-0.5" />
               <span className="w-2 h-1 rounded-t-sm bg-[#daf4aa]" />
            </div>
         );
      case 'tower-stacker':
         return (
            <div className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="w-3 h-1 rounded-sm bg-amber-400 transition-transform duration-300 group-hover:translate-x-1" />
               <span className="w-4 h-1 rounded-sm bg-amber-400/80" />
               <span className="w-5 h-1 rounded-sm bg-amber-400/60" />
            </div>
         );
      case 'connect-four':
         return (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
               <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
               <span className="w-2 h-2 rounded-full bg-cyan-400" />
               <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
         );
      case 'matrix-flip':
         return (
            <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="w-1.5 h-1.5 rounded-sm bg-lime-400 shadow-[0_0_5px_#daf4aa]" />
               <span className="w-1.5 h-1.5 rounded-sm bg-zinc-700" />
               <span className="w-1.5 h-1.5 rounded-sm bg-zinc-700" />
               <span className="w-1.5 h-1.5 rounded-sm bg-lime-400 shadow-[0_0_5px_#daf4aa]" />
            </div>
         );
      case 'cyber-runner':
         return (
            <div className="flex items-end gap-1.5 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="w-2 h-2.5 rounded-sm bg-emerald-400 shadow-[0_0_6px_#34d399] transition-transform duration-300 group-hover:-translate-y-1" />
               <span className="w-1.5 h-1.5 rotate-45 bg-rose-500" />
            </div>
         );
      case 'type-storm':
         return (
            <div className="flex items-center gap-1 font-mono text-[9px] px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80 text-violet-400">
               <span>&gt;code</span>
               <span className="w-1 h-2.5 bg-violet-400 animate-pulse" />
            </div>
         );
      case 'neon-hopper':
         return (
            <div className="flex flex-col items-center gap-1 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="w-2 h-2 rounded-sm bg-lime-400 shadow-[0_0_6px_#daf4aa] transition-transform duration-300 group-hover:-translate-y-0.5" />
               <span className="w-4 h-1 rounded-full bg-cyan-500/70" />
            </div>
         );
      case 'asteroids':
         return (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="text-[10px] text-teal-400 font-mono transition-transform duration-300 group-hover:rotate-45">▲</span>
               <span className="w-2 h-2 rounded border border-teal-500/70 bg-teal-500/20" />
            </div>
         );
      case 'moon-lander':
         return (
            <div className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="w-2.5 h-2 rounded-t-sm bg-fuchsia-400 shadow-[0_0_6px_#e879f9]" />
               <span className="w-1 h-1 bg-amber-400 rounded-full animate-pulse" />
            </div>
         );
      case 'checkers':
         return (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_6px_#ec4899] flex items-center justify-center text-[7px] text-white">★</span>
               <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            </div>
         );
      case 'cyber-pac':
         return (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_6px_#facc15]" />
               <span className="w-1 h-1 rounded-full bg-white/70" />
               <span className="w-2 h-2 rounded-t-sm bg-rose-500" />
            </div>
         );
      case 'solitaire':
         return (
            <div className="flex items-center -space-x-1 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80 font-mono text-[9px]">
               <span className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-sky-400">A♠</span>
               <span className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-rose-400">K♥</span>
            </div>
         );
      case 'pinball':
         return (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-950/80 border border-zinc-800/80">
               <span className="w-2 h-0.5 rounded-full bg-rose-500 rotate-12" />
               <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_white] transition-transform duration-300 group-hover:-translate-y-1" />
               <span className="w-2 h-0.5 rounded-full bg-rose-500 -rotate-12" />
            </div>
         );
      default:
         return null;
   }
};

export default function GameCard({ game, highScore, onSelect }) {
   const formattedScore = game.formatScore ? game.formatScore(highScore) : null;
   const accent = game.accentColor || '#daf4aa';

   return (
      <Link
         to={game.route}
         onClick={() => onSelect?.(game.id)}
         onMouseEnter={() => preloadRoute(game.route)}
         onTouchStart={() => preloadRoute(game.route)}
         className="group relative flex h-full min-h-[240px] flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#121214] p-5 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-zinc-700/90 hover:shadow-2xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600">
         {/* Subtle top ambient glowing border line */}
         <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] opacity-20 transition-opacity duration-300 group-hover:opacity-100"
            style={{
               background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`,
            }}
         />

         {/* Ambient radial glow on hover */}
         <div
            className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-15"
            style={{ backgroundColor: accent }}
         />

         {/* Card Upper Body */}
         <div>
            {/* Header: Game Icon + Category / Badge + Micro Visual */}
            <div className="flex items-center justify-between gap-2">
               <div className="flex items-center gap-3">
                  {/* Themed Game Icon Container matching Paraphrase.jsx surface */}
                  <div
                     className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-[#18181b] transition-all duration-300 group-hover:scale-105 group-hover:border-zinc-700"
                     style={{
                        boxShadow: `0 0 16px -4px ${accent}22`,
                     }}>
                     {getGameIcon(game.id, accent)}
                     <span
                        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-10"
                        style={{ backgroundColor: accent }}
                     />
                  </div>

                  <div>
                     <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                           {game.category}
                        </span>
                        {game.players && (
                           <span className="rounded bg-[#18181b] border border-zinc-800/80 px-1.5 py-0.2 text-[9px] font-mono text-zinc-400">
                              {game.players}
                           </span>
                        )}
                     </div>
                     {game.tagline && (
                        <div className="text-[10px] text-zinc-500 font-sans tracking-tight">
                           {game.tagline}
                        </div>
                     )}
                  </div>
               </div>

               <div className="flex items-center gap-2">
                  {renderMiniVisual(game.id, accent)}
                  {game.badge && (
                     <span
                        className="rounded-full border border-zinc-800 bg-[#18181b] px-2 py-0.5 text-[10px] font-mono transition-colors group-hover:border-zinc-700"
                        style={{
                           color: accent,
                        }}>
                        {game.badge}
                     </span>
                  )}
               </div>
            </div>

            {/* Title & Description */}
            <h3 className="mt-4 text-base font-medium text-zinc-100 tracking-tight transition-colors group-hover:text-white flex items-center justify-between">
               <span>{game.title}</span>
            </h3>

            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400 line-clamp-2">
               {game.description}
            </p>
         </div>

         {/* Card Footer: Controls, High Score & Action Button */}
         <div className="mt-5 border-t border-zinc-800/50 pt-3 text-xs">
            <div className="flex items-center justify-between text-zinc-500">
               <span className="truncate pr-2 text-[11px] text-zinc-500 font-mono">
                  {game.controls}
               </span>

               {/* Gaming Action Button matching Paraphrase.jsx button tokens */}
               <div className="flex shrink-0 items-center gap-1 transition-all duration-300">
                  <span
                     className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium border border-zinc-700/60 bg-[#27272a] text-zinc-200 transition-all duration-200 group-hover:bg-[#3f3f46] group-hover:text-white">
                     <Play size={10} className="fill-current text-[#daf4aa]" />
                     <span>Play</span>
                     <ArrowUpRight
                        size={12}
                        className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-zinc-400"
                     />
                  </span>
               </div>
            </div>

            {/* High Score Capsule if available */}
            {formattedScore && (
               <div className="mt-2.5 flex items-center justify-between rounded-lg border border-zinc-800/80 bg-[#0f0f11] px-2.5 py-1.5 text-[11px]">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                     <Trophy size={12} className="text-amber-400" />
                     <span className="font-mono text-[10px] uppercase text-zinc-500">{game.scoreLabel}</span>
                  </div>
                  <span className="font-mono font-bold text-zinc-200">{formattedScore}</span>
               </div>
            )}
         </div>
      </Link>
   );
}
