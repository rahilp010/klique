/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   FileText,
   Printer,
   Download,
   Copy,
   Trash2,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ChevronRight,
   Plus,
   IndianRupee,
   Building,
   User,
   Calendar,
   Check,
   ArrowRight,
   Eye,
   ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { calculateQuotation } from '../../../lib/calculations/quotation';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';
import { InputControl, Dropdown, Textarea } from '../../../components/ui/CustomControl';

/* -------------------------------------------------------------------------- */
/*  PRESETS & FAQS                                                            */
/* -------------------------------------------------------------------------- */

const PRESETS = [
   {
      id: 'website-redesign',
      name: 'Full Website Redesign & SEO',
      business: { name: 'Vanguard Digital', email: 'proposals@vanguard.io' },
      client: { name: 'Horizon Logistics', email: 'mgmt@horizonlogistics.in' },
      items: [
         { id: '1', desc: 'UI/UX Wireframing & Design System (8 Pages)', qty: 1, rate: 35000 },
         { id: '2', desc: 'Next.js Frontend & CMS Integration', qty: 1, rate: 55000 },
         { id: '3', desc: 'On-Page SEO & Core Web Vitals Optimization', qty: 1, rate: 15000 },
      ],
      taxRate: 18,
      validityDays: 30,
   },
   {
      id: 'mobile-mvp',
      name: 'Cross-Platform Mobile App MVP',
      business: { name: 'CodeCraft Labs', email: 'sales@codecraft.dev' },
      client: { name: 'FitPulse Health', email: 'founders@fitpulse.app' },
      items: [
         { id: '1', desc: 'React Native Mobile App (iOS & Android)', qty: 1, rate: 120000 },
         { id: '2', desc: 'Firebase Authentication & Database Architecture', qty: 1, rate: 30000 },
         { id: '3', desc: 'App Store & Google Play Store Submission', qty: 1, rate: 15000 },
      ],
      taxRate: 18,
      validityDays: 15,
   },
   {
      id: 'brand-identity',
      name: 'Complete Brand Identity Pack',
      business: { name: 'Studio Forma', email: 'hello@studioforma.co' },
      client: { name: 'Brew & Bean Cafe', email: 'orders@brewandbean.com' },
      items: [
         { id: '1', desc: 'Primary & Secondary Logo Suite with Vector Assets', qty: 1, rate: 25000 },
         { id: '2', desc: 'Packaging, Menu & Merchandise Guidelines', qty: 1, rate: 20000 },
         { id: '3', desc: 'Social Media Launch Templates (Figma)', qty: 1, rate: 10000 },
      ],
      taxRate: 18,
      validityDays: 30,
   },
   {
      id: 'it-maintenance',
      name: 'Annual Server & IT Support',
      business: { name: 'OpsShield Systems', email: 'support@opsshield.in' },
      client: { name: 'Medix Pharma', email: 'admin@medixpharma.in' },
      items: [
         { id: '1', desc: 'Monthly Linux Server Monitoring & Backups (12 Mos)', qty: 12, rate: 6000 },
         { id: '2', desc: 'Annual SSL, Firewall & Security Audit', qty: 1, rate: 18000 },
      ],
      taxRate: 18,
      validityDays: 45,
   },
];

const FAQS = [
   {
      question: 'What is the difference between a Quotation and an Invoice?',
      answer:
         'A Quotation (or Estimate) is a formal cost proposal submitted to a prospective client before work begins. Once the client approves the estimate and services are delivered, a Tax Invoice is issued to request payment.',
   },
   {
      question: 'How do I add payment milestones to this quote?',
      answer:
         'You can outline payment terms in the "Terms & Payment Milestones" box (e.g. 50% advance upon contract signing, 50% upon final delivery and acceptance).',
   },
   {
      question: 'How long are commercial quotations typically valid?',
      answer:
         'Commercial project quotes are typically valid for 15 to 30 days due to changing team availability and material or third-party API costs.',
   },
];

