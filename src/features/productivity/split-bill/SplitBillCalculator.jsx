/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   Receipt,
   Users,
   Percent,
   IndianRupee,
   Copy,
   Download,
   Trash2,
   Check,
   Sparkles,
   ChevronDown,
   HelpCircle,
   ChevronRight,
   Plus,
   MessageSquare,
   ArrowRight,
   DollarSign,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { calculateEqualSplit } from '../../../lib/calculations/splitBill';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*  PRESETS & FAQS                                                            */
/* -------------------------------------------------------------------------- */

const PRESETS = [
   {
      id: 'dinner4',
      name: 'Dinner for 4 — ₹2,400 with 10% Tip',
      billAmount: '2400',
      numPeople: '4',
      tipPercent: 10,
      taxPercent: '5',
      roundUp: false,
   },
   {
      id: 'lunch6',
      name: 'Office Lunch (6) — ₹4,500 with 5% GST',
      billAmount: '4500',
      numPeople: '6',
      tipPercent: 5,
      taxPercent: '5',
      roundUp: true,
   },
   {
      id: 'party8',
      name: 'Party of 8 — ₹12,000 with 15% Tip & 5% GST',
      billAmount: '1200',
      numPeople: '8',
      tipPercent: 15,
      taxPercent: '5',
      roundUp: true,
   },
   {
      id: 'groceries2',
      name: 'Roommates Grocery — ₹3,200 (No Tip)',
      billAmount: '3200',
      numPeople: '2',
      tipPercent: 0,
      taxPercent: '0',
      roundUp: false,
   },
];

const FAQS = [
   {
      question: 'How is the per-person bill calculated with tip and tax?',
      answer:
         'Grand Total = Base Bill + Tip + Tax. In an equal split, each person pays Grand Total divided by the number of people. Tip and tax are distributed evenly.',
   },
   {
      question: 'Why enable the Round Up option?',
      answer:
         'Rounding up to the nearest whole rupee eliminates awkward coin change when collecting cash or sending quick UPI/Venmo payments.',
   },
   {
      question: 'Can I split unevenly if someone ordered something expensive?',
      answer:
         'Yes! Switch to the Custom / Uneven Split tab to assign custom amounts to individual friends while tip and tax are distributed proportionally.',
   },
   {
      question: 'How does proportional tip and tax work in custom split?',
      answer:
         'Each person pays their individual items plus a proportionate share of the total tip and tax based on the percentage their items contribute to the total food bill.',
   },
];

const INITIAL_FRIENDS = [
   { id: '1', name: 'Alex', amount: '800' },
   { id: '2', name: 'Sam', amount: '650' },
   { id: '3', name: 'Jordan', amount: '950' },
];

