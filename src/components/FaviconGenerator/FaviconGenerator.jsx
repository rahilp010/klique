/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
   Sparkles,
   Upload,
   Download,
   Copy,
   Check,
   Layers,
   Smartphone,
   Globe,
   FileCode,
   Sliders,
   Image as ImageIcon,
   Smile,
   Type,
   Trash2,
   CheckCircle2,
   AlertCircle,
   RefreshCw,
   ExternalLink,
   Monitor,
   Package,
   Braces,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import Navbar from '../Navbar';
import SEO from '../SEO';

const SIZES = [
   { name: 'favicon-16x16.png', size: 16, label: 'Browser Tab (16×16)' },
   { name: 'favicon-32x32.png', size: 32, label: 'Standard Desktop (32×32)' },
   { name: 'favicon-48x48.png', size: 48, label: 'High-DPI Bookmark (48×48)' },
   {
      name: 'apple-touch-icon.png',
      size: 180,
      label: 'Apple iOS Home (180×180)',
   },
   {
      name: 'android-chrome-192x192.png',
      size: 192,
      label: 'Android PWA Icon (192×192)',
   },
   {
      name: 'android-chrome-512x512.png',
      size: 512,
      label: 'Splash / PWA Store (512×512)',
   },
   { name: 'mstile-150x150.png', size: 150, label: 'Windows Tile (150×150)' },
];

const PRESET_EMOJIS = [
   '🚀',
   '⚡',
   '✨',
   '🔥',
   '💎',
   '🎨',
   '💻',
   '💡',
   '🌟',
   '🦄',
   '🍀',
   '🎯',
];

