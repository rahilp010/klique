/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   IndianRupee,
   Calculator,
   Percent,
   Copy,
   Download,
   Trash2,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ChevronRight,
   ShieldCheck,
   TrendingUp,
   PieChart,
   ArrowRight,
   Briefcase,
   Receipt,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { calculateSalary } from '../../../lib/calculations/salary';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*  PRESETS & FAQS                                                            */
/* -------------------------------------------------------------------------- */

const PRESETS = [
   {
      id: 'ctc-6lpa',
      name: '₹6 LPA (Entry Developer)',
      ctc: '600000',
      basicPercent: 50,
      hraPercent: 50,
      epfMode: 'capped',
      regime: 'new',
   },
   {
      id: 'ctc-12lpa',
      name: '₹12 LPA (Senior Software Eng)',
      ctc: '1200000',
      basicPercent: 50,
      hraPercent: 50,
      epfMode: 'capped',
      regime: 'new',
   },
   {
      id: 'ctc-20lpa',
      name: '₹20 LPA (Staff Eng / Tech Lead)',
      ctc: '2000000',
      basicPercent: 40,
      hraPercent: 50,
      epfMode: 'actual',
      regime: 'new',
   },
   {
      id: 'ctc-35lpa',
      name: '₹35 LPA (Principal / Director)',
      ctc: '3500000',
      basicPercent: 40,
      hraPercent: 50,
      epfMode: 'actual',
      regime: 'new',
   },
];

const FAQS = [
   {
      question: 'Why is my In-Hand salary different from CTC / 12?',
      answer:
         'Cost to Company (CTC) includes direct employee earnings plus statutory employer deductions like Employer EPF (12%), Gratuity, Employee EPF, Professional Tax, and Income Tax (TDS). In-Hand salary is what actually hits your bank account each month after all deductions.',
   },
   {
      question: 'What is the ₹75,000 Standard Deduction in the New Tax Regime?',
      answer:
         'Under Union Budget 2024, the standard deduction for salaried individuals in the New Tax Regime was increased from ₹50,000 to ₹75,000, reducing taxable income for FY 2024-25 (AY 2025-26).',
   },
   {
      question: 'Is salary up to ₹7 LPA completely tax-free?',
      answer:
         'Yes! Under Section 87A of the Income Tax Act in the New Tax Regime, if your net taxable income is up to ₹7,00,000, you receive a full tax rebate, bringing your payable income tax to zero.',
   },
   {
      question: 'What is the difference between Capped and Actual EPF?',
      answer:
         'Capped EPF limits the employee contribution to 12% of the statutory wage ceiling of ₹15,000/month (which equals ₹1,800/month). Actual EPF contributes 12% of your actual Basic Salary, resulting in higher retirement savings but slightly lower monthly take-home.',
   },
];

