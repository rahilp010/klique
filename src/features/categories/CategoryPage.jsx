/* eslint-disable no-unused-vars */
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
   LayoutGrid,
   Search,
   X,
   ArrowRight,
   Sparkles,
   Type,
   Calculator,
   Clock,
   GraduationCap,
   Code2,
   FileText,
   QrCode,
   FileKey2,
   FileSpreadsheet,
   IndianRupee,
   Mail,
   Binary,
   KeyRound,
   Database,
   TrendingUp,
   Receipt,
   MessageSquare,
   Award,
   Smile,
   Hash,
   Package,
   Share2,
   FilePen,
   LockKeyhole,
   ShieldCheck,
   Zap,
   Check,
   Layers,
   ExternalLink,
   ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/Navbar';
import SEO from '../../components/SEO';
import { CATEGORIES, getCategoryBySlug } from '../../data/categories';
import { getAllTools, getToolsByCategory } from '../../data/tools';
import { preloadRoute } from '../../App';

/* -------------------------------------------------------------------------- */
/*  ICON RESOLVER MAP                                                         */
/* -------------------------------------------------------------------------- */

const ICON_MAP = {
   Sparkles,
   Type,
   Calculator,
   Clock,
   GraduationCap,
   Code2,
   FileText,
   QrCode,
   FileKey2,
   FileSpreadsheet,
   IndianRupee,
   Mail,
   Binary,
   KeyRound,
   Database,
   TrendingUp,
   Receipt,
   MessageSquare,
   Award,
   Smile,
   Hash,
   Package,
   Share2,
   FilePen,
   LockKeyhole,
   ShieldCheck,
   LayoutGrid,
};

function renderIcon(iconName, className = 'w-5 h-5') {
   const IconComponent = ICON_MAP[iconName] || LayoutGrid;
   return <IconComponent className={className} />;
}

