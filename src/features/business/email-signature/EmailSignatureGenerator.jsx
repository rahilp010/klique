/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useRef } from 'react';
import {
   Mail,
   Copy,
   Download,
   Trash2,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ChevronRight,
   ExternalLink,
   Palette,
   Layout,
   User,
   Building,
   Phone,
   Globe,
   Check,
   ArrowRight,
   Eye,
   Code2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { generateEmailSignature } from '../../../lib/calculations/emailSignature';
import { trackToolCopy, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*  PRESETS & FAQS                                                            */
/* -------------------------------------------------------------------------- */

const PRESETS = [
   {
      id: 'designer',
      name: 'Senior Product Designer',
      fullName: 'Maya Sharma',
      jobTitle: 'Lead Product Designer',
      company: 'Zenith Studio',
      email: 'maya.design@zenith.io',
      phone: '+91 98765 12345',
      website: 'https://zenithstudio.io',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      accentColor: '#daf4aa',
      layout: 'modern-horizontal',
   },
   {
      id: 'engineer',
      name: 'Full-Stack Software Engineer',
      fullName: 'Rohan Mehta',
      jobTitle: 'Senior Full-Stack Developer',
      company: 'CloudPulse Technologies',
      email: 'rohan.m@cloudpulse.dev',
      phone: '+91 98200 87654',
      website: 'https://cloudpulse.dev',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      accentColor: '#38bdf8',
      layout: 'clean-minimal',
   },
   {
      id: 'founder',
      name: 'Startup Founder & CEO',
      fullName: 'Aarav Singhania',
      jobTitle: 'Founder & Managing Director',
      company: 'Finovate Capital',
      email: 'aarav@finovatecap.com',
      phone: '+91 91234 56789',
      website: 'https://finovatecap.com',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      accentColor: '#facc15',
      layout: 'corporate-card',
   },
   {
      id: 'marketer',
      name: 'Growth & Marketing Consultant',
      fullName: 'Pooja Iyer',
      jobTitle: 'VP of Growth & Strategy',
      company: 'HyperScale Marketing',
      email: 'pooja@hyperscalemedia.in',
      phone: '+91 99887 76655',
      website: 'https://hyperscalemedia.in',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      accentColor: '#f472b6',
      layout: 'modern-horizontal',
   },
];

const FAQS = [
   {
      question: 'How do I add this signature to Gmail?',
      answer:
         'Click the "Copy Rendered Signature" button. In Gmail, open Settings (gear icon) → "See all settings" → scroll down to the "Signature" section → create or select a signature → press Ctrl+V (or Cmd+V on Mac) in the signature box → save changes.',
   },
   {
      question: 'Will this signature look good on Outlook and Apple Mail?',
      answer:
         'Yes! The signature is coded using universal email-compliant HTML tables with inline CSS styles, ensuring pixel-perfect rendering across Outlook, Apple Mail, Gmail, Yahoo, and mobile email apps.',
   },
   {
      question: 'Why should I host my profile avatar on a public URL?',
      answer:
         'Email clients do not reliably display embedded base64 image strings. Using a public HTTPS link (such as Unsplash, your website, GitHub, or LinkedIn profile photo) ensures your avatar loads cleanly for all recipients.',
   },
];

export default function EmailSignatureGenerator() {
   // Core Profile Data
   const [fullName, setFullName] = useState('Alex Morgan');
   const [jobTitle, setJobTitle] = useState('Senior Product Designer');
   const [company, setCompany] = useState('Apex Technologies');
   const [email, setEmail] = useState('alex.morgan@example.com');
   const [phone, setPhone] = useState('+91 98765 43210');
   const [website, setWebsite] = useState('https://example.com');
   const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
   const [accentColor, setAccentColor] = useState('#daf4aa');
   const [layout, setLayout] = useState('modern-horizontal'); // 'modern-horizontal' | 'clean-minimal' | 'corporate-card'

   // Social Profiles
   const [linkedin, setLinkedin] = useState('https://linkedin.com');
   const [twitter, setTwitter] = useState('https://twitter.com');
   const [github, setGithub] = useState('https://github.com');
   const [disclaimer, setDisclaimer] = useState('');

   // UI State
   const [showQuickSetup, setShowQuickSetup] = useState(false);
   const [selectedPreset, setSelectedPreset] = useState('');
   const [openFaq, setOpenFaq] = useState(null);
   const [showRawHtml, setShowRawHtml] = useState(false);

   // Preview DOM Ref for Rich Clipboard Copy
   const previewRef = useRef(null);

   // Toast State
   const [toast, setToast] = useState({ message: '', visible: false });

   const showToast = (message) => {
      setToast({ message, visible: true });
      setTimeout(() => {
         setToast({ message: '', visible: false });
      }, 2500);
   };

   // Generate Signature HTML string
   const signatureHtml = useMemo(() => {
      return generateEmailSignature(
         {
            fullName,
            jobTitle,
            company,
            email,
            phone,
            website,
            avatarUrl,
            accentColor,
            socialLinks: { linkedin, twitter, github },
            disclaimer,
         },
         layout
      );
   }, [fullName, jobTitle, company, email, phone, website, avatarUrl, accentColor, linkedin, twitter, github, disclaimer, layout]);

   const applyPreset = (preset) => {
      setSelectedPreset(preset.id);
      setFullName(preset.fullName);
      setJobTitle(preset.jobTitle);
      setCompany(preset.company);
      setEmail(preset.email);
      setPhone(preset.phone);
      setWebsite(preset.website);
      setAvatarUrl(preset.avatarUrl);
      setAccentColor(preset.accentColor);
      setLayout(preset.layout);
      showToast(`Applied preset: ${preset.name}`);
   };

   const handleReset = () => {
      setFullName('Alex Morgan');
      setJobTitle('Senior Product Designer');
      setCompany('Apex Technologies');
      setEmail('alex.morgan@example.com');
      setPhone('+91 98765 43210');
      setWebsite('https://example.com');
      setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80');
      setAccentColor('#daf4aa');
      setLayout('modern-horizontal');
      setLinkedin('https://linkedin.com');
      setTwitter('https://twitter.com');
      setGithub('https://github.com');
      setDisclaimer('');
      setSelectedPreset('');
      trackToolReset('email-signature-generator');
      showToast('Reset email signature generator.');
   };

   // Copy as rendered rich HTML for Gmail / Outlook paste
   const handleCopyRichSignature = async () => {
      try {
         const blobHtml = new Blob([signatureHtml], { type: 'text/html' });
         const blobText = new Blob([`${fullName}\n${jobTitle} | ${company}\n${email} | ${phone}`], { type: 'text/plain' });
         const item = new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText,
         });
         await navigator.clipboard.write([item]);
         trackToolCopy('email-signature-generator', { outputType: 'rich-html', size: signatureHtml.length });
         showToast('Copied Rich Signature! (Paste directly in Gmail/Outlook)');
      } catch (err) {
         // Fallback to text copy if ClipboardItem text/html fails
         navigator.clipboard.writeText(signatureHtml);
         showToast('Copied HTML code to clipboard!');
      }
   };

   const handleCopyRawHtml = () => {
      navigator.clipboard.writeText(signatureHtml);
      trackToolCopy('email-signature-generator', { outputType: 'raw-html', size: signatureHtml.length });
      showToast('Copied raw HTML source code!');
   };

   const relatedTools = useMemo(() => getRelatedTools('email-signature-generator', 3), []);

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
            title="Email Signature Generator — Free Professional HTML Signatures"
            description="Create sleek, responsive HTML email signatures for Gmail, Outlook, Apple Mail, and Yahoo Mail with 1-click rich copy."
            keywords="email signature generator, free html email signature, gmail signature maker, outlook email signature, professional email footer"
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
                  <Mail size={13} className="text-[#daf4aa]" />
                  <span>Business & Communication Suite</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">Email Signatures</span>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        Email Signature Generator
                     </h1>
                     <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                        Design professional, mobile-friendly HTML email signatures compatible with Gmail, Apple Mail, Outlook, and Yahoo with instant rich copy.
                     </p>
                  </div>

                  {/* Layout Tabs */}
                  <div className="flex items-center p-1 rounded-full bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-xl self-start sm:self-auto shadow-inner flex-wrap">
                     <button
                        type="button"
                        onClick={() => setLayout('modern-horizontal')}
                        className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                           layout === 'modern-horizontal'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        Modern Horizontal
                     </button>
                     <button
                        type="button"
                        onClick={() => setLayout('clean-minimal')}
                        className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                           layout === 'clean-minimal'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        Clean Minimal
                     </button>
                     <button
                        type="button"
                        onClick={() => setLayout('corporate-card')}
                        className={`px-3 sm:px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 ${
                           layout === 'corporate-card'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        Corporate Card
                     </button>
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
                        Quick Professional Profiles & Palettes
                     </span>
                     <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
                        (Product Designer, Software Engineer, Founder, Marketer)
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
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
                                    {preset.fullName} • {preset.company}
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
                     <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                     {fullName} • {layout}
                  </span>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <button
                     type="button"
                     onClick={handleCopyRichSignature}
                     className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-[#cbf094] shadow-sm">
                     <Copy size={13} />
                     <span>Copy Rendered Signature</span>
                  </button>

                  <button
                     type="button"
                     onClick={handleCopyRawHtml}
                     className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white">
                     <Code2 size={13} />
                     <span>Copy HTML Code</span>
                  </button>

                  <button
                     type="button"
                     onClick={() => setShowRawHtml(!showRawHtml)}
                     className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/50 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800">
                     <span>{showRawHtml ? 'Show Visual' : 'View Code'}</span>
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
                  <span className="text-zinc-500 block text-[11px]">Selected Layout</span>
                  <span className="font-semibold text-zinc-200 text-sm capitalize">
                     {layout.replace('-', ' ')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Accent Color</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                     <span className="w-3 h-3 rounded-full border border-zinc-700" style={{ backgroundColor: accentColor }} />
                     <span className="font-mono text-zinc-200 font-semibold">{accentColor}</span>
                  </div>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Compatibility</span>
                  <span className="font-semibold text-[#daf4aa] text-sm">
                     Gmail & Outlook Ready
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">HTML Standard</span>
                  <span className="font-semibold text-emerald-400 text-sm">
                     Table-Inline CSS
                  </span>
               </div>
            </div>

            {/* Dual Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               {/* Left Pane: Configuration */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <User size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Identity & Contact Details
                        </span>
                     </div>
                     <span className="text-[11px] font-mono text-zinc-500">Live Editor</span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {/* Name & Job Title */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                           <label className="text-xs font-semibold text-zinc-300 block mb-1">
                              Full Name
                           </label>
                           <input
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="e.g. Alex Morgan"
                              className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                        </div>
                        <div>
                           <label className="text-xs font-semibold text-zinc-300 block mb-1">
                              Job Title / Role
                           </label>
                           <input
                              type="text"
                              value={jobTitle}
                              onChange={(e) => setJobTitle(e.target.value)}
                              placeholder="e.g. Lead Designer"
                              className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                        </div>
                     </div>

                     {/* Company & Website */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                           <label className="text-xs font-semibold text-zinc-300 block mb-1">
                              Company / Organization
                           </label>
                           <input
                              type="text"
                              value={company}
                              onChange={(e) => setCompany(e.target.value)}
                              placeholder="e.g. Acme Tech"
                              className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                        </div>
                        <div>
                           <label className="text-xs font-semibold text-zinc-300 block mb-1">
                              Website URL
                           </label>
                           <input
                              type="text"
                              value={website}
                              onChange={(e) => setWebsite(e.target.value)}
                              placeholder="https://example.com"
                              className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                        </div>
                     </div>

                     {/* Email & Phone */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                           <label className="text-xs font-semibold text-zinc-300 block mb-1">
                              Email Address
                           </label>
                           <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="alex@example.com"
                              className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                        </div>
                        <div>
                           <label className="text-xs font-semibold text-zinc-300 block mb-1">
                              Phone / Mobile
                           </label>
                           <input
                              type="text"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+91 98765 43210"
                              className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                        </div>
                     </div>

                     {/* Avatar URL & Accent Color */}
                     <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-zinc-800/80">
                        <div className="sm:col-span-8">
                           <label className="text-xs font-semibold text-zinc-300 block mb-1">
                              Profile Photo / Logo URL (Public HTTPS)
                           </label>
                           <input
                              type="url"
                              value={avatarUrl}
                              onChange={(e) => setAvatarUrl(e.target.value)}
                              placeholder="https://..."
                              className="w-full px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                        </div>
                        <div className="sm:col-span-4">
                           <label className="text-xs font-semibold text-zinc-300 block mb-1">
                              Accent Color
                           </label>
                           <div className="flex items-center gap-1.5">
                              {['#daf4aa', '#38bdf8', '#a78bfa', '#f472b6', '#facc15'].map((color) => (
                                 <button
                                    key={color}
                                    type="button"
                                    onClick={() => setAccentColor(color)}
                                    style={{ backgroundColor: color }}
                                    className={`w-6 h-6 rounded-full transition-transform ${
                                       accentColor === color ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                                    }`}
                                 />
                              ))}
                           </div>
                        </div>
                     </div>

                     {/* Social Links */}
                     <div className="pt-2 border-t border-zinc-800/80">
                        <span className="text-xs font-semibold text-zinc-300 block mb-2">
                           Social Profiles (Optional)
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                           <input
                              type="text"
                              value={linkedin}
                              onChange={(e) => setLinkedin(e.target.value)}
                              placeholder="LinkedIn URL"
                              className="w-full px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200"
                           />
                           <input
                              type="text"
                              value={twitter}
                              onChange={(e) => setTwitter(e.target.value)}
                              placeholder="Twitter / X URL"
                              className="w-full px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200"
                           />
                           <input
                              type="text"
                              value={github}
                              onChange={(e) => setGithub(e.target.value)}
                              placeholder="GitHub URL"
                              className="w-full px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200"
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Pane: Live Signature Card Mockup */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Mail size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Live Email Client Preview
                        </span>
                     </div>
                     <span className="text-xs font-semibold text-emerald-400">
                        Ready to Copy
                     </span>
                  </div>

                  <div className="p-6 flex flex-col gap-5">
                     {/* Simulated Email Compose Client Box */}
                     <div className="rounded-2xl border border-zinc-800 bg-[#0e0e11] overflow-hidden shadow-xl">
                        {/* Fake Email Header */}
                        <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                           <div className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                              <span className="text-[11px] font-mono text-zinc-400 ml-2">
                                 New Message
                              </span>
                           </div>
                           <span className="text-[10px] text-zinc-500 font-mono">Gmail / Outlook</span>
                        </div>

                        {/* Fake Email Body */}
                        <div className="p-5 flex flex-col gap-4 text-xs text-zinc-300">
                           <div className="text-zinc-400 text-[11px]">
                              Hi Sarah,
                              <br />
                              <br />
                              Thanks for reviewing the project proposal. I look forward to our kick-off call tomorrow morning!
                              <br />
                              <br />
                              Best regards,
                           </div>

                           <div className="h-[1px] bg-zinc-800/80 my-1" />

                           {/* Rendered HTML Signature */}
                           {!showRawHtml ? (
                              <div
                                 ref={previewRef}
                                 className="overflow-x-auto py-2"
                                 dangerouslySetInnerHTML={{ __html: signatureHtml }}
                              />
                           ) : (
                              <pre className="p-3 rounded-xl bg-zinc-950 font-mono text-[11px] text-[#daf4aa] overflow-x-auto max-h-60 customScrollbar select-all">
                                 {signatureHtml}
                              </pre>
                           )}
                        </div>
                     </div>

                     {/* Action Buttons */}
                     <div className="flex flex-col sm:flex-row items-center gap-3">
                        <button
                           type="button"
                           onClick={handleCopyRichSignature}
                           className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#daf4aa] px-4 py-2.5 text-xs font-bold text-zinc-950 transition hover:bg-[#cbf094] shadow-md">
                           <Copy size={14} />
                           <span>Copy Rendered Signature (For Gmail / Outlook)</span>
                        </button>
                        <button
                           type="button"
                           onClick={handleCopyRawHtml}
                           className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white">
                           <Code2 size={14} />
                           <span>Copy HTML</span>
                        </button>
                     </div>
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

