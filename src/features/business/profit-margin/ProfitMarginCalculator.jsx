/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   TrendingUp,
   TrendingDown,
   Percent,
   IndianRupee,
   Copy,
   Download,
   Trash2,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ChevronRight,
   PieChart,
   ShieldAlert,
   DollarSign,
   ArrowRight,
   Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import {
   calculateProfit,
   calculateSellingPriceFromMargin,
   calculateSellingPriceFromMarkup,
} from '../../../lib/calculations/profitMargin';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';
import { InputControl } from '../../../components/ui/CustomControl';

/* -------------------------------------------------------------------------- */
/*  PRESETS & FAQS                                                            */
/* -------------------------------------------------------------------------- */

const PRESETS = [
   {
      id: 'retail',
      name: 'Consumer Retail — 40% Margin',
      mode: 'standard',
      costPrice: '600',
      sellingPrice: '1000',
      desiredMargin: '40',
      desiredMarkup: '66.7',
   },
   {
      id: 'ecommerce',
      name: 'E-Commerce / D2C — 50% Margin',
      mode: 'from-margin',
      costPrice: '1200',
      sellingPrice: '2400',
      desiredMargin: '50',
      desiredMarkup: '100',
   },
   {
      id: 'wholesale',
      name: 'Wholesale B2B — 25% Markup',
      mode: 'from-markup',
      costPrice: '800',
      sellingPrice: '1000',
      desiredMargin: '20',
      desiredMarkup: '25',
   },
   {
      id: 'luxury',
      name: 'Luxury / SaaS — 70% Margin',
      mode: 'from-margin',
      costPrice: '300',
      sellingPrice: '1000',
      desiredMargin: '70',
      desiredMarkup: '233.3',
   },
];

const FAQS = [
   {
      question: 'What is the difference between Profit Margin and Markup?',
      answer:
         'Profit Margin is the profit expressed as a percentage of the Selling Price: Margin = (Profit / Selling Price) × 100. Markup is the profit as a percentage of the Cost Price: Markup = (Profit / Cost Price) × 100. For example, if cost is ₹100 and selling price is ₹150, profit is ₹50: Margin is 33.3%, while Markup is 50%.',
   },
   {
      question: 'How do I calculate Selling Price from Cost and Desired Margin?',
      answer:
         'Selling Price = Cost Price / (1 − Desired Margin % / 100). For example, to make a 25% margin on an item that costs ₹75: Selling Price = 75 / (1 − 0.25) = ₹100.',
   },
   {
      question: 'What is the Break-even Price?',
      answer:
         'The break-even price is the exact amount you must charge to cover the product cost without making a profit or suffering a loss (Selling Price = Cost Price).',
   },
   {
      question: 'Can margin ever exceed 100%?',
      answer:
         'No. Since profit is a subset of the selling price, profit margin can never be 100% or greater (unless cost is negative). Markup, however, can easily exceed 100%, 200%, or 500% when selling price is many multiples of cost.',
   },
];

