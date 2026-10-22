/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
   Code2,
   Download,
   Copy,
   Check,
   Sparkles,
   Sliders,
   Layers,
   RefreshCw,
   Maximize2,
   Eye,
   FileCode,
   Palette,
   CheckCircle2,
   AlertCircle,
   Share2,
   Monitor,
   Sun,
   Moon,
   Braces,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as htmlToImage from 'html-to-image';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';

import Navbar from '../Navbar';
import SEO from '../SEO';

/* -------------------------------------------------------------------------- */
/*  PRESETS & CONFIGURATIONS                                                  */
/* -------------------------------------------------------------------------- */

const LANGUAGES = [
   { id: 'javascript', label: 'JavaScript', prism: 'javascript' },
   { id: 'jsx', label: 'React JSX', prism: 'jsx' },
   { id: 'typescript', label: 'TypeScript', prism: 'typescript' },
   { id: 'tsx', label: 'React TSX', prism: 'tsx' },
   { id: 'python', label: 'Python', prism: 'python' },
   { id: 'html', label: 'HTML / Markup', prism: 'html' },
   { id: 'css', label: 'CSS', prism: 'css' },
   { id: 'json', label: 'JSON', prism: 'json' },
   { id: 'sql', label: 'SQL', prism: 'sql' },
   { id: 'rust', label: 'Rust', prism: 'rust' },
   { id: 'go', label: 'Go', prism: 'go' },
   { id: 'bash', label: 'Bash / Shell', prism: 'bash' },
];

const CODE_TEMPLATES = {
   javascript: `// Modern async pipeline with retry\nasync function fetchWithRetry(url, retries = 3) {\n  for (let attempt = 1; attempt <= retries; attempt++) {\n    try {\n      const res = await fetch(url);\n      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);\n      return await res.json();\n    } catch (err) {\n      if (attempt === retries) throw err;\n      await new Promise(r => setTimeout(r, 1000 * attempt));\n    }\n  }\n}`,
   jsx: `import React, { useState } from 'react';\nimport { motion } from 'framer-motion';\n\nexport const GlowingButton = ({ label, onClick }) => {\n  const [hovered, setHovered] = useState(false);\n  return (\n    <motion.button\n      whileHover={{ scale: 1.05 }}\n      whileTap={{ scale: 0.98 }}\n      className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-500 font-semibold text-black shadow-lg shadow-emerald-500/20"\n      onClick={onClick}\n    >\n      {label}\n    </motion.button>\n  );\n};`,
   python: `@dataclass\nclass VectorSearch:\n    dimension: int = 1536\n    similarity_metric: str = "cosine"\n    \n    def query(self, embedding: list[float], top_k: int = 5) -> list[dict]:\n        """Return top-K nearest neighbors"""\n        scores = self.calculate_similarity(embedding)\n        ranked = sorted(scores, key=lambda x: x["score"], reverse=True)\n        return ranked[:top_k]`,
   sql: `WITH ranked_orders AS (\n  SELECT \n    customer_id,\n    amount,\n    created_at,\n    ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) as rank\n  FROM transactions\n  WHERE status = 'completed'\n)\nSELECT customer_id, amount, created_at \nFROM ranked_orders \nWHERE rank = 1\nLIMIT 100;`,
   rust: `pub fn calculate_hash<T: Hash>(t: &T) -> u64 {\n    let mut s = DefaultHasher::new();\n    t.hash(&mut s);\n    s.finish()\n}\n\nfn main() {\n    let token = "klique-secret-key-2026";\n    let hash = calculate_hash(&token);\n    println!("Secure hash digest: {:x}", hash);\n}`,
};

