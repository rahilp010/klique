/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   CreditCard,
   Calendar,
   TrendingUp,
   Plus,
   Trash2,
   Edit3,
   AlertTriangle,
   DollarSign,
   IndianRupee,
   Sparkles,
   ChevronDown,
   HelpCircle,
   Filter,
   Search,
   Download,
   CheckCircle2,
   Layers,
   RefreshCw,
   ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import {
   BILLING_CYCLES,
   SUBSCRIPTION_CATEGORIES,
   POPULAR_TEMPLATES,
   toMonthlyCost,
   toYearlyCost,
   analyzeSubscriptions,
   formatCurrency,
} from '../../../lib/calculations/subscription';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*  INITIAL SAMPLES & FAQS                                                    */
/* -------------------------------------------------------------------------- */

const DEFAULT_SUBSCRIPTIONS = [
   {
      id: 'sub-1',
      name: 'Netflix Premium (4K)',
      cost: 15.49,
      currency: '$',
      cycle: 'monthly',
      category: 'Entertainment & Streaming',
      renewalDate: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
      paymentMethod: 'Credit Card',
      status: 'active',
   },
   {
      id: 'sub-2',
      name: 'ChatGPT Plus',
      cost: 20.0,
      currency: '$',
      cycle: 'monthly',
      category: 'Productivity & AI',
      renewalDate: new Date(Date.now() + 18 * 86400000).toISOString().slice(0, 10),
      paymentMethod: 'Debit Card',
      status: 'active',
   },
   {
      id: 'sub-3',
      name: 'GitHub Copilot Individual',
      cost: 100.0,
      currency: '$',
      cycle: 'yearly',
      category: 'Software & SaaS',
      renewalDate: new Date(Date.now() + 120 * 86400000).toISOString().slice(0, 10),
      paymentMethod: 'Credit Card',
      status: 'active',
   },
   {
      id: 'sub-4',
      name: 'Spotify Family',
      cost: 16.99,
      currency: '$',
      cycle: 'monthly',
      category: 'Entertainment & Streaming',
      renewalDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
      paymentMethod: 'UPI',
      status: 'active',
   },
];

const FAQS = [
   {
      question: 'How are recurring subscriptions calculated across different cycles?',
      answer:
         'All subscription costs are mathematically normalized: Yearly bills are divided by 12, quarterly bills by 3, and weekly charges multiplied by 52/12 to calculate an accurate unified monthly run-rate.',
   },
   {
      question: 'Is my credit card or bank data saved anywhere?',
      answer:
         'Never. Klique does not connect to bank accounts or ask for card numbers. You only enter manual label names and pricing. All records reside exclusively inside your browser’s localStorage.',
   },
   {
      question: 'Can I export my subscription list?',
      answer:
         'Yes! You can download your entire active subscription register as a structured JSON file at any time for personal backups or spreadsheets.',
   },
   {
      question: 'How do upcoming renewal warnings work?',
      answer:
         'The dashboard automatically flags any service whose next billing renewal date falls within the upcoming 7 or 30 days so you can cancel unused trials before you get billed.',
   },
];

