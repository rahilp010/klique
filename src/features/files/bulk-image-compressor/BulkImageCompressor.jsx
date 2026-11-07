/* eslint-disable no-unused-vars */
import React, { useState, useRef, useMemo } from 'react';
import {
   Image as ImageIcon,
   UploadCloud,
   Download,
   Archive,
   Sliders,
   Trash2,
   Sparkles,
   ChevronDown,
   HelpCircle,
   CheckCircle2,
   Layers,
   FileCheck,
   Eye,
   ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import {
   formatFileSize,
   compressImageFile,
   createZipArchive,
} from '../../../lib/calculations/imageCompressor';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*  FAQS                                                                      */
/* -------------------------------------------------------------------------- */

const FAQS = [
   {
      question: 'How does client-side bulk image compression work?',
      answer:
         'Images are rendered into high-resolution HTML5 Canvas contexts directly in your browser. Using optimized sub-pixel interpolation algorithms and native browser codecs, file data is compressed into WebP or JPEG without sending any bytes over the network.',
   },
   {
      question: 'Why is WebP recommended over JPEG or PNG?',
      answer:
         'WebP provides superior lossless and lossy compression for web images. Compared to JPEG, WebP is typically 25% to 35% smaller at equivalent visual quality and supports transparency like PNG.',
   },
   {
      question: 'Is there a limit on how many images I can compress?',
      answer:
         'You can compress dozens of images in a single batch. Since processing runs entirely on your local device CPU/GPU, there are no server queues or artificial upload quotas.',
   },
   {
      question: 'Can I download all compressed images together?',
      answer:
         'Yes! Clicking "Download All (ZIP)" bundles all compressed assets into a single clean .zip file generated in memory using JSZip.',
   },
];

export default function BulkImageCompressor() {
   // Compression settings
   const [quality, setQuality] = useState(80);
   const [targetFormat, setTargetFormat] = useState('image/webp');
   const [maxDimension, setMaxDimension] = useState(1920);

   // File queues
   const [isCompressing, setIsCompressing] = useState(false);
   const [queue, setQueue] = useState([]);
   const [activePreview, setActivePreview] = useState(null);

   const fileInputRef = useRef(null);

   // Toast
   const [toast, setToast] = useState({ visible: false, message: '' });
   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   const [openFaq, setOpenFaq] = useState(null);

   // Aggregate stats
   const stats = useMemo(() => {
      let totalOriginal = 0;
      let totalCompressed = 0;
      queue.forEach((item) => {
         totalOriginal += item.originalSize;
         totalCompressed += item.compressedSize;
      });
      const totalSaved = Math.max(0, totalOriginal - totalCompressed);
      const overallPercent =
         totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;
      return {
         totalOriginal,
         totalCompressed,
         totalSaved,
         overallPercent,
      };
   }, [queue]);

   // Handle file selection
   const processFiles = async (files) => {
      const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (validFiles.length === 0) {
         showToast('Please select valid image files (PNG, JPG, WebP, etc.).');
         return;
      }

      setIsCompressing(true);
      showToast(`Compressing ${validFiles.length} image${validFiles.length > 1 ? 's' : ''}...`);

      const results = [];
      for (const file of validFiles) {
         try {
            const compressed = await compressImageFile({
               file,
               quality: quality / 100,
               maxWidth: maxDimension,
               maxHeight: maxDimension,
               targetFormat,
            });
            results.push(compressed);
         } catch {
            // Skip invalid file
         }
      }

      setQueue((prev) => [...results, ...prev]);
      setIsCompressing(false);
      showToast(`Finished compression! Saved ${formatFileSize(stats.totalSaved)}.`);
   };

   // Drag & Drop handlers
   const [isDragging, setIsDragging] = useState(false);
   const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
         processFiles(e.dataTransfer.files);
      }
   };

   // Download Single File
   const handleDownloadSingle = (item) => {
      const a = document.createElement('a');
      a.href = item.previewUrl;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast(`Downloaded ${item.name}`);
   };

   // Download All as ZIP
   const handleDownloadZip = async () => {
      if (queue.length === 0) return;
      showToast('Creating ZIP archive...');
      try {
         await createZipArchive(queue, `klique-compressed-${Date.now()}.zip`);
         showToast('ZIP downloaded successfully!');
      } catch {
         showToast('Failed to create ZIP package.');
      }
   };

   // Remove single item from queue
   const handleRemoveItem = (id) => {
      setQueue((prev) => prev.filter((item) => item.id !== id));
   };

   // Clear all
   const handleClearAll = () => {
      setQueue([]);
      showToast('Queue cleared.');
   };

   const relatedTools = useMemo(() => getRelatedTools('bulk-image-compressor', 4), []);

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
            title="Bulk Image Compressor - Compress WebP, PNG, JPEG | Klique"
            description="Compress multiple images simultaneously client-side without quality loss. Export as high-efficiency WebP or download batch as ZIP."
            keywords="bulk image compressor, compress images online, webp converter, batch image optimizer, shrink image size, free photo compressor, klique"
            canonicalUrl="https://klique.netlify.app/tools/bulk-image-compressor"
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
                     <ImageIcon size={14} className="text-[#daf4aa]" />
                     <span>File Utilities & Media</span>
                     <span className="text-zinc-600">•</span>
                     <span className="text-[#daf4aa]">100% In-Browser Privacy</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                     Bulk Image <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#daf4aa] via-lime-300 to-emerald-400">Compressor</span>
                  </h1>
                  <p className="text-zinc-400 text-sm max-w-xl">
                     Batch compress, resize, and convert multiple photos client-side to WebP, JPEG, or PNG
                     with instant ZIP download.
                  </p>
               </motion.div>

               {/* Quick Action Buttons */}
               {queue.length > 0 && (
                  <div className="flex items-center gap-3">
                     <button
                        onClick={handleClearAll}
                        className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-rose-400 hover:border-zinc-700 transition-all shadow-md backdrop-blur-md">
                        <Trash2 size={14} />
                        <span>Clear All</span>
                     </button>

                     <button
                        onClick={handleDownloadZip}
                        className="flex items-center gap-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] px-4 py-2.5 text-xs font-bold text-zinc-950 transition-all shadow-[0_0_15px_rgba(218,244,170,0.3)] cursor-pointer">
                        <Archive size={15} />
                        <span>Download All as ZIP</span>
                     </button>
                  </div>
               )}
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
               <Link to="/" className="hover:text-zinc-200 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category" className="hover:text-zinc-200 transition-colors">File Utilities</Link>
               <span>/</span>
               <span className="text-[#daf4aa]">Bulk Image Compressor</span>
            </div>

            {/* Overall Savings Banner (If images processed) */}
            {queue.length > 0 && (
               <div className="rounded-2xl border border-[#daf4aa]/30 bg-[#daf4aa]/10 p-5 mb-8 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-[#daf4aa]/20 border border-[#daf4aa]/30 flex items-center justify-center text-[#daf4aa] shrink-0 font-bold">
                        <FileCheck size={20} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-white">
                           {queue.length} Images Processed &bull; Saved {stats.overallPercent}% Storage
                        </h4>
                        <p className="text-xs text-[#daf4aa]">
                           Reduced from {formatFileSize(stats.totalOriginal)} down to {formatFileSize(stats.totalCompressed)} (Saved {formatFileSize(stats.totalSaved)})
                        </p>
                     </div>
                  </div>

                  <button
                     onClick={handleDownloadZip}
                     className="px-4 py-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] text-zinc-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(218,244,170,0.3)] shrink-0 cursor-pointer">
                     Download ZIP Archive
                  </button>
               </div>
            )}

            {/* Main Stage: Controls & Drop Zone */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
               {/* Left Column: Dropzone & Queue List */}
               <div className="lg:col-span-8 flex flex-col gap-6">
                  {/* Upload Dropzone */}
                  <div
                     onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                     }}
                     onDragLeave={() => setIsDragging(false)}
                     onDrop={handleDrop}
                     onClick={() => fileInputRef.current?.click()}
                     className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all backdrop-blur-xl ${
                        isDragging
                           ? 'border-emerald-400 bg-emerald-500/10'
                           : 'border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60'
                     }`}>
                     <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/png, image/jpeg, image/webp, image/bmp, image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                           if (e.target.files) processFiles(e.target.files);
                        }}
                     />
                     <div className="w-16 h-16 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-inner">
                        <UploadCloud size={28} />
                     </div>
                     <h3 className="text-base font-bold text-white mb-1">
                        Drop images here, or <span className="text-emerald-400 underline">browse files</span>
                     </h3>
                     <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                        Supports PNG, JPG, JPEG, WebP. Multiple files processed simultaneously in your browser.
                     </p>
                  </div>

                  {/* Processing / Queue List */}
                  {queue.length > 0 && (
                     <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl shadow-xl space-y-3">
                        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">
                           Compressed Files ({queue.length})
                        </h4>

                        <div className="space-y-2.5">
                           {queue.map((item) => (
                              <div
                                 key={item.id}
                                 className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition-all">
                                 <div className="flex items-center gap-3 truncate">
                                    <img
                                       src={item.previewUrl}
                                       alt={item.name}
                                       className="w-12 h-12 object-cover rounded-lg border border-zinc-800 shrink-0 bg-zinc-900"
                                    />
                                    <div className="truncate">
                                       <span className="text-xs font-bold text-white block truncate">
                                          {item.name}
                                       </span>
                                       <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                                          <span>{formatFileSize(item.originalSize)}</span>
                                          <ArrowRight size={11} className="text-zinc-600" />
                                          <span className="font-bold text-emerald-400">
                                             {formatFileSize(item.compressedSize)}
                                          </span>
                                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                             -{item.percentageSaved}%
                                          </span>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-800/50">
                                    <button
                                       onClick={() => handleDownloadSingle(item)}
                                       className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-all"
                                       title="Download file">
                                       <Download size={13} />
                                       <span>Save</span>
                                    </button>

                                    <button
                                       onClick={() => handleRemoveItem(item.id)}
                                       className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-all"
                                       title="Remove">
                                       <Trash2 size={14} />
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>

               {/* Right Column: Compression Controls */}
               <div className="lg:col-span-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                     <Sliders size={16} className="text-emerald-400" />
                     <h3 className="text-sm font-bold text-white">Compression Settings</h3>
                  </div>

                  {/* Quality Slider */}
                  <div className="text-xs">
                     <div className="flex justify-between text-zinc-300 mb-1.5 font-medium">
                        <span>Image Quality</span>
                        <span className="font-mono font-bold text-emerald-400">{quality}%</span>
                     </div>
                     <input
                        type="range"
                        min="20"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                        className="w-full accent-emerald-500 cursor-pointer"
                     />
                     <span className="text-[10px] text-zinc-500 block mt-1">
                        80% recommended for optimal size-to-clarity ratio.
                     </span>
                  </div>

                  {/* Output Format */}
                  <div className="text-xs">
                     <label className="block text-zinc-300 font-medium mb-1.5">Output Format</label>
                     <select
                        value={targetFormat}
                        onChange={(e) => setTargetFormat(e.target.value)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-3.5 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none transition-all">
                        <option value="image/webp">WebP (Recommended &bull; Best Compression)</option>
                        <option value="image/jpeg">JPEG (Universal Compatibility)</option>
                        <option value="image/png">PNG (Lossless & Transparency)</option>
                     </select>
                  </div>

                  {/* Max Dimension */}
                  <div className="text-xs">
                     <label className="block text-zinc-300 font-medium mb-1.5">Max Image Dimension</label>
                     <select
                        value={maxDimension}
                        onChange={(e) => setMaxDimension(parseInt(e.target.value, 10))}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-3.5 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none transition-all">
                        <option value="1920">Full HD (1920px max)</option>
                        <option value="1280">HD (1280px max)</option>
                        <option value="800">Compact Web (800px max)</option>
                        <option value="0">Original Resolution (No Resize)</option>
                     </select>
                  </div>
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
                     <span>Related File & Image Tools</span>
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