const THEMES = [
   {
      id: 'midnight',
      label: 'Midnight Dark',
      bg: '#0c0d12',
      editorBg: '#12141c',
      textColor: '#e2e8f0',
      border: 'rgba(255, 255, 255, 0.08)',
      headerBg: '#0e1017',
      comment: '#64748b',
      keyword: '#c084fc',
      string: '#34d399',
      function: '#60a5fa',
      number: '#f59e0b',
   },
   {
      id: 'dracula',
      label: 'Dracula',
      bg: '#1e1f29',
      editorBg: '#282a36',
      textColor: '#f8f8f2',
      border: 'rgba(255, 255, 255, 0.1)',
      headerBg: '#21222c',
      comment: '#6272a4',
      keyword: '#ff79c6',
      string: '#f1fa8c',
      function: '#50fa7b',
      number: '#bd93f9',
   },
   {
      id: 'one-dark',
      label: 'One Dark Pro',
      bg: '#1b1d24',
      editorBg: '#21252b',
      textColor: '#abb2bf',
      border: 'rgba(255, 255, 255, 0.08)',
      headerBg: '#1e2227',
      comment: '#5c6370',
      keyword: '#c678dd',
      string: '#98c379',
      function: '#61afef',
      number: '#d19a66',
   },
   {
      id: 'cyberpunk',
      label: 'Neon Cyber',
      bg: '#0b0c10',
      editorBg: '#10121a',
      textColor: '#f1f5f9',
      border: 'rgba(218, 244, 170, 0.2)',
      headerBg: '#090a0e',
      comment: '#6b7280',
      keyword: '#f43f5e',
      string: '#daf4aa',
      function: '#38bdf8',
      number: '#a855f7',
   },
   {
      id: 'monokai',
      label: 'Monokai Pro',
      bg: '#19181a',
      editorBg: '#221f22',
      textColor: '#fcfcfa',
      border: 'rgba(255, 255, 255, 0.08)',
      headerBg: '#1c1a1d',
      comment: '#727072',
      keyword: '#ff6188',
      string: '#ffd866',
      function: '#a9dc76',
      number: '#ab9df2',
   },
   {
      id: 'nord',
      label: 'Nord Frost',
      bg: '#242933',
      editorBg: '#2e3440',
      textColor: '#eceff4',
      border: 'rgba(255, 255, 255, 0.1)',
      headerBg: '#282e3a',
      comment: '#616e88',
      keyword: '#81a1c1',
      string: '#a3be8c',
      function: '#88c0d0',
      number: '#b48ead',
   },
];

const BACKGROUND_GRADIENTS = [
   {
      id: 'gradient-cosmic',
      label: 'Cosmic Violet',
      style: 'linear-gradient(135deg, #4338ca 0%, #7e22ce 50%, #db2777 100%)',
   },
   {
      id: 'gradient-aurora',
      label: 'Aurora Glow',
      style: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #2563eb 100%)',
   },
   {
      id: 'gradient-sunset',
      label: 'Sunset Amber',
      style: 'linear-gradient(135deg, #d97706 0%, #ea580c 50%, #e11d48 100%)',
   },
   {
      id: 'gradient-klique',
      label: 'Klique Lime',
      style: 'radial-gradient(ellipse at top, #1e293b 0%, #09090b 100%), linear-gradient(135deg, rgba(218,244,170,0.15) 0%, transparent 60%)',
      hasLimeAccent: true,
   },
   {
      id: 'gradient-midnight-slate',
      label: 'Midnight Slate',
      style: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
   },
   {
      id: 'gradient-mesh-dark',
      label: 'Mesh Cyber',
      style: 'radial-gradient(at 0% 0%, #1e1b4b 0px, transparent 50%), radial-gradient(at 100% 100%, #172554 0px, transparent 50%), #09090b',
   },
   {
      id: 'gradient-trans',
      label: 'Transparent',
      style: 'transparent',
      isTransparent: true,
   },
];

const FONTS = [
   { id: 'fira-code', label: 'Fira Code', family: '"Fira Code", monospace' },
   {
      id: 'jetbrains',
      label: 'JetBrains Mono',
      family: '"JetBrains Mono", monospace',
   },
   {
      id: 'monaco',
      label: 'Monaco / Consolas',
      family: 'Monaco, Consolas, monospace',
   },
   {
      id: 'system',
      label: 'System Mono',
      family: 'ui-monospace, SFMono-Regular, monospace',
   },
];

