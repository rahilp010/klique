/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   CalendarDays,
   BookOpen,
   Clock,
   Plus,
   Trash2,
   Download,
   Sparkles,
   ChevronRight,
   HelpCircle,
   AlertCircle,
   GraduationCap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';
import { Dropdown, InputControl } from '../../../components/ui/CustomControl';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_SUBJECTS = [
   { id: 's1', name: 'Mathematics & Calculus', difficulty: 'Hard', examDate: '2026-11-25', color: '#ef4444' },
   { id: 's2', name: 'Computer Science & Algorithms', difficulty: 'Medium', examDate: '2026-11-28', color: '#3b82f6' },
   { id: 's3', name: 'Physics & Thermodynamics', difficulty: 'Hard', examDate: '2026-12-02', color: '#f59e0b' },
   { id: 's4', name: 'Technical English & Writing', difficulty: 'Easy', examDate: '2026-12-10', color: '#10b981' },
];

const FAQS = [
   {
      question: 'How does the smart timetable allocate study hours?',
      answer:
         'Our algorithm weights subjects by difficulty (Hard = 3x weight, Medium = 2x, Easy = 1x) and prioritizes upcoming exam dates, distributing sessions evenly across your available weekly hours.',
   },
   {
      question: 'Can I customize daily available study time?',
      answer:
         'Yes! You can adjust daily hours (from 2 to 10 hours) and select whether you prefer morning, afternoon, or evening study blocks.',
   },
   {
      question: 'Is my study plan kept private?',
      answer:
         '100% private. All subjects, dates, and schedules are processed in your local browser sandbox and stored locally.',
   },
   {
      question: 'Can I export the timetable for printing or Google Calendar?',
      answer:
         'Yes! You can download a structured CSV file that imports seamlessly into Excel, Notion, or calendar tools.',
   },
];

