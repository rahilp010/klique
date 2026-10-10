import React, {
   useState,
   useCallback,
   memo,
   useEffect,
   useMemo,
   useRef,
} from 'react';
import Navbar from '../Navbar';
import SEO from '../SEO';
import { motion, AnimatePresence } from 'motion/react';

// Unicode 16.0 character data. Install with:
// npm install @unicode/unicode-16.0.0
import mathSymbols from '@unicode/unicode-16.0.0/General_Category/Math_Symbol/symbols.mjs';
import currencySymbols from '@unicode/unicode-16.0.0/General_Category/Currency_Symbol/symbols.mjs';
import otherSymbols from '@unicode/unicode-16.0.0/General_Category/Other_Symbol/symbols.mjs';
import modifierSymbols from '@unicode/unicode-16.0.0/General_Category/Modifier_Symbol/symbols.mjs';
import otherPunctuation from '@unicode/unicode-16.0.0/General_Category/Other_Punctuation/symbols.mjs';
import openPunctuation from '@unicode/unicode-16.0.0/General_Category/Open_Punctuation/symbols.mjs';
import closePunctuation from '@unicode/unicode-16.0.0/General_Category/Close_Punctuation/symbols.mjs';
import initialPunctuation from '@unicode/unicode-16.0.0/General_Category/Initial_Punctuation/symbols.mjs';
import finalPunctuation from '@unicode/unicode-16.0.0/General_Category/Final_Punctuation/symbols.mjs';
import dashPunctuation from '@unicode/unicode-16.0.0/General_Category/Dash_Punctuation/symbols.mjs';
import connectorPunctuation from '@unicode/unicode-16.0.0/General_Category/Connector_Punctuation/symbols.mjs';
import otherNumbers from '@unicode/unicode-16.0.0/General_Category/Other_Number/symbols.mjs';
import letterNumbers from '@unicode/unicode-16.0.0/General_Category/Letter_Number/symbols.mjs';

const unique = (items) => [...new Set(items)];

const isEmojiCharacter = (character) => {
   const cp = character.codePointAt(0);
   return (
      (cp >= 0x1f000 && cp <= 0x1faff) ||
      (cp >= 0x1fc00 && cp <= 0x1ffff) ||
      (cp >= 0x1f1e6 && cp <= 0x1f1ff) ||
      cp === 0xfe0f ||
      cp === 0x200d
   );
};

const clean = (items) =>
   unique(items).filter((item) => !isEmojiCharacter(item));

const symbolCategories = [
   {
      title: 'All Symbols',
      symbols: clean([
         ...otherSymbols,
         ...mathSymbols,
         ...currencySymbols,
         ...modifierSymbols,
         ...otherPunctuation,
         ...openPunctuation,
         ...closePunctuation,
         ...initialPunctuation,
         ...finalPunctuation,
         ...dashPunctuation,
         ...connectorPunctuation,
         ...otherNumbers,
         ...letterNumbers,
      ]),
   },
   {
      title: 'Stars & Decorative',
      symbols: clean(otherSymbols).filter((s) =>
         /[★☆✡✦✧✩✪✫✬✭✮✯✰⁂⁎⁑✢✣✤✥✱✲✳✴✵✶✷✸✹✺✻✼✽✾✿❀❁❂❃❇❈❉❊❋⋆]/u.test(s),
      ),
   },
   {
      title: 'Copyright & Trademark',
      symbols: clean(otherSymbols).filter((s) =>
         /[©®™℠℡℗№℀℁℅℆⅍☎☏✁✂✃✄✆✇✈✉✎✏✐✑✒§¶‰‱]/u.test(s),
      ),
   },
   { title: 'Currency Symbols', symbols: clean(currencySymbols) },
   {
      title: 'Bracket Symbols',
      symbols: clean([
         ...openPunctuation,
         ...closePunctuation,
         ...initialPunctuation,
         ...finalPunctuation,
      ]),
   },
   {
      title: 'Chess & Card',
      symbols: clean(otherSymbols).filter((s) =>
         /[♔♕♖♗♘♙♚♛♜♝♞♟♤♠♧♣♡♥♢♦]/u.test(s),
      ),
   },
   {
      title: 'Musical & Notation',
      symbols: clean(otherSymbols).filter((s) => /[♩♪♫♬♭♮♯𝄞𝄢𝄫𝄪]/u.test(s)),
   },
   {
      title: 'Arrow Symbols',
      symbols: clean(otherSymbols).filter((s) =>
         /[←↑→↓↔↕↖↗↘↙↚↛↜↝↞↟↠↡↢↣↤↥↦↧↨⇐⇑⇒⇓⇔⇕⇖⇗⇘⇙⇚⇛⇜⟵⟶⟷⟸⟹⟺➔➘➙➚➛➜➝➞➟➠➢➣➤]/u.test(s),
      ),
   },
   { title: 'Math Symbols', symbols: clean(mathSymbols) },
   {
      title: 'Punctuation & Marks',
      symbols: clean([
         ...otherPunctuation,
         ...dashPunctuation,
         ...connectorPunctuation,
         ...initialPunctuation,
         ...finalPunctuation,
      ]),
   },
   {
      title: 'Numbers & Fractions',
      symbols: clean([...otherNumbers, ...letterNumbers]),
   },
];

