/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
   Keyboard,
   Timer,
   RotateCcw,
   Award,
   Zap,
   Check,
   Sparkles,
   ChevronRight,
   HelpCircle,
   Flame,
   BarChart2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';
import { InputControl } from '../../../components/ui/CustomControl';

const SAMPLE_TEXTS = [
   'Technology has transformed the way human beings communicate, create, and collaborate. From distributed systems and cloud networks to client-side web applications, modern software allows developers to build private, high-speed tools that solve real-world problems in seconds without compromising user privacy.',
   'The quick brown fox jumps over the lazy dog while software engineers write elegant, maintainable code. Continuous practice and deliberate attention to keystroke accuracy build mechanical fluency, boosting your typing velocity and reducing cognitive overhead during programming and writing.',
   'Building scalable digital products requires a balance between speed of execution and rigorous software architecture. By focusing on modular user interfaces, accessible design patterns, and zero-latency client processing, we create experiences that feel instantaneous and reliable.',
];

const FAQS = [
   {
      question: 'How is Words Per Minute (WPM) calculated?',
      answer:
         'Standard WPM is calculated as: [(Total Correct Characters ÷ 5) ÷ (Time in Seconds ÷ 60)]. A standard word is calibrated to exactly 5 keystrokes including spaces.',
   },
   {
      question: 'How is accuracy computed?',
      answer:
         'Accuracy is computed as: [(Total Correct Keystrokes ÷ Total Keystrokes Attempted) × 100%]. Striving for 98%+ accuracy produces the fastest typing speed over time.',
   },
   {
      question: 'Is my typing speed test record saved?',
      answer:
         'Your personal best WPM record is stored safely in your browser’s local storage so you can track personal progress across testing sessions.',
   },
   {
      question: 'Can I choose different test durations?',
      answer:
         'Yes! You can toggle between 15 seconds (sprint burst), 30 seconds (standard agility), or 60 seconds (endurance speed).',
   },
];

