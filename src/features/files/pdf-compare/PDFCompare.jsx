/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   FileDiff,
   Upload,
   Copy,
   Download,
   Sparkles,
   ChevronDown,
   HelpCircle,
   CheckCircle2,
   Layers,
   FileText,
   ArrowRight,
   Maximize2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { computeTextDiff } from '../../../lib/calculations/pdfCompare';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*  SAMPLES & FAQS                                                            */
/* -------------------------------------------------------------------------- */

const SAMPLE_DOC_A = `NON-DISCLOSURE AGREEMENT
Version 1.0 — Effective Date: 2026-01-01

1. Confidential Information:
The Recipient agrees to hold all Technical Data in strict confidence.
Disclosures must be pre-approved in writing by the Disclosing Party.

2. Term & Termination:
This Agreement remains in effect for a period of two (2) years.

3. Governing Law:
This Agreement is governed by the laws of California.`;

const SAMPLE_DOC_B = `NON-DISCLOSURE AGREEMENT
Version 2.0 — Effective Date: 2026-02-15

1. Confidential Information:
The Recipient agrees to hold all Technical Data and Customer Lists in strict confidence.
Disclosures must be pre-approved in writing or electronically by the Disclosing Party.

2. Term & Termination:
This Agreement remains in effect for a period of three (3) years.

3. Governing Law:
This Agreement is governed by the laws of Delaware.

4. Arbitration:
Any dispute shall be settled by binding arbitration.`;

const FAQS = [
   {
      question: 'How does the PDF & text comparison algorithm work?',
      answer:
         'The diff engine uses the Longest Common Subsequence (LCS) algorithm to analyze documents line-by-line and identify exact additions, deletions, and identical segments between Document A and Document B.',
   },
   {
      question: 'Can I upload files or paste text directly?',
      answer:
         'Both! You can paste document text directly into the dual editors or click "Try Sample Revision" to test the diff viewer with sample contracts.',
   },
   {
      question: 'Are my confidential contracts or documents uploaded anywhere?',
      answer:
         'No. The comparison runs 100% inside your browser memory. Your confidential legal documents, NDA terms, and proprietary source code never leave your computer.',
   },
   {
      question: 'How is the similarity score calculated?',
      answer:
         'The similarity percentage represents the proportion of matching tokens relative to the total document size, normalized from 0% (completely different) to 100% (identical).',
   },
];