export default function ProfitMarginCalculator() {
   const [mode, setMode] = useState('standard'); // 'standard' | 'from-margin' | 'from-markup'

   // Standard Mode
   const [costPrice, setCostPrice] = useState('600');
   const [sellingPrice, setSellingPrice] = useState('1000');

   // Target Margin Mode
   const [desiredMargin, setDesiredMargin] = useState('40');

   // Target Markup Mode
   const [desiredMarkup, setDesiredMarkup] = useState('50');

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

   const result = useMemo(() => {
      if (mode === 'standard') {
         return calculateProfit({
            costPrice: Number(costPrice) || 0,
            sellingPrice: Number(sellingPrice) || 0,
         });
      } else if (mode === 'from-margin') {
         return calculateSellingPriceFromMargin({
            costPrice: Number(costPrice) || 0,
            marginPercent: Number(desiredMargin) || 0,
         });
      } else {
         return calculateSellingPriceFromMarkup({
            costPrice: Number(costPrice) || 0,
            markupPercent: Number(desiredMarkup) || 0,
         });
      }
   }, [mode, costPrice, sellingPrice, desiredMargin, desiredMarkup]);

   const costRatio =
      result.sellingPrice > 0
         ? Math.min(100, Math.max(0, ((result.costPrice / result.sellingPrice) * 100))).toFixed(1)
         : '0';
   const profitRatio =
      result.sellingPrice > 0
         ? Math.min(100, Math.max(0, ((result.grossProfit / result.sellingPrice) * 100))).toFixed(1)
         : '0';

   const applyPreset = (preset) => {
      setSelectedPreset(preset.id);
      setMode(preset.mode);
      setCostPrice(preset.costPrice);
      if (preset.mode === 'standard') {
         setSellingPrice(preset.sellingPrice);
      } else if (preset.mode === 'from-margin') {
         setDesiredMargin(preset.desiredMargin);
      } else {
         setDesiredMarkup(preset.desiredMarkup);
      }
      showToast(`Applied preset: ${preset.name}`);
   };

   const handleReset = () => {
      setMode('standard');
      setCostPrice('600');
      setSellingPrice('1000');
      setDesiredMargin('40');
      setDesiredMarkup('50');
      setSelectedPreset('');
      trackToolReset('profit-margin-calculator');
      showToast('Reset profit margin calculator.');
   };

   const summaryText = useMemo(() => {
      return `Profit & Margin Report (Klique):
Cost Price: ₹${result.costPrice.toLocaleString('en-IN')}
Selling Price: ₹${result.sellingPrice.toLocaleString('en-IN')}
Gross Profit: ₹${result.grossProfit.toLocaleString('en-IN')}
Profit Margin: ${result.marginPercent}%
Markup: ${result.markupPercent}%
Break-even Price: ₹${result.costPrice.toLocaleString('en-IN')}`;
   }, [result]);

   const handleCopySummary = () => {
      navigator.clipboard.writeText(summaryText);
      trackToolCopy('profit-margin-calculator', { outputType: 'text', size: summaryText.length });
      showToast('Copied profit margin report to clipboard!');
   };

   const handleDownloadCSV = () => {
      const csv = `Metric,Value\nCost Price,${result.costPrice}\nSelling Price,${result.sellingPrice}\nGross Profit,${result.grossProfit}\nProfit Margin,${result.marginPercent}%\nMarkup,${result.markupPercent}%\nBreak-Even Price,${result.costPrice}`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `profit-margin-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      trackToolDownload('profit-margin-calculator', { fileType: 'csv', fileSize: blob.size });
      showToast('Downloaded profit report (CSV)!');
   };

   const relatedTools = useMemo(() => getRelatedTools('profit-margin-calculator', 3), []);

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
            title="Profit Margin Calculator — Calculate Gross Profit, Margin % & Markup"
            description="Calculate gross profit, profit margin percentage, markup percentage, and determine exact selling prices from cost and target margin."
            keywords="profit margin calculator, markup calculator, gross profit formula, selling price calculator, ecommerce profit margin"
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
                  <TrendingUp size={13} className="text-[#daf4aa]" />
                  <span>Business & Finance Suite</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">Margin & Markup</span>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        Profit Margin Calculator
                     </h1>
                     <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                        Compute gross profit, margin percentage, markup ratio, and reverse-calculate optimum selling prices based on target margins.
                     </p>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex items-center p-1 rounded-full bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-xl self-start sm:self-auto shadow-inner flex-wrap">
                     <button
                        type="button"
                        onClick={() => setMode('standard')}
                        className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                           mode === 'standard'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        Cost & Price
                     </button>
                     <button
                        type="button"
                        onClick={() => setMode('from-margin')}
                        className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                           mode === 'from-margin'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        Find Price via Margin %
                     </button>
                     <button
                        type="button"
                        onClick={() => setMode('from-markup')}
                        className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                           mode === 'from-markup'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        Find Price via Markup %
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
                        Quick Scenarios & Industry Standards
                     </span>
                     <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
                        (Retail 40%, E-Commerce 50%, Wholesale 25%, SaaS 70%)
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
                                    Cost ₹{preset.costPrice} • Target: {preset.desiredMargin}% Margin
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
                     <span className={`h-2 w-2 rounded-full ${result.grossProfit >= 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                     {result.grossProfit >= 0 ? 'Profitable Calculation' : 'Operating at Loss'}
                  </span>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <button
                     type="button"
                     onClick={handleCopySummary}
                     className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-[#cbf094] shadow-sm">
                     <Copy size={13} />
                     <span>Copy Profit Report</span>
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
                  <span className="text-zinc-500 block text-[11px]">Cost Price</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     ₹{result.costPrice.toLocaleString('en-IN')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Selling Price</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     ₹{result.sellingPrice.toLocaleString('en-IN')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Gross Profit</span>
                  <span className={`font-semibold text-sm ${result.grossProfit >= 0 ? 'text-[#daf4aa]' : 'text-rose-400'}`}>
                     ₹{result.grossProfit.toLocaleString('en-IN')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Profit Margin</span>
                  <span className={`font-semibold text-sm ${result.grossProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {result.marginPercent}%
                  </span>
               </div>
            </div>

            {/* Dual Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               {/* Left Pane: Controls */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Cost & Pricing Parameters
                        </span>
                     </div>
                     <span className="text-[11px] font-mono text-zinc-500">Live Compute</span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {/* Cost Price */}
                     <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                           Cost Price (₹) — Cost to produce or purchase
                        </label>
                        <div className="relative mb-2">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-semibold">
                              ₹
                           </span>
                           <InputControl
                              type="number"
                              min="0"
                              value={costPrice}
                              onChange={(e) => setCostPrice(e.target.value)}
                              placeholder="e.g. 600"
                              className="w-full pl-7 pr-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-[#daf4aa] transition-colors"
                           />
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                           {[200, 500, 1000, 2500, 5000].map((c) => (
                              <button
                                 key={c}
                                 type="button"
                                 onClick={() => setCostPrice(String(c))}
                                 className="text-xs px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors">
                                 ₹{c}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* MODE 1: Standard Selling Price Input */}
                     {mode === 'standard' && (
                        <div>
                           <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                              Selling Price (₹) — Customer charge
                           </label>
                           <div className="relative mb-2">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-semibold">
                                 ₹
                              </span>
                              <InputControl
                                 type="number"
                                 min="0"
                                 value={sellingPrice}
                                 onChange={(e) => setSellingPrice(e.target.value)}
                                 placeholder="e.g. 1000"
                                 className="w-full pl-7 pr-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-[#daf4aa] transition-colors"
                              />
                           </div>
                           <div className="flex flex-wrap items-center gap-1.5">
                              {[500, 1000, 1500, 3000, 8000].map((s) => (
                                 <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSellingPrice(String(s))}
                                    className="text-xs px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors">
                                    ₹{s}
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* MODE 2: Desired Margin Input */}
                     {mode === 'from-margin' && (
                        <div>
                           <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-semibold text-zinc-300">
                                 Desired Profit Margin (%)
                              </label>
                              <span className="text-xs text-[#daf4aa] font-mono">{desiredMargin}%</span>
                           </div>
                           <InputControl
                              type="number"
                              min="0"
                              max="99.9"
                              step="0.1"
                              value={desiredMargin}
                              onChange={(e) => setDesiredMargin(e.target.value)}
                              placeholder="e.g. 40"
                              className="w-full px-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-[#daf4aa] transition-colors mb-2"
                           />
                           <div className="flex flex-wrap items-center gap-1.5">
                              {[15, 25, 33.3, 40, 50, 60].map((m) => (
                                 <button
                                    key={m}
                                    type="button"
                                    onClick={() => setDesiredMargin(String(m))}
                                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                                       desiredMargin === String(m)
                                          ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                                    }`}>
                                    {m}%
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* MODE 3: Desired Markup Input */}
                     {mode === 'from-markup' && (
                        <div>
                           <div className="flex items-center justify-between mb-1.5">
                              <label className="text-xs font-semibold text-zinc-300">
                                 Desired Markup (%)
                              </label>
                              <span className="text-xs text-[#daf4aa] font-mono">{desiredMarkup}%</span>
                           </div>
                           <InputControl
                              type="number"
                              min="0"
                              step="1"
                              value={desiredMarkup}
                              onChange={(e) => setDesiredMarkup(e.target.value)}
                              placeholder="e.g. 50"
                              className="w-full px-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-[#daf4aa] transition-colors mb-2"
                           />
                           <div className="flex flex-wrap items-center gap-1.5">
                              {[20, 35, 50, 75, 100, 150].map((mu) => (
                                 <button
                                    key={mu}
                                    type="button"
                                    onClick={() => setDesiredMarkup(String(mu))}
                                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                                       desiredMarkup === String(mu)
                                          ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                                    }`}>
                                    {mu}%
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Break-even Info Box */}
                     <div className="mt-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 flex items-center justify-between text-xs text-zinc-400">
                        <span>Break-even Price (Zero profit / loss):</span>
                        <span className="font-mono font-semibold text-zinc-200">
                           ₹{result.costPrice.toLocaleString('en-IN')}
                        </span>
                     </div>
                  </div>
               </div>

               {/* Right Pane: Results & Revenue Composition */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <PieChart size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Margin & Revenue Analysis
                        </span>
                     </div>
                     <span className="text-xs font-semibold text-emerald-400">
                        Amortized Breakdown
                     </span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-5">
                     {/* Big Primary Result Card */}
                     <div
                        className={`rounded-2xl border p-4 sm:p-5 flex flex-col items-center justify-center text-center ${
                           result.grossProfit >= 0
                              ? 'border-[#daf4aa]/30 bg-[#daf4aa]/10 text-[#daf4aa]'
                              : 'border-rose-500/30 bg-rose-950/20 text-rose-400'
                        }`}>
                        <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-1">
                           {mode === 'standard' ? 'Gross Profit' : 'Recommended Selling Price'}
                        </span>
                        <div className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                           ₹
                           {mode === 'standard'
                              ? result.grossProfit.toLocaleString('en-IN')
                              : result.sellingPrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-zinc-400 mt-2 flex items-center gap-2">
                           <span>Margin: {result.marginPercent}%</span>
                           <span>•</span>
                           <span>Markup: {result.markupPercent}%</span>
                        </div>
                     </div>

                     {/* Metrics Grid */}
                     <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
                           <span className="text-zinc-500 block text-[11px] uppercase tracking-wider font-semibold">
                              Profit Margin
                           </span>
                           <span className="text-xl font-bold text-emerald-400 mt-1 block">
                              {result.marginPercent}%
                           </span>
                           <span className="text-[10px] text-zinc-500 block mt-0.5">
                              Profit share of total selling price
                           </span>
                        </div>

                        <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40">
                           <span className="text-zinc-500 block text-[11px] uppercase tracking-wider font-semibold">
                              Markup
                           </span>
                           <span className="text-xl font-bold text-[#daf4aa] mt-1 block">
                              {result.markupPercent}%
                           </span>
                           <span className="text-[10px] text-zinc-500 block mt-0.5">
                              Profit percentage over cost price
                           </span>
                        </div>
                     </div>

                     {/* Revenue Composition Bar */}
                     <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2.5">
                           <span>Revenue Composition</span>
                           <span>Selling Price: ₹{result.sellingPrice.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="h-3.5 w-full bg-zinc-800 rounded-full overflow-hidden flex shadow-inner">
                           <div
                              style={{ width: `${costRatio}%` }}
                              className="h-full bg-zinc-600 transition-all duration-300"
                              title={`Cost: ${costRatio}%`}
                           />
                           <div
                              style={{ width: `${profitRatio}%` }}
                              className={`h-full transition-all duration-300 ${
                                 result.grossProfit < 0 ? 'bg-rose-500' : 'bg-[#daf4aa]'
                              }`}
                              title={`Profit: ${profitRatio}%`}
                           />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-3">
                           <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                              <span>Cost: ₹{result.costPrice.toLocaleString('en-IN')} ({costRatio}%)</span>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <span
                                 className={`w-2.5 h-2.5 rounded-full ${
                                    result.grossProfit < 0 ? 'bg-rose-500' : 'bg-[#daf4aa]'
                                 }`}
                              />
                              <span>
                                 Profit: ₹{result.grossProfit.toLocaleString('en-IN')} ({profitRatio}%)
                              </span>
                           </div>
                        </div>
                     </div>

                     {/* Detailed Table */}
                     <div className="space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-3.5 text-xs">
                        <div className="flex justify-between text-zinc-400">
                           <span>Cost Price (Base Investment)</span>
                           <span className="font-semibold text-zinc-200">
                              ₹{result.costPrice.toLocaleString('en-IN')}
                           </span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                           <span>Selling Price (Customer Invoice)</span>
                           <span className="font-semibold text-zinc-200">
                              ₹{result.sellingPrice.toLocaleString('en-IN')}
                           </span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                           <span>Gross Net Profit</span>
                           <span className={`font-semibold ${result.grossProfit >= 0 ? 'text-[#daf4aa]' : 'text-rose-400'}`}>
                              ₹{result.grossProfit.toLocaleString('en-IN')}
                           </span>
                        </div>
                        <div className="h-[1px] bg-zinc-800/80 my-1" />
                        <div className="flex justify-between font-bold text-sm text-white">
                           <span>Profit Margin</span>
                           <span className={result.grossProfit >= 0 ? 'text-[#daf4aa]' : 'text-rose-400'}>
                              {result.marginPercent}%
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