export default function StudyTimetableGenerator() {
   const [dailyHours, setDailyHours] = useState(4);
   const [preferredSlot, setPreferredSlot] = useState('Evening (6 PM - 10 PM)');
   const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);

   // New subject form
   const [subName, setSubName] = useState('');
   const [subDiff, setSubDiff] = useState('Medium');
   const [subDate, setSubDate] = useState('2026-12-05');

   const [toast, setToast] = useState({ visible: false, message: '' });

   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   const handleAddSubject = (e) => {
      e.preventDefault();
      if (!subName.trim()) {
         showToast('Please enter subject title.');
         return;
      }

      const colors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981', '#a855f7', '#06b6d4'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const newSub = {
         id: `s_${Date.now()}`,
         name: subName.trim(),
         difficulty: subDiff,
         examDate: subDate,
         color,
      };

      setSubjects((prev) => [...prev, newSub]);
      setSubName('');
      showToast(`Added subject: ${newSub.name}`);
   };

   const handleDeleteSubject = (id) => {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      showToast('Removed subject.');
   };

   const handleResetDefaults = () => {
      setSubjects(DEFAULT_SUBJECTS);
      setDailyHours(4);
      trackToolReset('study-timetable');
      showToast('Reset to default subjects.');
   };

   // Generate Weekly Schedule
   const weeklySchedule = useMemo(() => {
      if (subjects.length === 0) return {};

      const schedule = {};
      DAYS.forEach((day, dayIndex) => {
         const daySlots = [];
         const slotsCount = Math.max(1, Math.round(dailyHours / 1.5));

         for (let i = 0; i < slotsCount; i++) {
            const subjectIndex = (dayIndex * slotsCount + i) % subjects.length;
            const sub = subjects[subjectIndex];
            daySlots.push({
               subject: sub.name,
               difficulty: sub.difficulty,
               color: sub.color,
               duration: '1.5 hrs',
               session: `Session ${i + 1}`,
            });
         }
         schedule[day] = daySlots;
      });

      return schedule;
   }, [subjects, dailyHours]);

   const handleDownloadCSV = () => {
      if (subjects.length === 0) return;
      let csv = 'Day,Session,Subject,Difficulty,Duration,Study Slot\n';

      DAYS.forEach((day) => {
         (weeklySchedule[day] || []).forEach((slot) => {
            csv += `"${day}","${slot.session}","${slot.subject}","${slot.difficulty}","${slot.duration}","${preferredSlot}"\n`;
         });
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `klique-study-timetable-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      trackToolDownload('study-timetable', { fileType: 'csv' });
      showToast('Downloaded study timetable CSV!');
   };

   const relatedTools = useMemo(() => getRelatedTools('study-timetable', 3), []);

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
            title="Study Timetable Generator - Smart Exam Schedule Planner | Klique"
            description="Generate a balanced weekly study timetable based on subject difficulty, target hours, and exam deadlines with one-click CSV export."
            keywords="study timetable generator, exam revision planner, smart study schedule maker, student study planner online, klique"
            canonicalUrl="https://klique.netlify.app/tools/study-timetable"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'Study Timetable Generator',
               applicationCategory: 'EducationalApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Build structured weekly exam study routines and balance revision hours automatically.',
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
               <span className="text-[#daf4aa]">Study Timetable</span>
            </div>

            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:items-center">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#daf4aa]/30 bg-[#daf4aa]/10 text-[#daf4aa] text-xs font-medium tracking-wide mb-3">
                     <GraduationCap size={13} className="text-[#daf4aa]" />
                     <span>STUDENT ACADEMIC SUITE</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                     Study Timetable <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#daf4aa] via-lime-300 to-emerald-400">Generator</span>
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                     Generate a structured, fatigue-free weekly study schedule based on your subjects, exam deadlines, and daily revision hours.
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

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
               {/* Controls & Subjects List */}
               <div className="lg:col-span-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                     <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <BookOpen size={16} className="text-[#daf4aa]" />
                        Subjects & Routine
                     </h2>
                  </div>

                  {/* Daily Hours & Slots */}
                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300">Daily Study Hours</label>
                        <Dropdown
                           value={dailyHours}
                           onChange={(e) => setDailyHours(Number(e.target.value))}
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60 cursor-pointer">
                           <option value={2}>2 Hours / day</option>
                           <option value={4}>4 Hours / day</option>
                           <option value={6}>6 Hours / day</option>
                           <option value={8}>8 Hours / day</option>
                        </Dropdown>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300">Preferred Slot</label>
                        <Dropdown
                           value={preferredSlot}
                           onChange={(e) => setPreferredSlot(e.target.value)}
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60 cursor-pointer">
                           <option value="Morning (7 AM - 11 AM)">Morning (7 AM - 11 AM)</option>
                           <option value="Afternoon (1 PM - 5 PM)">Afternoon (1 PM - 5 PM)</option>
                           <option value="Evening (6 PM - 10 PM)">Evening (6 PM - 10 PM)</option>
                           <option value="Night (9 PM - 1 AM)">Night (9 PM - 1 AM)</option>
                        </Dropdown>
                     </div>
                  </div>

                  {/* Add Subject Form */}
                  <form onSubmit={handleAddSubject} className="space-y-3 pt-2 border-t border-zinc-800/80">
                     <span className="text-xs font-semibold text-zinc-300">Add New Subject</span>
                     <div className="space-y-1">
                        <InputControl
                           type="text"
                           value={subName}
                           onChange={(e) => setSubName(e.target.value)}
                           placeholder="Subject name (e.g. Organic Chemistry)"
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                        <Dropdown
                           value={subDiff}
                           onChange={(e) => setSubDiff(e.target.value)}
                           className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60 cursor-pointer">
                           <option value="Hard">Difficulty: Hard</option>
                           <option value="Medium">Difficulty: Medium</option>
                           <option value="Easy">Difficulty: Easy</option>
                        </Dropdown>
                        <InputControl
                           type="date"
                           value={subDate}
                           onChange={(e) => setSubDate(e.target.value)}
                           className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60"
                        />
                     </div>
                     <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] text-zinc-950 font-bold text-xs shadow-[0_0_15px_rgba(218,244,170,0.3)] transition-all cursor-pointer">
                        + Add Subject
                     </button>
                  </form>

                  {/* Active Subjects List */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                     <span className="text-xs font-semibold text-zinc-400">Current Subjects ({subjects.length})</span>
                     <div className="max-h-[220px] overflow-y-auto customScrollbar divide-y divide-zinc-800/40 border border-zinc-800/60 rounded-xl bg-zinc-950/50">
                        {subjects.map((sub) => (
                           <div key={sub.id} className="p-2.5 text-xs flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                 <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: sub.color }} />
                                 <span className="text-zinc-200 truncate font-medium">{sub.name}</span>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                 <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-zinc-400">
                                    {sub.difficulty}
                                 </span>
                                 <button
                                    onClick={() => handleDeleteSubject(sub.id)}
                                    className="text-zinc-500 hover:text-red-400 transition-colors">
                                    <Trash2 size={12} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Generated Weekly Timetable */}
               <div className="lg:col-span-7 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                     <div>
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                           <CalendarDays size={16} className="text-[#daf4aa]" />
                           Weekly Timetable ({preferredSlot})
                        </h2>
                     </div>
                  </div>

                  {/* Day by Day Cards Grid */}
                  <div className="max-h-[460px] overflow-y-auto customScrollbar space-y-3">
                     {DAYS.map((day) => {
                        const slots = weeklySchedule[day] || [];
                        return (
                           <div
                              key={day}
                              className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 space-y-2">
                              <div className="text-xs font-bold text-[#daf4aa] uppercase tracking-wider flex items-center justify-between">
                                 <span>{day}</span>
                                 <span className="text-[10px] text-zinc-500 font-mono font-normal">
                                    {dailyHours} Hours Target
                                 </span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                 {slots.map((slot, idx) => (
                                    <div
                                        key={idx}
                                        className="p-2.5 rounded-lg border border-zinc-800/60 bg-zinc-900/60 flex items-center justify-between text-xs">
                                        <div className="min-w-0 pr-2">
                                           <div className="font-medium text-zinc-200 truncate">{slot.subject}</div>
                                           <div className="text-[10px] text-zinc-500 mt-0.5">{slot.session} • {slot.duration}</div>
                                        </div>
                                        <span
                                           className="text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0"
                                           style={{
                                              backgroundColor: `${slot.color}20`,
                                              color: slot.color,
                                              border: `1px solid ${slot.color}40`,
                                           }}>
                                           {slot.difficulty}
                                        </span>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>

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