const SymbolButton = memo(({ symbol, onCopy }) => (
   <button
      type="button"
      onClick={() => onCopy(symbol)}
      aria-label={`Copy ${symbol}`}
      title={`Copy ${symbol}`}
      className="aspect-square flex items-center justify-center text-xl sm:text-2xl md:text-3xl min-h-[3rem] sm:min-h-[3.5rem] md:min-h-0 bg-[#18181b] hover:bg-zinc-800 active:bg-zinc-700 rounded-xl transition-all duration-200 border border-zinc-800/80 hover:border-zinc-700 group shadow-sm">
      <span className="transition-transform duration-200 group-hover:scale-110 text-zinc-300 group-hover:text-zinc-100">
         {symbol}
      </span>
   </button>
));

const responsiveSafetyStyles = `
  html, body { max-width: 100%; overflow-x: hidden; }
  button, input, select, textarea { touch-action: manipulation; }
  * { min-width: 0; }
`;

export default function CoolSymbol() {
   const [activeCategory, setActiveCategory] = useState(0);
   const [recentSymbols, setRecentSymbols] = useState([]);
   const [search, setSearch] = useState('');
   const [toast, setToast] = useState({
      message: '',
      type: 'success',
      visible: false,
   });

   const PAGE_SIZE = 40;
   const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
   const loadMoreRef = useRef(null);
   const symbolScrollRef = useRef(null);

   useEffect(() => {
      try {
         const stored = JSON.parse(
            localStorage.getItem('recentSymbol') || '[]',
         );
         setRecentSymbols(
            Array.isArray(stored)
               ? stored.filter((item) => typeof item === 'string')
               : [],
         );
      } catch {
         setRecentSymbols([]);
      }
   }, []);

   const showNotification = useCallback(
      (message, type = 'success', duration = 2500) => {
         setToast({ message, type, visible: true });
         window.setTimeout(
            () => setToast((prev) => ({ ...prev, visible: false })),
            duration,
         );
      },
      [],
   );

   const handleCopy = useCallback(
      async (symbol) => {
         try {
            await navigator.clipboard.writeText(symbol);
            showNotification(`Copied "${symbol}" to clipboard!`, 'success');
            setRecentSymbols((prev) => {
               const updated = [
                  symbol,
                  ...prev.filter((item) => item !== symbol),
               ].slice(0, 12);
               try {
                  localStorage.setItem('recentSymbol', JSON.stringify(updated));
               } catch {
                  // Ignore storage errors
               }
               return updated;
            });
         } catch {
            showNotification(
               'Could not copy this symbol. Check clipboard permissions.',
               'error',
            );
         }
      },
      [showNotification],
   );

   const activeSymbols = symbolCategories[activeCategory];
   const visibleSymbols = useMemo(() => {
      const normalizedSearch = search.trim().toLocaleLowerCase();
      const list = activeSymbols?.symbols ?? [];
      if (!normalizedSearch) return list;
      return list.filter(
         (symbol) =>
            symbol.toLocaleLowerCase().includes(normalizedSearch) ||
            `u+${symbol.codePointAt(0).toString(16)}`.includes(
               normalizedSearch,
            ),
      );
   }, [activeSymbols, search]);

   const paginatedSymbols = useMemo(
      () => visibleSymbols.slice(0, visibleCount),
      [visibleSymbols, visibleCount],
   );

   const hasMoreSymbols = visibleCount < visibleSymbols.length;

   useEffect(() => {
      setVisibleCount(PAGE_SIZE);
      if (symbolScrollRef.current) {
         symbolScrollRef.current.scrollTop = 0;
      }
   }, [activeCategory, search]);

   useEffect(() => {
      const sentinel = loadMoreRef.current;
      const scrollContainer = symbolScrollRef.current;

      if (!sentinel || !scrollContainer || !hasMoreSymbols) return;

      const observer = new IntersectionObserver(
         (entries) => {
            if (!entries[0]?.isIntersecting) return;

            setVisibleCount((currentCount) => {
               if (currentCount >= visibleSymbols.length) {
                  return currentCount;
               }
               return Math.min(currentCount + PAGE_SIZE, visibleSymbols.length);
            });
         },
         {
            root: scrollContainer,
            rootMargin: '200px 0px',
            threshold: 0,
         },
      );

      observer.observe(sentinel);
      return () => observer.disconnect();
   }, [visibleSymbols.length, visibleCount, hasMoreSymbols]);

   return (
      <>
         <style>{responsiveSafetyStyles}</style>
         <div
            className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden

    before:absolute

    before:inset-0

    before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]

    after:absolute

    after:inset-0

    after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
            <div
               className="
    pointer-events-none absolute inset-0
    bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]
  "
            />
            <SEO
               title="Unicode Symbols Copy & Paste | Special Characters | Klique"
               description="Browse and copy Unicode symbols, stars, arrows, currency signs, math operators, brackets, and decorative characters."
               keywords="unicode symbols, special characters, symbol copy paste, currency symbols, math symbols, arrows, brackets"
               canonicalUrl="https://klique.netlify.app/symbol"
            />

            {/* Static ambient backdrop */}
            <div
               aria-hidden
               className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
            />
            <div
               aria-hidden
               className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
            />

            <div className="relative z-[100] w-full mb-6">
               <Navbar />
            </div>

            <AnimatePresence>
               {toast.visible && (
                  <motion.div
                     initial={{ opacity: 0, y: -20, x: '-50%' }}
                     animate={{ opacity: 1, y: 0, x: '-50%' }}
                     exit={{ opacity: 0, y: -20, x: '-50%' }}
                     className="fixed top-20 left-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm sm:w-auto">
                     <div
                        className={`w-full sm:w-auto px-4 py-3 rounded-full shadow-lg flex items-center gap-3 border bg-[#18181b] backdrop-blur-md ${toast.type === 'error' ? 'border-red-500/50 text-red-400' : 'border-green-500/50 text-green-400'}`}>
                        <span aria-hidden>
                           {toast.type === 'error' ? '!' : '✓'}
                        </span>
                        <p className="text-xs sm:text-sm font-medium pr-2 break-words text-center sm:text-left">
                           {toast.message}
                        </p>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full text-center sm:text-left mb-6 sm:mb-10">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-zinc-100 tracking-tight mb-2 sm:mb-3">
                     Unicode Symbol Library
                  </h1>
                  <p className="text-zinc-500 text-sm sm:text-base font-medium leading-relaxed max-w-2xl mx-auto sm:mx-0">
                     Browse and copy Unicode special characters. Emojis are
                     available in the separate Emoji tool.
                  </p>
               </motion.div>

               <div className="w-full flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 mb-8 relative z-20">
                  {symbolCategories.map((cat, idx) => (
                     <button
                        key={cat.title}
                        type="button"
                        onClick={() => {
                           setActiveCategory(idx);
                           setSearch('');
                        }}
                        className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex-grow sm:flex-grow-0 ${activeCategory === idx ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm' : 'bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'}`}>
                        {cat.title}
                     </button>
                  ))}
               </div>

               {recentSymbols.length > 0 && (
                  <motion.section
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     className="w-full mb-6 sm:mb-10 bg-[#121214] border border-zinc-800/80 rounded-2xl p-3 sm:p-5 shadow-xl relative z-20 min-w-0">
                     <div className="flex items-center justify-between gap-3 mb-4">
                        <h2 className="text-xs sm:text-sm font-medium text-zinc-400 uppercase tracking-wider">
                           Recently Used
                        </h2>
                        <button
                           type="button"
                           onClick={() => {
                              setRecentSymbols([]);
                              localStorage.removeItem('recentSymbol');
                           }}
                           className="text-xs text-red-500 hover:text-red-400 transition-colors cursor-pointer px-2 py-1">
                           Clear
                        </button>
                     </div>
                     <div className="grid grid-cols-5 min-[480px]:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 sm:gap-3">
                        {recentSymbols.map((symbol, i) => (
                           <SymbolButton
                              key={`${symbol}-${i}`}
                              symbol={symbol}
                              onCopy={handleCopy}
                           />
                        ))}
                     </div>
                  </motion.section>
               )}

               <section
                  ref={symbolScrollRef}
                  className="w-full p-4 sm:p-6 lg:p-8 bg-[#121214] border border-zinc-800/80 rounded-2xl shadow-xl overflow-y-auto customScrollbar h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[90vh] relative z-20 min-w-0">
                  <div className="mb-5 sm:mb-6 border-b border-zinc-800/50 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                     <div>
                        <h2 className="text-lg sm:text-xl font-medium text-zinc-200 break-words">
                           {activeSymbols.title}
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                           {visibleSymbols.length.toLocaleString()} characters ·
                           Unicode 16.0
                        </p>
                     </div>
                  </div>
                  {visibleSymbols.length > 0 ? (
                     <div className="grid grid-cols-4 min-[400px]:grid-cols-5 min-[480px]:grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16 gap-2 sm:gap-2.5">
                        {paginatedSymbols.map((symbol, i) => (
                           <SymbolButton
                              key={`${activeCategory}-${symbol}-${i}`}
                              symbol={symbol}
                              onCopy={handleCopy}
                           />
                        ))}
                     </div>
                  ) : (
                     <p className="py-12 text-center text-sm text-zinc-500">
                        No characters found in this category.
                     </p>
                  )}

                  {hasMoreSymbols && (
                     <div
                        ref={loadMoreRef}
                        className="flex items-center justify-center gap-2 py-6 text-xs sm:text-sm text-zinc-500"
                        aria-live="polite">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" />
                        <span>
                           Loading more symbols...{' '}
                           <span className="text-zinc-600 font-medium">
                              {Math.min(visibleCount, visibleSymbols.length)} /{' '}
                              {visibleSymbols.length}
                           </span>
                        </span>
                     </div>
                  )}

                  {!hasMoreSymbols && visibleSymbols.length > PAGE_SIZE && (
                     <p className="text-center text-xs text-zinc-600 py-5">
                        All {visibleSymbols.length} characters loaded
                     </p>
                  )}
               </section>
            </main>
         </div>
      </>
   );
}
