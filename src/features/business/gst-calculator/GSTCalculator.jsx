/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   Calculator,
   Receipt,
   IndianRupee,
   Percent,
   Copy,
   Download,
   Trash2,
   Check,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ChevronRight,
   Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { calculateGST, GST_RATES } from '../../../lib/calculations/gst';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';
import { InputControl } from '../../../components/ui/CustomControl';

/* -------------------------------------------------------------------------- */
/*  PRESETS                                                                   */
/* -------------------------------------------------------------------------- */

const PRESETS = [
   {
      id: 'electronics',
      name: 'Electronics — ₹24,999 @ 18% Exclusive',
      amount: '24999',
      rate: 18,
      isInclusive: false,
      supplyType: 'intra',
   },
   {
      id: 'restaurant',
      name: 'Restaurant — ₹1,250 @ 5% Inclusive',
      amount: '1250',
      rate: 5,
      isInclusive: true,
      supplyType: 'intra',
   },
   {
      id: 'luxury',
      name: 'Luxury Hotel — ₹80,000 @ 28% Exclusive',
      amount: '80000',
      rate: 28,
      isInclusive: false,
      supplyType: 'intra',
   },
   {
      id: 'interstate',
      name: 'Inter-State Goods — ₹50,000 @ 18% IGST',
      amount: '50000',
      rate: 18,
      isInclusive: false,
      supplyType: 'inter',
   },
];

const FAQS = [
   {
      question: 'What is the difference between GST Inclusive and Exclusive?',
      answer:
         'GST Exclusive means tax is added on top of the base price (Total = Base + Tax). GST Inclusive means the entered price already contains the tax, and this calculator extracts the original base price and the tax component.',
   },
   {
      question: 'When is CGST + SGST applied versus IGST?',
      answer:
         'Intra-state supply (buyer and seller within the same Indian state) is split equally into Central GST (CGST) and State GST (SGST). Inter-state supply (buyer and seller in different states) attracts Integrated GST (IGST) at the full rate.',
   },
   {
      question: 'What is the formula for calculating GST?',
      answer:
         'For Exclusive GST: GST Amount = (Base Amount × Rate) / 100. For Inclusive GST: Base Amount = Total Amount / (1 + Rate / 100), and GST Amount = Total Amount − Base Amount.',
   },
   {
      question: 'How do I reverse calculate GST from an MRP?',
      answer:
         'Select "GST Inclusive" mode and enter the MRP. The calculator will automatically deduce the exact net amount prior to taxation and the exact tax amount embedded in the price.',
   },
];