export default function SalaryCalculator() {
   // Core Inputs
   const [ctc, setCtc] = useState('1200000');
   const [basicPercent, setBasicPercent] = useState(50);
   const [hraPercent, setHraPercent] = useState(50);
   const [epfMode, setEpfMode] = useState('capped'); // 'capped' | 'actual' | 'none'
   const [professionalTax, setProfessionalTax] = useState('200');
   const [includeGratuity, setIncludeGratuity] = useState(false);
   const [regime, setRegime] = useState('new'); // 'new' | 'old'

   // UI State
   const [showQuickSetup, setShowQuickSetup] = useState(false);
   const [selectedPreset, setSelectedPreset] = useState('');
   const [openFaq, setOpenFaq] = useState(null);

   // Toast State
   const [toast, setToast] = useState({ message: '', visible: false });

   const showToast = (message) => {
      setToast({ message, visible: true });
      setTimeout(() => {
         setToast({ message: '', visible: false });
      }, 2500);
   };

   // Calculations
   const result = useMemo(() => {
      return calculateSalary({
         ctc: Number(ctc) || 0,
         basicPercent,
         hraPercent,
         epfMode,
         professionalTax: Number(professionalTax) || 0,
         includeGratuity,
         regime,
      });
   }, [ctc, basicPercent, hraPercent, epfMode, professionalTax, includeGratuity, regime]);

   const inHandRatio = result.inHandPercentage;
   const deductionsRatio = (100 - inHandRatio).toFixed(1);

   const applyPreset = (preset) => {
      setSelectedPreset(preset.id);
      setCtc(preset.ctc);
      setBasicPercent(preset.basicPercent);
      setHraPercent(preset.hraPercent);
      setEpfMode(preset.epfMode);
      setRegime(preset.regime);
      showToast(`Applied preset: ${preset.name}`);
   };

   const handleReset = () => {
      setCtc('1200000');
      setBasicPercent(50);
      setHraPercent(50);
      setEpfMode('capped');
      setProfessionalTax('200');
      setIncludeGratuity(false);
      setRegime('new');
      setSelectedPreset('');
      trackToolReset('salary-calculator');
      showToast('Reset salary calculator.');
   };

   const summaryText = useMemo(() => {
      return `Indian Salary & In-Hand Pay Breakdown (Klique):
Annual CTC: ₹${result.annualCTC.toLocaleString('en-IN')}
Monthly In-Hand (Take-Home): ₹${result.monthlyInHand.toLocaleString('en-IN')}
Annual In-Hand: ₹${result.annualInHand.toLocaleString('en-IN')} (${result.inHandPercentage}% of CTC)
Monthly Gross: ₹${result.monthlyGross.toLocaleString('en-IN')}
Monthly EPF: ₹${result.monthlyEmployeeEPF.toLocaleString('en-IN')}
Monthly TDS (Tax): ₹${result.monthlyTax.toLocaleString('en-IN')}
Monthly PT: ₹${result.monthlyPT.toLocaleString('en-IN')}
Tax Regime: ${regime === 'new' ? 'New Tax Regime (FY 2024-25)' : 'Old Tax Regime'}`;
   }, [result, regime]);

   const handleCopySummary = () => {
      navigator.clipboard.writeText(summaryText);
      trackToolCopy('salary-calculator', { outputType: 'summary', size: summaryText.length });
      showToast('Copied salary breakdown summary!');
   };

   const handleDownloadCSV = () => {
      const csv = `Component,Monthly (INR),Annual (INR)
Cost to Company (CTC),${result.monthlyCTC},${result.annualCTC}
Basic Salary,${result.monthlyBasic},${result.annualBasic}
HRA,${result.monthlyHRA},${result.annualHRA}
Special Allowance,${result.monthlySpecialAllowance},${result.annualSpecialAllowance}
Gross Salary,${result.monthlyGross},${result.annualGross}
Employee EPF,${result.monthlyEmployeeEPF},${result.annualEmployeeEPF}
Professional Tax (PT),${result.monthlyPT},${result.annualPT}
Income Tax (TDS),${result.monthlyTax},${result.annualTax}
Total Deductions,${result.monthlyTotalDeductions},${result.annualTotalDeductions}
Net In-Hand (Take-Home),${result.monthlyInHand},${result.annualInHand}`;

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salary-in-hand-${result.annualCTC}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      trackToolDownload('salary-calculator', { fileType: 'csv', fileSize: blob.size });
      showToast('Downloaded salary breakdown (CSV)!');
   };

   const relatedTools = useMemo(() => getRelatedTools('salary-calculator', 3), []);

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
            title="Salary Calculator — CTC to In-Hand Take Home Pay India (FY 2024-25)"
            description="Calculate exact monthly take-home salary from annual CTC with EPF, Professional Tax, and New Tax Regime slabs (Budget 2024)."
            keywords="salary calculator, ctc to in hand, take home salary calculator, in hand salary calculator india, new tax regime budget 2024"
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
                  <IndianRupee size={13} className="text-[#daf4aa]" />
                  <span>Business & Finance Suite</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">CTC to Take-Home</span>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        Salary Calculator (CTC to In-Hand)
                     </h1>
                     <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                        Convert your annual CTC into exact monthly take-home pay with EPF, HRA, professional tax, and Budget 2024-25 tax slabs.
                     </p>
                  </div>

                  {/* Regime Tabs */}
                  <div className="flex items-center p-1 rounded-full bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-xl self-start sm:self-auto shadow-inner">
                     <button
                        type="button"
                        onClick={() => setRegime('new')}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                           regime === 'new'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        New Tax Regime (FY 24-25)
                     </button>
                     <button
                        type="button"
                        onClick={() => setRegime('old')}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                           regime === 'old'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        Old Tax Regime
                     </button>
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
                        Quick Salary Packages & Benchmarks
                     </span>
                     <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
                        (₹6 LPA, ₹12 LPA, ₹20 LPA, ₹35 LPA)
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
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
                                 <div className="text-[11px] text-zinc-500">
                                    ₹{Number(preset.ctc).toLocaleString('en-IN')} CTC • {preset.epfMode} EPF
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
                     <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                     {result.inHandPercentage}% Take-Home Ratio
                  </span>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <button
                     type="button"
                     onClick={handleCopySummary}
                     className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-[#cbf094] shadow-sm">
                     <Copy size={13} />
                     <span>Copy Payslip Summary</span>
                  </button>

                  <button
                     type="button"
                     onClick={handleDownloadCSV}
                     className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white">
                     <Download size={13} />
                     <span>Download CSV</span>
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

            {/* Status & Stats Banner */}
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 sm:px-4 sm:py-2.5 text-xs">
               <div>
                  <span className="text-zinc-500 block text-[11px]">Monthly Gross</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     ₹{result.monthlyGross.toLocaleString('en-IN')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Monthly Deductions</span>
                  <span className="font-semibold text-rose-400 text-sm">
                     -₹{result.monthlyTotalDeductions.toLocaleString('en-IN')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Monthly In-Hand</span>
                  <span className="font-semibold text-[#daf4aa] text-sm">
                     ₹{result.monthlyInHand.toLocaleString('en-IN')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Annual Take-Home</span>
                  <span className="font-semibold text-emerald-400 text-sm">
                     ₹{result.annualInHand.toLocaleString('en-IN')}
                  </span>
               </div>
            </div>

            {/* Dual Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               {/* Left Pane: Controls */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           CTC & Package Structure
                        </span>
                     </div>
                     <span className="text-[11px] font-mono text-zinc-500">Live Compute</span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {/* Annual CTC */}
                     <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                           Annual Cost to Company (CTC in ₹)
                        </label>
                        <div className="relative mb-2">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-semibold">
                              ₹
                           </span>
                           <input
                              type="number"
                              min="0"
                              value={ctc}
                              onChange={(e) => setCtc(e.target.value)}
                              placeholder="e.g. 1200000"
                              className="w-full pl-7 pr-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-[#daf4aa] transition-colors"
                           />
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                           {[600000, 1000000, 1500000, 2500000, 5000000].map((v) => (
                              <button
                                 key={v}
                                 type="button"
                                 onClick={() => setCtc(String(v))}
                                 className="text-xs px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors">
                                 ₹{(v / 100000).toFixed(0)}L
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Basic Salary % */}
                     <div>
                        <div className="flex items-center justify-between mb-1.5">
                           <label className="text-xs font-semibold text-zinc-300">
                              Basic Salary (% of CTC)
                           </label>
                           <span className="text-xs text-[#daf4aa] font-mono">{basicPercent}%</span>
                        </div>
                        <input
                           type="range"
                           min="30"
                           max="60"
                           value={basicPercent}
                           onChange={(e) => setBasicPercent(Number(e.target.value))}
                           className="w-full accent-[#daf4aa] cursor-pointer"
                        />
                        <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                           <span>30% (Standard)</span>
                           <span>40%</span>
                           <span>50% (Recommended)</span>
                           <span>60%</span>
                        </div>
                     </div>

                     {/* HRA % */}
                     <div>
                        <div className="flex items-center justify-between mb-1.5">
                           <label className="text-xs font-semibold text-zinc-300">
                              House Rent Allowance (HRA % of Basic)
                           </label>
                           <span className="text-xs text-[#daf4aa] font-mono">{hraPercent}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <button
                              type="button"
                              onClick={() => setHraPercent(50)}
                              className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
                                 hraPercent === 50
                                    ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                    : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                              }`}>
                              50% (Metro Cities: Mumbai, Delhi, BLR)
                           </button>
                           <button
                              type="button"
                              onClick={() => setHraPercent(40)}
                              className={`text-xs px-3 py-1.5 rounded-lg border font-medium ${
                                 hraPercent === 40
                                    ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                    : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                              }`}>
                              40% (Non-Metro)
                           </button>
                        </div>
                     </div>

                     {/* EPF Mode */}
                     <div>
                        <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                           Employee Provident Fund (EPF) Contribution
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                           <button
                              type="button"
                              onClick={() => setEpfMode('capped')}
                              className={`p-2 rounded-xl border text-xs text-left transition-all ${
                                 epfMode === 'capped'
                                    ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-white'
                                    : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                              }`}>
                              <span className="font-semibold block text-zinc-200">Capped ₹1,800/mo</span>
                              <span className="text-[10px] text-zinc-500">Statutory 12% of ₹15k</span>
                           </button>

                           <button
                              type="button"
                              onClick={() => setEpfMode('actual')}
                              className={`p-2 rounded-xl border text-xs text-left transition-all ${
                                 epfMode === 'actual'
                                    ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-white'
                                    : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                              }`}>
                              <span className="font-semibold block text-zinc-200">Actual 12%</span>
                              <span className="text-[10px] text-zinc-500">12% on Full Basic</span>
                           </button>

                           <button
                              type="button"
                              onClick={() => setEpfMode('none')}
                              className={`p-2 rounded-xl border text-xs text-left transition-all ${
                                 epfMode === 'none'
                                    ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-white'
                                    : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                              }`}>
                              <span className="font-semibold block text-zinc-200">Opt Out</span>
                              <span className="text-[10px] text-zinc-500">No PF deduction</span>
                           </button>
                        </div>
                     </div>

                     {/* Professional Tax & Gratuity */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                        <div>
                           <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                              Professional Tax (PT ₹/mo)
                           </label>
                           <select
                              value={professionalTax}
                              onChange={(e) => setProfessionalTax(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]">
                              <option value="200">₹200 / month (Standard)</option>
                              <option value="0">₹0 (States with no PT)</option>
                           </select>
                        </div>

                        <div className="flex flex-col justify-end">
                           <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pb-2">
                              <input
                                 type="checkbox"
                                 checked={includeGratuity}
                                 onChange={(e) => setIncludeGratuity(e.target.checked)}
                                 className="accent-[#daf4aa]"
                              />
                              <span>Include Gratuity in CTC (4.81%)</span>
                           </label>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Pane: Results & Payslip Summary */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Receipt size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Monthly Payslip Breakdown
                        </span>
                     </div>
                     <span className="text-xs font-semibold text-emerald-400">
                        {regime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'}
                     </span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-5">
                     {/* Monthly Take Home Highlight */}
                     <div className="rounded-2xl border border-[#daf4aa]/30 bg-[#daf4aa]/10 p-4 sm:p-5 flex flex-col items-center justify-center text-center">
                        <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-1">
                           Net Monthly In-Hand (Take-Home)
                        </span>
                        <div className="text-3xl sm:text-4xl font-extrabold text-[#daf4aa] tracking-tight">
                           ₹{result.monthlyInHand.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-zinc-400 mt-2 flex items-center gap-2">
                           <span>Annual Take-Home: ₹{result.annualInHand.toLocaleString('en-IN')}</span>
                           <span>•</span>
                           <span className="text-emerald-400 font-semibold">{result.inHandPercentage}% of CTC</span>
                        </div>
                     </div>

                     {/* Ratio Bar */}
                     <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2">
                           <span>CTC Distribution</span>
                           <span>₹{result.monthlyCTC.toLocaleString('en-IN')} / mo</span>
                        </div>

                        <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden flex shadow-inner">
                           <div
                              style={{ width: `${inHandRatio}%` }}
                              className="h-full bg-[#daf4aa] transition-all duration-300"
                              title={`In-Hand: ${inHandRatio}%`}
                           />
                           <div
                              style={{ width: `${deductionsRatio}%` }}
                              className="h-full bg-rose-500 transition-all duration-300"
                              title={`Deductions: ${deductionsRatio}%`}
                           />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2.5">
                           <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#daf4aa]" />
                              <span>In-Hand ({inHandRatio}%)</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                              <span>Taxes & Deductions ({deductionsRatio}%)</span>
                           </div>
                        </div>
                     </div>

                     {/* Monthly Detailed Earnings & Deductions Table */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Earnings */}
                        <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
                           <span className="text-[11px] uppercase tracking-wider font-bold text-[#daf4aa] block mb-1">
                              Monthly Earnings
                           </span>
                           <div className="flex justify-between text-zinc-400">
                              <span>Basic Salary:</span>
                              <span className="font-mono text-zinc-200">
                                 ₹{result.monthlyBasic.toLocaleString('en-IN')}
                              </span>
                           </div>
                           <div className="flex justify-between text-zinc-400">
                              <span>HRA:</span>
                              <span className="font-mono text-zinc-200">
                                 ₹{result.monthlyHRA.toLocaleString('en-IN')}
                              </span>
                           </div>
                           <div className="flex justify-between text-zinc-400">
                              <span>Special Allowance:</span>
                              <span className="font-mono text-zinc-200">
                                 ₹{result.monthlySpecialAllowance.toLocaleString('en-IN')}
                              </span>
                           </div>
                           <div className="border-t border-zinc-800 pt-1.5 flex justify-between font-bold text-zinc-200">
                              <span>Gross Salary:</span>
                              <span className="text-[#daf4aa]">
                                 ₹{result.monthlyGross.toLocaleString('en-IN')}
                              </span>
                           </div>
                        </div>

                        {/* Deductions */}
                        <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
                           <span className="text-[11px] uppercase tracking-wider font-bold text-rose-400 block mb-1">
                              Monthly Deductions
                           </span>
                           <div className="flex justify-between text-zinc-400">
                              <span>Employee EPF (12%):</span>
                              <span className="font-mono text-rose-300">
                                 -₹{result.monthlyEmployeeEPF.toLocaleString('en-IN')}
                              </span>
                           </div>
                           <div className="flex justify-between text-zinc-400">
                              <span>Professional Tax (PT):</span>
                              <span className="font-mono text-rose-300">
                                 -₹{result.monthlyPT.toLocaleString('en-IN')}
                              </span>
                           </div>
                           <div className="flex justify-between text-zinc-400">
                              <span>Income Tax (TDS):</span>
                              <span className="font-mono text-rose-300">
                                 -₹{result.monthlyTax.toLocaleString('en-IN')}
                              </span>
                           </div>
                           <div className="border-t border-zinc-800 pt-1.5 flex justify-between font-bold text-zinc-200">
                              <span>Total Deductions:</span>
                              <span className="text-rose-400">
                                 -₹{result.monthlyTotalDeductions.toLocaleString('en-IN')}
                              </span>
                           </div>
                        </div>
                     </div>

                     {/* Annual Totals Summary */}
                     <div className="space-y-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-3 text-xs">
                        <div className="flex justify-between text-zinc-400">
                           <span>Annual Income Tax (New Regime):</span>
                           <span className="font-mono text-zinc-200">
                              {result.annualTax > 0 ? `₹${result.annualTax.toLocaleString('en-IN')}` : '₹0 (Sec 87A Rebate)'}
                           </span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                           <span>Standard Deduction Applied:</span>
                           <span className="font-mono text-emerald-400">₹75,000</span>
                        </div>
                        <div className="h-[1px] bg-zinc-800/80 my-1" />
                        <div className="flex justify-between font-bold text-sm text-white">
                           <span>Annual Net In-Hand:</span>
                           <span className="text-[#daf4aa]">
                              ₹{result.annualInHand.toLocaleString('en-IN')}
                           </span>
                        </div>
                     </div>
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

