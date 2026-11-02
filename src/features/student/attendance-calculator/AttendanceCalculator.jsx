/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   GraduationCap,
   CheckCircle2,
   AlertTriangle,
   Copy,
   Download,
   Trash2,
   Check,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ChevronRight,
   Plus,
   Minus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { calculateAttendance } from '../../../lib/calculations/attendance';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*  PRESETS                                                                   */
/* -------------------------------------------------------------------------- */

const PRESETS = [
   {
      id: 'comfortable',
      name: 'Comfortable Attendance — 40 of 46 @ 75%',
      attended: '40',
      total: '46',
      target: 75,
   },
   {
      id: 'borderline',
      name: 'Borderline Case — 30 of 40 @ 75%',
      attended: '30',
      total: '40',
      target: 75,
   },
   {
      id: 'recovery',
      name: 'Recovery Needed — 22 of 36 @ 75%',
      attended: '22',
      total: '36',
      target: 75,
   },
   {
      id: 'highTarget',
      name: 'Scholarship Target — 45 of 50 @ 85%',
      attended: '45',
      total: '50',
      target: 85,
   },
];

const FAQS = [
   {
      question: 'What is the formula for attendance percentage?',
      answer:
         'Attendance % = (Attended Classes / Total Classes Held) × 100. For example, if you attended 36 out of 48 classes, your attendance is (36 / 48) × 100 = 75%.',
   },
   {
      question: 'How are allowable bunks (safe absences) calculated?',
      answer:
         'When your current attendance exceeds your target (e.g. 75%), each future missed class increases total classes while attended classes remain unchanged: Attended / (Total + X) ≥ Target%. This tool solves for the maximum whole number of lectures you can miss without falling below the target.',
   },
   {
      question: 'How many classes do I need to attend to recover if I have low attendance?',
      answer:
         'If your attendance is below 75%, you must attend subsequent classes consecutively: (Attended + Y) / (Total + Y) ≥ Target%. This tool calculates the exact minimum number of consecutive classes required to restore eligibility.',
   },
   {
      question: 'What happens if 100% attendance is mathematically impossible?',
      answer:
         'If target is set to 100% and you have already missed at least one class, it is mathematically impossible to achieve 100%, and the calculator alerts you accordingly.',
   },
];

