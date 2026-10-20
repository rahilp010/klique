import React, { useState, useMemo } from 'react';

import {
   Braces,
   GitCompare,
   FolderTree,
   Copy,
   Download,
   Trash2,
   Wrench,
   Check,
   AlertCircle,
   ArrowLeftRight,
   Minimize2,
   Sparkles,
   ChevronRight,
   ChevronDown,
   Code2,
   Plus,
   Minus,
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

import Navbar from '../Navbar';

import SEO from '../SEO';
import { SelectPicker } from '../ui/CustomControl';

/* -------------------------------------------------------------------------- */

/*  SAMPLE DATASETS                                                           */

/* -------------------------------------------------------------------------- */

const SAMPLES = {
   userProfile: {
      id: 10042,

      username: 'alex_creator',

      displayName: 'Alex Rivers',

      email: 'alex.rivers@example.com',

      verified: true,

      role: 'PRO_MEMBER',

      stats: {
         posts: 342,

         followers: 18950,

         following: 420,

         engagementRate: 4.85,
      },

      tags: ['content-creator', 'ui-designer', 'klique-user'],

      preferences: {
         theme: 'dark',

         notifications: {
            email: true,

            push: false,

            frequency: 'daily',
         },
      },

      lastActive: '2026-10-10T14:32:00Z',
   },

   apiResponse: {
      status: 200,

      success: true,

      message: 'Data fetched successfully',

      meta: {
         page: 1,

         limit: 10,

         totalItems: 42,

         totalPages: 5,
      },

      data: [
         { id: 1, title: 'AI Writer Tool', category: 'writing', rating: 4.9 },

         { id: 2, title: 'Emoji Mixer', category: 'symbols', rating: 4.8 },

         { id: 3, title: 'PDF Converter', category: 'utilities', rating: 4.95 },
      ],
   },

   brokenJson: `{

   name: 'John Doe',

   age: 30,

   email: "john@example.com",

   skills: ["JavaScript", "React", "Node",], // trailing comma

   address: {

      city: 'New York',

      zip: 10001,

   },

}`,

   diffOriginal: {
      version: '1.0.0',

      appName: 'Klique Suite',

      theme: 'dark',

      maxUploadMB: 10,

      features: ['pdf-tools', 'font-generator', 'bio-creator'],

      betaUsers: 250,

      maintenanceMode: false,
   },

   diffModified: {
      version: '1.2.5',

      appName: 'Klique Creator Suite',

      theme: 'dark',

      maxUploadMB: 25,

      features: [
         'pdf-tools',

         'font-generator',

         'bio-creator',

         'json-formatter',

         'ai-writer',
      ],

      betaUsers: 1500,

      maintenanceMode: false,

      newEngine: true,
   },
};

/* -------------------------------------------------------------------------- */

/*  HELPER FUNCTIONS                                                          */

/* -------------------------------------------------------------------------- */

// Smart repair for broken JSON (fixes single quotes, unquoted keys, trailing commas, comments)

function tryRepairJson(str) {
   let repaired = str;

   // Remove single-line JS comments

   repaired = repaired.replace(/\/\/.*/g, '');

   // Replace single quotes around keys and string values with double quotes

   repaired = repaired.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');

   // Quote unquoted object keys (e.g. name: "John" -> "name": "John")

   repaired = repaired.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');

   // Remove trailing commas before closing braces or brackets

   repaired = repaired.replace(/,\s*([}\]])/g, '$1');

   return repaired;
}

// Calculate JSON stats

function getJsonStats(obj) {
   let nodeCount = 0;

   let arrayCount = 0;

   let objectCount = 0;

   let maxDepth = 0;

   function traverse(node, currentDepth = 1) {
      if (currentDepth > maxDepth) maxDepth = currentDepth;

      nodeCount++;

      if (Array.isArray(node)) {
         arrayCount++;

         node.forEach((child) => traverse(child, currentDepth + 1));
      } else if (node !== null && typeof node === 'object') {
         objectCount++;

         Object.values(node).forEach((child) =>
            traverse(child, currentDepth + 1),
         );
      }
   }

   if (obj !== null && (typeof obj === 'object' || Array.isArray(obj))) {
      traverse(obj);
   } else {
      nodeCount = 1;

      maxDepth = 1;
   }

   return { nodeCount, arrayCount, objectCount, maxDepth };
}