export default function SubscriptionTracker() {
   // Subscriptions state
   const [subscriptions, setSubscriptions] = useState(() => {
      const saved = localStorage.getItem('klique_subscriptions_list');
      if (saved) {
         try {
            return JSON.parse(saved);
         } catch {
            return DEFAULT_SUBSCRIPTIONS;
         }
      }
      return DEFAULT_SUBSCRIPTIONS;
   });

   // Form modal / inputs
   const [isAdding, setIsAdding] = useState(false);
   const [name, setName] = useState('');
   const [cost, setCost] = useState('');
   const [currency, setCurrency] = useState('$');
   const [cycle, setCycle] = useState('monthly');
   const [category, setCategory] = useState(SUBSCRIPTION_CATEGORIES[0]);
   const [renewalDate, setRenewalDate] = useState('');
   const [paymentMethod, setPaymentMethod] = useState('Credit Card');
   const [status, setStatus] = useState('active');

   // Filters & search
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedFilterCategory, setSelectedFilterCategory] = useState('all');
   const [openFaq, setOpenFaq] = useState(null);

   // Toast
   const [toast, setToast] = useState({ visible: false, message: '' });
   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   // Persist helper
   const persist = (items) => {
      setSubscriptions(items);
      localStorage.setItem('klique_subscriptions_list', JSON.stringify(items));
   };

   // Analytics calculations
   const analytics = useMemo(() => {
      return analyzeSubscriptions(subscriptions);
   }, [subscriptions]);

   // Filtered list
   const filteredSubscriptions = useMemo(() => {
      return subscriptions.filter((sub) => {
         const matchesName = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
         const matchesCategory =
            selectedFilterCategory === 'all' || sub.category === selectedFilterCategory;
         return matchesName && matchesCategory;
      });
   }, [subscriptions, searchQuery, selectedFilterCategory]);

   // Handle Submit
   const handleSaveSubscription = (e) => {
      e.preventDefault();
      if (!name.trim() || !cost) {
         showToast('Please provide both service name and price.');
         return;
      }

      const newSub = {
         id: `sub-${Date.now()}`,
         name: name.trim(),
         cost: parseFloat(cost) || 0,
         currency,
         cycle,
         category,
         renewalDate: renewalDate || '',
         paymentMethod,
         status,
      };

      const updated = [newSub, ...subscriptions];
      persist(updated);

      // Reset
      setName('');
      setCost('');
      setRenewalDate('');
      setIsAdding(false);
      showToast(`Added subscription: ${newSub.name}`);
   };

   // Add from popular template
   const handleAddTemplate = (tpl) => {
      const newSub = {
         id: `sub-${Date.now()}`,
         name: tpl.name,
         cost: tpl.cost,
         currency: tpl.currency,
         cycle: tpl.cycle,
         category: tpl.category,
         renewalDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
         paymentMethod: 'Credit Card',
         status: 'active',
      };
      persist([newSub, ...subscriptions]);
      showToast(`Added template: ${tpl.name}`);
   };

   // Delete
   const handleDelete = (id, subName) => {
      const updated = subscriptions.filter((s) => s.id !== id);
      persist(updated);
      showToast(`Removed "${subName}".`);
   };

   // Toggle Pause / Active
   const handleToggleStatus = (id) => {
      const updated = subscriptions.map((s) => {
         if (s.id === id) {
            const nextStatus = s.status === 'active' ? 'paused' : 'active';
            return { ...s, status: nextStatus };
         }
         return s;
      });
      persist(updated);
   };

   // Export Backup JSON
   const handleExportJSON = () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(subscriptions, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', 'klique-subscriptions-backup.json');
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Exported subscriptions backup JSON!');
   };

   const relatedTools = useMemo(() => getRelatedTools('subscription-tracker', 4), []);

   return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden font-sans">
         {/* Static ambient backdrop matching JsonFormatter */}
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.12),transparent_55%)]"
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         <SEO
            title="Subscription Tracker & Recurring Expense Manager | Klique"
            description="Track monthly and annual recurring subscriptions, Netflix, SaaS, and bills. Monitor renewal dates and visualize category spending."
            keywords="subscription tracker, manage subscriptions, recurring expenses, renewal reminder, expense manager, cancel subscriptions, klique"
            canonicalUrl="https://klique.netlify.app/tools/subscription-tracker"
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
                     <CreditCard size={14} className="text-[#daf4aa]" />
                     <span>Productivity & Finance</span>
                     <span className="text-zinc-600">•</span>
                     <span className="text-[#daf4aa]">100% Client-Side Privacy</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                     Subscription <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#daf4aa] via-lime-300 to-emerald-400">Tracker</span>
                  </h1>
                  <p className="text-zinc-400 text-sm max-w-xl">
                     Audit recurring memberships, stream services, and cloud tools. Keep track of renewals
                     and optimize recurring spend.
                  </p>
               </motion.div>

               {/* Quick Action Buttons */}
               <div className="flex items-center gap-3">
                  <button
                     onClick={handleExportJSON}
                     className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all shadow-md backdrop-blur-md">
                     <Download size={15} />
                     <span>Export JSON</span>
                  </button>

                  <button
                     onClick={() => setIsAdding(true)}
                     className="flex items-center gap-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] px-4 py-2.5 text-xs font-bold text-zinc-950 transition-all shadow-[0_0_15px_rgba(218,244,170,0.3)] cursor-pointer">
                     <Plus size={15} />
                     <span>Add Subscription</span>
                  </button>
               </div>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
               <Link to="/" className="hover:text-zinc-200 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category" className="hover:text-zinc-200 transition-colors">Productivity</Link>
               <span>/</span>
               <span className="text-[#daf4aa]">Subscription Tracker</span>
            </div>

            {/* Analytics KPI Dashboard Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
               {/* Total Monthly */}
               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl shadow-lg">
                  <span className="text-xs font-medium text-zinc-400 block mb-1">Monthly Burn Rate</span>
                  <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                     ${analytics.totalMonthly}
                  </div>
                  <span className="text-[11px] text-emerald-400 mt-1 inline-block">
                     Across {analytics.activeCount} active subscriptions
                  </span>
               </div>

               {/* Projected Yearly */}
               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl shadow-lg">
                  <span className="text-xs font-medium text-zinc-400 block mb-1">Annual Projected Cost</span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                     ${analytics.totalYearly}
                  </div>
                  <span className="text-[11px] text-zinc-500 mt-1 inline-block">12-month calculated run-rate</span>
               </div>

               {/* Renewing Soon */}
               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl shadow-lg">
                  <span className="text-xs font-medium text-zinc-400 block mb-1 flex items-center gap-1.5">
                     <AlertTriangle size={13} className="text-amber-400" />
                     <span>Renewing in 7 Days</span>
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                     {analytics.upcoming7Days.length}
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 inline-block">
                     {analytics.upcoming7Days.length > 0 ? 'Review trials before billing' : 'No urgent renewals'}
                  </span>
               </div>

               {/* Top Expense */}
               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl shadow-lg">
                  <span className="text-xs font-medium text-zinc-400 block mb-1">Largest Expense</span>
                  <div className="text-lg font-bold text-white truncate">
                     {analytics.highestExpense ? analytics.highestExpense.name : '—'}
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono mt-1 inline-block">
                     {analytics.highestExpense
                        ? `$${toMonthlyCost(analytics.highestExpense.cost, analytics.highestExpense.cycle).toFixed(2)}/mo`
                        : 'No expenses logged'}
                  </span>
               </div>
            </div>

            {/* Quick Template Shelf */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-xl mb-8">
               <span className="text-xs font-bold text-zinc-300 block mb-3 flex items-center gap-2">
                  <Sparkles size={14} className="text-emerald-400" />
                  <span>One-Click Popular Templates</span>
               </span>
               <div className="flex flex-wrap gap-2.5">
                  {POPULAR_TEMPLATES.map((tpl) => (
                     <button
                        key={tpl.name}
                        onClick={() => handleAddTemplate(tpl)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-950/60 text-xs text-zinc-300 hover:border-emerald-500/40 hover:text-white transition-all shadow-sm">
                        <Plus size={12} className="text-emerald-400" />
                        <span className="font-medium">{tpl.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                           ${tpl.cost}/{tpl.cycle === 'yearly' ? 'yr' : 'mo'}
                        </span>
                     </button>
                  ))}
               </div>
            </div>

            {/* Subscriptions Register & Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
               {/* Main Subscriptions List */}
               <div className="lg:col-span-8 flex flex-col gap-4">
                  {/* Search and Filters Bar */}
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                     <div className="relative w-full sm:w-72">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                           type="text"
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           placeholder="Search subscriptions..."
                           className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none transition-all"
                        />
                     </div>

                     <select
                        value={selectedFilterCategory}
                        onChange={(e) => setSelectedFilterCategory(e.target.value)}
                        className="w-full sm:w-auto rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-white focus:border-emerald-500/50 focus:outline-none transition-all">
                        <option value="all">All Categories ({subscriptions.length})</option>
                        {SUBSCRIPTION_CATEGORIES.map((cat) => (
                           <option key={cat} value={cat}>
                              {cat}
                           </option>
                        ))}
                     </select>
                  </div>

                  {/* List Container */}
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-6 backdrop-blur-xl shadow-xl space-y-3">
                     {filteredSubscriptions.length === 0 ? (
                        <div className="py-12 text-center text-zinc-500">
                           <CreditCard size={32} className="mx-auto mb-2 text-zinc-600" />
                           <p className="text-xs">No matching subscriptions found.</p>
                        </div>
                     ) : (
                        filteredSubscriptions.map((sub) => {
                           const monthlyEquivalent = toMonthlyCost(sub.cost, sub.cycle);
                           const isPaused = sub.status === 'paused';
                           return (
                              <div
                                 key={sub.id}
                                 className={`rounded-xl border p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                    isPaused
                                       ? 'border-zinc-800/40 bg-zinc-950/30 opacity-60'
                                       : 'border-zinc-800/80 bg-zinc-950/60 hover:border-zinc-700'
                                 }`}>
                                 <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl border border-zinc-800 bg-zinc-900 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                                       {sub.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                       <div className="flex items-center gap-2">
                                          <h4 className="text-sm font-bold text-white">{sub.name}</h4>
                                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold border border-zinc-800 bg-zinc-900 text-zinc-400">
                                             {sub.category}
                                          </span>
                                          {isPaused && (
                                             <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                Paused
                                             </span>
                                          )}
                                       </div>
                                       <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                                          <span>Payment: {sub.paymentMethod}</span>
                                          {sub.renewalDate && (
                                             <>
                                                <span>•</span>
                                                <span className="font-mono">Next: {sub.renewalDate}</span>
                                             </>
                                          )}
                                       </div>
                                    </div>
                                 </div>

                                 {/* Price & Actions */}
                                 <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800/60">
                                    <div className="text-left sm:text-right">
                                       <div className="text-sm font-black text-white font-mono">
                                          {sub.currency}
                                          {sub.cost}{' '}
                                          <span className="text-[10px] text-zinc-500 font-normal">
                                             /{sub.cycle}
                                          </span>
                                       </div>
                                       <div className="text-[10px] text-zinc-400 font-mono">
                                          ${monthlyEquivalent.toFixed(2)}/mo equiv
                                       </div>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                       <button
                                          onClick={() => handleToggleStatus(sub.id)}
                                          className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all text-xs"
                                          title={isPaused ? 'Resume Subscription' : 'Pause Subscription'}>
                                          <RefreshCw size={13} />
                                       </button>

                                       <button
                                          onClick={() => handleDelete(sub.id, sub.name)}
                                          className="p-2 rounded-lg border border-zinc-800 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 transition-all text-xs"
                                          title="Delete">
                                          <Trash2 size={13} />
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           );
                        })
                     )}
                  </div>
               </div>

               {/* Right Column: Category Distribution */}
               <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Category Breakdown Card */}
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl">
                     <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Layers size={16} className="text-emerald-400" />
                        <span>Spending by Category</span>
                     </h3>

                     {analytics.categories.length === 0 ? (
                        <p className="text-xs text-zinc-500">No subscriptions to analyze.</p>
                     ) : (
                        <div className="space-y-3.5">
                           {analytics.categories.map((cat) => (
                              <div key={cat.name} className="text-xs">
                                 <div className="flex justify-between text-zinc-300 mb-1 font-medium">
                                    <span className="truncate pr-2">{cat.name}</span>
                                    <span className="font-mono text-white">
                                       ${cat.amount.toFixed(2)} ({Math.round(cat.percentage)}%)
                                    </span>
                                 </div>
                                 <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                    <div
                                       className="h-full bg-emerald-500 rounded-full"
                                       style={{ width: `${cat.percentage}%` }}
                                    />
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>

                  {/* Upcoming Renewals Card */}
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl">
                     <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <Calendar size={16} className="text-amber-400" />
                        <span>Renewing Next 30 Days</span>
                     </h3>

                     {analytics.upcoming30Days.length === 0 ? (
                        <p className="text-xs text-zinc-500">No subscriptions scheduled to renew soon.</p>
                     ) : (
                        <div className="space-y-2.5">
                           {analytics.upcoming30Days.map((sub) => (
                              <div
                                 key={sub.id}
                                 className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 flex items-center justify-between text-xs">
                                 <div>
                                    <span className="font-bold text-white block">{sub.name}</span>
                                    <span className="text-[11px] text-zinc-500 font-mono">
                                       {sub.renewalDate}
                                    </span>
                                 </div>
                                 <span className="font-mono font-bold text-amber-400">
                                    {sub.currency}
                                    {sub.cost}
                                 </span>
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Modal: Add New Subscription */}
            <AnimatePresence>
               {isAdding && (
                  <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                     <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
                        <h3 className="text-base font-bold text-white mb-4">Add Subscription</h3>

                        <form onSubmit={handleSaveSubscription} className="space-y-4 text-xs">
                           <div>
                              <label className="block text-zinc-300 font-medium mb-1.5">Service Name *</label>
                              <input
                                 type="text"
                                 required
                                 value={name}
                                 onChange={(e) => setName(e.target.value)}
                                 placeholder="e.g. Figma Pro, ChatGPT, Adobe CC"
                                 className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none transition-all"
                              />
                           </div>

                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <label className="block text-zinc-300 font-medium mb-1.5">Price Amount *</label>
                                 <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={cost}
                                    onChange={(e) => setCost(e.target.value)}
                                    placeholder="9.99"
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none transition-all"
                                 />
                              </div>

                              <div>
                                 <label className="block text-zinc-300 font-medium mb-1.5">Billing Cycle</label>
                                 <select
                                    value={cycle}
                                    onChange={(e) => setCycle(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none transition-all">
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="weekly">Weekly</option>
                                 </select>
                              </div>
                           </div>

                           <div className="grid grid-cols-2 gap-3">
                              <div>
                                 <label className="block text-zinc-300 font-medium mb-1.5">Category</label>
                                 <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none transition-all">
                                    {SUBSCRIPTION_CATEGORIES.map((c) => (
                                       <option key={c} value={c}>{c}</option>
                                    ))}
                                 </select>
                              </div>

                              <div>
                                 <label className="block text-zinc-300 font-medium mb-1.5">Next Renewal Date</label>
                                 <input
                                    type="date"
                                    value={renewalDate}
                                    onChange={(e) => setRenewalDate(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none transition-all"
                                 />
                              </div>
                           </div>

                           <div className="flex items-center justify-end gap-3 pt-3">
                              <button
                                 type="button"
                                 onClick={() => setIsAdding(false)}
                                 className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white transition-all">
                                 Cancel
                              </button>
                              <button
                                 type="submit"
                                 className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all shadow-lg shadow-emerald-500/20">
                                 Save Subscription
                              </button>
                           </div>
                        </form>
                     </motion.div>
                  </div>
               )}
            </AnimatePresence>

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
                     <span>Related Productivity & Finance Tools</span>
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