export default function TypingSpeedTest() {
   const [duration, setDuration] = useState(30); // 15 | 30 | 60
   const [timeLeft, setTimeLeft] = useState(30);
   const [isActive, setIsActive] = useState(false);
   const [isFinished, setIsFinished] = useState(false);

   const [targetText, setTargetText] = useState(SAMPLE_TEXTS[0]);
   const [inputText, setInputText] = useState('');

   const [highScore, setHighScore] = useState(() => {
      try {
         return Number(localStorage.getItem('klique_typing_highscore')) || 0;
      } catch {
         return 0;
      }
   });

   const [toast, setToast] = useState({ visible: false, message: '' });
   const inputRef = useRef(null);
   const timerRef = useRef(null);

   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   // Reset or change test
   const handleResetTest = (newDuration = duration) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setDuration(newDuration);
      setTimeLeft(newDuration);
      setIsActive(false);
      setIsFinished(false);
      setInputText('');
      const randomText = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
      setTargetText(randomText);
      trackToolReset('typing-speed-test');
      setTimeout(() => inputRef.current?.focus(), 50);
   };

   // Timer logic
   useEffect(() => {
      if (isActive && timeLeft > 0) {
         timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
               if (prev <= 1) {
                  clearInterval(timerRef.current);
                  setIsActive(false);
                  setIsFinished(true);
                  return 0;
               }
               return prev - 1;
            });
         }, 1000);
      }
      return () => {
         if (timerRef.current) clearInterval(timerRef.current);
      };
   }, [isActive, timeLeft]);

   // Keystroke handler
   const handleInputChange = (e) => {
      if (isFinished) return;
      const val = e.target.value;

      if (!isActive && val.length > 0) {
         setIsActive(true);
      }

      setInputText(val);

      if (val.length >= targetText.length) {
         clearInterval(timerRef.current);
         setIsActive(false);
         setIsFinished(true);
      }
   };

   // Real-time calculations
   const results = useMemo(() => {
      const elapsedSeconds = duration - timeLeft || 1;
      let correctChars = 0;
      let totalTyped = inputText.length;

      for (let i = 0; i < totalTyped; i++) {
         if (inputText[i] === targetText[i]) {
            correctChars++;
         }
      }

      const wpm = Math.round((correctChars / 5) / (elapsedSeconds / 60)) || 0;
      const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;
      const errors = totalTyped - correctChars;

      return { wpm, accuracy, errors, correctChars, totalTyped };
   }, [inputText, targetText, duration, timeLeft]);

   // Save high score
   useEffect(() => {
      if (isFinished && results.wpm > highScore) {
         setHighScore(results.wpm);
         try {
            localStorage.setItem('klique_typing_highscore', results.wpm.toString());
         } catch {
            // ignore
         }
         showToast(`🎉 New Personal Best: ${results.wpm} WPM!`);
      }
   }, [isFinished, results.wpm, highScore]);

   const relatedTools = useMemo(() => getRelatedTools('typing-speed-test', 3), []);

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden
            before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]
            after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
         <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]" />

         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         <SEO
            title="Typing Speed Test - Test WPM & Accuracy Online | Klique"
            description="Measure your Words Per Minute (WPM), keystroke accuracy, and error rates in real time with 15s, 30s, and 60s interactive typing tests."
            keywords="typing speed test, wpm test online, check typing speed, typing accuracy test, typing test 30 seconds, klique"
            canonicalUrl="https://klique.netlify.app/tools/typing-speed-test"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'Typing Speed Test',
               applicationCategory: 'EducationalApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Calculate typing speed (WPM), accuracy, and keystroke metrics with real-time feedback and personal records.',
            }}
         />

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

         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-xs text-zinc-400">
               <Link to="/" className="hover:text-zinc-200 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category" className="hover:text-zinc-200 transition-colors">Student & Education</Link>
               <span>/</span>
               <span className="text-[#daf4aa]">Typing Speed Test</span>
            </div>

            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:items-center">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#daf4aa]/30 bg-[#daf4aa]/10 text-[#daf4aa] text-xs font-medium tracking-wide mb-3">
                     <Keyboard size={13} className="text-[#daf4aa]" />
                     <span>STUDENT & EDUCATION SUITE</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                     Typing Speed <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#daf4aa] via-lime-300 to-emerald-400">Test</span>
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                     Measure your raw speed, accuracy, and character errors with real-time keystroke feedback.
                  </p>
               </div>
               <div className="flex items-center gap-2">
                  <button
                     onClick={() => handleResetTest(duration)}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-medium text-zinc-200 transition-all cursor-pointer">
                     <RotateCcw size={13} />
                     <span>Restart</span>
                  </button>
               </div>
            </div>

            {/* Test Configuration & Live Dashboard */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl mb-8">
               {/* Time selector */}
               <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-medium">Duration:</span>
                  {[15, 30, 60].map((t) => (
                     <button
                        key={t}
                        onClick={() => handleResetTest(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                           duration === t
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                              : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                        }`}>
                        {t}s
                     </button>
                  ))}
               </div>

               {/* Live Counters */}
               <div className="flex items-center gap-6">
                  <div className="text-center">
                     <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Time</span>
                     <div className="text-lg font-mono font-bold text-white flex items-center gap-1 justify-center">
                        <Timer size={14} className={isActive ? 'text-[#daf4aa] animate-spin' : 'text-zinc-400'} />
                        <span>{timeLeft}s</span>
                     </div>
                  </div>

                  <div className="text-center">
                     <span className="text-[10px] text-zinc-500 uppercase tracking-wider">WPM</span>
                     <div className="text-lg font-mono font-bold text-[#daf4aa]">
                        {results.wpm}
                     </div>
                  </div>

                  <div className="text-center">
                     <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Accuracy</span>
                     <div className="text-lg font-mono font-bold text-emerald-400">
                        {results.accuracy}%
                     </div>
                  </div>

                  <div className="text-center">
                     <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Best</span>
                     <div className="text-lg font-mono font-bold text-white">
                        {highScore}
                     </div>
                  </div>
               </div>
            </div>

            {/* Interactive Typing Arena */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6 mb-8">
               {/* Text Display with Per-Character Highlighting */}
               <div
                  onClick={() => inputRef.current?.focus()}
                  className="p-6 rounded-xl bg-zinc-950/80 border border-zinc-800 font-mono text-base sm:text-lg leading-relaxed select-none cursor-text tracking-wide min-h-[140px]">
                  {targetText.split('').map((char, index) => {
                     let colorClass = 'text-zinc-500';
                     let bgClass = '';

                     if (index < inputText.length) {
                        if (inputText[index] === char) {
                           colorClass = 'text-[#daf4aa] font-semibold';
                        } else {
                           colorClass = 'text-red-400 bg-red-500/20 rounded';
                        }
                     } else if (index === inputText.length) {
                        bgClass = 'border-b-2 border-[#daf4aa] animate-pulse text-zinc-100';
                     }

                     return (
                        <span key={index} className={`${colorClass} ${bgClass}`}>
                           {char}
                        </span>
                     );
                  })}
               </div>

               {/* Invisible typing input field */}
               <InputControl
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  disabled={isFinished}
                  autoFocus
                  placeholder="Start typing above text to begin countdown..."
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
               />

               {/* Reset Button */}
               <div className="flex justify-center">
                  <button
                     onClick={() => handleResetTest(duration)}
                     className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all cursor-pointer">
                     <RotateCcw size={14} />
                     <span>Restart Test</span>
                  </button>
               </div>
            </div>

            {/* Completion Summary Card */}
            {isFinished && (
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 sm:p-8 rounded-2xl bg-zinc-900/60 border border-[#daf4aa]/40 backdrop-blur-md shadow-2xl text-center space-y-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-[#daf4aa]/10 text-[#daf4aa] flex items-center justify-center mx-auto">
                     <Award size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Test Complete!</h3>
                  <div className="grid grid-cols-3 gap-4 max-w-md mx-auto pt-2">
                     <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                        <div className="text-xs text-zinc-400">Final Speed</div>
                        <div className="text-2xl font-mono font-bold text-[#daf4aa] mt-1">
                           {results.wpm} WPM
                        </div>
                     </div>
                     <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                        <div className="text-xs text-zinc-400">Accuracy</div>
                        <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
                           {results.accuracy}%
                        </div>
                     </div>
                     <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800">
                        <div className="text-xs text-zinc-400">Errors</div>
                        <div className="text-2xl font-mono font-bold text-red-400 mt-1">
                           {results.errors}
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}

            {/* FAQs Accordion */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-4 mb-8">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle size={18} className="text-[#daf4aa]" />
                  Frequently Asked Questions
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FAQS.map((faq, i) => (
                     <div key={i} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50 space-y-1.5">
                        <h4 className="text-sm font-semibold text-zinc-200">{faq.question}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">{faq.answer}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
               <div className="border-t border-zinc-800/80 pt-8 space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-base font-semibold text-white">Related Tools</h3>
                     <Link
                        to="/category"
                        className="text-xs text-[#daf4aa] hover:underline flex items-center gap-1 transition-colors">
                        Browse all tools <ChevronRight size={13} />
                     </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     {relatedTools.map((tool) => (
                        <Link
                           key={tool.id}
                           to={tool.slug}
                           onMouseEnter={() => preloadRoute(tool.slug)}
                           className="group p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all">
                           <div className="text-xs font-semibold text-zinc-200 group-hover:text-[#daf4aa] transition-colors">
                              {tool.name}
                           </div>
                           <div className="text-[11px] text-zinc-500 line-clamp-2 mt-1">
                              {tool.description}
                           </div>
                        </Link>
                     ))}
                  </div>
               </div>
            )}
         </main>
      </div>
   );
}