// Sort object keys recursively

function sortObjectKeys(obj) {
   if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
   } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj)

         .sort()

         .reduce((acc, key) => {
            acc[key] = sortObjectKeys(obj[key]);

            return acc;
         }, {});
   }

   return obj;
}

// Line diffing algorithm

function computeLineDiff(originalText, modifiedText) {
   const origLines = originalText.split('\n');

   const modLines = modifiedText.split('\n');

   const diffResult = [];

   let i = 0;

   let j = 0;

   while (i < origLines.length || j < modLines.length) {
      const orig = origLines[i];

      const mod = modLines[j];

      if (i < origLines.length && j < modLines.length && orig === mod) {
         diffResult.push({
            type: 'unchanged',

            leftLine: i + 1,

            rightLine: j + 1,

            value: orig,
         });

         i++;

         j++;
      } else if (
         j < modLines.length &&
         (!origLines.slice(i).includes(mod) || origLines.indexOf(mod) < i)
      ) {
         diffResult.push({
            type: 'added',

            leftLine: null,

            rightLine: j + 1,

            value: mod,
         });

         j++;
      } else if (i < origLines.length) {
         diffResult.push({
            type: 'removed',

            leftLine: i + 1,

            rightLine: null,

            value: orig,
         });

         i++;
      }
   }

   return diffResult;
}

/* -------------------------------------------------------------------------- */

/*  RECURSIVE JSON TREE COMPONENT                                             */

/* -------------------------------------------------------------------------- */

function JsonTreeNode({ name, value, depth = 0, defaultOpen = true }) {
   const [isOpen, setIsOpen] = useState(depth < 2 ? defaultOpen : false);

   const isObject =
      value !== null && typeof value === 'object' && !Array.isArray(value);

   const isArray = Array.isArray(value);

   const isContainer = isObject || isArray;

   const renderValue = (val) => {
      if (val === null)
         return <span className="text-red-400 italic">null</span>;

      if (val === undefined)
         return <span className="text-red-400 italic">undefined</span>;

      if (typeof val === 'boolean')
         return (
            <span className="text-purple-400 font-semibold">
               {val.toString()}
            </span>
         );

      if (typeof val === 'number')
         return <span className="text-amber-400 font-mono">{val}</span>;

      if (typeof val === 'string')
         return <span className="text-emerald-400 font-mono">"{val}"</span>;

      return String(val);
   };

   if (!isContainer) {
      return (
         <div className="flex items-center gap-2 py-0.5 font-mono text-xs hover:bg-zinc-800/40 rounded px-1.5 transition-colors">
            {name !== undefined && (
               <span className="text-sky-400 font-medium">{name}:</span>
            )}

            {renderValue(value)}
         </div>
      );
   }

   const keys = isObject ? Object.keys(value) : value.map((_, idx) => idx);

   const count = keys.length;

   const bracketOpen = isArray ? '[' : '{';

   const bracketClose = isArray ? ']' : '}';

   return (
      <div className="font-mono text-xs select-none">
         <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 py-1 px-1.5 rounded cursor-pointer hover:bg-zinc-800/60 text-zinc-300 transition-colors w-fit">
            {isOpen ? (
               <ChevronDown size={14} className="text-zinc-400" />
            ) : (
               <ChevronRight size={14} className="text-zinc-400" />
            )}

            {name !== undefined && (
               <span className="text-sky-400 font-medium">{name}:</span>
            )}

            <span className="text-zinc-400">{bracketOpen}</span>

            {!isOpen && (
               <span className="text-zinc-500 text-[11px] px-1 font-sans italic">
                  {count} {count === 1 ? 'item' : 'items'}
               </span>
            )}

            {!isOpen && <span className="text-zinc-400">{bracketClose}</span>}
         </div>

         {isOpen && (
            <div className="pl-2.5 sm:pl-4 border-l border-zinc-800/80 ml-1 sm:ml-2 space-y-0.5 my-0.5">
               {keys.map((k) => (
                  <JsonTreeNode
                     key={k}
                     name={isArray ? undefined : k}
                     value={value[k]}
                     depth={depth + 1}
                  />
               ))}

               <div className="text-zinc-400 py-0.5">{bracketClose}</div>
            </div>
         )}
      </div>
   );
}

