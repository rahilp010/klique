/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   KeyRound,
   Copy,
   Download,
   Trash2,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ChevronRight,
   Check,
   ArrowRight,
   ShieldCheck,
   ShieldAlert,
   Clock,
   Lock,
   Code2,
   FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { decodeJWT } from '../../../lib/calculations/jwt';
import { trackToolCopy, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';
import { Textarea } from '../../../components/ui/CustomControl';

/* -------------------------------------------------------------------------- */
/*  PRESETS & FAQS                                                            */
/* -------------------------------------------------------------------------- */

// Sample JWT tokens (safe demo tokens)
const SAMPLE_VALID_TOKEN =
   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsZXggTW9yZ2FuIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjIsImVtYWlsIjoiYWxleEBleGFtcGxlLmNvbSIsInJvbGVzIjpbImFkbWluIiwidXNlciJdfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const SAMPLE_EXPIRED_TOKEN =
   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfOTg3MjEiLCJuYW1lIjoiU2FtIFdpbHNvbiIsImlhdCI6MTYwOTQ1OTIwMCwiZXhwIjoxNjA5NDYyODAwLCJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20ifQ.sample_signature_for_expired_token_preview_only_abc';

const SAMPLE_FIREBASE_TOKEN =
   'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFkMmUzZjQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20va2xpcXVlLWFwcCIsImF1ZCI6ImtsaXF1ZS1hcHAiLCJhdXRoX3RpbWUiOjE2OTAwMDAwMDAsInVzZXJfaWQiOiJmYl91c3JfMDEyMyIsInN1YiI6ImZiX3Vzcl8wMTIzIiwiaWF0IjoxNjkwMDAwMDAwLCJleHAiOjE5OTAwMDAwMDB9.sample_firebase_rsa_signature';

const PRESETS = [
   {
      id: 'active-admin',
      name: 'Active Admin JWT (Valid)',
      token: SAMPLE_VALID_TOKEN,
      desc: 'Includes roles, name, and future expiration timestamp',
   },
   {
      id: 'expired-token',
      name: 'Expired Session Token',
      token: SAMPLE_EXPIRED_TOKEN,
      desc: 'Demonstrates expiration detection and date display',
   },
   {
      id: 'firebase-token',
      name: 'Firebase / Google Auth JWT',
      token: SAMPLE_FIREBASE_TOKEN,
      desc: 'RS256 algorithm with kid and project audience claims',
   },
];

const FAQS = [
   {
      question: 'Is it safe to paste confidential production JWTs into this tool?',
      answer:
         'Yes! All decoding and inspection happens entirely client-side inside your browser via standard JavaScript Base64 decoding. No tokens are sent over any network or stored on any server.',
   },
   {
      question: 'Can this tool verify the cryptographic signature of the token?',
      answer:
         'Signature verification requires your private secret or public key (e.g. HS256 secret or RS256 public PEM). For security reasons, Klique does not request your secrets. This tool inspects and decodes the token claims.',
   },
   {
      question: 'What are exp, iat, and nbf claims?',
      answer:
         '• exp (Expiration Time): Unix timestamp after which the token is invalid.\n• iat (Issued At): Unix timestamp when the token was minted.\n• nbf (Not Before): Unix timestamp before which the token cannot be accepted.',
   },
];

export default function JWTDecoder() {
   // State
   const [tokenInput, setTokenInput] = useState(SAMPLE_VALID_TOKEN);
   const [activeView, setActiveView] = useState('payload'); // 'payload' | 'header'

   // UI State
   const [showQuickSetup, setShowQuickSetup] = useState(false);
   const [selectedPreset, setSelectedPreset] = useState('active-admin');
   const [openFaq, setOpenFaq] = useState(null);

   // Toast State
   const [toast, setToast] = useState({ message: '', visible: false });

   const showToast = (message) => {
      setToast({ message, visible: true });
      setTimeout(() => {
         setToast({ message: '', visible: false });
      }, 2500);
   };

   // Decode JWT
   const result = useMemo(() => {
      return decodeJWT(tokenInput);
   }, [tokenInput]);

   const applyPreset = (preset) => {
      setSelectedPreset(preset.id);
      setTokenInput(preset.token);
      showToast(`Applied sample: ${preset.name}`);
   };

   const handleReset = () => {
      setTokenInput(SAMPLE_VALID_TOKEN);
      setSelectedPreset('active-admin');
      trackToolReset('jwt-decoder');
      showToast('Reset JWT decoder.');
   };

   const handleCopyPayload = () => {
      if (!result.payloadFormatted) return;
      navigator.clipboard.writeText(result.payloadFormatted);
      trackToolCopy('jwt-decoder', { outputType: 'payload' });
      showToast('Copied decoded payload JSON!');
   };

   const handleCopyHeader = () => {
      if (!result.headerFormatted) return;
      navigator.clipboard.writeText(result.headerFormatted);
      trackToolCopy('jwt-decoder', { outputType: 'header' });
      showToast('Copied decoded header JSON!');
   };

   const relatedTools = useMemo(() => getRelatedTools('jwt-decoder', 3), []);

   // Split token parts for visual display
   const tokenParts = tokenInput.trim().split('.');

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden
            before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]
            after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
         <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]" />

         {/* Ambient grid backdrop */}
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         {/* In-File Toast Notification */}
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

         <SEO
            title="JWT Decoder & Inspector — Decode JSON Web Tokens Client-Side"
            description="Decode JWT headers, payloads, algorithms, and inspect expiration timestamps locally with zero server transmission."
            keywords="jwt decoder, decode json web token, jwt inspector, jwt exp checker, bearer token decoder, inspect jwt online"
         />

         {/* Global Navbar */}
         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         {/* Main Content Area */}
         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Header Section */}
            <div className="mb-6 flex flex-col gap-3">
               <div className="inline-flex items-center gap-2 self-start rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-[#daf4aa] backdrop-blur-sm">
                  <KeyRound size={13} className="text-[#daf4aa]" />
                  <span>Developer Suite</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">Auth & Security</span>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        JWT Decoder & Inspector
                     </h1>
                     <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                        Inspect and debug JSON Web Tokens entirely in your browser with expiration countdowns, algorithm detection, and formatted payload views.
                     </p>
                  </div>

                  <div className="flex items-center gap-2">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                        <Lock size={12} className="text-[#daf4aa]" />
                        100% Client-Side Safe
                     </span>
                  </div>
               </div>
            </div>

            {/* Collapsible Quick Presets Accordion */}
            <div className="mb-6 rounded-2xl border border-zinc-800/80 bg-[#121215] overflow-hidden shadow-lg">
               <button
                  type="button"
                  onClick={() => setShowQuickSetup(!showQuickSetup)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors text-left">
                  <div className="flex items-center gap-2">
                     <Sparkles size={15} className="text-[#daf4aa]" />
                     <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                        Sample JWT Tokens
                     </span>
                     <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
                        (Active Admin, Expired Session, Firebase RS256)
                     </span>
                  </div>
                  <ChevronDown
                     size={16}
                     className={`text-zinc-400 transition-transform duration-200 ${
                        showQuickSetup ? 'rotate-180' : ''
                     }`}
                  />
               </button>

               <AnimatePresence>
                  {showQuickSetup && (
                     <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 border-t border-zinc-800/80 bg-zinc-950/40">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                           {PRESETS.map((preset) => (
                              <button
                                 key={preset.id}
                                 type="button"
                                 onClick={() => applyPreset(preset)}
                                 className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                                    selectedPreset === preset.id
                                       ? 'border-[#daf4aa] bg-[#daf4aa]/10 text-white'
                                       : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900'
                                 }`}>
                                 <div className="font-semibold text-zinc-200 mb-1">{preset.name}</div>
                                 <div className="text-[11px] text-zinc-500">
                                    {preset.desc}
                                 </div>
                              </button>
                           ))}
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* Quick Actions Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-[#121215] px-4 py-3 shadow-md">
               <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                     Quick Actions
                  </span>
                  <span className="h-3 w-[1px] bg-zinc-800" />
                  <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                     <span className={`h-2 w-2 rounded-full ${result.isValid && !result.isExpired ? 'bg-emerald-500 animate-pulse' : result.isExpired ? 'bg-amber-500' : 'bg-rose-500'}`} />
                     {result.status}
                  </span>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <button
                     type="button"
                     onClick={handleCopyPayload}
                     disabled={!result.payloadFormatted}
                     className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-[#cbf094] disabled:opacity-50 shadow-sm">
                     <Copy size={13} />
                     <span>Copy Payload JSON</span>
                  </button>

                  <button
                     type="button"
                     onClick={handleCopyHeader}
                     disabled={!result.headerFormatted}
                     className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50">
                     <span>Copy Header</span>
                  </button>

                  <button
                     type="button"
                     onClick={handleReset}
                     className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/50 px-2.5 py-1.5 text-xs font-semibold text-zinc-400 transition hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400"
                     title="Reset to default">
                     <Trash2 size={13} />
                     <span className="hidden sm:inline">Reset</span>
                  </button>
               </div>
            </div>

            {/* Status & Stats Banner */}
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 sm:px-4 sm:py-2.5 text-xs">
               <div>
                  <span className="text-zinc-500 block text-[11px]">Algorithm</span>
                  <span className="font-semibold text-zinc-200 text-sm font-mono">
                     {result.algorithm}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Token Expiration</span>
                  <span className={`font-semibold text-sm ${result.isExpired ? 'text-amber-400' : 'text-emerald-400'}`}>
                     {result.expiryFormatted}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Issued At</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     {result.issuedFormatted}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Token Format</span>
                  <span className="font-semibold text-[#daf4aa] text-sm">
                     {result.isValid ? 'Valid 3-Part JWT' : 'Invalid'}
                  </span>
               </div>
            </div>

            {/* Dual Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               {/* Left Pane: Encoded JWT String */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Lock size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Encoded Token String
                        </span>
                     </div>
                     <span className="text-[11px] font-mono text-zinc-500">Base64URL</span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     <div>
                        <div className="flex items-center justify-between mb-1.5">
                           <label className="text-xs font-semibold text-zinc-300">
                              Paste JWT (Bearer Token)
                           </label>
                           <button
                              type="button"
                              onClick={() => setTokenInput('')}
                              className="text-[11px] text-zinc-500 hover:text-zinc-300">
                              Clear
                           </button>
                        </div>
                        <Textarea
                           rows={8}
                           value={tokenInput}
                           onChange={(e) => setTokenInput(e.target.value)}
                           placeholder="Paste encoded JWT here (e.g. eyJhbGciOi...)"
                           className="w-full p-3 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-xs font-mono focus:outline-none focus:border-[#daf4aa] transition-colors resize-none customScrollbar break-all"
                        />
                     </div>

                     {/* Visual 3-Part Breakdown */}
                     {result.isValid && tokenParts.length === 3 && (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex flex-col gap-2">
                           <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                              Token Segments
                           </span>
                           <div className="text-xs font-mono break-all leading-relaxed">
                              <span className="text-rose-400" title="Header (Algorithm & Token Type)">
                                 {tokenParts[0]}
                              </span>
                              <span className="text-zinc-500">.</span>
                              <span className="text-purple-300" title="Payload (Claims & User Data)">
                                 {tokenParts[1]}
                              </span>
                              <span className="text-zinc-500">.</span>
                              <span className="text-emerald-400" title="Cryptographic Signature">
                                 {tokenParts[2]}
                              </span>
                           </div>
                           <div className="flex items-center gap-4 text-[10px] text-zinc-400 mt-1 border-t border-zinc-900 pt-1.5">
                              <span className="flex items-center gap-1">
                                 <span className="w-2 h-2 rounded-full bg-rose-400" /> Header
                              </span>
                              <span className="flex items-center gap-1">
                                 <span className="w-2 h-2 rounded-full bg-purple-400" /> Payload
                              </span>
                              <span className="flex items-center gap-1">
                                 <span className="w-2 h-2 rounded-full bg-emerald-400" /> Signature
                              </span>
                           </div>
                        </div>
                     )}

                     {result.error && (
                        <div className="text-xs text-rose-400 bg-rose-950/20 border border-rose-900/40 p-2.5 rounded-lg">
                           {result.error}
                        </div>
                     )}
                  </div>
               </div>

               {/* Right Pane: Decoded Header & Payload */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Code2 size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Decoded Claims
                        </span>
                     </div>

                     <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                        <button
                           type="button"
                           onClick={() => setActiveView('payload')}
                           className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                              activeView === 'payload'
                                 ? 'bg-[#daf4aa] text-zinc-950'
                                 : 'text-zinc-400 hover:text-white'
                           }`}>
                           Payload
                        </button>
                        <button
                           type="button"
                           onClick={() => setActiveView('header')}
                           className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                              activeView === 'header'
                                 ? 'bg-[#daf4aa] text-zinc-950'
                                 : 'text-zinc-400 hover:text-white'
                           }`}>
                           Header
                        </button>
                     </div>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {activeView === 'payload' ? (
                        <>
                           {/* Key Claims Quick Readout */}
                           {result.payload && (
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                 {result.payload.sub && (
                                    <div className="p-2 rounded-lg bg-zinc-900/70 border border-zinc-800">
                                       <span className="text-[10px] text-zinc-500 block">Subject (sub)</span>
                                       <span className="font-mono text-zinc-200 truncate block">
                                          {result.payload.sub}
                                       </span>
                                    </div>
                                 )}
                                 {result.payload.iss && (
                                    <div className="p-2 rounded-lg bg-zinc-900/70 border border-zinc-800">
                                       <span className="text-[10px] text-zinc-500 block">Issuer (iss)</span>
                                       <span className="font-mono text-zinc-200 truncate block">
                                          {result.payload.iss}
                                       </span>
                                    </div>
                                 )}
                              </div>
                           )}

                           {/* Full JSON Payload */}
                           <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-purple-300 whitespace-pre-wrap break-all min-h-[260px] max-h-[380px] overflow-y-auto customScrollbar select-all">
                              {result.payloadFormatted || '// Decoded payload will appear here...'}
                           </pre>
                        </>
                     ) : (
                        <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-rose-300 whitespace-pre-wrap break-all min-h-[260px] max-h-[380px] overflow-y-auto customScrollbar select-all">
                           {result.headerFormatted || '// Decoded header will appear here...'}
                        </pre>
                     )}
                  </div>
               </div>
            </div>

            {/* Bottom FAQ Section */}
            <div className="mt-12 rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl">
               <div className="flex items-center gap-2 mb-4 text-[#daf4aa]">
                  <HelpCircle size={18} />
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                     Frequently Asked Questions
                  </h2>
               </div>

               <div className="divide-y divide-zinc-800/80">
                  {FAQS.map((faq, idx) => (
                     <div key={idx} className="py-3">
                        <button
                           type="button"
                           onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                           className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white transition-colors">
                           <span>{faq.question}</span>
                           <ChevronDown
                              size={15}
                              className={`text-zinc-500 transition-transform duration-200 ${
                                 openFaq === idx ? 'rotate-180' : ''
                              }`}
                           />
                        </button>
                        {openFaq === idx && (
                           <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                              {faq.answer}
                           </p>
                        )}
                     </div>
                  ))}
               </div>
            </div>

            {/* Related Tools Section */}
            {relatedTools.length > 0 && (
               <div className="mt-10 mb-8">
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-base sm:text-lg font-bold text-white">
                        Explore Related Tools
                     </h2>
                     <Link
                        to="/categories"
                        className="text-xs font-semibold text-[#daf4aa] hover:underline flex items-center gap-1">
                        <span>All Categories</span>
                        <ChevronRight size={13} />
                     </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                     {relatedTools.map((tool) => (
                        <Link
                           key={tool.id}
                           to={tool.path}
                           onMouseEnter={() => preloadRoute(tool.path)}
                           className="group flex flex-col justify-between p-4 rounded-xl border border-zinc-800 bg-[#121215] hover:border-zinc-700 hover:bg-zinc-900/60 transition-all shadow-md">
                           <div>
                              <div className="flex items-center justify-between mb-2">
                                 <span className="text-[10px] font-semibold text-[#daf4aa] uppercase tracking-wider">
                                    {tool.category}
                                 </span>
                                 <ArrowRight
                                    size={13}
                                    className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all"
                                 />
                              </div>
                              <h3 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-[#daf4aa] transition-colors line-clamp-1">
                                 {tool.name}
                              </h3>
                              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                                 {tool.description}
                              </p>
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

