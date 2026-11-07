/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
   Code2,
   Play,
   Download,
   Copy,
   Check,
   RotateCcw,
   Sparkles,
   ChevronRight,
   HelpCircle,
   Eye,
   FileCode,
   Layers,
   Terminal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

const TEMPLATES = [
   {
      id: 'counter',
      name: 'Interactive Counter',
      html: `<div class="card">
  <h1>Interactive Counter</h1>
  <div class="count-display" id="counter">0</div>
  <div class="btn-group">
    <button onclick="decrement()">- Decrease</button>
    <button class="primary" onclick="increment()">+ Increase</button>
  </div>
</div>`,
      css: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
  background: #09090b;
  color: #f4f4f5;
}
.card {
  background: #18181b;
  border: 1px solid #27272a;
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}
h1 { font-size: 20px; margin-bottom: 24px; color: #a1a1aa; }
.count-display { font-size: 64px; font-weight: 800; font-family: monospace; color: #f59e0b; margin-bottom: 24px; }
.btn-group { display: flex; gap: 12px; justify-content: center; }
button {
  background: #27272a;
  color: #fff;
  border: 1px solid #3f3f46;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
button:hover { background: #3f3f46; }
button.primary { background: #f59e0b; color: #09090b; border: none; }
button.primary:hover { background: #d97706; }`,
      js: `let count = 0;
const display = document.getElementById('counter');

function increment() {
  count++;
  display.innerText = count;
}

function decrement() {
  count--;
  display.innerText = count;
}`,
   },
   {
      id: 'gradient',
      name: 'Glow Card Animation',
      html: `<div class="glow-box">
  <h2>Cyberpunk Glassmorphism</h2>
  <p>Isolated sandboxed HTML5/CSS3 canvas preview rendering client-side with zero latency.</p>
</div>`,
      css: `body {
  background: #09090b;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  margin: 0;
  font-family: system-ui, sans-serif;
}
.glow-box {
  background: rgba(24, 24, 27, 0.7);
  border: 1px solid rgba(245, 158, 11, 0.3);
  backdrop-filter: blur(12px);
  padding: 40px;
  border-radius: 20px;
  max-width: 360px;
  text-align: center;
  box-shadow: 0 0 40px rgba(245, 158, 11, 0.15);
  color: white;
}
h2 { color: #f59e0b; margin-top: 0; }
p { color: #a1a1aa; font-size: 14px; line-height: 1.6; }`,
      js: `console.log("Playground initialized safely in sandboxed iframe!");`,
   },
];

const FAQS = [
   {
      question: 'How is code executed safely in the playground?',
      answer:
         'User code runs inside a sandboxed HTML5 <iframe> with restricted permissions (sandbox="allow-scripts"). It cannot access the parent application DOM, cookies, local storage, or window context, ensuring zero security risk.',
   },
   {
      question: 'Does the preview update automatically?',
      answer:
         'Yes! You can toggle "Auto Run" on to render your changes live as you type, or run on-demand with the Run button.',
   },
   {
      question: 'Can I export my code as a standalone webpage?',
      answer:
         'Yes! Click "Export HTML" to download a complete, production-ready index.html bundle combining your HTML, CSS, and JS.',
   },
   {
      question: 'Is any of my code stored on a backend server?',
      answer:
         'Never. Everything is stored and rendered entirely inside your browser memory using local Blob URLs and iframes.',
   },
];

export default function CodePlayground() {
   const [htmlCode, setHtmlCode] = useState(TEMPLATES[0].html);
   const [cssCode, setCssCode] = useState(TEMPLATES[0].css);
   const [jsCode, setJsCode] = useState(TEMPLATES[0].js);

   const [activeTab, setActiveTab] = useState('html'); // 'html' | 'css' | 'js'
   const [autoRun, setAutoRun] = useState(true);
   const [copied, setCopied] = useState(false);
   const [toast, setToast] = useState({ visible: false, message: '' });

   const [srcDoc, setSrcDoc] = useState('');

   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   // Update iframe document
   const updatePreview = () => {
      const combined = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${cssCode}</style>
</head>
<body>
  ${htmlCode}
  <script>
    try {
      ${jsCode}
    } catch(err) {
      console.error(err);
    }
  </script>
</body>
</html>`;
      setSrcDoc(combined);
   };

   // Auto-run trigger
   useEffect(() => {
      if (autoRun) {
         const timer = setTimeout(() => {
            updatePreview();
         }, 400);
         return () => clearTimeout(timer);
      }
   }, [htmlCode, cssCode, jsCode, autoRun]);

   const handleLoadTemplate = (t) => {
      setHtmlCode(t.html);
      setCssCode(t.css);
      setJsCode(t.js);
      showToast(`Loaded template: ${t.name}`);
   };

   const handleCopyCombined = () => {
      const combined = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${cssCode}</style>
</head>
<body>
  ${htmlCode}
  <script>${jsCode}</script>
</body>
</html>`;
      navigator.clipboard.writeText(combined);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackToolCopy('code-playground', { length: combined.length });
      showToast('Copied standalone HTML document to clipboard!');
   };

   const handleDownloadHTML = () => {
      const combined = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Klique Code Playground Export</title>
  <style>${cssCode}</style>
</head>
<body>
  ${htmlCode}
  <script>${jsCode}</script>
</body>
</html>`;
      const blob = new Blob([combined], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `klique-playground-${Date.now()}.html`;
      a.click();
      URL.revokeObjectURL(url);

      trackToolDownload('code-playground', { fileType: 'html' });
      showToast('Downloaded index.html!');
   };

   const handleReset = () => {
      setHtmlCode(TEMPLATES[0].html);
      setCssCode(TEMPLATES[0].css);
      setJsCode(TEMPLATES[0].js);
      trackToolReset('code-playground');
      showToast('Reset playground to default template.');
   };

   const relatedTools = useMemo(() => getRelatedTools('code-playground', 3), []);

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
            title="HTML/CSS/JS Code Playground - Sandboxed Live Web Editor | Klique"
            description="Write, test, and render HTML, CSS, and JavaScript in real time with a secure sandboxed iframe preview, starter templates, and one-click HTML export."
            keywords="html playground, css js live editor, code sandbox online, client side code runner, web playground free, klique"
            canonicalUrl="https://klique.netlify.app/tools/code-playground"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'HTML/CSS/JS Code Playground',
               applicationCategory: 'DeveloperApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Sandboxed HTML, CSS, and JavaScript live code editor and instant renderer without backend dependencies.',
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
               <Link to="/category" className="hover:text-zinc-200 transition-colors">Developer & Code</Link>
               <span>/</span>
               <span className="text-[#daf4aa]">Code Playground</span>
            </div>

            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:items-center">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#daf4aa]/30 bg-[#daf4aa]/10 text-[#daf4aa] text-xs font-medium tracking-wide mb-3">
                     <Code2 size={13} className="text-[#daf4aa]" />
                     <span>DEVELOPER & PROTOTYPING SUITE</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                     Code <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#daf4aa] via-lime-300 to-emerald-400">Playground</span>
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                     Write HTML, CSS, and JavaScript with instantaneous sandboxed preview. Export standalone bundles with 100% client-side security.
                  </p>
               </div>
               <div className="flex items-center gap-2">
                  <button
                     onClick={handleDownloadHTML}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-medium text-zinc-200 transition-all cursor-pointer">
                     <Download size={13} />
                     <span>Export HTML</span>
                  </button>
                  <button
                     onClick={handleReset}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 text-xs text-zinc-400 hover:text-zinc-200 transition-all">
                     <RotateCcw size={13} />
                     <span>Reset</span>
                  </button>
               </div>
            </div>

            {/* Templates Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
               <span className="text-xs text-zinc-500 font-medium">Starter Templates:</span>
               {TEMPLATES.map((t) => (
                  <button
                     key={t.id}
                     onClick={() => handleLoadTemplate(t)}
                     className="px-3 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:border-[#daf4aa]/40 hover:text-[#daf4aa] text-xs text-zinc-300 transition-all cursor-pointer">
                     {t.name}
                  </button>
               ))}
            </div>

            {/* Split Arena: Editor Left, Sandboxed Iframe Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-8">
               {/* Left Column: Code Editor */}
               <div className="lg:col-span-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
                  {/* Tabs & Controls Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                     <div className="flex items-center gap-1 p-1 bg-zinc-950/80 rounded-xl border border-zinc-800">
                        {['html', 'css', 'js'].map((tab) => (
                           <button
                              key={tab}
                              onClick={() => setActiveTab(tab)}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase transition-all ${
                                 activeTab === tab
                                    ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                                    : 'text-zinc-400 hover:text-zinc-200'
                              }`}>
                              {tab}
                           </button>
                        ))}
                     </div>

                     <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                           <input
                              type="checkbox"
                              checked={autoRun}
                              onChange={(e) => setAutoRun(e.target.checked)}
                              className="accent-[#daf4aa] rounded"
                           />
                           Auto Run
                        </label>
                        {!autoRun && (
                           <button
                              onClick={updatePreview}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#daf4aa] text-zinc-950 font-bold text-xs shadow-[0_0_15px_rgba(218,244,170,0.3)] cursor-pointer">
                              <Play size={12} fill="currentColor" />
                              <span>Run</span>
                           </button>
                        )}
                     </div>
                  </div>

                  {/* Textarea Editor Area */}
                  <div className="flex-1 min-h-[380px] relative">
                     {activeTab === 'html' && (
                        <textarea
                           value={htmlCode}
                           onChange={(e) => setHtmlCode(e.target.value)}
                           placeholder="<!-- HTML markup goes here -->"
                           className="w-full h-full min-h-[380px] bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-4 font-mono text-xs sm:text-sm text-zinc-100 leading-relaxed focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40 resize-none customScrollbar"
                           spellCheck={false}
                        />
                     )}
                     {activeTab === 'css' && (
                        <textarea
                           value={cssCode}
                           onChange={(e) => setCssCode(e.target.value)}
                           placeholder="/* CSS styling goes here */"
                           className="w-full h-full min-h-[380px] bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-4 font-mono text-xs sm:text-sm text-cyan-200/90 leading-relaxed focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40 resize-none customScrollbar"
                           spellCheck={false}
                        />
                     )}
                     {activeTab === 'js' && (
                        <textarea
                           value={jsCode}
                           onChange={(e) => setJsCode(e.target.value)}
                           placeholder="// JavaScript code goes here"
                           className="w-full h-full min-h-[380px] bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-4 font-mono text-xs sm:text-sm text-[#daf4aa] leading-relaxed focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40 resize-none customScrollbar"
                           spellCheck={false}
                        />
                     )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs">
                     <span className="text-zinc-500 font-mono">
                        Active Mode: <span className="text-zinc-300 uppercase">{activeTab}</span>
                     </span>
                     <div className="flex items-center gap-2">
                        <button
                           onClick={handleCopyCombined}
                           className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer">
                           {copied ? <Check size={13} className="text-[#daf4aa]" /> : <Copy size={13} />}
                           <span>{copied ? 'Copied' : 'Copy HTML'}</span>
                        </button>
                        <button
                           onClick={handleDownloadHTML}
                           className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer">
                           <Download size={13} />
                           <span>Export HTML</span>
                        </button>
                     </div>
                  </div>
               </div>

               {/* Right Column: Sandboxed Live Preview */}
               <div className="lg:col-span-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                     <div className="flex items-center gap-2">
                        <Eye size={16} className="text-[#daf4aa]" />
                        <h2 className="text-sm font-semibold text-white">Live Sandboxed Preview</h2>
                     </div>
                     <span className="text-[11px] font-mono text-[#daf4aa] border border-[#daf4aa]/30 bg-[#daf4aa]/10 px-2 py-0.5 rounded-md">
                        sandbox="allow-scripts"
                     </span>
                  </div>

                  {/* The Iframe */}
                  <div className="flex-1 min-h-[380px] bg-white rounded-xl overflow-hidden shadow-inner border border-zinc-800">
                     <iframe
                        title="Code Preview"
                        srcDoc={srcDoc}
                        sandbox="allow-scripts"
                        className="w-full h-full min-h-[380px] border-0"
                     />
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/80 pt-3">
                     <span>Isolated from parent window</span>
                     <span>Zero network requests</span>
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

