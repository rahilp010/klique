/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   Award,
   GraduationCap,
   Plus,
   Trash2,
   Copy,
   Download,
   Check,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ChevronRight,
   Percent,
   BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import {
   calculateSGPA,
   calculateCGPA,
   cgpaToPercentage,
   DEFAULT_GRADE_SCALE,
} from '../../../lib/calculations/gpa';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';
import { InputControl, Dropdown } from '../../../components/ui/CustomControl';

/* -------------------------------------------------------------------------- */
/*  SAMPLE DATASETS                                                           */
/* -------------------------------------------------------------------------- */

const INITIAL_COURSES = [
   { id: '1', name: 'Data Structures & Algorithms', credits: '4', gradePoints: 9 },
   { id: '2', name: 'Database Management Systems', credits: '4', gradePoints: 8 },
   { id: '3', name: 'Operating Systems', credits: '3', gradePoints: 8 },
   { id: '4', name: 'Computer Networks', credits: '3', gradePoints: 7 },
   { id: '5', name: 'Software Engineering Lab', credits: '2', gradePoints: 10 },
];

const INITIAL_SEMESTERS = [
   { id: '1', sem: 'Semester 1', credits: '20', gpa: '8.4' },
   { id: '2', sem: 'Semester 2', credits: '22', gpa: '8.6' },
   { id: '3', sem: 'Semester 3', credits: '21', gpa: '8.2' },
   { id: '4', sem: 'Semester 4', credits: '21', gpa: '8.8' },
];

const PRESETS = [
   {
      id: 'engSem',
      name: 'Engineering Sem — 5 Courses, 16 Credits',
      mode: 'sgpa',
      courses: INITIAL_COURSES,
   },
   {
      id: 'fourSems',
      name: '4-Semester CGPA — 84 Total Credits',
      mode: 'cgpa',
      semesters: INITIAL_SEMESTERS,
   },
   {
      id: 'cgpaConv',
      name: 'Direct Converter — 8.75 CGPA',
      mode: 'converter',
      cgpa: '8.75',
      multiplier: 9.5,
   },
];

const FAQS = [
   {
      question: 'How is SGPA (Semester Grade Point Average) calculated?',
      answer:
         'SGPA = Sum of (Course Credits × Grade Points) / Total Semester Credits. Each course contribution is weighted by its credit count.',
   },
   {
      question: 'How is CGPA calculated from multiple semesters?',
      answer:
         'CGPA = Sum of (Semester Credits × Semester SGPA) / Total Cumulative Credits across all semesters.',
   },
   {
      question: 'Why does CBSE and Indian Universities use the 9.5 multiplier?',
      answer:
         'CBSE and many state technical universities derived 9.5 by comparing historical scores of the top quartile students with percentage equivalence. Some universities also use 10.0 or institution-specific tables.',
   },
   {
      question: 'Can I add or remove custom courses?',
      answer:
         'Yes! You can add unlimited courses, adjust course credits, and select your letter grade from the UGC 10-point scale.',
   },
];

