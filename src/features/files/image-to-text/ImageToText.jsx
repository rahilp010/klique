/* eslint-disable no-unused-vars */
import React, { useState, useRef, useMemo } from 'react';
import {
   ScanText,
   UploadCloud,
   Copy,
   Download,
   RefreshCw,
   Sparkles,
   ChevronDown,
   HelpCircle,
   CheckCircle2,
   Languages,
   FileText,
   Sliders,
   AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import {
   OCR_LANGUAGES,
   performOCR,
   preprocessImage,
} from '../../../lib/calculations/ocr';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*  FAQS                                                                      */
/* -------------------------------------------------------------------------- */

const FAQS = [
   {
      question: 'How does client-side OCR work without an internet API?',
      answer:
         'Our OCR tool runs Tesseract directly inside your web browser compiled to WebAssembly (Wasm). Image pixels are analyzed, vectorized, and parsed into characters locally on your device CPU/GPU without transmitting any data.',
   },
   {
      question: 'How can I get the highest text extraction accuracy?',
      answer:
         'Ensure images are well-lit, sharp, and text is horizontally aligned. High contrast between text and background yields the best results. The automatic grayscale and contrast pre-processing filter helps boost recognition rates on phone snapshots.',
   },
   {
      question: 'Which languages are supported?',
      answer:
         'English, Spanish (Español), French (Français), German (Deutsch), and Hindi (हिन्दी) are supported directly.',
   },
   {
      question: 'Are my confidential documents and scanned receipts kept private?',
      answer:
         'Completely. Because all machine learning model weights run inside the browser sandbox, your files, passwords, financial receipts, and notes never touch any server.',
   },
];

// Sample text image generator for instant testing
const generateSampleImage = () => {
   const canvas = document.createElement('canvas');
   canvas.width = 600;
   canvas.height = 280;
   const ctx = canvas.getContext('2d');
   ctx.fillStyle = '#ffffff';
   ctx.fillRect(0, 0, canvas.width, canvas.height);

   ctx.fillStyle = '#111827';
   ctx.font = 'bold 24px monospace';
   ctx.fillText('KLIQUE INVOICE RECEIPT', 40, 50);

   ctx.font = '16px sans-serif';
   ctx.fillText('Order ID: #KLQ-98241', 40, 90);
   ctx.fillText('Date: 2026-11-07', 40, 115);
   ctx.fillText('Description: Cloud Pro Workspace Annual', 40, 150);
   ctx.fillText('Amount: $120.00 USD (Paid)', 40, 180);

   ctx.font = 'italic 14px sans-serif';
   ctx.fillText('Thank you for choosing private client-side software!', 40, 230);

   return canvas.toDataURL('image/png');
};

export default function ImageToText() {
   // Image states
   const [imageSrc, setImageSrc] = useState(null);
   const [language, setLanguage] = useState('eng');
   const [autoPreprocess, setAutoPreprocess] = useState(true);

   // Processing & Progress
   const [isProcessing, setIsProcessing] = useState(false);
   const [progressInfo, setProgressInfo] = useState({ status: '', progress: 0 });

   // Extracted results
   const [result, setResult] = useState(null);
   const [copied, setCopied] = useState(false);

   const fileInputRef = useRef(null);
   const imgRef = useRef(null);

   // Toast
   const [toast, setToast] = useState({ visible: false, message: '' });
   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   const [openFaq, setOpenFaq] = useState(null);

   // Handle file selection
   const handleFile = (file) => {
      if (!file || !file.type.startsWith('image/')) {
         showToast('Please select a valid image file (PNG, JPG, WebP).');
         return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
         setImageSrc(e.target.result);
         setResult(null);
         showToast('Image loaded. Ready to extract text.');
      };
      reader.readAsDataURL(file);
   };

   // Load Sample
   const handleLoadSample = () => {
      const sample = generateSampleImage();
      setImageSrc(sample);
      setResult(null);
      showToast('Loaded sample receipt image.');
   };

   // Run OCR
   const handleExtractText = async () => {
      if (!imageSrc) {
         showToast('Please upload or load an image first.');
         return;
      }

      setIsProcessing(true);
      setProgressInfo({ status: 'Initializing OCR engine...', progress: 10 });

      try {
         let processedSource = imageSrc;
         if (autoPreprocess && imgRef.current) {
            processedSource = preprocessImage(imgRef.current, { grayscale: true, contrast: 1.25 });
         }

         const ocrResult = await performOCR({
            imageSource: processedSource,
            language,
            onProgress: (info) => {
               setProgressInfo(info);
            },
         });

         setResult(ocrResult);
         showToast('Text extracted successfully!');
      } catch (err) {
         showToast('Failed to recognize text from image.');
      } finally {
         setIsProcessing(false);
      }
   };

   // Copy text
   const handleCopy = () => {
      if (!result?.text) return;
      navigator.clipboard.writeText(result.text);
      setCopied(true);
      showToast('Extracted text copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
   };

   // Download as TXT
   const handleDownloadTxt = () => {
      if (!result?.text) return;
      const blob = new Blob([result.text], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `klique-extracted-text-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Downloaded text file.');
   };

   // Download as JSON
   const handleDownloadJson = () => {
      if (!result) return;
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `klique-ocr-results-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Downloaded JSON metadata.');
   };

   const relatedTools = useMemo(() => getRelatedTools('image-to-text', 4), []);

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
            title="Image to Text (OCR) - Extract Text from Images & Scans | Klique"
            description="Extract text from images, photos, receipts, and scans 100% in your browser. Client-side Optical Character Recognition (OCR) powered by Wasm."
            keywords="image to text, ocr online, extract text from image, photo to text converter, receipt ocr, client side ocr, free ocr, klique"
            canonicalUrl="https://klique.netlify.app/tools/image-to-text"
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
                     <ScanText size={14} className="text-[#daf4aa]" />
                     <span>Media & OCR Utilities</span>
                     <span className="text-zinc-600">•</span>
                     <span className="text-[#daf4aa]">100% Wasm Client-Side</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                     Image to Text <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#daf4aa] via-lime-300 to-emerald-400">(OCR)</span>
                  </h1>
                  <p className="text-zinc-400 text-sm max-w-xl">
                     Extract clean text, numbers, and receipt line items from screenshots, book scans, and
                     photos with browser-native OCR.
                  </p>
               </motion.div>

               {/* Quick Sample Button */}
               <button
                  onClick={handleLoadSample}
                  className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all shadow-md backdrop-blur-md cursor-pointer">
                  <Sparkles size={14} className="text-[#daf4aa]" />
                  <span>Try Sample Image</span>
               </button>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
               <Link to="/" className="hover:text-zinc-200 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category" className="hover:text-zinc-200 transition-colors">File Utilities</Link>
               <span>/</span>
               <span className="text-[#daf4aa]">Image to Text (OCR)</span>
            </div>

            {/* Main Stage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
               {/* Left Column: Image Upload & Preview */}
               <div className="lg:col-span-6 flex flex-col gap-5">
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl">
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                           Source Image
                        </span>
                        {imageSrc && (
                           <button
                              onClick={() => {
                                 setImageSrc(null);
                                 setResult(null);
                              }}
                              className="text-xs text-zinc-400 hover:text-rose-400 transition-colors">
                              Clear Image
                           </button>
                        )}
                     </div>

                     {imageSrc ? (
                        <div className="relative border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center max-h-96">
                           <img
                              ref={imgRef}
                              src={imageSrc}
                              alt="Source for OCR"
                              className="max-h-96 object-contain w-full"
                           />
                        </div>
                     ) : (
                        <div
                           onClick={() => fileInputRef.current?.click()}
                           className="cursor-pointer border-2 border-dashed border-zinc-800 rounded-xl p-10 text-center hover:border-zinc-700 hover:bg-zinc-900/50 transition-all bg-zinc-950/40">
                           <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              className="hidden"
                              onChange={(e) => {
                                 if (e.target.files?.[0]) handleFile(e.target.files[0]);
                              }}
                           />
                           <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-inner">
                              <UploadCloud size={24} />
                           </div>
                           <h4 className="text-xs font-bold text-white mb-1">
                              Upload an image or screenshot
                           </h4>
                           <p className="text-[11px] text-zinc-500">PNG, JPG, or WebP</p>
                        </div>
                     )}

                     {/* Configuration Bar */}
                     <div className="mt-5 pt-4 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                           <label className="block text-zinc-300 font-medium mb-1.5 flex items-center gap-1.5">
                              <Languages size={13} className="text-emerald-400" />
                              <span>Language</span>
                           </label>
                           <select
                              value={language}
                              onChange={(e) => setLanguage(e.target.value)}
                              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-white focus:border-emerald-500/50 focus:outline-none transition-all">
                              {OCR_LANGUAGES.map((lang) => (
                                 <option key={lang.code} value={lang.code}>
                                    {lang.name}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div className="flex flex-col justify-end">
                           <label className="flex items-center gap-2 cursor-pointer pb-2 text-zinc-300 font-medium">
                              <input
                                 type="checkbox"
                                 checked={autoPreprocess}
                                 onChange={(e) => setAutoPreprocess(e.target.checked)}
                                 className="accent-emerald-500 cursor-pointer"
                              />
                              <span>Auto-enhance Contrast</span>
                           </label>
                        </div>
                     </div>

                     {/* Extract Action Button */}
                     <button
                        onClick={handleExtractText}
                        disabled={!imageSrc || isProcessing}
                        className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] disabled:opacity-50 disabled:hover:bg-[#daf4aa] py-3 text-xs font-bold text-zinc-950 transition-all shadow-[0_0_15px_rgba(218,244,170,0.3)] cursor-pointer">
                        {isProcessing ? (
                           <>
                              <RefreshCw size={15} className="animate-spin" />
                              <span>Recognizing Text...</span>
                           </>
                        ) : (
                           <>
                              <ScanText size={15} />
                              <span>Extract Text from Image</span>
                           </>
                        )}
                     </button>

                     {/* Progress bar */}
                     {isProcessing && (
                        <div className="mt-4">
                           <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                              <span className="capitalize">{progressInfo.status || 'Processing...'}</span>
                              <span className="font-mono text-[#daf4aa]">{progressInfo.progress}%</span>
                           </div>
                           <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                              <div
                                 className="h-full bg-[#daf4aa] transition-all duration-300"
                                 style={{ width: `${progressInfo.progress}%` }}
                              />
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Right Column: OCR Results & Export */}
               <div className="lg:col-span-6 flex flex-col gap-5">
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl flex flex-col min-h-[460px]">
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                           <FileText size={14} className="text-emerald-400" />
                           <span>Extracted Text</span>
                        </span>

                        {result && (
                           <div className="flex items-center gap-2">
                              <button
                                 onClick={handleCopy}
                                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-all">
                                 {copied ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                 <span>{copied ? 'Copied' : 'Copy'}</span>
                              </button>

                              <button
                                 onClick={handleDownloadTxt}
                                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-all">
                                 <Download size={13} />
                                 <span>.TXT</span>
                              </button>

                              <button
                                 onClick={handleDownloadJson}
                                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-950 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-all">
                                 <span>JSON</span>
                              </button>
                           </div>
                        )}
                     </div>

                     {/* Result text area or empty placeholder */}
                     {result ? (
                        <div className="flex-1 flex flex-col">
                           <textarea
                              readOnly
                              value={result.text}
                              className="w-full flex-1 min-h-[300px] rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 font-mono text-xs text-zinc-200 focus:outline-none resize-none leading-relaxed"
                           />

                           {/* Accuracy and count metadata */}
                           <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                              <span>
                                 {result.wordsCount} words &bull; {result.charactersCount} characters &bull; {result.linesCount} lines
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                                 {result.confidence}% Confidence
                              </span>
                           </div>
                        </div>
                     ) : (
                        <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800/80 bg-zinc-950/30 p-8 text-center text-zinc-500">
                           <ScanText size={36} className="mx-auto mb-2 text-zinc-600" />
                           <p className="text-xs">
                              Extracted characters will display here once you load an image and click "Extract Text".
                           </p>
                        </div>
                     )}
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
                     <span>Related Media & Productivity Tools</span>
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

