/* eslint-disable no-unused-vars */
import React, { useState, useRef, useMemo } from 'react';
import {
   FileText,
   Upload,
   Download,
   RefreshCw,
   Check,
   Sparkles,
   ChevronRight,
   HelpCircle,
   Trash2,
   FolderArchive,
   ArrowRight,
   Sliders,
   Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

const FAQS = [
   {
      question: 'How does Bulk File Renamer work in the browser?',
      answer:
         'You select or drop multiple files from your computer. Our client-side script parses each filename, applies your custom prefix, suffix, numbering, or text replacements, and packages the renamed files into a single download ZIP with zero upload to any cloud.',
   },
   {
      question: 'Can I reorder or add sequential numbers like 001, 002?',
      answer:
         'Yes! You can enable sequential numbering with customizable start index and digit padding (e.g., 1, 01, 001) to easily organize camera rolls or documents.',
   },
   {
      question: 'Are my files kept secure and private?',
      answer:
         '100% private. Files are processed entirely inside your local browser memory using JavaScript and Web Workers. No file data or names ever leave your device.',
   },
   {
      question: 'Is there a limit on how many files I can rename?',
      answer:
         'You can comfortably batch-rename dozens or hundreds of files at once. For very large batches (gigabytes of video), memory limits of your browser apply when generating the ZIP file.',
   },
];

export default function BulkFileRenamer() {
   const [files, setFiles] = useState([]);
   const [prefix, setPrefix] = useState('');
   const [suffix, setSuffix] = useState('');
   const [findText, setFindText] = useState('');
   const [replaceText, setReplaceText] = useState('');
   const [caseTransform, setCaseTransform] = useState('none'); // 'none' | 'lower' | 'upper' | 'kebab' | 'snake'
   const [enableNumbering, setEnableNumbering] = useState(false);
   const [startNumber, setStartNumber] = useState(1);
   const [numberPadding, setNumberPadding] = useState(2); // e.g. '01'
   const [numberPosition, setNumberPosition] = useState('suffix'); // 'prefix' | 'suffix'

   const [isZipping, setIsZipping] = useState(false);
   const [toast, setToast] = useState({ visible: false, message: '' });

   const fileInputRef = useRef(null);

   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   const handleFilesSelected = (e) => {
      const selected = Array.from(e.target.files || []);
      if (selected.length === 0) return;
      setFiles((prev) => [...prev, ...selected]);
      showToast(`Added ${selected.length} files to batch!`);
   };

   const handleRemoveFile = (index) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
   };

   const handleClearAll = () => {
      setFiles([]);
      trackToolReset('bulk-file-renamer');
      showToast('Cleared all files.');
   };

   // Calculate preview of renamed files
   const renamedPreview = useMemo(() => {
      return files.map((file, index) => {
         const originalName = file.name;
         const lastDot = originalName.lastIndexOf('.');
         let baseName = lastDot !== -1 ? originalName.slice(0, lastDot) : originalName;
         const ext = lastDot !== -1 ? originalName.slice(lastDot) : '';

         // 1. Find and replace
         if (findText) {
            baseName = baseName.replaceAll(findText, replaceText);
         }

         // 2. Case transformation
         if (caseTransform === 'lower') {
            baseName = baseName.toLowerCase();
         } else if (caseTransform === 'upper') {
            baseName = baseName.toUpperCase();
         } else if (caseTransform === 'kebab') {
            baseName = baseName.replace(/[\s_]+/g, '-').toLowerCase();
         } else if (caseTransform === 'snake') {
            baseName = baseName.replace(/[\s-]+/g, '_').toLowerCase();
         }

         // 3. Numbering
         let numStr = '';
         if (enableNumbering) {
            const num = (startNumber || 1) + index;
            numStr = num.toString().padStart(numberPadding, '0');
         }

         // 4. Combine Prefix, Base, Suffix, Number
         let finalBase = baseName;
         if (enableNumbering && numberPosition === 'prefix') {
            finalBase = `${numStr}_${finalBase}`;
         }

         finalBase = `${prefix}${finalBase}${suffix}`;

         if (enableNumbering && numberPosition === 'suffix') {
            finalBase = `${finalBase}_${numStr}`;
         }

         return {
            file,
            originalName,
            newName: `${finalBase}${ext}`,
            size: (file.size / 1024).toFixed(1) + ' KB',
         };
      });
   }, [
      files,
      prefix,
      suffix,
      findText,
      replaceText,
      caseTransform,
      enableNumbering,
      startNumber,
      numberPadding,
      numberPosition,
   ]);

   // Generate ZIP and download
   const handleDownloadZip = async () => {
      if (renamedPreview.length === 0) return;

      setIsZipping(true);
      try {
         const zip = new JSZip();
         renamedPreview.forEach(({ file, newName }) => {
            zip.file(newName, file);
         });

         const content = await zip.generateAsync({ type: 'blob' });
         const url = URL.createObjectURL(content);
         const a = document.createElement('a');
         a.href = url;
         a.download = `renamed_files_${Date.now()}.zip`;
         a.click();
         URL.revokeObjectURL(url);

         trackToolDownload('bulk-file-renamer', {
            fileCount: renamedPreview.length,
            fileType: 'zip',
            fileSize: content.size,
         });
         showToast(`Successfully downloaded ${renamedPreview.length} renamed files!`);
      } catch (err) {
         console.error('ZIP generation failed:', err);
         showToast('Failed to create ZIP package.');
      } finally {
         setIsZipping(false);
      }
   };

   const relatedTools = useMemo(() => getRelatedTools('bulk-file-renamer', 3), []);

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden
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
            title="Bulk File Renamer - Batch Rename Files Client-Side | Klique"
            description="Rename dozens of files instantly in your browser. Add prefixes, suffixes, sequential numbers, or replace text with real-time preview and instant ZIP download."
            keywords="bulk file renamer, batch rename files online, rename photos in bulk, sequential file numbering, client side file renamer, klique"
            canonicalUrl="https://klique.netlify.app/tools/bulk-file-renamer"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'Bulk File Renamer',
               applicationCategory: 'UtilitiesApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Batch rename multiple files locally in your browser with prefixes, suffixes, numbering, and zero upload risk.',
            }}
         />

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

         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Title Section */}
            <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                     <FileText size={14} className="text-[#daf4aa]" />
                     <span>File Utilities Suite</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                     Bulk File Renamer
                  </h1>
                  <p className="mt-1 text-sm text-zinc-400">
                     Batch rename multiple photos, documents, and code files locally with sequential numbering and instant ZIP export.
                  </p>
               </motion.div>

               {/* Quick Stats or Actions */}
               {files.length > 0 && (
                  <div className="flex items-center gap-2">
                     <button
                        onClick={handleClearAll}
                        className="px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer">
                        Clear All
                     </button>
                  </div>
               )}
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
               <Link to="/" className="hover:text-zinc-300 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category/file-utilities" className="hover:text-zinc-300 transition-colors">File Utilities</Link>
               <span>/</span>
               <span className="text-zinc-300">Bulk File Renamer</span>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">
               {/* Controls Column */}
               <div className="lg:col-span-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                     <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Sliders size={16} className="text-[#daf4aa]" />
                        Renaming Rules
                     </h2>
                  </div>

                  {/* Prefix & Suffix */}
                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300">Prefix</label>
                        <input
                           type="text"
                           value={prefix}
                           onChange={(e) => setPrefix(e.target.value)}
                           placeholder="e.g. Doc_"
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300">Suffix</label>
                        <input
                           type="text"
                           value={suffix}
                           onChange={(e) => setSuffix(e.target.value)}
                           placeholder="e.g. _v2"
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                        />
                     </div>
                  </div>

                  {/* Find & Replace */}
                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300">Find Text</label>
                        <input
                           type="text"
                           value={findText}
                           onChange={(e) => setFindText(e.target.value)}
                           placeholder="Search text"
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300">Replace With</label>
                        <input
                           type="text"
                           value={replaceText}
                           onChange={(e) => setReplaceText(e.target.value)}
                           placeholder="Replacement"
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                        />
                     </div>
                  </div>

                  {/* Case Transform */}
                  <div className="space-y-1.5">
                     <label className="text-xs font-medium text-zinc-300">Case Transformation</label>
                     <select
                        value={caseTransform}
                        onChange={(e) => setCaseTransform(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40 cursor-pointer">
                        <option value="none">No case change (preserve original)</option>
                        <option value="lower">lowercase (all characters lowercase)</option>
                        <option value="upper">UPPERCASE (ALL CHARACTERS UPPERCASE)</option>
                        <option value="kebab">kebab-case (dash-separated-words)</option>
                        <option value="snake">snake_case (underscore_separated_words)</option>
                     </select>
                  </div>

                  {/* Sequential Numbering Toggle */}
                  <div className="border border-zinc-800/80 rounded-xl p-3.5 bg-zinc-950/40 space-y-3">
                     <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5 cursor-pointer">
                           <input
                              type="checkbox"
                              checked={enableNumbering}
                              onChange={(e) => setEnableNumbering(e.target.checked)}
                              className="accent-[#daf4aa] rounded"
                           />
                           Enable Sequential Numbering
                        </label>
                        {enableNumbering && (
                           <span className="text-[10px] text-[#daf4aa] font-mono">Active</span>
                        )}
                     </div>

                     {enableNumbering && (
                        <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
                           <div>
                              <label className="text-[11px] text-zinc-400">Start At</label>
                              <input
                                 type="number"
                                 min="0"
                                 value={startNumber}
                                 onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                                 className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-100 font-mono"
                              />
                           </div>
                           <div>
                              <label className="text-[11px] text-zinc-400">Padding</label>
                              <select
                                 value={numberPadding}
                                 onChange={(e) => setNumberPadding(Number(e.target.value))}
                                 className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-1.5 py-1 text-xs text-zinc-100">
                                 <option value="1">1 (no pad)</option>
                                 <option value="2">01 (2 digits)</option>
                                 <option value="3">001 (3 digits)</option>
                                 <option value="4">0001 (4 digits)</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-[11px] text-zinc-400">Position</label>
                              <select
                                 value={numberPosition}
                                 onChange={(e) => setNumberPosition(e.target.value)}
                                 className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-1.5 py-1 text-xs text-zinc-100">
                                 <option value="suffix">Suffix</option>
                                 <option value="prefix">Prefix</option>
                              </select>
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Upload Trigger */}
                  <input
                     type="file"
                     ref={fileInputRef}
                     onChange={handleFilesSelected}
                     multiple
                     className="hidden"
                  />
                  <button
                     onClick={() => fileInputRef.current?.click()}
                     className="w-full py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer">
                     <Upload size={14} className="text-[#daf4aa]" />
                     <span>+ Select Files From Computer</span>
                  </button>
               </div>

               {/* Preview Table & Download Column */}
               <div className="lg:col-span-7 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                     <div>
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                           <FolderArchive size={16} className="text-[#daf4aa]" />
                           Live Rename Preview ({files.length} files)
                        </h2>
                     </div>
                     {files.length > 0 && (
                        <button
                           onClick={handleDownloadZip}
                           disabled={isZipping}
                           className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] text-zinc-950 font-bold text-xs shadow-[0_0_15px_rgba(218,244,170,0.25)] transition-all cursor-pointer">
                           <Download size={14} />
                           <span>{isZipping ? 'Packaging ZIP...' : 'Download Renamed ZIP'}</span>
                        </button>
                     )}
                  </div>

                  {/* Empty or Table State */}
                  {files.length === 0 ? (
                     <div
                        onClick={() => fileInputRef.current?.click()}
                        className="py-16 text-center border-2 border-dashed border-zinc-800 hover:border-[#daf4aa]/50 rounded-xl cursor-pointer space-y-3 transition-all">
                        <Upload size={32} className="mx-auto text-zinc-600 animate-bounce" />
                        <div className="text-xs text-zinc-300 font-medium">
                           No files added yet. Click to select files.
                        </div>
                        <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                           Select photos, invoices, audio, or documents. Preview names in real time with 100% browser privacy.
                        </p>
                     </div>
                  ) : (
                     <div className="max-h-[380px] overflow-y-auto customScrollbar border border-zinc-800/80 rounded-xl divide-y divide-zinc-800/60 bg-zinc-950/60">
                        {renamedPreview.map((item, idx) => (
                           <div
                              key={idx}
                              className="p-3 text-xs flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
                              <div className="flex-1 min-w-0 pr-3">
                                 <div className="text-zinc-500 truncate line-through text-[11px]">
                                    {item.originalName}
                                 </div>
                                 <div className="text-emerald-400 font-mono font-medium truncate flex items-center gap-1.5 mt-0.5">
                                    <ArrowRight size={11} className="text-zinc-500 flex-shrink-0" />
                                    <span>{item.newName}</span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                 <span className="text-[10px] text-zinc-500 font-mono">{item.size}</span>
                                 <button
                                    onClick={() => handleRemoveFile(idx)}
                                    className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer">
                                    <Trash2 size={13} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}

                  {/* Footer Stats */}
                  {files.length > 0 && (
                     <div className="pt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-800/80">
                        <span>Total files ready: {files.length}</span>
                        <span className="text-[#daf4aa] font-mono">100% Client-Side Processing</span>
                     </div>
                  )}
               </div>
            </div>

            {/* FAQs Accordion */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md space-y-4 mb-8">
               <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle size={17} className="text-[#daf4aa]" />
                  Frequently Asked Questions
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FAQS.map((faq, i) => (
                     <div key={i} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50 space-y-1.5">
                        <h4 className="text-xs font-semibold text-zinc-200">{faq.question}</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{faq.answer}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
               <div className="border-t border-zinc-800/80 pt-8 space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm font-semibold text-white">Related Tools</h3>
                     <Link
                        to="/category"
                        className="text-xs text-[#daf4aa] hover:underline flex items-center gap-1 transition-colors">
                        Browse all tools <ChevronRight size={13} />
                     </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     {relatedTools.map((tool) => (
                        <Link
                           key={tool.id}
                           to={tool.slug}
                           onMouseEnter={() => preloadRoute(tool.slug)}
                           className="group p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all">
                           <div className="text-xs font-semibold text-zinc-200 group-hover:text-[#daf4aa] transition-colors">
                              {tool.name}
                           </div>
                           <div className="text-[11px] text-zinc-500 line-clamp-2 mt-1">
                              {tool.description}
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

