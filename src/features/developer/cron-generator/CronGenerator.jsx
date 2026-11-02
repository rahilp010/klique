/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   Clock,
   Copy,
   Download,
   Trash2,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ChevronRight,
   Check,
   ArrowRight,
   Calendar,
   Layers,
   Timer,
   Terminal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { explainCron, getNextRuns } from '../../../lib/calculations/cron';
import { trackToolCopy, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*  PRESETS & FAQS                                                            */
/* -------------------------------------------------------------------------- */

const PRESETS = [
   {
      id: 'every-15m',
      name: 'Every 15 Minutes',
      cron: '*/15 * * * *',
      desc: 'High-frequency background sync jobs',
   },
   {
      id: 'daily-9am',
      name: 'Daily at 9:00 AM',
      cron: '0 9 * * *',
      desc: 'Morning digest and scheduled reports',
   },
   {
      id: 'weekdays-9am',
      name: 'Weekdays at 9:00 AM',
      cron: '0 9 * * 1-5',
      desc: 'Monday through Friday business notifications',
   },
   {
      id: 'weekly-midnight',
      name: 'Weekly on Sunday at Midnight',
      cron: '0 0 * * 0',
      desc: 'Weekly database vacuum & backup routine',
   },
   {
      id: 'monthly-1st',
      name: '1st of Every Month at Midnight',
      cron: '0 0 1 * *',
      desc: 'Monthly invoice billing & cycle rollover',
   },
];

const FAQS = [
   {
      question: 'What are the 5 fields of a standard Cron expression?',
      answer:
         'In standard POSIX cron, the 5 space-separated fields represent:\n1. Minute (0 - 59)\n2. Hour (0 - 23)\n3. Day of the Month (1 - 31)\n4. Month of the Year (1 - 12)\n5. Day of the Week (0 - 6, where 0 is Sunday)',
   },
   {
      question: 'What do special characters like *, /, -, and , mean?',
      answer:
         '• * (Asterisk): Matches any value.\n• / (Slash): Specifies step intervals (e.g. */10 in minutes means every 10 minutes).\n• - (Hyphen): Defines a range (e.g. 1-5 for Monday to Friday).\n• , (Comma): Separates a list of explicit values (e.g. 0,6 for Sunday and Saturday).',
   },
   {
      question: 'Can I use this in AWS EventBridge, GitHub Actions, and Linux crontab?',
      answer:
         'Yes! Standard 5-field cron expressions are universally supported across Linux crontabs, GitHub Actions schedules, Kubernetes CronJobs, AWS EventBridge, and Node.js node-cron.',
   },
];

export default function CronGenerator() {
   // State
   const [cronExpression, setCronExpression] = useState('0 9 * * 1-5');

   // UI State
   const [showQuickSetup, setShowQuickSetup] = useState(false);
   const [selectedPreset, setSelectedPreset] = useState('weekdays-9am');
   const [openFaq, setOpenFaq] = useState(null);

   // Toast State
   const [toast, setToast] = useState({ message: '', visible: false });

   const showToast = (message) => {
      setToast({ message, visible: true });
      setTimeout(() => {
         setToast({ message: '', visible: false });
      }, 2500);
   };

   // Evaluations
   const explanation = useMemo(() => {
      return explainCron(cronExpression);
   }, [cronExpression]);

   const nextRuns = useMemo(() => {
      if (!explanation.isValid) return [];
      return getNextRuns(cronExpression, 5);
   }, [cronExpression, explanation.isValid]);

   const applyPreset = (preset) => {
      setSelectedPreset(preset.id);
      setCronExpression(preset.cron);
      showToast(`Applied schedule: ${preset.name}`);
   };

   const handleReset = () => {
      setCronExpression('0 9 * * 1-5');
      setSelectedPreset('weekdays-9am');
      trackToolReset('cron-generator');
      showToast('Reset cron generator.');
   };

   const handleCopyCron = () => {
      navigator.clipboard.writeText(cronExpression);
      trackToolCopy('cron-generator', { outputType: 'cron' });
      showToast('Copied cron expression!');
   };

   const handleCopyExplanation = () => {
      navigator.clipboard.writeText(explanation.description);
      trackToolCopy('cron-generator', { outputType: 'explanation' });
      showToast('Copied human schedule description!');
   };

   const relatedTools = useMemo(() => getRelatedTools('cron-generator', 3), []);

   // 5 field breakdown
   const parts = cronExpression.trim().split(/\s+/);
   const [min = '*', hour = '*', dom = '*', mon = '*', dow = '*'] = parts;

   const updatePart = (index, value) => {
      const current = [...parts];
      while (current.length < 5) current.push('*');
      current[index] = value;
      setCronExpression(current.join(' '));
   };

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden
            before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]
            after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
         <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]" />

         {/* Ambient grid backdrop */}
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         {/* In-File Toast Notification */}
         <AnimatePresence>
            {toast.visible && (
               <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-2 rounded-full border border-emerald-500/30 bg-zinc-900/90 px-4 py-2 text-xs font-semibold text-emerald-400 shadow-2xl backdrop-blur-md">
                  <Sparkles size={14} className="animate-spin text-emerald-400" />
                  <span>{toast.message}</span>
               </motion.div>
            )}
         </AnimatePresence>

         <SEO
            title="Cron Expression Generator & Explainer — Build & Translate Crons"
            description="Build, test, and translate standard 5-part cron expressions into human-readable English with upcoming run preview."
            keywords="cron generator, cron expression explainer, crontab generator, cron schedule online, translate cron to english"
         />

         {/* Global Navbar */}
         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         {/* Main Content Area */}
         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Header Section */}
            <div className="mb-6 flex flex-col gap-3">
               <div className="inline-flex items-center gap-2 self-start rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-[#daf4aa] backdrop-blur-sm">
                  <Clock size={13} className="text-[#daf4aa]" />
                  <span>Developer Suite</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">Scheduling & Crontab</span>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        Cron Expression Generator & Explainer
                     </h1>
                     <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                        Create POSIX-compliant 5-field cron schedules with interactive sliders, plain-English translation, and upcoming execution timeline.
                     </p>
                  </div>

                  <div className="flex items-center gap-2">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                        <Terminal size={12} className="text-[#daf4aa]" />
                        POSIX 5-Field Standard
                     </span>
                  </div>
               </div>
            </div>

            {/* Collapsible Quick Presets Accordion */}
            <div className="mb-6 rounded-2xl border border-zinc-800/80 bg-[#121215] overflow-hidden shadow-lg">
               <button
                  type="button"
                  onClick={() => setShowQuickSetup(!showQuickSetup)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors text-left">
                  <div className="flex items-center gap-2">
                     <Sparkles size={15} className="text-[#daf4aa]" />
                     <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                        Quick Crontab Schedules & Presets
                     </span>
                     <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
                        (Every 15m, Daily 9 AM, Weekdays, Sunday Midnight, 1st of Month)
                     </span>
                  </div>
                  <ChevronDown
                     size={16}
                     className={`text-zinc-400 transition-transform duration-200 ${
                        showQuickSetup ? 'rotate-180' : ''
                     }`}
                  />
               </button>

               <AnimatePresence>
                  {showQuickSetup && (
                     <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 border-t border-zinc-800/80 bg-zinc-950/40">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                           {PRESETS.map((preset) => (
                              <button
                                 key={preset.id}
                                 type="button"
                                 onClick={() => applyPreset(preset)}
                                 className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                                    selectedPreset === preset.id
                                       ? 'border-[#daf4aa] bg-[#daf4aa]/10 text-white'
                                       : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                                 }`}>
                                 <div className="font-semibold text-zinc-200 mb-1">{preset.name}</div>
                                 <div className="text-[11px] font-mono text-[#daf4aa]">
                                    {preset.cron}
                                 </div>
                              </button>
                           ))}
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* Quick Actions Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-[#121215] px-4 py-3 shadow-md">
               <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                     Quick Actions
                  </span>
                  <span className="h-3 w-[1px] bg-zinc-800" />
                  <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                     <span className={`h-2 w-2 rounded-full ${explanation.isValid ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                     {explanation.isValid ? 'Valid Cron Schedule' : 'Invalid Syntax'}
                  </span>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <button
                     type="button"
                     onClick={handleCopyCron}
                     className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-[#cbf094] shadow-sm">
                     <Copy size={13} />
                     <span>Copy `{cronExpression}`</span>
                  </button>

                  <button
                     type="button"
                     onClick={handleCopyExplanation}
                     disabled={!explanation.isValid}
                     className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-40">
                     <span>Copy English Description</span>
                  </button>

                  <button
                     type="button"
                     onClick={handleReset}
                     className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/50 px-2.5 py-1.5 text-xs font-semibold text-zinc-400 transition hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400"
                     title="Reset to default">
                     <Trash2 size={13} />
                     <span className="hidden sm:inline">Reset</span>
                  </button>
               </div>
            </div>

            {/* Status & Plain English Schedule Banner */}
            <div className="mb-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg">
               <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#daf4aa] block mb-1">
                     HUMAN SCHEDULE TRANSLATION
                  </span>
                  <div className="text-lg sm:text-xl font-extrabold text-white">
                     {explanation.description}
                  </div>
               </div>
               <div className="font-mono text-sm sm:text-base font-bold px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[#daf4aa] self-start sm:self-auto select-all">
                  {cronExpression}
               </div>
            </div>

            {/* Dual Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               {/* Left Pane: Interactive 5-Field Editor */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Timer size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           5-Field POSIX Builder
                        </span>
                     </div>
                     <span className="text-[11px] font-mono text-zinc-500">Live Sync</span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {/* Raw Expression Input */}
                     <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                           Cron Expression String
                        </label>
                        <input
                           type="text"
                           value={cronExpression}
                           onChange={(e) => setCronExpression(e.target.value)}
                           placeholder="* * * * *"
                           className="w-full px-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-sm font-mono text-[#daf4aa] font-bold focus:outline-none focus:border-[#daf4aa] transition-colors"
                        />
                     </div>

                     {/* 5 Field Visual Breakdown Boxes */}
                     <div className="grid grid-cols-5 gap-2 text-center pt-2 border-t border-zinc-800/80">
                        <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                           <span className="text-[10px] text-zinc-500 block">Minute</span>
                           <input
                              type="text"
                              value={min}
                              onChange={(e) => updatePart(0, e.target.value)}
                              className="w-full text-center bg-transparent font-mono text-xs text-white font-bold outline-none mt-1"
                           />
                           <span className="text-[9px] text-zinc-500 block">0-59</span>
                        </div>

                        <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                           <span className="text-[10px] text-zinc-500 block">Hour</span>
                           <input
                              type="text"
                              value={hour}
                              onChange={(e) => updatePart(1, e.target.value)}
                              className="w-full text-center bg-transparent font-mono text-xs text-white font-bold outline-none mt-1"
                           />
                           <span className="text-[9px] text-zinc-500 block">0-23</span>
                        </div>

                        <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                           <span className="text-[10px] text-zinc-500 block">Day (Mon)</span>
                           <input
                              type="text"
                              value={dom}
                              onChange={(e) => updatePart(2, e.target.value)}
                              className="w-full text-center bg-transparent font-mono text-xs text-white font-bold outline-none mt-1"
                           />
                           <span className="text-[9px] text-zinc-500 block">1-31</span>
                        </div>

                        <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                           <span className="text-[10px] text-zinc-500 block">Month</span>
                           <input
                              type="text"
                              value={mon}
                              onChange={(e) => updatePart(3, e.target.value)}
                              className="w-full text-center bg-transparent font-mono text-xs text-white font-bold outline-none mt-1"
                           />
                           <span className="text-[9px] text-zinc-500 block">1-12</span>
                        </div>

                        <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                           <span className="text-[10px] text-zinc-500 block">Day (Wk)</span>
                           <input
                              type="text"
                              value={dow}
                              onChange={(e) => updatePart(4, e.target.value)}
                              className="w-full text-center bg-transparent font-mono text-xs text-white font-bold outline-none mt-1"
                           />
                           <span className="text-[9px] text-zinc-500 block">0-6 (Sun)</span>
                        </div>
                     </div>

                     {/* Fast Frequency Buttons */}
                     <div className="pt-2 border-t border-zinc-800/80">
                        <span className="text-xs font-semibold text-zinc-400 block mb-2">
                           Fast Frequency Toggles
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                           <button
                              type="button"
                              onClick={() => setCronExpression('* * * * *')}
                              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 text-left">
                              Every Minute
                           </button>
                           <button
                              type="button"
                              onClick={() => setCronExpression('*/5 * * * *')}
                              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 text-left">
                              Every 5 Min
                           </button>
                           <button
                              type="button"
                              onClick={() => setCronExpression('0 * * * *')}
                              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 text-left">
                              Hourly (00m)
                           </button>
                           <button
                              type="button"
                              onClick={() => setCronExpression('0 0 * * *')}
                              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 text-left">
                              Daily at Midnight
                           </button>
                           <button
                              type="button"
                              onClick={() => setCronExpression('0 12 * * *')}
                              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 text-left">
                              Daily at Noon
                           </button>
                           <button
                              type="button"
                              onClick={() => setCronExpression('0 0 1 1 *')}
                              className="p-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 text-left">
                              Yearly (Jan 1)
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Pane: Upcoming Next 5 Executions */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Next 5 Scheduled Runs
                        </span>
                     </div>
                     <span className="text-xs font-semibold text-emerald-400">
                        Upcoming Timeline
                     </span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {nextRuns.length > 0 ? (
                        <div className="flex flex-col gap-2.5">
                           {nextRuns.map((run, idx) => (
                              <div
                                 key={idx}
                                 className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
                                 <div className="flex items-center gap-2.5">
                                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-400 font-mono text-[10px] flex items-center justify-center font-bold">
                                       {idx + 1}
                                    </span>
                                    <div>
                                       <span className="font-semibold text-zinc-200 block">
                                          {run.toLocaleDateString(undefined, {
                                             weekday: 'short',
                                             year: 'numeric',
                                             month: 'short',
                                             day: 'numeric',
                                          })}
                                       </span>
                                       <span className="text-[11px] font-mono text-[#daf4aa]">
                                          {run.toLocaleTimeString(undefined, {
                                             hour: '2-digit',
                                             minute: '2-digit',
                                             second: '2-digit',
                                          })}
                                       </span>
                                    </div>
                                 </div>

                                 <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-800">
                                    Scheduled Run
                                 </span>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="h-48 flex items-center justify-center rounded-2xl border border-dashed border-zinc-800 text-xs text-zinc-500">
                           Invalid cron expression
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Bottom FAQ Section */}
            <div className="mt-12 rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl">
               <div className="flex items-center gap-2 mb-4 text-[#daf4aa]">
                  <HelpCircle size={18} />
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                     Frequently Asked Questions
                  </h2>
               </div>

               <div className="divide-y divide-zinc-800/80">
                  {FAQS.map((faq, idx) => (
                     <div key={idx} className="py-3">
                        <button
                           type="button"
                           onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                           className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white transition-colors">
                           <span>{faq.question}</span>
                           <ChevronDown
                              size={15}
                              className={`text-zinc-500 transition-transform duration-200 ${
                                 openFaq === idx ? 'rotate-180' : ''
                              }`}
                           />
                        </button>
                        {openFaq === idx && (
                           <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                              {faq.answer}
                           </p>
                        )}
                     </div>
                  ))}
               </div>
            </div>

            {/* Related Tools Section */}
            {relatedTools.length > 0 && (
               <div className="mt-10 mb-8">
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-base sm:text-lg font-bold text-white">
                        Explore Related Tools
                     </h2>
                     <Link
                        to="/categories"
                        className="text-xs font-semibold text-[#daf4aa] hover:underline flex items-center gap-1">
                        <span>All Categories</span>
                        <ChevronRight size={13} />
                     </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                     {relatedTools.map((tool) => (
                        <Link
                           key={tool.id}
                           to={tool.path}
                           onMouseEnter={() => preloadRoute(tool.path)}
                           className="group flex flex-col justify-between p-4 rounded-xl border border-zinc-800 bg-[#121215] hover:border-zinc-700 hover:bg-zinc-900/60 transition-all shadow-md">
                           <div>
                              <div className="flex items-center justify-between mb-2">
                                 <span className="text-[10px] font-semibold text-[#daf4aa] uppercase tracking-wider">
                                    {tool.category}
                                 </span>
                                 <ArrowRight
                                    size={13}
                                    className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all"
                                 />
                              </div>
                              <h3 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-[#daf4aa] transition-colors line-clamp-1">
                                 {tool.name}
                              </h3>
                              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                                 {tool.description}
                              </p>
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

