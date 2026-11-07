/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
   PenTool,
   Upload,
   Download,
   FileText,
   Check,
   RotateCcw,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ShieldCheck,
   Calendar,
   User,
   Maximize2,
   Sliders,
   FileCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import {
   inspectPdfFile,
   stampSignatureOnPdf,
} from '../../../lib/calculations/pdfSigner';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';
import { Dropdown, InputControl, CheckboxInput } from '../../../components/ui/CustomControl';

/* -------------------------------------------------------------------------- */
/*  FAQS                                                                      */
/* -------------------------------------------------------------------------- */

const FAQS = [
   {
      question: 'Is my uploaded PDF document uploaded to any external server?',
      answer:
         'Never. PDF documents and signatures are read, processed, and merged entirely within your browser memory using WebAssembly and pdf-lib. Your confidential legal documents never touch our or any third-party servers.',
   },
   {
      question: 'Can I select which page to place my signature on?',
      answer:
         'Yes! You can choose the exact page number and click anywhere on the page canvas to position your signature precisely where the signature line appears.',
   },
   {
      question: 'What signature methods are supported?',
      answer:
         'You can draw your signature naturally with a mouse or touchscreen, type your name using a cursive handwriting style, or upload a transparent PNG image of your actual physical signature.',
   },
   {
      question: 'Does this tool support adding dates and printed names?',
      answer:
         'Yes, you can toggle automatic timestamp dates and printed signer names alongside your signature.',
   },
];

