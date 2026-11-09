import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
   Gamepad2,
   Search,
   X,
   Trophy,
   Sparkles,
   History,
   ArrowRight,
   ShieldCheck,
   Dices,
   RotateCcw,
   Zap,
   Joystick,
   Puzzle,
   Brain,
   Crosshair,
   Flame,
   Play,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import GameCard from '../components/games/GameCard';
import { ARCADE_CATEGORIES, GAMES, getFeaturedGame } from '../games/catalog';
import {
   getHighScores,
   getRecentlyPlayed,
   recordRecentlyPlayed,
} from '../games/storage';
import { preloadRoute } from '../App';
import { playTone } from '../games/sound';

// Gaming category icon mapping
const getCategoryIcon = (category) => {
   switch (category) {
      case 'Arcade':
         return <Joystick size={13} />;
      case 'Puzzle':
         return <Puzzle size={13} />;
      case 'Strategy':
         return <Crosshair size={13} />;
      case 'Brain':
         return <Brain size={13} />;
      case 'Skill':
         return <Zap size={13} />;
      case 'Action':
         return <Flame size={13} />;
      default:
         return <Gamepad2 size={13} />;
   }
};

export default function GamesPage() {
   const navigate = useNavigate();
   const [searchQuery, setSearchQuery] = useState('');
   const [activeCategory, setActiveCategory] = useState('All');
   const [highScores, setHighScores] = useState({});
   const [recentIds, setRecentIds] = useState([]);
   const [showResetConfirm, setShowResetConfirm] = useState(false);
   const [rollingDice, setRollingDice] = useState(false);

   // Load high scores and recently played from storage
   useEffect(() => {
      setHighScores(getHighScores());
      setRecentIds(getRecentlyPlayed());

      const handleHighScoreUpdate = () => setHighScores(getHighScores());
      const handleRecentUpdate = () => setRecentIds(getRecentlyPlayed());

      window.addEventListener(
         'klique:arcade:highscore_updated',
         handleHighScoreUpdate,
      );
      window.addEventListener(
         'klique:arcade:recent_updated',
         handleRecentUpdate,
      );

      return () => {
         window.removeEventListener(
            'klique:arcade:highscore_updated',
            handleHighScoreUpdate,
         );
         window.removeEventListener(
            'klique:arcade:recent_updated',
            handleRecentUpdate,
         );
      };
   }, []);

   const featuredGame = useMemo(() => getFeaturedGame(), []);

   // Resolve recently played game objects
   const recentGames = useMemo(() => {
      if (!recentIds || recentIds.length === 0) return [];
      return recentIds
         .map((id) => GAMES.find((g) => g.id === id))
         .filter(Boolean);
   }, [recentIds]);

   // Filter pipeline
   const filteredGames = useMemo(() => {
      const q = searchQuery.trim().toLowerCase();
      return GAMES.filter((game) => {
         const matchCat =
            activeCategory === 'All' || game.category === activeCategory;
         if (!matchCat) return false;
         if (!q) return true;
         return (
            game.title.toLowerCase().includes(q) ||
            game.description.toLowerCase().includes(q) ||
            game.category.toLowerCase().includes(q) ||
            (game.tagline && game.tagline.toLowerCase().includes(q))
         );
      });
   }, [activeCategory, searchQuery]);

   const categoryCounts = useMemo(() => {
      const counts = { All: GAMES.length };
      ARCADE_CATEGORIES.forEach((cat) => {
         if (cat !== 'All') {
            counts[cat] = GAMES.filter((g) => g.category === cat).length;
         }
      });
      return counts;
   }, []);

   // Pick a random game with arcade sound & micro animation
   const handlePlayRandom = () => {
      setRollingDice(true);
      try {
         playTone(520, 0.08, 'sine', 0.1);
      } catch (e) {
         // Ignore
      }

      setTimeout(() => {
         setRollingDice(false);
         const randomIndex = Math.floor(Math.random() * GAMES.length);
         const chosen = GAMES[randomIndex];
         recordRecentlyPlayed(chosen.id);
         navigate(chosen.route);
      }, 450);
   };

   // Reset all scores
   const handleClearAllScores = () => {
      try {
         localStorage.removeItem('klique:arcade:high-scores');
         setHighScores({});
         setShowResetConfirm(false);
         window.dispatchEvent(
            new CustomEvent('klique:arcade:highscore_updated'),
         );
      } catch (e) {
         // Ignore
      }
   };

   const seoJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Klique Arcade - ${GAMES.length} Free Lightweight Browser Games`,
      description: `Take a break with ${GAMES.length} fast, private, browser-native arcade games: Snake, 2048, Minesweeper, Word Guess, Brick Breaker, Retro Pong, Space Defend, and more.`,
      url: 'https://klique.netlify.app/games',
   };

   return (
      <div
         className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#09090b] px-3 py-6 font-sans text-zinc-100 sm:px-5 sm:py-8 md:px-10 overflow-hidden
     before:absolute
     before:inset-0
     before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]
     after:absolute
     after:inset-0
     after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
         <div
            className="
     pointer-events-none absolute inset-0
     bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]
   "
         />

         {/* Static ambient backdrop matching Paraphrase.jsx */}
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         <SEO
            title={`Klique Arcade - ${GAMES.length} Free Browser Games | Snake, 2048, Word Guess, Pong`}
            description={`Take a quick break with ${GAMES.length} lightweight, private browser games in Klique Arcade. Play Snake, 2048, Minesweeper, Word Guess, Brick Breaker, Retro Pong, Space Defend with zero install or ads.`}
            canonicalUrl="https://klique.netlify.app/games"
            jsonLd={seoJsonLd}
         />

         {/* Ambient Gaming Glow Orbs in Background */}
         <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
            <div className="absolute top-10 left-1/4 h-96 w-96 rounded-full bg-[#daf4aa]/5 blur-[120px]" />
            <div className="absolute top-48 right-1/4 h-80 w-80 rounded-full bg-cyan-500/5 blur-[130px]" />
         </div>

         {/* Navigation */}
         <div className="relative z-[100] w-full">
            <Navbar />
         </div>

         {/* Main Container */}
         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full flex-col px-4 pb-28 pt-20 sm:px-6 sm:pb-24 sm:pt-24 lg:pl-24 lg:pr-8">
            <div className="mx-auto w-full max-w-6xl">
               {/* Hero Arcade Header matching Paraphrase.jsx typography */}
               <div className="mb-8 flex flex-col items-start justify-between gap-6 border-b border-zinc-800/80 pb-8 sm:flex-row sm:items-end">
                  <div className="space-y-1">
                     <h1 className="text-2xl font-medium tracking-tight text-zinc-100 sm:text-3xl md:text-4xl">
                        Take a quick break.
                     </h1>
                     <p className="text-zinc-400 text-xs sm:text-sm font-normal max-w-xl">
                        A curated collection of lightweight, instant, and
                        private browser arcade games. Zero ads, zero trackers,
                        your high scores stay strictly on your device.
                     </p>

                     {/* Live Feature Badges */}
                     <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#18181b] px-2.5 py-1 text-zinc-400 font-mono text-[11px]">
                           <Gamepad2 size={13} className="text-[#daf4aa]" />
                           <span>{GAMES.length} Instant Games</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#18181b] px-2.5 py-1 text-zinc-400 font-mono text-[11px]">
                           <Zap size={13} className="text-cyan-400" />
                           <span>0s Load Time</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#18181b] px-2.5 py-1 text-zinc-400 font-mono text-[11px]">
                           <ShieldCheck size={13} className="text-[#daf4aa]" />
                           <span>100% Client-Side</span>
                        </span>
                     </div>
                  </div>

                  {/* Top Header Actions matching Paraphrase.jsx buttons */}
                  <div className="flex items-center gap-3">
                     <button
                        type="button"
                        onClick={handlePlayRandom}
                        disabled={rollingDice}
                        className="h-10 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-zinc-200 border border-zinc-700/60 inline-flex items-center gap-2 px-4 text-xs font-medium transition-all group shadow-lg">
                        <Dices
                           size={15}
                           className={`text-[#daf4aa] transition-transform duration-500 ${rollingDice ? 'rotate-180 scale-125' : ''}`}
                        />
                        <span>Surprise Game</span>
                     </button>
                  </div>
               </div>

               {/* Recently Played Strip matching Paraphrase.jsx surface */}
               {recentGames.length > 0 && (
                  <div className="mb-8 flex flex-wrap items-center gap-2.5 rounded-2xl border border-zinc-800/80 bg-[#121214] p-3.5 shadow-xl">
                     <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-zinc-500 mr-2">
                        <History size={13} className="text-zinc-500" />
                        Jump Back In:
                     </span>
                     {recentGames.map((game) => (
                        <Link
                           key={game.id}
                           to={game.route}
                           onMouseEnter={() => preloadRoute(game.route)}
                           className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 bg-[#18181b] hover:bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors">
                           <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                 backgroundColor: game.accentColor || '#daf4aa',
                              }}
                           />
                           <span>{game.title}</span>
                           <ArrowRight size={11} className="opacity-60" />
                        </Link>
                     ))}
                  </div>
               )}

               {/* Featured Game Spotlight matching Paraphrase.jsx card */}
               {featuredGame && !searchQuery && activeCategory === 'All' && (
                  <div className="relative mb-8 overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#121214] p-6 shadow-2xl sm:p-7">
                     {/* Ambient backdrop glow */}
                     <div
                        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-10 blur-3xl"
                        style={{
                           backgroundColor:
                              featuredGame.accentColor || '#daf4aa',
                        }}
                     />

                     <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
                        <div className="max-w-xl">
                           <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-mono text-amber-300 mb-3">
                              <Sparkles size={12} />
                              <span>Featured Classic</span>
                           </div>

                           <h2 className="text-2xl font-medium tracking-tight text-zinc-100 sm:text-3xl">
                              {featuredGame.title}
                           </h2>

                           <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                              {featuredGame.description}
                           </p>

                           <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500 font-mono">
                              <span className="uppercase text-zinc-400 px-2 py-0.5 rounded bg-[#18181b] border border-zinc-800">
                                 {featuredGame.category}
                              </span>
                              <span>•</span>
                              <span>{featuredGame.controls}</span>
                              {highScores[featuredGame.id] && (
                                 <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-[#daf4aa] font-bold">
                                       <Trophy
                                          size={13}
                                          className="text-amber-400"
                                       />
                                       Best: {highScores[featuredGame.id]} pts
                                    </span>
                                 </>
                              )}
                           </div>
                        </div>

                        <Link
                           to={featuredGame.route}
                           onMouseEnter={() => preloadRoute(featuredGame.route)}
                           className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] px-5 py-3 text-xs font-medium text-zinc-200 border border-zinc-700/60 shadow-lg transition-all">
                           <Play
                              size={14}
                              className="fill-current text-[#daf4aa]"
                           />
                           <span>Launch {featuredGame.title}</span>
                        </Link>
                     </div>
                  </div>
               )}

               {/* Search & Category Filter Navigation */}
               <div className="mb-7 space-y-4">
                  {/* Search Bar & Reset Trigger matching Paraphrase.jsx Search input */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                     <div className="relative w-full max-w-md">
                        <Search
                           size={15}
                           className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
                        />
                        <input
                           type="text"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           placeholder={`Search ${GAMES.length} games (e.g. 'Wordle', 'Tetris', 'Shooter', 'Pong')...`}
                           className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[#18181b] border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                        />
                        {searchQuery && (
                           <button
                              type="button"
                              onClick={() => setSearchQuery('')}
                              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500 hover:text-zinc-200">
                              <X size={14} />
                           </button>
                        )}
                     </div>

                     {Object.keys(highScores).length > 0 && (
                        <button
                           type="button"
                           onClick={() => setShowResetConfirm(true)}
                           className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                           <RotateCcw size={12} />
                           <span>Reset High Scores</span>
                        </button>
                     )}
                  </div>

                  {/* Category Pills matching Paraphrase tool list */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                     {ARCADE_CATEGORIES.map((cat) => {
                        const active = activeCategory === cat;
                        return (
                           <button
                              key={cat}
                              onClick={() => {
                                 setActiveCategory(cat);
                                 try {
                                    playTone(400, 0.04, 'triangle', 0.05);
                                 } catch (e) {
                                    // Ignore
                                 }
                              }}
                              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs transition-all ${
                                 active
                                    ? 'bg-zinc-800 border border-zinc-700 text-zinc-100 font-medium shadow-md'
                                    : 'bg-[#141416] border border-zinc-800/70 text-zinc-400 hover:bg-zinc-800/70 hover:border-zinc-700 hover:text-zinc-100'
                              }`}>
                              <span>{getCategoryIcon(cat)}</span>
                              <span>{cat}</span>
                              <span
                                 className={`rounded px-1.5 py-0.2 font-mono text-[10px] ${
                                    active
                                       ? 'bg-zinc-900 text-zinc-200 font-bold'
                                       : 'bg-[#18181b] text-zinc-500'
                                 }`}>
                                 {categoryCounts[cat] || 0}
                              </span>
                           </button>
                        );
                     })}
                  </div>
               </div>

               {/* Game Grid */}
               <AnimatePresence mode="wait">
                  {filteredGames.length > 0 ? (
                     <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredGames.map((game) => (
                           <GameCard
                              key={game.id}
                              game={game}
                              highScore={highScores[game.id]}
                              onSelect={() => recordRecentlyPlayed(game.id)}
                           />
                        ))}
                     </div>
                  ) : (
                     /* Empty State matching Paraphrase.jsx surface */
                     <div className="my-16 rounded-2xl border border-zinc-800/80 bg-[#121214] p-10 text-center shadow-xl">
                        <Gamepad2
                           size={28}
                           className="mx-auto text-zinc-600 mb-3"
                        />
                        <h3 className="text-base font-medium text-zinc-200">
                           No games found
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500">
                           No matching arcade game for &ldquo;{searchQuery}
                           &rdquo;. Try another keyword or reset filters.
                        </p>
                        <button
                           type="button"
                           onClick={() => {
                              setSearchQuery('');
                              setActiveCategory('All');
                           }}
                           className="mt-4 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] border border-zinc-700/60 px-4 py-2 text-xs font-medium text-zinc-200 transition-colors">
                           Clear search
                        </button>
                     </div>
                  )}
               </AnimatePresence>
            </div>
         </main>

         {/* Reset High Scores Confirmation Modal matching Paraphrase.jsx dialog */}
         {showResetConfirm && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
               <div className="w-full max-w-sm rounded-2xl border border-zinc-800/80 bg-[#101012]/95 p-6 text-center shadow-2xl backdrop-blur-xl">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-3">
                     <RotateCcw size={20} />
                  </div>
                  <h3 className="text-base font-medium text-zinc-100">
                     Reset All High Scores?
                  </h3>
                  <p className="mt-2 text-xs text-zinc-400">
                     This will permanently erase your stored scores across all{' '}
                     {GAMES.length} games. This action cannot be reversed.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                     <button
                        type="button"
                        onClick={handleClearAllScores}
                        className="rounded-lg bg-rose-600/90 hover:bg-rose-600 px-4 py-2 text-xs font-medium text-white transition-colors">
                        Yes, Reset All
                     </button>
                     <button
                        type="button"
                        onClick={() => setShowResetConfirm(false)}
                        className="rounded-lg border border-zinc-700/60 bg-[#27272a] hover:bg-[#3f3f46] px-4 py-2 text-xs font-medium text-zinc-200 transition-colors">
                        Cancel
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