export default function CGPACalculator() {
   const [mode, setMode] = useState('sgpa'); // 'sgpa' | 'cgpa' | 'converter'
   const [courses, setCourses] = useState(INITIAL_COURSES);
   const [semesters, setSemesters] = useState(INITIAL_SEMESTERS);
   const [converterCGPA, setConverterCGPA] = useState('8.5');
   const [multiplier, setMultiplier] = useState(9.5);

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

   // Calculations
   const sgpaResult = useMemo(() => calculateSGPA(courses), [courses]);
   const sgpaPercentage = useMemo(
      () => cgpaToPercentage(sgpaResult.sgpa, multiplier),
      [sgpaResult.sgpa, multiplier]
   );

   const cgpaResult = useMemo(() => calculateCGPA(semesters), [semesters]);
   const cgpaPercentage = useMemo(
      () => cgpaToPercentage(cgpaResult.cgpa, multiplier),
      [cgpaResult.cgpa, multiplier]
   );

   const directPercentage = useMemo(
      () => cgpaToPercentage(Number(converterCGPA) || 0, multiplier),
      [converterCGPA, multiplier]
   );

   const getClassification = (score) => {
      if (score >= 9.0) return 'First Class with Distinction';
      if (score >= 7.5) return 'First Class';
      if (score >= 6.0) return 'Second Class';
      if (score >= 4.0) return 'Pass';
      return 'Needs Improvement';
   };

   // Handlers
   const handleAddCourse = () => {
      setCourses([
         ...courses,
         { id: String(Date.now()), name: `Subject ${courses.length + 1}`, credits: '3', gradePoints: 8 },
      ]);
      showToast('Added new course row');
   };

   const handleRemoveCourse = (id) => {
      if (courses.length > 1) {
         setCourses(courses.filter((c) => c.id !== id));
      }
   };

   const handleCourseChange = (id, field, value) => {
      setCourses(courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
   };

   const handleAddSemester = () => {
      setSemesters([
         ...semesters,
         { id: String(Date.now()), sem: `Semester ${semesters.length + 1}`, credits: '20', gpa: '8.0' },
      ]);
      showToast('Added new semester row');
   };

   const handleRemoveSemester = (id) => {
      if (semesters.length > 1) {
         setSemesters(semesters.filter((s) => s.id !== id));
      }
   };

   const handleSemesterChange = (id, field, value) => {
      setSemesters(semesters.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
   };

   const handleReset = () => {
      if (mode === 'sgpa') setCourses(INITIAL_COURSES);
      else if (mode === 'cgpa') setSemesters(INITIAL_SEMESTERS);
      else setConverterCGPA('8.5');
      trackToolReset('cgpa-calculator');
      showToast('Reset to default values');
   };

   const handleApplyPreset = (p) => {
      setMode(p.mode);
      if (p.courses) setCourses(p.courses);
      if (p.semesters) setSemesters(p.semesters);
      if (p.cgpa) setConverterCGPA(p.cgpa);
      if (p.multiplier) setMultiplier(p.multiplier);
      showToast(`Loaded ${p.name.split('—')[0].trim()}`);
   };

   const summaryText = useMemo(() => {
      if (mode === 'sgpa') {
         return `Semester SGPA Report (Klique):
SGPA: ${sgpaResult.sgpa} / 10.0
Equivalent Percentage: ${sgpaPercentage}% (Multiplier: ${multiplier})
Total Credits: ${sgpaResult.totalCredits}
Classification: ${getClassification(sgpaResult.sgpa)}`;
      } else if (mode === 'cgpa') {
         return `Cumulative CGPA Report (Klique):
CGPA: ${cgpaResult.cgpa} / 10.0
Equivalent Percentage: ${cgpaPercentage}% (Multiplier: ${multiplier})
Total Credits: ${cgpaResult.totalCredits}
Classification: ${getClassification(cgpaResult.cgpa)}`;
      } else {
         return `CGPA to Percentage Conversion (Klique):
CGPA: ${converterCGPA}
Equivalent Percentage: ${directPercentage}%
Formula: CGPA × ${multiplier}`;
      }
   }, [mode, sgpaResult, sgpaPercentage, cgpaResult, cgpaPercentage, converterCGPA, directPercentage, multiplier]);

   const handleCopySummary = () => {
      navigator.clipboard.writeText(summaryText);
      trackToolCopy('cgpa-calculator', { outputType: 'text', size: summaryText.length });
      showToast('Copied grade report to clipboard!');
   };

   const handleDownloadReport = () => {
      const content = `${summaryText}
Generated on ${new Date().toLocaleDateString()}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grade-report-${mode}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      trackToolDownload('cgpa-calculator', { fileType: 'txt', fileSize: blob.size });
      showToast('Downloaded grade report (TXT)!');
   };

   const relatedTools = useMemo(() => getRelatedTools('cgpa-calculator', 3), []);

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
            title="CGPA & SGPA Calculator - Grade to Percentage Converter | Klique"
            description="Calculate semester SGPA, cumulative CGPA, and convert grades to equivalent percentage using UGC 10-point scale and CBSE 9.5 multiplier."
            keywords="cgpa calculator, sgpa calculator, gpa to percentage, convert cgpa to percentage, credit point calculator, klique"
            canonicalUrl="https://klique.netlify.app/tools/cgpa-calculator"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'CGPA / GPA Calculator',
               applicationCategory: 'EducationalApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Calculate semester SGPA, overall CGPA, and percentage conversion using standard UGC scales.',
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
                     <Award size={14} className="text-[#daf4aa]" />
                     <span>Academic Suite</span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                     CGPA & SGPA Calculator
                  </h1>

                  <p className="mt-1 text-sm text-zinc-400">
                     Compute semester SGPA, cumulative CGPA, and convert your grades to equivalent percentage.
                  </p>
               </motion.div>

               {/* Mode Switcher Tabs */}
               <div className="flex items-center gap-1 rounded-full backdrop-blur-xl py-1">
                  <button
                     onClick={() => setMode('sgpa')}
                     className={`flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-2.5 text-xs font-semibold transition-all ${
                        mode === 'sgpa'
                           ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                           : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                     }`}>
                     <BookOpen size={14} />
                     <span>Semester SGPA</span>
                  </button>

                  <button
                     onClick={() => setMode('cgpa')}
                     className={`flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-2.5 text-xs font-semibold transition-all ${
                        mode === 'cgpa'
                           ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                           : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                     }`}>
                     <Award size={14} />
                     <span>Cumulative CGPA</span>
                  </button>

                  <button
                     onClick={() => setMode('converter')}
                     className={`flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-2.5 text-xs font-semibold transition-all ${
                        mode === 'converter'
                           ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                           : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                     }`}>
                     <Percent size={14} />
                     <span>CGPA to %</span>
                  </button>
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
                     <span>Quick Grade Presets</span>
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                                       {p.mode.toUpperCase()}
                                    </span>
                                 </div>
                                 <span className="text-[11px] text-zinc-500 block">
                                    {p.name.split('—')[1]?.trim() || ''}
                                 </span>
                              </button>
                           ))}
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </section>

            {/* Quick Actions Bar */}
            <section className="rounded-2xl mb-6">
               <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs font-semibold text-zinc-400">
                     Quick Actions
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                     <span className="h-2 w-2 rounded-full bg-[#daf4aa]" />
                     <span>10-Point Scale Applied</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  <button
                     onClick={handleCopySummary}
                     className="col-span-2 sm:col-span-1 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#daf4aa] px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-[#daf4aa]/10 transition hover:bg-[#c9e894]">
                     <Copy size={14} /> Copy Grade Report
                  </button>

                  <button
                     onClick={handleDownloadReport}
                     className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white">
                     <Download size={14} /> Download Report
                  </button>

                  <button
                     onClick={handleReset}
                     className="col-span-2 sm:col-span-1 inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3.5 py-2.5 text-xs font-semibold text-red-300 transition hover:border-red-500/40 hover:bg-red-500/[0.12] xl:flex-none">
                     <Trash2 size={14} /> Reset inputs
                  </button>
               </div>
            </section>

            {/* Live Stats Status Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 sm:px-4 sm:py-2.5 text-xs mb-6">
               <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 font-semibold text-emerald-400">
                     <Check size={13} /> UGC 10-Point System
                  </span>
               </div>

               <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
                  <span>
                     Score: <strong className="text-[#daf4aa]">
                        {mode === 'sgpa' ? `${sgpaResult.sgpa} SGPA` : mode === 'cgpa' ? `${cgpaResult.cgpa} CGPA` : `${converterCGPA} CGPA`}
                     </strong>
                  </span>
                  <span>
                     Percentage: <strong className="text-zinc-200">
                        {mode === 'sgpa' ? sgpaPercentage : mode === 'cgpa' ? cgpaPercentage : directPercentage}%
                     </strong>
                  </span>
               </div>
            </div>

            {/* DUAL PANE WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
               {/* Left Pane: Courses / Semesters List */}
               <div className="lg:col-span-7 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                        <GraduationCap size={14} className="text-[#daf4aa]" />
                        {mode === 'sgpa' ? 'Semester Course Roster' : mode === 'cgpa' ? 'Semester History' : 'Direct Conversion'}
                     </span>
                     {mode === 'sgpa' && (
                        <button
                           type="button"
                           onClick={handleAddCourse}
                           className="flex items-center gap-1 text-xs font-semibold text-[#daf4aa] hover:text-[#daf4aa]/80 transition-colors">
                           <Plus size={14} /> Add Subject
                        </button>
                     )}
                     {mode === 'cgpa' && (
                        <button
                           type="button"
                           onClick={handleAddSemester}
                           className="flex items-center gap-1 text-xs font-semibold text-[#daf4aa] hover:text-[#daf4aa]/80 transition-colors">
                           <Plus size={14} /> Add Semester
                        </button>
                     )}
                  </div>

                  <div className="p-4 sm:p-6 flex flex-col gap-4">
                     {/* Multiplier toggle */}
                     <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 text-xs">
                        <span className="text-zinc-400 font-medium">Conversion Formula:</span>
                        <div className="flex items-center gap-1.5">
                           <button
                              type="button"
                              onClick={() => setMultiplier(9.5)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                                 multiplier === 9.5
                                    ? 'bg-[#daf4aa] text-zinc-950 font-bold shadow'
                                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                              }`}>
                              CGPA × 9.5 (CBSE/AICTE)
                           </button>
                           <button
                              type="button"
                              onClick={() => setMultiplier(10.0)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                                 multiplier === 10.0
                                    ? 'bg-[#daf4aa] text-zinc-950 font-bold shadow'
                                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                              }`}>
                              CGPA × 10.0 (Direct)
                           </button>
                        </div>
                     </div>

                     {/* MODE 1: COURSES LIST */}
                     {mode === 'sgpa' && (
                        <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto customScrollbar pr-1">
                           {courses.map((course) => (
                              <div
                                 key={course.id}
                                 className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-[#0d0d10] border border-zinc-800/80">
                                 <div className="col-span-6 sm:col-span-5">
                                    <InputControl
                                       type="text"
                                       value={course.name}
                                       onChange={(e) => handleCourseChange(course.id, 'name', e.target.value)}
                                       placeholder="Course Name"
                                       className="w-full bg-transparent text-xs text-zinc-200 outline-none truncate"
                                    />
                                 </div>

                                 <div className="col-span-3 sm:col-span-3">
                                    <InputControl
                                       type="number"
                                       value={course.credits}
                                       onChange={(e) => handleCourseChange(course.id, 'credits', e.target.value)}
                                       placeholder="Credits"
                                       min="1"
                                       className="w-full bg-[#18181d] px-2 py-1.5 rounded-lg border border-zinc-700/60 text-xs text-zinc-200 text-center outline-none font-mono"
                                    />
                                 </div>

                                 <div className="col-span-3 sm:col-span-3">
                                    <Dropdown
                                       value={course.gradePoints}
                                       onChange={(e) => handleCourseChange(course.id, 'gradePoints', Number(e.target.value))}
                                       className="w-full bg-[#18181d] px-2 py-1.5 rounded-lg border border-zinc-700/60 text-xs text-zinc-200 outline-none cursor-pointer">
                                       {DEFAULT_GRADE_SCALE.map((g) => (
                                          <option key={g.label} value={g.points}>
                                             {g.label.split(' ')[0]} ({g.points})
                                          </option>
                                       ))}
                                    </Dropdown>
                                 </div>

                                 <div className="col-span-1 hidden sm:flex justify-end">
                                    <button
                                       type="button"
                                       onClick={() => handleRemoveCourse(course.id)}
                                       disabled={courses.length <= 1}
                                       className="text-zinc-600 hover:text-rose-400 disabled:opacity-30 p-1">
                                       <Trash2 size={13} />
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     {/* MODE 2: SEMESTER LIST */}
                     {mode === 'cgpa' && (
                        <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto customScrollbar pr-1">
                           {semesters.map((sem) => (
                              <div
                                 key={sem.id}
                                 className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-[#0d0d10] border border-zinc-800/80">
                                 <div className="col-span-5">
                                    <InputControl
                                       type="text"
                                       value={sem.sem}
                                       onChange={(e) => handleSemesterChange(sem.id, 'sem', e.target.value)}
                                       className="w-full bg-transparent text-xs text-zinc-200 outline-none font-medium truncate"
                                    />
                                 </div>

                                 <div className="col-span-3">
                                    <InputControl
                                       type="number"
                                       value={sem.credits}
                                       onChange={(e) => handleSemesterChange(sem.id, 'credits', e.target.value)}
                                       placeholder="Credits"
                                       className="w-full bg-[#18181d] px-2 py-1.5 rounded-lg border border-zinc-700/60 text-xs text-zinc-200 text-center outline-none font-mono"
                                    />
                                 </div>

                                 <div className="col-span-3">
                                    <InputControl
                                       type="number"
                                       value={sem.gpa}
                                       onChange={(e) => handleSemesterChange(sem.id, 'gpa', e.target.value)}
                                       placeholder="SGPA"
                                       step="0.01"
                                       className="w-full bg-[#18181d] px-2 py-1.5 rounded-lg border border-zinc-700/60 text-xs text-zinc-200 text-center outline-none font-mono"
                                    />
                                 </div>

                                 <div className="col-span-1 flex justify-end">
                                    <button
                                       type="button"
                                       onClick={() => handleRemoveSemester(sem.id)}
                                       disabled={semesters.length <= 1}
                                       className="text-zinc-600 hover:text-rose-400 disabled:opacity-30 p-1">
                                       <Trash2 size={13} />
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}

                     {/* MODE 3: DIRECT CONVERTER */}
                     {mode === 'converter' && (
                        <div className="flex flex-col gap-4 py-4">
                           <div>
                              <label className="text-xs font-semibold text-zinc-300 block mb-2">
                                 Enter Cumulative CGPA (0.00 to 10.00)
                              </label>
                              <div className="relative flex items-center rounded-xl border border-zinc-800 bg-[#0d0d10] px-3.5 py-2.5 focus-within:border-[#daf4aa] transition-colors">
                                 <InputControl
                                    type="number"
                                    value={converterCGPA}
                                    onChange={(e) => setConverterCGPA(e.target.value)}
                                    placeholder="8.5"
                                    step="0.01"
                                    min="0"
                                    max="10"
                                    className="w-full bg-transparent text-sm text-zinc-100 outline-none font-mono"
                                 />
                              </div>
                           </div>

                           <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">
                                 Quick Scores:
                              </span>
                              {[7.0, 7.5, 8.0, 8.5, 9.0, 9.5].map((val) => (
                                 <button
                                    key={val}
                                    type="button"
                                    onClick={() => setConverterCGPA(String(val))}
                                    className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-mono text-zinc-400 hover:text-white transition-colors">
                                    {val.toFixed(1)}
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Right Pane: Results Output */}
               <div className="lg:col-span-5 flex flex-col gap-4">
                  {/* Highlight Grade Result */}
                  <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-5 shadow-2xl">
                     <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                        {mode === 'sgpa' ? 'Semester SGPA' : mode === 'cgpa' ? 'Cumulative CGPA' : 'Equivalent Percentage'}
                     </span>

                     <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#daf4aa] font-mono">
                        {mode === 'sgpa'
                           ? `${sgpaResult.sgpa} / 10.0`
                           : mode === 'cgpa'
                           ? `${cgpaResult.cgpa} / 10.0`
                           : `${directPercentage}%`}
                     </div>

                     <span className="text-xs text-zinc-400 block mt-2 font-medium">
                        Equivalent Percentage: <strong className="text-white">{mode === 'sgpa' ? sgpaPercentage : mode === 'cgpa' ? cgpaPercentage : directPercentage}%</strong>
                     </span>

                     <div className="mt-3 pt-3 border-t border-zinc-800/60 text-xs text-zinc-400">
                        Classification: <strong className="text-emerald-400">{getClassification(mode === 'sgpa' ? sgpaResult.sgpa : cgpaResult.cgpa)}</strong>
                     </div>
                  </div>

                  {/* Summary Stat Cards */}
                  <div className="grid grid-cols-2 gap-3.5">
                     <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5">
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
                           Equivalent %
                        </span>
                        <span className="text-lg sm:text-xl font-bold font-mono text-zinc-100 block">
                           {mode === 'sgpa' ? sgpaPercentage : mode === 'cgpa' ? cgpaPercentage : directPercentage}%
                        </span>
                     </div>

                     <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5">
                        <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
                           Total Credits
                        </span>
                        <span className="text-lg sm:text-xl font-bold font-mono text-[#daf4aa] block">
                           {mode === 'sgpa' ? sgpaResult.totalCredits : mode === 'cgpa' ? cgpaResult.totalCredits : '—'}
                        </span>
                     </div>
                  </div>

                  {/* 10-Point Grading Scale Reference */}
                  <div className="rounded-2xl border border-zinc-800 bg-[#121215] p-4 text-xs shadow-xl">
                     <span className="font-semibold uppercase tracking-wider text-zinc-400 block mb-2.5">
                        UGC 10-Point Grade Reference
                     </span>
                     <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px] text-zinc-400">
                        <span>O (Outstanding): 10</span>
                        <span>A+ (Excellent): 9</span>
                        <span>A (Very Good): 8</span>
                        <span>B+ (Good): 7</span>
                        <span>B (Above Avg): 6</span>
                        <span>C (Average): 5</span>
                        <span>P (Pass): 4</span>
                        <span>F (Fail): 0</span>
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
