/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
   Clock,
   Lock,
   Flame,
   Copy,
   Download,
   Sparkles,
   ChevronDown,
   HelpCircle,
   Share2,
   Eye,
   EyeOff,
   KeyRound,
   Trash2,
   FileText,
   CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import {
   EXPIRATION_OPTIONS,
   formatExpiryTime,
   encryptNote,
   decryptNote,
} from '../../../lib/calculations/tempNotes';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link, useLocation } from 'react-router-dom';
import { Dropdown, Textarea, InputControl } from '../../../components/ui/CustomControl';

/* -------------------------------------------------------------------------- */
/*  FAQS                                                                      */
/* -------------------------------------------------------------------------- */

const FAQS = [
   {
      question: 'How does the self-destruction feature work?',
      answer:
         'Notes are stored with an expiration timestamp in your browser. A continuous timer tracks remaining time, and once expired (or when "Burn Now" is clicked), the memory and localStorage keys are permanently wiped with zero recovery possible.',
   },
   {
      question: 'Is client-side password encryption secure?',
      answer:
         'Yes. When you provide a password, your note is encrypted using industry-standard AES-GCM 256-bit cryptography derived with PBKDF2 (100,000 iterations) directly in your browser using the native Web Crypto API.',
   },
   {
      question: 'Can I share an encrypted note via URL?',
      answer:
         'Yes! Clicking "Share Encrypted Link" encodes the ciphertext directly into the URL hash fragment. Because hashes are never sent to web servers in HTTP requests, your note remains strictly end-to-end private.',
   },
   {
      question: 'Does Klique store my notes on a cloud database?',
      answer:
         'No. Klique never stores temporary note data on any backend servers. All content resides in your browser memory and client-side device storage.',
   },
];