export default function GSTCalculator() {
   const [amount, setAmount] = useState('10000');
   const [rate, setRate] = useState(18);
   const [isCustomRate, setIsCustomRate] = useState(false);
   const [customRate, setCustomRate] = useState('');
   const [isInclusive, setIsInclusive] = useState(false);
   const [supplyType, setSupplyType] = useState('intra'); // 'intra' | 'inter'

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

   const activeRate = isCustomRate ? Number(customRate) || 0 : rate;

   const result = useMemo(() => {
      return calculateGST({
         amount: Number(amount) || 0,
         rate: activeRate,
         isInclusive,
         supplyType,
      });
   }, [amount, activeRate, isInclusive, supplyType]);

   const handleReset = () => {
      setAmount('10000');
      setRate(18);
      setIsCustomRate(false);
      setCustomRate('');
      setIsInclusive(false);
      setSupplyType('intra');
      trackToolReset('gst-calculator');
      showToast('Reset to default GST parameters');
   };

   const handleApplyPreset = (p) => {
      setAmount(p.amount);
      setRate(p.rate);
      setIsCustomRate(false);
      setCustomRate('');
      setIsInclusive(p.isInclusive);
      setSupplyType(p.supplyType);
      showToast(`Loaded ${p.name.split('—')[0].trim()}`);
   };

   const summaryText = useMemo(() => {
      return `GST Calculation Summary (Klique):
Base Price: ₹${result.netAmount.toLocaleString('en-IN')}
GST Rate: ${result.rate}% (${result.isInclusive ? 'Inclusive' : 'Exclusive'})
Total GST: ₹${result.gstAmount.toLocaleString('en-IN')}
${
   result.supplyType === 'intra'
      ? `• CGST (${result.cgstRate}%): ₹${result.cgst.toLocaleString('en-IN')}\n• SGST (${result.sgstRate}%): ₹${result.sgst.toLocaleString('en-IN')}`
      : `• IGST (${result.igstRate}%): ₹${result.igst.toLocaleString('en-IN')}`
}
Grand Total: ₹${result.totalAmount.toLocaleString('en-IN')}`;
   }, [result]);

   const csvContent = useMemo(() => {
      return `Description,Percentage,Amount (INR)
Net Base Amount,-,${result.netAmount}
GST Rate,${result.rate}%,${result.gstAmount}
CGST,${result.cgstRate}%,${result.cgst}
SGST,${result.sgstRate}%,${result.sgst}
IGST,${result.igstRate}%,${result.igst}
Grand Total,-,${result.totalAmount}`;
   }, [result]);

   const handleCopySummary = () => {
      navigator.clipboard.writeText(summaryText);
      trackToolCopy('gst-calculator', { outputType: 'text', size: summaryText.length });
      showToast('Copied GST summary to clipboard!');
   };

   const handleDownloadCSV = () => {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gst-breakdown-${result.totalAmount}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      trackToolDownload('gst-calculator', { fileType: 'csv', fileSize: blob.size });
      showToast('Downloaded GST breakdown (CSV)!');
   };

   const relatedTools = useMemo(() => getRelatedTools('gst-calculator', 3), []);

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
            title="GST Calculator (India) - CGST, SGST & IGST Calculator | Klique"
            description="Calculate inclusive and exclusive GST, determine CGST/SGST (intra-state) or IGST (inter-state) split, and reverse calculate original base prices with zero latency."
            keywords="gst calculator, india gst calculator, reverse gst, cgst sgst calculator, igst calculator, inclusive gst, klique"
            canonicalUrl="https://klique.netlify.app/tools/gst-calculator"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'GST Calculator (India)',
               applicationCategory: 'FinanceApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Calculate GST-inclusive and exclusive amounts, split CGST/SGST/IGST, and reverse GST.',
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
                     <Calculator size={14} className="text-[#daf4aa]" />
                     <span>Business Suite</span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                     GST Calculator (India)
                  </h1>

                  <p className="mt-1 text-sm text-zinc-400">
                     Calculate inclusive and exclusive GST, determine CGST/SGST/IGST splits, and reverse calculate base prices.
                  </p>
               </motion.div>

               {/* Mode Switcher Tabs */}
               <div className="flex items-center gap-1 rounded-full backdrop-blur-xl py-1">
                  <button
                     onClick={() => setIsInclusive(false)}
                     className={`flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-2.5 text-xs font-semibold transition-all ${
                        !isInclusive
                           ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                           : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                     }`}>
                     <Receipt size={15} />
                     <span>GST Exclusive (Add)</span>
                  </button>

                  <button
                     onClick={() => setIsInclusive(true)}
                     className={`flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-2.5 text-xs font-semibold transition-all ${
                        isInclusive
                           ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                           : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                     }`}>
                     <Layers size={15} />
                     <span>GST Inclusive (Remove)</span>
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
                     <span>Quick Scenarios</span>
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
                                       {p.rate}% GST
                                    </span>
                                 </div>
                                 <span className="text-[11px] text-zinc-500 block">
                                    ₹{Number(p.amount).toLocaleString('en-IN')} · {p.isInclusive ? 'Inclusive' : 'Exclusive'}
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
                     <Download size={14} /> Download Breakdown (CSV)
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
                     <Check size={13} /> Active GST Slab: {result.rate}%
                  </span>
               </div>

               <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
                  <span>
                     Base: <strong className="text-zinc-200">₹{result.netAmount.toLocaleString('en-IN')}</strong>
                  </span>
                  <span>
                     Tax: <strong className="text-[#daf4aa]">₹{result.gstAmount.toLocaleString('en-IN')}</strong>
                  </span>
                  <span>
                     Total: <strong className="text-emerald-400">₹{result.totalAmount.toLocaleString('en-IN')}</strong>
                  </span>
               </div>
            </div>

            {/* DUAL PANE WORKSPACE (Input Parameters & Results Breakdown) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
               {/* Left Pane: GST Inputs */}
               <div className="flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                        <Calculator size={14} className="text-[#daf4aa]" /> GST Parameters
                     </span>
                     <span className="text-[11px] text-zinc-500 font-mono">
                        {isInclusive ? 'Inclusive Mode' : 'Exclusive Mode'}
                     </span>
                  </div>

                  <div className="p-4 sm:p-6 flex flex-col gap-6">
                     {/* Base Amount */}
                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <label className="text-xs font-semibold text-zinc-300">
                              {isInclusive ? 'Total Price (MRP / Inclusive Amount)' : 'Base Amount (Net Price)'}
                           </label>
                           <span className="text-xs font-mono font-bold text-[#daf4aa]">
                              ₹{Number(amount || 0).toLocaleString('en-IN')}
                           </span>
                        </div>

                        <div className="relative flex items-center rounded-xl border border-zinc-800 bg-[#0d0d10] px-3.5 py-2.5 focus-within:border-[#daf4aa] transition-colors">
                           <span className="text-zinc-500 text-sm mr-2 select-none">₹</span>
                           <InputControl
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="10000"
                              min="0"
                              className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 outline-none font-mono"
                           />
                        </div>

                        {/* Presets */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                           <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">
                              Presets:
                           </span>
                           {[1000, 5000, 10000, 25000, 50000, 100000].map((val) => (
                              <button
                                 key={val}
                                 type="button"
                                 onClick={() => setAmount(String(val))}
                                 className="px-2 py-0.5 rounded-lg border border-zinc-800 bg-zinc-900 text-[11px] font-mono text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
                                 ₹{val.toLocaleString('en-IN')}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* GST Slab Rate Selection */}
                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <label className="text-xs font-semibold text-zinc-300">
                              Standard GST Slab Rate
                           </label>
                           <span className="text-xs font-mono font-bold text-[#daf4aa]">
                              {activeRate}%
                           </span>
                        </div>

                        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                           {GST_RATES.map((r) => {
                              const active = !isCustomRate && rate === r;
                              return (
                                 <button
                                    key={r}
                                    type="button"
                                    onClick={() => {
                                       setRate(r);
                                       setIsCustomRate(false);
                                    }}
                                    className={`py-2 rounded-xl text-xs font-semibold font-mono border transition-all ${
                                       active
                                          ? 'bg-[#daf4aa] text-zinc-950 border-[#daf4aa] shadow-[0_0_12px_rgba(218,244,170,0.3)]'
                                          : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                                    }`}>
                                    {r}%
                                 </button>
                              );
                           })}
                           <button
                              type="button"
                              onClick={() => setIsCustomRate(true)}
                              className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                                 isCustomRate
                                    ? 'bg-[#daf4aa] text-zinc-950 border-[#daf4aa] shadow-[0_0_12px_rgba(218,244,170,0.3)]'
                                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                              }`}>
                              Custom
                           </button>
                        </div>

                        {isCustomRate && (
                           <div className="mt-3">
                              <div className="relative flex items-center rounded-xl border border-zinc-800 bg-[#0d0d10] px-3.5 py-2 focus-within:border-[#daf4aa] transition-colors">
                                 <InputControl
                                    type="number"
                                    value={customRate}
                                    onChange={(e) => setCustomRate(e.target.value)}
                                    placeholder="Enter custom rate %"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    className="w-full bg-transparent text-xs text-zinc-100 placeholder:text-zinc-600 outline-none font-mono"
                                 />
                                 <span className="text-zinc-500 text-xs">%</span>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Supply Jurisdiction (Intra-State vs Inter-State) */}
                     <div>
                        <label className="text-xs font-semibold text-zinc-300 block mb-2">
                           Supply Jurisdiction
                        </label>
                        <div className="grid grid-cols-2 gap-2 bg-[#0d0d10] p-1 rounded-2xl border border-zinc-800">
                           <button
                              type="button"
                              onClick={() => setSupplyType('intra')}
                              className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                                 supplyType === 'intra'
                                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                                    : 'text-zinc-500 hover:text-zinc-300'
                              }`}>
                              Intra-State (CGST + SGST)
                           </button>
                           <button
                              type="button"
                              onClick={() => setSupplyType('inter')}
                              className={`py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                                 supplyType === 'inter'
                                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                                    : 'text-zinc-500 hover:text-zinc-300'
                              }`}>
                              Inter-State (IGST)
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Pane: GST Results Breakdown */}
               <div className="flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                        <IndianRupee size={14} className="text-[#daf4aa]" /> Tax & Price Breakdown
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
                     {/* Highlight Total Card */}
                     <div className="rounded-xl border border-zinc-800 bg-[#0d0d10] p-4 sm:p-5 flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                              {isInclusive ? 'Total Amount (MRP)' : 'Grand Total (Amount + GST)'}
                           </span>
                           <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#daf4aa]/15 text-[#daf4aa] border border-[#daf4aa]/30">
                              {result.rate}% GST Applied
                           </span>
                        </div>

                        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#daf4aa] font-mono">
                           ₹{result.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>

                        <span className="text-[11px] text-zinc-500 mt-2">
                           {isInclusive
                              ? `Contains ₹${result.netAmount.toLocaleString('en-IN')} net price + ₹${result.gstAmount.toLocaleString('en-IN')} GST.`
                              : `Net amount ₹${result.netAmount.toLocaleString('en-IN')} + ₹${result.gstAmount.toLocaleString('en-IN')} GST.`}
                        </span>
                     </div>

                     {/* Sub-cards */}
                     <div className="grid grid-cols-2 gap-3.5">
                        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5">
                           <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
                              Net Base Price
                           </span>
                           <span className="text-lg sm:text-xl font-bold font-mono text-zinc-100 block">
                              ₹{result.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                           </span>
                           <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                              Before tax
                           </span>
                        </div>

                        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5">
                           <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
                              Total GST
                           </span>
                           <span className="text-lg sm:text-xl font-bold font-mono text-amber-400 block">
                              ₹{result.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                           </span>
                           <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                              {result.rate}% tax amount
                           </span>
                        </div>
                     </div>

                     {/* Tax Component Breakdown Table */}
                     <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3">
                           Tax Component Breakdown
                        </span>

                        <div className="flex flex-col divide-y divide-zinc-800/60 font-mono text-xs">
                           {result.supplyType === 'intra' ? (
                              <>
                                 <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-400">CGST ({result.cgstRate}%)</span>
                                    <span className="font-semibold text-zinc-200">
                                       ₹{result.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                 </div>
                                 <div className="flex items-center justify-between py-2.5">
                                    <span className="text-zinc-400">SGST ({result.sgstRate}%)</span>
                                    <span className="font-semibold text-zinc-200">
                                       ₹{result.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                 </div>
                              </>
                           ) : (
                              <div className="flex items-center justify-between py-2.5">
                                 <span className="text-zinc-400">IGST ({result.igstRate}%)</span>
                                 <span className="font-semibold text-zinc-200">
                                    ₹{result.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                 </span>
                              </div>
                           )}

                           <div className="flex items-center justify-between pt-3 font-bold text-zinc-100">
                              <span>Total Tax Payable</span>
                              <span className="text-[#daf4aa]">
                                 ₹{result.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* FAQs Section matching JsonFormatter */}
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
                        <Sparkles size={14} className="text-[#daf4aa]" /> Related Business Tools
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
