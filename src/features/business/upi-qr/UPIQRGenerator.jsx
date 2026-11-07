/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import {
   QrCode,
   IndianRupee,
   Copy,
   Download,
   Trash2,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ChevronRight,
   ExternalLink,
   ShieldCheck,
   ArrowRight,
   Store,
   UserCheck,
   Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { generateUPIURI } from '../../../lib/calculations/upiqr';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';
import { InputControl } from '../../../components/ui/CustomControl';

/* -------------------------------------------------------------------------- */
/*  PRESETS & FAQS                                                            */
/* -------------------------------------------------------------------------- */

const PRESETS = [
   {
      id: 'freelancer',
      name: 'Freelancer Design Fee (₹15,000)',
      vpa: 'apexstudio@okhdfcbank',
      payeeName: 'Apex Studio Design',
      amount: '15000',
      note: 'Website UI/UX Milestone',
   },
   {
      id: 'retail',
      name: 'Retail Store Checkout (Dynamic Amount)',
      vpa: 'urbanstore@upi',
      payeeName: 'Urban Mart Superstore',
      amount: '',
      note: 'Store POS Purchase',
   },
   {
      id: 'cafe',
      name: 'Cafe & Bakery Order (₹450)',
      vpa: 'artisanbrew@paytm',
      payeeName: 'The Artisan Bakery',
      amount: '450',
      note: 'Coffee and Pastry Order',
   },
   {
      id: 'donation',
      name: 'Community Charity Drive (₹500)',
      vpa: 'carefoundation@sbi',
      payeeName: 'Care Foundation NGO',
      amount: '500',
      note: 'Education Support Donation',
   },
];

const FAQS = [
   {
      question: 'Which UPI apps support this QR code?',
      answer:
         'This QR code is generated according to standard NPCI (National Payments Corporation of India) UPI specifications. It works seamlessly across Google Pay (GPay), PhonePe, Paytm, BHIM, Cred, Amazon Pay, and all major Indian banking UPI apps.',
   },
   {
      question: 'Can I leave the payment amount empty?',
      answer:
         'Yes! If you leave the amount field empty, customers can scan the QR code and type in any custom amount of their choice when paying.',
   },
   {
      question: 'Can I print this QR code on physical business displays?',
      answer:
         'Absolutely. Click the "Download High-Res PNG" button to export a crisp 400px QR code suitable for counter stands, shop stickers, restaurant tables, flyers, and invoice sheets.',
   },
   {
      question: 'Does scanning this QR code confirm payment automatically?',
      answer:
         'No. Scanning this QR code initiates the payment request on the customer\'s mobile UPI app. Payment confirmation is delivered directly to your UPI bank app or SMS notification.',
   },
];

export default function UPIQRGenerator() {
   // Core Inputs
   const [vpa, setVpa] = useState('apexstudio@okhdfcbank');
   const [payeeName, setPayeeName] = useState('Apex Studio');
   const [amount, setAmount] = useState('2500');
   const [note, setNote] = useState('Invoice Payment');
   const [qrDataUrl, setQrDataUrl] = useState('');

   // UI State
   const [showQuickSetup, setShowQuickSetup] = useState(false);
   const [selectedPreset, setSelectedPreset] = useState('');
   const [openFaq, setOpenFaq] = useState(null);

   // Toast State
   const [toast, setToast] = useState({ message: '', visible: false });

   const showToast = (message) => {
      setToast({ message, visible: true });
      setTimeout(() => {
         setToast({ message: '', visible: false });
      }, 2500);
   };

   // Generate URI
   const result = useMemo(() => {
      return generateUPIURI({
         vpa,
         payeeName,
         amount,
         note,
      });
   }, [vpa, payeeName, amount, note]);

   // Generate QR Code data URL
   useEffect(() => {
      if (result.isValid && result.uri) {
         QRCode.toDataURL(result.uri, {
            width: 400,
            margin: 2,
            color: {
               dark: '#000000',
               light: '#ffffff',
            },
         })
            .then((url) => setQrDataUrl(url))
            .catch((err) => console.error('Failed to generate UPI QR:', err));
      } else {
         setQrDataUrl('');
      }
   }, [result.uri, result.isValid]);

   const applyPreset = (preset) => {
      setSelectedPreset(preset.id);
      setVpa(preset.vpa);
      setPayeeName(preset.payeeName);
      setAmount(preset.amount);
      setNote(preset.note);
      showToast(`Applied preset: ${preset.name}`);
   };

   const handleReset = () => {
      setVpa('apexstudio@okhdfcbank');
      setPayeeName('Apex Studio');
      setAmount('2500');
      setNote('Invoice Payment');
      setSelectedPreset('');
      trackToolReset('upi-qr-generator');
      showToast('Reset UPI QR generator.');
   };

   const handleCopyURI = () => {
      if (!result.uri) return;
      navigator.clipboard.writeText(result.uri);
      trackToolCopy('upi-qr-generator', { outputType: 'upi-uri', size: result.uri.length });
      showToast('Copied UPI Payment URI!');
   };

   const handleDownloadQR = () => {
      if (!qrDataUrl) return;
      const a = document.createElement('a');
      a.href = qrDataUrl;
      a.download = `upi-qr-${vpa || 'pay'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      trackToolDownload('upi-qr-generator', { fileType: 'png' });
      showToast('Downloaded UPI QR Code (PNG)!');
   };

   const relatedTools = useMemo(() => getRelatedTools('upi-qr-generator', 3), []);

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
            title="UPI QR Generator — Create Custom Payment QR Codes (GPay, PhonePe, Paytm)"
            description="Create custom UPI payment QR codes with merchant name, pre-set amounts, and notes. Compatible with GPay, PhonePe, Paytm, and BHIM."
            keywords="upi qr generator, create upi qr code, custom amount upi qr, accept upi payments, gpay qr generator"
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
                  <QrCode size={13} className="text-[#daf4aa]" />
                  <span>Business & Finance Suite</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">UPI Payment QR</span>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        UPI QR Code Generator
                     </h1>
                     <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                        Generate official NPCI-compliant UPI payment QR codes with pre-filled amounts, payee names, and notes for instant acceptance.
                     </p>
                  </div>

                  <div className="flex items-center gap-2">
                     <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        NPCI UPI Compatible
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
                        Quick Payment Presets & Scenarios
                     </span>
                     <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
                        (Freelancer, Store Checkout, Cafe, Donation)
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
                                    {preset.vpa} • {preset.amount ? `₹${preset.amount}` : 'Open Amount'}
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
                     <span className={`h-2 w-2 rounded-full ${result.isValid ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                     {result.isValid ? 'Valid NPCI VPA' : 'Invalid UPI Address'}
                  </span>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <button
                     type="button"
                     onClick={handleDownloadQR}
                     disabled={!qrDataUrl}
                     className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-[#cbf094] disabled:opacity-50 shadow-sm">
                     <Download size={13} />
                     <span>Download QR (PNG)</span>
                  </button>

                  <button
                     type="button"
                     onClick={handleCopyURI}
                     disabled={!result.uri}
                     className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white disabled:opacity-50">
                     <Copy size={13} />
                     <span>Copy UPI Link</span>
                  </button>

                  {result.uri && (
                     <a
                        href={result.uri}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white">
                        <ExternalLink size={13} />
                        <span>Open UPI App</span>
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
                  <span className="text-zinc-500 block text-[11px]">Payee VPA</span>
                  <span className="font-semibold text-zinc-200 text-sm font-mono truncate block">
                     {vpa || 'Not entered'}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Preset Amount</span>
                  <span className="font-semibold text-[#daf4aa] text-sm">
                     {amount ? `₹${Number(amount).toLocaleString('en-IN')}` : 'Any (Payer sets)'}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Supported Apps</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     GPay, PhonePe, Paytm
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">QR Resolution</span>
                  <span className="font-semibold text-emerald-400 text-sm">
                     400px HD
                  </span>
               </div>
            </div>

            {/* Dual Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               {/* Left Pane: Configuration */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Store size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Payment Details & VPA
                        </span>
                     </div>
                     <span className="text-[11px] font-mono text-zinc-500">NPCI Schema</span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {/* UPI VPA */}
                     <div>
                        <div className="flex items-center justify-between mb-1.5">
                           <label className="text-xs font-semibold text-zinc-300">
                              UPI Virtual Payment Address (VPA / UPI ID)
                           </label>
                           {vpa && (
                              <span className={`text-[11px] font-semibold ${result.isValid ? 'text-emerald-400' : 'text-rose-400'}`}>
                                 {result.isValid ? 'Valid format' : 'Invalid VPA'}
                              </span>
                           )}
                        </div>
                        <InputControl
                           type="text"
                           value={vpa}
                           onChange={(e) => setVpa(e.target.value)}
                           placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                           className="w-full px-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-[#daf4aa] transition-colors font-mono"
                        />
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                           <span className="text-[11px] text-zinc-500 mr-1">Sample handles:</span>
                           {['@upi', '@okhdfcbank', '@okaxis', '@paytm', '@ybl', '@sbi'].map((h) => (
                              <button
                                 key={h}
                                 type="button"
                                 onClick={() => {
                                    const base = vpa.includes('@') ? vpa.split('@')[0] : vpa || 'merchant';
                                    setVpa(base + h);
                                 }}
                                 className="text-xs px-2 py-0.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white">
                                 {h}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Payee / Business Name */}
                     <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                           Payee / Merchant Name
                        </label>
                        <InputControl
                           type="text"
                           value={payeeName}
                           onChange={(e) => setPayeeName(e.target.value)}
                           placeholder="e.g. Apex Studio or Alex Morgan"
                           className="w-full px-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-[#daf4aa] transition-colors"
                        />
                     </div>

                     {/* Amount */}
                     <div>
                        <div className="flex items-center justify-between mb-1.5">
                           <label className="text-xs font-semibold text-zinc-300">
                              Payment Amount (₹ INR — Leave blank for open amount)
                           </label>
                           <button
                              type="button"
                              onClick={() => setAmount('')}
                              className="text-[11px] text-[#daf4aa] hover:underline">
                              Clear (Any Amount)
                           </button>
                        </div>
                        <div className="relative mb-2">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-semibold">
                              ₹
                           </span>
                           <InputControl
                              type="number"
                              min="0"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="Leave blank for customer to enter amount"
                              className="w-full pl-7 pr-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-[#daf4aa] transition-colors"
                           />
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                           {[100, 250, 500, 1000, 2500, 5000].map((a) => (
                              <button
                                 key={a}
                                 type="button"
                                 onClick={() => setAmount(String(a))}
                                 className="text-xs px-2.5 py-1 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white transition-colors">
                                 ₹{a}
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* Transaction Note */}
                     <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                           Transaction Note / Reference (Optional)
                        </label>
                        <InputControl
                           type="text"
                           value={note}
                           onChange={(e) => setNote(e.target.value)}
                           placeholder="e.g. Invoice INV-104 or Table 4"
                           className="w-full px-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-[#daf4aa] transition-colors"
                        />
                     </div>
                  </div>
               </div>

               {/* Right Pane: Live QR Display */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <QrCode size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Payment QR Code Stand
                        </span>
                     </div>
                     <span className="text-xs font-semibold text-emerald-400">
                        Scan to Pay
                     </span>
                  </div>

                  <div className="p-6 flex flex-col items-center justify-center text-center">
                     {/* Clean White Card Mockup */}
                     <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-zinc-900 border border-zinc-200 flex flex-col items-center">
                        {/* Header badge */}
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-xs font-bold text-zinc-800 mb-3">
                           <IndianRupee size={13} className="text-emerald-600" />
                           <span>BHIM UPI PAYMENT</span>
                        </div>

                        <h3 className="font-black text-lg text-zinc-950 truncate max-w-[280px]">
                           {payeeName || 'MERCHANT NAME'}
                        </h3>
                        <p className="font-mono text-xs text-zinc-600 mt-0.5 mb-4">
                           {vpa}
                        </p>

                        {/* QR Code image */}
                        {qrDataUrl ? (
                           <div className="p-2 border border-zinc-200 rounded-2xl shadow-inner bg-white mb-4">
                              <img
                                 src={qrDataUrl}
                                 alt="UPI Payment QR Code"
                                 className="w-52 h-52 object-contain"
                              />
                           </div>
                        ) : (
                           <div className="w-52 h-52 flex items-center justify-center rounded-2xl border border-dashed border-zinc-300 text-xs text-zinc-400 mb-4">
                              Enter a valid UPI ID
                           </div>
                        )}

                        {/* Amount Pill */}
                        {amount ? (
                           <div className="w-full py-2 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-base mb-3">
                              ₹{Number(amount).toLocaleString('en-IN')}
                           </div>
                        ) : (
                           <div className="w-full py-1.5 px-4 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs font-semibold mb-3">
                              Payer can enter any amount
                           </div>
                        )}

                        {/* Accepted Apps Logos / Footer */}
                        <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-medium border-t border-zinc-100 pt-3 w-full">
                           <span>GPay</span>
                           <span>•</span>
                           <span>PhonePe</span>
                           <span>•</span>
                           <span>Paytm</span>
                           <span>•</span>
                           <span>Cred</span>
                           <span>•</span>
                           <span>BHIM</span>
                        </div>
                     </div>

                     {/* Download & Action Buttons */}
                     <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                        <button
                           type="button"
                           onClick={handleDownloadQR}
                           disabled={!qrDataUrl}
                           className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#daf4aa] text-zinc-950 text-xs font-bold hover:bg-[#cbf094] transition-colors disabled:opacity-40 shadow-sm">
                           <Download size={14} />
                           <span>Download QR Sticker (PNG)</span>
                        </button>
                        <button
                           type="button"
                           onClick={handleCopyURI}
                           disabled={!result.uri}
                           className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs font-semibold hover:text-white transition-colors disabled:opacity-40">
                           <Copy size={14} />
                           <span>Copy URI</span>
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