export default function CategoryPage() {
   const { slug } = useParams();
   const navigate = useNavigate();

   // Search & Filter State
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCategorySlug, setSelectedCategorySlug] = useState(slug || 'all');

   // Toast State
   const [toast, setToast] = useState({ message: '', visible: false });

   const showToast = (message) => {
      setToast({ message, visible: true });
      setTimeout(() => {
         setToast({ message: '', visible: false });
      }, 2500);
   };

   // Sync URL slug if changed
   useEffect(() => {
      if (slug) {
         setSelectedCategorySlug(slug);
      } else {
         setSelectedCategorySlug('all');
      }
   }, [slug]);

   const allTools = useMemo(() => getAllTools(), []);
   const activeTools = useMemo(() => allTools.filter((t) => t.status === 'active'), [allTools]);

   // Handle Category Tab Click
   const handleCategorySelect = (categorySlug) => {
      setSelectedCategorySlug(categorySlug);
      if (categorySlug === 'all') {
         navigate('/category');
      } else {
         navigate(`/category/${categorySlug}`);
      }
   };

   // Filtered results based on search query and category
   const filteredData = useMemo(() => {
      const q = searchQuery.toLowerCase().trim();

      // If user is searching across all tools
      if (q) {
         const matchedTools = allTools.filter((tool) => {
            const inName = tool.name.toLowerCase().includes(q);
            const inCategory = tool.category.toLowerCase().includes(q);
            const inDesc = tool.description.toLowerCase().includes(q);
            const inTags = tool.tags?.some((tag) => tag.toLowerCase().includes(q));
            const inPhrases = tool.problemPhrases?.some((phrase) => phrase.toLowerCase().includes(q));
            return inName || inCategory || inDesc || inTags || inPhrases;
         });

         return {
            mode: 'search',
            tools: matchedTools,
         };
      }

      // If specific category is selected
      if (selectedCategorySlug !== 'all') {
         const cat = getCategoryBySlug(selectedCategorySlug);
         if (cat) {
            const catTools = allTools.filter(
               (t) => t.category.toLowerCase() === cat.name.toLowerCase()
            );
            return {
               mode: 'single-category',
               category: cat,
               tools: catTools,
            };
         }
      }

      // Grouped view for All Categories
      const groups = CATEGORIES.map((cat) => {
         const toolsInCat = allTools.filter(
            (t) => t.category.toLowerCase() === cat.name.toLowerCase()
         );
         return {
            category: cat,
            tools: toolsInCat,
         };
      }).filter((g) => g.tools.length > 0);

      return {
         mode: 'all-categories',
         groups,
      };
   }, [searchQuery, selectedCategorySlug, allTools]);

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden
            before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]
            after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
         <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]" />

         {/* Ambient grid backdrop matching JsonFormatter */}
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         {/* Toast Notification */}
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
            title="Browse All Tool Categories — Klique Utility Suite"
            description="Explore developer tools, business calculators, student aids, text generators, and file utilities categorized for high efficiency."
            keywords="klique tools, developer utilities, business calculators, student tools, free online utilities directory"
         />

         {/* Global Navbar */}
         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         {/* Main Content Area */}
         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Header Section */}
            <div className="mb-8 flex flex-col gap-3">
               <div className="inline-flex items-center gap-2 self-start rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-[#daf4aa] backdrop-blur-sm">
                  <LayoutGrid size={13} className="text-[#daf4aa]" />
                  <span>Klique Tool Directory</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-zinc-400">{allTools.length} Total Tools</span>
               </div>

               <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div>
                     <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                        Explore by Category
                     </h1>
                     <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 max-w-2xl leading-relaxed">
                        Fast, privacy-friendly online utilities built for developers, freelancers, students, and businesses. Everything runs client-side in your browser.
                     </p>
                  </div>

                  {/* Search Input Box */}
                  <div className="relative w-full md:w-80">
                     <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                     />
                     <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tools, formulas, keywords..."
                        className="w-full pl-9 pr-9 py-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa] transition-all shadow-inner"
                     />
                     {searchQuery && (
                        <button
                           type="button"
                           onClick={() => setSearchQuery('')}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-0.5">
                           <X size={14} />
                        </button>
                     )}
                  </div>
               </div>
            </div>

            {/* Category Filter Pills */}
            <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 customScrollbar">
               <button
                  type="button"
                  onClick={() => handleCategorySelect('all')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                     selectedCategorySlug === 'all' && !searchQuery
                        ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                        : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}>
                  <LayoutGrid size={13} />
                  <span>All Categories ({allTools.length})</span>
               </button>

               {CATEGORIES.map((cat) => {
                  const count = allTools.filter(
                     (t) => t.category.toLowerCase() === cat.name.toLowerCase()
                  ).length;
                  const isSelected = selectedCategorySlug === cat.slug && !searchQuery;

                  return (
                     <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.slug)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                           isSelected
                              ? 'bg-[#daf4aa] text-zinc-950 shadow-md'
                              : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                        }`}>
                        {renderIcon(cat.icon, 'w-3.5 h-3.5')}
                        <span>{cat.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                           {count}
                        </span>
                     </button>
                  );
               })}
            </div>

            {/* Quick Directory Statistics Bar */}
            <div className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4 text-xs">
               <div>
                  <span className="text-zinc-500 block text-[11px]">Total Domains</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     {CATEGORIES.length} Official Categories
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Available Tools</span>
                  <span className="font-semibold text-[#daf4aa] text-sm">
                     {activeTools.length} Live Utilities
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Privacy Model</span>
                  <span className="font-semibold text-emerald-400 text-sm">
                     100% Client-Side
                  </span>
               </div>
               <div>
                  <span className="text-zinc-500 block text-[11px]">Account Access</span>
                  <span className="font-semibold text-zinc-200 text-sm">
                     No Signup Required
                  </span>
               </div>
            </div>

            {/* CONTENT AREA: Dynamic based on mode */}

            {/* MODE 1: Search Active */}
            {filteredData.mode === 'search' && (
               <div>
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Search Results for "{searchQuery}" ({filteredData.tools.length})
                     </span>
                     <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-[#daf4aa] hover:underline">
                        Clear Search
                     </button>
                  </div>

                  {filteredData.tools.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredData.tools.map((tool) => (
                           <ToolCard key={tool.id} tool={tool} />
                        ))}
                     </div>
                  ) : (
                     <div className="rounded-3xl border border-dashed border-zinc-800 bg-[#121215]/50 p-12 text-center flex flex-col items-center justify-center">
                        <Search size={32} className="text-zinc-600 mb-3" />
                        <h3 className="text-base font-bold text-zinc-200">
                           No tools matching "{searchQuery}"
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1 max-w-md">
                           Try searching with generic terms like "calculator", "json", "invoice", "qr", or "font".
                        </p>
                        <button
                           type="button"
                           onClick={() => setSearchQuery('')}
                           className="mt-4 px-4 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white">
                           Reset Search Filter
                        </button>
                     </div>
                  )}
               </div>
            )}

            {/* MODE 2: Single Category Selected */}
            {filteredData.mode === 'single-category' && (
               <div>
                  <div className="mb-6 rounded-3xl border border-zinc-800 bg-[#121215] p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                     <div className="flex items-start gap-4">
                        <div className="p-3.5 rounded-2xl bg-[#daf4aa]/15 text-[#daf4aa] border border-[#daf4aa]/30">
                           {renderIcon(filteredData.category.icon, 'w-6 h-6')}
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                                 {filteredData.category.name}
                              </h2>
                              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                                 {filteredData.tools.length} Tools
                              </span>
                           </div>
                           <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
                              {filteredData.category.description}
                           </p>
                        </div>
                     </div>

                     <button
                        type="button"
                        onClick={() => handleCategorySelect('all')}
                        className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors">
                        View All Categories
                     </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {filteredData.tools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} />
                     ))}
                  </div>
               </div>
            )}

            {/* MODE 3: All Categories Grouped Overview */}
            {filteredData.mode === 'all-categories' && (
               <div className="space-y-12">
                  {filteredData.groups.map(({ category, tools }) => (
                     <div key={category.id} className="flex flex-col gap-4">
                        {/* Category Row Header */}
                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                           <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-[#daf4aa]">
                                 {renderIcon(category.icon, 'w-4 h-4')}
                              </div>
                              <div>
                                 <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                    <span>{category.name}</span>
                                    <span className="text-[11px] font-normal text-zinc-500">
                                       ({tools.length})
                                    </span>
                                 </h2>
                                 <p className="text-[11px] text-zinc-400 line-clamp-1">
                                    {category.description}
                                 </p>
                              </div>
                           </div>

                           <button
                              type="button"
                              onClick={() => handleCategorySelect(category.slug)}
                              className="text-xs font-semibold text-[#daf4aa] hover:underline flex items-center gap-1 shrink-0">
                              <span>Explore</span>
                              <ChevronRight size={13} />
                           </button>
                        </div>

                        {/* Tool Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {tools.map((tool) => (
                              <ToolCard key={tool.id} tool={tool} />
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </main>
      </div>
   );
}

/* -------------------------------------------------------------------------- */
/*  REUSABLE TOOL CARD COMPONENT                                              */
/* -------------------------------------------------------------------------- */

function ToolCard({ tool }) {
   const isPlanned = tool.status === 'planned';
   const targetPath = tool.slug || tool.path || `/tools/${tool.id}`;

   return (
      <Link
         to={isPlanned ? '#' : targetPath}
         onMouseEnter={() => !isPlanned && preloadRoute(targetPath)}
         className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 shadow-md ${
            isPlanned
               ? 'border-zinc-800/40 bg-[#121215]/40 opacity-60 cursor-not-allowed'
               : 'border-zinc-800 bg-[#121215] hover:border-zinc-700 hover:bg-[#15151a]'
         }`}>
         <div>
            {/* Top row: Category tag & status indicator */}
            <div className="flex items-center justify-between mb-3">
               <span className="text-[10px] font-bold text-[#daf4aa] uppercase tracking-wider">
                  {tool.category}
               </span>
               <span className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400">
                  <span
                     className={`h-1.5 w-1.5 rounded-full ${
                        isPlanned ? 'bg-amber-500' : 'bg-emerald-500'
                     }`}
                  />
                  {isPlanned ? 'Coming Soon' : 'Live Tool'}
               </span>
            </div>

            {/* Tool Icon & Title */}
            <div className="flex items-start gap-3 mb-2.5">
               <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800/80 text-white shrink-0 group-hover:border-[#daf4aa]/40 transition-colors">
                  {renderIcon(tool.icon, 'w-4 h-4')}
               </div>
               <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#daf4aa] transition-colors leading-snug">
                     {tool.name}
                  </h3>
               </div>
            </div>

            {/* Description */}
            <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
               {tool.description}
            </p>
         </div>

         {/* Bottom tags & launch arrow */}
         <div className="pt-3 border-t border-zinc-800/60 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1.5 overflow-hidden pr-2">
               {tool.tags?.slice(0, 2).map((tag, idx) => (
                  <span
                     key={idx}
                     className="text-[10px] font-mono text-zinc-500 bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 rounded-md truncate max-w-[90px]">
                     #{tag}
                  </span>
               ))}
            </div>

            {!isPlanned ? (
               <span className="text-xs font-semibold text-[#daf4aa] flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
                  <span>Open</span>
                  <ArrowRight size={13} />
               </span>
            ) : (
               <span className="text-[11px] font-mono text-zinc-500">Planned</span>
            )}
         </div>
      </Link>
   );
}

