import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
   ArrowLeft,
   Gamepad2,
   HelpCircle,
   Trophy,
   X,
   ShieldCheck,
   Maximize2,
   Minimize2,
   RotateCcw,
   Volume2,
   VolumeX,
   Keyboard,
   Play,
} from 'lucide-react';
import Navbar from '../Navbar';
import SEO from '../SEO';
import VirtualGamepad from './VirtualGamepad';
import {
   recordRecentlyPlayed,
   getArcadeSettings,
   saveArcadeSettings,
} from '../../games/storage';
import { playTone } from '../../games/sound';

export const ArcadeShellContext = React.createContext({
   isFullscreen: false,
   soundEnabled: true,
   toggleFullscreen: () => {},
   handleRestart: () => {},
});

export const useArcadeShell = () => React.useContext(ArcadeShellContext);

export default function GameShell({
   gameId,
   title,
   category,
   description,
   instructions = [],
   controlsHelp = [],
   score,
   scoreLabel = 'Score',
   bestScore,
   bestScoreLabel = 'High Score',
   headerExtra,
   children,
   maxWidth = 'max-w-4xl',
}) {
   const containerRef = useRef(null);
   const [helpOpen, setHelpOpen] = useState(false);
   const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
   const [isCssFullscreen, setIsCssFullscreen] = useState(false);
   const [soundEnabled, setSoundEnabled] = useState(() => getArcadeSettings().soundEnabled);
   const [showGamepad, setShowGamepad] = useState(false);
   const [sessionKey, setSessionKey] = useState(0);
   const [restartNotice, setRestartNotice] = useState(false);

   const isFullscreen = isNativeFullscreen || isCssFullscreen;

   // Lock html & body to prevent page scrolling in fullscreen
   useEffect(() => {
      if (isFullscreen) {
         document.documentElement.classList.add('arcade-fullscreen-active');
         document.body.classList.add('arcade-fullscreen-active');
      } else {
         document.documentElement.classList.remove('arcade-fullscreen-active');
         document.body.classList.remove('arcade-fullscreen-active');
      }
      return () => {
         document.documentElement.classList.remove('arcade-fullscreen-active');
         document.body.classList.remove('arcade-fullscreen-active');
      };
   }, [isFullscreen]);

   // Record recently played game on mount
   useEffect(() => {
      if (gameId) {
         recordRecentlyPlayed(gameId);
      }
   }, [gameId]);

   // Listen for external settings updates (e.g. from sound synthesis or another tab)
   useEffect(() => {
      const handleSettingsUpdate = (e) => {
         if (e.detail && typeof e.detail.soundEnabled === 'boolean') {
            setSoundEnabled(e.detail.soundEnabled);
         }
      };
      window.addEventListener('klique:arcade:settings_updated', handleSettingsUpdate);
      return () => {
         window.removeEventListener('klique:arcade:settings_updated', handleSettingsUpdate);
      };
   }, []);

   // Listen for fullscreen change events
   useEffect(() => {
      const handleFullscreenChange = () => {
         const isNative = !!(document.fullscreenElement || document.webkitFullscreenElement);
         setIsNativeFullscreen(isNative);
         if (!isNative) {
            setIsCssFullscreen(false);
         }
      };

      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      return () => {
         document.removeEventListener('fullscreenchange', handleFullscreenChange);
         document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      };
   }, []);

   // Toggle Fullscreen (Native with CSS fallback for mobile Safari)
   const toggleFullscreen = useCallback(async () => {
      const elem = containerRef.current;
      if (!elem) return;

      if (!isFullscreen) {
         if (elem.requestFullscreen) {
            try {
               await elem.requestFullscreen();
               setIsNativeFullscreen(true);
            } catch (err) {
               // Fallback to CSS overlay fullscreen
               setIsCssFullscreen(true);
            }
         } else if (elem.webkitRequestFullscreen) {
            try {
               await elem.webkitRequestFullscreen();
               setIsNativeFullscreen(true);
            } catch (err) {
               setIsCssFullscreen(true);
            }
         } else {
            setIsCssFullscreen(true);
         }
      } else {
         if (document.fullscreenElement || document.webkitFullscreenElement) {
            try {
               if (document.exitFullscreen) {
                  await document.exitFullscreen();
               } else if (document.webkitExitFullscreen) {
                  await document.webkitExitFullscreen();
               }
            } catch (err) {
               // Ignore
            }
         }
         setIsNativeFullscreen(false);
         setIsCssFullscreen(false);
      }
   }, [isFullscreen]);

   // Toggle Master Sound
   const handleToggleSound = useCallback(() => {
      const next = !soundEnabled;
      setSoundEnabled(next);
      saveArcadeSettings({ soundEnabled: next });
      if (next) {
         try {
            playTone(600, 0.08, 'sine', 0.1);
         } catch (e) {
            // Ignore
         }
      }
   }, [soundEnabled]);

   // Restart Active Game
   const handleRestart = useCallback(() => {
      // 1. Increment sessionKey to cleanly re-mount child game
      setSessionKey((prev) => prev + 1);
      // 2. Dispatch custom arcade restart event
      window.dispatchEvent(
         new CustomEvent('klique:arcade:restart_game', {
            detail: { gameId },
         })
      );
      // 3. Dispatch simulated 'r' key
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', code: 'KeyR', bubbles: true }));

      // Subtle audio feedback & toast
      try {
         playTone(480, 0.06, 'triangle', 0.1);
      } catch (e) {
         // Ignore
      }
      setRestartNotice(true);
      setTimeout(() => setRestartNotice(false), 1400);
   }, [gameId]);

   // Universal Arrow Key & Space Scroll Interceptor
   // Prevents browser from scrolling the page or fullscreen container when playing games
   useEffect(() => {
      const handlePreventScroll = (e) => {
         const target = e.target;
         const activeEl = document.activeElement;
         const isInput =
            (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) ||
            (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable));

         if (isInput) return;

         const scrollKeys = [
            'ArrowUp',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            ' ',
            'Spacebar',
            'PageUp',
            'PageDown',
            'Home',
            'End',
         ];

         if (scrollKeys.includes(e.key) || e.code === 'Space') {
            e.preventDefault();
         }
      };

      // Capture phase interceptor ensures browser default scrolling is blocked immediately
      window.addEventListener('keydown', handlePreventScroll, { capture: true, passive: false });
      return () => {
         window.removeEventListener('keydown', handlePreventScroll, { capture: true });
      };
   }, []);

   // Universal Keyboard Shortcuts Handler
   useEffect(() => {
      const handleKeyDown = (e) => {
         // Never intercept when user is typing in form inputs / contenteditable
         const activeEl = document.activeElement;
         const isInput =
            activeEl &&
            (activeEl.tagName === 'INPUT' ||
               activeEl.tagName === 'TEXTAREA' ||
               activeEl.isContentEditable);
         if (isInput) return;

         if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            toggleFullscreen();
         } else if (e.key === 'm' || e.key === 'M') {
            e.preventDefault();
            handleToggleSound();
         } else if (e.key === 'r' || e.key === 'R') {
            // Only trigger shell restart if not modified by Ctrl/Cmd
            if (!e.ctrlKey && !e.metaKey) {
               e.preventDefault();
               handleRestart();
            }
         } else if (e.key === 'h' || e.key === 'H' || e.key === '?') {
            e.preventDefault();
            setHelpOpen((prev) => !prev);
         } else if (e.key === 'c' || e.key === 'C') {
            e.preventDefault();
            setShowGamepad((prev) => !prev);
         } else if (e.key === 'Escape') {
            if (isCssFullscreen) {
               setIsCssFullscreen(false);
            }
            if (helpOpen) {
               setHelpOpen(false);
            }
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [toggleFullscreen, handleToggleSound, handleRestart, isCssFullscreen, helpOpen]);

   const seoJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: `${title} - Klique Arcade`,
      description: description,
      gamePlatform: 'Web Browser',
      applicationCategory: 'Game',
      offers: {
         '@type': 'Offer',
         price: '0',
         priceCurrency: 'USD',
      },
   };

   return (
      <ArcadeShellContext.Provider value={{ isFullscreen, soundEnabled, toggleFullscreen, handleRestart }}>
         <div className="bg-black relative isolate selection:bg-zinc-800 selection:text-zinc-100 min-h-screen text-zinc-100
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
            {/* Static ambient backdrop with 56px grid matching Paraphrase.jsx */}
            <div
               aria-hidden
               className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
            />
            <div
               aria-hidden
               className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
            />

            <SEO
               title={`${title} - Free Online Game | Klique Arcade`}
               description={description}
               canonicalUrl={`https://klique.netlify.app/games/${gameId}`}
               jsonLd={seoJsonLd}
            />

            {/* Navigation - hidden when in fullscreen */}
            {!isFullscreen && (
               <div className="relative z-[100] w-full">
                  <Navbar />
               </div>
            )}

            {/* Main Game Page Container */}
            <div className={`relative z-10 mx-auto flex w-full max-w-6xl flex-col ${
               isFullscreen
                  ? 'p-0 min-h-screen'
                  : 'min-h-[100dvh] px-0 pb-32 pt-14 sm:px-2 sm:pb-24 sm:pt-16 lg:pl-20'
            }`}>
               <main className="relative w-full">
                  <div className={`mx-auto flex w-full ${isFullscreen ? 'max-w-none' : 'max-w-4xl min-w-0 flex-col gap-6 pb-10 sm:gap-8'}`}>
                     {/* Standard View Header & Breadcrumbs matching Paraphrase.jsx */}
                     {!isFullscreen && (
                        <>
                           <div className="flex items-center justify-between px-2 sm:px-0">
                              <Link
                                 to="/games"
                                 className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#18181b] px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white">
                                 <ArrowLeft size={13} />
                                 <span>Back to Arcade</span>
                              </Link>

                              <div className="flex items-center gap-2">
                                 <span className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#18181b] px-3 py-1.5 text-[11px] font-medium text-zinc-400">
                                    <ShieldCheck size={12} className="text-[#daf4aa]" />
                                    <span>100% Client-Side</span>
                                 </span>
                              </div>
                           </div>

                           {/* Game Title & Metrics Bar matching Paraphrase.jsx */}
                           <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between px-2 sm:px-0">
                              <div className="space-y-1">
                                 <h2 className="text-zinc-500 text-sm sm:text-base font-light font-mono tracking-wider">
                                    Klique Arcade • {category}
                                 </h2>
                                 <h1 className="text-2xl font-medium tracking-tight text-zinc-100 sm:text-3xl md:text-4xl">
                                    {title}
                                 </h1>
                                 <p className="text-zinc-400 text-xs sm:text-sm font-normal max-w-xl">
                                    {description}
                                 </p>
                              </div>

                              {/* Telemetry & Action Buttons */}
                              <div className="flex items-center gap-2">
                                 {score !== undefined && score !== null && (
                                    <div className="flex items-center gap-2 rounded-lg bg-[#18181b] border border-zinc-800 px-3 py-2 text-xs font-mono">
                                       <span className="text-zinc-500 uppercase text-[10px]">{scoreLabel}:</span>
                                       <span className="font-bold text-zinc-100 text-sm">{score}</span>
                                    </div>
                                 )}

                                 {bestScore !== undefined && bestScore !== null && (
                                    <div className="flex items-center gap-1.5 rounded-lg bg-[#18181b] border border-zinc-800 px-3 py-2 text-xs font-mono">
                                       <Trophy size={13} className="text-amber-400" />
                                       <span className="text-zinc-500 uppercase text-[10px]">{bestScoreLabel}:</span>
                                       <span className="font-bold text-[#daf4aa] text-sm">{bestScore}</span>
                                    </div>
                                 )}

                                 {headerExtra}

                                 <button
                                    type="button"
                                    onClick={() => setHelpOpen(true)}
                                    className="p-2.5 rounded-lg bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                                    title="How to Play & Rules">
                                    <HelpCircle size={18} />
                                 </button>
                              </div>
                           </div>

                           {/* Tool command hint matching Paraphrase.jsx */}
                           <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 -mt-2 sm:-mt-3 px-2 sm:px-0">
                              <div className="flex items-center gap-2 text-xs text-zinc-500">
                                 <span>Arcade Controls</span>
                                 <kbd className="px-2 py-1 rounded-md border border-zinc-800 bg-[#121214] text-zinc-400 font-mono">
                                    [F] Fullscreen
                                 </kbd>
                                 <kbd className="px-2 py-1 rounded-md border border-zinc-800 bg-[#121214] text-zinc-400 font-mono">
                                    [M] Mute
                                 </kbd>
                                 <kbd className="px-2 py-1 rounded-md border border-zinc-800 bg-[#121214] text-zinc-400 font-mono">
                                    [R] Restart
                                 </kbd>
                              </div>
                              <span className="hidden sm:block text-xs text-zinc-600">
                                 100% Client-Side • Local High Score Persistence
                              </span>
                           </div>
                        </>
                     )}

                     {/* Main Stage Card Panel matching Paraphrase.jsx editor box */}
                     <div className={isFullscreen ? 'w-full' : 'relative z-20 w-full min-w-0'}>
                        <div
                           ref={containerRef}
                           className={`w-full min-w-0 transition-all duration-300 ${
                              isFullscreen
                                 ? 'arcade-fullscreen-shell fixed inset-0 z-[9999] bg-[#09090b] flex flex-col h-[100dvh] max-h-[100dvh] w-screen overflow-hidden p-2 sm:p-3 select-none touch-none no-scrollbar'
                                 : 'flex flex-col bg-[#121214] border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden'
                           }`}>
                           {/* Card Top Toolbar (Both in Fullscreen and Standard View) */}
                           {isFullscreen ? (
                              <div className="w-full flex items-center justify-between gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-xl mb-1 sm:mb-2 shadow-xl shrink-0">
                                 <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                    <span className="flex h-2 w-2 rounded-full bg-[#daf4aa] animate-pulse shrink-0" />
                                    <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider uppercase truncate max-w-[120px] sm:max-w-none">
                                       {title}
                                    </span>
                                    <span className="hidden xs:inline-block rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                                       {category}
                                    </span>
                                 </div>

                                 {/* Live Scores in Fullscreen */}
                                 <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                                    {score !== undefined && score !== null && (
                                       <div className="flex items-center gap-1 sm:gap-1.5 text-xs">
                                          <span className="text-zinc-500 text-[10px] uppercase sm:text-[11px]">{scoreLabel}:</span>
                                          <span className="font-mono font-bold text-white">{score}</span>
                                       </div>
                                    )}
                                    {bestScore !== undefined && bestScore !== null && (
                                       <div className="flex items-center gap-1 sm:gap-1.5 text-xs">
                                          <Trophy size={11} className="text-amber-400" />
                                          <span className="font-mono font-bold text-[#daf4aa]">{bestScore}</span>
                                       </div>
                                    )}
                                 </div>

                                 {/* Fullscreen Quick Controls */}
                                 <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                    <button
                                       type="button"
                                       onClick={handleToggleSound}
                                       title="Toggle Sound (M)"
                                       className="p-1.5 sm:p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-zinc-300 hover:text-white transition-colors">
                                       {soundEnabled ? <Volume2 size={15} className="text-[#daf4aa]" /> : <VolumeX size={15} className="text-rose-400" />}
                                    </button>

                                    <button
                                       type="button"
                                       onClick={handleRestart}
                                       title="Restart Game (R)"
                                       className="p-1.5 sm:p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-zinc-300 hover:text-white transition-colors">
                                       <RotateCcw size={15} className="text-[#daf4aa]" />
                                    </button>

                                    <button
                                       type="button"
                                       onClick={() => setShowGamepad(!showGamepad)}
                                       title="Toggle Touch Gamepad (C)"
                                       className={`p-1.5 sm:p-2 rounded-xl border transition-colors ${
                                          showGamepad
                                             ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                             : 'border-zinc-700/80 bg-zinc-800/80 text-zinc-300 hover:text-white'
                                       }`}>
                                       <Gamepad2 size={15} />
                                    </button>

                                    <button
                                       type="button"
                                       onClick={() => setHelpOpen(true)}
                                       title="How to Play (H)"
                                       className="hidden sm:inline-flex p-1.5 sm:p-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-zinc-300 hover:text-white transition-colors">
                                       <HelpCircle size={15} />
                                    </button>

                                    {/* Exit Fullscreen */}
                                    <button
                                       type="button"
                                       onClick={toggleFullscreen}
                                       title="Exit Fullscreen (ESC)"
                                       className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/25 transition-all">
                                       <Minimize2 size={13} />
                                       <span className="hidden sm:inline">Exit</span>
                                       <kbd className="hidden md:inline-block ml-0.5 px-1 py-0.2 rounded bg-black/40 text-[9px] font-mono">ESC</kbd>
                                    </button>
                                 </div>
                              </div>
                           ) : (
                              <div className="flex min-w-0 items-center justify-between gap-2 border-b border-zinc-800/50 p-3 sm:p-4 bg-[#121214]">
                                 <div className="flex items-center gap-2">
                                    <span className="flex h-2 w-2 rounded-full bg-[#daf4aa] animate-pulse" />
                                    <span className="text-sm font-medium text-zinc-200">{title}</span>
                                    <span className="text-xs text-zinc-500 font-mono">({category})</span>
                                 </div>

                                 {/* Arcade Action Toolbar */}
                                 <div className="flex items-center gap-2">
                                    <button
                                       type="button"
                                       onClick={toggleFullscreen}
                                       title="Toggle Fullscreen (F)"
                                       className="flex h-9 items-center gap-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] px-3 text-xs font-medium text-zinc-200 border border-zinc-700/60 transition-all">
                                       <Maximize2 size={13} />
                                       <span className="hidden sm:inline">Fullscreen</span>
                                    </button>

                                    <button
                                       type="button"
                                       onClick={handleToggleSound}
                                       title="Toggle Sound (M)"
                                       className="p-2 rounded-lg bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
                                       {soundEnabled ? <Volume2 size={15} className="text-[#daf4aa]" /> : <VolumeX size={15} className="text-rose-400" />}
                                    </button>

                                    <button
                                       type="button"
                                       onClick={handleRestart}
                                       title="Restart (R)"
                                       className="p-2 rounded-lg bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors">
                                       <RotateCcw size={15} />
                                    </button>

                                    <button
                                       type="button"
                                       onClick={() => setShowGamepad(!showGamepad)}
                                       title="Toggle Touch Gamepad (C)"
                                       className={`p-2 rounded-lg border transition-colors ${
                                          showGamepad
                                             ? 'bg-zinc-800 border-zinc-700 text-[#daf4aa]'
                                             : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                                       }`}>
                                       <Gamepad2 size={15} />
                                    </button>
                                 </div>
                              </div>
                           )}

                           {/* Inner Game Stage Area */}
                           <div
                              key={sessionKey}
                              className={`w-full flex flex-col items-center justify-center ${
                                 isFullscreen
                                    ? 'flex-1 min-h-0 w-full overflow-hidden py-0.5'
                                    : 'bg-[#0f0f11] p-3 sm:p-5 min-h-[360px]'
                              }`}>
                              {React.isValidElement(children)
                                 ? React.cloneElement(children, { isFullscreen })
                                 : children}
                           </div>

                           {/* Floating Notification Toast when Game Restarts */}
                           {restartNotice && (
                              <div className="pointer-events-none fixed bottom-12 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-2 rounded-full bg-[#18181b] border border-[#daf4aa]/40 px-4 py-2 text-xs font-semibold text-[#daf4aa] shadow-2xl backdrop-blur-xl animate-fade-in">
                                 <RotateCcw size={13} className="animate-spin" />
                                 <span>Game Reset Cleanly</span>
                              </div>
                           )}

                           {/* Virtual Touch Controller Pad */}
                           {showGamepad && (
                              <div className={`w-full shrink-0 ${isFullscreen ? 'max-h-28 overflow-hidden pt-1' : 'p-3 bg-[#121214] border-t border-zinc-800/60'}`}>
                                 <VirtualGamepad onClose={() => setShowGamepad(false)} />
                              </div>
                           )}
                        </div>
                     </div>

                     {/* Instructions & Objectives Box matching Paraphrase.jsx output/config panel */}
                     {!isFullscreen && (controlsHelp.length > 0 || instructions.length > 0) && (
                        <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-4 sm:p-5 shadow-xl">
                           <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3 mb-4">
                              <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                                 <Gamepad2 size={16} className="text-[#daf4aa]" />
                                 <span>Rules & Controls</span>
                              </h3>
                              <span className="text-xs text-zinc-500 font-mono">
                                 Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">F</kbd> for Fullscreen
                              </span>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                 <div className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider font-mono">
                                    Controls
                                 </div>
                                 <ul className="space-y-1.5 text-xs text-zinc-400">
                                    {controlsHelp.map((help, idx) => (
                                       <li key={idx} className="flex items-start gap-2">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#daf4aa] mt-1.5 shrink-0" />
                                          <span>{help}</span>
                                       </li>
                                    ))}
                                 </ul>
                              </div>

                              <div>
                                 <div className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider font-mono">
                                    Objectives
                                 </div>
                                 <ul className="space-y-1.5 text-xs text-zinc-400">
                                    {instructions.map((ins, idx) => (
                                       <li key={idx} className="flex items-start gap-2">
                                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                                          <span>{ins}</span>
                                       </li>
                                    ))}
                                 </ul>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </main>
            </div>

            {/* How to Play & Controls Modal matching Paraphrase tool picker */}
            {helpOpen && (
               <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
                  <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800/80 bg-[#101012]/95 backdrop-blur-xl p-5 sm:p-6 shadow-2xl">
                     <div className="flex items-center justify-between pb-3 border-b border-zinc-800/70">
                        <h3 className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                           <HelpCircle size={16} className="text-[#daf4aa]" />
                           <span>How to Play {title}</span>
                        </h3>
                        <button
                           type="button"
                           onClick={() => setHelpOpen(false)}
                           className="text-xs text-zinc-500 hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-zinc-800 transition-colors">
                           Esc
                        </button>
                     </div>

                     <div className="mt-4 space-y-2.5 text-xs text-zinc-300">
                        {instructions.length > 0 ? (
                           instructions.map((step, idx) => (
                              <div key={idx} className="flex gap-2.5 items-start">
                                 <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#18181b] border border-zinc-800 text-[11px] font-mono font-bold text-[#daf4aa] mt-0.5">
                                    {idx + 1}
                                 </span>
                                 <span>{step}</span>
                              </div>
                           ))
                        ) : (
                           <p>{description}</p>
                        )}
                     </div>

                     {/* Keyboard Shortcuts Cheat Sheet */}
                     <div className="mt-5 rounded-xl bg-[#141416] border border-zinc-800/70 p-3.5">
                        <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
                           <Keyboard size={13} className="text-[#daf4aa]" />
                           <span>Universal Arcade Shortcuts</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-300">
                           <div className="flex items-center justify-between">
                              <span className="text-zinc-500">Toggle Fullscreen:</span>
                              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[10px]">F</kbd>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-zinc-500">Mute / Unmute:</span>
                              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[10px]">M</kbd>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-zinc-500">Restart Active Game:</span>
                              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[10px]">R</kbd>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-zinc-500">Toggle Gamepad:</span>
                              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[10px]">C</kbd>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-zinc-500">Help & Rules:</span>
                              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[10px]">H / ?</kbd>
                           </div>
                           <div className="flex items-center justify-between">
                              <span className="text-zinc-500">Exit Fullscreen:</span>
                              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-200 font-mono text-[10px]">ESC</kbd>
                           </div>
                        </div>
                     </div>

                     <button
                        type="button"
                        onClick={() => setHelpOpen(false)}
                        className="mt-5 w-full rounded-lg bg-[#27272a] hover:bg-[#3f3f46] border border-zinc-700/60 py-2.5 text-xs font-medium text-zinc-200 transition-colors">
                        Got It, Let’s Play!
                     </button>
                  </div>
               </div>
            )}
         </div>
      </ArcadeShellContext.Provider>
   );
}
