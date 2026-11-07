/* eslint-disable no-unused-vars */
import React, { useState, useRef, useMemo } from 'react';
import {
   Palette,
   Upload,
   Image as ImageIcon,
   Copy,
   Download,
   Check,
   RefreshCw,
   Sparkles,
   ChevronRight,
   HelpCircle,
   Eye,
   FileCode,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

/* Convert RGB to HEX */
const rgbToHex = (r, g, b) => {
   return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
};

/* Convert RGB to HSL */
const rgbToHsl = (r, g, b) => {
   r /= 255;
   g /= 255;
   b /= 255;
   const max = Math.max(r, g, b);
   const min = Math.min(r, g, b);
   let h = 0;
   let s = 0;
   const l = (max + min) / 2;

   if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
         case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
         case g:
            h = (b - r) / d + 2;
            break;
         case b:
            h = (r - g) / d + 4;
            break;
         default:
            break;
      }
      h /= 6;
   }
   return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
};

/* Calculate luminance for WCAG contrast */
const getLuminance = (r, g, b) => {
   const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
   });
   return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const getTextColor = (r, g, b) => {
   const lum = getLuminance(r, g, b);
   return lum > 0.35 ? '#09090b' : '#fafafa';
};

const SAMPLE_IMAGES = [
   {
      name: 'Neon Cyberpunk',
      url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80',
   },
   {
      name: 'Sunset Gradient',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
   },
   {
      name: 'Minimal Nature',
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80',
   },
];

const FAQS = [
   {
      question: 'How are dominant colors extracted from the image?',
      answer:
         'The image is rendered on an in-memory HTML5 Canvas and pixels are sampled across the full dimension. Colors are grouped into quantized color clusters based on perceptual proximity, extracting the top dominant harmonious shades.',
   },
   {
      question: 'Are my uploaded images kept completely private?',
      answer:
         'Yes! All image rendering and pixel extraction execute 100% locally in your browser. Not a single byte is uploaded to any cloud server or third-party API.',
   },
   {
      question: 'Can I export the extracted palette for CSS or Tailwind?',
      answer:
         'Yes! You can copy the palette as standard CSS Variables (:root), a Tailwind CSS colors configuration object, or raw JSON with one click.',
   },
   {
      question: 'What image formats are supported?',
      answer:
         'PNG, JPG, WebP, GIF, SVG, and BMP files up to 50MB. You can also paste directly from your clipboard (Ctrl+V / Cmd+V).',
   },
];

