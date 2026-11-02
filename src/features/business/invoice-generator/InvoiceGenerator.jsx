/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useRef } from 'react';
import {
   FileSpreadsheet,
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
   QrCode,
   Check,
   ArrowRight,
   Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { calculateInvoice, numberToWordsINR } from '../../../lib/calculations/invoice';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*  PRESETS & FAQS                                                            */
/* -------------------------------------------------------------------------- */

const PRESETS = [
   {
      id: 'freelance-dev',
      name: 'Freelance Web Dev Retainer',
      business: { name: 'Apex Studio', email: 'billing@apexstudio.io', gstin: '27AAAAA0000A1Z5' },
      client: { name: 'NextGen Retail Ltd', email: 'accounts@nextgen.com', gstin: '27BBBBB1111B1Z2' },
      items: [
         { id: '1', desc: 'React & Node.js Platform Development (March)', qty: 1, rate: 60000 },
         { id: '2', desc: 'Cloud Infrastructure & DevOps Maintenance', qty: 1, rate: 15000 },
      ],
      taxRate: 18,
      supplyType: 'intra',
   },
   {
      id: 'marketing-agency',
      name: 'Digital Marketing & SEO Sprint',
      business: { name: 'GrowthSpark Media', email: 'hello@growthspark.in', gstin: '24CCCCC2222C1Z8' },
      client: { name: 'UrbanFit Gyms', email: 'finance@urbanfit.in', gstin: '24DDDDD3333D1Z4' },
      items: [
         { id: '1', desc: 'Monthly Meta & Google Ad Management', qty: 1, rate: 28000 },
         { id: '2', desc: 'Technical SEO Audit & Speed Optimization', qty: 1, rate: 12000 },
      ],
      taxRate: 18,
      supplyType: 'intra',
   },
   {
      id: 'ui-ux-design',
      name: 'Mobile App UI/UX Design System',
      business: { name: 'PixelCraft Design', email: 'rahil@pixelcraft.co', gstin: '' },
      client: { name: 'SwiftPay Inc', email: 'contact@swiftpay.io', gstin: '' },
      items: [
         { id: '1', desc: 'Figma Design System & Token Components', qty: 1, rate: 45000 },
         { id: '2', desc: 'Interactive Prototype & Usability Testing', qty: 1, rate: 20000 },
      ],
      taxRate: 18,
      supplyType: 'inter',
   },
   {
      id: 'consulting',
      name: 'Executive Tech Advisory (Hourly)',
      business: { name: 'CloudScale Consulting', email: 'contact@cloudscale.biz', gstin: '07EEEEE4444E1Z9' },
      client: { name: 'Finovate Capital', email: 'invoices@finovate.com', gstin: '07FFFFF5555F1Z3' },
      items: [
         { id: '1', desc: 'Architectural Review & Security Audit (Hours)', qty: 25, rate: 2500 },
      ],
      taxRate: 18,
      supplyType: 'intra',
   },
];

const FAQS = [
   {
      question: 'Is this invoice legally valid for GST filing in India?',
      answer:
         'Yes! It includes all mandatory GST invoice fields: supplier name, GSTIN, recipient details, invoice serial number, date, HSN/SAC description, CGST/SGST/IGST breakdown, and total in words.',
   },
   {
      question: 'How do I save the invoice as a PDF?',
      answer:
         'Click the "Print / Save PDF" button. In your browser print dialog, select "Save as PDF" as the destination. The invoice uses dedicated print styling that hides all UI buttons and produces a clean A4 sheet.',
   },
   {
      question: 'Does this tool store my client or pricing details on a server?',
      answer:
         'No. Everything runs strictly in your web browser. No confidential client names, rates, or bank details are ever transmitted or saved on remote servers.',
   },
   {
      question: 'How does CGST + SGST vs IGST work?',
      answer:
         'For Intra-state sales (buyer and seller in the same state), GST is split equally into CGST and SGST (e.g. 9% + 9% = 18%). For Inter-state sales (different states), IGST is applied at the full 18%.',
   },
];

export default function InvoiceGenerator() {
   // Invoice Identity
   const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-001');
   const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
   const [dueDate, setDueDate] = useState(() => {
      const d = new Date();
      d.setDate(d.getDate() + 15);
      return d.toISOString().slice(0, 10);
   });

   // Business Details
   const [businessName, setBusinessName] = useState('Apex Studio');
   const [businessEmail, setBusinessEmail] = useState('billing@apexstudio.io');
   const [businessPhone, setBusinessPhone] = useState('+91 98765 43210');
   const [businessGstin, setBusinessGstin] = useState('27AAAAA0000A1Z5');
   const [businessAddress, setBusinessAddress] = useState('Bandra West, Mumbai, MH - 400050');

   // Client Details
   const [clientName, setClientName] = useState('NextGen Retail Ltd');
   const [clientEmail, setClientEmail] = useState('accounts@nextgen.com');
   const [clientPhone, setClientPhone] = useState('+91 91234 56789');
   const [clientGstin, setClientGstin] = useState('27BBBBB1111B1Z2');
   const [clientAddress, setClientAddress] = useState('Andheri East, Mumbai, MH - 400069');

   // Line Items
   const [items, setItems] = useState([
      { id: '1', desc: 'React & Node.js Platform Development (March)', qty: 1, rate: 60000 },
      { id: '2', desc: 'Cloud Infrastructure & DevOps Maintenance', qty: 1, rate: 15000 },
   ]);

   // Tax, Discount & Fees
   const [taxRate, setTaxRate] = useState(18);
   const [supplyType, setSupplyType] = useState('intra'); // 'intra' | 'inter'
   const [discountType, setDiscountType] = useState('percent'); // 'percent' | 'fixed'
   const [discountValue, setDiscountValue] = useState('0');
   const [shippingFee, setShippingFee] = useState('0');
   const [enableRoundOff, setEnableRoundOff] = useState(true);

   // Payment & Notes
   const [bankDetails, setBankDetails] = useState('HDFC Bank • A/C: 50100234567890 • IFSC: HDFC0000123');
   const [upiId, setUpiId] = useState('apexstudio@okhdfcbank');
   const [notes, setNotes] = useState('Thank you for your business. Please remit payment within 15 days.');

   // UI State
   const [showQuickSetup, setShowQuickSetup] = useState(false);
   const [selectedPreset, setSelectedPreset] = useState('');
   const [openFaq, setOpenFaq] = useState(null);
   const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'

   // Toast State
   const [toast, setToast] = useState({ message: '', visible: false });

   const showToast = (message) => {
      setToast({ message, visible: true });
      setTimeout(() => {
         setToast({ message: '', visible: false });
      }, 2500);
   };

   // Item manipulation
   const handleAddItem = () => {
      setItems([
         ...items,
         { id: String(Date.now()), desc: 'New Service / Deliverable', qty: 1, rate: 5000 },
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

   // Calculation
   const result = useMemo(() => {
      return calculateInvoice({
         items,
         discountType,
         discountValue,
         taxType: 'gst',
         taxRate,
         supplyType,
         shippingFee,
         enableRoundOff,
      });
   }, [items, discountType, discountValue, taxRate, supplyType, shippingFee, enableRoundOff]);

   const totalInWords = useMemo(() => numberToWordsINR(result.grandTotal), [result.grandTotal]);

   // Apply Preset
   const applyPreset = (preset) => {
      setSelectedPreset(preset.id);
      setBusinessName(preset.business.name);
      setBusinessEmail(preset.business.email);
      setBusinessGstin(preset.business.gstin);
      setClientName(preset.client.name);
      setClientEmail(preset.client.email);
      setClientGstin(preset.client.gstin);
      setItems(preset.items);
      setTaxRate(preset.taxRate);
      setSupplyType(preset.supplyType);
      showToast(`Applied preset: ${preset.name}`);
   };

   const handleReset = () => {
      setInvoiceNumber('INV-2026-001');
      setBusinessName('Apex Studio');
      setBusinessEmail('billing@apexstudio.io');
      setBusinessPhone('+91 98765 43210');
      setBusinessGstin('27AAAAA0000A1Z5');
      setBusinessAddress('Bandra West, Mumbai, MH - 400050');
      setClientName('NextGen Retail Ltd');
      setClientEmail('accounts@nextgen.com');
      setClientPhone('+91 91234 56789');
      setClientGstin('27BBBBB1111B1Z2');
      setClientAddress('Andheri East, Mumbai, MH - 400069');
      setItems([
         { id: '1', desc: 'React & Node.js Platform Development (March)', qty: 1, rate: 60000 },
         { id: '2', desc: 'Cloud Infrastructure & DevOps Maintenance', qty: 1, rate: 15000 },
      ]);
      setTaxRate(18);
      setSupplyType('intra');
      setDiscountValue('0');
      setShippingFee('0');
      setSelectedPreset('');
      trackToolReset('invoice-generator');
      showToast('Reset invoice generator.');
   };

   const handlePrint = () => {
      trackToolDownload('invoice-generator', { fileType: 'pdf' });
      window.print();
   };

   const handleCopySummary = () => {
      const summary = `Invoice ${invoiceNumber} Summary:
From: ${businessName}
To: ${clientName}
Subtotal: ₹${result.subtotal.toLocaleString('en-IN')}
Tax (GST ${taxRate}%): ₹${result.totalTaxAmount.toLocaleString('en-IN')}
Grand Total: ₹${result.grandTotal.toLocaleString('en-IN')} (${totalInWords})`;
      navigator.clipboard.writeText(summary);
      trackToolCopy('invoice-generator', { outputType: 'summary', size: summary.length });
      showToast('Copied invoice summary!');
   };

   const relatedTools = useMemo(() => getRelatedTools('invoice-generator', 3), []);

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
            title="Free Invoice Generator — Create GST & PDF Invoices Online"
            description="Create professional PDF invoices with business details, tax calculations, discounts, and print layouts."
            keywords="free invoice generator, gst invoice maker, pdf invoice creator, freelancer billing, online invoice download"
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
                  <FileSpreadsheet size={13} className="text-[#daf4aa]" />
                  <span>Business & Finance Suite</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">Invoices & Billing</span>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        Invoice Generator
                     </h1>
                     <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                        Create print-ready GST invoices with customizable line items, tax rates, UPI payment QR, and automatic number-to-words conversion.
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
                        <span>Edit Details</span>
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
                        <span>A4 Sheet Preview</span>
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
                        Quick Invoice Scenarios & Industry Templates
                     </span>
                     <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
                        (Freelance Dev, Digital Agency, UI/UX, Consulting)
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
                                    {preset.business.name} • {preset.items.length} Line items
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
                     {invoiceNumber} • {result.itemCount} Items
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
                  <span className="text-zinc-500 block text-[11px]">Subtotal (Taxable)</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     ₹{result.taxableAmount.toLocaleString('en-IN')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Total GST ({taxRate}%)</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     ₹{result.totalTaxAmount.toLocaleString('en-IN')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Grand Total</span>
                  <span className="font-semibold text-[#daf4aa] text-sm">
                     ₹{result.grandTotal.toLocaleString('en-IN')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Payment Due</span>
                  <span className="font-semibold text-emerald-400 text-sm">
                     {dueDate}
                  </span>
               </div>
            </div>

            {/* Dual Pane Layout (Editable Form + A4 Printable Invoice) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               {/* Left Pane: Invoice Editor */}
               <div className={`lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl print:hidden ${activeTab === 'preview' ? 'hidden lg:flex' : ''}`}>
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <FileSpreadsheet size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Invoice Configuration & Details
                        </span>
                     </div>
                     <span className="text-[11px] font-mono text-zinc-500">Auto Calc</span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {/* Invoice Meta */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                           <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                              Invoice Number
                           </label>
                           <input
                              type="text"
                              value={invoiceNumber}
                              onChange={(e) => setInvoiceNumber(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                        </div>
                        <div>
                           <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                              Invoice Date
                           </label>
                           <input
                              type="date"
                              value={invoiceDate}
                              onChange={(e) => setInvoiceDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                        </div>
                        <div>
                           <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                              Due Date
                           </label>
                           <input
                              type="date"
                              value={dueDate}
                              onChange={(e) => setDueDate(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                        </div>
                     </div>

                     {/* Business & Client Accordion Panels */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                        {/* Business Info */}
                        <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 flex flex-col gap-2">
                           <span className="text-xs font-semibold text-[#daf4aa] flex items-center gap-1.5">
                              <Building size={13} />
                              <span>Your Business (Billed By)</span>
                           </span>
                           <input
                              type="text"
                              placeholder="Business Name"
                              value={businessName}
                              onChange={(e) => setBusinessName(e.target.value)}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                           <input
                              type="text"
                              placeholder="GSTIN (e.g. 27AAAAA0000A1Z5)"
                              value={businessGstin}
                              onChange={(e) => setBusinessGstin(e.target.value)}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                           <input
                              type="text"
                              placeholder="Email & Phone"
                              value={businessEmail}
                              onChange={(e) => setBusinessEmail(e.target.value)}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                           <textarea
                              rows={2}
                              placeholder="Office Address"
                              value={businessAddress}
                              onChange={(e) => setBusinessAddress(e.target.value)}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa] resize-none"
                           />
                        </div>

                        {/* Client Info */}
                        <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800 flex flex-col gap-2">
                           <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                              <User size={13} />
                              <span>Client Details (Billed To)</span>
                           </span>
                           <input
                              type="text"
                              placeholder="Client / Company Name"
                              value={clientName}
                              onChange={(e) => setClientName(e.target.value)}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                           <input
                              type="text"
                              placeholder="Client GSTIN (Optional)"
                              value={clientGstin}
                              onChange={(e) => setClientGstin(e.target.value)}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                           <input
                              type="text"
                              placeholder="Client Email"
                              value={clientEmail}
                              onChange={(e) => setClientEmail(e.target.value)}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]"
                           />
                           <textarea
                              rows={2}
                              placeholder="Client Address"
                              value={clientAddress}
                              onChange={(e) => setClientAddress(e.target.value)}
                              className="w-full px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa] resize-none"
                           />
                        </div>
                     </div>

                     {/* Line Items Editor */}
                     <div className="pt-2 border-t border-zinc-800/80">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-semibold text-zinc-300">
                              Line Items ({items.length})
                           </span>
                           <button
                              type="button"
                              onClick={handleAddItem}
                              className="flex items-center gap-1 text-xs font-semibold text-[#daf4aa] hover:text-[#daf4aa]/80 transition-colors">
                              <Plus size={14} />
                              <span>Add Line Item</span>
                           </button>
                        </div>

                        <div className="flex flex-col gap-2 max-h-56 overflow-y-auto customScrollbar pr-1">
                           {items.map((it, idx) => (
                              <div
                                 key={it.id}
                                 className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-zinc-900/60 border border-zinc-800">
                                 <input
                                    type="text"
                                    value={it.desc}
                                    onChange={(e) => handleItemChange(it.id, 'desc', e.target.value)}
                                    placeholder="Item description"
                                    className="col-span-6 bg-transparent text-xs text-zinc-200 outline-none px-2 py-1 rounded border border-transparent focus:border-zinc-700"
                                 />
                                 <input
                                    type="number"
                                    min="1"
                                    value={it.qty}
                                    onChange={(e) => handleItemChange(it.id, 'qty', e.target.value)}
                                    placeholder="Qty"
                                    className="col-span-2 bg-zinc-900 text-xs text-center text-zinc-200 rounded border border-zinc-800 py-1"
                                 />
                                 <input
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

                     {/* Tax, Discounts & Supply Mode */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
                        <div>
                           <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                              GST Rate & Supply Type
                           </label>
                           <div className="flex items-center gap-1.5 mb-1.5">
                              {[0, 5, 12, 18, 28].map((r) => (
                                 <button
                                    key={r}
                                    type="button"
                                    onClick={() => setTaxRate(r)}
                                    className={`text-xs px-2 py-1 rounded-lg border font-medium ${
                                       taxRate === r
                                          ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                          : 'border-zinc-800 bg-zinc-900 text-zinc-400'
                                    }`}>
                                    {r}%
                                 </button>
                              ))}
                           </div>
                           <div className="flex items-center gap-2 text-xs">
                              <label className="flex items-center gap-1 text-zinc-400 cursor-pointer">
                                 <input
                                    type="radio"
                                    name="supplyType"
                                    checked={supplyType === 'intra'}
                                    onChange={() => setSupplyType('intra')}
                                    className="accent-[#daf4aa]"
                                 />
                                 <span>Intra-state (CGST+SGST)</span>
                              </label>
                              <label className="flex items-center gap-1 text-zinc-400 cursor-pointer">
                                 <input
                                    type="radio"
                                    name="supplyType"
                                    checked={supplyType === 'inter'}
                                    onChange={() => setSupplyType('inter')}
                                    className="accent-[#daf4aa]"
                                 />
                                 <span>Inter-state (IGST)</span>
                              </label>
                           </div>
                        </div>

                        <div>
                           <label className="text-[11px] font-semibold text-zinc-400 block mb-1">
                              Discount & Round Off
                           </label>
                           <div className="flex items-center gap-2 mb-1.5">
                              <input
                                 type="number"
                                 min="0"
                                 value={discountValue}
                                 onChange={(e) => setDiscountValue(e.target.value)}
                                 placeholder="Discount"
                                 className="w-full px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-100"
                              />
                              <select
                                 value={discountType}
                                 onChange={(e) => setDiscountType(e.target.value)}
                                 className="bg-zinc-900 border border-zinc-800 text-xs rounded-lg px-2 py-1 text-zinc-200">
                                 <option value="percent">% Off</option>
                                 <option value="fixed">₹ Flat</option>
                              </select>
                           </div>
                           <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                              <input
                                 type="checkbox"
                                 checked={enableRoundOff}
                                 onChange={(e) => setEnableRoundOff(e.target.checked)}
                                 className="accent-[#daf4aa]"
                              />
                              <span>Round off Grand Total to whole rupee</span>
                           </label>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Right Pane: Live Printable A4 Invoice Sheet */}
               <div className={`lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl print:border-none print:shadow-none print:bg-white print:text-black ${activeTab === 'edit' ? 'hidden lg:flex' : ''}`}>
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50 print:hidden">
                     <div className="flex items-center gap-2">
                        <Printer size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           A4 Invoice Document Sheet
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
                                 {businessName || 'YOUR BUSINESS NAME'}
                              </h2>
                              <p className="text-xs text-zinc-400 print:text-gray-600 mt-1">
                                 {businessAddress}
                              </p>
                              <p className="text-xs text-zinc-400 print:text-gray-600">
                                 {businessEmail} • {businessPhone}
                              </p>
                              {businessGstin && (
                                 <p className="text-xs font-mono font-semibold text-[#daf4aa] print:text-gray-800 mt-1">
                                    GSTIN: {businessGstin}
                                 </p>
                              )}
                           </div>

                           <div className="text-right">
                              <span className="text-xs uppercase font-extrabold tracking-widest text-[#daf4aa] print:text-black block">
                                 TAX INVOICE
                              </span>
                              <div className="text-sm font-mono font-bold text-white print:text-black mt-1">
                                 {invoiceNumber}
                              </div>
                              <div className="text-[11px] text-zinc-400 print:text-gray-600 mt-1">
                                 Date: {invoiceDate}
                              </div>
                              <div className="text-[11px] text-zinc-400 print:text-gray-600">
                                 Due: {dueDate}
                              </div>
                           </div>
                        </div>

                        {/* Bill To */}
                        <div className="mb-6 p-3.5 rounded-xl bg-zinc-900/60 print:bg-gray-50 border border-zinc-800 print:border-gray-200">
                           <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 print:text-gray-500 block mb-1">
                              BILLED TO:
                           </span>
                           <div className="font-bold text-sm text-white print:text-black">{clientName}</div>
                           <div className="text-xs text-zinc-400 print:text-gray-600 mt-0.5">{clientAddress}</div>
                           <div className="text-xs text-zinc-400 print:text-gray-600">{clientEmail}</div>
                           {clientGstin && (
                              <div className="text-xs font-mono text-zinc-400 print:text-gray-600 mt-0.5">
                                 GSTIN: {clientGstin}
                              </div>
                           )}
                        </div>

                        {/* Table of Items */}
                        <div className="overflow-x-auto mb-6">
                           <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                 <tr className="border-b border-zinc-800 print:border-gray-300 text-zinc-400 print:text-gray-600">
                                    <th className="py-2.5 font-semibold">Description</th>
                                    <th className="py-2.5 text-center font-semibold">Qty</th>
                                    <th className="py-2.5 text-right font-semibold">Rate</th>
                                    <th className="py-2.5 text-right font-semibold">Amount</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-800/60 print:divide-gray-200 text-zinc-200 print:text-black">
                                 {result.items.map((it, idx) => (
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
                                 Amount in Words:
                              </span>
                              <div className="text-xs italic text-zinc-300 print:text-gray-800 font-medium">
                                 {totalInWords}
                              </div>

                              <div className="mt-4 text-[11px] text-zinc-400 print:text-gray-600">
                                 <span className="font-semibold text-zinc-300 print:text-black block mb-0.5">
                                    Bank & UPI Remittance:
                                 </span>
                                 <div>{bankDetails}</div>
                                 <div className="text-[#daf4aa] print:text-black font-semibold mt-0.5">
                                    UPI ID: {upiId}
                                 </div>
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
                              {supplyType === 'intra' ? (
                                 <>
                                    <div className="flex justify-between text-zinc-400 print:text-gray-600">
                                       <span>CGST ({taxRate / 2}%):</span>
                                       <span className="font-mono text-zinc-200 print:text-black">
                                          ₹{result.cgstAmount.toLocaleString('en-IN')}
                                       </span>
                                    </div>
                                    <div className="flex justify-between text-zinc-400 print:text-gray-600">
                                       <span>SGST ({taxRate / 2}%):</span>
                                       <span className="font-mono text-zinc-200 print:text-black">
                                          ₹{result.sgstAmount.toLocaleString('en-IN')}
                                       </span>
                                    </div>
                                 </>
                              ) : (
                                 <div className="flex justify-between text-zinc-400 print:text-gray-600">
                                    <span>IGST ({taxRate}%):</span>
                                    <span className="font-mono text-zinc-200 print:text-black">
                                       ₹{result.igstAmount.toLocaleString('en-IN')}
                                    </span>
                                 </div>
                              )}
                              {result.roundOff !== 0 && (
                                 <div className="flex justify-between text-zinc-400 print:text-gray-600">
                                    <span>Round Off:</span>
                                    <span className="font-mono text-zinc-300 print:text-black">
                                       {result.roundOff > 0 ? `+₹${result.roundOff}` : `-₹${Math.abs(result.roundOff)}`}
                                    </span>
                                 </div>
                              )}
                              <div className="border-t border-zinc-800 print:border-gray-400 pt-2 flex justify-between font-bold text-sm text-white print:text-black">
                                 <span>Total Payable:</span>
                                 <span className="text-[#daf4aa] print:text-black font-extrabold text-base">
                                    ₹{result.grandTotal.toLocaleString('en-IN')}
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Footer Note */}
                     <div className="border-t border-zinc-800 print:border-gray-300 pt-3 text-[11px] text-zinc-500 print:text-gray-500 text-center">
                        {notes}
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

