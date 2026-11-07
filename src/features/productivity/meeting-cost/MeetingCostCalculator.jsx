/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
   Clock,
   Play,
   Pause,
   RotateCcw,
   DollarSign,
   Users,
   Download,
   Copy,
   Check,
   TrendingUp,
   AlertCircle,
   Sparkles,
   ChevronRight,
   HelpCircle,
   Briefcase,
   Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

const CURRENCIES = [
   { code: 'INR', symbol: '₹', label: 'INR (₹)' },
   { code: 'USD', symbol: '$', label: 'USD ($)' },
   { code: 'EUR', symbol: '€', label: 'EUR (€)' },
   { code: 'GBP', symbol: '£', label: 'GBP (£)' },
   { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
   { code: 'AUD', symbol: 'A$', label: 'AUD (A$)' },
];

const PRESETS = [
   {
      id: 'standup',
      name: 'Daily Standup (15 min, 6 Devs)',
      attendees: 6,
      rate: 1500,
      currency: 'INR',
      desc: 'Quick morning sync for agile software engineering teams.',
   },
   {
      id: 'allhands',
      name: 'Company All-Hands (60 min, 50 Staff)',
      attendees: 50,
      rate: 1800,
      currency: 'INR',
      desc: 'Entire organization monthly status and strategic alignment.',
   },
   {
      id: 'exec',
      name: 'Executive Board (45 min, 4 Directors)',
      attendees: 4,
      rate: 6000,
      currency: 'INR',
      desc: 'High-level decision making and resource planning session.',
   },
   {
      id: 'designReview',
      name: 'Design Critique (30 min, 5 Designers/PMs)',
      attendees: 5,
      rate: 2000,
      currency: 'INR',
      desc: 'UX walkthrough and feedback review session.',
   },
];

const FAQS = [
   {
      question: 'How is live meeting cost computed?',
      answer:
         'Meeting cost is computed as: [Total Attendees × Average Hourly Rate ÷ 3,600] × Elapsed Seconds. Every second the meeting runs, the cost updates in real time based on team burn rate.',
   },
   {
      question: 'Why should companies track meeting expenses?',
      answer:
         'Meetings are one of the most expensive hidden overheads in modern organizations. A 1-hour meeting with 8 senior engineers can easily cost $1,000+ in loaded company time. Tracking encourages focused agendas, punctual start/end times, and async communication.',
   },
   {
      question: 'Is my meeting or salary data kept private?',
      answer:
         'Yes. 100% of calculations and timers run strictly in your local browser sandbox. No rates, attendee counts, or meeting details are ever sent to any remote server.',
   },
   {
      question: 'Can I export the meeting receipt or summary?',
      answer:
         'Yes! You can copy a clean summary with one click or download a structured CSV breakdown to attach to your meeting notes or Slack channel.',
   },
];

export default function MeetingCostCalculator() {
   const [attendees, setAttendees] = useState(6);
   const [hourlyRate, setHourlyRate] = useState(1500);
   const [currency, setCurrency] = useState('INR');
   const [meetingTitle, setMeetingTitle] = useState('Product Sprint Planning');
   const [isRunning, setIsRunning] = useState(false);
   const [secondsElapsed, setSecondsElapsed] = useState(0);

   const [toast, setToast] = useState({ visible: false, message: '' });
   const [copied, setCopied] = useState(false);

   const timerRef = useRef(null);

   const currentCurrency = useMemo(
      () => CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0],
      [currency]
   );

   // Timer logic
   useEffect(() => {
      if (isRunning) {
         timerRef.current = setInterval(() => {
            setSecondsElapsed((prev) => prev + 1);
         }, 1000);
      } else if (timerRef.current) {
         clearInterval(timerRef.current);
      }
      return () => {
         if (timerRef.current) clearInterval(timerRef.current);
      };
   }, [isRunning]);

   // Calculations
   const totalHourlyBurn = useMemo(() => {
      return (Number(attendees) || 0) * (Number(hourlyRate) || 0);
   }, [attendees, hourlyRate]);

   const costPerMinute = useMemo(() => totalHourlyBurn / 60, [totalHourlyBurn]);
   const costPerSecond = useMemo(() => totalHourlyBurn / 3600, [totalHourlyBurn]);
   const totalCurrentCost = useMemo(() => costPerSecond * secondsElapsed, [costPerSecond, secondsElapsed]);

   // Format Time HH:MM:SS
   const formatTime = (totalSec) => {
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = totalSec % 60;
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
   };

   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   const handleToggleTimer = () => {
      setIsRunning((prev) => !prev);
   };

   const handleResetTimer = () => {
      setIsRunning(false);
      setSecondsElapsed(0);
      trackToolReset('meeting-cost-calculator');
      showToast('Timer reset to zero');
   };

   const handleApplyPreset = (preset) => {
      setAttendees(preset.attendees);
      setHourlyRate(preset.rate);
      setCurrency(preset.currency);
      setMeetingTitle(preset.name);
      showToast(`Loaded preset: ${preset.name}`);
   };

   const handleCopySummary = () => {
      const text = `📊 Meeting Cost Summary: ${meetingTitle}
⏱ Duration: ${formatTime(secondsElapsed)} (${Math.ceil(secondsElapsed / 60)} minutes)
👥 Attendees: ${attendees}
💵 Avg Rate: ${currentCurrency.symbol}${hourlyRate}/hr
🔥 Total Burn Rate: ${currentCurrency.symbol}${totalHourlyBurn.toLocaleString()}/hr (${currentCurrency.symbol}${costPerMinute.toFixed(2)}/min)
💰 Total Meeting Cost: ${currentCurrency.symbol}${totalCurrentCost.toFixed(2)}
Calculated privately with Klique (https://klique.netlify.app/tools/meeting-cost-calculator)`;

      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackToolCopy('meeting-cost-calculator', { length: text.length });
      showToast('Meeting summary copied to clipboard!');
   };

   const handleDownloadCSV = () => {
      const csv = `Meeting Title,Duration (HH:MM:SS),Elapsed Seconds,Attendees,Avg Hourly Rate (${currency}),Hourly Burn Rate,Cost Per Minute,Total Cost (${currency})
"${meetingTitle.replace(/"/g, '""')}",${formatTime(secondsElapsed)},${secondsElapsed},${attendees},${hourlyRate},${totalHourlyBurn.toFixed(2)},${costPerMinute.toFixed(2)},${totalCurrentCost.toFixed(2)}`;

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-cost-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      trackToolDownload('meeting-cost-calculator', { fileType: 'csv', fileSize: blob.size });
      showToast('Downloaded meeting cost CSV!');
   };

   const relatedTools = useMemo(() => getRelatedTools('meeting-cost-calculator', 3), []);

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden
            before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]
            after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
         <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]" />

         {/* Static ambient backdrop matching Klique theme */}
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         <SEO
            title="Meeting Cost Calculator - Real-Time Meeting Expense Ticker | Klique"
            description="Track the exact financial cost of team meetings in real time. Calculate attendee hourly rates, minute burn rates, and export meeting summaries 100% privately."
            keywords="meeting cost calculator, real time meeting cost ticker, calculate cost of meeting, meeting burn rate, team productivity calculator, meeting expense calculator, klique"
            canonicalUrl="https://klique.netlify.app/tools/meeting-cost-calculator"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'Meeting Cost Calculator',
               applicationCategory: 'BusinessApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Calculate and display the real-time financial cost of business meetings based on attendees and hourly salaries.',
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
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                     <Flame size={14} className="text-[#daf4aa]" />
                     <span>Productivity & Business Suite</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                     Meeting Cost Calculator
                  </h1>
                  <p className="mt-1 text-sm text-zinc-400">
                     Track the real-time financial burn of business meetings. Keep discussions focused and quantify team investment per minute.
                  </p>
               </motion.div>

               {/* Presets Quick Bar */}
               <div className="flex flex-wrap items-center gap-1.5 rounded-full backdrop-blur-xl py-1">
                  {PRESETS.map((p) => (
                     <button
                        key={p.id}
                        onClick={() => handleApplyPreset(p)}
                        className="px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer">
                        {p.name.split(' (')[0]}
                     </button>
                  ))}
               </div>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
               <Link to="/" className="hover:text-zinc-300 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category/productivity" className="hover:text-zinc-300 transition-colors">Productivity</Link>
               <span>/</span>
               <span className="text-zinc-300">Meeting Cost Calculator</span>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">
               {/* Configuration Panel */}
               <div className="lg:col-span-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                     <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Briefcase size={16} className="text-[#daf4aa]" />
                        Meeting Parameters
                     </h2>
                     <button
                        onClick={handleResetTimer}
                        className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition-colors">
                        <RotateCcw size={12} />
                        Reset
                     </button>
                  </div>

                  {/* Meeting Topic */}
                  <div className="space-y-1.5">
                     <label className="text-xs font-medium text-zinc-300">Meeting Topic / Title</label>
                     <input
                        type="text"
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                        placeholder="e.g. Q3 Roadmap Review"
                        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                     />
                  </div>

                  {/* Attendees & Currency Row */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                           <Users size={13} className="text-[#daf4aa]" />
                           Attendees
                        </label>
                        <input
                           type="number"
                           min="1"
                           max="1000"
                           value={attendees}
                           onChange={(e) => setAttendees(Math.max(1, parseInt(e.target.value) || 1))}
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300">Currency</label>
                        <select
                           value={currency}
                           onChange={(e) => setCurrency(e.target.value)}
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40 cursor-pointer">
                           {CURRENCIES.map((c) => (
                              <option key={c.code} value={c.code} className="bg-zinc-900 text-zinc-100">
                                 {c.label}
                              </option>
                           ))}
                        </select>
                     </div>
                  </div>

                  {/* Avg Hourly Rate */}
                  <div className="space-y-1.5">
                     <div className="flex justify-between items-center text-xs">
                        <label className="font-medium text-zinc-300 flex items-center gap-1.5">
                           <DollarSign size={13} className="text-[#daf4aa]" />
                           Avg. Hourly Rate / Salary
                        </label>
                        <span className="text-[#daf4aa] font-mono font-semibold">
                           {currentCurrency.symbol}
                           {hourlyRate.toLocaleString()} / hr
                        </span>
                     </div>
                     <input
                        type="range"
                        min="200"
                        max="20000"
                        step="100"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="w-full accent-[#daf4aa] cursor-pointer"
                     />
                     <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                        <span>{currentCurrency.symbol}200</span>
                        <span>{currentCurrency.symbol}10,000</span>
                        <span>{currentCurrency.symbol}20,000</span>
                     </div>
                  </div>

                  {/* Rates Quick Metrics */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                     <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60">
                        <span className="text-[11px] text-zinc-400">Team Hourly Burn</span>
                        <div className="text-sm font-bold text-white font-mono mt-0.5">
                           {currentCurrency.symbol}
                           {totalHourlyBurn.toLocaleString()}
                        </div>
                     </div>
                     <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60">
                        <span className="text-[11px] text-zinc-400">Cost / Minute</span>
                        <div className="text-sm font-bold text-[#daf4aa] font-mono mt-0.5">
                           {currentCurrency.symbol}
                           {costPerMinute.toFixed(2)}
                        </div>
                     </div>
                  </div>
               </div>

               {/* Live Ticker & Output Dashboard */}
               <div className="lg:col-span-7 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-6">
                  {/* Ticker Display */}
                  <div className="text-center py-4 space-y-3">
                     <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 text-xs text-zinc-300">
                        <Clock size={12} className={isRunning ? 'text-[#daf4aa] animate-spin' : 'text-zinc-400'} />
                        <span className="font-mono tracking-widest text-sm font-semibold text-white">
                           {formatTime(secondsElapsed)}
                        </span>
                     </div>

                     <div className="space-y-1">
                        <div className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
                           Current Meeting Cost
                        </div>
                        <div className="text-5xl sm:text-6xl md:text-7xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-[#daf4aa] to-teal-300">
                           {currentCurrency.symbol}
                           {totalCurrentCost.toFixed(2)}
                        </div>
                     </div>

                     <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                        Ticking at <span className="font-mono text-[#daf4aa]">{currentCurrency.symbol}{costPerSecond.toFixed(3)}</span> per second across {attendees} attendees.
                     </p>
                  </div>

                  {/* Play / Pause / Reset Controls */}
                  <div className="flex flex-wrap items-center justify-center gap-3">
                     <button
                        onClick={handleToggleTimer}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
                           isRunning
                              ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
                              : 'bg-[#daf4aa] hover:bg-[#c8e692] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                        }`}>
                        {isRunning ? <Pause size={16} /> : <Play size={16} fill="currentColor" />}
                        <span>{isRunning ? 'Pause Meeting' : 'Start Ticker'}</span>
                     </button>

                     <button
                        onClick={handleResetTimer}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all cursor-pointer">
                        <RotateCcw size={15} />
                        <span>Reset</span>
                     </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-zinc-800/80 pt-4 flex flex-wrap items-center justify-between gap-3">
                     <div className="text-xs text-zinc-400">
                        Total duration: <span className="font-mono text-white font-medium">{Math.ceil(secondsElapsed / 60)} min</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <button
                           onClick={handleCopySummary}
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer">
                           {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                           <span>{copied ? 'Copied' : 'Copy Summary'}</span>
                        </button>
                        <button
                           onClick={handleDownloadCSV}
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer">
                           <Download size={13} />
                           <span>Export CSV</span>
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* FAQs Accordion */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md space-y-4 mb-8">
               <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle size={17} className="text-[#daf4aa]" />
                  Frequently Asked Questions
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FAQS.map((faq, i) => (
                     <div key={i} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50 space-y-1.5">
                        <h4 className="text-xs font-semibold text-zinc-200">{faq.question}</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{faq.answer}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
               <div className="border-t border-zinc-800/80 pt-8 space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm font-semibold text-white">Related Tools</h3>
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

