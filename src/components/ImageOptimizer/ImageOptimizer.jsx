/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
   ImageIcon,
   Upload,
   Download,
   Sliders,
   Trash2,
   RefreshCw,
   CheckCircle2,
   AlertCircle,
   ArrowRight,
   Zap,
   Maximize2,
   Eye,
   FileImage,
   FileArchive,
   Sparkles,
   Split,
   Braces,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import Navbar from '../Navbar';
import SEO from '../SEO';

const FORMATS = [
   { id: 'image/webp', label: 'WebP (Modern & Compact)', ext: 'webp' },
   { id: 'image/jpeg', label: 'JPEG (Standard Photo)', ext: 'jpg' },
   { id: 'image/png', label: 'PNG (Lossless / Transparent)', ext: 'png' },
];

const PRESETS = [
   { name: 'Ultra Quality', quality: 0.9, desc: 'Best visual fidelity' },
   { name: 'Balanced', quality: 0.75, desc: 'Recommended for web' },
   { name: 'Max Compression', quality: 0.5, desc: 'Smallest file size' },
];

export default function ImageOptimizer() {
   const [files, setFiles] = useState([]);
   const [selectedFileIndex, setSelectedFileIndex] = useState(0);
   const [format, setFormat] = useState('image/webp');
   const [quality, setQuality] = useState(0.75);
   const [maxWidth, setMaxWidth] = useState(0); // 0 = original
   const [isProcessing, setIsProcessing] = useState(false);
   const [sliderPos, setSliderPos] = useState(50); // Before/After split position (0-100)

   const [toast, setToast] = useState({
      visible: false,
      message: '',
      type: 'success',
   });

   const showToast = (message, type = 'success') => {
      setToast({ visible: true, message, type });
      setTimeout(
         () => setToast({ visible: false, message: '', type: 'success' }),
         2600,
      );
   };

   // Process a single image file through canvas
   const processImage = async (fileObj) => {
      return new Promise((resolve) => {
         const img = new Image();
         img.crossOrigin = 'anonymous';
         img.onload = () => {
            let width = img.width;
            let height = img.height;

            if (maxWidth > 0 && width > maxWidth) {
               height = Math.round((height * maxWidth) / width);
               width = maxWidth;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (format === 'image/jpeg') {
               ctx.fillStyle = '#ffffff';
               ctx.fillRect(0, 0, width, height);
            }
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
               (blob) => {
                  const targetExt =
                     FORMATS.find((f) => f.id === format)?.ext || 'webp';
                  const baseName =
                     fileObj.name.substring(0, fileObj.name.lastIndexOf('.')) ||
                     fileObj.name;
                  const newName = `${baseName}-optimized.${targetExt}`;
                  const compressedUrl = URL.createObjectURL(blob);

                  resolve({
                     ...fileObj,
                     compressedBlob: blob,
                     compressedUrl,
                     compressedSize: blob.size,
                     newWidth: width,
                     newHeight: height,
                     newName,
                  });
               },
               format,
               quality,
            );
         };
         img.src = fileObj.originalUrl;
      });
   };

   // Recompress all files when format, quality, or max width changes
   const recompressAll = async (fileList) => {
      setIsProcessing(true);
      try {
         const list = fileList || files;
         const updated = [];
         for (const f of list) {
            const processed = await processImage(f);
            updated.push(processed);
         }
         setFiles(updated);
      } catch (err) {
         console.error('Batch compression error:', err);
         showToast('Error during compression', 'error');
      } finally {
         setIsProcessing(false);
      }
   };

   useEffect(() => {
      if (files.length > 0) {
         recompressAll();
      }
   }, [format, quality, maxWidth]);

   // Handle file upload
   const handleUpload = async (e) => {
      const incoming = Array.from(e.target.files || []);
      if (incoming.length === 0) return;

      const newItems = incoming.map((f) => ({
         name: f.name,
         originalSize: f.size,
         originalUrl: URL.createObjectURL(f),
         rawFile: f,
      }));

      const combined = [...files, ...newItems];
      setFiles(combined);
      setSelectedFileIndex(files.length);
      await recompressAll(combined);
      showToast(`Added and compressed ${incoming.length} images!`);
   };

   // Helper: Format bytes
   const formatBytes = (bytes) => {
      if (!bytes || bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
   };

   // Total savings calculation
   const totalOriginalSize = useMemo(
      () => files.reduce((acc, f) => acc + (f.originalSize || 0), 0),
      [files],
   );
   const totalCompressedSize = useMemo(
      () => files.reduce((acc, f) => acc + (f.compressedSize || 0), 0),
      [files],
   );
   const totalSavingsPercent = useMemo(() => {
      if (!totalOriginalSize || !totalCompressedSize) return 0;
      return Math.round(
         ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100,
      );
   }, [totalOriginalSize, totalCompressedSize]);

   // Download single file
   const downloadSingle = (file) => {
      if (!file?.compressedUrl) return;
      const link = document.createElement('a');
      link.href = file.compressedUrl;
      link.download = file.newName;
      link.click();
      showToast(`Downloaded ${file.newName}`);
   };

   // Download all in ZIP
   const downloadAllZip = async () => {
      if (files.length === 0) return;
      try {
         const zip = new JSZip();
         files.forEach((f) => {
            if (f.compressedBlob) {
               zip.file(f.newName, f.compressedBlob);
            }
         });
         const zipBlob = await zip.generateAsync({ type: 'blob' });
         const link = document.createElement('a');
         link.href = URL.createObjectURL(zipBlob);
         link.download = `klique-optimized-images-${Date.now()}.zip`;
         link.click();
         URL.revokeObjectURL(link.href);
         showToast('Downloaded all compressed images in ZIP!');
      } catch (err) {
         showToast('Failed to create ZIP', 'error');
      }
   };

   const removeFile = (index) => {
      const updated = files.filter((_, i) => i !== index);
      setFiles(updated);
      if (selectedFileIndex >= updated.length) {
         setSelectedFileIndex(Math.max(0, updated.length - 1));
      }
   };

   const activeFile = files[selectedFileIndex] || files[0];

   return (
      <div
         className="relative h-screen w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-hidden px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden

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
            title="Client-Side Image Optimizer & WebP Converter - Free Online Tool | Klique"
            description="Batch compress, convert, and resize images directly in your browser with zero server uploads. Convert PNG, JPG, and AVIF to WebP with interactive before/after split comparison. 100% private, free online tool."
            keywords="image compressor, webp converter, client side image optimizer, png compressor, jpg to webp, bulk image resize, browser image compression, image optimizer online, image reducer, lossy image compression, klique"
            canonicalUrl="https://klique.netlify.app/imageoptimizer"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'SoftwareApplication',
               name: 'Client-Side Image Optimizer & WebP Converter',
               applicationCategory: 'MultimediaApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  '100% private in-browser image optimizer and WebP converter with live before/after slider comparison and batch ZIP downloads.',
               author: {
                  '@type': 'Organization',
                  name: 'Klique',
               },
               featureList: [
                  '100% client-side compression (zero server uploads)',
                  'WebP, JPEG, and PNG format conversion',
                  'Quality control slider with compression presets',
                  'Interactive before/after split comparison slider',
                  'Dimension resizing with aspect ratio preservation',
                  'Batch image processing with ZIP download',
                  'Instant file size and savings percentage metrics',
               ],
            }}
         />

         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         {/* Toast Notification */}
         <AnimatePresence>
            {toast.visible && (
               <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="fixed right-4 top-4 z-[10000] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-zinc-800 bg-[#0f0f11]/95 px-4 py-3 text-sm font-medium shadow-2xl shadow-black/50 backdrop-blur-xl sm:right-6 sm:top-6">
                  {toast.type === 'error' ? (
                     <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                     <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span className="text-zinc-200">{toast.message}</span>
               </motion.div>
            )}
         </AnimatePresence>

         <main className="relative z-10 mx-auto flex max-h-screen w-full max-w-7xl flex-col pb-28 pt-10 sm:pb-24 sm:pt-6 lg:pl-20">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center sm:text-left">
               <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                  <Braces size={14} className="text-[#daf4aa]" />

                  <span>Developer Suite</span>
               </div>
               <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                  Image Optimizer & WebP Converter
               </h1>
               <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
                  Batch compress, convert, and resize images without uploading
                  them to any server. Your images never leave your device.
               </p>
            </motion.div>

            {/* If no files uploaded yet: Big Drag & Drop zone */}
            {files.length === 0 ? (
               <div className="p-8 sm:p-14 rounded-3xl border-2 border-dashed border-zinc-800 hover:border-[#daf4aa]/60 bg-[#0f0f11]/80 backdrop-blur-xl flex flex-col items-center justify-center text-center transition-all mt-10">
                  <div className="w-20 h-20 rounded-3xl bg-[#daf4aa]/10 border border-[#daf4aa]/20 flex items-center justify-center mb-4">
                     <ImageIcon className="w-10 h-10 text-[#daf4aa]" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1">
                     Drop your images here or browse
                  </h2>
                  <p className="text-xs text-zinc-400 max-w-md mb-6">
                     Supports PNG, JPG, JPEG, WebP, AVIF, and SVG. Batch
                     compression processed directly in your browser.
                  </p>
                  <label className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#daf4aa] hover:bg-[#cbe699] text-[#16161b] font-bold text-sm cursor-pointer shadow-lg shadow-[#daf4aa]/15 transition-all">
                     <Upload className="w-4 h-4" />
                     <span>Select Images</span>
                     <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                     />
                  </label>
               </div>
            ) : (
               /* Main Editor Layout */
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Interactive Before/After Comparison & Image Preview */}
                  <div className="lg:col-span-8 space-y-6">
                     {/* Interactive Split Slider Viewer */}
                     {activeFile && (
                        <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-4 shadow-xl">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                                 <Split className="w-4 h-4 text-[#daf4aa]" />
                                 Live Before & After Comparison
                              </span>
                              <div className="flex items-center gap-3 text-xs font-mono">
                                 <span className="text-zinc-400">
                                    Original:{' '}
                                    {formatBytes(activeFile.originalSize)}
                                 </span>
                                 <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                                 <span className="text-[#daf4aa] font-bold">
                                    {formatBytes(activeFile.compressedSize)}
                                 </span>
                              </div>
                           </div>

                           {/* Split View Container */}
                           <div className="relative w-full h-[360px] sm:h-[440px] rounded-xl overflow-hidden bg-black/50 border border-zinc-800 select-none">
                              {/* Compressed (After) Image - Full width */}
                              <img
                                 src={activeFile.compressedUrl}
                                 alt="After Optimized"
                                 className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                              />

                              {/* Original (Before) Image - Clipped by sliderPos */}
                              <div
                                 className="absolute inset-0 overflow-hidden pointer-events-none"
                                 style={{ width: `${sliderPos}%` }}>
                                 <img
                                    src={activeFile.originalUrl}
                                    alt="Before Original"
                                    className="absolute inset-0 w-full h-full object-contain max-w-none"
                                    style={{
                                       width: '100%',
                                       height: '100%',
                                    }}
                                 />
                              </div>

                              {/* Split Divider Handle */}
                              <div
                                 className="absolute top-0 bottom-0 w-0.5 bg-[#daf4aa] cursor-ew-resize z-10 flex items-center justify-center shadow-lg"
                                 style={{ left: `${sliderPos}%` }}>
                                 <div className="w-7 h-7 rounded-full bg-[#18181b] border-2 border-[#daf4aa] flex items-center justify-center shadow-md">
                                    <Split className="w-3.5 h-3.5 text-[#daf4aa]" />
                                 </div>
                              </div>

                              {/* Hidden range input over container for smooth dragging */}
                              <input
                                 type="range"
                                 min={0}
                                 max={100}
                                 value={sliderPos}
                                 onChange={(e) =>
                                    setSliderPos(Number(e.target.value))
                                 }
                                 className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                              />

                              {/* Corner Badges */}
                              <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-300 pointer-events-none">
                                 Original (Before)
                              </div>
                              <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#daf4aa] pointer-events-none">
                                 Optimized (After)
                              </div>
                           </div>
                        </div>
                     )}

                     {/* Batch Files List */}
                     <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-3">
                        <div className="flex items-center justify-between">
                           <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                              Batch Queue ({files.length} items)
                           </h3>
                           <label className="text-xs font-medium text-[#daf4aa] hover:underline cursor-pointer flex items-center gap-1">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Add more files</span>
                              <input
                                 type="file"
                                 multiple
                                 accept="image/*"
                                 onChange={handleUpload}
                                 className="hidden"
                              />
                           </label>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto customScrollbar pr-1">
                           {files.map((f, idx) => {
                              const savings =
                                 f.originalSize && f.compressedSize
                                    ? Math.round(
                                         ((f.originalSize - f.compressedSize) /
                                            f.originalSize) *
                                            100,
                                      )
                                    : 0;
                              const isSelected = selectedFileIndex === idx;

                              return (
                                 <div
                                    key={idx}
                                    onClick={() => setSelectedFileIndex(idx)}
                                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                       isSelected
                                          ? 'bg-[#18181b] border-[#daf4aa]/60 shadow-md'
                                          : 'bg-[#18181b]/50 border-zinc-800 hover:bg-[#18181b]'
                                    }`}>
                                    <div className="flex items-center gap-3 overflow-hidden">
                                       <img
                                          src={f.compressedUrl || f.originalUrl}
                                          alt={f.name}
                                          className="w-10 h-10 rounded-lg object-cover bg-black/50 shrink-0 border border-zinc-800"
                                       />
                                       <div className="overflow-hidden">
                                          <div className="text-xs font-medium text-white truncate max-w-[200px] sm:max-w-xs">
                                             {f.name}
                                          </div>
                                          <div className="text-[11px] text-zinc-500 font-mono">
                                             {formatBytes(f.originalSize)} →{' '}
                                             <span className="text-zinc-300">
                                                {formatBytes(f.compressedSize)}
                                             </span>
                                          </div>
                                       </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                       <span
                                          className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                                             savings > 0
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-zinc-800 text-zinc-400'
                                          }`}>
                                          {savings > 0 ? `-${savings}%` : '0%'}
                                       </span>
                                       <button
                                          type="button"
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             downloadSingle(f);
                                          }}
                                          title="Download this file"
                                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                                          <Download className="w-3.5 h-3.5" />
                                       </button>
                                       <button
                                          type="button"
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             removeFile(idx);
                                          }}
                                          title="Remove from queue"
                                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400">
                                          <Trash2 className="w-3.5 h-3.5" />
                                       </button>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  </div>

                  {/* Right Column: Settings & Bulk Export */}
                  <div className="lg:col-span-4 space-y-5">
                     {/* Summary Card */}
                     <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0f0f11] backdrop-blur-xl shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                           <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                              Batch Summary
                           </span>
                           <span className="text-xs font-mono bg-[#daf4aa]/10 text-[#daf4aa] px-2 py-0.5 rounded border border-[#daf4aa]/30 font-bold">
                              {totalSavingsPercent}% Saved
                           </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 py-2 border-y border-zinc-800/60 font-mono">
                           <div>
                              <div className="text-[11px] text-zinc-500">
                                 Original Total
                              </div>
                              <div className="text-sm font-semibold text-zinc-300">
                                 {formatBytes(totalOriginalSize)}
                              </div>
                           </div>
                           <div>
                              <div className="text-[11px] text-zinc-500">
                                 New Total
                              </div>
                              <div className="text-sm font-bold text-[#daf4aa]">
                                 {formatBytes(totalCompressedSize)}
                              </div>
                           </div>
                        </div>

                        <button
                           type="button"
                           onClick={downloadAllZip}
                           disabled={files.length === 0}
                           className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#daf4aa] hover:bg-[#cbe699] text-[#16161b] font-bold text-sm transition-all shadow-lg shadow-[#daf4aa]/15">
                           <FileArchive className="w-4 h-4" />
                           <span>Download All ({files.length}) as ZIP</span>
                        </button>
                     </div>

                     {/* Compression Options */}
                     <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-4">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                           <Sliders className="w-4 h-4 text-[#daf4aa]" />
                           Output Format & Quality
                        </h3>

                        {/* Format Selection */}
                        <div className="space-y-1.5">
                           <label className="text-xs text-zinc-400 font-medium">
                              Target Format
                           </label>
                           <div className="space-y-1.5">
                              {FORMATS.map((fmt) => (
                                 <button
                                    key={fmt.id}
                                    type="button"
                                    onClick={() => setFormat(fmt.id)}
                                    className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                                       format === fmt.id
                                          ? 'border-[#daf4aa] bg-[#daf4aa]/10 text-white'
                                          : 'border-zinc-800 bg-[#18181b] text-zinc-400 hover:text-white'
                                    }`}>
                                    <span>{fmt.label}</span>
                                    <span className="font-mono text-[10px] uppercase bg-black/40 px-1.5 py-0.5 rounded">
                                       .{fmt.ext}
                                    </span>
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Quality Slider */}
                        <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                           <div className="flex justify-between text-xs text-zinc-400">
                              <span>Compression Quality</span>
                              <span className="font-mono text-[#daf4aa] font-bold">
                                 {Math.round(quality * 100)}%
                              </span>
                           </div>
                           <input
                              type="range"
                              min={0.1}
                              max={1.0}
                              step={0.05}
                              value={quality}
                              onChange={(e) =>
                                 setQuality(Number(e.target.value))
                              }
                              className="w-full accent-[#daf4aa] h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                           />
                           <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                              <span>Aggressive (10%)</span>
                              <span>Balanced (75%)</span>
                              <span>Lossless (100%)</span>
                           </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="grid grid-cols-3 gap-1.5 pt-1">
                           {PRESETS.map((p) => (
                              <button
                                 key={p.name}
                                 type="button"
                                 onClick={() => setQuality(p.quality)}
                                 className="py-1 px-2 rounded-lg bg-[#18181b] border border-zinc-800 text-[10px] text-zinc-300 hover:text-white hover:border-zinc-700 text-center">
                                 {p.name}
                              </button>
                           ))}
                        </div>

                        {/* Max Width Resizing */}
                        <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                           <label className="text-xs text-zinc-400 font-medium">
                              Max Resize Width (Optional)
                           </label>
                           <select
                              value={maxWidth}
                              onChange={(e) =>
                                 setMaxWidth(Number(e.target.value))
                              }
                              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#daf4aa]/60">
                              <option value={0}>
                                 Original Dimensions (No scale)
                              </option>
                              <option value={2560}>2560px (2K QHD)</option>
                              <option value={1920}>1920px (Full HD)</option>
                              <option value={1280}>
                                 1280px (Standard Web)
                              </option>
                              <option value={800}>800px (Blog / Mobile)</option>
                           </select>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </main>
      </div>
   );
}
