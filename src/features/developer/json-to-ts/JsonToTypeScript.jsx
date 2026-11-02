/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   FileCode2,
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
   Code2,
   Settings2,
   AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { convertJsonToTypeScript } from '../../../lib/calculations/jsonToTs';
import { trackToolCopy, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*  PRESETS & FAQS                                                            */
/* -------------------------------------------------------------------------- */

const PRESETS = [
   {
      id: 'ecommerce',
      name: 'E-Commerce Product API',
      rootName: 'ProductResponse',
      json: JSON.stringify(
         {
            id: 'prod_9872',
            title: 'Mechanical Wireless Keyboard',
            price: 4999.0,
            inStock: true,
            tags: ['peripherals', 'gaming', 'rgb'],
            rating: { score: 4.8, reviewsCount: 342 },
            variants: [
               { sku: 'KB-RED', switchType: 'Red Linear', inventory: 15 },
               { sku: 'KB-BLUE', switchType: 'Blue Clicky', inventory: 8 },
            ],
         },
         null,
         2
      ),
   },
   {
      id: 'user-profile',
      name: 'User Auth & Permissions Profile',
      rootName: 'UserProfile',
      json: JSON.stringify(
         {
            uid: 'usr_83921',
            email: 'alex@example.com',
            displayName: 'Alex Morgan',
            roles: ['admin', 'billing_manager'],
            settings: {
               twoFactorEnabled: true,
               theme: 'dark',
               notifications: { email: true, push: false },
            },
         },
         null,
         2
      ),
   },
   {
      id: 'github-repo',
      name: 'GitHub Repository Metadata',
      rootName: 'Repository',
      json: JSON.stringify(
         {
            id: 1296269,
            name: 'klique',
            full_name: 'klique-tools/klique',
            private: false,
            stargazers_count: 1420,
            topics: ['react', 'vite', 'developer-tools', 'typescript'],
            owner: { login: 'klique-tools', id: 4501, site_admin: false },
         },
         null,
         2
      ),
   },
   {
      id: 'stripe-webhook',
      name: 'Payment Webhook Event',
      rootName: 'PaymentEvent',
      json: JSON.stringify(
         {
            id: 'evt_3Mjj',
            type: 'payment_intent.succeeded',
            amount: 75000,
            currency: 'inr',
            status: 'succeeded',
            metadata: { order_id: 'ord_9182', customer_name: 'Rahul Patel' },
         },
         null,
         2
      ),
   },
];

const FAQS = [
   {
      question: 'How are nested objects and arrays typed?',
      answer:
         'Nested objects are automatically converted into PascalCase child interfaces (e.g. Product -> Variant -> Review), and arrays of objects are typed as Array types (e.g. Variant[]).',
   },
   {
      question: 'Should I choose Interface or Type Alias?',
      answer:
         'TypeScript interfaces are extendable via declaration merging and are standard for object contracts and API responses. Type aliases are useful when dealing with union types and primitives.',
   },
   {
      question: 'Is my JSON uploaded to any server?',
      answer:
         'No. Type generation runs 100% inside your local browser JavaScript engine. Sensitive API tokens and payloads never leave your computer.',
   },
];

export default function JsonToTypeScript() {
   // State
   const [jsonInput, setJsonInput] = useState(PRESETS[0].json);
   const [rootName, setRootName] = useState('ProductResponse');
   const [declarationType, setDeclarationType] = useState('interface'); // 'interface' | 'type'
   const [exportKeywords, setExportKeywords] = useState(true);
   const [useReadonly, setUseReadonly] = useState(false);
   const [useOptional, setUseOptional] = useState(false);
   const [indentSpaces, setIndentSpaces] = useState(2);

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

   // Conversion
   const result = useMemo(() => {
      return convertJsonToTypeScript(jsonInput, {
         rootName: rootName || 'RootObject',
         declarationType,
         exportKeywords,
         useReadonly,
         useOptional,
         indentSpaces,
      });
   }, [jsonInput, rootName, declarationType, exportKeywords, useReadonly, useOptional, indentSpaces]);

   const applyPreset = (preset) => {
      setSelectedPreset(preset.id);
      setRootName(preset.rootName);
      setJsonInput(preset.json);
      showToast(`Applied preset: ${preset.name}`);
   };

   const handleReset = () => {
      setJsonInput(PRESETS[0].json);
      setRootName('ProductResponse');
      setDeclarationType('interface');
      setExportKeywords(true);
      setUseReadonly(false);
      setUseOptional(false);
      setIndentSpaces(2);
      setSelectedPreset('');
      trackToolReset('json-to-typescript');
      showToast('Reset JSON to TypeScript converter.');
   };

   const handleCopyCode = () => {
      if (!result.code) return;
      navigator.clipboard.writeText(result.code);
      trackToolCopy('json-to-typescript', { outputType: 'typescript', size: result.code.length });
      showToast('Copied TypeScript interfaces to clipboard!');
   };

   const relatedTools = useMemo(() => getRelatedTools('json-to-typescript', 3), []);

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
            title="JSON to TypeScript Converter — Generate TS Interfaces & Types"
            description="Convert nested JSON data into clean, strongly-typed TypeScript interfaces and type aliases instantly."
            keywords="json to typescript, json to ts, convert json to interface, typescript type generator, json interface maker"
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
                  <FileCode2 size={13} className="text-[#daf4aa]" />
                  <span>Developer Suite</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">TypeScript Codegen</span>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        JSON to TypeScript Converter
                     </h1>
                     <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                        Generate clean, nested TypeScript interfaces and types from arbitrary JSON payloads with customizable keywords, optional keys, and readonly modifiers.
                     </p>
                  </div>

                  {/* Declaration Tabs */}
                  <div className="flex items-center p-1 rounded-full bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-xl self-start sm:self-auto shadow-inner">
                     <button
                        type="button"
                        onClick={() => setDeclarationType('interface')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                           declarationType === 'interface'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        interface
                     </button>
                     <button
                        type="button"
                        onClick={() => setDeclarationType('type')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                           declarationType === 'type'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        type alias
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
                        Quick Sample Payloads & Schemas
                     </span>
                     <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
                        (E-Commerce, Auth Profile, GitHub Repo, Webhook)
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
                                    Root: {preset.rootName}
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
                     <span className={`h-2 w-2 rounded-full ${result.isValid ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                     {result.isValid ? `${rootName} Generated` : 'Invalid JSON Syntax'}
                  </span>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <button
                     type="button"
                     onClick={handleCopyCode}
                     disabled={!result.isValid}
                     className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-[#cbf094] disabled:opacity-50 shadow-sm">
                     <Copy size={13} />
                     <span>Copy TypeScript</span>
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
                  <span className="text-zinc-500 block text-[11px]">Root Type Name</span>
                  <span className="font-semibold text-zinc-200 text-sm font-mono truncate block">
                     {rootName || 'RootObject'}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Export Keyword</span>
                  <span className="font-semibold text-[#daf4aa] text-sm">
                     {exportKeywords ? 'export interface' : 'internal'}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Property Modifiers</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     {useReadonly ? 'readonly ' : ''}{useOptional ? 'optional (?)' : 'required'}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Parse Status</span>
                  <span className={`font-semibold text-sm ${result.isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {result.isValid ? 'Valid Types' : 'Syntax Error'}
                  </span>
               </div>
            </div>

            {/* Dual Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               {/* Left Pane: JSON Input & Options */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Code2 size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Raw JSON Payload
                        </span>
                     </div>
                     <span className="text-[11px] font-mono text-zinc-500">JSON Input</span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {/* Options toolbar */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                           <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                              Root Interface / Type Name
                           </label>
                           <input
                              type="text"
                              value={rootName}
                              onChange={(e) => setRootName(e.target.value)}
                              placeholder="e.g. UserResponse"
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-mono text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                        </div>

                        <div>
                           <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                              Indentation
                           </label>
                           <select
                              value={indentSpaces}
                              onChange={(e) => setIndentSpaces(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]">
                              <option value="2">2 Spaces</option>
                              <option value="4">4 Spaces</option>
                           </select>
                        </div>
                     </div>

                     {/* Checkbox Toggles */}
                     <div className="flex items-center gap-4 flex-wrap text-xs text-zinc-300">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                           <input
                              type="checkbox"
                              checked={exportKeywords}
                              onChange={(e) => setExportKeywords(e.target.checked)}
                              className="accent-[#daf4aa]"
                           />
                           <span>Add `export`</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer">
                           <input
                              type="checkbox"
                              checked={useReadonly}
                              onChange={(e) => setUseReadonly(e.target.checked)}
                              className="accent-[#daf4aa]"
                           />
                           <span>Add `readonly`</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer">
                           <input
                              type="checkbox"
                              checked={useOptional}
                              onChange={(e) => setUseOptional(e.target.checked)}
                              className="accent-[#daf4aa]"
                           />
                           <span>Optional keys (`?`)</span>
                        </label>
                     </div>

                     {/* JSON Textarea */}
                     <div>
                        <textarea
                           rows={14}
                           value={jsonInput}
                           onChange={(e) => setJsonInput(e.target.value)}
                           placeholder="Paste valid JSON here..."
                           className="w-full p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono focus:outline-none focus:border-[#daf4aa] transition-colors resize-none customScrollbar"
                        />
                     </div>

                     {result.error && (
                        <div className="text-xs text-rose-400 bg-rose-950/20 border border-rose-900/40 p-2.5 rounded-lg flex items-center gap-1.5">
                           <AlertCircle size={14} />
                           <span>{result.error}</span>
                        </div>
                     )}
                  </div>
               </div>

               {/* Right Pane: Generated TypeScript Output */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <FileCode2 size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           TypeScript Definitions
                        </span>
                     </div>
                     <button
                        type="button"
                        onClick={handleCopyCode}
                        disabled={!result.isValid}
                        className="text-xs font-semibold text-[#daf4aa] hover:underline flex items-center gap-1 disabled:opacity-40">
                        <Copy size={12} />
                        <span>Copy Code</span>
                     </button>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-[#daf4aa] whitespace-pre-wrap break-all min-h-[380px] max-h-[500px] overflow-y-auto customScrollbar select-all">
                        {result.code || '// Paste valid JSON on the left to generate TypeScript interfaces...'}
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