export default function SplitBillCalculator() {
   const [splitMode, setSplitMode] = useState('equal'); // 'equal' | 'custom'
   const [billAmount, setBillAmount] = useState('2400');
   const [numPeople, setNumPeople] = useState('4');
   const [tipPercent, setTipPercent] = useState(10);
   const [isCustomTip, setIsCustomTip] = useState(false);
   const [customTip, setCustomTip] = useState('');
   const [taxPercent, setTaxPercent] = useState('5');
   const [roundUp, setRoundUp] = useState(false);

   // Custom split state
   const [friends, setFriends] = useState(INITIAL_FRIENDS);

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

   const activeTipPercent = isCustomTip ? Number(customTip) || 0 : tipPercent;

   // Equal split calculation
   const equalResult = useMemo(() => {
      return calculateEqualSplit({
         billAmount: Number(billAmount) || 0,
         tipPercent: activeTipPercent,
         taxPercent: Number(taxPercent) || 0,
         numPeople: Number(numPeople) || 1,
         roundUp,
      });
   }, [billAmount, activeTipPercent, taxPercent, numPeople, roundUp]);

   // Custom split calculation
   const customResult = useMemo(() => {
      const sumIndividual = friends.reduce(
         (acc, f) => acc + (Math.max(0, Number(f.amount)) || 0),
         0
      );
      const tipVal = (sumIndividual * activeTipPercent) / 100;
      const taxVal = (sumIndividual * (Number(taxPercent) || 0)) / 100;
      const grandTotal = sumIndividual + tipVal + taxVal;
      const multiplier = sumIndividual > 0 ? grandTotal / sumIndividual : 1;

      const breakdown = friends.map((f) => {
         const individualBase = Math.max(0, Number(f.amount)) || 0;
         const individualTotal = individualBase * multiplier;
         return {
            ...f,
            base: individualBase,
            total: Number((roundUp ? Math.ceil(individualTotal) : individualTotal).toFixed(2)),
         };
      });

      return {
         baseTotal: Number(sumIndividual.toFixed(2)),
         tip: Number(tipVal.toFixed(2)),
         tax: Number(taxVal.toFixed(2)),
         grandTotal: Number(grandTotal.toFixed(2)),
         breakdown,
      };
   }, [friends, activeTipPercent, taxPercent, roundUp]);

   // Friend manipulation
   const handleAddFriend = () => {
      setFriends([
         ...friends,
         { id: String(Date.now()), name: `Friend ${friends.length + 1}`, amount: '500' },
      ]);
   };

   const handleRemoveFriend = (id) => {
      if (friends.length > 1) {
         setFriends(friends.filter((f) => f.id !== id));
      }
   };

   const handleFriendChange = (id, field, value) => {
      setFriends(friends.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
   };

   // Apply Preset
   const applyPreset = (preset) => {
      setSelectedPreset(preset.id);
      setSplitMode('equal');
      setBillAmount(preset.billAmount);
      setNumPeople(preset.numPeople);
      setTipPercent(preset.tipPercent);
      setIsCustomTip(false);
      setTaxPercent(preset.taxPercent);
      setRoundUp(preset.roundUp);
      showToast(`Applied preset: ${preset.name}`);
   };

   const handleReset = () => {
      setBillAmount('2400');
      setNumPeople('4');
      setTipPercent(10);
      setIsCustomTip(false);
      setCustomTip('');
      setTaxPercent('5');
      setRoundUp(false);
      setFriends(INITIAL_FRIENDS);
      setSelectedPreset('');
      trackToolReset('split-bill-calculator');
      showToast('Split calculator reset to defaults.');
   };

   // Share message for WhatsApp / SMS
   const shareMessage = useMemo(() => {
      if (splitMode === 'equal') {
         return `Hey everyone! Here is the bill split:
• Total Bill: ₹${equalResult.billAmount.toLocaleString('en-IN')}
• Tip (${activeTipPercent}%): ₹${equalResult.tip.toLocaleString('en-IN')}
• Tax (${taxPercent}%): ₹${equalResult.tax.toLocaleString('en-IN')}
• Grand Total: ₹${equalResult.grandTotal.toLocaleString('en-IN')}
👉 Each person pays (${equalResult.numPeople} people): ₹${equalResult.perPersonTotal.toLocaleString('en-IN')}`;
      } else {
         let msg = `Hey everyone! Here is our bill breakdown:\n• Total: ₹${customResult.grandTotal.toLocaleString('en-IN')} (including tip & tax)\n`;
         customResult.breakdown.forEach((f) => {
            msg += `• ${f.name}: ₹${f.total.toLocaleString('en-IN')}\n`;
         });
         return msg.trim();
      }
   }, [splitMode, equalResult, customResult, activeTipPercent, taxPercent]);

   const handleCopyWhatsApp = () => {
      navigator.clipboard.writeText(shareMessage);
      trackToolCopy('split-bill-calculator', { outputType: 'whatsapp-text', size: shareMessage.length });
      showToast('Copied WhatsApp split message to clipboard!');
   };

   const handleDownloadCSV = () => {
      let csv = '';
      if (splitMode === 'equal') {
         csv = `Item,Value\nBase Bill,${equalResult.billAmount}\nTip Rate,${activeTipPercent}%\nTip Amount,${equalResult.tip}\nTax Rate,${taxPercent}%\nTax Amount,${equalResult.tax}\nGrand Total,${equalResult.grandTotal}\nNumber of People,${equalResult.numPeople}\nPer Person Share,${equalResult.perPersonTotal}`;
      } else {
         csv = `Friend Name,Base Order,Total Payable (with Tip & Tax)\n`;
         customResult.breakdown.forEach((f) => {
            csv += `"${f.name}",${f.base},${f.total}\n`;
         });
         csv += `\nGrand Total,,${customResult.grandTotal}`;
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bill-split-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      trackToolDownload('split-bill-calculator', { fileType: 'csv', fileSize: blob.size });
      showToast('Downloaded bill split CSV!');
   };

   const relatedTools = useMemo(() => getRelatedTools('split-bill-calculator', 3), []);

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden
            before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]
            after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
         <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]" />

         {/* Static ambient backdrop */}
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
            title="Split Bill Calculator — Divide Restaurant Checks & Expenses"
            description="Split dining checks and group expenses evenly or custom-by-item, calculate tips and taxes, and copy ready-to-send payment summaries."
            keywords="split bill calculator, restaurant bill split, tip calculator, divide bill with friends, dinner split, share bill whatsapp"
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
                  <Receipt size={13} className="text-[#daf4aa]" />
                  <span>Productivity Suite</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">Bill & Tip Split</span>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                        Split Bill Calculator
                     </h1>
                     <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
                        Split restaurant checks and group expenses evenly or custom-by-item with proportional tip, tax, and instant WhatsApp summaries.
                     </p>
                  </div>

                  {/* Mode Selector Tabs */}
                  <div className="flex items-center p-1 rounded-full bg-zinc-900/90 border border-zinc-800/80 backdrop-blur-xl self-start sm:self-auto shadow-inner">
                     <button
                        type="button"
                        onClick={() => setSplitMode('equal')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                           splitMode === 'equal'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        <Users size={13} />
                        <span>Equal Split</span>
                     </button>
                     <button
                        type="button"
                        onClick={() => setSplitMode('custom')}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all duration-150 flex items-center gap-1.5 ${
                           splitMode === 'custom'
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'text-zinc-400 hover:text-zinc-200'
                        }`}>
                        <Percent size={13} />
                        <span>Custom Split</span>
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
                        Quick Scenarios & Presets
                     </span>
                     <span className="text-[10px] text-zinc-500 font-normal hidden sm:inline">
                        (Dinner, Office Lunch, Parties)
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
                                    ₹{preset.billAmount} • {preset.numPeople} people • {preset.tipPercent}% Tip
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
                     {splitMode === 'equal' ? 'Equal Split Active' : 'Custom Uneven Split Active'}
                  </span>
               </div>

               <div className="flex flex-wrap items-center gap-2">
                  <button
                     type="button"
                     onClick={handleCopyWhatsApp}
                     className="inline-flex items-center gap-1.5 rounded-xl bg-[#daf4aa] px-3.5 py-1.5 text-xs font-bold text-zinc-950 transition hover:bg-[#cbf094] shadow-sm">
                     <MessageSquare size={13} />
                     <span>Copy WhatsApp Msg</span>
                  </button>

                  <button
                     type="button"
                     onClick={handleDownloadCSV}
                     className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-zinc-800 hover:text-white">
                     <Download size={13} />
                     <span>Download CSV</span>
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
                  <span className="text-zinc-500 block text-[11px]">Base Total</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     ₹{splitMode === 'equal' ? equalResult.billAmount.toLocaleString('en-IN') : customResult.baseTotal.toLocaleString('en-IN')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Tip + Tax</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     ₹{splitMode === 'equal' ? (equalResult.tip + equalResult.tax).toLocaleString('en-IN') : (customResult.tip + customResult.tax).toLocaleString('en-IN')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Grand Total</span>
                  <span className="font-semibold text-[#daf4aa] text-sm">
                     ₹{splitMode === 'equal' ? equalResult.grandTotal.toLocaleString('en-IN') : customResult.grandTotal.toLocaleString('en-IN')}
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">
                     {splitMode === 'equal' ? 'Each Pays' : 'Total Friends'}
                  </span>
                  <span className="font-semibold text-emerald-400 text-sm">
                     {splitMode === 'equal' ? `₹${equalResult.perPersonTotal.toLocaleString('en-IN')}` : `${friends.length} people`}
                  </span>
               </div>
            </div>

            {/* Dual Pane Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               {/* Left Pane: Controls */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Receipt size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Bill & Calculation Parameters
                        </span>
                     </div>
                     <span className="text-[11px] font-mono text-zinc-500">
                        {splitMode === 'equal' ? 'Equal Division' : 'Proportional Split'}
                     </span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-4">
                     {/* EQUAL SPLIT INPUTS */}
                     {splitMode === 'equal' && (
                        <>
                           <div>
                              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                                 Total Bill Amount (₹)
                              </label>
                              <div className="relative">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs font-semibold">
                                    ₹
                                 </span>
                                 <input
                                    type="number"
                                    min="0"
                                    value={billAmount}
                                    onChange={(e) => setBillAmount(e.target.value)}
                                    placeholder="e.g. 2400"
                                    className="w-full pl-7 pr-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-[#daf4aa] transition-colors"
                                 />
                              </div>
                           </div>

                           <div>
                              <div className="flex items-center justify-between mb-1.5">
                                 <label className="text-xs font-semibold text-zinc-300">
                                    Number of People
                                 </label>
                                 <span className="text-xs text-zinc-500 font-mono">{numPeople} Person(s)</span>
                              </div>
                              <input
                                 type="number"
                                 min="1"
                                 max="100"
                                 value={numPeople}
                                 onChange={(e) => setNumPeople(e.target.value)}
                                 className="w-full px-3 py-2 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-[#daf4aa] transition-colors mb-2"
                              />
                              <div className="flex items-center gap-1.5 flex-wrap">
                                 {[2, 3, 4, 5, 6, 8, 10].map((n) => (
                                    <button
                                       key={n}
                                       type="button"
                                       onClick={() => setNumPeople(String(n))}
                                       className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                                          numPeople === String(n)
                                             ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                             : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                                       }`}>
                                       {n}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </>
                     )}

                     {/* CUSTOM / UNEVEN SPLIT INPUTS */}
                     {splitMode === 'custom' && (
                        <div className="flex flex-col gap-3">
                           <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-zinc-300">
                                 Friends & Individual Shares ({friends.length})
                              </span>
                              <button
                                 type="button"
                                 onClick={handleAddFriend}
                                 className="flex items-center gap-1 text-xs font-semibold text-[#daf4aa] hover:text-[#daf4aa]/80 transition-colors">
                                 <Plus size={14} />
                                 <span>Add Friend</span>
                              </button>
                           </div>

                           <div className="flex flex-col gap-2 max-h-72 overflow-y-auto customScrollbar pr-1">
                              {friends.map((friend, idx) => (
                                 <div
                                    key={friend.id}
                                    className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                                    <span className="text-xs font-mono text-zinc-500 w-4 text-center">
                                       {idx + 1}
                                    </span>
                                    <input
                                       type="text"
                                       value={friend.name}
                                       onChange={(e) => handleFriendChange(friend.id, 'name', e.target.value)}
                                       placeholder="Friend Name"
                                       className="flex-1 bg-transparent text-xs text-zinc-200 outline-none px-2 py-1 rounded border border-transparent focus:border-zinc-700"
                                    />
                                    <div className="relative w-28">
                                       <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
                                          ₹
                                       </span>
                                       <input
                                          type="number"
                                          min="0"
                                          value={friend.amount}
                                          onChange={(e) => handleFriendChange(friend.id, 'amount', e.target.value)}
                                          placeholder="Amount"
                                          className="w-full bg-zinc-900 pl-5 pr-2 py-1 text-xs text-zinc-100 rounded border border-zinc-800 focus:outline-none focus:border-[#daf4aa]"
                                       />
                                    </div>
                                    <button
                                       type="button"
                                       onClick={() => handleRemoveFriend(friend.id)}
                                       disabled={friends.length <= 1}
                                       className="p-1 text-zinc-500 hover:text-red-400 disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors">
                                       <Trash2 size={13} />
                                    </button>
                                 </div>
                              ))}
                           </div>

                           <div className="flex justify-between items-center text-xs text-zinc-400 pt-1 border-t border-zinc-800">
                              <span>Sum of orders:</span>
                              <span className="font-semibold text-zinc-200">
                                 ₹{customResult.baseTotal.toLocaleString('en-IN')}
                              </span>
                           </div>
                        </div>
                     )}

                     {/* TIP PERCENTAGE */}
                     <div>
                        <div className="flex items-center justify-between mb-1.5">
                           <label className="text-xs font-semibold text-zinc-300">
                              Tip Percentage
                           </label>
                           <span className="text-xs text-[#daf4aa] font-mono">{activeTipPercent}%</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                           {[0, 5, 10, 12, 15, 18, 20].map((t) => (
                              <button
                                 key={t}
                                 type="button"
                                 onClick={() => {
                                    setIsCustomTip(false);
                                    setTipPercent(t);
                                 }}
                                 className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                                    !isCustomTip && tipPercent === t
                                       ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                       : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                                 }`}>
                                 {t}%
                              </button>
                           ))}
                           <button
                              type="button"
                              onClick={() => setIsCustomTip(true)}
                              className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                                 isCustomTip
                                    ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                    : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                              }`}>
                              Custom
                           </button>
                        </div>
                        {isCustomTip && (
                           <div className="relative mt-2">
                              <input
                                 type="number"
                                 min="0"
                                 max="100"
                                 value={customTip}
                                 onChange={(e) => setCustomTip(e.target.value)}
                                 placeholder="Enter custom tip %"
                                 className="w-full px-3 py-1.5 bg-zinc-900/70 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-[#daf4aa]"
                              />
                           </div>
                        )}
                     </div>

                     {/* TAX / GST */}
                     <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                           Sales Tax / GST Rate (%)
                        </label>
                        <div className="flex items-center gap-1.5 flex-wrap mb-2">
                           {['0', '5', '12', '18', '28'].map((rate) => (
                              <button
                                 key={rate}
                                 type="button"
                                 onClick={() => setTaxPercent(rate)}
                                 className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                                    taxPercent === rate
                                       ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                       : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
                                 }`}>
                                 {rate}%
                              </button>
                           ))}
                        </div>
                     </div>

                     {/* ROUND UP TOGGLE */}
                     <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                        <div>
                           <span className="text-xs font-semibold text-zinc-200 block">
                              Round Up Per Person
                           </span>
                           <span className="text-[11px] text-zinc-500">
                              Rounds each share to the nearest whole rupee to avoid coins
                           </span>
                        </div>
                        <button
                           type="button"
                           onClick={() => setRoundUp(!roundUp)}
                           className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              roundUp ? 'bg-[#daf4aa]' : 'bg-zinc-800'
                           }`}>
                           <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-zinc-950 transition-transform ${
                                 roundUp ? 'translate-x-6' : 'translate-x-1'
                              }`}
                           />
                        </button>
                     </div>
                  </div>
               </div>

               {/* Right Pane: Results & WhatsApp Summary */}
               <div className="lg:col-span-6 flex flex-col rounded-2xl border border-zinc-800 bg-[#121215] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3 bg-zinc-900/50">
                     <div className="flex items-center gap-2">
                        <Users size={16} className="text-[#daf4aa]" />
                        <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide uppercase">
                           Settlement Breakdown
                        </span>
                     </div>
                     <span className="text-xs font-semibold text-emerald-400">
                        Ready to Share
                     </span>
                  </div>

                  <div className="p-4 sm:p-5 flex flex-col gap-5">
                     {/* Big Per-Person Highlight (Equal Split) */}
                     {splitMode === 'equal' ? (
                        <div className="rounded-2xl border border-[#daf4aa]/30 bg-[#daf4aa]/10 p-4 sm:p-5 flex flex-col items-center justify-center text-center">
                           <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-1">
                              Each Person Pays
                           </span>
                           <div className="text-3xl sm:text-4xl font-extrabold text-[#daf4aa] tracking-tight">
                              ₹{equalResult.perPersonTotal.toLocaleString('en-IN')}
                           </div>
                           <div className="text-xs text-zinc-400 mt-2 flex items-center gap-2">
                              <span>Base: ₹{equalResult.perPersonBase.toLocaleString('en-IN')}</span>
                              <span>•</span>
                              <span>Tip: ₹{equalResult.perPersonTip.toLocaleString('en-IN')}</span>
                              <span>•</span>
                              <span>Tax: ₹{equalResult.perPersonTax.toLocaleString('en-IN')}</span>
                           </div>
                        </div>
                     ) : (
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
                           <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-3">
                              Individual Payable Breakdown
                           </span>
                           <div className="flex flex-col gap-2 max-h-56 overflow-y-auto customScrollbar pr-1">
                              {customResult.breakdown.map((friend) => (
                                 <div
                                    key={friend.id}
                                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800 text-xs">
                                    <div>
                                       <span className="font-semibold text-zinc-200 block">{friend.name}</span>
                                       <span className="text-[10px] text-zinc-500">
                                          Order: ₹{friend.base.toLocaleString('en-IN')}
                                       </span>
                                    </div>
                                    <span className="font-bold text-[#daf4aa] text-sm">
                                       ₹{friend.total.toLocaleString('en-IN')}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Totals Table */}
                     <div className="space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-3.5 text-xs">
                        <div className="flex justify-between text-zinc-400">
                           <span>Total Base Bill</span>
                           <span className="font-semibold text-zinc-200">
                              ₹{splitMode === 'equal' ? equalResult.billAmount.toLocaleString('en-IN') : customResult.baseTotal.toLocaleString('en-IN')}
                           </span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                           <span>Tip ({activeTipPercent}%)</span>
                           <span className="font-semibold text-zinc-200">
                              +₹{splitMode === 'equal' ? equalResult.tip.toLocaleString('en-IN') : customResult.tip.toLocaleString('en-IN')}
                           </span>
                        </div>
                        <div className="flex justify-between text-zinc-400">
                           <span>Tax ({taxPercent}%)</span>
                           <span className="font-semibold text-zinc-200">
                              +₹{splitMode === 'equal' ? equalResult.tax.toLocaleString('en-IN') : customResult.tax.toLocaleString('en-IN')}
                           </span>
                        </div>
                        <div className="h-[1px] bg-zinc-800/80 my-1" />
                        <div className="flex justify-between font-bold text-sm text-white">
                           <span>Grand Total</span>
                           <span className="text-[#daf4aa]">
                              ₹{splitMode === 'equal' ? equalResult.grandTotal.toLocaleString('en-IN') : customResult.grandTotal.toLocaleString('en-IN')}
                           </span>
                        </div>
                     </div>

                     {/* WhatsApp Ready Share Message Box */}
                     <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                              <MessageSquare size={13} />
                              <span>WhatsApp / SMS Ready Message</span>
                           </div>
                           <button
                              type="button"
                              onClick={handleCopyWhatsApp}
                              className="text-[11px] font-semibold text-[#daf4aa] hover:underline flex items-center gap-1">
                              <Copy size={11} />
                              <span>Copy Text</span>
                           </button>
                        </div>
                        <pre className="text-[11px] font-mono text-zinc-300 bg-zinc-950/60 p-2.5 rounded-lg whitespace-pre-wrap select-all">
                           {shareMessage}
                        </pre>
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
