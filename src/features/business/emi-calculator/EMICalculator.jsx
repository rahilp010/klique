/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   Calculator,
   TrendingDown,
   Calendar,
   IndianRupee,
   Percent,
   Copy,
   Download,
   Trash2,
   Check,
   Sparkles,
   ChevronDown,
   Clock,
   PieChart,
   HelpCircle,
   ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { calculateEMI } from '../../../lib/calculations/emi';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';
import { InputControl } from '../../../components/ui/CustomControl';

/* -------------------------------------------------------------------------- */
/*  LOAN PRESETS / SAMPLES                                                    */
/* -------------------------------------------------------------------------- */

const PRESETS = [
   {
      id: 'homeLoan',
      name: 'Home Loan — 20 Years @ 8.5%',
      principal: '3000000',
      rate: '8.5',
      tenure: '20',
      unit: 'years',
   },
   {
      id: 'carLoan',
      name: 'Car Loan — 5 Years @ 9.0%',
      principal: '800000',
      rate: '9.0',
      tenure: '5',
      unit: 'years',
   },
   {
      id: 'personalLoan',
      name: 'Personal Loan — 2 Years @ 12.5%',
      principal: '200000',
      rate: '12.5',
      tenure: '2',
      unit: 'years',
   },
   {
      id: 'educationLoan',
      name: 'Education Loan — 7 Years @ 10.0%',
      principal: '1500000',
      rate: '10.0',
      tenure: '7',
      unit: 'years',
   },
];

const FAQS = [
   {
      question: 'How is reducing-balance loan EMI calculated?',
      answer:
         'EMI is computed using the standard compound interest formula: E = [P × r × (1+r)^n] / [(1+r)^n − 1], where P is Principal, r is the monthly interest rate (Annual Rate / 12 / 100), and n is the tenure in months.',
   },
   {
      question: 'Why is the interest portion higher in early loan years?',
      answer:
         'Interest is charged on the outstanding loan balance. In the initial years, the remaining balance is large, so interest consumes a major chunk of your EMI. As you gradually repay the principal, the interest component decreases and principal repayment accelerates.',
   },
   {
      question: 'How do extra prepayments help reduce EMI or tenure?',
      answer:
         'Any extra payment directly reduces your outstanding principal balance, thereby cutting the total interest charged over the remaining duration.',
   },
   {
      question: 'Does this calculator include processing fees or taxes?',
      answer:
         'This calculator computes the pure financial loan amortization based on principal, interest rate, and tenure. Upfront processing fees and GST levied by banks are one-time charges usually added to the initial disbursement.',
   },
];