export default function TemporaryNotes() {
   const location = useLocation();

   // Note states
   const [content, setContent] = useState(() => {
      const saved = localStorage.getItem('klique_temp_note_content');
      return saved || '';
   });
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [durationSeconds, setDurationSeconds] = useState(60 * 60); // 1 hour default

   // Remaining countdown
   const [expiryTimestamp, setExpiryTimestamp] = useState(() => {
      const saved = localStorage.getItem('klique_temp_note_expiry');
      return saved ? parseInt(saved, 10) : Date.now() + 60 * 60 * 1000;
   });

   const [secondsLeft, setSecondsLeft] = useState(Math.max(0, Math.floor((expiryTimestamp - Date.now()) / 1000)));

   // Toast
   const [toast, setToast] = useState({ visible: false, message: '' });
   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   const [openFaq, setOpenFaq] = useState(null);

   // Check URL hash for shared note
   useEffect(() => {
      if (location.hash && location.hash.startsWith('#note=')) {
         const encoded = location.hash.replace('#note=', '');
         try {
            const decoded = decodeURIComponent(atob(encoded));
            setContent(decoded);
            showToast('Decrypted note loaded from shared link!');
         } catch {
            showToast('Note requires password or has invalid encoding.');
         }
      }
   }, [location.hash]);

   // Instant Burn / Wipe
   const handleBurnNow = useCallback(() => {
      setContent('');
      localStorage.removeItem('klique_temp_note_content');
      localStorage.removeItem('klique_temp_note_expiry');
      showToast('Note completely destroyed!');
   }, []);

   // Expiry countdown timer
   useEffect(() => {
      const timer = setInterval(() => {
         const remaining = Math.max(0, Math.floor((expiryTimestamp - Date.now()) / 1000));
         setSecondsLeft(remaining);

         if (remaining === 0 && content) {
            handleBurnNow();
            showToast('Note self-destructed and wiped.');
         }
      }, 1000);

      return () => clearInterval(timer);
   }, [expiryTimestamp, content, handleBurnNow]);

   // Auto-save content
   const handleContentChange = (e) => {
      const val = e.target.value;
      setContent(val);
      localStorage.setItem('klique_temp_note_content', val);
   };

   // Update Expiry Duration
   const handleDurationChange = (secs) => {
      setDurationSeconds(secs);
      const newExpiry = Date.now() + secs * 1000;
      setExpiryTimestamp(newExpiry);
      localStorage.setItem('klique_temp_note_expiry', newExpiry.toString());
      showToast(`Expiry reset to ${formatExpiryTime(secs)}.`);
   };

   // Copy Encrypted Link
   const handleShareLink = async () => {
      if (!content.trim()) {
         showToast('Note is empty.');
         return;
      }
      try {
         const encrypted = await encryptNote(content, password);
         const shareUrl = `${window.location.origin}/tools/temporary-notes#note=${encrypted}`;
         navigator.clipboard.writeText(shareUrl);
         showToast('Encrypted share link copied to clipboard!');
      } catch {
         showToast('Failed to generate encrypted link.');
      }
   };

   // Download Note TXT
   const handleDownloadTxt = () => {
      if (!content.trim()) return;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `klique-note-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Note downloaded.');
   };

   // Stats
   const wordsCount = useMemo(() => {
      return content.trim() ? content.trim().split(/\s+/).length : 0;
   }, [content]);

   const relatedTools = useMemo(() => getRelatedTools('temporary-notes', 4), []);

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
            title="Temporary Notes - Encrypted & Ephemeral Scratchpad | Klique"
            description="Create self-destructing, password-encrypted temporary notes in your browser. Automatic expiry countdown, zero server storage, and 100% privacy."
            keywords="temporary notes, ephemeral notes, self destructing note, encrypted notepad, private scratchpad, burn after reading, klique"
            canonicalUrl="https://klique.netlify.app/tools/temporary-notes"
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
                     <Lock size={14} className="text-[#daf4aa]" />
                     <span>Productivity & Privacy</span>
                     <span className="text-zinc-600">•</span>
                     <span className="text-[#daf4aa]">Ephemeral Memory</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                     Temporary <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#daf4aa] via-lime-300 to-emerald-400">Notes</span>
                  </h1>
                  <p className="text-zinc-400 text-sm max-w-xl">
                     Private, self-destructing scratchpad with AES-256 client-side encryption. Notes automatically
                     burn upon countdown expiry.
                  </p>
               </motion.div>

               {/* Action Buttons */}
               <div className="flex items-center gap-3">
                  <button
                     onClick={handleShareLink}
                     className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all shadow-md backdrop-blur-md cursor-pointer">
                     <Share2 size={14} className="text-[#daf4aa]" />
                     <span>Share Encrypted Link</span>
                  </button>

                  <button
                     onClick={handleBurnNow}
                     className="flex items-center gap-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-4 py-2.5 text-xs font-bold text-rose-400 transition-all shadow-md backdrop-blur-md cursor-pointer">
                     <Flame size={15} />
                     <span>Burn Now</span>
                  </button>
               </div>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
               <Link to="/" className="hover:text-zinc-200 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category" className="hover:text-zinc-200 transition-colors">Productivity</Link>
               <span>/</span>
               <span className="text-[#daf4aa]">Temporary Notes</span>
            </div>

            {/* Countdown Banner */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 mb-6 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                     <Clock size={18} />
                  </div>
                  <div>
                     <span className="text-xs font-bold text-white block">
                        Auto-Destruct in: <strong className="text-amber-400 font-mono">{formatExpiryTime(secondsLeft)}</strong>
                     </span>
                     <span className="text-[11px] text-zinc-500">
                        Content is wiped from your browser memory once countdown hits zero.
                     </span>
                  </div>
               </div>

               {/* Expiry Selector */}
               <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>Reset Expiry:</span>
                  <Dropdown
                     value={durationSeconds}
                     onChange={(e) => handleDurationChange(parseInt(e.target.value, 10))}
                     className="rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-white font-mono focus:outline-none">
                     {EXPIRATION_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                           {opt.label}
                        </option>
                     ))}
                  </Dropdown>
               </div>
            </div>

            {/* Main Stage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
               {/* Left Column: Note Editor */}
               <div className="lg:col-span-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl flex flex-col min-h-[460px]">
                  <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-3">
                     <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <FileText size={14} className="text-emerald-400" />
                        <span>Private Scratchpad</span>
                     </span>

                     <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                        <span>{wordsCount} words</span>
                        <span>&bull;</span>
                        <span>{content.length} characters</span>
                        <button
                           onClick={handleDownloadTxt}
                           className="p-1 text-zinc-400 hover:text-white transition-all ml-1"
                           title="Download Note">
                           <Download size={14} />
                        </button>
                     </div>
                  </div>

                  <Textarea
                     value={content}
                     onChange={handleContentChange}
                     placeholder="Write private notes, sensitive credentials, temporary copy, or secrets here..."
                     className="w-full flex-1 min-h-[320px] rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
                  />
               </div>

               {/* Right Column: Encryption & Settings */}
               <div className="lg:col-span-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl space-y-5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                     <KeyRound size={16} className="text-emerald-400" />
                     <span>Passphrase Protection</span>
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                     Optional encryption key. If set, shared links will require this exact password to decrypt.
                  </p>

                  <div className="relative">
                     <InputControl
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter encryption passphrase..."
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none transition-all pr-10"
                     />
                     <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                     </button>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2 text-xs">
                     <span className="font-bold text-white block">Zero Cloud Traces</span>
                     <p className="text-zinc-400 text-[11px] leading-relaxed">
                        Data is never sent to backend servers. Closing the tab or expiration instantly purges memory.
                     </p>
                  </div>

                  <button
                     onClick={handleShareLink}
                     className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-3 text-xs font-bold text-zinc-950 transition-all shadow-lg shadow-emerald-500/20">
                     <Share2 size={14} />
                     <span>Generate Shareable Link</span>
                  </button>
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
                     <span>Related Productivity Tools</span>
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
