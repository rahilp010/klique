/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   Search,
   CheckCircle2,
   AlertTriangle,
   XCircle,
   Copy,
   Download,
   Sparkles,
   ChevronDown,
   HelpCircle,
   Layers,
   FileCode,
   Globe,
   Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import {
   SAMPLE_HTML_SNIPPET,
   analyzeHtmlSEO,
} from '../../../lib/calculations/seoAnalyzer';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';
import { Textarea } from '../../../components/ui/CustomControl';

/* -------------------------------------------------------------------------- */
/*  FAQS                                                                      */
/* -------------------------------------------------------------------------- */

const FAQS = [
   {
      question: 'What does this SEO analyzer check?',
      answer:
         'It audits core on-page SEO signals: title tag presence and character length, meta description length, responsive mobile viewport configuration, canonical URL tags, OpenGraph social sharing tags, H1 heading architecture, and image alt attributes for accessibility.',
   },
   {
      question: 'Can I audit my live website HTML directly?',
      answer:
         'Yes! View source on your page, copy the <head> and <body> HTML markup, and paste it directly into the analyzer to receive immediate diagnostic feedback and recommended fixes.',
   },
   {
      question: 'What is a good SEO score?',
      answer:
         'A score of 85 or above means your on-page foundational metadata follows search engine best practices. Scores between 70-84 indicate minor improvements needed (e.g. description length or missing alt text), while scores below 70 indicate critical missing elements like title or viewport tags.',
   },
   {
      question: 'Are my HTML source contents uploaded to external servers?',
      answer:
         'No. The entire DOM parser and audit checks run locally within your browser using native browser APIs.',
   },
];