export default function EMICalculator() {
   // Core Loan Inputs
   const [principal, setPrincipal] = useState('2500000');
   const [annualRate, setAnnualRate] = useState('8.5');
   const [tenure, setTenure] = useState('20');
   const [tenureUnit, setTenureUnit] = useState('years'); // 'years' | 'months'

   // UI Mode & Tab State
   const [viewMode, setViewMode] = useState('calculator'); // 'calculator' | 'schedule'
   const [scheduleView, setScheduleView] = useState('yearly'); // 'yearly' | 'monthly'
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

   // Calculation
   const result = useMemo(() => {
      return calculateEMI({
         principal: Number(principal) || 0,
         annualRate: Number(annualRate) || 0,
         tenure: Number(tenure) || 0,
         tenureUnit,
      });
   }, [principal, annualRate, tenure, tenureUnit]);

   const principalRatio =
      result.totalPayment > 0
         ? ((result.principal / result.totalPayment) * 100).toFixed(1)
         : '0';
   const interestRatio =
      result.totalPayment > 0
         ? ((result.totalInterest / result.totalPayment) * 100).toFixed(1)
         : '0';

   // Actions
   const handleCopySummary = () => {
      const summaryText = `Loan EMI Calculation Summary (Klique):
Loan Amount (Principal): ₹${result.principal.toLocaleString('en-IN')}
Annual Interest Rate: ${annualRate}%
Tenure: ${tenure} ${tenureUnit} (${result.totalMonths} months)
Monthly EMI: ₹${result.emi.toLocaleString('en-IN')}
Total Interest Payable: ₹${result.totalInterest.toLocaleString('en-IN')} (${interestRatio}%)
Total Payment (Principal + Interest): ₹${result.totalPayment.toLocaleString('en-IN')}`;

      navigator.clipboard.writeText(summaryText);
      trackToolCopy('emi-calculator', { outputType: 'text', size: summaryText.length });
      showToast('Copied EMI summary to clipboard!');
   };

   const handleDownloadCSV = () => {
      let csv = 'Period,Principal Paid (INR),Interest Paid (INR),Total Payment (INR),Closing Balance (INR)\n';
      if (scheduleView === 'yearly') {
         result.yearlySummary.forEach((y) => {
            csv += `Year ${y.year},${y.principalPaid},${y.interestPaid},${y.totalPayment},${y.closingBalance}\n`;
         });
      } else {
         result.schedule.forEach((m) => {
            csv += `Month ${m.month},${m.principalPaid},${m.interestPaid},${m.emi},${m.balance}\n`;
         });
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `loan-emi-schedule-${result.emi}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      trackToolDownload('emi-calculator', { fileType: 'csv', fileSize: blob.size });
      showToast('Downloaded Amortization Schedule (CSV)!');
   };

   const handleReset = () => {
      setPrincipal('2500000');
      setAnnualRate('8.5');
      setTenure('20');
      setTenureUnit('years');
      setSelectedPreset('');
      trackToolReset('emi-calculator');
      showToast('Reset to default loan parameters');
   };

   const handleApplyPreset = (p) => {
      setPrincipal(p.principal);
      setAnnualRate(p.rate);
      setTenure(p.tenure);
      setTenureUnit(p.unit);
      setSelectedPreset(p.id);
      showToast(`Loaded ${p.name}`);
   };

   const relatedTools = useMemo(() => getRelatedTools('emi-calculator', 3), []);

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
            title="EMI Calculator & Loan Amortization Schedule - Free Online Tool | Klique"
            description="Calculate monthly loan payments (EMI), total interest payable, principal-to-interest ratio, and view full yearly/monthly amortization repayment schedules instantly."
            keywords="emi calculator, loan calculator, home loan emi, car loan emi, personal loan calculator, amortization schedule, loan repayment breakdown, klique"
            canonicalUrl="https://klique.netlify.app/tools/emi-calculator"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'EMI Calculator',
               applicationCategory: 'FinanceApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Calculate monthly loan payments, total interest payable, repayment schedule, and loan amortization breakdown.',
            }}
         />

         {/* Toast Notification matching JsonFormatter */}
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
                     <IndianRupee size={14} className="text-[#daf4aa]" />
                     <span>Financial Suite</span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                     EMI Calculator & Loan Amortization
                  </h1>

                  <p className="mt-1 text-sm text-zinc-400">
                     Calculate monthly loan payments, interest breakdown, and generate full repayment schedules with zero latency.
                  </p>
               </motion.div>

               {/* Mode Switcher Tabs */}
               <div className="flex items-center gap-1 rounded-full backdrop-blur-xl py-1">
                  <button
                     onClick={() => setViewMode('calculator')}
                     className={`flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-2.5 text-xs font-semibold transition-all ${
                        viewMode === 'calculator'
                           ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                           : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                     }`}>
                     <Calculator size={15} />
                     <span>Calculator</span>
                  </button>

                  <button
                     onClick={() => setViewMode('schedule')}
                     className={`flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-2.5 text-xs font-semibold transition-all ${
                        viewMode === 'schedule'
                           ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                           : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                     }`}>
                     <TrendingDown size={15} />
                     <span>Schedule View</span>
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
                     <span>Quick Loan Presets</span>
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
                                       {p.rate}%
                                    </span>
                                 </div>
                                 <span className="text-[11px] text-zinc-500 block">
                                    ₹{(Number(p.principal) / 100000).toFixed(1)} Lakh · {p.tenure} {p.unit}
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
                     <span className="h-2 w-2 rounded-full bg-[#daf4aa]" />
                     <span>Updated real-time on every input</span>
                  </div>
               </div>

               <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  <button
                     onClick={handleCopySummary}
                     className="col-span-2 sm:col-span-1 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#daf4aa] px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-[#daf4aa]/10 transition hover:bg-[#c9e894]">
                     <Copy size={14} /> Copy Summary
                  </button>

                  <button
                     onClick={handleDownloadCSV}
                     className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white">
                     <Download size={14} /> Download Schedule (CSV)
                  </button>

                  <button
                     onClick={handleReset}
                     className="col-span-2 sm:col-span-1 inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3.5 py-2.5 text-xs font-semibold text-red-300 transition hover:border-red-500/40 hover:bg-red-500/[0.12] xl:flex-none">
                     <Trash2 size={14} /> Reset parameters
                  </button>
               </div>
            </section>

            {/* Validation & Stats Status Banner matching JsonFormatter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 sm:px-4 sm:py-2.5 text-xs mb-6">
               <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 font-semibold text-emerald-400">
                     <Check size={13} /> Active Loan Computation
                  </span>
               </div>

               <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
                  <span>
                     Monthly EMI: <strong className="text-[#daf4aa]">₹{result.emi.toLocaleString('en-IN')}</strong>
                  </span>
                  <span>
                     Total Interest: <strong className="text-amber-400/90">₹{result.totalInterest.toLocaleString('en-IN')}</strong>
                  </span>
                  <span>
                     Tenure: <strong className="text-zinc-200">{result.totalMonths} mos</strong>
                  </span>
               </div>
            </div>

            {/* DUAL PANE WORKSPACE (Input Parameters & Results Breakdown) */}
            {viewMode === 'calculator' && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Pane: Loan Inputs */}
                  <div className="flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                     <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                        <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                           <Calculator size={14} className="text-[#daf4aa]" /> Loan Parameters
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                           Reducing Balance
                        </span>
                     </div>

                     <div className="p-4 sm:p-6 flex flex-col gap-6">
                        {/* Principal Amount */}
                        <div>
                           <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-semibold text-zinc-300">
                                 Loan Amount (Principal)
                              </label>
                              <span className="text-xs font-mono font-bold text-[#daf4aa]">
                                 ₹{Number(principal || 0).toLocaleString('en-IN')}
                              </span>
                           </div>

                           <div className="relative flex items-center rounded-xl border border-zinc-800 bg-[#0d0d10] px-3.5 py-2.5 focus-within:border-[#daf4aa] transition-colors">
                              <span className="text-zinc-500 text-sm mr-2 select-none">₹</span>
                              <InputControl
                                 type="number"
                                 value={principal}
                                 onChange={(e) => setPrincipal(e.target.value)}
                                 placeholder="2500000"
                                 min="0"
                                 className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none font-mono"
                              />
                           </div>

                           {/* Slider */}
                           <input
                              type="range"
                              min="100000"
                              max="10000000"
                              step="50000"
                              value={Number(principal) || 0}
                              onChange={(e) => setPrincipal(e.target.value)}
                              className="w-full mt-3 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#daf4aa]"
                           />

                           {/* Preset Chips */}
                           <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">
                                 Presets:
                              </span>
                              {[500000, 1000000, 2500000, 5000000, 7500000].map((val) => (
                                 <button
                                    key={val}
                                    type="button"
                                    onClick={() => setPrincipal(String(val))}
                                    className="px-2 py-0.5 rounded-lg border border-zinc-800 bg-zinc-900 text-[11px] font-mono text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
                                    ₹{(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)}L
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Annual Interest Rate */}
                        <div>
                           <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-semibold text-zinc-300">
                                 Annual Interest Rate
                              </label>
                              <span className="text-xs font-mono font-bold text-[#daf4aa]">
                                 {annualRate}% per annum
                              </span>
                           </div>

                           <div className="relative flex items-center rounded-xl border border-zinc-800 bg-[#0d0d10] px-3.5 py-2.5 focus-within:border-[#daf4aa] transition-colors">
                              <InputControl
                                 type="number"
                                 value={annualRate}
                                 onChange={(e) => setAnnualRate(e.target.value)}
                                 placeholder="8.5"
                                 step="0.05"
                                 min="0"
                                 max="100"
                                 className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none font-mono"
                              />
                              <span className="text-zinc-500 text-sm select-none">%</span>
                           </div>

                           {/* Slider */}
                           <input
                              type="range"
                              min="5"
                              max="20"
                              step="0.1"
                              value={Number(annualRate) || 0}
                              onChange={(e) => setAnnualRate(e.target.value)}
                              className="w-full mt-3 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#daf4aa]"
                           />

                           {/* Rate Chips */}
                           <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">
                                 Common:
                              </span>
                              {[7.5, 8.5, 9.0, 10.5, 12.0, 14.0].map((r) => (
                                 <button
                                    key={r}
                                    type="button"
                                    onClick={() => setAnnualRate(String(r))}
                                    className="px-2 py-0.5 rounded-lg border border-zinc-800 bg-zinc-900 text-[11px] font-mono text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
                                    {r}%
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Loan Tenure */}
                        <div>
                           <div className="flex items-center justify-between mb-2">
                              <label className="text-xs font-semibold text-zinc-300">
                                 Tenure Duration
                              </label>

                              <div className="flex items-center gap-1 rounded-full bg-zinc-900/60 p-0.5 border border-zinc-800 text-[11px]">
                                 <button
                                    type="button"
                                    onClick={() => setTenureUnit('years')}
                                    className={`px-2.5 py-0.5 rounded-full transition-all ${
                                       tenureUnit === 'years'
                                          ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                                          : 'text-zinc-400 hover:text-white'
                                    }`}>
                                    Years
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() => setTenureUnit('months')}
                                    className={`px-2.5 py-0.5 rounded-full transition-all ${
                                       tenureUnit === 'months'
                                          ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                                          : 'text-zinc-400 hover:text-white'
                                    }`}>
                                    Months
                                 </button>
                              </div>
                           </div>

                           <div className="relative flex items-center rounded-xl border border-zinc-800 bg-[#0d0d10] px-3.5 py-2.5 focus-within:border-[#daf4aa] transition-colors">
                              <InputControl
                                 type="number"
                                 value={tenure}
                                 onChange={(e) => setTenure(e.target.value)}
                                 placeholder={tenureUnit === 'years' ? '20' : '240'}
                                 min="1"
                                 max={tenureUnit === 'years' ? '40' : '480'}
                                 className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none font-mono"
                              />
                              <span className="text-zinc-500 text-xs select-none">
                                 {tenureUnit === 'years' ? 'Years' : 'Months'}
                              </span>
                           </div>

                           {/* Slider */}
                           <input
                              type="range"
                              min="1"
                              max={tenureUnit === 'years' ? '30' : '360'}
                              step="1"
                              value={Number(tenure) || 1}
                              onChange={(e) => setTenure(e.target.value)}
                              className="w-full mt-3 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#daf4aa]"
                           />

                           {/* Tenure Chips */}
                           <div className="flex flex-wrap items-center gap-1.5 mt-2">
                              <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">
                                 Tenure:
                              </span>
                              {(tenureUnit === 'years'
                                 ? [3, 5, 10, 15, 20, 25, 30]
                                 : [12, 24, 36, 60, 120, 240]
                              ).map((t) => (
                                 <button
                                    key={t}
                                    type="button"
                                    onClick={() => setTenure(String(t))}
                                    className="px-2 py-0.5 rounded-lg border border-zinc-800 bg-zinc-900 text-[11px] font-mono text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
                                    {t} {tenureUnit === 'years' ? 'Y' : 'M'}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Right Pane: Output Breakdown */}
                  <div className="flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                     <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                        <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                           <IndianRupee size={14} className="text-[#daf4aa]" /> Repayment Breakdown
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
                        {/* Highlight EMI Banner */}
                        <div className="rounded-xl border border-zinc-800 bg-[#0d0d10] p-4 sm:p-5 flex flex-col justify-between">
                           <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                 Monthly Loan EMI
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#daf4aa]/15 text-[#daf4aa] border border-[#daf4aa]/30">
                                 {result.totalMonths} Installments
                              </span>
                           </div>

                           <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#daf4aa] font-mono">
                              ₹{result.emi.toLocaleString('en-IN')}
                           </div>

                           <span className="text-[11px] text-zinc-500 mt-2">
                              Payment over {(result.totalMonths / 12).toFixed(1)} years at {annualRate}% p.a.
                           </span>
                        </div>

                        {/* Principal & Interest Stat Cards */}
                        <div className="grid grid-cols-2 gap-3.5">
                           <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5">
                              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
                                 Principal Amount
                              </span>
                              <span className="text-lg sm:text-xl font-bold font-mono text-zinc-100 block">
                                 ₹{result.principal.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                                 {principalRatio}% of total repayment
                              </span>
                           </div>

                           <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5">
                              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
                                 Total Interest
                              </span>
                              <span className="text-lg sm:text-xl font-bold font-mono text-amber-400 block">
                                 ₹{result.totalInterest.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                                 {interestRatio}% of total repayment
                              </span>
                           </div>
                        </div>

                        {/* Grand Total */}
                        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5 flex items-center justify-between">
                           <div>
                              <span className="text-xs font-semibold text-zinc-300 block">
                                 Total Payment (Principal + Interest)
                              </span>
                              <span className="text-[11px] text-zinc-500 block">
                                 Cumulative amount paid over full tenure
                              </span>
                           </div>
                           <span className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                              ₹{result.totalPayment.toLocaleString('en-IN')}
                           </span>
                        </div>

                        {/* Proportional Progress Bar matching JsonFormatter design tokens */}
                        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5">
                           <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-2">
                              <span>Distribution Proportion</span>
                              <span className="font-mono text-zinc-300">100%</span>
                           </div>

                           <div className="h-3 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden flex">
                              <div
                                 style={{ width: `${principalRatio}%` }}
                                 className="h-full bg-[#daf4aa] shadow-[0_0_8px_rgba(218,244,170,0.4)]"
                                 title={`Principal: ${principalRatio}%`}
                              />
                              <div
                                 style={{ width: `${interestRatio}%` }}
                                 className="h-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]"
                                 title={`Interest: ${interestRatio}%`}
                              />
                           </div>

                           <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mt-2.5">
                              <div className="flex items-center gap-1.5">
                                 <span className="w-2 h-2 rounded-full bg-[#daf4aa]" />
                                 <span>Principal: {principalRatio}%</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                 <span className="w-2 h-2 rounded-full bg-amber-400" />
                                 <span>Interest: {interestRatio}%</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* FULL AMORTIZATION SCHEDULE TABLE (Dedicated Mode or Tab) */}
            {(viewMode === 'schedule' || viewMode === 'calculator') && (
               <div className="mt-8 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div>
                        <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                           <TrendingDown size={14} className="text-[#daf4aa]" /> Amortization Schedule
                        </span>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                           Detailed breakdown of principal reduction, interest paid, and closing loan balance
                        </p>
                     </div>

                     <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 rounded-full bg-zinc-900/60 p-1 border border-zinc-800 text-[11px]">
                           <button
                              type="button"
                              onClick={() => setScheduleView('yearly')}
                              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                                 scheduleView === 'yearly'
                                    ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_12px_rgba(218,244,170,0.3)]'
                                    : 'text-zinc-400 hover:text-white'
                              }`}>
                              Yearly View
                           </button>
                           <button
                              type="button"
                              onClick={() => setScheduleView('monthly')}
                              className={`px-3 py-1 rounded-full font-semibold transition-all ${
                                 scheduleView === 'monthly'
                                    ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_12px_rgba(218,244,170,0.3)]'
                                    : 'text-zinc-400 hover:text-white'
                              }`}>
                              Monthly View
                           </button>
                        </div>

                        <button
                           onClick={handleDownloadCSV}
                           className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors">
                           <Download size={13} /> Export CSV
                        </button>
                     </div>
                  </div>

                  <div className="overflow-x-auto max-h-[460px] customScrollbar">
                     <table className="w-full text-left text-xs font-mono">
                        <thead className="bg-zinc-900/60 text-zinc-400 font-bold sticky top-0 border-b border-zinc-800/80 z-10 backdrop-blur-md">
                           <tr>
                              <th className="py-3 px-4">{scheduleView === 'yearly' ? 'Year' : 'Month'}</th>
                              <th className="py-3 px-4">Principal Repaid</th>
                              <th className="py-3 px-4">Interest Paid</th>
                              <th className="py-3 px-4">Total Installment</th>
                              <th className="py-3 px-4">Remaining Balance</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/40 text-zinc-300">
                           {scheduleView === 'yearly'
                              ? result.yearlySummary.map((item) => (
                                   <tr key={item.year} className="hover:bg-zinc-800/40 transition-colors">
                                      <td className="py-2.5 px-4 font-semibold text-zinc-200">Year {item.year}</td>
                                      <td className="py-2.5 px-4 text-[#daf4aa]">
                                         ₹{item.principalPaid.toLocaleString('en-IN')}
                                      </td>
                                      <td className="py-2.5 px-4 text-amber-400/90">
                                         ₹{item.interestPaid.toLocaleString('en-IN')}
                                      </td>
                                      <td className="py-2.5 px-4 font-semibold text-emerald-400">
                                         ₹{item.totalPayment.toLocaleString('en-IN')}
                                      </td>
                                      <td className="py-2.5 px-4 text-zinc-400 font-medium">
                                         ₹{item.closingBalance.toLocaleString('en-IN')}
                                      </td>
                                   </tr>
                                ))
                              : result.schedule.map((item) => (
                                   <tr key={item.month} className="hover:bg-zinc-800/40 transition-colors">
                                      <td className="py-2.5 px-4 font-semibold text-zinc-200">
                                         Month {item.month} (Yr {item.year})
                                      </td>
                                      <td className="py-2.5 px-4 text-[#daf4aa]">
                                         ₹{item.principalPaid.toLocaleString('en-IN')}
                                      </td>
                                      <td className="py-2.5 px-4 text-amber-400/90">
                                         ₹{item.interestPaid.toLocaleString('en-IN')}
                                      </td>
                                      <td className="py-2.5 px-4 font-semibold text-emerald-400">
                                         ₹{item.emi.toLocaleString('en-IN')}
                                      </td>
                                      <td className="py-2.5 px-4 text-zinc-400 font-medium">
                                         ₹{item.balance.toLocaleString('en-IN')}
                                      </td>
                                   </tr>
                                ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {/* FAQs Section matching JsonFormatter dark card styling */}
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
                        <Sparkles size={14} className="text-[#daf4aa]" /> Related Financial Tools
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
