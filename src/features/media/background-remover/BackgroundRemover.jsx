/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
   Scissors,
   Upload,
   Download,
   Sparkles,
   ChevronRight,
   HelpCircle,
   Eye,
   RotateCcw,
   Sliders,
   Image as ImageIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

const FAQS = [
   {
      question: 'How does in-browser background removal work?',
      answer:
         'Our tool processes image pixels on an HTML5 Canvas, sampling background corner pixels and applying color delta thresholding to remove solid, studio, white, or green screen backdrops instantly without server uploads.',
   },
   {
      question: 'Are my personal images uploaded to any cloud server?',
      answer:
         'Never! All pixel transformations and alpha channel calculations occur strictly in your local device memory.',
   },
   {
      question: 'Can I adjust the sensitivity / tolerance threshold?',
      answer:
         'Yes! Use the Tolerance slider to fine-tune edge sensitivity, and Feathering to soften the contour edges.',
   },
   {
      question: 'What output format is generated?',
      answer:
         'The image is exported as a transparent 32-bit PNG file suitable for graphic design, e-commerce product listings, and thumbnails.',
   },
];

export default function BackgroundRemover() {
   const [imageSrc, setImageSrc] = useState(null);
   const [tolerance, setTolerance] = useState(30);
   const [feather, setFeather] = useState(1);
   const [bgColorToKey, setBgColorToKey] = useState('#ffffff');
   const [toast, setToast] = useState({ visible: false, message: '' });
   const [isProcessing, setIsProcessing] = useState(false);

   const fileInputRef = useRef(null);
   const originalCanvasRef = useRef(null);
   const outputCanvasRef = useRef(null);
   const [imgObj, setImgObj] = useState(null);

   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   // Process removal
   const processRemoval = () => {
      if (!imgObj || !outputCanvasRef.current) return;

      const canvas = outputCanvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = imgObj.naturalWidth;
      canvas.height = imgObj.naturalHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imgObj, 0, 0);

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Parse target hex
      const targetR = parseInt(bgColorToKey.slice(1, 3), 16) || 255;
      const targetG = parseInt(bgColorToKey.slice(3, 5), 16) || 255;
      const targetB = parseInt(bgColorToKey.slice(5, 7), 16) || 255;

      const tolSq = tolerance * tolerance * 3;

      for (let i = 0; i < data.length; i += 4) {
         const r = data[i];
         const g = data[i + 1];
         const b = data[i + 2];

         const dr = r - targetR;
         const dg = g - targetG;
         const db = b - targetB;
         const distSq = dr * dr + dg * dg + db * db;

         if (distSq < tolSq) {
            // Smooth edge transition
            const ratio = distSq / tolSq;
            data[i + 3] = Math.round(ratio * 255 * (feather / 10));
         }
      }

      ctx.putImageData(imgData, 0, 0);
      setIsProcessing(false);
   };

   useEffect(() => {
      if (imgObj) {
         processRemoval();
      }
   }, [imgObj, tolerance, feather, bgColorToKey]);

   const handleFileSelect = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
         setImageSrc(event.target.result);
         const img = new Image();
         img.onload = () => {
            setImgObj(img);
            // Sample top-left corner as default bg color
            const temp = document.createElement('canvas');
            temp.width = 1;
            temp.height = 1;
            const tCtx = temp.getContext('2d');
            tCtx.drawImage(img, 0, 0, 1, 1);
            const p = tCtx.getImageData(0, 0, 1, 1).data;
            const hex = '#' + [p[0], p[1], p[2]].map((x) => x.toString(16).padStart(2, '0')).join('');
            setBgColorToKey(hex);
            showToast('Loaded photo! Auto-detected background color.');
         };
         img.src = event.target.result;
      };
      reader.readAsDataURL(file);
   };

   const handleDownloadPNG = () => {
      if (!outputCanvasRef.current) return;
      const url = outputCanvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `klique-removed-bg-${Date.now()}.png`;
      a.click();

      trackToolDownload('background-remover', { fileType: 'png' });
      showToast('Downloaded transparent PNG!');
   };

   const handleReset = () => {
      setImageSrc(null);
      setImgObj(null);
      setTolerance(30);
      setBgColorToKey('#ffffff');
      trackToolReset('background-remover');
      showToast('Cleared image.');
   };

   const relatedTools = useMemo(() => getRelatedTools('background-remover', 3), []);

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
            title="Image Background Remover - Remove Backgrounds Free Online | Klique"
            description="Remove solid, studio, white, and green screen image backgrounds client-side in your browser. Download transparent PNGs with zero server uploads."
            keywords="background remover, remove bg free, transparent png maker, chroma key online, cutout photo, klique"
            canonicalUrl="https://klique.netlify.app/tools/background-remover"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'Image Background Remover',
               applicationCategory: 'MultimediaApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Remove photo backgrounds and isolate objects in your browser with zero server transmission.',
            }}
         />

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

         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-xs text-zinc-400">
               <Link to="/" className="hover:text-zinc-200 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category" className="hover:text-zinc-200 transition-colors">Media & Design</Link>
               <span>/</span>
               <span className="text-[#daf4aa]">Background Remover</span>
            </div>

            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:items-center">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#daf4aa]/30 bg-[#daf4aa]/10 text-[#daf4aa] text-xs font-medium tracking-wide mb-3">
                     <Scissors size={13} className="text-[#daf4aa]" />
                     <span>IMAGE & MEDIA SUITE</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                     Background <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#daf4aa] via-lime-300 to-emerald-400">Remover</span>
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                     Isolate objects and remove white, studio, or green-screen backgrounds instantly in your browser with transparent PNG export.
                  </p>
               </div>
               <div className="flex items-center gap-2">
                  {imageSrc && (
                     <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 text-xs text-zinc-400 hover:text-zinc-200 transition-all">
                        <RotateCcw size={13} />
                        <span>Clear Image</span>
                     </button>
                  )}
               </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
               {/* Controls Column */}
               <div className="lg:col-span-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                     <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Sliders size={16} className="text-[#daf4aa]" />
                        Chroma & Edge Settings
                     </h2>
                  </div>

                  {/* Upload Box */}
                  <input
                     type="file"
                     ref={fileInputRef}
                     onChange={handleFileSelect}
                     accept="image/*"
                     className="hidden"
                  />
                  {!imageSrc ? (
                     <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-zinc-700/80 hover:border-[#daf4aa]/60 bg-zinc-950/50 hover:bg-zinc-950/80 rounded-xl p-8 text-center cursor-pointer transition-all space-y-3 group">
                        <div className="w-12 h-12 rounded-xl bg-[#daf4aa]/10 group-hover:bg-[#daf4aa]/20 text-[#daf4aa] flex items-center justify-center mx-auto transition-colors">
                           <Upload size={22} />
                        </div>
                        <div className="space-y-1">
                           <div className="text-sm font-medium text-zinc-200">
                              Upload image to remove background
                           </div>
                           <div className="text-xs text-zinc-500">
                              Works best with solid, white, or studio backdrops
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="space-y-4">
                        {/* Target Background Color */}
                        <div className="space-y-1.5">
                           <label className="text-xs font-medium text-zinc-300 flex justify-between">
                              <span>Target Background Color</span>
                              <span className="font-mono text-[#daf4aa]">{bgColorToKey}</span>
                           </label>
                           <div className="flex items-center gap-3">
                              <input
                                 type="color"
                                 value={bgColorToKey}
                                 onChange={(e) => setBgColorToKey(e.target.value)}
                                 className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-zinc-700"
                              />
                              <input
                                 type="text"
                                 value={bgColorToKey}
                                 onChange={(e) => setBgColorToKey(e.target.value)}
                                 className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                              />
                           </div>
                        </div>

                        {/* Tolerance Slider */}
                        <div className="space-y-1.5">
                           <div className="flex justify-between items-center text-xs">
                              <span className="font-medium text-zinc-300">Tolerance Sensitivity</span>
                              <span className="font-mono text-[#daf4aa]">{tolerance}%</span>
                           </div>
                           <input
                              type="range"
                              min="5"
                              max="90"
                              value={tolerance}
                              onChange={(e) => setTolerance(Number(e.target.value))}
                              className="w-full accent-[#daf4aa] cursor-pointer"
                           />
                        </div>

                        {/* Feathering Slider */}
                        <div className="space-y-1.5">
                           <div className="flex justify-between items-center text-xs">
                              <span className="font-medium text-zinc-300">Edge Feathering</span>
                              <span className="font-mono text-[#daf4aa]">{feather}px</span>
                           </div>
                           <input
                              type="range"
                              min="0"
                              max="10"
                              value={feather}
                              onChange={(e) => setFeather(Number(e.target.value))}
                              className="w-full accent-[#daf4aa] cursor-pointer"
                           />
                        </div>

                        <button
                           onClick={() => fileInputRef.current?.click()}
                           className="w-full py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer">
                           Change Image
                        </button>
                     </div>
                  )}
               </div>

               {/* Right Column: Output Canvas Preview with Checkered Transparency */}
               <div className="lg:col-span-7 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                     <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Eye size={16} className="text-[#daf4aa]" />
                        Transparent PNG Preview
                     </h2>
                     {imgObj && (
                        <button
                           onClick={handleDownloadPNG}
                           className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] text-zinc-950 font-bold text-xs shadow-[0_0_15px_rgba(218,244,170,0.3)] transition-all cursor-pointer">
                           <Download size={14} />
                           <span>Download PNG</span>
                        </button>
                     )}
                  </div>

                  {/* Canvas Area with Checkered Background */}
                  <div className="min-h-[340px] max-h-[460px] flex items-center justify-center rounded-xl overflow-hidden border border-zinc-800 bg-[linear-gradient(45deg,#18181b_25%,transparent_25%),linear-gradient(-45deg,#18181b_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#18181b_75%),linear-gradient(-45deg,transparent_75%,#18181b_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] bg-zinc-950 p-4">
                     <canvas
                        ref={outputCanvasRef}
                        className={`max-w-full max-h-[420px] object-contain rounded-lg shadow-2xl ${
                           !imgObj ? 'hidden' : 'block'
                        }`}
                     />
                     {!imgObj && (
                        <div className="text-center space-y-2 text-zinc-500">
                           <ImageIcon size={36} className="mx-auto text-zinc-600 animate-bounce" />
                           <div className="text-xs">No image loaded yet</div>
                        </div>
                     )}
                  </div>

                  <div className="pt-2 text-[11px] text-zinc-500 flex justify-between items-center border-t border-zinc-800/80">
                     <span>Processed 100% locally on Canvas</span>
                     <span>32-bit RGBA Transparent PNG</span>
                  </div>
               </div>
            </div>

            {/* FAQs Accordion */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-4 mb-8">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle size={18} className="text-[#daf4aa]" />
                  Frequently Asked Questions
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FAQS.map((faq, i) => (
                     <div key={i} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50 space-y-1.5">
                        <h4 className="text-sm font-semibold text-zinc-200">{faq.question}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">{faq.answer}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
               <div className="border-t border-zinc-800/80 pt-8 space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-base font-semibold text-white">Related Tools</h3>
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