export default function CodeToImage() {
   const [language, setLanguage] = useState('javascript');
   const [code, setCode] = useState(CODE_TEMPLATES.javascript);
   const [themeId, setThemeId] = useState('midnight');
   const [backgroundId, setBackgroundId] = useState('gradient-cosmic');
   const [fontId, setFontId] = useState('fira-code');
   const [fontSize, setFontSize] = useState(14);
   const [padding, setPadding] = useState(48); // 16 to 80
   const [showLineNumbers, setShowLineNumbers] = useState(true);
   const [windowTitle, setWindowTitle] = useState('index.js');
   const [windowControls, setWindowControls] = useState('mac'); // 'mac', 'windows', 'none'
   const [shadowBlur, setShadowBlur] = useState(25);
   const [borderRadius, setBorderRadius] = useState(16);
   const [exportScale, setExportScale] = useState(2); // 1x, 2x, 3x (Retina)
   const [isExporting, setIsExporting] = useState(false);

   const cardRef = useRef(null);

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

   // Active Theme & Background objects
   const activeTheme = useMemo(
      () => THEMES.find((t) => t.id === themeId) || THEMES[0],
      [themeId],
   );

   const activeBg = useMemo(
      () =>
         BACKGROUND_GRADIENTS.find((b) => b.id === backgroundId) ||
         BACKGROUND_GRADIENTS[0],
      [backgroundId],
   );

   const activeFont = useMemo(
      () => FONTS.find((f) => f.id === fontId) || FONTS[0],
      [fontId],
   );

   // Prism syntax highlighting HTML
   const highlightedCode = useMemo(() => {
      const selectedLang =
         LANGUAGES.find((l) => l.id === language)?.prism || 'javascript';
      const grammar =
         Prism.languages[selectedLang] || Prism.languages.javascript;
      try {
         return Prism.highlight(code, grammar, selectedLang);
      } catch (e) {
         return code;
      }
   }, [code, language]);

   // Handle Language Template Switch
   const handleLanguageChange = (newLang) => {
      setLanguage(newLang);
      if (CODE_TEMPLATES[newLang]) {
         setCode(CODE_TEMPLATES[newLang]);
      }
      const extMap = {
         javascript: 'index.js',
         jsx: 'Component.jsx',
         typescript: 'types.ts',
         tsx: 'App.tsx',
         python: 'pipeline.py',
         html: 'index.html',
         css: 'styles.css',
         json: 'package.json',
         sql: 'query.sql',
         rust: 'main.rs',
         go: 'server.go',
         bash: 'deploy.sh',
      };
      if (extMap[newLang]) {
         setWindowTitle(extMap[newLang]);
      }
   };

   // Export to PNG with High DPI scaling
   const handleDownloadPNG = async () => {
      if (!cardRef.current) return;
      setIsExporting(true);
      try {
         const dataUrl = await htmlToImage.toPng(cardRef.current, {
            pixelRatio: exportScale,
            cacheBust: true,
         });
         const link = document.createElement('a');
         link.download = `klique-code-${Date.now()}.png`;
         link.href = dataUrl;
         link.click();
         showToast(`Saved High-Res PNG (${exportScale}x Retina)!`);
      } catch (err) {
         console.error('PNG export error:', err);
         showToast('Failed to export PNG', 'error');
      } finally {
         setIsExporting(false);
      }
   };

   // Copy Image to Clipboard
   const handleCopyImage = async () => {
      if (!cardRef.current) return;
      setIsExporting(true);
      try {
         const blob = await htmlToImage.toBlob(cardRef.current, {
            pixelRatio: exportScale,
            cacheBust: true,
         });
         if (!blob) throw new Error('Blob creation failed');
         await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
         ]);
         showToast('Copied code image directly to clipboard!');
      } catch (err) {
         console.warn(
            'Clipboard write failed, copying raw code as fallback:',
            err,
         );
         navigator.clipboard.writeText(code);
         showToast('Copied raw code to clipboard!');
      } finally {
         setIsExporting(false);
      }
   };

   // Export to SVG
   const handleDownloadSVG = async () => {
      if (!cardRef.current) return;
      setIsExporting(true);
      try {
         const dataUrl = await htmlToImage.toSvg(cardRef.current, {
            cacheBust: true,
         });
         const link = document.createElement('a');
         link.download = `klique-code-${Date.now()}.svg`;
         link.href = dataUrl;
         link.click();
         showToast('Downloaded Vector SVG image!');
      } catch (err) {
         showToast('Failed to export SVG', 'error');
      } finally {
         setIsExporting(false);
      }
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
            title="Code Snippet to Beautiful Image - Ray.so & Carbon Style Generator - Free Online Tool | Klique"
            description="Transform raw code snippets into beautiful, shareable screenshots with syntax highlighting, custom themes, mesh gradients, window controls, and retina exports. Free online tool for developers and creators."
            keywords="code to image, carbon alternative, ray.so alternative, code screenshot generator, code snippet card, code beautifier image, syntax highlighter image, developer graphics, tweet code snippet, klique"
            canonicalUrl="https://klique.netlify.app/codeimage"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'SoftwareApplication',
               name: 'Code Snippet to Image Generator',
               applicationCategory: 'DeveloperApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Transform code snippets into gorgeous screenshots with custom syntax themes, window controls, mesh gradients, and retina exports.',
               author: {
                  '@type': 'Organization',
                  name: 'Klique',
               },
               featureList: [
                  'PrismJS multi-language syntax highlighting (JS, TS, Python, Rust, Go, SQL, HTML/CSS, JSON, Shell)',
                  'Multiple designer editor themes (Midnight, Dracula, One Dark, Cyberpunk, Monokai, Nord)',
                  'Mesh, radiant, and dark gradient card backgrounds',
                  'macOS and Windows window control options',
                  'Line numbers and custom filename header',
                  'Configurable padding, font size, and drop shadow blur',
                  '1-click direct image copy to clipboard',
                  'Retina PNG export (1x, 2x, 3x) and vector SVG export',
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
            <div className="mb-8 text-center sm:text-left">
               {/* Header / Hero */}
               <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center sm:text-left mb-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                     <Braces size={14} className="text-[#daf4aa]" />

                     <span>Developer Suite</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                     Code Snippet to Image
                  </h1>
                  <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
                     Transform raw code into stunning, shareable graphics for
                     Twitter, LinkedIn, blogs, and presentations with themes,
                     gradients, and retina exports.
                  </p>
               </motion.div>

               {/* Grid Layout: Workspace Left & Controls Right */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Interactive Code Editor & Live Preview Canvas */}
                  <div className="lg:col-span-8 space-y-6">
                     {/* Action Bar (Language, File Title, Quick Copy) */}
                     <div className="p-3 rounded-2xl border border-zinc-800 bg-[#0f0f11] flex flex-wrap items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-2">
                           <select
                              value={language}
                              onChange={(e) =>
                                 handleLanguageChange(e.target.value)
                              }
                              className="bg-[#18181b] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-[#daf4aa]/60">
                              {LANGUAGES.map((lang) => (
                                 <option key={lang.id} value={lang.id}>
                                    {lang.label}
                                 </option>
                              ))}
                           </select>

                           <input
                              type="text"
                              value={windowTitle}
                              onChange={(e) => setWindowTitle(e.target.value)}
                              placeholder="filename.ext"
                              className="bg-[#18181b] border border-zinc-700/60 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 w-32 sm:w-44 focus:outline-none focus:border-[#daf4aa]/60"
                           />
                        </div>

                        <div className="flex items-center gap-2">
                           <button
                              type="button"
                              onClick={() =>
                                 setCode(CODE_TEMPLATES[language] || '')
                              }
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors">
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">
                                 Reset Code
                              </span>
                           </button>
                           <button
                              type="button"
                              onClick={handleCopyImage}
                              disabled={isExporting}
                              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#18181b] hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 hover:text-white text-xs font-medium transition-all shadow-sm">
                              <Copy className="w-3.5 h-3.5 text-[#daf4aa]" />
                              <span>Copy Image</span>
                           </button>
                           <button
                              type="button"
                              onClick={handleDownloadPNG}
                              disabled={isExporting}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#daf4aa] hover:bg-[#cbe699] text-[#16161b] text-xs font-bold transition-all shadow-md shadow-[#daf4aa]/10">
                              <Download className="w-3.5 h-3.5" />
                              <span>Download PNG</span>
                           </button>
                        </div>
                     </div>

                     {/* LIVE PREVIEW CANVAS WRAPPER */}
                     <div className="overflow-x-auto rounded-3xl border border-zinc-800/80 bg-[#09090b]/80 p-2 sm:p-4 backdrop-blur-md shadow-2xl flex items-center justify-center min-h-[420px]">
                        <div
                           ref={cardRef}
                           style={{
                              padding: `${padding}px`,
                              background: activeBg.style,
                              display: 'inline-block',
                              minWidth: '320px',
                              maxWidth: '100%',
                           }}
                           className="transition-all duration-300 select-none">
                           {/* Editor Window Container */}
                           <div
                              style={{
                                 backgroundColor: activeTheme.editorBg,
                                 borderRadius: `${borderRadius}px`,
                                 boxShadow: `0 ${shadowBlur * 0.8}px ${shadowBlur * 2}px rgba(0,0,0,0.65)`,
                                 border: `1px solid ${activeTheme.border}`,
                                 color: activeTheme.textColor,
                                 fontFamily: activeFont.family,
                              }}
                              className="overflow-hidden min-w-[280px] sm:min-w-[460px] max-w-3xl backdrop-blur-md">
                              {/* Window Titlebar */}
                              <div
                                 style={{
                                    backgroundColor: activeTheme.headerBg,
                                 }}
                                 className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                 {/* Left Controls */}
                                 <div className="flex items-center gap-2">
                                    {windowControls === 'mac' && (
                                       <div className="flex items-center gap-1.5">
                                          <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
                                          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
                                          <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-sm" />
                                       </div>
                                    )}
                                    {windowControls === 'windows' && (
                                       <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono">
                                          <span>―</span>
                                          <span>▢</span>
                                          <span>✕</span>
                                       </div>
                                    )}
                                 </div>

                                 {/* Filename Header */}
                                 {windowTitle && (
                                    <span className="text-xs font-mono font-medium opacity-70 tracking-wide">
                                       {windowTitle}
                                    </span>
                                 )}

                                 <div className="w-10 flex justify-end">
                                    <span className="text-[10px] uppercase font-mono opacity-40">
                                       {language}
                                    </span>
                                 </div>
                              </div>

                              {/* Code Body */}
                              <div
                                 style={{
                                    fontSize: `${fontSize}px`,
                                    lineHeight: '1.6',
                                 }}
                                 className="p-5 font-mono overflow-x-auto flex">
                                 {/* Line Numbers */}
                                 {showLineNumbers && (
                                    <div
                                       aria-hidden="true"
                                       style={{ color: activeTheme.comment }}
                                       className="select-none pr-4 text-right opacity-40 font-mono">
                                       {code.split('\n').map((_, i) => (
                                          <div key={i}>{i + 1}</div>
                                       ))}
                                    </div>
                                 )}

                                 {/* Highlighted Code Output */}
                                 <pre
                                    className="flex-1 font-mono m-0 p-0 bg-transparent overflow-x-visible outline-none whitespace-pre"
                                    dangerouslySetInnerHTML={{
                                       __html: highlightedCode,
                                    }}
                                 />
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Code Input Textarea for editing */}
                     <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                           <span className="flex items-center gap-2">
                              <FileCode className="w-4 h-4 text-[#daf4aa]" />
                              Code Input Editor
                           </span>
                           <span className="text-zinc-500 font-normal lowercase">
                              {code.split('\n').length} lines · {code.length}{' '}
                              chars
                           </span>
                        </div>
                        <textarea
                           value={code}
                           onChange={(e) => setCode(e.target.value)}
                           rows={8}
                           spellCheck="false"
                           className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-4 font-mono text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60 leading-relaxed customScrollbar"
                        />
                     </div>
                  </div>

                  {/* Right Column: Customization & Export Controls */}
                  <div className="lg:col-span-4 space-y-5">
                     {/* Theme Selector */}
                     <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-3 shadow-lg">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                           <Palette className="w-4 h-4 text-[#daf4aa]" />
                           Syntax & Editor Theme
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                           {THEMES.map((th) => {
                              const isSelected = themeId === th.id;
                              return (
                                 <button
                                    key={th.id}
                                    type="button"
                                    onClick={() => setThemeId(th.id)}
                                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                                       isSelected
                                          ? 'border-[#daf4aa] bg-[#daf4aa]/10 text-white shadow-sm'
                                          : 'border-zinc-800 bg-[#18181b] text-zinc-400 hover:text-white hover:bg-zinc-800'
                                    }`}>
                                    <span className="truncate">{th.label}</span>
                                    <span
                                       className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                                       style={{ backgroundColor: th.editorBg }}
                                    />
                                 </button>
                              );
                           })}
                        </div>
                     </div>

                     {/* Backdrop Gradient Selector */}
                     <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-3 shadow-lg">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                           <Sparkles className="w-4 h-4 text-[#daf4aa]" />
                           Card Background
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                           {BACKGROUND_GRADIENTS.map((bg) => {
                              const isSelected = backgroundId === bg.id;
                              return (
                                 <button
                                    key={bg.id}
                                    type="button"
                                    onClick={() => setBackgroundId(bg.id)}
                                    title={bg.label}
                                    className={`h-11 rounded-xl border relative overflow-hidden transition-all flex items-center justify-center ${
                                       isSelected
                                          ? 'ring-2 ring-[#daf4aa] ring-offset-2 ring-offset-[#0f0f11] scale-105'
                                          : 'border-zinc-700 hover:scale-102'
                                    }`}
                                    style={{ background: bg.style }}>
                                    {bg.isTransparent && (
                                       <span className="text-[10px] text-zinc-400 font-mono bg-black/60 px-1 rounded">
                                          None
                                       </span>
                                    )}
                                 </button>
                              );
                           })}
                        </div>
                     </div>

                     {/* Layout & Window Settings */}
                     <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-4 shadow-lg">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                           <Sliders className="w-4 h-4 text-[#daf4aa]" />
                           Window & Layout Options
                        </h3>

                        {/* Font Selection */}
                        <div className="space-y-1.5">
                           <label className="text-xs text-zinc-400 font-medium">
                              Monospace Font
                           </label>
                           <select
                              value={fontId}
                              onChange={(e) => setFontId(e.target.value)}
                              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#daf4aa]/60">
                              {FONTS.map((f) => (
                                 <option key={f.id} value={f.id}>
                                    {f.label}
                                 </option>
                              ))}
                           </select>
                        </div>

                        {/* Window Controls Type */}
                        <div className="space-y-1.5">
                           <label className="text-xs text-zinc-400 font-medium">
                              Window Buttons
                           </label>
                           <div className="grid grid-cols-3 gap-2">
                              {['mac', 'windows', 'none'].map((ctrl) => (
                                 <button
                                    key={ctrl}
                                    type="button"
                                    onClick={() => setWindowControls(ctrl)}
                                    className={`py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                                       windowControls === ctrl
                                          ? 'bg-[#daf4aa]/20 border-[#daf4aa]/40 text-[#daf4aa]'
                                          : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-white'
                                    }`}>
                                    {ctrl}
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Sliders: Padding, Font Size, Shadow */}
                        <div className="space-y-3 pt-2">
                           <div>
                              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                 <span>Padding</span>
                                 <span className="font-mono text-zinc-300">
                                    {padding}px
                                 </span>
                              </div>
                              <input
                                 type="range"
                                 min={16}
                                 max={80}
                                 step={8}
                                 value={padding}
                                 onChange={(e) =>
                                    setPadding(Number(e.target.value))
                                 }
                                 className="w-full accent-[#daf4aa] h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                              />
                           </div>

                           <div>
                              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                 <span>Font Size</span>
                                 <span className="font-mono text-zinc-300">
                                    {fontSize}px
                                 </span>
                              </div>
                              <input
                                 type="range"
                                 min={12}
                                 max={20}
                                 step={1}
                                 value={fontSize}
                                 onChange={(e) =>
                                    setFontSize(Number(e.target.value))
                                 }
                                 className="w-full accent-[#daf4aa] h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                              />
                           </div>

                           <div>
                              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                                 <span>Shadow Blur</span>
                                 <span className="font-mono text-zinc-300">
                                    {shadowBlur}px
                                 </span>
                              </div>
                              <input
                                 type="range"
                                 min={0}
                                 max={60}
                                 step={5}
                                 value={shadowBlur}
                                 onChange={(e) =>
                                    setShadowBlur(Number(e.target.value))
                                 }
                                 className="w-full accent-[#daf4aa] h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                              />
                           </div>
                        </div>

                        {/* Toggles */}
                        <div className="pt-2 border-t border-zinc-800 space-y-2">
                           <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                              <span>Show Line Numbers</span>
                              <input
                                 type="checkbox"
                                 checked={showLineNumbers}
                                 onChange={(e) =>
                                    setShowLineNumbers(e.target.checked)
                                 }
                                 className="rounded border-zinc-700 bg-zinc-800 text-[#daf4aa] focus:ring-[#daf4aa]"
                              />
                           </label>
                        </div>
                     </div>

                     {/* Export Resolution & Quick Actions */}
                     <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-4 shadow-xl">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
                           <span>Export Resolution</span>
                           <span className="text-[#daf4aa] font-mono text-[11px] bg-[#daf4aa]/10 px-2 py-0.5 rounded border border-[#daf4aa]/20">
                              {exportScale}x Retina
                           </span>
                        </h3>

                        <div className="grid grid-cols-3 gap-2">
                           {[
                              { scale: 1, label: '1x (Web)' },
                              { scale: 2, label: '2x (Retina)' },
                              { scale: 3, label: '3x (Ultra HD)' },
                           ].map((s) => (
                              <button
                                 key={s.scale}
                                 type="button"
                                 onClick={() => setExportScale(s.scale)}
                                 className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                                    exportScale === s.scale
                                       ? 'bg-[#daf4aa] border-[#daf4aa] text-black font-bold'
                                       : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-white'
                                 }`}>
                                 {s.label}
                              </button>
                           ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                           <button
                              type="button"
                              onClick={handleDownloadPNG}
                              disabled={isExporting}
                              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#daf4aa] hover:bg-[#cbe699] text-[#16161b] text-xs font-bold transition-all shadow-lg shadow-[#daf4aa]/10">
                              <Download className="w-4 h-4" />
                              <span>Save PNG</span>
                           </button>
                           <button
                              type="button"
                              onClick={handleDownloadSVG}
                              disabled={isExporting}
                              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700/80 transition-all">
                              <Download className="w-4 h-4 text-[#daf4aa]" />
                              <span>Save SVG</span>
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
}
