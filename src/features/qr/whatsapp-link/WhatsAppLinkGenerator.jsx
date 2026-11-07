/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import {
   MessageSquare,
   ExternalLink,
   QrCode as QrIcon,
   Copy,
   Download,
   Trash2,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ChevronRight,
   Phone,
   Send,
   Share2,
   ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { generateWhatsAppLink } from '../../../lib/calculations/whatsapp';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';
import { Dropdown, InputControl, Textarea } from '../../../components/ui/CustomControl';

/* -------------------------------------------------------------------------- */
/*  PRESETS & CONSTANTS                                                       */
/* -------------------------------------------------------------------------- */

const COUNTRY_CODES = [
   { code: '91', label: '🇮🇳 India (+91)' },
   { code: '1', label: '🇺🇸 US/Canada (+1)' },
   { code: '44', label: '🇬🇧 UK (+44)' },
   { code: '971', label: '🇦🇪 UAE (+971)' },
   { code: '61', label: '🇦🇺 Australia (+61)' },
   { code: '65', label: '🇸🇬 Singapore (+65)' },
   { code: '49', label: '🇩🇪 Germany (+49)' },
];

const PRESETS = [
   {
      id: 'support',
      name: 'Customer Support Lead',
      countryCode: '91',
      phone: '9876543210',
      message: 'Hello Support Team! I need assistance with an existing order.',
   },
   {
      id: 'pricing',
      name: 'Product Pricing & Catalog',
      countryCode: '91',
      phone: '9876543210',
      message: 'Hi, I saw your catalog and would like to know the pricing and available options.',
   },
   {
      id: 'booking',
      name: 'Table / Appointment Booking',
      countryCode: '91',
      phone: '9876543210',
      message: 'Hi! I would like to book an appointment for tomorrow afternoon.',
   },
   {
      id: 'freelance',
      name: 'Freelance Project Consultation',
      countryCode: '91',
      phone: '9876543210',
      message: 'Hello! I came across your portfolio and would love to discuss a new design project.',
   },
];

const FAQS = [
   {
      question: 'How does WhatsApp Click-to-Chat work?',
      answer:
         'WhatsApp Click-to-Chat uses the official wa.me link format. When anyone clicks your generated link, WhatsApp opens directly to a chat window with your prefilled message, without requiring them to save your number in their contacts.',
   },
   {
      question: 'What is the required phone number format?',
      answer:
         'Phone numbers must include the international country code without any leading zeros, plus signs, brackets, or dashes. For instance, for an Indian number 9876543210, enter 919876543210.',
   },
   {
      question: 'Can I put this link or QR code on my website, flyers, and business cards?',
      answer:
         'Yes! You can embed the wa.me link as a button on your website, or download and print the high-resolution QR code onto brochures, restaurant menus, product packaging, and business cards.',
   },
   {
      question: 'Is my phone number or message saved on your servers?',
      answer:
         'No. Everything is generated entirely inside your browser using client-side JavaScript. No contact numbers or personal messages are ever sent to any remote server.',
   },
];

export default function WhatsAppLinkGenerator() {
   const [countryCode, setCountryCode] = useState('91');
   const [phone, setPhone] = useState('9876543210');
   const [message, setMessage] = useState('Hello! I would like to enquire about your services.');
   const [qrDataUrl, setQrDataUrl] = useState('');

   // UI State
   const [showQuickSetup, setShowQuickSetup] = useState(false);
   const [selectedPreset, setSelectedPreset] = useState('');
   const [openFaq, setOpenFaq] = useState(null);

   // Toast State
   const [toast, setToast] = useState({ message: '', visible: false });

   const showToast = (msg) => {
      setToast({ message: msg, visible: true });
      setTimeout(() => {
         setToast({ message: '', visible: false });
      }, 2500);
   };

   const result = useMemo(() => {
      return generateWhatsAppLink({
         phone,
         message,
         defaultCountryCode: countryCode,
      });
   }, [phone, message, countryCode]);

   // Generate QR Code data URL
   useEffect(() => {
      if (result.link) {
         QRCode.toDataURL(result.link, {
            width: 320,
            margin: 2,
            color: {
               dark: '#000000',
               light: '#ffffff',
            },
         })
            .then((url) => setQrDataUrl(url))
            .catch((err) => console.error('Failed to generate WhatsApp QR:', err));
      } else {
         setQrDataUrl('');
      }
   }, [result.link]);

   const applyPreset = (preset) => {
      setSelectedPreset(preset.id);
      setCountryCode(preset.countryCode);
      setPhone(preset.phone);
      setMessage(preset.message);
      showToast(`Applied preset: ${preset.name}`);
   };

   const handleReset = () => {
      setCountryCode('91');
      setPhone('9876543210');
      setMessage('Hello! I would like to enquire about your services.');
      setSelectedPreset('');
      trackToolReset('whatsapp-link-generator');
      showToast('Reset to default values.');
   };

   const handleCopyLink = () => {
      if (!result.link) return;
      navigator.clipboard.writeText(result.link);
      trackToolCopy('whatsapp-link-generator', { outputType: 'url', size: result.link.length });
      showToast('Copied WhatsApp wa.me link!');
   };

   const handleDownloadQR = () => {
      if (!qrDataUrl) return;
      const a = document.createElement('a');
      a.href = qrDataUrl;
      a.download = `whatsapp-qr-${result.phone || 'chat'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      trackToolDownload('whatsapp-link-generator', { fileType: 'png' });
      showToast('Downloaded WhatsApp QR Code (PNG)!');
   };

   const relatedTools = useMemo(() => getRelatedTools('whatsapp-link-generator', 3), []);

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden
            before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]
            after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
         <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]" />

         {/* Static ambient backdrop matching JsonFormatter */}
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
            title="WhatsApp Link Generator — Free Click-to-Chat & QR Code"
            description="Create click-to-chat WhatsApp links (wa.me) with prefilled messages and instant downloadable QR codes without saving phone numbers."
            keywords="whatsapp link generator, wa.me generator, whatsapp qr code, create whatsapp link, click to chat whatsapp"
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
                  <MessageSquare size={13} className="text-[#daf4aa]" />
                  <span>Communication Suite</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">Click-to-Chat & QR</span>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        WhatsApp Link Generator
                     </h1>
                     <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                        Create instant wa.me click-to-chat links with custom prefilled messages and downloadable QR codes for websites, menus, and flyers.
                     </p>
                  </div>

                  <div className="flex items-center gap-2">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        No Contact Save Needed
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
                        Quick Message Templates & Scenarios
                     </span>
                     <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
                        (Support, Sales Leads, Bookings, Hire)
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
                                 <div className="text-[11px] text-zinc-500 line-clamp-2">
                                    "{preset.message}"
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
                     {result.isValid ? 'Valid WhatsApp Link' : 'Awaiting Valid Number'}
                  </span>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <button
                     type="button"
                     onClick={handleCopyLink}
                     disabled={!result.link}
                     className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-[#cbf094] disabled:opacity-50 shadow-sm">
                     <Copy size={13} />
                     <span>Copy Link</span>
                  </button>

                  <button
                     type="button"
                     onClick={handleDownloadQR}
                     disabled={!qrDataUrl}
                     className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50">
                     <Download size={13} />
                     <span>Download QR</span>
                  </button>

                  {result.link && (
                     <a
                        href={result.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-1.5 text-xs font-bold text-black transition hover:bg-[#20ba5a] shadow-sm">
                        <ExternalLink size={13} />
                        <span>Test Chat</span>
                     </a>
                  )}

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
                  <span className="text-zinc-500 block text-[11px]">Recipient Number</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     +{result.phone || `${countryCode} ${phone}`}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Message Length</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     {message.length} Characters
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Link Format</span>
                  <span className="font-semibold text-[#daf4aa] text-sm">
                     Official wa.me
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">QR Status</span>
                  <span className="font-semibold text-emerald-400 text-sm">
                     {qrDataUrl ? '320px Ready' : 'Standby'}
                  </span>
               </div>
            </div>

            {/* Dual Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               {/* Left Pane: Controls */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Phone size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Phone & Message Configuration
                        </span>
                     </div>
                     <span className="text-[11px] font-mono text-zinc-500">Instant Preview</span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {/* Phone Number with Country Code */}
                     <div>
                        <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                           WhatsApp Phone Number
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                           <div className="sm:col-span-5">
                              <Dropdown
                                 value={countryCode}
                                 onChange={(e) => setCountryCode(e.target.value)}
                                 className="w-full bg-zinc-900 border border-zinc-800 py-2 px-3 rounded-xl text-xs sm:text-sm text-zinc-200 outline-none cursor-pointer focus:border-[#daf4aa]">
                                 {COUNTRY_CODES.map((c) => (
                                    <option key={c.code} value={c.code} className="bg-zinc-900">
                                       {c.label}
                                    </option>
                                 ))}
                              </Dropdown>
                           </div>

                           <div className="sm:col-span-7">
                              <div className="relative">
                                 <InputControl
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="e.g. 9876543210"
                                    className="w-full px-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-[#daf4aa] transition-colors font-mono"
                                 />
                              </div>
                           </div>
                        </div>
                        <span className="text-[11px] text-zinc-500 mt-1 block">
                           Enter subscriber number without +, dashes, or leading 0.
                        </span>
                     </div>

                     {/* Prefilled Message */}
                     <div>
                        <div className="flex items-center justify-between mb-1.5">
                           <label className="text-xs font-semibold text-zinc-300">
                              Prefilled Message (Optional)
                           </label>
                           <span className="text-[11px] text-zinc-500 font-mono">
                              {message.length} chars
                           </span>
                        </div>
                        <Textarea
                           rows={4}
                           value={message}
                           onChange={(e) => setMessage(e.target.value)}
                           placeholder="Type the message you want visitors to send you automatically..."
                           className="w-full px-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-[#daf4aa] transition-colors resize-none customScrollbar"
                        />

                        {/* Quick Message Templates */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                           <span className="text-[11px] text-zinc-500 mr-1">Quick text:</span>
                           {[
                              { label: 'Customer Lead', text: 'Hi, I saw your catalog and would like to know the pricing.' },
                              { label: 'Support Help', text: 'Hello! I need assistance with an existing order.' },
                              { label: 'Book Appointment', text: 'Hi! I would like to book an appointment.' },
                              { label: 'Request Call', text: 'Hi, please call me back regarding this inquiry.' },
                           ].map((tmpl) => (
                              <button
                                 key={tmpl.label}
                                 type="button"
                                 onClick={() => setMessage(tmpl.text)}
                                 className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors">
                                 {tmpl.label}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Live Chat Bubble Preview */}
                     <div className="mt-2 rounded-xl border border-zinc-800 bg-[#0b141a] p-3.5 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-zinc-800/60 pb-1.5">
                           <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                              <MessageSquare size={12} />
                              <span>Simulated Chat Bubble</span>
                           </div>
                           <span className="text-zinc-500 font-mono">WhatsApp View</span>
                        </div>

                        <div className="flex justify-end pt-1">
                           <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-[#005c4b] p-3 text-xs text-white shadow-md">
                              <p className="whitespace-pre-wrap break-words">
                                 {message || 'Type a message above to see preview...'}
                              </p>
                              <div className="text-[10px] text-emerald-200/60 text-right mt-1 flex items-center justify-end gap-1">
                                 <span>12:00 PM</span>
                                 <span>✓✓</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Pane: Link & QR Code */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Share2 size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Shareable Link & QR Code
                        </span>
                     </div>
                     <span className="text-xs font-semibold text-emerald-400">
                        {result.isValid ? 'Ready to Use' : 'Incomplete'}
                     </span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {/* Generated wa.me Link Box */}
                     <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                           <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                              Official WhatsApp Link (wa.me)
                           </span>
                           <button
                              type="button"
                              onClick={handleCopyLink}
                              disabled={!result.link}
                              className="text-xs font-semibold text-[#daf4aa] hover:underline flex items-center gap-1 disabled:opacity-40">
                              <Copy size={12} />
                              <span>Copy</span>
                           </button>
                        </div>
                        <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 font-mono text-xs text-[#daf4aa] break-all select-all">
                           {result.link || 'Enter a valid number to generate link...'}
                        </div>
                     </div>

                     {/* Test Chat on WhatsApp Button */}
                     {result.link && (
                        <a
                           href={result.link}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold bg-[#25D366] text-black hover:bg-[#20ba5a] transition-all shadow-[0_0_20px_rgba(37,211,102,0.25)]">
                           <MessageSquare size={17} />
                           <span>Open in WhatsApp</span>
                           <ExternalLink size={14} className="opacity-75" />
                        </a>
                     )}

                     {/* QR Code Section */}
                     <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 flex flex-col items-center text-center">
                        <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                           High-Resolution QR Code
                        </span>

                        {qrDataUrl ? (
                           <div className="flex flex-col items-center">
                              <div className="p-3.5 bg-white rounded-2xl shadow-xl mb-3">
                                 <img
                                    src={qrDataUrl}
                                    alt="WhatsApp Click to Chat QR Code"
                                    className="w-40 h-40 object-contain"
                                 />
                              </div>

                              <button
                                 type="button"
                                 onClick={handleDownloadQR}
                                 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white hover:border-zinc-600 transition-colors shadow-sm">
                                 <QrIcon size={14} className="text-[#daf4aa]" />
                                 <span>Download High-Res PNG</span>
                              </button>
                           </div>
                        ) : (
                           <div className="h-40 w-40 flex items-center justify-center rounded-2xl border border-dashed border-zinc-800 text-xs text-zinc-500">
                              Awaiting valid number...
                           </div>
                        )}
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