export default function QuotationGenerator() {
   // Identity
   const [quoteNumber, setQuoteNumber] = useState('QT-2026-101');
   const [quoteDate, setQuoteDate] = useState(() => new Date().toISOString().slice(0, 10));
   const [validityDays, setValidityDays] = useState('30');

   // Business Details
   const [businessName, setBusinessName] = useState('Vanguard Digital');
   const [businessEmail, setBusinessEmail] = useState('proposals@vanguard.io');
   const [businessPhone, setBusinessPhone] = useState('+91 98765 01234');
   const [businessAddress, setBusinessAddress] = useState('Indiranagar, Bengaluru, KA - 560038');

   // Client Details
   const [clientName, setClientName] = useState('Horizon Logistics');
   const [clientEmail, setClientEmail] = useState('mgmt@horizonlogistics.in');
   const [clientAddress, setClientAddress] = useState('Whitefield, Bengaluru, KA - 560066');

   // Scope Items
   const [items, setItems] = useState([
      { id: '1', desc: 'UI/UX Wireframing & Design System (8 Pages)', qty: 1, rate: 35000 },
      { id: '2', desc: 'Next.js Frontend & CMS Integration', qty: 1, rate: 55000 },
      { id: '3', desc: 'On-Page SEO & Core Web Vitals Optimization', qty: 1, rate: 15000 },
   ]);

   // Tax & Discounts
   const [taxRate, setTaxRate] = useState(18);
   const [discountType, setDiscountType] = useState('percent');
   const [discountValue, setDiscountValue] = useState('0');

   // Terms
   const [terms, setTerms] = useState(
      '• 50% Advance to initiate project.\n• 50% Balance on final delivery & sign-off.\n• Scope revisions subject to separate change request order.'
   );

   // UI State
   const [showQuickSetup, setShowQuickSetup] = useState(false);
   const [selectedPreset, setSelectedPreset] = useState('');
   const [openFaq, setOpenFaq] = useState(null);
   const [activeTab, setActiveTab] = useState('edit');

   // Toast State
   const [toast, setToast] = useState({ message: '', visible: false });

   const showToast = (message) => {
      setToast({ message, visible: true });
      setTimeout(() => {
         setToast({ message: '', visible: false });
      }, 2500);
   };

   // Calculations
   const result = useMemo(() => {
      return calculateQuotation({
         items,
         discountType,
         discountValue,
         taxRate,
         validityDays,
      });
   }, [items, discountType, discountValue, taxRate, validityDays]);

   // Line manipulation
   const handleAddItem = () => {
      setItems([
         ...items,
         { id: String(Date.now()), desc: 'Deliverable milestone / phase', qty: 1, rate: 10000 },
      ]);
   };

   const handleRemoveItem = (id) => {
      if (items.length > 1) {
         setItems(items.filter((it) => it.id !== id));
      }
   };

   const handleItemChange = (id, field, value) => {
      setItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
   };

   const applyPreset = (preset) => {
      setSelectedPreset(preset.id);
      setBusinessName(preset.business.name);
      setBusinessEmail(preset.business.email);
      setClientName(preset.client.name);
      setClientEmail(preset.client.email);
      setItems(preset.items);
      setTaxRate(preset.taxRate);
      setValidityDays(String(preset.validityDays));
      showToast(`Applied estimate preset: ${preset.name}`);
   };

   const handleReset = () => {
      setQuoteNumber('QT-2026-101');
      setBusinessName('Vanguard Digital');
      setBusinessEmail('proposals@vanguard.io');
      setClientName('Horizon Logistics');
      setClientEmail('mgmt@horizonlogistics.in');
      setItems([
         { id: '1', desc: 'UI/UX Wireframing & Design System (8 Pages)', qty: 1, rate: 35000 },
         { id: '2', desc: 'Next.js Frontend & CMS Integration', qty: 1, rate: 55000 },
         { id: '3', desc: 'On-Page SEO & Core Web Vitals Optimization', qty: 1, rate: 15000 },
      ]);
      setTaxRate(18);
      setDiscountValue('0');
      setValidityDays('30');
      setSelectedPreset('');
      trackToolReset('quotation-generator');
      showToast('Reset quotation generator.');
   };

   const handlePrint = () => {
      trackToolDownload('quotation-generator', { fileType: 'pdf' });
      window.print();
   };

   const handleCopySummary = () => {
      const summary = `Commercial Quotation ${quoteNumber}:
Provider: ${businessName}
Client: ${clientName}
Total Scope Value: ₹${result.grandTotal.toLocaleString('en-IN')} (incl. ${taxRate}% GST)
Valid Until: ${result.expiryDateFormatted}`;
      navigator.clipboard.writeText(summary);
      trackToolCopy('quotation-generator', { outputType: 'summary', size: summary.length });
      showToast('Copied quotation summary!');
   };

   const relatedTools = useMemo(() => getRelatedTools('quotation-generator', 3), []);

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
            title="Quotation Generator — Create Client Cost Estimates & Proposals"
            description="Create professional project cost estimates and quotation proposals with milestone breakdown, tax calculation, and print PDF download."
            keywords="quotation generator, cost estimate maker, proposal pricing, commercial quote online, print quotation pdf"
         />

         {/* Global Navbar */}
         <div className="relative z-[100] w-full mb-6 print:hidden">
            <Navbar />
         </div>

         {/* Main Content Area */}
         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Header Section */}
            <div className="mb-6 flex flex-col gap-3 print:hidden">
               <div className="inline-flex items-center gap-2 self-start rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-[#daf4aa] backdrop-blur-sm">
                  <FileText size={13} className="text-[#daf4aa]" />
                  <span>Business & Finance Suite</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">Proposals & Estimates</span>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        Quotation Generator
                     </h1>
                     <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                        Generate polished commercial price quotations with structured deliverables, validity tracking, milestones, and instant PDF download.
                     </p>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex items-center p-1 rounded-full bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-xl self-start sm:self-auto shadow-inner">
                     <button
                        type="button"
                        onClick={() => setActiveTab('edit')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                           activeTab === 'edit'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        <span>Edit Scope</span>
                     </button>
                     <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                           activeTab === 'preview'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        <Eye size={13} />
                        <span>Sheet Preview</span>
                     </button>
                  </div>
               </div>
            </div>

            {/* Collapsible Quick Presets Accordion */}
            <div className="mb-6 rounded-2xl border border-zinc-800/80 bg-[#121215] overflow-hidden shadow-lg print:hidden">
               <button
                  type="button"
                  onClick={() => setShowQuickSetup(!showQuickSetup)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors text-left">
                  <div className="flex items-center gap-2">
                     <Sparkles size={15} className="text-[#daf4aa]" />
                     <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                        Quick Proposal Scenarios & Templates
                     </span>
                     <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
                        (Web Redesign, Mobile MVP, Brand Identity, IT Maintenance)
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
                                    {preset.business.name} • {preset.items.length} Deliverables
                                 </div>
                              </button>
                           ))}
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* Quick Actions Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-[#121215] px-4 py-3 shadow-md print:hidden">
               <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                     Quick Actions
                  </span>
                  <span className="h-3 w-[1px] bg-zinc-800" />
                  <span className="flex items-center gap-1.5 text-xs text-zinc-400">
                     <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                     {quoteNumber} • Valid until {result.expiryDateFormatted}
                  </span>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <button
                     type="button"
                     onClick={handlePrint}
                     className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-[#cbf094] shadow-sm">
                     <Printer size={13} />
                     <span>Print / Save PDF</span>
                  </button>

                  <button
                     type="button"
                     onClick={handleCopySummary}
                     className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white">
                     <Copy size={13} />
                     <span>Copy Summary</span>
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
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 sm:px-4 sm:py-2.5 text-xs print:hidden">
               <div>
                  <span className="text-zinc-500 block text-[11px]">Subtotal (Pre-Tax)</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     ₹{result.taxableAmount.toLocaleString('en-IN')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Estimated Tax ({taxRate}%)</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     ₹{result.taxAmount.toLocaleString('en-IN')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Total Estimated Quote</span>
                  <span className="font-semibold text-[#daf4aa] text-sm">
                     ₹{result.grandTotal.toLocaleString('en-IN')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Quote Expiry</span>
                  <span className="font-semibold text-emerald-400 text-sm">
                     {result.expiryDateFormatted} ({validityDays}d)
                  </span>
               </div>
            </div>

            {/* Dual Pane Layout (Form + Sheet) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               {/* Left Pane: Editor */}
               <div className={`lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl print:hidden ${activeTab === 'preview' ? 'hidden lg:flex' : ''}`}>
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Quotation Scope & Milestones
                        </span>
                     </div>
                     <span className="text-[11px] font-mono text-zinc-500">Live Compute</span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {/* Meta Inputs */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                           <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                              Quotation Number
                           </label>
                           <InputControl
                              type="text"
                              value={quoteNumber}
                              onChange={(e) => setQuoteNumber(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                        </div>
                        <div>
                           <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                              Quotation Date
                           </label>
                           <InputControl
                              type="date"
                              value={quoteDate}
                              onChange={(e) => setQuoteDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                        </div>
                        <div>
                           <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                              Validity (Days)
                           </label>
                           <Dropdown
                              value={validityDays}
                              onChange={(e) => setValidityDays(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]">
                              <option value="15">15 Days</option>
                              <option value="30">30 Days</option>
                              <option value="45">45 Days</option>
                              <option value="60">60 Days</option>
                           </Dropdown>
                        </div>
                     </div>

                     {/* Parties */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                        <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 flex flex-col gap-2">
                           <span className="text-xs font-semibold text-[#daf4aa] flex items-center gap-1.5">
                              <Building size={13} />
                              <span>Prepared By (Your Agency)</span>
                           </span>
                           <InputControl
                              type="text"
                              placeholder="Business / Freelancer Name"
                              value={businessName}
                              onChange={(e) => setBusinessName(e.target.value)}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                           <InputControl
                              type="text"
                              placeholder="Email & Phone"
                              value={businessEmail}
                              onChange={(e) => setBusinessEmail(e.target.value)}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                           <Textarea
                              rows={2}
                              placeholder="Office Address"
                              value={businessAddress}
                              onChange={(e) => setBusinessAddress(e.target.value)}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa] resize-none"
                           />
                        </div>

                        <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 flex flex-col gap-2">
                           <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                              <User size={13} />
                              <span>Prepared For (Prospective Client)</span>
                           </span>
                           <InputControl
                              type="text"
                              placeholder="Client / Company Name"
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                           <InputControl
                              type="text"
                              placeholder="Client Email"
                              value={clientEmail}
                              onChange={(e) => setClientEmail(e.target.value)}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                           <Textarea
                              rows={2}
                              placeholder="Client Address"
                              value={clientAddress}
                              onChange={(e) => setClientAddress(e.target.value)}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa] resize-none"
                           />
                        </div>
                     </div>

                     {/* Deliverables List */}
                     <div className="pt-2 border-t border-zinc-800/80">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-semibold text-zinc-300">
                              Deliverables & Milestones ({items.length})
                           </span>
                           <button
                              type="button"
                              onClick={handleAddItem}
                              className="flex items-center gap-1 text-xs font-semibold text-[#daf4aa] hover:text-[#daf4aa]/80 transition-colors">
                              <Plus size={14} />
                              <span>Add Scope Item</span>
                           </button>
                        </div>

                        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto customScrollbar pr-1">
                           {items.map((it) => (
                              <div
                                 key={it.id}
                                 className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                                 <InputControl
                                    type="text"
                                    value={it.desc}
                                    onChange={(e) => handleItemChange(it.id, 'desc', e.target.value)}
                                    placeholder="Scope milestone description"
                                    className="col-span-6 bg-transparent text-xs text-zinc-200 outline-none px-2 py-1 rounded border border-transparent focus:border-zinc-700"
                                 />
                                 <InputControl
                                    type="number"
                                    min="1"
                                    value={it.qty}
                                    onChange={(e) => handleItemChange(it.id, 'qty', e.target.value)}
                                    placeholder="Qty"
                                    className="col-span-2 bg-zinc-900 text-xs text-center text-zinc-200 rounded border border-zinc-800 py-1"
                                 />
                                 <InputControl
                                    type="number"
                                    min="0"
                                    value={it.rate}
                                    onChange={(e) => handleItemChange(it.id, 'rate', e.target.value)}
                                    placeholder="Rate"
                                    className="col-span-3 bg-zinc-900 text-xs text-right pr-2 text-zinc-200 rounded border border-zinc-800 py-1"
                                 />
                                 <button
                                    type="button"
                                    onClick={() => handleRemoveItem(it.id)}
                                    disabled={items.length <= 1}
                                    className="col-span-1 text-zinc-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors text-center">
                                    <Trash2 size={13} className="mx-auto" />
                                 </button>
                              </div>
                           ))}
                        </div>
                     </div>

                     {/* Tax, Discounts & Terms */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                        <div>
                           <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                              Applicable Tax Rate
                           </label>
                           <div className="flex items-center gap-1.5 mb-2">
                              {[0, 5, 12, 18].map((r) => (
                                 <button
                                    key={r}
                                    type="button"
                                    onClick={() => setTaxRate(r)}
                                    className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${
                                       taxRate === r
                                          ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                                    }`}>
                                    {r}%
                                 </button>
                              ))}
                           </div>

                           <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                              Project Discount
                           </label>
                           <div className="flex items-center gap-2">
                              <InputControl
                                 type="number"
                                 min="0"
                                 value={discountValue}
                                 onChange={(e) => setDiscountValue(e.target.value)}
                                 placeholder="0"
                                 className="w-full px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100"
                              />
                              <Dropdown
                                 value={discountType}
                                 onChange={(e) => setDiscountType(e.target.value)}
                                 className="bg-zinc-900 border border-zinc-800 text-xs rounded-lg px-2 py-1 text-zinc-200">
                                 <option value="percent">% Off</option>
                                 <option value="fixed">₹ Flat</option>
                              </Dropdown>
                           </div>
                        </div>

                        <div>
                           <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                              Terms & Conditions
                           </label>
                           <Textarea
                              rows={3}
                              value={terms}
                              onChange={(e) => setTerms(e.target.value)}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa] resize-none"
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Pane: Live Printable Quotation Sheet */}
               <div className={`lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl print:border-none print:shadow-none print:bg-white print:text-black ${activeTab === 'edit' ? 'hidden lg:flex' : ''}`}>
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50 print:hidden">
                     <div className="flex items-center gap-2">
                        <Printer size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Commercial Quotation Sheet
                        </span>
                     </div>
                     <button
                        type="button"
                        onClick={handlePrint}
                        className="text-xs font-semibold text-[#daf4aa] hover:underline flex items-center gap-1">
                        <Download size={12} />
                        <span>Save PDF</span>
                     </button>
                  </div>

                  {/* Clean A4 Styled Sheet */}
                  <div className="p-6 sm:p-8 bg-[#0e0e11] print:bg-white print:p-0 text-zinc-100 print:text-black font-sans min-h-[600px] flex flex-col justify-between">
                     <div>
                        {/* Top Header */}
                        <div className="flex items-start justify-between border-b border-zinc-800 print:border-gray-300 pb-5 mb-5">
                           <div>
                              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white print:text-black">
                                 {businessName}
                              </h2>
                              <p className="text-xs text-zinc-400 print:text-gray-600 mt-1">
                                 {businessAddress}
                              </p>
                              <p className="text-xs text-zinc-400 print:text-gray-600">
                                 {businessEmail} • {businessPhone}
                              </p>
                           </div>

                           <div className="text-right">
                              <span className="text-xs uppercase font-extrabold tracking-widest text-[#daf4aa] print:text-black block">
                                 PRICE QUOTATION
                              </span>
                              <div className="text-sm font-mono font-bold text-white print:text-black mt-1">
                                 {quoteNumber}
                              </div>
                              <div className="text-[11px] text-zinc-400 print:text-gray-600 mt-1">
                                 Date: {quoteDate}
                              </div>
                              <div className="text-[11px] text-emerald-400 print:text-gray-800 font-semibold">
                                 Valid Until: {result.expiryDateFormatted}
                              </div>
                           </div>
                        </div>

                        {/* Prepared For */}
                        <div className="mb-6 p-3.5 rounded-xl bg-zinc-900/60 print:bg-gray-50 border border-zinc-800 print:border-gray-200">
                           <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 print:text-gray-500 block mb-1">
                              PREPARED FOR:
                           </span>
                           <div className="font-bold text-sm text-white print:text-black">{clientName}</div>
                           <div className="text-xs text-zinc-400 print:text-gray-600 mt-0.5">{clientAddress}</div>
                           <div className="text-xs text-zinc-400 print:text-gray-600">{clientEmail}</div>
                        </div>

                        {/* Deliverables Table */}
                        <div className="overflow-x-auto mb-6">
                           <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                 <tr className="border-b border-zinc-800 print:border-gray-300 text-zinc-400 print:text-gray-600">
                                    <th className="py-2.5 font-semibold">Scope & Deliverable</th>
                                    <th className="py-2.5 text-center font-semibold">Qty</th>
                                    <th className="py-2.5 text-right font-semibold">Unit Rate</th>
                                    <th className="py-2.5 text-right font-semibold">Estimated Amount</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-800/60 print:divide-gray-200 text-zinc-200 print:text-black">
                                 {result.items.map((it) => (
                                    <tr key={it.id}>
                                       <td className="py-2.5 pr-2">
                                          <div className="font-medium">{it.desc}</div>
                                       </td>
                                       <td className="py-2.5 text-center">{it.qty}</td>
                                       <td className="py-2.5 text-right font-mono">
                                          ₹{it.rate.toLocaleString('en-IN')}
                                       </td>
                                       <td className="py-2.5 text-right font-mono font-semibold">
                                          ₹{it.amount.toLocaleString('en-IN')}
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>

                        {/* Totals Summary */}
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-t border-zinc-800 print:border-gray-300 pt-4 mb-6">
                           <div className="max-w-sm">
                              <span className="text-[10px] uppercase font-bold text-zinc-500 print:text-gray-500 block mb-1">
                                 Terms & Acceptance:
                              </span>
                              <div className="text-xs text-zinc-400 print:text-gray-700 whitespace-pre-wrap">
                                 {terms}
                              </div>
                           </div>

                           <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
                              <div className="flex justify-between text-zinc-400 print:text-gray-600">
                                 <span>Subtotal:</span>
                                 <span className="font-mono text-zinc-200 print:text-black">
                                    ₹{result.subtotal.toLocaleString('en-IN')}
                                 </span>
                              </div>
                              {result.discountAmount > 0 && (
                                 <div className="flex justify-between text-zinc-400 print:text-gray-600">
                                    <span>Discount:</span>
                                    <span className="font-mono text-emerald-400 print:text-green-600">
                                       -₹{result.discountAmount.toLocaleString('en-IN')}
                                    </span>
                                 </div>
                              )}
                              <div className="flex justify-between text-zinc-400 print:text-gray-600">
                                 <span>Estimated Tax ({taxRate}%):</span>
                                 <span className="font-mono text-zinc-200 print:text-black">
                                    ₹{result.taxAmount.toLocaleString('en-IN')}
                                 </span>
                              </div>
                              <div className="border-t border-zinc-800 print:border-gray-400 pt-2 flex justify-between font-bold text-sm text-white print:text-black">
                                 <span>Total Estimated:</span>
                                 <span className="text-[#daf4aa] print:text-black font-extrabold text-base">
                                    ₹{result.grandTotal.toLocaleString('en-IN')}
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Signoff Block */}
                     <div className="border-t border-zinc-800 print:border-gray-300 pt-6 flex justify-between items-end text-xs text-zinc-400 print:text-gray-600">
                        <div>
                           <div className="h-10 border-b border-zinc-700 print:border-gray-400 w-40 mb-1" />
                           <span>Authorized Signatory</span>
                        </div>
                        <div className="text-right">
                           <div className="h-10 border-b border-zinc-700 print:border-gray-400 w-40 mb-1" />
                           <span>Client Acceptance Signature</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Bottom FAQ Section */}
            <div className="mt-12 rounded-2xl border border-zinc-800 bg-[#121215] p-6 shadow-xl print:hidden">
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
               <div className="mt-10 mb-8 print:hidden">
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