export default function FaviconGenerator() {
   const [mode, setMode] = useState('image'); // 'image' | 'emoji'
   const [uploadedImage, setUploadedImage] = useState(null);
   const [emoji, setEmoji] = useState('🚀');
   const [bgColor, setBgColor] = useState('#09090b');
   const [fgColor, setFgColor] = useState('#ffffff');
   const [shape, setShape] = useState('squircle'); // 'circle', 'square', 'squircle'
   const [paddingPercent, setPaddingPercent] = useState(12); // padding inside icon
   const [appName, setAppName] = useState('My Awesome App');
   const [appShortName, setAppShortName] = useState('AwesomeApp');
   const [themeColor, setThemeColor] = useState('#daf4aa');
   const [generatedBlobs, setGeneratedBlobs] = useState({});
   const [isGenerating, setIsGenerating] = useState(false);

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

   // Render master canvas at 512x512
   const renderMasterIcon = async (targetSize = 512) => {
      const canvas = document.createElement('canvas');
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');

      // Clear & set background shape
      ctx.clearRect(0, 0, targetSize, targetSize);

      ctx.save();
      ctx.beginPath();
      if (shape === 'circle') {
         ctx.arc(
            targetSize / 2,
            targetSize / 2,
            targetSize / 2,
            0,
            Math.PI * 2,
         );
      } else if (shape === 'squircle') {
         const radius = targetSize * 0.22;
         ctx.roundRect(0, 0, targetSize, targetSize, radius);
      } else {
         ctx.rect(0, 0, targetSize, targetSize);
      }
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.clip();

      if (mode === 'image' && uploadedImage) {
         const img = new Image();
         img.crossOrigin = 'anonymous';
         img.src = uploadedImage;
         await new Promise((res, rej) => {
            img.onload = res;
            img.onerror = rej;
         });
         const pad = targetSize * (paddingPercent / 100);
         ctx.drawImage(
            img,
            pad,
            pad,
            targetSize - pad * 2,
            targetSize - pad * 2,
         );
      } else {
         // Emoji / Monogram mode
         const fontSize = Math.floor(targetSize * 0.65);
         ctx.font = `${fontSize}px sans-serif`;
         ctx.textAlign = 'center';
         ctx.textBaseline = 'middle';
         ctx.fillText(
            emoji,
            targetSize / 2,
            targetSize / 2 + targetSize * 0.05,
         );
      }
      ctx.restore();
      return canvas;
   };

   // Generate all resolution blobs and DataURLs
   const generateAllIcons = async () => {
      setIsGenerating(true);
      try {
         const blobs = {};
         for (const s of SIZES) {
            const canvas = await renderMasterIcon(s.size);
            const dataUrl = canvas.toDataURL('image/png');
            const blob = await new Promise((res) =>
               canvas.toBlob(res, 'image/png'),
            );
            blobs[s.name] = { dataUrl, blob, size: s.size, label: s.label };
         }

         // Generate master 32x32 for preview
         const previewCanvas = await renderMasterIcon(128);
         blobs['preview'] = { dataUrl: previewCanvas.toDataURL('image/png') };

         setGeneratedBlobs(blobs);
      } catch (err) {
         console.error('Failed to generate favicon suite:', err);
      } finally {
         setIsGenerating(false);
      }
   };

   useEffect(() => {
      generateAllIcons();
   }, [mode, uploadedImage, emoji, bgColor, shape, paddingPercent]);

   const handleFileUpload = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
         setUploadedImage(event.target.result);
         setMode('image');
         showToast('Uploaded icon master image!');
      };
      reader.readAsDataURL(file);
   };

   // Web App Manifest JSON
   const webManifestContent = useMemo(() => {
      const manifest = {
         name: appName || 'My Application',
         short_name: appShortName || 'App',
         icons: [
            {
               src: '/android-chrome-192x192.png',
               sizes: '192x192',
               type: 'image/png',
            },
            {
               src: '/android-chrome-512x512.png',
               sizes: '512x512',
               type: 'image/png',
            },
         ],
         theme_color: themeColor,
         background_color: bgColor,
         display: 'standalone',
         start_url: '/',
      };
      return JSON.stringify(manifest, null, 2);
   }, [appName, appShortName, themeColor, bgColor]);

   // HTML Embed snippet
   const htmlSnippet = useMemo(() => {
      return `<!-- Favicon & PWA Icons generated by Klique -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${themeColor}">`;
   }, [themeColor]);

   // Download full ZIP package with JSZip
   const downloadZipPackage = async () => {
      try {
         const zip = new JSZip();

         // Add all PNG sizes
         for (const s of SIZES) {
            if (generatedBlobs[s.name]?.blob) {
               zip.file(s.name, generatedBlobs[s.name].blob);
            }
         }

         // Also add favicon.ico (fallback 32x32 png payload in zip)
         if (generatedBlobs['favicon-32x32.png']?.blob) {
            zip.file('favicon.ico', generatedBlobs['favicon-32x32.png'].blob);
         }

         // Add site.webmanifest
         zip.file('site.webmanifest', webManifestContent);

         // Add HTML snippet instructions
         zip.file('html_instructions.html', htmlSnippet);

         const zipBlob = await zip.generateAsync({ type: 'blob' });
         const link = document.createElement('a');
         link.href = URL.createObjectURL(zipBlob);
         link.download = `klique-favicon-pack-${Date.now()}.zip`;
         link.click();
         URL.revokeObjectURL(link.href);
         showToast('Downloaded Complete Favicon & Web App Manifest ZIP!');
      } catch (err) {
         console.error('Zip creation error:', err);
         showToast('Failed to create ZIP package', 'error');
      }
   };

   // Download single file
   const downloadSingleFile = (fileName) => {
      const item = generatedBlobs[fileName];
      if (!item) return;
      const link = document.createElement('a');
      link.href = item.dataUrl;
      link.download = fileName;
      link.click();
      showToast(`Downloaded ${fileName}`);
   };

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
            title="Favicon & Web App Manifest Generator - Free Online Tool | Klique"
            description="Create complete multi-resolution favicon packs, Apple touch icons, Android PWA chrome icons, and site.webmanifest files with live desktop and mobile mockups. Free online tool."
            keywords="favicon generator, web app manifest, pwa icon generator, apple touch icon, favicon zip, create favicon from image, emoji favicon generator, android chrome icons, mstile generator, webmanifest builder, klique"
            canonicalUrl="https://klique.netlify.app/favicongenerator"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'SoftwareApplication',
               name: 'Favicon & Web App Manifest Generator',
               applicationCategory: 'DeveloperApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Generate standard multi-resolution favicon packages, Apple touch icons, Android PWA icons, and web app manifests with live previews.',
               author: {
                  '@type': 'Organization',
                  name: 'Klique',
               },
               featureList: [
                  'Multi-resolution PNG generation (16x16, 32x32, 48x48, 180x180, 192x192, 512x512)',
                  'ICO format compatibility fallback',
                  'Emoji and monogram icon creation mode',
                  'Shape customization (squircle, circle, square) and padding controls',
                  'Web app manifest (site.webmanifest) customizer',
                  'Desktop browser tab live mockup',
                  'iOS and Android home screen icon previews',
                  '1-click ZIP package download',
                  'Copyable HTML meta tags snippet',
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

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col pb-28 pt-10 sm:pb-24 sm:pt-6 lg:pl-20">
            {/* Hero / Header */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center sm:text-left">
               <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                  <Braces size={14} className="text-[#daf4aa]" />

                  <span>App-Icon Suite</span>
               </div>
               <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                  Favicon & Web App Manifest Generator
               </h1>
               <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
                  Generate standard multi-resolution favicons, Apple touch
                  icons, PWA Android icons, and ready-to-copy HTML &
                  site.webmanifest configs.
               </p>
            </motion.div>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-10">
               {/* Left Column: Creator & Customizer */}
               <div className="lg:col-span-7 space-y-5">
                  {/* Mode Tabs */}
                  <div className="p-4 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                           <Sliders className="w-4 h-4 text-[#daf4aa]" />
                           1. Choose Icon Source
                        </span>
                        <div className="flex bg-[#18181b] p-1 rounded-xl border border-zinc-800">
                           <button
                              type="button"
                              onClick={() => setMode('image')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                 mode === 'image'
                                    ? 'bg-[#daf4aa] text-black shadow-sm'
                                    : 'text-zinc-400 hover:text-white'
                              }`}>
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Upload Image</span>
                           </button>
                           <button
                              type="button"
                              onClick={() => setMode('emoji')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                 mode === 'emoji'
                                    ? 'bg-[#daf4aa] text-black shadow-sm'
                                    : 'text-zinc-400 hover:text-white'
                              }`}>
                              <Smile className="w-3.5 h-3.5" />
                              <span>Emoji / Monogram</span>
                           </button>
                        </div>
                     </div>

                     {/* Upload Image Box */}
                     {mode === 'image' && (
                        <div className="space-y-3">
                           <label className="border-2 border-dashed border-zinc-700 hover:border-[#daf4aa]/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#18181b]/50 hover:bg-[#18181b]">
                              <Upload className="w-7 h-7 text-[#daf4aa] mb-2" />
                              <span className="text-xs font-medium text-zinc-200">
                                 {uploadedImage
                                    ? 'Replace master logo image'
                                    : 'Upload PNG, SVG, or JPG master image (min 512×512)'}
                              </span>
                              <input
                                 type="file"
                                 accept="image/*"
                                 onChange={handleFileUpload}
                                 className="hidden"
                              />
                           </label>
                        </div>
                     )}

                     {/* Emoji / Monogram Form */}
                     {mode === 'emoji' && (
                        <div className="space-y-3">
                           <div className="flex items-center gap-3">
                              <input
                                 type="text"
                                 value={emoji}
                                 maxLength={3}
                                 onChange={(e) => setEmoji(e.target.value)}
                                 className="w-16 h-12 text-center text-2xl bg-[#18181b] border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-[#daf4aa]/60"
                              />
                              <div className="flex flex-wrap gap-1.5 flex-1">
                                 {PRESET_EMOJIS.map((em) => (
                                    <button
                                       key={em}
                                       type="button"
                                       onClick={() => setEmoji(em)}
                                       className="w-9 h-9 rounded-xl border border-zinc-800 bg-[#18181b] hover:bg-zinc-800 flex items-center justify-center text-base hover:scale-105 transition-transform">
                                       {em}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                     )}

                     {/* Styling: Shape & Colors */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-zinc-800/60">
                        <div>
                           <label className="text-xs text-zinc-400 font-medium block mb-1.5">
                              Icon Shape
                           </label>
                           <div className="grid grid-cols-3 gap-1 bg-[#18181b] p-1 rounded-xl border border-zinc-800">
                              {['squircle', 'circle', 'square'].map((sh) => (
                                 <button
                                    key={sh}
                                    type="button"
                                    onClick={() => setShape(sh)}
                                    className={`py-1 text-[11px] font-semibold rounded-lg capitalize ${
                                       shape === sh
                                          ? 'bg-[#daf4aa] text-black font-bold'
                                          : 'text-zinc-400 hover:text-white'
                                    }`}>
                                    {sh}
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div>
                           <label className="text-xs text-zinc-400 font-medium block mb-1.5">
                              Background Color
                           </label>
                           <div className="flex items-center gap-2">
                              <input
                                 type="color"
                                 value={bgColor}
                                 onChange={(e) => setBgColor(e.target.value)}
                                 className="w-8 h-8 rounded-lg border border-zinc-700 cursor-pointer bg-transparent p-0"
                              />
                              <input
                                 type="text"
                                 value={bgColor}
                                 onChange={(e) => setBgColor(e.target.value)}
                                 className="w-24 bg-[#18181b] border border-zinc-800 rounded-lg px-2 py-1 text-xs font-mono text-zinc-200"
                              />
                           </div>
                        </div>

                        <div>
                           <div className="flex justify-between text-xs text-zinc-400 mb-1.5">
                              <span>Inner Padding</span>
                              <span className="font-mono text-zinc-300">
                                 {paddingPercent}%
                              </span>
                           </div>
                           <input
                              type="range"
                              min={0}
                              max={30}
                              step={2}
                              value={paddingPercent}
                              onChange={(e) =>
                                 setPaddingPercent(Number(e.target.value))
                              }
                              className="w-full accent-[#daf4aa] h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer mt-2"
                           />
                        </div>
                     </div>
                  </div>

                  {/* Manifest & PWA Configuration */}
                  <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-4">
                     <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-[#daf4aa]" />
                        2. Web App Manifest Details
                     </h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                           <label className="text-xs text-zinc-400 font-medium">
                              App Name
                           </label>
                           <input
                              type="text"
                              value={appName}
                              onChange={(e) => setAppName(e.target.value)}
                              placeholder="My Application"
                              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#daf4aa]/60 mt-1"
                           />
                        </div>
                        <div>
                           <label className="text-xs text-zinc-400 font-medium">
                              Short Name
                           </label>
                           <input
                              type="text"
                              value={appShortName}
                              onChange={(e) => setAppShortName(e.target.value)}
                              placeholder="App"
                              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#daf4aa]/60 mt-1"
                           />
                        </div>
                     </div>

                     <div>
                        <label className="text-xs text-zinc-400 font-medium">
                           Theme Color (Mobile browser header)
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                           <input
                              type="color"
                              value={themeColor}
                              onChange={(e) => setThemeColor(e.target.value)}
                              className="w-8 h-8 rounded-lg border border-zinc-700 cursor-pointer bg-transparent p-0"
                           />
                           <input
                              type="text"
                              value={themeColor}
                              onChange={(e) => setThemeColor(e.target.value)}
                              className="w-28 bg-[#18181b] border border-zinc-800 rounded-lg px-2 py-1.5 text-xs font-mono text-zinc-200"
                           />
                        </div>
                     </div>
                  </div>

                  {/* HTML Embed Code Snippet */}
                  <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-3">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                           <Globe className="w-4 h-4 text-[#daf4aa]" />
                           HTML Header Snippet
                        </span>
                        <button
                           type="button"
                           onClick={() => {
                              navigator.clipboard.writeText(htmlSnippet);
                              showToast('Copied HTML tags to clipboard!');
                           }}
                           className="flex items-center gap-1 text-xs text-[#daf4aa] hover:underline font-medium">
                           <Copy className="w-3.5 h-3.5" />
                           <span>Copy Code</span>
                        </button>
                     </div>
                     <pre className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed customScrollbar">
                        {htmlSnippet}
                     </pre>
                  </div>
               </div>

               {/* Right Column: Live Mockups & Download Hub */}
               <div className="lg:col-span-5 space-y-5">
                  {/* Master Download Box */}
                  <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0f0f11] backdrop-blur-xl shadow-2xl flex flex-col items-center text-center space-y-4">
                     <div className="w-24 h-24 rounded-2xl p-2 border border-zinc-700/80 bg-zinc-900 shadow-xl flex items-center justify-center overflow-hidden">
                        {generatedBlobs['preview']?.dataUrl ? (
                           <img
                              src={generatedBlobs['preview'].dataUrl}
                              alt="Master Icon Preview"
                              className="w-full h-full object-contain"
                           />
                        ) : (
                           <Package className="w-10 h-10 text-zinc-600 animate-pulse" />
                        )}
                     </div>

                     <div>
                        <h2 className="text-base font-bold text-white">
                           Favicon & PWA Suite Ready
                        </h2>
                        <p className="text-xs text-zinc-400 mt-0.5">
                           Includes 7 multi-resolution PNGs, ICO fallback, and
                           site.webmanifest
                        </p>
                     </div>

                     <button
                        type="button"
                        onClick={downloadZipPackage}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#daf4aa] hover:bg-[#cbe699] text-[#16161b] font-bold text-sm transition-all shadow-lg shadow-[#daf4aa]/15">
                        <Download className="w-4 h-4" />
                        <span>Download Complete ZIP Package</span>
                     </button>
                  </div>

                  {/* REALISTIC MOCKUPS */}
                  {/* Mockup 1: Browser Tab */}
                  <div className="p-4 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-2.5">
                     <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-[#daf4aa]" />
                        Desktop Browser Tab Mockup
                     </span>
                     <div className="rounded-xl border border-zinc-800 bg-[#18181b] p-2 flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-[#27272a] px-3 py-1.5 rounded-lg max-w-[220px]">
                           {generatedBlobs['favicon-16x16.png']?.dataUrl && (
                              <img
                                 src={
                                    generatedBlobs['favicon-16x16.png'].dataUrl
                                 }
                                 alt="Tab Favicon"
                                 className="w-4 h-4 rounded-sm"
                              />
                           )}
                           <span className="text-xs text-zinc-200 truncate font-medium">
                              {appName || 'Home - Klique'}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Mockup 2: Mobile Home Screen App Icon */}
                  <div className="p-4 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-2.5">
                     <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-[#daf4aa]" />
                        Mobile Home Screen Preview
                     </span>
                     <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-black p-4 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-1.5">
                           <div className="w-14 h-14 rounded-2xl shadow-xl overflow-hidden border border-white/10">
                              {generatedBlobs['apple-touch-icon.png']
                                 ?.dataUrl && (
                                 <img
                                    src={
                                       generatedBlobs['apple-touch-icon.png']
                                          .dataUrl
                                    }
                                    alt="App Icon"
                                    className="w-full h-full object-contain"
                                 />
                              )}
                           </div>
                           <span className="text-[11px] text-zinc-300 font-medium">
                              {appShortName || 'App'}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* List of Individual Files for Download */}
                  <div className="p-4 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-2">
                     <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                        Individual Files
                     </span>
                     <div className="space-y-1.5 max-h-48 overflow-y-auto customScrollbar pr-1">
                        {SIZES.map((s) => (
                           <div
                              key={s.name}
                              className="flex items-center justify-between p-2 rounded-xl bg-[#18181b] border border-zinc-800/80 text-xs">
                              <div className="flex items-center gap-2">
                                 {generatedBlobs[s.name]?.dataUrl && (
                                    <img
                                       src={generatedBlobs[s.name].dataUrl}
                                       alt={s.name}
                                       className="w-5 h-5 rounded object-contain bg-black/40"
                                    />
                                 )}
                                 <span className="text-zinc-300 font-mono text-[11px]">
                                    {s.name}
                                 </span>
                              </div>
                              <button
                                 type="button"
                                 onClick={() => downloadSingleFile(s.name)}
                                 className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded">
                                 <Download className="w-3.5 h-3.5" />
                              </button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
}
