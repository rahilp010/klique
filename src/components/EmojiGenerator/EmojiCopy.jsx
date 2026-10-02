/* eslint-disable react-hooks/exhaustive-deps */
import React, {
   useMemo,
   useState,
   memo,
   useCallback,
   useEffect,
   useRef,
} from 'react';
import emojis from 'emoji-datasource';
import Navbar from '../Navbar';
import SEO from '../SEO';
import { FaBars } from 'react-icons/fa';
import { FiCheck } from 'react-icons/fi';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactCountryFlag from 'react-country-flag';
import { ColumnLines } from '@/components/ui/download-with-columnlines-utils/columnlines';
import { Input } from '../ui/CustomControl';

// Utility: Convert unified code to emoji char
const unifiedToEmoji = (unified) =>
   unified
      .split('-')
      .map((u) => String.fromCodePoint(parseInt(u, 16)))
      .join('');

// Memoized emoji button with flag support
const EmojiButton = memo(({ emoji, onCopy }) => {
   const isFlag = emoji.category?.toLowerCase().includes('flag');

   const countryCode = useMemo(() => {
      if (!isFlag) return null;
      const parts = emoji.unified?.split('-') || [];
      if (parts.length !== 2) return null;

      const code1 = parseInt(parts[0], 16);
      const code2 = parseInt(parts[1], 16);

      if (
         isNaN(code1) ||
         isNaN(code2) ||
         code1 < 0x1f1e6 ||
         code1 > 0x1f1ff ||
         code2 < 0x1f1e6 ||
         code2 > 0x1f1ff
      ) {
         return null;
      }

      return (
         String.fromCodePoint(code1 - 0x1f1e6 + 65) +
         String.fromCodePoint(code2 - 0x1f1e6 + 65)
      );
   }, [isFlag, emoji.unified]);

   return (
      <button
         title={emoji.name}
         onClick={() => onCopy(emoji)}
         className="aspect-square flex items-center justify-center text-2xl sm:text-2xl lg:text-4xl 
               bg-[#18181b] hover:bg-zinc-800 active:bg-zinc-700 rounded-2xl 
               transition-all duration-200 border border-zinc-800/80 hover:border-zinc-700
               min-h-[2.75rem] sm:min-h-[3rem] lg:min-h-[4rem] group shadow-sm">
         {isFlag && countryCode ? (
            <ReactCountryFlag
               countryCode={countryCode}
               svg
               style={{ width: '1em', height: '1em' }}
               title={`${countryCode} flag`}
            />
         ) : (
            <span className="transition-transform duration-200 group-hover:scale-110">
               {emoji.char}
            </span>
         )}
      </button>
   );
});

const responsiveSafetyStyles = `
  html, body {
    max-width: 100%;
    overflow-x: hidden;
  }

  button, input, select, textarea {
    touch-action: manipulation;
  }

  * {
    min-width: 0;
  }
`;

export default function EmojiCopy() {
   const [selectedTab, setSelectedTab] = useState('All');
   const [searchTerm, setSearchTerm] = useState('');
   const [recentEmojis, setRecentEmojis] = useState([]);
   const [placeholderIndex, setPlaceholderIndex] = useState(0);

   // Infinite-scroll pagination: render 40 at a time.
   const PAGE_SIZE = 40;
   const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
   const loadMoreRef = useRef(null);
   const emojiScrollRef = useRef(null);

   const [toast, setToast] = useState({
      message: '',
      type: 'success',
      visible: false,
   });
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [isMobile, setIsMobile] = useState(false);

   useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
   }, []);

   useEffect(() => {
      const stored = JSON.parse(localStorage.getItem('recentEmojis') || '[]');
      setRecentEmojis(stored);
   }, []);

   const processedEmojis = useMemo(
      () =>
         emojis.reduce((acc, e) => {
            if (!e.unified || !e.short_name) return acc;
            acc.push({
               char: unifiedToEmoji(e.unified),
               unified: e.unified,
               name: e.short_name,
               category: e.category || 'Others',
            });
            return acc;
         }, []),
      [],
   );

   const groupedEmojis = useMemo(() => {
      const groups = {};
      processedEmojis.forEach((emoji) => {
         if (!groups[emoji.category]) groups[emoji.category] = [];
         groups[emoji.category].push(emoji);
      });
      return groups;
   }, [processedEmojis]);

   const categories = useMemo(
      () => ['All', ...Object.keys(groupedEmojis)],
      [groupedEmojis],
   );

   const displayedEmojis = useMemo(() => {
      let filtered =
         selectedTab === 'All'
            ? processedEmojis
            : groupedEmojis[selectedTab] || [];

      if (searchTerm.trim()) {
         const lowerSearch = searchTerm.toLowerCase();
         filtered = filtered.filter((emoji) =>
            emoji.name.toLowerCase().includes(lowerSearch),
         );
      }

      return filtered;
   }, [selectedTab, groupedEmojis, processedEmojis, searchTerm]);

   // Only render the first 40 initially.
   const visibleEmojis = useMemo(
      () => displayedEmojis.slice(0, visibleCount),
      [displayedEmojis, visibleCount],
   );

   const hasMoreEmojis = visibleCount < displayedEmojis.length;

   // Reset to the first 40 whenever search/category changes.
   useEffect(() => {
      setVisibleCount(PAGE_SIZE);

      if (emojiScrollRef.current) {
         emojiScrollRef.current.scrollTop = 0;
      }
   }, [selectedTab, searchTerm]);

   // Automatically load the next 40 when the user approaches the bottom.
   useEffect(() => {
      const sentinel = loadMoreRef.current;
      const scrollContainer = emojiScrollRef.current;

      if (!sentinel || !scrollContainer || !hasMoreEmojis) return;

      const observer = new IntersectionObserver(
         (entries) => {
            if (entries[0]?.isIntersecting) {
               setVisibleCount((prev) =>
                  Math.min(prev + PAGE_SIZE, displayedEmojis.length),
               );
            }
         },
         {
            root: scrollContainer,
            rootMargin: '200px 0px',
            threshold: 0,
         },
      );

      observer.observe(sentinel);

      return () => observer.disconnect();
   }, [displayedEmojis.length, hasMoreEmojis]);

   const currentSectionTitle = useMemo(() => {
      if (searchTerm.trim()) return `Search Results for "${searchTerm}"`;
      if (selectedTab === 'All') return 'All Emojis';
      return selectedTab;
   }, [searchTerm, selectedTab]);

   const showNotification = useCallback(
      (message, type = 'success', duration = 2500) => {
         setToast({ message, type, visible: true });
         setTimeout(
            () => setToast((prev) => ({ ...prev, visible: false })),
            duration,
         );
      },
      [],
   );

   const handleCopy = useCallback(
      async (emojiObj) => {
         try {
            await navigator.clipboard.writeText(emojiObj.char);
            showNotification(
               `Copied ${emojiObj.char} to clipboard!`,
               'success',
            );

            setRecentEmojis((prev) => {
               const updated = [
                  emojiObj,
                  ...prev.filter((e) => e.unified !== emojiObj.unified),
               ];
               const limited = updated.slice(0, 10);
               localStorage.setItem('recentEmojis', JSON.stringify(limited));
               return limited;
            });
         } catch {
            showNotification('Failed to copy 😞', 'error');
         }
      },
      [showNotification],
   );

   const handleSearchChange = useCallback((e) => {
      setSearchTerm(e.target.value);
      setSelectedTab('All');
   }, []);

   const placeholder = [
      'Search 🎨emojis by name...',
      'Search 🏳️flags by country code...',
      'Search what you want...',
   ];

   useEffect(() => {
      const interval = setInterval(() => {
         setPlaceholderIndex((prev) => (prev + 1) % placeholder.length);
      }, 3000);
      return () => clearInterval(interval);
   }, []);

   return (
      <>
         <style>{responsiveSafetyStyles}</style>
         <ColumnLines
            columnWidth={80}
            columnCount={34}
            radialFadeStart={15}
            radialFadeEnd={90}
            className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden px-3 sm:px-4 md:px-10">
            <SEO
               title="Emoji Mixer & Generator | Combine Emojis | Klique"
               description="Browse, mix, and copy-paste emojis easily. Create unique emoji combinations, search by category or country, and access trending emojis instantly."
               keywords="emoji mixer, emoji generator, copy paste emojis, mix emojis, emoji merger, klique emojis, emojis browser"
               canonicalUrl="https://klique.netlify.app/emojigenerator"
            />

            <div className="relative z-[100] w-full bg-[#16161b] transition-all duration-300 my-5">
               <Navbar />
            </div>

            <div className="w-full max-w-6xl min-w-0 mx-auto pl-0 lg:pl-20 px-3 sm:px-6 relative z-20 pt-24 pb-32 overflow-x-hidden">
               {/* Toast Notification */}
               <AnimatePresence>
                  {toast.visible && (
                     <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className="fixed top-20 left-1/2 z-[9999] w-[calc(100%-2rem)] sm:w-auto">
                        <div
                           className={`w-full sm:w-auto px-4 py-3 rounded-full shadow-lg flex items-center gap-3 border bg-[#18181b] backdrop-blur-md ${
                              toast.type === 'error'
                                 ? 'border-red-500/50 text-red-400'
                                 : 'border-green-500/50 text-green-400'
                           }`}>
                           {toast.type === 'error' ? (
                              <FiCheck className="w-4 h-4 hidden" />
                           ) : (
                              <FiCheck className="w-4 h-4" />
                           )}
                           <p className="text-xs sm:text-sm font-medium pr-2 break-words">
                              {toast.message}
                           </p>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>

               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full text-center mb-7 sm:mb-10 px-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-zinc-100 tracking-tight mb-2 sm:mb-3">
                     Emoji Browser
                  </h1>
                  <p className="text-zinc-500 text-xs sm:text-sm lg:text-base font-medium leading-relaxed">
                     Search, copy, and paste your favorite emojis instantly
                  </p>
               </motion.div>

               {/* Search Input */}
               <div className="w-full max-w-2xl mx-auto mb-6 sm:mb-8 relative z-20">
                  <div className="relative">
                     <Search className="absolute left-3.5 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 pointer-events-none" />
                     <input
                        type="text"
                        placeholder={placeholder[placeholderIndex]}
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full min-w-0 pl-11 sm:pl-12 pr-11 sm:pr-12 py-3 sm:py-4 rounded-2xl bg-[#0f0f11] border border-zinc-800/80 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-all text-base shadow-xl"
                     />

                     {searchTerm && (
                        <button
                           onClick={() => setSearchTerm('')}
                           className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
                           <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                           </svg>
                        </button>
                     )}
                  </div>
                  {searchTerm && displayedEmojis.length > 0 && (
                     <p className="text-xs sm:text-sm text-zinc-500 mt-3 text-center font-medium">
                        Found{' '}
                        <span className="text-zinc-300 font-semibold">
                           {displayedEmojis.length}
                        </span>{' '}
                        emoji{displayedEmojis.length !== 1 ? 's' : ''}
                     </p>
                  )}
               </div>

               {recentEmojis.length > 0 && (
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="w-full max-w-4xl mx-auto mb-7 sm:mb-10 bg-[#121214] border border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-xl relative z-20 min-w-0">
                     <h2 className="text-sm font-medium mb-4 text-zinc-400 uppercase tracking-wider">
                        Recently Used
                     </h2>
                     <div className="flex flex-wrap gap-2 sm:gap-3">
                        {recentEmojis.map((emoji, i) => (
                           <EmojiButton
                              key={i}
                              emoji={emoji}
                              onCopy={handleCopy}
                           />
                        ))}
                     </div>
                  </motion.div>
               )}

               {/* Category Tabs */}
               {!searchTerm && (
                  <div className="w-full max-w-4xl mx-auto mb-6 sm:mb-8 relative z-20">
                     <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        {categories
                           .filter(
                              (cat) => cat !== 'Flag' && cat !== 'Component',
                           )
                           .map((cat) => (
                              <button
                                 key={cat}
                                 onClick={() => setSelectedTab(cat)}
                                 className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                                    selectedTab === cat
                                       ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                                       : 'bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
                                 }`}>
                                 {cat}
                              </button>
                           ))}
                     </div>
                  </div>
               )}

               <div
                  ref={emojiScrollRef}
                  className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-[#121214] border border-zinc-800/80 rounded-2xl shadow-xl overflow-y-auto customScrollbar h-[62vh] sm:h-[65vh] md:h-[75vh] relative z-20 min-w-0">
                  <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-800/50 pb-4">
                     <h2 className="text-base sm:text-xl font-medium text-zinc-200 break-words">
                        {currentSectionTitle}
                     </h2>
                     {!searchTerm && selectedTab !== 'All' && (
                        <p className="text-xs sm:text-sm text-zinc-500 font-medium">
                           {groupedEmojis[selectedTab]?.length || 0} items
                        </p>
                     )}
                  </div>

                  <div className="grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-10 gap-1.5 sm:gap-2.5">
                     {displayedEmojis.length > 0 ? (
                        visibleEmojis.map((emoji, i) => (
                           <EmojiButton
                              key={`${selectedTab}-${i}`}
                              emoji={emoji}
                              onCopy={handleCopy}
                           />
                        ))
                     ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-zinc-500">
                           <Search className="w-12 h-12 mb-4 text-zinc-700" />
                           <p className="text-lg font-medium text-zinc-400 mb-2">
                              No emojis found
                           </p>
                           <p className="text-sm">
                              Try a different search term or category.
                           </p>
                        </div>
                     )}
                  </div>

                  {hasMoreEmojis && (
                     <div
                        ref={loadMoreRef}
                        className="flex items-center justify-center gap-2 py-5 text-xs text-zinc-500"
                        aria-live="polite">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" />
                        <span>
                           Loading more emojis…{' '}
                           <span className="text-zinc-600">
                              {Math.min(visibleCount, displayedEmojis.length)} /{' '}
                              {displayedEmojis.length}
                           </span>
                        </span>
                     </div>
                  )}

                  {!hasMoreEmojis && displayedEmojis.length > PAGE_SIZE && (
                     <p className="text-center text-[11px] text-zinc-600 py-4">
                        All {displayedEmojis.length} emojis loaded
                     </p>
                  )}
               </div>
            </div>
         </ColumnLines>
      </>
   );
}
