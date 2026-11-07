/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import {
   CheckCircle2,
   Flame,
   Plus,
   Trash2,
   RotateCcw,
   Download,
   Sparkles,
   ChevronRight,
   HelpCircle,
   Calendar,
   Award,
   Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DEFAULT_HABITS = [
   {
      id: 'h1',
      name: 'Drink 2.5L Water',
      category: 'Health',
      color: '#06b6d4',
      history: [true, true, true, false, true, true, true],
   },
   {
      id: 'h2',
      name: 'Read 20 Pages',
      category: 'Mindset',
      color: '#8b5cf6',
      history: [true, true, false, true, true, false, true],
   },
   {
      id: 'h3',
      name: 'Exercise / Gym 45m',
      category: 'Fitness',
      color: '#f59e0b',
      history: [false, true, true, true, false, true, false],
   },
   {
      id: 'h4',
      name: 'Code / Learn 1 Hour',
      category: 'Productivity',
      color: '#10b981',
      history: [true, true, true, true, true, true, false],
   },
];

const FAQS = [
   {
      question: 'How are habit streaks calculated?',
      answer:
         'A streak counts consecutive completed days without a break. Keeping a streak alive leverages behavioural psychology to build compounding, long-term personal discipline.',
   },
   {
      question: 'Is my habit tracking data stored securely?',
      answer:
         'Yes. 100% of habit data, checkmarks, and streaks are persisted strictly in your browser’s local storage. Nothing is transmitted to external servers.',
   },
   {
      question: 'Can I export my habit statistics?',
      answer:
         'Yes! You can export a CSV summary detailing completion rates, streak lengths, and daily checkmark records.',
   },
   {
      question: 'How do I add a new custom habit?',
      answer:
         'Enter the habit title, select a category, and click "Add Habit". It will immediately appear in your weekly matrix.',
   },
];

export default function HabitTracker() {
   const [habits, setHabits] = useState(() => {
      try {
         const saved = localStorage.getItem('klique_habit_tracker_v1');
         return saved ? JSON.parse(saved) : DEFAULT_HABITS;
      } catch {
         return DEFAULT_HABITS;
      }
   });

   const [newHabitName, setNewHabitName] = useState('');
   const [newHabitCategory, setNewHabitCategory] = useState('Productivity');
   const [toast, setToast] = useState({ visible: false, message: '' });

   useEffect(() => {
      try {
         localStorage.setItem(
            'klique_habit_tracker_v1',
            JSON.stringify(habits),
         );
      } catch (err) {
         console.warn('LocalStorage error:', err);
      }
   }, [habits]);

   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   // Toggle habit for day
   const handleToggleDay = (habitId, dayIndex) => {
      setHabits((prev) =>
         prev.map((h) => {
            if (h.id !== habitId) return h;
            const updated = [...h.history];
            updated[dayIndex] = !updated[dayIndex];
            return { ...h, history: updated };
         }),
      );
   };

   const handleAddHabit = (e) => {
      e.preventDefault();
      if (!newHabitName.trim()) {
         showToast('Please enter a habit title.');
         return;
      }

      const colors = [
         '#daf4aa',
         '#06b6d4',
         '#f59e0b',
         '#ec4899',
         '#8b5cf6',
         '#3b82f6',
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const newH = {
         id: `h_${Date.now()}`,
         name: newHabitName.trim(),
         category: newHabitCategory,
         color: randomColor,
         history: [false, false, false, false, false, false, false],
      };

      setHabits((prev) => [...prev, newH]);
      setNewHabitName('');
      showToast(`Added habit: ${newH.name}`);
   };

   const handleDeleteHabit = (id) => {
      setHabits((prev) => prev.filter((h) => h.id !== id));
      showToast('Deleted habit.');
   };

   const handleResetDefaults = () => {
      setHabits(DEFAULT_HABITS);
      trackToolReset('habit-tracker');
      showToast('Reset to default habits.');
   };

   // Calculate completion stats
   const stats = useMemo(() => {
      let totalSlots = 0;
      let totalCompleted = 0;

      habits.forEach((h) => {
         h.history.forEach((val) => {
            totalSlots++;
            if (val) totalCompleted++;
         });
      });

      const weeklyRate =
         totalSlots > 0 ? Math.round((totalCompleted / totalSlots) * 100) : 0;
      return { totalCompleted, totalSlots, weeklyRate };
   }, [habits]);

   const handleDownloadCSV = () => {
      if (habits.length === 0) return;
      let csv =
         'Habit Name,Category,Mon,Tue,Wed,Thu,Fri,Sat,Sun,Total Completed,Completion Rate\n';
      habits.forEach((h) => {
         const count = h.history.filter(Boolean).length;
         const rate = Math.round((count / 7) * 100);
         csv += `"${h.name}","${h.category}",${h.history.map((v) => (v ? 'Yes' : 'No')).join(',')},${count}/7,${rate}%\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `klique-habit-tracker-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      trackToolDownload('habit-tracker', { fileType: 'csv' });
      showToast('Downloaded habit statistics CSV!');
   };

   const relatedTools = useMemo(() => getRelatedTools('habit-tracker', 3), []);

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
            title="Daily Habit Tracker - Visual Weekly Streaks & Accountability | Klique"
            description="Track daily habits, build streaks, and achieve personal discipline with a private, interactive weekly habit tracker stored 100% in your browser."
            keywords="habit tracker online, weekly habit streak tracker, daily routine tracker free, habit discipline journal, klique"
            canonicalUrl="https://klique.netlify.app/tools/habit-tracker"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'Daily Habit Tracker',
               applicationCategory: 'LifestyleApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Build compounding daily habits and monitor consistency with weekly streak grids and zero account requirements.',
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
               <span className="text-[#daf4aa]">Habit Tracker</span>
            </div>

            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:items-center">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#daf4aa]/30 bg-[#daf4aa]/10 text-[#daf4aa] text-xs font-medium tracking-wide mb-3">
                     <Flame
                        size={13}
                        className="text-[#daf4aa] animate-pulse"
                     />
                     <span>PRODUCTIVITY & ROUTINE SUITE</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                     Daily Habit <span className="text-[#daf4aa]">Tracker</span>
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                     Build compounding routines and track weekly completion
                     streaks. 100% private and stored solely in your local
                     browser sandbox.
                  </p>
               </div>
               <div className="flex items-center gap-2">
                  <button
                     onClick={handleDownloadCSV}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-medium text-zinc-200 transition-all cursor-pointer">
                     <Download size={13} />
                     <span>Export CSV</span>
                  </button>
                  <button
                     onClick={handleResetDefaults}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 text-xs text-zinc-400 hover:text-zinc-200 transition-all">
                     <RotateCcw size={13} />
                     <span>Reset</span>
                  </button>
               </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md shadow-xl flex items-center justify-between">
                  <div>
                     <div className="text-xs text-zinc-400 font-medium">
                        Weekly Completion
                     </div>
                     <div className="text-2xl font-bold font-mono text-[#daf4aa] mt-0.5">
                        {stats.weeklyRate}%
                     </div>
                  </div>
                  <Activity size={24} className="text-[#daf4aa]" />
               </div>

               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md shadow-xl flex items-center justify-between">
                  <div>
                     <div className="text-xs text-zinc-400 font-medium">
                        Total Checkmarks
                     </div>
                     <div className="text-2xl font-bold font-mono text-zinc-100 mt-0.5">
                        {stats.totalCompleted} / {stats.totalSlots}
                     </div>
                  </div>
                  <CheckCircle2 size={24} className="text-[#daf4aa]" />
               </div>

               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md shadow-xl flex items-center justify-between">
                  <div>
                     <div className="text-xs text-zinc-400 font-medium">
                        Active Habits
                     </div>
                     <div className="text-2xl font-bold font-mono text-white mt-0.5">
                        {habits.length}
                     </div>
                  </div>
                  <Award size={24} className="text-amber-400" />
               </div>
            </div>

            {/* Main Habit Grid & Form */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6 mb-8">
               <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                     <Calendar size={17} className="text-[#daf4aa]" />
                     Weekly Progress Matrix
                  </h2>
               </div>

               {/* Matrix Table */}
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="border-b border-zinc-800/60 text-xs font-semibold text-zinc-400">
                           <th className="py-2.5 px-3 min-w-[180px]">Habit</th>
                           {DAYS.map((day) => (
                              <th
                                 key={day}
                                 className="py-2.5 px-2 text-center w-14">
                                 {day}
                              </th>
                           ))}
                           <th className="py-2.5 px-3 text-center">Score</th>
                           <th className="py-2.5 px-2 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-zinc-800/40 text-xs">
                        {habits.map((habit) => {
                           const completedDays =
                              habit.history.filter(Boolean).length;
                           return (
                              <tr
                                 key={habit.id}
                                 className="hover:bg-zinc-950/40 transition-colors">
                                 <td className="py-3 px-3">
                                    <div className="font-medium text-zinc-100 flex items-center gap-2">
                                       <span
                                          className="w-2 h-2 rounded-full flex-shrink-0"
                                          style={{
                                             backgroundColor: habit.color,
                                          }}
                                       />
                                       <span>{habit.name}</span>
                                    </div>
                                    <span className="text-[10px] text-zinc-500 ml-4">
                                       {habit.category}
                                    </span>
                                 </td>

                                 {/* 7 Days Checkboxes */}
                                 {habit.history.map((isDone, dayIdx) => (
                                    <td
                                       key={dayIdx}
                                       className="py-3 px-2 text-center">
                                       <button
                                          onClick={() =>
                                             handleToggleDay(habit.id, dayIdx)
                                          }
                                          className={`w-7 h-7 rounded-lg border flex items-center justify-center mx-auto transition-all cursor-pointer ${
                                             isDone
                                                ? 'bg-[#daf4aa] border-[#daf4aa] text-zinc-950 font-bold shadow-md shadow-[#daf4aa]/20'
                                                : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-transparent'
                                          }`}>
                                          <CheckCircle2
                                             size={14}
                                             className={
                                                isDone
                                                   ? 'opacity-100'
                                                   : 'opacity-0'
                                             }
                                          />
                                       </button>
                                    </td>
                                 ))}

                                 {/* Weekly score */}
                                 <td className="py-3 px-3 text-center font-mono">
                                    <span
                                       className={
                                          completedDays >= 5
                                             ? 'text-[#daf4aa] font-bold'
                                             : 'text-zinc-400'
                                       }>
                                       {completedDays}/7
                                    </span>
                                 </td>

                                 {/* Delete */}
                                 <td className="py-3 px-2 text-right">
                                    <button
                                       onClick={() =>
                                          handleDeleteHabit(habit.id)
                                       }
                                       className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer">
                                       <Trash2 size={13} />
                                    </button>
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>

               {/* Add New Habit Form */}
               <form
                  onSubmit={handleAddHabit}
                  className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center gap-3">
                  <input
                     type="text"
                     value={newHabitName}
                     onChange={(e) => setNewHabitName(e.target.value)}
                     placeholder="Add new habit (e.g. 10,000 Steps, Meditate)..."
                     className="flex-1 min-w-[220px] bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                  />
                  <select
                     value={newHabitCategory}
                     onChange={(e) => setNewHabitCategory(e.target.value)}
                     className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60 cursor-pointer">
                     <option value="Productivity">Productivity</option>
                     <option value="Health">Health</option>
                     <option value="Fitness">Fitness</option>
                     <option value="Mindset">Mindset</option>
                     <option value="Learning">Learning</option>
                  </select>
                  <button
                     type="submit"
                     className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] text-zinc-950 font-bold text-xs shadow-[0_0_15px_rgba(218,244,170,0.3)] transition-all cursor-pointer">
                     <Plus size={14} />
                     <span>Add Habit</span>
                  </button>
               </form>
            </div>

            {/* FAQs Accordion */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-4 mb-8">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle size={18} className="text-[#daf4aa]" />
                  Frequently Asked Questions
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FAQS.map((faq, i) => (
                     <div
                        key={i}
                        className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50 space-y-1.5">
                        <h4 className="text-sm font-semibold text-zinc-200">
                           {faq.question}
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                           {faq.answer}
                        </p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
               <div className="border-t border-zinc-800/80 pt-8 space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-base font-semibold text-white">
                        Related Tools
                     </h3>
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