/* -------------------------------------------------------------------------- */

/*  MAIN COMPONENT                                                            */

/* -------------------------------------------------------------------------- */

export default function JsonFormatter() {
   // Active Tab Mode: 'format' | 'diff' | 'tree'

   const [mode, setMode] = useState('format');

   // Formatter States

   const [inputJson, setInputJson] = useState(
      JSON.stringify(SAMPLES.userProfile, null, 2),
   );

   const [indentSpaces, setIndentSpaces] = useState(2);

   const [sortKeysOption, setSortKeysOption] = useState(false);
   const [selectedSample, setSelectedSample] = useState('');
   const [showWorkspaceSettings, setShowWorkspaceSettings] = useState(false);

   // Diff States

   const [diffLeft, setDiffLeft] = useState(
      JSON.stringify(SAMPLES.diffOriginal, null, 2),
   );

   const [diffRight, setDiffRight] = useState(
      JSON.stringify(SAMPLES.diffModified, null, 2),
   );

   const [diffViewMode, setDiffViewMode] = useState('split'); // 'split' | 'unified'

   // Toast State

   const [toast, setToast] = useState({ visible: false, message: '' });

   const showToast = (message) => {
      setToast({ visible: true, message });

      setTimeout(() => setToast({ visible: false, message: '' }), 2500);
   };

   /* ----------------------------------------------------------------------- */

   /*  FORMATTER LOGIC                                                        */

   /* ----------------------------------------------------------------------- */

   const formatAnalysis = useMemo(() => {
      if (!inputJson.trim()) {
         return {
            isValid: false,

            formattedText: '',

            error: 'Input is empty',

            stats: null,

            parsedObj: null,
         };
      }

      try {
         let parsed = JSON.parse(inputJson);

         if (sortKeysOption) {
            parsed = sortObjectKeys(parsed);
         }

         const indentVal =
            indentSpaces === 'compact'
               ? 0
               : indentSpaces === 'tab'
                  ? '\t'
                  : Number(indentSpaces);

         const formattedText =
            indentSpaces === 'compact'
               ? JSON.stringify(parsed)
               : JSON.stringify(parsed, null, indentVal);

         const stats = getJsonStats(parsed);

         return {
            isValid: true,

            formattedText,

            error: null,

            stats,

            parsedObj: parsed,

            byteSize: new Blob([formattedText]).size,
         };
      } catch (err) {
         return {
            isValid: false,

            formattedText: '',

            error: err.message,

            stats: null,

            parsedObj: null,
         };
      }
   }, [inputJson, indentSpaces, sortKeysOption]);

   const handleRepairJson = () => {
      try {
         const repaired = tryRepairJson(inputJson);

         const parsed = JSON.parse(repaired);

         const formatted = JSON.stringify(
            parsed,

            null,

            Number(indentSpaces) || 2,
         );

         setInputJson(formatted);

         showToast('JSON auto-repaired successfully!');
      } catch (err) {
         showToast('Could not automatically repair. Check syntax error.');
      }
   };

   const handleEscapeString = () => {
      if (!inputJson.trim()) return;

      const escaped = JSON.stringify(inputJson);

      setInputJson(escaped);

      showToast('Escaped JSON string!');
   };

   const handleUnescapeString = () => {
      if (!inputJson.trim()) return;

      try {
         const unescaped = JSON.parse(inputJson);

         if (typeof unescaped === 'string') {
            setInputJson(unescaped);

            showToast('Unescaped string successfully!');
         } else {
            showToast('Already a JSON object');
         }
      } catch (err) {
         showToast('Failed to unescape string');
      }
   };

   const handleCopy = (text) => {
      navigator.clipboard.writeText(text);

      showToast('Copied to clipboard!');
   };

   const handleDownload = (content, filename = 'formatted.json') => {
      const blob = new Blob([content], { type: 'application/json' });

      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');

      a.href = url;

      a.download = filename;

      a.click();

      URL.revokeObjectURL(url);

      showToast(`Downloaded ${filename}!`);
   };

   /* ----------------------------------------------------------------------- */

   /*  DIFF LOGIC                                                             */

   /* ----------------------------------------------------------------------- */

   const diffLines = useMemo(() => {
      return computeLineDiff(diffLeft, diffRight);
   }, [diffLeft, diffRight]);

   const diffStats = useMemo(() => {
      let added = 0;

      let removed = 0;

      let unchanged = 0;

      diffLines.forEach((l) => {
         if (l.type === 'added') added++;
         else if (l.type === 'removed') removed++;
         else unchanged++;
      });

      return { added, removed, unchanged };
   }, [diffLines]);

   const handleSwapDiff = () => {
      const temp = diffLeft;

      setDiffLeft(diffRight);

      setDiffRight(temp);

      showToast('Swapped Left and Right!');
   };

   const handleFormatDiffInputs = () => {
      try {
         const pLeft = JSON.stringify(JSON.parse(diffLeft), null, 2);

         const pRight = JSON.stringify(JSON.parse(diffRight), null, 2);

         setDiffLeft(pLeft);

         setDiffRight(pRight);

         showToast('Formatted both JSON inputs!');
      } catch (e) {
         showToast('Make sure both inputs are valid JSON before formatting');
      }
   };

   /* ----------------------------------------------------------------------- */

   /*  RENDER                                                                 */

   /* ----------------------------------------------------------------------- */

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden

    before:absolute

    before:inset-0

    before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]

    after:absolute

    after:inset-0

    after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
         <div
            className="

    pointer-events-none absolute inset-0

    bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]

  "
         />

         {/* Static ambient backdrop */}

         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
         />

         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         <SEO
            title="JSON Formatter, Validator & Diff Checker - Free Online Tool | Klique"
            description="Professional JSON formatter, validator, and diff checker. Format, beautify, repair, and compare JSON data instantly. Includes tree visualizer, error detection, and side-by-side comparison. Free online tool for developers."
            keywords="json formatter, json validator, json beautifier, json diff checker, format json online, compare json, json repair, json tree viewer, json minifier, json to csv, json to xml, json parser, json linter, online json tool, developer tools, klique"
            canonicalUrl="https://klique.netlify.app/jsonformatter"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'SoftwareApplication',
               name: 'JSON Formatter & Diff Checker',
               applicationCategory: 'DeveloperApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description: 'Professional JSON formatter, validator, and diff checker with tree visualizer and side-by-side comparison.',
               author: {
                  '@type': 'Organization',
                  name: 'Klique',
               },
               featureList: [
                  'JSON formatting and beautification',
                  'JSON validation and error detection',
                  'JSON repair and auto-fix',
                  'Side-by-side JSON diff comparison',
                  'Interactive JSON tree viewer',
                  'JSON minification',
                  'String escaping and unescaping',
                  'Key sorting',
               ],
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
                  <Sparkles
                     size={14}
                     className="animate-spin text-emerald-400"
                  />

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
                     <Braces size={14} className="text-[#daf4aa]" />

                     <span>Developer Suite</span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                     JSON Formatter & Diff Checker
                  </h1>

                  <p className="mt-1 text-sm text-zinc-400">
                     Beautify, validate, repair, and diff compare your JSON
                     payloads with zero latency.
                  </p>
               </motion.div>

               {/* Mode Switcher Tabs */}

               <div className="flex items-center gap-1 rounded-full backdrop-blur-xl py-1">
                  <button
                     onClick={() => setMode('format')}
                     className={`flex items-center gap-1 rounded-full px-2 md:px-3.5 py-2.5 text-xs font-semibold transition-all ${mode === 'format'
                           ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                           : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}>
                     <Braces size={15} />
                     <span>Formatter</span>
                  </button>

                  <button
                     onClick={() => setMode('tree')}
                     className={`flex items-center gap-1 rounded-full px-2 md:px-3.5 py-2.5 text-xs font-semibold transition-all ${mode === 'tree'
                           ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                           : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}>
                     <FolderTree size={15} />

                     <span>Tree View</span>
                  </button>

                  <button
                     onClick={() => setMode('diff')}
                     className={`flex items-center gap-1 rounded-full px-2 md:px-3.5 py-2.5 text-xs font-semibold transition-all ${mode === 'diff'
                           ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                           : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                        }`}>
                     <GitCompare size={15} />

                     <span>Diff Checker</span>
                  </button>
               </div>
            </div>

            {/* MODE 1 & 2: FORMATTER & TREE VIEW */}

            {(mode === 'format' || mode === 'tree') && (
               <div className="space-y-6">
                  {/* Samples and formatting preferences */}
                  <section className="">
                     <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-end">
                        {/* <div>
                           <h2 className="text-sm font-semibold text-zinc-100">
                              Workspace settings
                           </h2>
                           <p className="mt-1 text-xs leading-5 text-zinc-500">
                              Load an example, then choose how your JSON should
                              be formatted.
                           </p>
                        </div> */}
                        <button
                           type="button"
                           aria-expanded={showWorkspaceSettings}
                           aria-controls="workspace-quick-setup"
                           onClick={() =>
                              setShowWorkspaceSettings((open) => !open)
                           }
                           className="mt-2 inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-[#daf4aa]/25 bg-[#daf4aa]/[0.08] px-3 py-2 text-xs font-semibold text-[#daf4aa] shadow-sm transition hover:border-[#daf4aa]/50 hover:bg-[#daf4aa]/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#daf4aa]/40 sm:mt-0">
                           <Sparkles size={14} />
                           {showWorkspaceSettings
                              ? 'Quick Setup'
                              : 'Quick Setup'}
                           <ChevronDown
                              size={14}
                              className={`transition-transform duration-200 ${showWorkspaceSettings ? 'rotate-180' : ''
                                 }`}
                           />
                        </button>
                     </div>

                     <AnimatePresence initial={false}>
                        {showWorkspaceSettings && (
                           <motion.div
                              id="workspace-quick-setup"
                              initial={{ opacity: 0, height: 0, y: -6 }}
                              animate={{ opacity: 1, height: 'auto', y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -6 }}
                              transition={{ duration: 0.22, ease: 'easeOut' }}
                              className="overflow-hidden">
                              <div className="grid grid-cols-1 gap-4 pt-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                                 {/* Sample selector */}
                                 <div className="min-w-0 rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5 sm:p-4">
                                    <label
                                       htmlFor="json-sample-select"
                                       className="mb-2 block text-xs font-semibold text-zinc-300">
                                       Sample JSON
                                    </label>

                                    <SelectPicker
                                       data={[
                                          {
                                             label: 'User Profile — nested object',
                                             value: 'userProfile',
                                          },
                                          {
                                             label: 'API Response — data and metadata',
                                             value: 'apiResponse',
                                          },
                                          {
                                             label: 'Broken JSON — test auto-repair',
                                             value: 'brokenJson',
                                          },
                                       ]}
                                       value={selectedSample}
                                       onChange={(e) => {
                                          const sample = e.target.value;
                                          setSelectedSample(sample);
                                          if (sample === 'brokenJson') {
                                             setInputJson(SAMPLES.brokenJson);
                                          } else if (
                                             sample &&
                                             SAMPLES[sample]
                                          ) {
                                             setInputJson(
                                                JSON.stringify(
                                                   SAMPLES[sample],
                                                   null,
                                                   2,
                                                ),
                                             );
                                          }
                                       }}
                                       searchable={false}
                                       cleanable={false}
                                       placeholder="Select Sample JSON"
                                    />

                                 </div>

                                 {/* Formatting preferences */}
                                 <div className="min-w-0 rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-3.5 sm:p-4">
                                    <p className="mb-3 text-xs font-semibold text-zinc-300">
                                       Formatting preferences
                                    </p>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                       <SelectPicker
                                          data={[
                                             { label: '2 spaces', value: 2 },
                                             { label: '4 spaces', value: 4 },
                                             { label: 'Tab', value: 'tab' },
                                             {
                                                label: 'Minified',
                                                value: 'compact',
                                             },
                                          ]}
                                          value={indentSpaces}
                                          onChange={(e) =>
                                             setIndentSpaces(e.target.value)
                                          }
                                          searchable={false}
                                          cleanable={false}
                                       />
                                       <label className="flex cursor-pointer items-center gap-3 px-3 transition hover:border-zinc-700">
                                          <input
                                             type="checkbox"
                                             checked={sortKeysOption}
                                             onChange={(e) =>
                                                setSortKeysOption(
                                                   e.target.checked,
                                                )
                                             }
                                             className="h-4 w-4 shrink-0 rounded border-zinc-700 bg-zinc-900 text-[#daf4aa] accent-[#daf4aa] focus:ring-[#daf4aa]/20"
                                          />
                                          <span className="min-w-0">
                                             <span className="block text-xs font-bold text-zinc-200">
                                                Sort keys
                                             </span>
                                             <span className="mt-0.5 block text-[10px] leading-4 text-zinc-500">
                                                Alphabetical order
                                             </span>
                                          </span>
                                       </label>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </section>

                  {/* Clearly grouped formatting actions */}
                  <section className="rounded-2xl">
                     <div className="flex items-center justify-between mb-3.5">
                        <span className="text-xs font-semibold text-zinc-400">
                           Quick Actions
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                           <span
                              className={`h-2 w-2 rounded-full ${formatAnalysis.isValid ? 'bg-[#daf4aa]' : 'bg-amber-400'}`}
                           />
                           {formatAnalysis.isValid
                              ? 'JSON ready to process'
                              : 'Fix syntax to format'}
                        </div>
                     </div>

                     <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                        <button
                           onClick={() =>
                              setInputJson(
                                 formatAnalysis.formattedText || inputJson,
                              )
                           }
                           disabled={!formatAnalysis.isValid}
                           className="col-span-2 sm:col-span-1 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#daf4aa] px-4 py-2.5 text-xs font-bold text-zinc-950 shadow-md shadow-[#daf4aa]/10 transition hover:bg-[#c9e894] disabled:cursor-not-allowed disabled:opacity-40">
                           <Check size={14} /> Format JSON
                        </button>

                        <button
                           onClick={handleRepairJson}
                           className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[0.08] px-3.5 py-2.5 text-xs font-semibold text-amber-300 transition hover:border-amber-400/40 hover:bg-amber-500/[0.14]">
                           <Wrench size={14} /> Auto-repair
                        </button>
                        <button
                           onClick={() => setIndentSpaces('compact')}
                           className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white">
                           <Minimize2 size={14} /> Minify
                        </button>
                        <button
                           onClick={handleEscapeString}
                           className="inline-flex min-h-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white">
                           Escape
                        </button>
                        <button
                           onClick={handleUnescapeString}
                           className="inline-flex min-h-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900 px-3.5 py-2.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800 hover:text-white">
                           Unescape
                        </button>
                        <button
                           onClick={() => {
                              setInputJson('');
                              setSelectedSample('');
                           }}
                           className="col-span-2 sm:col-span-1 inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-3.5 py-2.5 text-xs font-semibold text-red-300 transition hover:border-red-500/40 hover:bg-red-500/[0.12] xl:flex-none">
                           <Trash2 size={14} /> Clear editor
                        </button>
                     </div>
                  </section>

                  {/* Validation Status & Stats Banner */}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 sm:px-4 sm:py-2.5 text-xs">
                     <div className="flex items-center gap-2">
                        {formatAnalysis.isValid ? (
                           <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 font-semibold text-emerald-400">
                              <Check size={13} /> Valid JSON
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 font-semibold text-red-400 break-all">
                              <AlertCircle size={13} />{' '}
                              {formatAnalysis.error || 'Invalid Syntax'}
                           </span>
                        )}
                     </div>

                     {formatAnalysis.stats && (
                        <div className="flex items-center gap-4 text-zinc-400 font-mono text-[11px]">
                           <span>
                              Size:{' '}
                              <strong className="text-zinc-200">
                                 {(formatAnalysis.byteSize / 1024).toFixed(2)}{' '}
                                 KB
                              </strong>
                           </span>

                           <span>
                              Nodes:{' '}
                              <strong className="text-zinc-200">
                                 {formatAnalysis.stats.nodeCount}
                              </strong>
                           </span>

                           <span>
                              Depth:{' '}
                              <strong className="text-zinc-200">
                                 {formatAnalysis.stats.maxDepth}
                              </strong>
                           </span>
                        </div>
                     )}
                  </div>

                  {/* Dual Pane Layout (Input & Output / Tree) */}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                     {/* Input Pane */}

                     <div className="flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                           <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                              <Code2 size={14} className="text-[#daf4aa]" /> Raw
                              Input
                           </span>

                           <span className="text-[11px] text-zinc-500 font-mono">
                              {inputJson.length} chars
                           </span>
                        </div>

                        <textarea
                           value={inputJson}
                           onChange={(e) => {
                              setInputJson(e.target.value);
                              setSelectedSample('');
                           }}
                           placeholder="Paste your JSON or JavaScript object string here..."
                           spellCheck={false}
                           className="w-full h-[300px] sm:h-[400px] lg:h-[480px] p-3.5 sm:p-4 bg-transparent font-mono text-xs text-zinc-200 resize-none focus:outline-none customScrollbar leading-relaxed"
                        />
                     </div>

                     {/* Output Pane / Tree View */}

                     <div className="flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                           <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                              {mode === 'tree' ? (
                                 <FolderTree
                                    size={14}
                                    className="text-[#daf4aa]"
                                 />
                              ) : (
                                 <Braces size={14} className="text-[#daf4aa]" />
                              )}

                              {mode === 'tree'
                                 ? 'Interactive Tree'
                                 : 'Formatted Output'}
                           </span>

                           {formatAnalysis.isValid && (
                              <div className="flex items-center gap-2">
                                 <button
                                    onClick={() =>
                                       handleCopy(formatAnalysis.formattedText)
                                    }
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors">
                                    <Copy size={13} /> Copy
                                 </button>

                                 <button
                                    onClick={() =>
                                       handleDownload(
                                          formatAnalysis.formattedText,
                                       )
                                    }
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors">
                                    <Download size={13} /> Download
                                 </button>
                              </div>
                           )}
                        </div>

                        {mode === 'tree' ? (
                           <div className="p-3.5 sm:p-4 h-[300px] sm:h-[400px] lg:h-[480px] overflow-y-auto customScrollbar">
                              {formatAnalysis.isValid &&
                                 formatAnalysis.parsedObj ? (
                                 <JsonTreeNode
                                    value={formatAnalysis.parsedObj}
                                 />
                              ) : (
                                 <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
                                    <AlertCircle
                                       size={24}
                                       className="mb-2 opacity-50"
                                    />

                                    <span>
                                       Enter valid JSON to view interactive tree
                                    </span>
                                 </div>
                              )}
                           </div>
                        ) : (
                           <div className="relative h-[300px] sm:h-[400px] lg:h-[480px] overflow-hidden">
                              <textarea
                                 readOnly
                                 value={
                                    formatAnalysis.isValid
                                       ? formatAnalysis.formattedText
                                       : formatAnalysis.error
                                          ? `// Parse Error:\n${formatAnalysis.error}`
                                          : ''
                                 }
                                 spellCheck={false}
                                 className={`w-full h-full p-4 bg-transparent font-mono text-xs resize-none focus:outline-none customScrollbar leading-relaxed ${formatAnalysis.isValid
                                       ? 'text-emerald-400'
                                       : 'text-red-400'
                                    }`}
                              />
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}

            {/* MODE 3: DIFF CHECKER */}

            {mode === 'diff' && (
               <div className="space-y-6">
                  {/* Diff Controls */}

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-zinc-800/80 bg-[#121215]/90 p-3.5 sm:p-4 backdrop-blur-xl shadow-xl">
                     <div className="flex items-center gap-2 sm:gap-3">
                        <button
                           onClick={handleSwapDiff}
                           className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all">
                           <ArrowLeftRight size={14} />
                           <span>Swap</span>
                        </button>

                        <button
                           onClick={handleFormatDiffInputs}
                           className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-xl bg-[#daf4aa] px-3.5 py-2 text-xs font-bold text-zinc-950 hover:bg-[#c9e894] transition-all">
                           <Braces size={14} />
                           <span>Format Both</span>
                        </button>
                     </div>

                     {/* Diff Mode Toggle & Stats */}
                     <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs font-mono">
                           <span className="text-emerald-400 flex items-center gap-1">
                              <Plus size={13} /> {diffStats.added}
                           </span>
                           <span className="text-red-400 flex items-center gap-1">
                              <Minus size={13} /> {diffStats.removed}
                           </span>
                           <span className="text-zinc-500">
                              {diffStats.unchanged} same
                           </span>
                        </div>

                        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
                           <button
                              onClick={() => setDiffViewMode('split')}
                              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors ${diffViewMode === 'split'
                                    ? 'bg-zinc-800 text-white'
                                    : 'text-zinc-400 hover:text-zinc-200'
                                 }`}>
                              Side-by-Side
                           </button>

                           <button
                              onClick={() => setDiffViewMode('unified')}
                              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition-colors ${diffViewMode === 'unified'
                                    ? 'bg-zinc-800 text-white'
                                    : 'text-zinc-400 hover:text-zinc-200'
                                 }`}>
                              Unified
                           </button>
                        </div>
                     </div>
                  </div>

                  {/* Input Panes for Diff */}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     <div className="flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-2.5 bg-zinc-900/50">
                           <span className="text-xs font-bold text-zinc-300">
                              Original (Left)
                           </span>
                        </div>

                        <textarea
                           value={diffLeft}
                           onChange={(e) => setDiffLeft(e.target.value)}
                           className="w-full h-56 p-4 bg-transparent font-mono text-xs text-zinc-200 resize-none focus:outline-none customScrollbar"
                           placeholder="Original JSON / Text..."
                        />
                     </div>

                     <div className="flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-2.5 bg-zinc-900/50">
                           <span className="text-xs font-bold text-zinc-300">
                              Modified (Right)
                           </span>
                        </div>

                        <textarea
                           value={diffRight}
                           onChange={(e) => setDiffRight(e.target.value)}
                           className="w-full h-56 p-4 bg-transparent font-mono text-xs text-zinc-200 resize-none focus:outline-none customScrollbar"
                           placeholder="Modified JSON / Text..."
                        />
                     </div>
                  </div>

                  {/* Rendered Diff View Output */}

                  <div className="rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                     <div className="border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50 flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                           <GitCompare size={14} className="text-[#daf4aa]" />{' '}
                           Diff Output Results
                        </span>
                     </div>

                     <div className="p-2.5 sm:p-4 max-h-[400px] sm:max-h-[500px] overflow-x-auto overflow-y-auto customScrollbar font-mono text-xs space-y-1">
                        {diffLines.map((line, idx) => (
                           <div
                              key={idx}
                              className={`flex items-start gap-1.5 sm:gap-3 px-2 sm:px-3 py-1 rounded transition-colors min-w-max sm:min-w-0 ${line.type === 'added'
                                    ? 'bg-emerald-500/10 text-emerald-300 border-l-2 border-emerald-500'
                                    : line.type === 'removed'
                                       ? 'bg-red-500/10 text-red-300 border-l-2 border-red-500'
                                       : 'text-zinc-400 hover:bg-zinc-900/40'
                                 }`}>
                              <span className="w-6 sm:w-8 select-none text-[9px] sm:text-[10px] text-zinc-600 text-right shrink-0">
                                 {line.leftLine || ''}
                              </span>

                              <span className="w-6 sm:w-8 select-none text-[9px] sm:text-[10px] text-zinc-600 text-right shrink-0">
                                 {line.rightLine || ''}
                              </span>

                              <span className="w-3 sm:w-4 select-none font-bold shrink-0 text-center">
                                 {line.type === 'added'
                                    ? '+'
                                    : line.type === 'removed'
                                       ? '-'
                                       : ' '}
                              </span>

                              <span className="whitespace-pre-wrap break-all flex-1">
                                 {line.value}
                              </span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}
         </main>
      </div>
   );
}
