/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import {
   Wallet,
   TrendingUp,
   TrendingDown,
   Plus,
   Trash2,
   Download,
   Sparkles,
   ChevronRight,
   HelpCircle,
   DollarSign,
   PieChart,
   ArrowUpRight,
   ArrowDownRight,
   Calendar,
   Tag,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

const CATEGORIES = [
   { id: 'salary', name: 'Salary & Wages', type: 'income', color: '#10b981' },
   { id: 'freelance', name: 'Freelance & Side Hustle', type: 'income', color: '#06b6d4' },
   { id: 'investments', name: 'Dividends & Investments', type: 'income', color: '#8b5cf6' },
   { id: 'food', name: 'Food & Dining', type: 'expense', color: '#f59e0b' },
   { id: 'housing', name: 'Rent & Housing', type: 'expense', color: '#ef4444' },
   { id: 'transport', name: 'Transport & Fuel', type: 'expense', color: '#3b82f6' },
   { id: 'utilities', name: 'Utilities & Bills', type: 'expense', color: '#ec4899' },
   { id: 'shopping', name: 'Shopping & Gear', type: 'expense', color: '#a855f7' },
   { id: 'entertainment', name: 'Entertainment & Subs', type: 'expense', color: '#6366f1' },
   { id: 'other', name: 'Other / Miscellaneous', type: 'expense', color: '#64748b' },
];

const DEFAULT_TRANSACTIONS = [
   { id: 't1', title: 'Monthly Salary', amount: 85000, type: 'income', category: 'salary', date: '2026-11-01' },
   { id: 't2', title: 'Apartment Rent', amount: 22000, type: 'expense', category: 'housing', date: '2026-11-02' },
   { id: 't3', title: 'Grocery Run & Supplies', amount: 4800, type: 'expense', category: 'food', date: '2026-11-04' },
   { id: 't4', title: 'Freelance UI Design', amount: 18000, type: 'income', category: 'freelance', date: '2026-11-05' },
   { id: 't5', title: 'High-speed Fiber Internet', amount: 1199, type: 'expense', category: 'utilities', date: '2026-11-06' },
];

const FAQS = [
   {
      question: 'Is my personal financial data saved in the cloud?',
      answer:
         'Never. All transactions and budget metrics are stored strictly inside your browser’s local storage (IndexedDB / localStorage). No salary figures, bank names, or transaction amounts ever leave your device.',
   },
   {
      question: 'Can I export my transactions for Excel or Google Sheets?',
      answer:
         'Yes! Click the "Export CSV" button to download a spreadsheet-compatible file containing dates, titles, categories, amounts, and net balances.',
   },
   {
      question: 'How is the savings rate computed?',
      answer:
         'Savings Rate is calculated as: [(Total Income − Total Expenses) ÷ Total Income] × 100%. Maintaining a savings rate above 20-30% is a benchmark for personal financial freedom.',
   },
   {
      question: 'Will clearing my browser cache delete my data?',
      answer:
         'Clearing your browser’s site data or cookies for this domain will wipe local storage. We recommend exporting a CSV backup at the end of each month.',
   },
];

export default function PersonalExpenseTracker() {
   const [transactions, setTransactions] = useState(() => {
      try {
         const saved = localStorage.getItem('klique_expense_tracker_v1');
         return saved ? JSON.parse(saved) : DEFAULT_TRANSACTIONS;
      } catch {
         return DEFAULT_TRANSACTIONS;
      }
   });

   // Form states
   const [title, setTitle] = useState('');
   const [amount, setAmount] = useState('');
   const [type, setType] = useState('expense'); // 'income' | 'expense'
   const [category, setCategory] = useState('food');
   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

   // Filter state
   const [filterType, setFilterType] = useState('all'); // 'all' | 'income' | 'expense'
   const [toast, setToast] = useState({ visible: false, message: '' });

   // Persist
   useEffect(() => {
      try {
         localStorage.setItem('klique_expense_tracker_v1', JSON.stringify(transactions));
      } catch (err) {
         console.warn('Storage quota exceeded:', err);
      }
   }, [transactions]);

   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   // Financial aggregates
   const metrics = useMemo(() => {
      let income = 0;
      let expenses = 0;

      transactions.forEach((t) => {
         const val = Number(t.amount) || 0;
         if (t.type === 'income') income += val;
         else expenses += val;
      });

      const netCashFlow = income - expenses;
      const savingsRate = income > 0 ? Math.max(0, ((netCashFlow / income) * 100).toFixed(1)) : 0;

      return {
         income,
         expenses,
         netCashFlow,
         savingsRate,
      };
   }, [transactions]);

   // Category distribution
   const categoryBreakdown = useMemo(() => {
      const expenseMap = {};
      let totalExpense = 0;

      transactions
         .filter((t) => t.type === 'expense')
         .forEach((t) => {
            const val = Number(t.amount) || 0;
            expenseMap[t.category] = (expenseMap[t.category] || 0) + val;
            totalExpense += val;
         });

      return Object.entries(expenseMap)
         .map(([catId, sum]) => {
            const catObj = CATEGORIES.find((c) => c.id === catId);
            const pct = totalExpense > 0 ? ((sum / totalExpense) * 100).toFixed(1) : 0;
            return {
               id: catId,
               name: catObj?.name || catId,
               color: catObj?.color || '#94a3b8',
               amount: sum,
               percentage: Number(pct),
            };
         })
         .sort((a, b) => b.amount - a.amount);
   }, [transactions]);

   const handleAddTransaction = (e) => {
      e.preventDefault();
      const numVal = parseFloat(amount);
      if (!title.trim() || isNaN(numVal) || numVal <= 0) {
         showToast('Please enter a valid title and positive amount.');
         return;
      }

      const newTx = {
         id: `t_${Date.now()}`,
         title: title.trim(),
         amount: numVal,
         type,
         category,
         date: date || new Date().toISOString().split('T')[0],
      };

      setTransactions((prev) => [newTx, ...prev]);
      setTitle('');
      setAmount('');
      showToast(`Added ${type === 'income' ? 'income' : 'expense'}: ${title}`);
   };

   const handleDeleteTransaction = (id) => {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast('Deleted transaction.');
   };

   const handleResetDefaults = () => {
      setTransactions(DEFAULT_TRANSACTIONS);
      trackToolReset('expense-tracker');
      showToast('Reset to sample transactions.');
   };

   const handleDownloadCSV = () => {
      if (transactions.length === 0) return;
      let csv = 'Date,Title,Type,Category,Amount\n';
      transactions.forEach((t) => {
         csv += `"${t.date}","${t.title.replace(/"/g, '""')}","${t.type}","${t.category}",${t.amount}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `klique-expenses-${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      trackToolDownload('expense-tracker', { fileType: 'csv' });
      showToast('Downloaded expense history CSV!');
   };

   const filteredTransactions = useMemo(() => {
      if (filterType === 'all') return transactions;
      return transactions.filter((t) => t.type === filterType);
   }, [transactions, filterType]);

   const relatedTools = useMemo(() => getRelatedTools('expense-tracker', 3), []);

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
            title="Personal Expense Tracker - Private Budget & Cashflow Manager | Klique"
            description="Track personal income, expenses, savings rate, and category breakdowns with complete client-side privacy. Export CSV reports with zero cloud storage."
            keywords="personal expense tracker, budget tracker free, monthly cash flow calculator, expense tracker client side, savings rate calculator, klique"
            canonicalUrl="https://klique.netlify.app/tools/expense-tracker"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'Personal Expense Tracker',
               applicationCategory: 'FinanceApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Calculate monthly income, cashflow, category expenditures, and savings rate privately in your browser.',
            }}
         />

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

         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Title Section */}
            <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                     <Wallet size={14} className="text-[#daf4aa]" />
                     <span>Personal Finance Suite</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                     Personal Expense Tracker
                  </h1>
                  <p className="mt-1 text-sm text-zinc-400">
                     Track income, categorize expenses, and monitor monthly savings rates with complete in-browser privacy.
                  </p>
               </motion.div>

               {/* Quick Export or Filter */}
               <div className="flex items-center gap-2">
                  <button
                     onClick={handleDownloadCSV}
                     className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] text-zinc-950 font-bold text-xs shadow-[0_0_15px_rgba(218,244,170,0.25)] transition-all cursor-pointer">
                     <Download size={13} />
                     <span>Export CSV</span>
                  </button>
               </div>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
               <Link to="/" className="hover:text-zinc-300 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category/business-finance" className="hover:text-zinc-300 transition-colors">Business & Finance</Link>
               <span>/</span>
               <span className="text-zinc-300">Expense Tracker</span>
            </div>

            {/* Metrics Dashboard Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
               <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md shadow-xl space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                     <span>Total Income</span>
                     <ArrowUpRight size={14} className="text-emerald-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                     ₹{metrics.income.toLocaleString()}
                  </div>
               </div>

               <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md shadow-xl space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                     <span>Total Expenses</span>
                     <ArrowDownRight size={14} className="text-red-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-red-400">
                     ₹{metrics.expenses.toLocaleString()}
                  </div>
               </div>

               <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md shadow-xl space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                     <span>Net Cash Flow</span>
                     <TrendingUp size={14} className={metrics.netCashFlow >= 0 ? 'text-[#daf4aa]' : 'text-red-400'} />
                  </div>
                  <div className={`text-xl sm:text-2xl font-bold font-mono ${metrics.netCashFlow >= 0 ? 'text-white' : 'text-red-400'}`}>
                     ₹{metrics.netCashFlow.toLocaleString()}
                  </div>
               </div>

               <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md shadow-xl space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                     <span>Savings Rate</span>
                     <Sparkles size={14} className="text-[#daf4aa]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#daf4aa]">
                     {metrics.savingsRate}%
                  </div>
               </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">
               {/* Left Column: Add Transaction & Category Breakdown */}
               <div className="lg:col-span-5 space-y-6">
                  {/* Add Entry Form */}
                  <form
                     onSubmit={handleAddTransaction}
                     className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl space-y-4">
                     <h2 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-zinc-800/80 pb-3">
                        <Plus size={16} className="text-[#daf4aa]" />
                        Log New Transaction
                     </h2>

                     {/* Type Selector */}
                     <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950/80 border border-zinc-800 rounded-xl">
                        <button
                           type="button"
                           onClick={() => setType('expense')}
                           className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              type === 'expense' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-zinc-400 hover:text-zinc-200'
                           }`}>
                           Expense (-)
                        </button>
                        <button
                           type="button"
                           onClick={() => setType('income')}
                           className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              type === 'income' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-zinc-400 hover:text-zinc-200'
                           }`}>
                           Income (+)
                        </button>
                     </div>

                     {/* Title & Amount */}
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300">Description</label>
                        <input
                           type="text"
                           value={title}
                           onChange={(e) => setTitle(e.target.value)}
                           placeholder="e.g. Starbucks, Electricity Bill, Client Retainer"
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                           <label className="text-xs font-medium text-zinc-300">Amount (₹)</label>
                           <input
                              type="number"
                              min="1"
                              step="any"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-xs font-medium text-zinc-300">Date</label>
                           <input
                              type="date"
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                           />
                        </div>
                     </div>

                     {/* Category */}
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300">Category</label>
                        <select
                           value={category}
                           onChange={(e) => setCategory(e.target.value)}
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40 cursor-pointer">
                           {CATEGORIES.filter((c) => c.type === type).map((cat) => (
                              <option key={cat.id} value={cat.id} className="bg-zinc-900 text-zinc-100">
                                 {cat.name}
                              </option>
                           ))}
                        </select>
                     </div>

                     <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] text-zinc-950 font-bold text-xs shadow-[0_0_15px_rgba(218,244,170,0.25)] transition-all cursor-pointer">
                        Add Transaction
                     </button>
                  </form>

                  {/* Expense Distribution Bars */}
                  {categoryBreakdown.length > 0 && (
                     <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl space-y-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                           <PieChart size={13} className="text-[#daf4aa]" />
                           Expense Distribution
                        </h3>
                        <div className="space-y-2.5 pt-1">
                           {categoryBreakdown.map((cat) => (
                              <div key={cat.id} className="space-y-1">
                                 <div className="flex justify-between text-xs">
                                    <span className="text-zinc-300">{cat.name}</span>
                                    <span className="font-mono text-zinc-400">
                                       ₹{cat.amount.toLocaleString()} ({cat.percentage}%)
                                    </span>
                                 </div>
                                 <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                       className="h-full rounded-full transition-all duration-500"
                                       style={{
                                          width: `${cat.percentage}%`,
                                          backgroundColor: cat.color,
                                       }}
                                    />
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>

               {/* Right Column: Transaction Ledger */}
               <div className="lg:col-span-7 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
                     <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 p-1 bg-zinc-950/80 rounded-xl border border-zinc-800">
                           {['all', 'expense', 'income'].map((f) => (
                              <button
                                 key={f}
                                 onClick={() => setFilterType(f)}
                                 className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                                    filterType === f
                                       ? 'bg-[#daf4aa] text-zinc-950'
                                       : 'text-zinc-400 hover:text-zinc-200'
                                 }`}>
                                 {f}
                              </button>
                           ))}
                        </div>
                     </div>

                     <div className="flex items-center gap-2">
                        <button
                           onClick={handleDownloadCSV}
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer">
                           <Download size={13} />
                           <span>Export CSV</span>
                        </button>
                        <button
                           onClick={handleResetDefaults}
                           className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                           Reset
                        </button>
                     </div>
                  </div>

                  {/* Transactions Ledger */}
                  {filteredTransactions.length === 0 ? (
                     <div className="py-16 text-center space-y-2">
                        <Wallet size={32} className="mx-auto text-zinc-600 animate-bounce" />
                        <div className="text-xs text-zinc-400 font-medium">No transactions found.</div>
                     </div>
                  ) : (
                     <div className="max-h-[460px] overflow-y-auto customScrollbar divide-y divide-zinc-800/60 border border-zinc-800/80 rounded-xl bg-zinc-950/60">
                        {filteredTransactions.map((tx) => {
                           const catObj = CATEGORIES.find((c) => c.id === tx.category);
                           return (
                              <div
                                 key={tx.id}
                                 className="p-3.5 text-xs flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
                                 <div className="flex items-center gap-3 min-w-0 pr-3">
                                    <div
                                       className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                       style={{ backgroundColor: catObj?.color || '#94a3b8' }}
                                    />
                                    <div className="truncate">
                                       <div className="text-zinc-100 font-medium truncate">{tx.title}</div>
                                       <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                                          <span>{tx.date}</span>
                                          <span>•</span>
                                          <span>{catObj?.name || tx.category}</span>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="flex items-center gap-3 flex-shrink-0">
                                    <span
                                       className={`font-mono font-bold text-xs ${
                                          tx.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                                       }`}>
                                       {tx.type === 'income' ? '+' : '-'}₹{Number(tx.amount).toLocaleString()}
                                    </span>
                                    <button
                                       onClick={() => handleDeleteTransaction(tx.id)}
                                       className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer">
                                       <Trash2 size={13} />
                                    </button>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}

                  <div className="pt-2 text-[11px] text-zinc-500 flex justify-between items-center border-t border-zinc-800/80">
                     <span>Stored locally in your browser</span>
                     <span>Total Entries: {filteredTransactions.length}</span>
                  </div>
               </div>
            </div>

            {/* FAQs Accordion */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md space-y-4 mb-8">
               <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle size={17} className="text-[#daf4aa]" />
                  Frequently Asked Questions
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FAQS.map((faq, i) => (
                     <div key={i} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50 space-y-1.5">
                        <h4 className="text-xs font-semibold text-zinc-200">{faq.question}</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{faq.answer}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
               <div className="border-t border-zinc-800/80 pt-8 space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm font-semibold text-white">Related Tools</h3>
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

