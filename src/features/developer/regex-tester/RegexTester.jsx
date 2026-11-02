/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   Binary,
   Copy,
   Download,
   Trash2,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ChevronRight,
   Check,
   ArrowRight,
   Layers,
   RefreshCw,
   CheckCircle2,
   AlertCircle,
   Code,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { testRegex, replaceRegex } from '../../../lib/calculations/regex';
import { trackToolCopy, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*  PRESETS & FAQS                                                            */
/* -------------------------------------------------------------------------- */

const PRESETS = [
   {
      id: 'email',
      name: 'Email Address Matcher',
      pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
      flags: 'g',
      testString: 'Contact us at hello@klique.tools or support@example.co.uk for inquiries.',
      replaceWith: '[REDACTED_EMAIL]',
   },
   {
      id: 'url',
      name: 'URL & Domain Extractor',
      pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
      flags: 'g',
      testString: 'Visit our site at https://klique.tools and documentation at https://docs.klique.tools/api.',
      replaceWith: '<a href="$&">$&</a>',
   },
   {
      id: 'phone-india',
      name: 'Indian Phone Numbers',
      pattern: '(?:\\+91[\\-\\s]?)?[6-9]\\d{9}',
      flags: 'g',
      testString: 'Call helpline at +91 9876543210 or alternate office desk 8765432109.',
      replaceWith: 'tel:$&',
   },
   {
      id: 'hex-color',
      name: 'Hex Color Codes',
      pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
      flags: 'gi',
      testString: 'Palette: Primary is #daf4aa, backdrop is #09090b, card surface is #121215.',
      replaceWith: 'rgb(...)',
   },
];

const FAQS = [
   {
      question: 'What do the regex flags mean?',
      answer:
         '• g (global): Find all matches rather than stopping after the first match.\n• i (ignore case): Case-insensitive matching.\n• m (multiline): ^ and $ match the beginning and end of each line.\n• s (dotAll): Allows . to match newlines as well.\n• u (unicode): Enables full Unicode code point support.',
   },
   {
      question: 'How do capture groups work?',
      answer:
         'Parentheses () define a capture group. You can reference captured tokens in the replacement string using $1, $2, etc., or $& to reference the entire match.',
   },
   {
      question: 'Does this tester protect against ReDoS (catastrophic backtracking)?',
      answer:
         'Yes! All regular expressions are executed inside an execution watchdog timer with a 250ms circuit breaker. If an expression threatens to hang the browser thread, execution is safely halted with an alert.',
   },
];

export default function RegexTester() {
   // State
   const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
   const [flags, setFlags] = useState('g');
   const [testString, setTestString] = useState(
      'Send your project briefs to alex@apexstudio.io or billing@klique.tools. For urgent queries, contact support@cloudscale.biz!'
   );
   const [replacement, setReplacement] = useState('[REDACTED_EMAIL]');
   const [activeMode, setActiveMode] = useState('match'); // 'match' | 'replace'

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

   // Toggle Flag
   const toggleFlag = (flagChar) => {
      if (flags.includes(flagChar)) {
         setFlags(flags.replace(flagChar, ''));
      } else {
         setFlags(flags + flagChar);
      }
   };

   // Evaluations
   const matchResult = useMemo(() => {
      return testRegex(pattern, flags, testString);
   }, [pattern, flags, testString]);

   const replacedOutput = useMemo(() => {
      return replaceRegex(pattern, flags, testString, replacement);
   }, [pattern, flags, testString, replacement]);

   const applyPreset = (preset) => {
      setSelectedPreset(preset.id);
      setPattern(preset.pattern);
      setFlags(preset.flags);
      setTestString(preset.testString);
      setReplacement(preset.replaceWith);
      showToast(`Applied regex preset: ${preset.name}`);
   };

   const handleReset = () => {
      setPattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
      setFlags('g');
      setTestString(
         'Send your project briefs to alex@apexstudio.io or billing@klique.tools. For urgent queries, contact support@cloudscale.biz!'
      );
      setReplacement('[REDACTED_EMAIL]');
      setSelectedPreset('');
      trackToolReset('regex-tester');
      showToast('Reset regex tester.');
   };

   const handleCopyPattern = () => {
      navigator.clipboard.writeText(`/${pattern}/${flags}`);
      trackToolCopy('regex-tester', { outputType: 'pattern' });
      showToast('Copied regex literal (//)!');
   };

   const handleCopyMatches = () => {
      const texts = matchResult.matches.map((m) => m.text).join('\n');
      navigator.clipboard.writeText(texts);
      trackToolCopy('regex-tester', { outputType: 'matches', size: texts.length });
      showToast(`Copied ${matchResult.matchCount} matched strings!`);
   };

   const relatedTools = useMemo(() => getRelatedTools('regex-tester', 3), []);

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
            title="Regex Tester & Debugger — Live Regular Expression Testing"
            description="Test regular expressions in real-time with capture groups, visual match highlighting, flags, and string substitution."
            keywords="regex tester, regular expression debugger, live regex, regex groups, javascript regex tester, regex substitution"
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
                  <Binary size={13} className="text-[#daf4aa]" />
                  <span>Developer Suite</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">Regular Expressions</span>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        Regex Tester & Debugger
                     </h1>
                     <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                        Evaluate regular expressions in real-time with group breakdown, syntax error reporting, flags toggle, and string substitution.
                     </p>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex items-center p-1 rounded-full bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-xl self-start sm:self-auto shadow-inner">
                     <button
                        type="button"
                        onClick={() => setActiveMode('match')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                           activeMode === 'match'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        <span>Matches & Groups</span>
                     </button>
                     <button
                        type="button"
                        onClick={() => setActiveMode('replace')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                           activeMode === 'replace'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        <RefreshCw size={12} />
                        <span>Substitution (Replace)</span>
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
                        Common Regular Expressions & Patterns
                     </span>
                     <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
                        (Email, URLs, Phone Numbers, Hex Colors)
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
                                 <div className="text-[11px] font-mono text-zinc-500 truncate">
                                    /{preset.pattern}/
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
                     <span className={`h-2 w-2 rounded-full ${matchResult.isValid ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                     {matchResult.isValid ? `${matchResult.matchCount} Matches Found` : 'Syntax Error'}
                  </span>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <button
                     type="button"
                     onClick={handleCopyPattern}
                     className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-[#cbf094] shadow-sm">
                     <Copy size={13} />
                     <span>Copy /{pattern}/{flags}</span>
                  </button>

                  <button
                     type="button"
                     onClick={handleCopyMatches}
                     disabled={matchResult.matchCount === 0}
                     className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-40">
                     <Layers size={13} />
                     <span>Copy Matches ({matchResult.matchCount})</span>
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
                  <span className="text-zinc-500 block text-[11px]">Match Count</span>
                  <span className="font-semibold text-[#daf4aa] text-sm">
                     {matchResult.matchCount} Matched
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Active Flags</span>
                  <span className="font-semibold text-zinc-200 text-sm font-mono">
                     {flags ? `-${flags}` : 'No flags'}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Syntax Status</span>
                  <span className={`font-semibold text-sm ${matchResult.isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {matchResult.isValid ? 'Valid Expression' : 'Error'}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Test String Length</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     {testString.length} Chars
                  </span>
               </div>
            </div>

            {/* Dual Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               {/* Left Pane: Pattern & Test Input */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Binary size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Expression & Test String
                        </span>
                     </div>
                     <span className="text-[11px] font-mono text-zinc-500">Live Evaluator</span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {/* Pattern Input with Flags */}
                     <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                           Regular Expression Pattern
                        </label>
                        <div className="flex items-center rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden focus-within:border-[#daf4aa]">
                           <span className="px-3 text-zinc-500 font-mono text-base">/</span>
                           <input
                              type="text"
                              value={pattern}
                              onChange={(e) => setPattern(e.target.value)}
                              placeholder="Enter regex pattern e.g. [a-z0-9]+"
                              className="w-full py-2 bg-transparent text-sm font-mono text-zinc-100 outline-none"
                           />
                           <span className="px-2 text-zinc-500 font-mono text-base">/</span>
                           <span className="pr-3 font-mono text-xs text-[#daf4aa] font-bold">
                              {flags}
                           </span>
                        </div>

                        {/* Error message */}
                        {matchResult.error && (
                           <div className="mt-2 text-xs text-rose-400 bg-rose-950/20 border border-rose-900/40 p-2 rounded-lg flex items-center gap-1.5">
                              <AlertCircle size={13} />
                              <span>{matchResult.error}</span>
                           </div>
                        )}

                        {/* Flags Checkbox Group */}
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                           <span className="text-[11px] text-zinc-500 mr-1">Flags:</span>
                           {[
                              { id: 'g', label: 'g (global)' },
                              { id: 'i', label: 'i (case-insensitive)' },
                              { id: 'm', label: 'm (multiline)' },
                              { id: 's', label: 's (dotAll)' },
                              { id: 'u', label: 'u (unicode)' },
                           ].map((f) => (
                              <button
                                 key={f.id}
                                 type="button"
                                 onClick={() => toggleFlag(f.id)}
                                 className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition-all ${
                                    flags.includes(f.id)
                                       ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa] font-bold'
                                       : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                                 }`}>
                                 {f.label}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Test String Textarea */}
                     <div>
                        <div className="flex items-center justify-between mb-1.5">
                           <label className="text-xs font-semibold text-zinc-300">
                              Test String
                           </label>
                           <button
                              type="button"
                              onClick={() => setTestString('')}
                              className="text-[11px] text-zinc-500 hover:text-zinc-300">
                              Clear
                           </button>
                        </div>
                        <textarea
                           rows={6}
                           value={testString}
                           onChange={(e) => setTestString(e.target.value)}
                           placeholder="Insert your test text here..."
                           className="w-full px-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#daf4aa] transition-colors resize-none customScrollbar"
                        />
                     </div>

                     {/* Replacement field if mode is 'replace' */}
                     {activeMode === 'replace' && (
                        <div className="pt-2 border-t border-zinc-800/80">
                           <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                              Substitution String (Tokens: $& = full match, $1 = group 1)
                           </label>
                           <input
                              type="text"
                              value={replacement}
                              onChange={(e) => setReplacement(e.target.value)}
                              placeholder="e.g. [REDACTED] or <$1>"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                        </div>
                     )}
                  </div>
               </div>

               {/* Right Pane: Matches & Output */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Code size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           {activeMode === 'match' ? 'Match List & Groups' : 'Replaced Output'}
                        </span>
                     </div>
                     <span className="text-xs font-semibold text-emerald-400">
                        {activeMode === 'match' ? `${matchResult.matchCount} Matches` : 'Transformed'}
                     </span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {activeMode === 'match' ? (
                        <>
                           {matchResult.matches.length > 0 ? (
                              <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto customScrollbar pr-1">
                                 {matchResult.matches.map((m, idx) => (
                                    <div
                                       key={idx}
                                       className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col gap-1.5">
                                       <div className="flex items-center justify-between text-xs">
                                          <span className="font-bold text-[#daf4aa] font-mono">
                                             Match #{idx + 1}
                                          </span>
                                          <span className="text-[11px] font-mono text-zinc-500">
                                             Pos: {m.index}..{m.index + m.length} ({m.length} chars)
                                          </span>
                                       </div>
                                       <div className="font-mono text-xs bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-zinc-100 break-all select-all">
                                          {m.text}
                                       </div>
                                       {m.groups.length > 0 && (
                                          <div className="text-[11px] text-zinc-400 flex flex-wrap gap-1.5 mt-1">
                                             <span className="text-zinc-500">Groups:</span>
                                             {m.groups.map((g, gIdx) => (
                                                <span
                                                   key={gIdx}
                                                   className="px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 font-mono">
                                                   ${gIdx + 1}: "{g}"
                                                </span>
                                             ))}
                                          </div>
                                       )}
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div className="h-64 flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 text-xs text-zinc-500 text-center p-6">
                                 <AlertCircle size={28} className="text-zinc-600 mb-2" />
                                 <span>No matches found for pattern in test string.</span>
                              </div>
                           )}
                        </>
                     ) : (
                        <div>
                           <label className="text-xs font-semibold text-zinc-400 block mb-1.5">
                              Replaced String Result
                           </label>
                           <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-200 whitespace-pre-wrap break-all max-h-96 overflow-y-auto customScrollbar select-all">
                              {replacedOutput}
                           </pre>
                        </div>
                     )}
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