export default function PDFSigner() {
   // File states
   const [pdfFile, setPdfFile] = useState(null);
   const [pdfPageCount, setPdfPageCount] = useState(1);
   const [selectedPage, setSelectedPage] = useState(1);

   // Signature method: 'draw' | 'type' | 'upload'
   const [signatureMethod, setSignatureMethod] = useState('draw');
   const [penColor, setPenColor] = useState('#000000');
   const [typedName, setTypedName] = useState('');
   const [dateStamp, setDateStamp] = useState(new Date().toISOString().slice(0, 10));
   const [includeDate, setIncludeDate] = useState(true);
   const [includeName, setIncludeName] = useState(false);

   // Signature position (0 to 1 relative)
   const [position, setPosition] = useState({ x: 0.5, y: 0.8 });
   const [signatureScale, setSignatureScale] = useState(160);

   // Generated signature data URL
   const [signatureDataUrl, setSignatureDataUrl] = useState('');
   const [isSigning, setIsSigning] = useState(false);

   // Canvas refs
   const drawCanvasRef = useRef(null);
   const [isDrawing, setIsDrawing] = useState(false);
   const fileInputRef = useRef(null);
   const signatureUploadRef = useRef(null);

   // Toast
   const [toast, setToast] = useState({ visible: false, message: '' });
   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   const [openFaq, setOpenFaq] = useState(null);

   // PDF file upload handler
   const handlePdfUpload = async (file) => {
      if (!file || file.type !== 'application/pdf') {
         showToast('Please upload a valid .pdf file.');
         return;
      }
      try {
         const details = await inspectPdfFile(file);
         setPdfFile(file);
         setPdfPageCount(details.pageCount);
         setSelectedPage(1);
         showToast(`Loaded ${file.name} (${details.pageCount} pages).`);
      } catch {
         showToast('Failed to parse PDF document.');
      }
   };

   // Drawing canvas routines
   const startDrawing = (e) => {
      const canvas = drawCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      ctx.beginPath();
      ctx.moveTo(clientX - rect.left, clientY - rect.top);
      setIsDrawing(true);
   };

   const draw = (e) => {
      if (!isDrawing) return;
      const canvas = drawCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = penColor;
      ctx.lineTo(clientX - rect.left, clientY - rect.top);
      ctx.stroke();
   };

   const stopDrawing = () => {
      if (!isDrawing) return;
      setIsDrawing(false);
      const canvas = drawCanvasRef.current;
      if (canvas) {
         setSignatureDataUrl(canvas.toDataURL('image/png'));
      }
   };

   const clearCanvas = () => {
      const canvas = drawCanvasRef.current;
      if (canvas) {
         const ctx = canvas.getContext('2d');
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         setSignatureDataUrl('');
      }
   };

   // Typed signature generator to PNG canvas
   useEffect(() => {
      if (signatureMethod === 'type' && typedName.trim()) {
         const canvas = document.createElement('canvas');
         canvas.width = 400;
         canvas.height = 150;
         const ctx = canvas.getContext('2d');
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         ctx.font = 'italic 44px "Brush Script MT", cursive, sans-serif';
         ctx.fillStyle = penColor;
         ctx.textAlign = 'center';
         ctx.textBaseline = 'middle';
         ctx.fillText(typedName, 200, 75);
         setSignatureDataUrl(canvas.toDataURL('image/png'));
      }
   }, [signatureMethod, typedName, penColor]);

   // Handle uploaded signature image
   const handleSignatureUpload = (file) => {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
         setSignatureDataUrl(e.target.result);
         showToast('Signature image loaded!');
      };
      reader.readAsDataURL(file);
   };

   // Placement on preview click
   const handlePageCanvasClick = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0.1, Math.min(0.9, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0.1, Math.min(0.9, (e.clientY - rect.top) / rect.height));
      setPosition({ x, y });
   };

   // Final Sign & Export
   const handleSignAndDownload = async () => {
      if (!pdfFile) {
         showToast('Please upload a PDF document first.');
         return;
      }
      if (!signatureDataUrl) {
         showToast('Please create or upload your signature first.');
         return;
      }

      setIsSigning(true);
      showToast('Stamping signature onto PDF...');

      try {
         const signedBlob = await stampSignatureOnPdf({
            pdfFile,
            signatureDataUrl,
            pageIndex: selectedPage - 1,
            xPct: position.x,
            yPct: position.y,
            sigWidth: signatureScale,
            sigHeight: signatureScale * 0.45,
            signerName: includeName ? typedName : '',
            dateStamp: includeDate ? dateStamp : '',
         });

         const downloadUrl = URL.createObjectURL(signedBlob);
         const a = document.createElement('a');
         a.href = downloadUrl;
         const base = pdfFile.name.replace(/\.pdf$/i, '');
         a.download = `${base}-signed.pdf`;
         document.body.appendChild(a);
         a.click();
         document.body.removeChild(a);
         setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);

         showToast('Signed PDF exported successfully!');
      } catch {
         showToast('Error stamping signature onto PDF.');
      } finally {
         setIsSigning(false);
      }
   };

   const relatedTools = useMemo(() => getRelatedTools('pdf-signer', 4), []);

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
            title="PDF Signer - Sign Documents Client-Side | Klique"
            description="Sign PDF documents securely in your browser. Draw, type, or upload your signature, choose placement, and export signed PDFs with 100% privacy."
            keywords="pdf signer, sign pdf online, e-sign pdf, electronic signature, sign contracts, free pdf signer, klique"
            canonicalUrl="https://klique.netlify.app/tools/pdf-signer"
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
                     <PenTool size={14} className="text-[#daf4aa]" />
                     <span>File Utilities & Documents</span>
                     <span className="text-zinc-600">•</span>
                     <span className="text-[#daf4aa]">100% Client-Side Privacy</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                     PDF <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#daf4aa] via-lime-300 to-emerald-400">Signer</span>
                  </h1>
                  <p className="text-zinc-400 text-sm max-w-xl">
                     Electronically sign contracts, forms, and NDAs in your browser. Draw, type, or stamp
                     signatures without server uploads.
                  </p>
               </motion.div>

               {/* Download CTA */}
               {pdfFile && signatureDataUrl && (
                  <button
                     onClick={handleSignAndDownload}
                     disabled={isSigning}
                     className="flex items-center gap-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] px-5 py-3 text-xs font-bold text-zinc-950 transition-all shadow-[0_0_15px_rgba(218,244,170,0.3)] cursor-pointer">
                     <Download size={15} />
                     <span>{isSigning ? 'Signing...' : 'Sign & Download PDF'}</span>
                  </button>
               )}
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
               <Link to="/" className="hover:text-zinc-200 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category" className="hover:text-zinc-200 transition-colors">File Utilities</Link>
               <span>/</span>
               <span className="text-[#daf4aa]">PDF Signer</span>
            </div>

            {/* Main Stage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
               {/* Left Column: PDF Viewer / Positioning Canvas */}
               <div className="lg:col-span-7 flex flex-col gap-4">
                  {pdfFile ? (
                     <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl">
                        {/* Page selector bar */}
                        <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-2">
                              <FileText size={16} className="text-emerald-400" />
                              <span className="text-xs font-bold text-white truncate max-w-xs">
                                 {pdfFile.name}
                              </span>
                           </div>

                           <div className="flex items-center gap-2 text-xs text-zinc-400">
                              <span>Page</span>
                              <Dropdown
                                 value={selectedPage}
                                 onChange={(e) => setSelectedPage(parseInt(e.target.value, 10))}
                                 className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-white font-mono">
                                 {Array.from({ length: pdfPageCount }, (_, i) => i + 1).map((p) => (
                                    <option key={p} value={p}>
                                       {p} of {pdfPageCount}
                                    </option>
                                 ))}
                              </Dropdown>
                           </div>
                        </div>

                        {/* Interactive Page Placement Canvas Mock */}
                        <div
                           onClick={handlePageCanvasClick}
                           className="relative w-full aspect-[1/1.3] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden cursor-crosshair shadow-inner flex flex-col justify-between p-8">
                           {/* Decorative PDF Lines */}
                           <div className="space-y-3 pointer-events-none opacity-30">
                              <div className="h-4 bg-zinc-800 rounded w-1/3 mb-6" />
                              <div className="h-2 bg-zinc-800 rounded w-full" />
                              <div className="h-2 bg-zinc-800 rounded w-5/6" />
                              <div className="h-2 bg-zinc-800 rounded w-full" />
                              <div className="h-2 bg-zinc-800 rounded w-4/6" />
                              <div className="h-2 bg-zinc-800 rounded w-full" />
                           </div>

                           {/* Signature Stamp Marker */}
                           {signatureDataUrl && (
                              <div
                                 style={{
                                    left: `${position.x * 100}%`,
                                    top: `${position.y * 100}%`,
                                    transform: 'translate(-50%, -50%)',
                                    width: `${signatureScale}px`,
                                 }}
                                 className="absolute border-2 border-dashed border-emerald-400/80 bg-emerald-500/10 rounded-lg p-2 flex flex-col items-center justify-center cursor-move shadow-xl">
                                 <img
                                    src={signatureDataUrl}
                                    alt="Signature"
                                    className="max-h-12 object-contain pointer-events-none"
                                 />
                                 {includeName && typedName && (
                                    <span className="text-[10px] text-zinc-300 font-mono mt-0.5 truncate max-w-full">
                                       Signed by: {typedName}
                                    </span>
                                 )}
                                 {includeDate && dateStamp && (
                                    <span className="text-[9px] text-zinc-400 font-mono">
                                       Date: {dateStamp}
                                    </span>
                                 )}
                              </div>
                           )}

                           <div className="text-center text-[11px] text-zinc-500 pointer-events-none">
                              Click anywhere on this page canvas to place your signature stamp.
                           </div>
                        </div>

                        {/* Size slider */}
                        <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                           <span>Signature Size</span>
                           <input
                              type="range"
                              min="80"
                              max="240"
                              value={signatureScale}
                              onChange={(e) => setSignatureScale(parseInt(e.target.value, 10))}
                              className="w-48 accent-emerald-500 cursor-pointer"
                           />
                           <span className="font-mono text-zinc-300">{signatureScale}px</span>
                        </div>
                     </div>
                  ) : (
                     <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer rounded-2xl border-2 border-dashed border-zinc-800/80 bg-zinc-900/40 p-12 text-center transition-all hover:border-zinc-700 hover:bg-zinc-900/60 backdrop-blur-xl">
                        <input
                           ref={fileInputRef}
                           type="file"
                           accept="application/pdf"
                           className="hidden"
                           onChange={(e) => {
                              if (e.target.files?.[0]) handlePdfUpload(e.target.files[0]);
                           }}
                        />
                        <div className="w-16 h-16 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-inner">
                           <Upload size={28} />
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">
                           Select PDF Document to Sign
                        </h3>
                        <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                           Click to browse or drag and drop your .PDF agreement. Zero bytes ever leave your device.
                        </p>
                     </div>
                  )}
               </div>

               {/* Right Column: Signature Creation Tools */}
               <div className="lg:col-span-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl space-y-5">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <PenTool size={16} className="text-[#daf4aa]" />
                        <span>Create Signature</span>
                     </h3>

                     {/* Signature Methods Tabs */}
                     <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-950 p-1">
                        <button
                           onClick={() => setSignatureMethod('draw')}
                           className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                              signatureMethod === 'draw'
                                 ? 'bg-[#daf4aa] text-zinc-950 font-bold shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                                 : 'text-zinc-400 hover:text-white'
                           }`}>
                           Draw
                        </button>
                        <button
                           onClick={() => setSignatureMethod('type')}
                           className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                              signatureMethod === 'type'
                                 ? 'bg-[#daf4aa] text-zinc-950 font-bold shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                                 : 'text-zinc-400 hover:text-white'
                           }`}>
                           Type
                        </button>
                        <button
                           onClick={() => setSignatureMethod('upload')}
                           className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                              signatureMethod === 'upload'
                                 ? 'bg-[#daf4aa] text-zinc-950 font-bold shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                                 : 'text-zinc-400 hover:text-white'
                           }`}>
                           Upload
                        </button>
                     </div>
                  </div>

                  {/* Draw Signature Canvas */}
                  {signatureMethod === 'draw' && (
                     <div className="space-y-3">
                        <div className="relative border border-zinc-800 bg-zinc-950 rounded-xl overflow-hidden shadow-inner">
                           <canvas
                              ref={drawCanvasRef}
                              width={380}
                              height={160}
                              onMouseDown={startDrawing}
                              onMouseMove={draw}
                              onMouseUp={stopDrawing}
                              onMouseLeave={stopDrawing}
                              onTouchStart={startDrawing}
                              onTouchMove={draw}
                              onTouchEnd={stopDrawing}
                              className="w-full h-40 touch-none cursor-crosshair"
                           />
                           <div className="absolute bottom-2 right-2 flex items-center gap-2">
                              <button
                                 onClick={clearCanvas}
                                 className="px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-[11px] text-zinc-400 hover:text-rose-400 transition-all">
                                 Clear
                              </button>
                           </div>
                        </div>

                        {/* Ink Color Picker */}
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                           <span>Ink Color</span>
                           <div className="flex items-center gap-2">
                              {['#000000', '#1e3a8a', '#991b1b'].map((col) => (
                                 <button
                                    key={col}
                                    onClick={() => setPenColor(col)}
                                    style={{ backgroundColor: col }}
                                    className={`w-6 h-6 rounded-full border ${
                                       penColor === col ? 'ring-2 ring-emerald-400' : 'border-zinc-700'
                                    }`}
                                 />
                              ))}
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Type Signature */}
                  {signatureMethod === 'type' && (
                     <div className="space-y-3">
                        <InputControl
                           type="text"
                           value={typedName}
                           onChange={(e) => setTypedName(e.target.value)}
                           placeholder="Type your full legal name..."
                           className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none transition-all"
                        />

                        {typedName && (
                           <div className="border border-zinc-800 bg-zinc-950 rounded-xl p-4 text-center">
                              <span
                                 style={{ color: penColor }}
                                 className="text-3xl font-serif italic tracking-wide">
                                 {typedName}
                              </span>
                           </div>
                        )}
                     </div>
                  )}

                  {/* Upload Signature Image */}
                  {signatureMethod === 'upload' && (
                     <div
                        onClick={() => signatureUploadRef.current?.click()}
                        className="cursor-pointer border border-dashed border-zinc-800 rounded-xl p-6 text-center hover:border-zinc-700 transition-all bg-zinc-950/40">
                        <input
                           ref={signatureUploadRef}
                           type="file"
                           accept="image/png, image/jpeg"
                           className="hidden"
                           onChange={(e) => {
                              if (e.target.files?.[0]) handleSignatureUpload(e.target.files[0]);
                           }}
                        />
                        <Upload size={20} className="mx-auto mb-2 text-emerald-400" />
                        <span className="text-xs font-semibold text-white block">
                           Upload Signature PNG
                        </span>
                        <span className="text-[11px] text-zinc-500">Transparent PNG recommended</span>
                     </div>
                  )}

                  {/* Stamp Metadata Settings */}
                  <div className="pt-2 border-t border-zinc-800/80 space-y-3 text-xs">
                     <div className="flex items-center justify-between">
                        <label className="text-zinc-300 font-medium">Include Date Stamp</label>
                        <CheckboxInput
                           type="checkbox"
                           checked={includeDate}
                           onChange={(e) => setIncludeDate(e.target.checked)}
                           className="accent-emerald-500 cursor-pointer"
                        />
                     </div>

                     {includeDate && (
                        <InputControl
                           type="date"
                           value={dateStamp}
                           onChange={(e) => setDateStamp(e.target.value)}
                           className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-white text-xs focus:outline-none"
                        />
                     )}

                     <div className="flex items-center justify-between">
                        <label className="text-zinc-300 font-medium">Include Printed Name</label>
                        <CheckboxInput
                           type="checkbox"
                           checked={includeName}
                           onChange={(e) => setIncludeName(e.target.checked)}
                           className="accent-emerald-500 cursor-pointer"
                        />
                     </div>
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
                     <span>Related File & PDF Tools</span>
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
