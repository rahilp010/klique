/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowUpRight, Sparkles, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { searchTools } from '../../data/tools';
import { preloadRoute } from '../../App';
import { trackToolSearch } from '../../lib/analytics';

export default function ToolSearch({
   isOpen,
   onClose,
   placeholder = 'Search tools, formulas, or problems (e.g. "calculate tax", "75% attendance")...',
}) {
   const [query, setQuery] = useState('');
   const [results, setResults] = useState([]);
   const inputRef = useRef(null);

   useEffect(() => {
      if (isOpen) {
         setQuery('');
         setResults(searchTools('', { includePlanned: true }).slice(0, 8));
         setTimeout(() => inputRef.current?.focus(), 50);
      }
   }, [isOpen]);

   // Global shortcut Ctrl+K or Cmd+K
   useEffect(() => {
      const handleKeyDown = (e) => {
         if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            if (isOpen && onClose) {
               onClose();
            }
         }
         if (e.key === 'Escape' && isOpen && onClose) {
            onClose();
         }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
   }, [isOpen, onClose]);

   const handleSearch = (e) => {
      const val = e.target.value;
      setQuery(val);
      const matches = searchTools(val, { includePlanned: true });
      setResults(matches.slice(0, 8));
      if (val.trim().length > 2) {
         trackToolSearch(val.length, matches.length);
      }
   };

   if (!isOpen) return null;

   return (
      <AnimatePresence>
         <div className="fixed inset-0 z-[300] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md">
            {/* Backdrop click */}
            <div className="fixed inset-0 -z-10" onClick={onClose} />

            <motion.div
               initial={{ opacity: 0, scale: 0.96, y: -10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.96, y: -10 }}
               transition={{ duration: 0.15 }}
               className="relative w-full max-w-2xl bg-[#121216] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
               {/* Search Input Bar */}
               <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800/80 bg-[#16161b]">
                  <Search size={18} className="text-zinc-400 shrink-0" />
                  <input
                     ref={inputRef}
                     type="text"
                     value={query}
                     onChange={handleSearch}
                     placeholder={placeholder}
                     className="w-full bg-transparent text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500 outline-none"
                  />
                  {query && (
                     <button
                        onClick={() => {
                           setQuery('');
                           setResults(searchTools('', { includePlanned: true }).slice(0, 8));
                        }}
                        className="text-zinc-500 hover:text-zinc-300 p-1">
                        <X size={16} />
                     </button>
                  )}
                  <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-800 rounded border border-zinc-700">
                     ESC
                  </kbd>
               </div>

               {/* Results List */}
               <div className="max-h-[60vh] overflow-y-auto customScrollbar p-2 divide-y divide-zinc-800/40">
                  {results.length > 0 ? (
                     results.map((tool) => {
                        const isPlanned = tool.status === 'planned';

                        return (
                           <Link
                              key={tool.id}
                              to={isPlanned ? '#' : tool.slug}
                              onClick={(e) => {
                                 if (isPlanned) {
                                    e.preventDefault();
                                    return;
                                 }
                                 onClose?.();
                              }}
                              onMouseEnter={() => !isPlanned && preloadRoute(tool.slug)}
                              className={`group flex items-center justify-between p-3 rounded-xl transition-all ${
                                 isPlanned
                                    ? 'opacity-60 cursor-default bg-zinc-900/20'
                                    : 'hover:bg-zinc-800/60 hover:text-white'
                              }`}>
                              <div className="min-w-0 pr-3">
                                 <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-zinc-200 group-hover:text-[#daf4aa] transition-colors truncate">
                                       {tool.name}
                                    </span>
                                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                                       {tool.category}
                                    </span>
                                    {isPlanned && (
                                       <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                          Coming in Phase 1
                                       </span>
                                    )}
                                 </div>
                                 <p className="text-xs text-zinc-500 truncate">
                                    {tool.description}
                                 </p>
                              </div>

                              {!isPlanned && (
                                 <div className="text-zinc-600 group-hover:text-[#daf4aa] shrink-0">
                                    <ArrowUpRight size={16} />
                                 </div>
                              )}
                           </Link>
                        );
                     })
                  ) : (
                     <div className="py-12 text-center text-zinc-500 text-xs sm:text-sm">
                        No matching tools found for "{query}".
                     </div>
                  )}
               </div>

               {/* Footer */}
               <div className="px-4 py-2.5 bg-[#0f0f12] border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Search by tool, problem, or keywords</span>
                  <div className="flex items-center gap-2">
                     <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 text-[10px]">
                           ⌘K
                        </kbd>
                        <span>to toggle</span>
                     </span>
                  </div>
               </div>
            </motion.div>
         </div>
      </AnimatePresence>
   );
}
