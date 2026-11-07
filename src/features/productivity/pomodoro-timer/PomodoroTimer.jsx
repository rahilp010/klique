/* eslint-disable no-unused-vars */
import React, {
   useState,
   useEffect,
   useRef,
   useMemo,
   useCallback,
} from 'react';
import {
   Timer,
   Play,
   Pause,
   RotateCcw,
   SkipForward,
   Volume2,
   VolumeX,
   Bell,
   Settings2,
   CheckCircle2,
   Coffee,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ChevronRight,
   Flame,
   Clock,
   Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import {
   POMODORO_MODES,
   POMODORO_PRESETS,
   formatPomodoroTime,
   playPomodoroChime,
   sendBrowserNotification,
} from '../../../lib/calculations/pomodoro';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';
import { InputControl } from '../../../components/ui/CustomControl';

/* -------------------------------------------------------------------------- */
/*  FAQS                                                                      */
/* -------------------------------------------------------------------------- */

const FAQS = [
   {
      question: 'What is the Pomodoro Technique?',
      answer:
         'The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. It uses a timer to break down work into intervals, traditionally 25 minutes in length, separated by 5-minute short breaks. After four consecutive pomodoros, you take a longer 15 to 30-minute break.',
   },
   {
      question: 'Why does breaking work into intervals improve focus?',
      answer:
         'Short bursts of focused work reduce cognitive fatigue, fight procrastination, and minimize multitasking. Knowing a dedicated rest interval is coming creates urgency and sharp mental clarity.',
   },
   {
      question: 'Do notification chimes and sounds work offline?',
      answer:
         'Yes! All sound chimes are synthesized directly in your browser using the HTML5 Web Audio API. No external mp3 files are downloaded, and no user activity leaves your machine.',
   },
   {
      question: 'Can I use keyboard shortcuts?',
      answer:
         'Press Space to Play/Pause, R to Reset the current interval, and S to Skip to the next session.',
   },
];

export default function PomodoroTimer() {
   // Preset configuration
   const [activePreset, setActivePreset] = useState(POMODORO_PRESETS[0]);
   const [workDuration, setWorkDuration] = useState(25);
   const [shortBreakDuration, setShortBreakDuration] = useState(5);
   const [longBreakDuration, setLongBreakDuration] = useState(15);
   const [longBreakInterval, setLongBreakInterval] = useState(4);

   // Timer state
   const [mode, setMode] = useState(POMODORO_MODES.WORK);
   const [timeLeft, setTimeLeft] = useState(25 * 60);
   const [isRunning, setIsRunning] = useState(false);
   const [completedSessions, setCompletedSessions] = useState(() => {
      const saved = localStorage.getItem('klique_pomodoro_completed');
      return saved ? parseInt(saved, 10) : 0;
   });
   const [currentTask, setCurrentTask] = useState('');
   const [soundEnabled, setSoundEnabled] = useState(true);
   const [notificationsEnabled, setNotificationsEnabled] = useState(false);
   const [showSettings, setShowSettings] = useState(false);
   const [openFaq, setOpenFaq] = useState(null);

   // Toast
   const [toast, setToast] = useState({ visible: false, message: '' });
   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   // Total seconds for current mode
   const totalDurationSeconds = useMemo(() => {
      if (mode === POMODORO_MODES.WORK) return workDuration * 60;
      if (mode === POMODORO_MODES.SHORT_BREAK) return shortBreakDuration * 60;
      return longBreakDuration * 60;
   }, [mode, workDuration, shortBreakDuration, longBreakDuration]);

   // Calculate progress 0 - 100
   const progress = useMemo(() => {
      if (totalDurationSeconds <= 0) return 100;
      return Math.min(
         100,
         Math.max(
            0,
            ((totalDurationSeconds - timeLeft) / totalDurationSeconds) * 100,
         ),
      );
   }, [timeLeft, totalDurationSeconds]);

   // Notification permission check on mount
   useEffect(() => {
      if ('Notification' in window && Notification.permission === 'granted') {
         setNotificationsEnabled(true);
      }
   }, []);

   const requestNotificationPermission = async () => {
      if (!('Notification' in window)) {
         showToast('Browser notifications are not supported in this browser.');
         return;
      }
      try {
         const permission = await Notification.requestPermission();
         if (permission === 'granted') {
            setNotificationsEnabled(true);
            showToast('Desktop notifications enabled!');
         } else {
            showToast('Notifications permission declined.');
         }
      } catch {
         showToast('Notification request cancelled.');
      }
   };

   // Apply Preset
   const handleApplyPreset = (preset) => {
      setActivePreset(preset);
      setWorkDuration(preset.work);
      setShortBreakDuration(preset.shortBreak);
      setLongBreakDuration(preset.longBreak);
      setLongBreakInterval(preset.longInterval);
      setIsRunning(false);

      if (mode === POMODORO_MODES.WORK) setTimeLeft(preset.work * 60);
      else if (mode === POMODORO_MODES.SHORT_BREAK)
         setTimeLeft(preset.shortBreak * 60);
      else setTimeLeft(preset.longBreak * 60);

      showToast(`Applied preset: ${preset.name}`);
   };

   // Mode Switch
   const switchMode = useCallback(
      (newMode) => {
         setIsRunning(false);
         setMode(newMode);
         if (newMode === POMODORO_MODES.WORK) setTimeLeft(workDuration * 60);
         else if (newMode === POMODORO_MODES.SHORT_BREAK)
            setTimeLeft(shortBreakDuration * 60);
         else setTimeLeft(longBreakDuration * 60);
      },
      [workDuration, shortBreakDuration, longBreakDuration],
   );

   // Transition to next session
   const handleSessionCompletion = useCallback(() => {
      if (mode === POMODORO_MODES.WORK) {
         const updated = completedSessions + 1;
         setCompletedSessions(updated);
         localStorage.setItem('klique_pomodoro_completed', updated.toString());

         if (soundEnabled) playPomodoroChime('work');
         if (notificationsEnabled) {
            sendBrowserNotification('Pomodoro Completed! 🎯', {
               body: 'Great job! Time to relax during a short break.',
            });
         }

         if (updated % longBreakInterval === 0) {
            switchMode(POMODORO_MODES.LONG_BREAK);
            showToast('Milestone achieved! Enjoy your long restorative break.');
         } else {
            switchMode(POMODORO_MODES.SHORT_BREAK);
            showToast('Focus session complete! Take a breather.');
         }
      } else {
         if (soundEnabled) playPomodoroChime('break');
         if (notificationsEnabled) {
            sendBrowserNotification('Break Finished! ⚡', {
               body: 'Ready to refocus on your goals?',
            });
         }
         switchMode(POMODORO_MODES.WORK);
         showToast('Break over! Let’s get back in the zone.');
      }
   }, [
      mode,
      completedSessions,
      longBreakInterval,
      soundEnabled,
      notificationsEnabled,
      switchMode,
   ]);

   // Timer countdown interval effect
   useEffect(() => {
      let interval = null;
      if (isRunning && timeLeft > 0) {
         interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
         }, 1000);
      } else if (isRunning && timeLeft === 0) {
         clearInterval(interval);
         handleSessionCompletion();
      }
      return () => clearInterval(interval);
   }, [isRunning, timeLeft, handleSessionCompletion]);

   // Update page title with remaining time
   useEffect(() => {
      const modeLabel = mode === POMODORO_MODES.WORK ? 'Focus' : 'Break';
      document.title = isRunning
         ? `(${formatPomodoroTime(timeLeft)}) ${modeLabel} — Klique Pomodoro`
         : 'Pomodoro Focus Timer — Free Online Tool | Klique';
   }, [timeLeft, isRunning, mode]);

   // Keyboard shortcuts
   useEffect(() => {
      const handleKeyDown = (e) => {
         // Ignore keyboard shortcuts if active element is text input
         if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName))
            return;

         if (e.code === 'Space') {
            e.preventDefault();
            setIsRunning((prev) => !prev);
         } else if (e.code === 'KeyR') {
            e.preventDefault();
            setIsRunning(false);
            if (mode === POMODORO_MODES.WORK) setTimeLeft(workDuration * 60);
            else if (mode === POMODORO_MODES.SHORT_BREAK)
               setTimeLeft(shortBreakDuration * 60);
            else setTimeLeft(longBreakDuration * 60);
            showToast('Timer reset.');
         } else if (e.code === 'KeyS') {
            e.preventDefault();
            handleSessionCompletion();
         }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [
      mode,
      workDuration,
      shortBreakDuration,
      longBreakDuration,
      handleSessionCompletion,
   ]);

   // Color styling by mode
   const themeColor = useMemo(() => {
      if (mode === POMODORO_MODES.WORK)
         return {
            ring: '#daf4aa',
            text: 'text-[#daf4aa]',
            badge: 'bg-[#daf4aa]/10 text-[#daf4aa] border-[#daf4aa]/20',
         };
      if (mode === POMODORO_MODES.SHORT_BREAK)
         return {
            ring: '#38bdf8',
            text: 'text-sky-400',
            badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
         };
      return {
         ring: '#a855f7',
         text: 'text-purple-400',
         badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      };
   }, [mode]);

   // Related tools
   const relatedTools = useMemo(() => getRelatedTools('pomodoro-timer', 4), []);

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden
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

         {/* Static ambient backdrop */}
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         <SEO
            title="Pomodoro Focus Timer & Productivity Clock - Free Online Tool | Klique"
            description="Boost productivity and maintain deep focus with customizable Pomodoro sessions, clean intervals, Web Audio chimes, and session streak tracking."
            keywords="pomodoro timer, focus timer, productivity clock, 25 5 timer, deep work timer, study timer, online pomodoro"
            canonicalUrl="https://klique.netlify.app/tools/pomodoro-timer"
         />

         {/* Toast Notification */}
         <AnimatePresence>
            {toast.visible && (
               <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-2 rounded-full border border-[#daf4aa]/30 bg-zinc-900/90 px-4 py-2 text-xs font-semibold text-[#daf4aa] shadow-2xl backdrop-blur-md">
                  <Sparkles size={14} className="animate-spin text-[#daf4aa]" />
                  <span>{toast.message}</span>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Header / Navbar */}
         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Title Section */}
            <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                     <Timer size={14} className="text-[#daf4aa]" />
                     <span>Productivity & Focus</span>
                     <span className="text-zinc-600">•</span>
                     <span className="text-[#daf4aa]">100% Free & Private</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                     Pomodoro <span className="text-[#daf4aa]">Timer</span>
                  </h1>
                  <p className="text-zinc-400 text-sm max-w-xl">
                     Optimize mental energy and crush deep work with structured
                     focus intervals, synthesized chimes, and streak logging.
                  </p>
               </motion.div>

               {/* Quick Stats Badges */}
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-xs font-medium text-zinc-300 backdrop-blur-md">
                     <Flame
                        size={16}
                        className="text-amber-400 animate-pulse"
                     />
                     <span>
                        <strong className="text-white font-bold">
                           {completedSessions}
                        </strong>{' '}
                        Pomodoros Completed
                     </span>
                  </div>

                  <button
                     onClick={() => setSoundEnabled((prev) => !prev)}
                     className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        soundEnabled
                           ? 'border-[#daf4aa]/30 bg-[#daf4aa]/10 text-[#daf4aa]'
                           : 'border-zinc-800 bg-zinc-900/60 text-zinc-500'
                     }`}
                     title={soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}>
                     {soundEnabled ? (
                        <Volume2 size={16} />
                     ) : (
                        <VolumeX size={16} />
                     )}
                  </button>

                  <button
                     onClick={requestNotificationPermission}
                     className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        notificationsEnabled
                           ? 'border-[#daf4aa]/30 bg-[#daf4aa]/10 text-[#daf4aa]'
                           : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                     }`}
                     title="Desktop Notifications">
                     <Bell size={16} />
                  </button>

                  <button
                     onClick={() => setShowSettings((prev) => !prev)}
                     className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                        showSettings
                           ? 'border-[#daf4aa]/40 bg-zinc-800 text-white'
                           : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                     }`}
                     title="Settings">
                     <Settings2 size={16} />
                  </button>
               </div>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
               <Link to="/" className="hover:text-zinc-200 transition-colors">
                  Home
               </Link>
               <span>/</span>
               <Link
                  to="/category"
                  className="hover:text-zinc-200 transition-colors">
                  Productivity
               </Link>
               <span>/</span>
               <span className="text-[#daf4aa]">Pomodoro Timer</span>
            </div>

            {/* Timer Central Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
               {/* Main Clock Face Card */}
               <div className="lg:col-span-8 flex flex-col items-center justify-center rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                  {/* Mode Tabs */}
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-1.5 mb-8 backdrop-blur-md">
                     <button
                        onClick={() => switchMode(POMODORO_MODES.WORK)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                           mode === POMODORO_MODES.WORK
                              ? 'bg-[#daf4aa] text-zinc-950 font-bold shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        <Zap size={14} />
                        <span>Focus</span>
                     </button>
                     <button
                        onClick={() => switchMode(POMODORO_MODES.SHORT_BREAK)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                           mode === POMODORO_MODES.SHORT_BREAK
                              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-lg'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        <Coffee size={14} />
                        <span>Short Break</span>
                     </button>
                     <button
                        onClick={() => switchMode(POMODORO_MODES.LONG_BREAK)}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                           mode === POMODORO_MODES.LONG_BREAK
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-lg'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        <Sparkles size={14} />
                        <span>Long Break</span>
                     </button>
                  </div>

                  {/* Circular Timer Ring with SVG */}
                  <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-4">
                     <svg
                        className="w-full h-full -rotate-90 transform"
                        viewBox="0 0 100 100">
                        {/* Background track circle */}
                        <circle
                           cx="50"
                           cy="50"
                           r="44"
                           className="stroke-zinc-800/80"
                           strokeWidth="4"
                           fill="transparent"
                        />
                        {/* Animated progress circle */}
                        <circle
                           cx="50"
                           cy="50"
                           r="44"
                           stroke={themeColor.ring}
                           strokeWidth="4.5"
                           strokeDasharray="276.46"
                           strokeDashoffset={276.46 - (276.46 * progress) / 100}
                           strokeLinecap="round"
                           fill="transparent"
                           className="transition-all duration-500 ease-out"
                        />
                     </svg>

                     {/* Center Display */}
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                           className={`text-5xl sm:text-6xl font-black tracking-tight text-white font-mono drop-shadow-md`}>
                           {formatPomodoroTime(timeLeft)}
                        </span>
                        <span
                           className={`mt-2 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${themeColor.badge}`}>
                           {mode === POMODORO_MODES.WORK
                              ? 'Deep Focus Session'
                              : 'Rest & Refresh'}
                        </span>
                     </div>
                  </div>

                  {/* Active Task Input */}
                  <div className="w-full max-w-md mt-4 mb-6">
                     <InputControl
                        type="text"
                        value={currentTask}
                        onChange={(e) => setCurrentTask(e.target.value)}
                        placeholder="What are you currently focusing on?"
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#daf4aa]/50 focus:outline-none transition-all text-center"
                     />
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center gap-4 mt-2">
                     <button
                        onClick={() => {
                           setIsRunning(false);
                           if (mode === POMODORO_MODES.WORK)
                              setTimeLeft(workDuration * 60);
                           else if (mode === POMODORO_MODES.SHORT_BREAK)
                              setTimeLeft(shortBreakDuration * 60);
                           else setTimeLeft(longBreakDuration * 60);
                           showToast('Timer reset.');
                        }}
                        className="p-3.5 rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-md"
                        title="Reset Timer (R)">
                        <RotateCcw size={18} />
                     </button>

                     <button
                        onClick={() => setIsRunning((prev) => !prev)}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all shadow-xl ${
                           isRunning
                              ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
                              : 'bg-[#daf4aa] hover:bg-[#c9e894] text-zinc-950 shadow-[#daf4aa]/20'
                        }`}>
                        {isRunning ? (
                           <Pause size={18} />
                        ) : (
                           <Play size={18} className="fill-current" />
                        )}
                        <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
                     </button>

                     <button
                        onClick={handleSessionCompletion}
                        className="p-3.5 rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all shadow-md"
                        title="Skip to Next Session (S)">
                        <SkipForward size={18} />
                     </button>
                  </div>

                  <p className="text-[11px] text-zinc-500 mt-6">
                     Shortcuts:{' '}
                     <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                        Space
                     </kbd>{' '}
                     Start/Pause &bull;{' '}
                     <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                        R
                     </kbd>{' '}
                     Reset &bull;{' '}
                     <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                        S
                     </kbd>{' '}
                     Skip
                  </p>
               </div>

               {/* Right Panel: Presets & Custom Configuration */}
               <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Presets Card */}
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl">
                     <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                        <Sparkles size={16} className="text-[#daf4aa]" />
                        <span>Focus Intervals</span>
                     </h2>
                     <p className="text-xs text-zinc-400 mb-4">
                        Choose a cadence matching your mental flow.
                     </p>

                     <div className="flex flex-col gap-2.5">
                        {POMODORO_PRESETS.map((preset) => {
                           const isSelected = activePreset.id === preset.id;
                           return (
                              <button
                                 key={preset.id}
                                 onClick={() => handleApplyPreset(preset)}
                                 className={`w-full text-left p-3 rounded-xl border transition-all ${
                                    isSelected
                                       ? 'border-[#daf4aa]/40 bg-[#daf4aa]/10 text-white shadow-md'
                                       : 'border-zinc-800/80 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                                 }`}>
                                 <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-zinc-200">
                                       {preset.name}
                                    </span>
                                    {isSelected && (
                                       <CheckCircle2
                                          size={14}
                                          className="text-[#daf4aa]"
                                       />
                                    )}
                                 </div>
                                 <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                                    {preset.description}
                                 </p>
                              </button>
                           );
                        })}
                     </div>
                  </div>

                  {/* Custom Configuration / Settings */}
                  {showSettings && (
                     <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl">
                        <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                           <Settings2 size={16} className="text-[#daf4aa]" />
                           <span>Custom Durations</span>
                        </h2>

                        <div className="space-y-4 text-xs">
                           <div>
                              <div className="flex justify-between text-zinc-300 mb-1">
                                 <span>Focus Duration</span>
                                 <span className="font-mono font-bold text-[#daf4aa]">
                                    {workDuration} min
                                 </span>
                              </div>
                              <input
                                 type="range"
                                 min="5"
                                 max="120"
                                 value={workDuration}
                                 onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setWorkDuration(val);
                                    if (
                                       mode === POMODORO_MODES.WORK &&
                                       !isRunning
                                    )
                                       setTimeLeft(val * 60);
                                 }}
                                 className="w-full accent-[#daf4aa] cursor-pointer"
                              />
                           </div>

                           <div>
                              <div className="flex justify-between text-zinc-300 mb-1">
                                 <span>Short Break</span>
                                 <span className="font-mono font-bold text-sky-400">
                                    {shortBreakDuration} min
                                 </span>
                              </div>
                              <input
                                 type="range"
                                 min="1"
                                 max="30"
                                 value={shortBreakDuration}
                                 onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setShortBreakDuration(val);
                                    if (
                                       mode === POMODORO_MODES.SHORT_BREAK &&
                                       !isRunning
                                    )
                                       setTimeLeft(val * 60);
                                 }}
                                 className="w-full accent-sky-500 cursor-pointer"
                              />
                           </div>

                           <div>
                              <div className="flex justify-between text-zinc-300 mb-1">
                                 <span>Long Break</span>
                                 <span className="font-mono font-bold text-purple-400">
                                    {longBreakDuration} min
                                 </span>
                              </div>
                              <input
                                 type="range"
                                 min="5"
                                 max="60"
                                 value={longBreakDuration}
                                 onChange={(e) => {
                                    const val = parseInt(e.target.value, 10);
                                    setLongBreakDuration(val);
                                    if (
                                       mode === POMODORO_MODES.LONG_BREAK &&
                                       !isRunning
                                    )
                                       setTimeLeft(val * 60);
                                 }}
                                 className="w-full accent-purple-500 cursor-pointer"
                              />
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Feature Highlights Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
                  <div className="w-10 h-10 rounded-xl bg-[#daf4aa]/10 border border-[#daf4aa]/20 flex items-center justify-center text-[#daf4aa] mb-3">
                     <Volume2 size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                     Web Audio Synthesis
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                     Rich harmonic chords synthesized directly via browser audio
                     oscillators. No heavy audio downloads needed.
                  </p>
               </div>

               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
                     <Bell size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                     Background Tab Alerts
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                     Receive native desktop notifications and tab title timers
                     even when working in other browser windows.
                  </p>
               </div>

               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                     <Flame size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                     Session Logging
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                     Completed pomodoro milestones are saved client-side in
                     localStorage for motivation and streak persistence.
                  </p>
               </div>
            </div>

            {/* FAQs Accordion */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl mb-12">
               <div className="flex items-center gap-2 mb-6">
                  <HelpCircle size={18} className="text-[#daf4aa]" />
                  <h2 className="text-lg font-bold text-white">
                     Frequently Asked Questions
                  </h2>
               </div>
               <div className="space-y-4">
                  {FAQS.map((faq, idx) => {
                     const isOpen = openFaq === idx;
                     return (
                        <div
                           key={idx}
                           className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 overflow-hidden transition-all">
                           <button
                              onClick={() => setOpenFaq(isOpen ? null : idx)}
                              className="w-full flex items-center justify-between p-4 text-left text-xs font-semibold text-zinc-200 hover:text-white transition-colors">
                              <span>{faq.question}</span>
                              <ChevronDown
                                 size={16}
                                 className={`transform transition-transform text-zinc-500 ${
                                    isOpen ? 'rotate-180 text-[#daf4aa]' : ''
                                 }`}
                              />
                           </button>
                           {isOpen && (
                              <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-3">
                                 {faq.answer}
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
               <div className="mt-8">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                     <Sparkles size={16} className="text-[#daf4aa]" />
                     <span>Related Productivity Tools</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     {relatedTools.map((tool) => (
                        <Link
                           key={tool.id}
                           to={tool.slug}
                           onMouseEnter={() => preloadRoute(tool.slug)}
                           className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-800/40 backdrop-blur-md">
                           <div className="text-xs font-bold text-zinc-200 group-hover:text-[#daf4aa] transition-colors">
                              {tool.name}
                           </div>
                           <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                              {tool.description}
                           </p>
                        </Link>
                     ))}
                  </div>
               </div>
            )}
         </main>
      </div>
   );
}