export default function PDFCompare() {
   const [docA, setDocA] = useState(SAMPLE_DOC_A);
   const [docB, setDocB] = useState(SAMPLE_DOC_B);

   // Toast
   const [toast, setToast] = useState({ visible: false, message: '' });
   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   const [openFaq, setOpenFaq] = useState(null);

   // Compute Diff
   const diffResult = useMemo(() => {
      return computeTextDiff(docA, docB);
   }, [docA, docB]);

   // Load Sample
   const handleLoadSample = () => {
      setDocA(SAMPLE_DOC_A);
      setDocB(SAMPLE_DOC_B);
      showToast('Loaded sample agreement revisions.');
   };

   // Copy summary
   const handleCopySummary = () => {
      const summary = `Diff Summary:\n- Similarity Score: ${diffResult.similarityScore}%\n- Added Lines: +${diffResult.additionsCount}\n- Removed Lines: -${diffResult.deletionsCount}\n- Words in Doc A: ${diffResult.wordsDocA}\n- Words in Doc B: ${diffResult.wordsDocB}`;
      navigator.clipboard.writeText(summary);
      showToast('Diff summary copied!');
   };

   // Download report
   const handleDownloadReport = () => {
      const reportLines = [
         '=== KLIQUE DOCUMENT DIFF REPORT ===',
         `Similarity: ${diffResult.similarityScore}%`,
         `Lines Added: +${diffResult.additionsCount}`,
         `Lines Removed: -${diffResult.deletionsCount}`,
         '',
         '=== DETAILED DIFF ===',
         ...diffResult.diffLines.map((line) => {
            const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  ';
            return `${prefix}${line.text}`;
         }),
      ];

      const blob = new Blob([reportLines.join('\n')], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `klique-diff-report-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Downloaded diff report.');
   };

   const relatedTools = useMemo(() => getRelatedTools('pdf-compare', 4), []);

   return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden font-sans">
         {/* Static ambient backdrop matching JsonFormatter */}
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.12),transparent_55%)]"
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         <SEO
            title="PDF & Text Compare - Side-by-Side Diff Checker | Klique"
            description="Compare two PDF documents, contracts, or text files side-by-side with color-coded difference highlights, additions, and similarity metrics."
            keywords="pdf compare, compare documents, diff checker, text compare online, contract revision diff, pdf diff, klique"
            canonicalUrl="https://klique.netlify.app/tools/pdf-compare"
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
                     <FileDiff size={14} className="text-[#daf4aa]" />
                     <span>File Utilities & Diff</span>
                     <span className="text-zinc-600">•</span>
                     <span className="text-[#daf4aa]">100% Client-Side Privacy</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                     PDF & Text <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#daf4aa] via-lime-300 to-emerald-400">Compare</span>
                  </h1>
                  <p className="text-zinc-400 text-sm max-w-xl">
                     Identify changes between document revisions, contract drafts, and files. Line-by-line
                     visual diffs with instant similarity scoring.
                  </p>
               </motion.div>

               {/* Action Buttons */}
               <div className="flex items-center gap-3">
                  <button
                     onClick={handleLoadSample}
                     className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all shadow-md backdrop-blur-md cursor-pointer">
                     <Sparkles size={14} className="text-[#daf4aa]" />
                     <span>Try Sample Revision</span>
                  </button>

                  <button
                     onClick={handleDownloadReport}
                     className="flex items-center gap-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] px-4 py-2.5 text-xs font-bold text-zinc-950 transition-all shadow-[0_0_15px_rgba(218,244,170,0.3)] cursor-pointer">
                     <Download size={14} />
                     <span>Download Report</span>
                  </button>
               </div>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
               <Link to="/" className="hover:text-zinc-200 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category" className="hover:text-zinc-200 transition-colors">File Utilities</Link>
               <span>/</span>
               <span className="text-[#daf4aa]">PDF & Text Compare</span>
            </div>

            {/* KPI Metrics Dashboard */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl shadow-lg">
                  <span className="text-xs font-medium text-zinc-400 block mb-1">Similarity Match</span>
                  <div className="text-2xl sm:text-3xl font-black text-[#daf4aa] font-mono">
                     {diffResult.similarityScore}%
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 inline-block">Document concordance</span>
               </div>

               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl shadow-lg">
                  <span className="text-xs font-medium text-zinc-400 block mb-1">Additions</span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                     +{diffResult.additionsCount}
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 inline-block">Inserted lines</span>
               </div>

               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl shadow-lg">
                  <span className="text-xs font-medium text-zinc-400 block mb-1">Deletions</span>
                  <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                     -{diffResult.deletionsCount}
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 inline-block">Removed lines</span>
               </div>

               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl shadow-lg">
                  <span className="text-xs font-medium text-zinc-400 block mb-1">Word Comparison</span>
                  <div className="text-xl sm:text-2xl font-bold text-white font-mono truncate">
                     {diffResult.wordsDocA} &rarr; {diffResult.wordsDocB}
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 inline-block">Total tokens</span>
               </div>
            </div>

            {/* Document Input Dual Editors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
               {/* Document A (Original) */}
               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl shadow-xl flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                     <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <FileText size={14} className="text-zinc-400" />
                        <span>Document A (Original)</span>
                     </span>
                     <span className="text-[11px] text-zinc-500 font-mono">{diffResult.wordsDocA} words</span>
                  </div>
                  <textarea
                     value={docA}
                     onChange={(e) => setDocA(e.target.value)}
                     placeholder="Paste original document text or contract draft here..."
                     className="w-full flex-1 min-h-[220px] rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
                  />
               </div>

               {/* Document B (Modified) */}
               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl shadow-xl flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                     <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <FileText size={14} className="text-emerald-400" />
                        <span>Document B (Revision)</span>
                     </span>
                     <span className="text-[11px] text-zinc-500 font-mono">{diffResult.wordsDocB} words</span>
                  </div>
                  <textarea
                     value={docB}
                     onChange={(e) => setDocB(e.target.value)}
                     placeholder="Paste modified document text or revised contract draft here..."
                     className="w-full flex-1 min-h-[220px] rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
                  />
               </div>
            </div>

            {/* Visual Diff View Stage */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl mb-12">
               <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                     <Layers size={16} className="text-emerald-400" />
                     <span>Diff Comparison Viewer</span>
                  </h3>

                  <button
                     onClick={handleCopySummary}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 hover:text-white transition-all">
                     <Copy size={13} />
                     <span>Copy Summary</span>
                  </button>
               </div>

               {/* Unified Diff Lines Table */}
               <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 overflow-hidden font-mono text-xs">
                  {diffResult.diffLines.length === 0 ? (
                     <div className="p-8 text-center text-zinc-500">
                        Paste text in both boxes above to see real-time diffs.
                     </div>
                  ) : (
                     diffResult.diffLines.map((line, idx) => {
                        const isAdded = line.type === 'added';
                        const isRemoved = line.type === 'removed';

                        return (
                           <div
                              key={idx}
                              className={`flex items-start px-4 py-1.5 border-b border-zinc-900/60 leading-relaxed ${
                                 isAdded
                                    ? 'bg-emerald-500/10 text-emerald-300 border-l-4 border-l-emerald-400'
                                    : isRemoved
                                    ? 'bg-rose-500/10 text-rose-300 border-l-4 border-l-rose-400'
                                    : 'text-zinc-400'
                              }`}>
                              <span className="w-6 shrink-0 select-none font-bold text-zinc-600">
                                 {isAdded ? '+' : isRemoved ? '-' : ' '}
                              </span>
                              <span className="flex-1 whitespace-pre-wrap">{line.text}</span>
                           </div>
                        );
                     })
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
                     <span>Related File & Document Tools</span>
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