export default function SEOAnalyzer() {
   const [htmlInput, setHtmlInput] = useState(SAMPLE_HTML_SNIPPET);

   // Toast
   const [toast, setToast] = useState({ visible: false, message: '' });
   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   const [openFaq, setOpenFaq] = useState(null);

   // Analyze SEO
   const report = useMemo(() => {
      return analyzeHtmlSEO(htmlInput);
   }, [htmlInput]);

   // Load sample
   const handleLoadSample = () => {
      setHtmlInput(SAMPLE_HTML_SNIPPET);
      showToast('Loaded sample HTML markup.');
   };

   // Copy audit report
   const handleCopyReport = () => {
      if (!report) return;
      const textReport = [
         `=== KLIQUE SEO AUDIT REPORT ===`,
         `Score: ${report.score}/100`,
         `Passed Checks: ${report.passedCount}`,
         `Warnings: ${report.warningCount}`,
         `Critical Issues: ${report.criticalCount}`,
         '',
         '=== CHECKLIST ===',
         ...report.checks.map(
            (c) => `[${c.status.toUpperCase()}] ${c.label}: ${c.message}`
         ),
      ].join('\n');

      navigator.clipboard.writeText(textReport);
      showToast('Audit report copied to clipboard!');
   };

   const scoreColor = useMemo(() => {
      if (!report) return 'text-zinc-500';
      if (report.score >= 85) return 'text-emerald-400';
      if (report.score >= 70) return 'text-amber-400';
      return 'text-rose-400';
   }, [report]);

   const relatedTools = useMemo(() => getRelatedTools('seo-analyzer', 4), []);

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-300 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden
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
            title="Website SEO Analyzer - On-Page Meta & Technical Audit | Klique"
            description="Audit website HTML source code for search engine optimization. Inspect page titles, meta descriptions, OpenGraph tags, canonical URLs, and image alt tags."
            keywords="seo analyzer, on page seo audit, meta tag checker, website seo checker, title tag analyzer, free seo tool, klique"
            canonicalUrl="https://klique.netlify.app/tools/seo-analyzer"
         />

         {/* Toast Notification */}
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

         {/* Header / Navbar */}
         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Title Section */}
            <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                     <Search size={14} className="text-[#daf4aa]" />
                     <span>Developer & Web Suite</span>
                     <span className="text-zinc-600">•</span>
                     <span className="text-[#daf4aa]">100% In-Browser Privacy</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                     Website SEO <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#daf4aa] via-lime-300 to-emerald-400">Analyzer</span>
                  </h1>
                  <p className="text-zinc-400 text-sm max-w-xl">
                     Audit on-page SEO health, title tags, descriptions, OpenGraph social cards, canonical links,
                     and image accessibility.
                  </p>
               </motion.div>

               {/* Action Buttons */}
               <div className="flex items-center gap-3">
                  <button
                     onClick={handleLoadSample}
                     className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all shadow-md backdrop-blur-md cursor-pointer">
                     <Sparkles size={14} className="text-[#daf4aa]" />
                     <span>Load Sample HTML</span>
                  </button>

                  <button
                     onClick={handleCopyReport}
                     className="flex items-center gap-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] px-4 py-2.5 text-xs font-bold text-zinc-950 transition-all shadow-[0_0_15px_rgba(218,244,170,0.3)] cursor-pointer">
                     <Copy size={14} />
                     <span>Copy Audit Report</span>
                  </button>
               </div>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
               <Link to="/" className="hover:text-zinc-200 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category" className="hover:text-zinc-200 transition-colors">Developer & Code</Link>
               <span>/</span>
               <span className="text-[#daf4aa]">Website SEO Analyzer</span>
            </div>

            {/* Score & Summary KPI Cards */}
            {report && (
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl shadow-lg">
                     <span className="text-xs font-medium text-zinc-400 block mb-1">SEO Health Score</span>
                     <div className={`text-3xl sm:text-4xl font-black font-mono ${scoreColor}`}>
                        {report.score}/100
                     </div>
                     <span className="text-[11px] text-zinc-500 mt-1 inline-block">Overall rating</span>
                  </div>

                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl shadow-lg">
                     <span className="text-xs font-medium text-zinc-400 block mb-1 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        <span>Passed Checks</span>
                     </span>
                     <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                        {report.passedCount}
                     </div>
                     <span className="text-[11px] text-zinc-500 mt-1 inline-block">Best practices met</span>
                  </div>

                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl shadow-lg">
                     <span className="text-xs font-medium text-zinc-400 block mb-1 flex items-center gap-1.5">
                        <AlertTriangle size={13} className="text-amber-400" />
                        <span>Warnings</span>
                     </span>
                     <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                        {report.warningCount}
                     </div>
                     <span className="text-[11px] text-zinc-500 mt-1 inline-block">Recommended optimizations</span>
                  </div>

                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl shadow-lg">
                     <span className="text-xs font-medium text-zinc-400 block mb-1 flex items-center gap-1.5">
                        <XCircle size={13} className="text-rose-400" />
                        <span>Critical Issues</span>
                     </span>
                     <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                        {report.criticalCount}
                     </div>
                     <span className="text-[11px] text-zinc-500 mt-1 inline-block">Needs immediate fix</span>
                  </div>
               </div>
            )}

            {/* Main Stage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
               {/* Left Column: HTML Code Input */}
               <div className="lg:col-span-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl flex flex-col min-h-[460px]">
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-3">
                     <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <FileCode size={14} className="text-emerald-400" />
                        <span>HTML Source Code</span>
                     </span>
                     <span className="text-[11px] text-zinc-500 font-mono">{htmlInput.length} chars</span>
                  </div>

                  <Textarea
                     value={htmlInput}
                     onChange={(e) => setHtmlInput(e.target.value)}
                     placeholder="Paste full HTML source code or <head> tags here..."
                     className="w-full flex-1 min-h-[340px] rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40 focus:outline-none resize-none leading-relaxed"
                  />
               </div>

               {/* Right Column: Diagnostic Checklist */}
               <div className="lg:col-span-7 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl flex flex-col min-h-[460px]">
                  <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                     <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Activity size={14} className="text-emerald-400" />
                        <span>Audit Findings</span>
                     </span>
                     <span className="text-[11px] text-zinc-400 font-mono">
                        {report ? `${report.totalChecks} checks executed` : 'Awaiting HTML'}
                     </span>
                  </div>

                  {report ? (
                     <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                        {report.checks.map((chk, idx) => {
                           const isPassed = chk.status === 'passed';
                           const isWarning = chk.status === 'warning';

                           return (
                              <div
                                 key={idx}
                                 className={`rounded-xl border p-4 text-xs flex items-start gap-3 transition-all ${
                                    isPassed
                                       ? 'border-emerald-500/20 bg-emerald-500/5'
                                       : isWarning
                                       ? 'border-amber-500/20 bg-amber-500/5'
                                       : 'border-rose-500/20 bg-rose-500/5'
                                 }`}>
                                 <div className="mt-0.5 shrink-0">
                                    {isPassed ? (
                                       <CheckCircle2 size={16} className="text-emerald-400" />
                                    ) : isWarning ? (
                                       <AlertTriangle size={16} className="text-amber-400" />
                                    ) : (
                                       <XCircle size={16} className="text-rose-400" />
                                    )}
                                 </div>

                                 <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                       <span className="font-bold text-white">{chk.label}</span>
                                       <span className="text-[10px] text-zinc-500 px-2 py-0.2 rounded border border-zinc-800 bg-zinc-950">
                                          {chk.category}
                                       </span>
                                    </div>
                                    <p className="text-zinc-400 mt-1 leading-relaxed">
                                       {chk.message}
                                    </p>
                                    {chk.value && (
                                       <span className="text-[11px] font-mono text-zinc-300 block mt-1.5 truncate bg-zinc-950/60 px-2.5 py-1 rounded border border-zinc-800">
                                          {chk.value}
                                       </span>
                                    )}
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 text-center p-8">
                        <Search size={32} className="mx-auto mb-2 text-zinc-600" />
                        <p className="text-xs">Paste HTML on the left to see audit findings.</p>
                     </div>
                  )}
               </div>
            </div>

            {/* FAQs Accordion */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl mb-12">
               <div className="flex items-center gap-2 mb-6">
                  <HelpCircle size={18} className="text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">Frequently Asked Questions</h2>
               </div>
               <div className="space-y-4">
                  {FAQS.map((faq, idx) => {
                     const isOpen = openFaq === idx;
                     return (
                        <div
                           key={idx}
                           className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 overflow-hidden transition-all">
                           <button
                              onClick={() => setOpenFaq(isOpen ? null : idx)}
                              className="w-full flex items-center justify-between p-4 text-left text-xs font-semibold text-zinc-200 hover:text-white transition-colors">
                              <span>{faq.question}</span>
                              <ChevronDown
                                 size={16}
                                 className={`transform transition-transform text-zinc-500 ${
                                    isOpen ? 'rotate-180 text-emerald-400' : ''
                                 }`}
                              />
                           </button>
                           {isOpen && (
                              <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-3">
                                 {faq.answer}
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
               <div className="mt-8">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                     <Sparkles size={16} className="text-emerald-400" />
                     <span>Related Developer Tools</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     {relatedTools.map((tool) => (
                        <Link
                           key={tool.id}
                           to={tool.slug}
                           onMouseEnter={() => preloadRoute(tool.slug)}
                           className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-800/40 backdrop-blur-md">
                           <div className="text-xs font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                              {tool.name}
                           </div>
                           <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                              {tool.description}
                           </p>
                        </Link>
                     ))}
                  </div>
               </div>
            )}
         </main>
      </div>
   );
}