export default function ImageColorExtractor() {
   const [imageSrc, setImageSrc] = useState(null);
   const [fileName, setFileName] = useState('');
   const [palette, setPalette] = useState([]);
   const [colorCount, setColorCount] = useState(6);
   const [toast, setToast] = useState({ visible: false, message: '' });
   const [copiedIndex, setCopiedIndex] = useState(null);
   const [isProcessing, setIsProcessing] = useState(false);

   const fileInputRef = useRef(null);

   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   // Extract colors using Canvas
   const extractColorsFromImage = (imgElement, count = 6) => {
      try {
         const canvas = document.createElement('canvas');
         const ctx = canvas.getContext('2d');
         const maxDim = 150;
         const scale = Math.min(maxDim / imgElement.naturalWidth, maxDim / imgElement.naturalHeight, 1);
         canvas.width = Math.max(1, Math.floor(imgElement.naturalWidth * scale));
         canvas.height = Math.max(1, Math.floor(imgElement.naturalHeight * scale));

         ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
         const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

         // Quantize colors into 16-step buckets
         const colorMap = {};
         for (let i = 0; i < imgData.length; i += 16) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const a = imgData[i + 3];

            if (a < 128) continue; // Skip transparency

            // Quantize
            const qr = Math.round(r / 24) * 24;
            const qg = Math.round(g / 24) * 24;
            const qb = Math.round(b / 24) * 24;
            const key = `${qr},${qg},${qb}`;

            colorMap[key] = (colorMap[key] || 0) + 1;
         }

         const sorted = Object.entries(colorMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, count * 2);

         // Deduplicate visually identical colors
         const finalPalette = [];
         for (const [key] of sorted) {
            const [r, g, b] = key.split(',').map(Number);
            const hex = rgbToHex(r, g, b);
            const isTooClose = finalPalette.some((existing) => {
               const dr = Math.abs(existing.r - r);
               const dg = Math.abs(existing.g - g);
               const db = Math.abs(existing.b - b);
               return dr + dg + db < 45;
            });

            if (!isTooClose) {
               finalPalette.push({
                  r,
                  g,
                  b,
                  hex,
                  rgb: `rgb(${r}, ${g}, ${b})`,
                  hsl: rgbToHsl(r, g, b),
                  textColor: getTextColor(r, g, b),
               });
            }
            if (finalPalette.length >= count) break;
         }

         setPalette(finalPalette);
         setIsProcessing(false);
         showToast(`Extracted ${finalPalette.length} dominant colors!`);
      } catch (err) {
         console.error('Extraction error:', err);
         setIsProcessing(false);
         showToast('Could not extract colors from this image.');
      }
   };

   const processImageURL = (url, name = 'image.png') => {
      setIsProcessing(true);
      setFileName(name);
      setImageSrc(url);

      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
         extractColorsFromImage(img, colorCount);
      };
      img.onerror = () => {
         setIsProcessing(false);
         showToast('Failed to load image.');
      };
      img.src = url;
   };

   const handleFileSelect = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
         processImageURL(event.target.result, file.name);
      };
      reader.readAsDataURL(file);
   };

   const handleCopyColor = (color, index, format = 'hex') => {
      const textToCopy = format === 'hex' ? color.hex : format === 'rgb' ? color.rgb : color.hsl;
      navigator.clipboard.writeText(textToCopy);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1800);
      trackToolCopy('color-extractor', { format });
      showToast(`Copied ${textToCopy} to clipboard!`);
   };

   const handleCopyCSS = () => {
      if (palette.length === 0) return;
      const cssVars = `:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
      navigator.clipboard.writeText(cssVars);
      trackToolCopy('color-extractor', { type: 'css-vars' });
      showToast('Copied CSS variables to clipboard!');
   };

   const handleCopyTailwind = () => {
      if (palette.length === 0) return;
      const obj = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n${palette.map((c, i) => `        palette${i + 1}: '${c.hex}',`).join('\n')}\n      }\n    }\n  }\n}`;
      navigator.clipboard.writeText(obj);
      trackToolCopy('color-extractor', { type: 'tailwind-config' });
      showToast('Copied Tailwind config to clipboard!');
   };

   const handleReset = () => {
      setImageSrc(null);
      setPalette([]);
      setFileName('');
      trackToolReset('color-extractor');
      showToast('Cleared canvas and palette.');
   };

   const relatedTools = useMemo(() => getRelatedTools('color-extractor', 3), []);

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
            title="Image Color Extractor - Extract Dominant Palette & HEX Codes | Klique"
            description="Extract dominant color palettes, HEX, RGB, and HSL codes from any photo or design client-side. Export directly to CSS variables or Tailwind config with zero cloud uploads."
            keywords="image color extractor, extract palette from image, photo hex code picker, dominant colors finder, css palette generator from image, klique"
            canonicalUrl="https://klique.netlify.app/tools/color-extractor"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'Image Color Extractor',
               applicationCategory: 'DesignApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Extract beautiful dominant color palettes, HEX codes, and CSS color swatches directly from images in your browser.',
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
                     <Palette size={14} className="text-[#daf4aa]" />
                     <span>Media & Design Suite</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                     Image Color Extractor
                  </h1>
                  <p className="mt-1 text-sm text-zinc-400">
                     Extract dominant palettes, HEX, RGB, and HSL color values from any photo. Export to CSS variables or Tailwind.
                  </p>
               </motion.div>

               {/* Quick Sample Photos */}
               <div className="flex flex-wrap items-center gap-1.5 rounded-full backdrop-blur-xl py-1">
                  {SAMPLE_IMAGES.map((s, idx) => (
                     <button
                        key={idx}
                        onClick={() => processImageURL(s.url, `${s.name}.jpg`)}
                        className="px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-all cursor-pointer">
                        {s.name}
                     </button>
                  ))}
               </div>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
               <Link to="/" className="hover:text-zinc-300 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category/image-pdf" className="hover:text-zinc-300 transition-colors">Image & PDF</Link>
               <span>/</span>
               <span className="text-zinc-300">Color Extractor</span>
            </div>

            {/* Main Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">
               {/* Upload Box & Image Preview */}
               <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl space-y-4">
                     <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                        <span className="text-sm font-semibold text-white flex items-center gap-2">
                           <ImageIcon size={15} className="text-[#daf4aa]" />
                           Source Image
                        </span>
                        {imageSrc && (
                           <button
                              onClick={handleReset}
                              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                              Clear Image
                           </button>
                        )}
                     </div>

                     {/* Dropzone */}
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
                           <div className="w-12 h-12 rounded-xl bg-zinc-800/80 group-hover:bg-zinc-800 text-[#daf4aa] flex items-center justify-center mx-auto transition-colors">
                              <Upload size={22} />
                           </div>
                           <div className="space-y-1">
                              <div className="text-xs font-semibold text-zinc-200">
                                 Click to browse or drop image here
                              </div>
                              <div className="text-[11px] text-zinc-500">
                                 Supports PNG, JPG, WebP up to 50MB
                              </div>
                           </div>
                        </div>
                     ) : (
                        <div className="space-y-3">
                           <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/80 max-h-[280px] flex items-center justify-center">
                              <img
                                 src={imageSrc}
                                 alt="Source preview"
                                 className="max-h-[280px] w-auto object-contain rounded-lg"
                              />
                           </div>
                           <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                              <span className="truncate max-w-[200px]">{fileName}</span>
                              <button
                                 onClick={() => fileInputRef.current?.click()}
                                 className="text-[#daf4aa] hover:underline font-medium">
                                 Change Image
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Extracted Swatches & Export Options */}
               <div className="lg:col-span-7 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                     <div>
                        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                           <Palette size={16} className="text-[#daf4aa]" />
                           Extracted Color Palette
                        </h2>
                        <p className="text-xs text-zinc-400 mt-0.5">
                           Click any color chip to copy its HEX or RGB code
                        </p>
                     </div>
                     {palette.length > 0 && (
                        <div className="flex items-center gap-2">
                           <button
                              onClick={handleCopyCSS}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer">
                              <FileCode size={13} />
                              <span>CSS Vars</span>
                           </button>
                           <button
                              onClick={handleCopyTailwind}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer">
                              <Copy size={13} />
                              <span>Tailwind</span>
                           </button>
                        </div>
                     )}
                  </div>

                  {/* Swatches Grid */}
                  {palette.length === 0 ? (
                     <div className="py-16 text-center space-y-3">
                        <Palette size={36} className="mx-auto text-zinc-600 animate-bounce" />
                        <div className="text-xs text-zinc-400 font-medium">
                           Upload an image to discover its dominant color palette
                        </div>
                        <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                           Colors will be quantized and extracted with HEX, RGB, HSL, and text contrast previews.
                        </p>
                     </div>
                  ) : (
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                           {palette.map((color, idx) => (
                              <motion.div
                                 key={idx}
                                 initial={{ opacity: 0, scale: 0.9 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 transition={{ delay: idx * 0.05 }}
                                 className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 space-y-2 hover:border-zinc-700 transition-all">
                                 {/* Swatch Pill */}
                                 <div
                                    className="h-16 w-full rounded-lg shadow-inner flex items-center justify-center font-mono font-bold text-xs transition-transform hover:scale-[1.02] cursor-pointer"
                                    style={{
                                       backgroundColor: color.hex,
                                       color: color.textColor,
                                    }}
                                    onClick={() => handleCopyColor(color, idx, 'hex')}>
                                    {copiedIndex === idx ? 'COPIED!' : color.hex}
                                 </div>

                                 {/* Color Details */}
                                 <div className="space-y-1">
                                    <div className="flex items-center justify-between text-[11px] font-mono">
                                       <span className="text-zinc-400">HEX</span>
                                       <button
                                          onClick={() => handleCopyColor(color, idx, 'hex')}
                                          className="text-zinc-200 hover:text-[#daf4aa] font-semibold cursor-pointer">
                                          {color.hex}
                                       </button>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-mono">
                                       <span className="text-zinc-400">RGB</span>
                                       <button
                                          onClick={() => handleCopyColor(color, idx, 'rgb')}
                                          className="text-zinc-300 hover:text-[#daf4aa] cursor-pointer">
                                          {color.r}, {color.g}, {color.b}
                                       </button>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-mono">
                                       <span className="text-zinc-400">HSL</span>
                                       <span className="text-zinc-400 text-[10px]">{color.hsl}</span>
                                    </div>
                                 </div>
                              </motion.div>
                           ))}
                        </div>
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