export default function AttendanceCalculator() {
   const [attended, setAttended] = useState('38');
   const [total, setTotal] = useState('45');
   const [target, setTarget] = useState(75);

   // UI State
   const [showQuickSetup, setShowQuickSetup] = useState(false);
   const [openFaq, setOpenFaq] = useState(null);
   const [toast, setToast] = useState({ message: '', visible: false });

   const showToast = (message) => {
      setToast({ message, visible: true });
      setTimeout(() => {
         setToast({ message: '', visible: false });
      }, 2500);
   };

   const result = useMemo(() => {
      return calculateAttendance({
         attended: Number(attended) || 0,
         total: Number(total) || 0,
         target: Number(target) || 75,
      });
   }, [attended, total, target]);

   const isOnTrack = result.status === 'on-track';

   const handleReset = () => {
      setAttended('38');
      setTotal('45');
      setTarget(75);
      trackToolReset('attendance-calculator');
      showToast('Reset to default attendance parameters');
   };

   const handleApplyPreset = (p) => {
      setAttended(p.attended);
      setTotal(p.total);
      setTarget(p.target);
      showToast(`Loaded ${p.name.split('—')[0].trim()}`);
   };

   const summaryText = useMemo(() => {
      return `Attendance Status Report (Klique):
Classes Attended: ${result.attended}/${result.total}
Current Attendance: ${result.currentPercentage}%
Target Goal: ${result.target}%
Status: ${isOnTrack ? 'On Track (Eligible)' : 'Short Attendance (Warning)'}
${result.summary}`;
   }, [result, isOnTrack]);

   const handleCopySummary = () => {
      navigator.clipboard.writeText(summaryText);
      trackToolCopy('attendance-calculator', { outputType: 'text', size: summaryText.length });
      showToast('Copied attendance report to clipboard!');
   };

   const handleDownloadReport = () => {
      const content = `${summaryText}
Generated on ${new Date().toLocaleDateString()}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report-${result.currentPercentage}pct.txt`;
      a.click();
      URL.revokeObjectURL(url);

      trackToolDownload('attendance-calculator', { fileType: 'txt', fileSize: blob.size });
      showToast('Downloaded attendance report (TXT)!');
   };

   const relatedTools = useMemo(() => getRelatedTools('attendance-calculator', 3), []);

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden
            before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]
            after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
         <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]" />

         {/* Static ambient backdrop matching JsonFormatter */}
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         <SEO
            title="Attendance Calculator - 75% Attendance & Safe Bunk Planner | Klique"
            description="Calculate current college attendance percentage, check safe bunk limits, and find how many consecutive classes you must attend to hit 75% eligibility."
            keywords="attendance calculator, 75 percent attendance, bunk calculator, college attendance planner, university attendance threshold, klique"
            canonicalUrl="https://klique.netlify.app/tools/attendance-calculator"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'Attendance Calculator',
               applicationCategory: 'EducationalApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Calculate current attendance percentage, allowable absences (safe bunks), and required classes to hit 75%.',
            }}
         />

         {/* Toast Notification */}
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

         {/* Header / Navbar */}
         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Title Section */}
            <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                     <GraduationCap size={14} className="text-[#daf4aa]" />
                     <span>Student Suite</span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                     Attendance Calculator & Bunk Planner
                  </h1>

                  <p className="mt-1 text-sm text-zinc-400">
                     Check your current attendance percentage, allowable bunk limits, and required classes to reach 75%.
                  </p>
               </motion.div>

               {/* Target Badge */}
               <div className="flex items-center gap-1.5 rounded-full bg-zinc-900/80 px-4 py-2 border border-zinc-800 backdrop-blur-xl">
                  <span className="text-xs text-zinc-400">Target Threshold:</span>
                  <span className="text-xs font-bold font-mono text-[#daf4aa]">{target}%</span>
               </div>
            </div>

            {/* Quick Setup Presets Accordion */}
            <section className="mb-6">
               <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-end">
                  <button
                     type="button"
                     aria-expanded={showQuickSetup}
                     onClick={() => setShowQuickSetup((open) => !open)}
                     className="mt-2 inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-[#daf4aa]/25 bg-[#daf4aa]/[0.08] px-3.5 py-2 text-xs font-semibold text-[#daf4aa] shadow-sm transition hover:border-[#daf4aa]/50 hover:bg-[#daf4aa]/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#daf4aa]/40 sm:mt-0">
                     <Sparkles size={14} />
                     <span>Quick Attendance Scenarios</span>
                     <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                           showQuickSetup ? 'rotate-180' : ''
                        }`}
                     />
                  </button>
               </div>

               <AnimatePresence initial={false}>
                  {showQuickSetup && (
                     <motion.div
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -6 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="overflow-hidden mt-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                           {PRESETS.map((p) => (
                              <button
                                 key={p.id}
                                 type="button"
                                 onClick={() => handleApplyPreset(p)}
                                 className="text-left rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5 transition-all hover:border-[#daf4aa]/50 hover:bg-[#121216]">
                                 <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-zinc-200">
                                       {p.name.split('—')[0].trim()}
                                    </span>
                                    <span className="text-[10px] font-mono text-[#daf4aa]">
                                       {p.target}% Goal
                                    </span>
                                 </div>
                                 <span className="text-[11px] text-zinc-500 block">
                                    {p.attended} / {p.total} classes
                                 </span>
                              </button>
                           ))}
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </section>

            {/* Quick Actions Bar matching JsonFormatter */}
            <section className="rounded-2xl mb-6">
               <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-semibold text-zinc-400">
                     Quick Actions
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                     <span className={`h-2 w-2 rounded-full ${isOnTrack ? 'bg-[#daf4aa]' : 'bg-rose-400'}`} />
                     <span>{isOnTrack ? 'Eligible' : 'Attendance Shortage'}</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  <button
                     onClick={handleCopySummary}
                     className="col-span-2 sm:col-span-1 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#daf4aa] px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-[#daf4aa]/10 transition hover:bg-[#c9e894]">
                     <Copy size={14} /> Copy Report
                  </button>

                  <button
                     onClick={handleDownloadReport}
                     className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white">
                     <Download size={14} /> Download Report
                  </button>

                  <button
                     onClick={handleReset}
                     className="col-span-2 sm:col-span-1 inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3.5 py-2.5 text-xs font-semibold text-red-300 transition hover:border-red-500/40 hover:bg-red-500/[0.12] xl:flex-none">
                     <Trash2 size={14} /> Reset parameters
                  </button>
               </div>
            </section>

            {/* Live Stats Status Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 sm:px-4 sm:py-2.5 text-xs mb-6">
               <div className="flex items-center gap-2">
                  <span
                     className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold ${
                        isOnTrack
                           ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                           : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                     }`}>
                     {isOnTrack ? <Check size={13} /> : <AlertTriangle size={13} />}
                     {isOnTrack ? 'Eligible Status' : 'Shortage Detected'}
                  </span>
               </div>

               <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
                  <span>
                     Attended: <strong className="text-zinc-200">{result.attended}/{result.total}</strong>
                  </span>
                  <span>
                     Current %: <strong className={isOnTrack ? 'text-[#daf4aa]' : 'text-rose-400'}>{result.currentPercentage}%</strong>
                  </span>
                  <span>
                     {isOnTrack ? 'Safe Bunks: ' : 'Needed: '}
                     <strong className="text-zinc-200">
                        {isOnTrack ? `${result.allowableBunks} classes` : `${result.classesNeeded} classes`}
                     </strong>
                  </span>
               </div>
            </div>

            {/* DUAL PANE WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
               {/* Left Pane: Inputs */}
               <div className="flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                        <GraduationCap size={14} className="text-[#daf4aa]" /> Class Parameters
                     </span>
                     <span className="text-[11px] text-zinc-500 font-mono">
                        Target: {target}%
                     </span>
                  </div>

                  <div className="p-4 sm:p-6 flex flex-col gap-6">
                     {/* Attended Classes */}
                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <label className="text-xs font-semibold text-zinc-300">
                              Classes Attended
                           </label>
                           <span className="text-xs font-mono font-bold text-[#daf4aa]">
                              {attended} classes
                           </span>
                        </div>

                        <div className="relative flex items-center rounded-xl border border-zinc-800 bg-[#0d0d10] px-3.5 py-2.5 focus-within:border-[#daf4aa] transition-colors">
                           <input
                              type="number"
                              value={attended}
                              onChange={(e) => setAttended(e.target.value)}
                              placeholder="38"
                              min="0"
                              className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none font-mono"
                           />
                           <div className="flex items-center gap-1 shrink-0">
                              <button
                                 type="button"
                                 onClick={() => setAttended(String(Math.max(0, (Number(attended) || 0) - 1)))}
                                 className="p-1 rounded-md bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                 title="Decrease attended">
                                 <Minus size={13} />
                              </button>
                              <button
                                 type="button"
                                 onClick={() => setAttended(String((Number(attended) || 0) + 1))}
                                 className="p-1 rounded-md bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                 title="Increase attended">
                                 <Plus size={13} />
                              </button>
                           </div>
                        </div>
                     </div>

                     {/* Total Classes Held */}
                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <label className="text-xs font-semibold text-zinc-300">
                              Total Classes Held So Far
                           </label>
                           <span className="text-xs font-mono font-bold text-zinc-300">
                              {total} held
                           </span>
                        </div>

                        <div className="relative flex items-center rounded-xl border border-zinc-800 bg-[#0d0d10] px-3.5 py-2.5 focus-within:border-[#daf4aa] transition-colors">
                           <input
                              type="number"
                              value={total}
                              onChange={(e) => setTotal(e.target.value)}
                              placeholder="45"
                              min="1"
                              className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none font-mono"
                           />
                           <div className="flex items-center gap-1 shrink-0">
                              <button
                                 type="button"
                                 onClick={() => setTotal(String(Math.max(1, (Number(total) || 0) - 1)))}
                                 className="p-1 rounded-md bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                 title="Decrease held">
                                 <Minus size={13} />
                              </button>
                              <button
                                 type="button"
                                 onClick={() => setTotal(String((Number(total) || 0) + 1))}
                                 className="p-1 rounded-md bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                                 title="Increase held">
                                 <Plus size={13} />
                              </button>
                           </div>
                        </div>
                     </div>

                     {/* Target Threshold Buttons */}
                     <div>
                        <label className="text-xs font-semibold text-zinc-300 block mb-2">
                           Target Attendance Goal
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                           {[65, 75, 80, 85, 90].map((t) => (
                              <button
                                 key={t}
                                 type="button"
                                 onClick={() => setTarget(t)}
                                 className={`py-2 rounded-xl text-xs font-semibold font-mono border transition-all ${
                                    target === t
                                       ? 'bg-[#daf4aa] text-zinc-950 border-[#daf4aa] shadow-[0_0_12px_rgba(218,244,170,0.3)]'
                                       : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                                 }`}>
                                 {t}%
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Pane: Analysis & Advice */}
               <div className="flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-[#daf4aa]" /> Attendance & Eligibility
                     </span>
                     <div className="flex items-center gap-2">
                        <button
                           onClick={handleCopySummary}
                           className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors">
                           <Copy size={13} /> Copy
                        </button>
                     </div>
                  </div>

                  <div className="p-4 sm:p-6 flex flex-col gap-5">
                     {/* Highlight Percentage Card */}
                     <div className="rounded-xl border border-zinc-800 bg-[#0d0d10] p-4 sm:p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                              Current Attendance
                           </span>
                           <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                 isOnTrack
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              }`}>
                              {isOnTrack ? 'Above Goal' : 'Shortage'}
                           </span>
                        </div>

                        <div
                           className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono ${
                              isOnTrack ? 'text-[#daf4aa]' : 'text-rose-400'
                           }`}>
                           {result.currentPercentage}%
                        </div>

                        <span className="text-[11px] text-zinc-500 mt-2">
                           {result.attended} attended out of {result.total} held · Target: {result.target}%
                        </span>
                     </div>

                     {/* Advice Banner */}
                     <div
                        className={`rounded-xl border p-4 ${
                           isOnTrack
                              ? 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300'
                              : 'border-rose-500/30 bg-rose-500/[0.06] text-rose-300'
                        }`}>
                        <div className="flex items-center gap-2 mb-2">
                           {isOnTrack ? (
                              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                           ) : (
                              <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                           )}
                           <span className="text-xs font-bold uppercase tracking-wide">
                              {isOnTrack ? 'Safe to Bunk' : 'Action Required'}
                           </span>
                        </div>

                        <p className="text-xs leading-relaxed text-zinc-300">
                           {result.summary}
                        </p>

                        <div className="mt-3 pt-3 border-t border-zinc-800/40 flex items-center justify-between text-xs">
                           <span className="text-zinc-400">
                              {isOnTrack ? 'Allowable Bunks Left' : 'Consecutive Classes Required'}
                           </span>
                           <span
                              className={`text-base font-bold font-mono ${
                                 isOnTrack ? 'text-[#daf4aa]' : 'text-rose-400'
                              }`}>
                              {isOnTrack
                                 ? `${result.allowableBunks} Class${result.allowableBunks === 1 ? '' : 'es'}`
                                 : `${result.classesNeeded} Class${result.classesNeeded === 1 ? '' : 'es'}`}
                           </span>
                        </div>
                     </div>

                     {/* Progress Visualizer */}
                     <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-2">
                           <span>Attendance Scale</span>
                           <span className="font-mono text-zinc-300">Target: {result.target}%</span>
                        </div>

                        <div className="relative h-3 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                           <div
                              style={{ width: `${Math.min(100, result.currentPercentage)}%` }}
                              className={`h-full transition-all duration-300 ${
                                 isOnTrack
                                    ? 'bg-[#daf4aa] shadow-[0_0_8px_rgba(218,244,170,0.4)]'
                                    : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                              }`}
                           />
                           <div
                              style={{ left: `${result.target}%` }}
                              className="absolute top-0 bottom-0 w-0.5 bg-white shadow"
                              title={`Target: ${result.target}%`}
                           />
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mt-2">
                           <span>0%</span>
                           <span className="text-zinc-300 font-semibold">{result.currentPercentage}% Current</span>
                           <span>100%</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* FAQs Section */}
            <section className="mt-12 rounded-2xl border border-zinc-800 bg-[#121215] p-5 sm:p-6 shadow-2xl">
               <div className="flex items-center gap-2 mb-4">
                  <HelpCircle size={16} className="text-[#daf4aa]" />
                  <h3 className="text-sm font-bold text-zinc-100">
                     Frequently Asked Questions
                  </h3>
               </div>

               <div className="divide-y divide-zinc-800/60">
                  {FAQS.map((faq, idx) => {
                     const isOpen = openFaq === idx;
                     return (
                        <div key={idx} className="py-3">
                           <button
                              type="button"
                              onClick={() => setOpenFaq(isOpen ? null : idx)}
                              className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition-colors">
                              <span>{faq.question}</span>
                              <ChevronDown
                                 size={14}
                                 className={`text-zinc-500 transition-transform duration-200 shrink-0 ${
                                    isOpen ? 'rotate-180 text-[#daf4aa]' : ''
                                 }`}
                              />
                           </button>
                           <AnimatePresence>
                              {isOpen && (
                                 <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden">
                                    <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                                       {faq.answer}
                                    </p>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     );
                  })}
               </div>
            </section>

            {/* Related Tools Section */}
            {relatedTools && relatedTools.length > 0 && (
               <section className="mt-8 rounded-2xl border border-zinc-800 bg-[#121215] p-5 sm:p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                        <Sparkles size={14} className="text-[#daf4aa]" /> Related Academic Tools
                     </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                     {relatedTools.map((tool) => (
                        <Link
                           key={tool.id}
                           to={tool.slug}
                           onMouseEnter={() => preloadRoute(tool.slug)}
                           className="group flex flex-col justify-between p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/50 hover:bg-[#18181d] hover:border-zinc-700 transition-all">
                           <div>
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
                                 {tool.category}
                              </span>
                              <span className="text-xs font-bold text-zinc-200 group-hover:text-[#daf4aa] transition-colors block mb-1">
                                 {tool.name}
                              </span>
                              <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                                 {tool.description}
                              </p>
                           </div>
                           <span className="mt-3 text-[10px] font-semibold text-zinc-400 group-hover:text-white flex items-center gap-1">
                              Open tool <ChevronRight size={11} />
                           </span>
                        </Link>
                     ))}
                  </div>
               </section>
            )}
         </main>
      </div>
   );
}
