/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   Database,
   Copy,
   Download,
   Trash2,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ChevronRight,
   Check,
   ArrowRight,
   Minimize2,
   Maximize2,
   Code2,
   Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { formatSQL, minifySQL } from '../../../lib/calculations/sql';
import { trackToolCopy, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';
import { CheckboxInput, Dropdown, Textarea } from '../../../components/ui/CustomControl';

/* -------------------------------------------------------------------------- */
/*  PRESETS & FAQS                                                            */
/* -------------------------------------------------------------------------- */

const PRESETS = [
   {
      id: 'multi-join',
      name: 'Multi-Table JOIN Query',
      sql: 'select u.id, u.email, o.order_id, o.total_amount, p.status from users u inner join orders o on u.id = o.user_id left join payments p on o.order_id = p.order_id where o.total_amount > 1000 and p.status = "completed" order by o.created_at desc limit 25;',
   },
   {
      id: 'aggregate',
      name: 'GROUP BY with Aggregates & HAVING',
      sql: 'select department_id, count(employee_id) as total_employees, avg(salary) as average_salary, sum(bonus) as total_bonus from employees where is_active = true group by department_id having count(employee_id) > 5 order by average_salary desc;',
   },
   {
      id: 'subquery',
      name: 'Nested Subquery with EXISTS',
      sql: 'select customer_name, customer_email from customers c where exists (select 1 from invoices i where i.customer_id = c.id and i.status = "unpaid" and i.due_date < current_date);',
   },
   {
      id: 'ddl-schema',
      name: 'CREATE TABLE Schema',
      sql: 'create table products (id serial primary key, title varchar(255) not null, price numeric(10,2) default 0.00, category_id int references categories(id) on delete cascade, created_at timestamp default current_timestamp);',
   },
];

const FAQS = [
   {
      question: 'Which SQL dialects are supported?',
      answer:
         'This formatter supports standard ANSI SQL syntax, PostgreSQL, MySQL, MariaDB, SQLite, Oracle SQL, Microsoft SQL Server (T-SQL), and Snowflake.',
   },
   {
      question: 'Why should I uppercase SQL keywords?',
      answer:
         'Writing keywords like SELECT, FROM, WHERE, and JOIN in uppercase makes SQL queries significantly easier to read, scan, and maintain in team pull requests and codebases.',
   },
   {
      question: 'What does the Minify feature do?',
      answer:
         'Minifying strips unnecessary line breaks, comments, and extra spaces, turning multi-line SQL into a compact single-line string suitable for configuration files or database migrations.',
   },
];

export default function SQLFormatter() {
   // State
   const [sqlInput, setSqlInput] = useState(PRESETS[0].sql);
   const [indentSpaces, setIndentSpaces] = useState(2);
   const [uppercaseKeywords, setUppercaseKeywords] = useState(true);
   const [activeMode, setActiveMode] = useState('format'); // 'format' | 'minify'

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

   // Formatted Result
   const formattedResult = useMemo(() => {
      return formatSQL(sqlInput, { indentSpaces, uppercaseKeywords });
   }, [sqlInput, indentSpaces, uppercaseKeywords]);

   // Minified Result
   const minifiedResult = useMemo(() => {
      return minifySQL(sqlInput);
   }, [sqlInput]);

   const outputCode = activeMode === 'format' ? formattedResult.formatted : minifiedResult;

   const applyPreset = (preset) => {
      setSelectedPreset(preset.id);
      setSqlInput(preset.sql);
      showToast(`Applied preset: ${preset.name}`);
   };

   const handleReset = () => {
      setSqlInput(PRESETS[0].sql);
      setIndentSpaces(2);
      setUppercaseKeywords(true);
      setActiveMode('format');
      setSelectedPreset('');
      trackToolReset('sql-formatter');
      showToast('Reset SQL formatter.');
   };

   const handleCopySQL = () => {
      if (!outputCode) return;
      navigator.clipboard.writeText(outputCode);
      trackToolCopy('sql-formatter', { outputType: activeMode, size: outputCode.length });
      showToast(`Copied ${activeMode === 'format' ? 'formatted' : 'minified'} SQL!`);
   };

   const relatedTools = useMemo(() => getRelatedTools('sql-formatter', 3), []);

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
            title="SQL Formatter & Beautifier — Format & Minify SQL Queries"
            description="Format, indent, beautify, and minify SQL queries in real-time with keyword capitalization and custom indentation."
            keywords="sql formatter, beautify sql online, format sql query, sql minifier, postgresql formatter, mysql beautifier"
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
                  <Database size={13} className="text-[#daf4aa]" />
                  <span>Developer Suite</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">Database & SQL</span>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        SQL Formatter & Beautifier
                     </h1>
                     <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                        Clean up and format messy SQL queries with standard indentation, keyword uppercasing, and single-line minification.
                     </p>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex items-center p-1 rounded-full bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-xl self-start sm:self-auto shadow-inner">
                     <button
                        type="button"
                        onClick={() => setActiveMode('format')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                           activeMode === 'format'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        <Maximize2 size={12} />
                        <span>Beautify & Indent</span>
                     </button>
                     <button
                        type="button"
                        onClick={() => setActiveMode('minify')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                           activeMode === 'minify'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        <Minimize2 size={12} />
                        <span>Minify SQL</span>
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
                        Common SQL Query Scenarios
                     </span>
                     <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
                        (Multi-Join, Group By & Having, Subquery, DDL Schema)
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
                                    {preset.sql.slice(0, 35)}...
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
                     {activeMode === 'format' ? 'Formatted SQL Ready' : 'Minified SQL Ready'}
                  </span>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <button
                     type="button"
                     onClick={handleCopySQL}
                     disabled={!outputCode}
                     className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-[#cbf094] disabled:opacity-50 shadow-sm">
                     <Copy size={13} />
                     <span>Copy {activeMode === 'format' ? 'Formatted' : 'Minified'}</span>
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

            {/* Status & Options Banner */}
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 sm:px-4 sm:py-2.5 text-xs">
               <div>
                  <span className="text-zinc-500 block text-[11px]">Dialect Standard</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     ANSI / Postgres / MySQL
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Keyword Casing</span>
                  <span className="font-semibold text-[#daf4aa] text-sm">
                     {uppercaseKeywords ? 'UPPERCASE' : 'Preserve'}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Indentation</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     {indentSpaces} Spaces
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Character Count</span>
                  <span className="font-semibold text-emerald-400 text-sm">
                     {sqlInput.length} Chars
                  </span>
               </div>
            </div>

            {/* Dual Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               {/* Left Pane: Raw SQL Input */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Database size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Raw SQL Query
                        </span>
                     </div>
                     <span className="text-[11px] font-mono text-zinc-500">Input</span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {/* Options toolbar */}
                     <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                           <CheckboxInput
                              type="checkbox"
                              checked={uppercaseKeywords}
                              onChange={(e) => setUppercaseKeywords(e.target.checked)}
                              className="accent-[#daf4aa]"
                           />
                           <span>Uppercase Keywords (SELECT, WHERE...)</span>
                        </label>

                        <div className="flex items-center gap-2">
                           <span className="text-zinc-400 text-[11px]">Indent:</span>
                           <Dropdown
                              value={indentSpaces}
                              onChange={(e) => setIndentSpaces(Number(e.target.value))}
                              className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-200">
                              <option value="2">2 spaces</option>
                              <option value="4">4 spaces</option>
                           </Dropdown>
                        </div>
                     </div>

                     {/* Textarea */}
                     <div>
                        <Textarea
                           rows={14}
                           value={sqlInput}
                           onChange={(e) => setSqlInput(e.target.value)}
                           placeholder="Paste unformatted SQL query here..."
                           className="w-full p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono focus:outline-none focus:border-[#daf4aa] transition-colors resize-none customScrollbar"
                        />
                     </div>
                  </div>
               </div>

               {/* Right Pane: Formatted Output */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Code2 size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           {activeMode === 'format' ? 'Beautified SQL' : 'Minified SQL'}
                        </span>
                     </div>
                     <button
                        type="button"
                        onClick={handleCopySQL}
                        disabled={!outputCode}
                        className="text-xs font-semibold text-[#daf4aa] hover:underline flex items-center gap-1 disabled:opacity-40">
                        <Copy size={12} />
                        <span>Copy Output</span>
                     </button>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-100 whitespace-pre-wrap break-all min-h-[350px] max-h-[500px] overflow-y-auto customScrollbar select-all">
                        {outputCode || '// Output will appear here...'}
                     </pre>
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

