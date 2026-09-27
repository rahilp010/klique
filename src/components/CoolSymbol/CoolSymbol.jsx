import React, { useState, useCallback, memo, useEffect } from 'react';
import Navbar from '../Navbar';
import SEO from '../SEO';
import { FaBars } from 'react-icons/fa';
import { FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'motion/react';
import { ColumnLines } from '@/components/ui/download-with-columnlines-utils/columnlines';

const symbolCategories = [
   {
      title: 'Stars Symbols',
      symbols: [
         '★',
         '☆',
         '✡',
         '✦',
         '✧',
         '✩',
         '✪',
         '✫',
         '✬',
         '✭',
         '✮',
         '✯',
         '✰',
         '⁂',
         '⁎',
         '⁑',
         '✢',
         '✣',
         '✤',
         '✥',
         '✱',
         '✲',
         '✳',
         '✴',
         '✵',
         '✶',
         '✷',
         '✸',
         '✹',
         '✺',
         '✻',
         '✼',
         '✽',
         '✾',
         '✿',
         '❀',
         '❁',
         '❂',
         '❃',
         '❇',
         '❈',
         '❉',
         '❊',
         '❋',
         '⋆',
         '🌟',
         '💫',
         '✨',
         '⭐',
      ],
   },
   {
      title: 'Copyright & Trademark',
      symbols: [
         '©',
         '®',
         '™',
         '℠',
         '℡',
         '℗',
         '‱',
         '№',
         '℀',
         '℁',
         '℅',
         '℆',
         '⅍',
         '☎',
         '☏',
         '✁',
         '✂',
         '✃',
         '✄',
         '✆',
         '✇',
         '✈',
         '✉',
         '✎',
         '✏',
         '✐',
         '✑',
         '✒',
         '‰',
         '§',
         '¶',
      ],
   },
   {
      title: 'Currency Symbols',
      symbols: [
         '¢',
         '$',
         '€',
         '£',
         '¥',
         '₹',
         '₽',
         '฿',
         '₠',
         '₡',
         '₢',
         '₣',
         '₤',
         '₥',
         '₦',
         '₧',
         '₨',
         '₩',
         '₪',
         '₫',
         '₭',
         '₯',
         '₰',
         '₱',
         '₲',
         '₳',
         '₴',
         '₵',
         '¤',
         'ƒ',
      ],
   },
   {
      title: 'Bracket Symbols',
      symbols: [
         '〈',
         '〉',
         '《',
         '》',
         '「',
         '」',
         '『',
         '』',
         '【',
         '】',
         '〔',
         '〕',
         '︵',
         '︶',
         '︷',
         '︸',
         '︹',
         '︺',
         '︻',
         '︼',
         '︽',
         '︾',
         '︿',
         '﹀',
         '﹁',
         '﹂',
         '﹃',
         '﹄',
         '（',
         '）',
         '｛',
         '｝',
         '«',
         '»',
         '‹',
         '›',
      ],
   },
   {
      title: 'Chess & Card',
      symbols: [
         '♔',
         '♕',
         '♖',
         '♗',
         '♘',
         '♙',
         '♚',
         '♛',
         '♜',
         '♝',
         '♞',
         '♟',
         '♤',
         '♠',
         '♧',
         '♣',
         '♡',
         '♥',
         '♢',
         '♦',
      ],
   },
   {
      title: 'Musical Notes',
      symbols: [
         '♩',
         '♪',
         '♫',
         '♬',
         '♭',
         '♮',
         '♯',
         '𝄞',
         '𝄢',
         '𝄫',
         '𝄪',
         '🎵',
         '🎶',
         '🎼',
      ],
   },
   {
      title: 'Arrow Symbols',
      symbols: [
         '←',
         '↑',
         '→',
         '↓',
         '↔',
         '↕',
         '↖',
         '↗',
         '↘',
         '↙',
         '↚',
         '↛',
         '↜',
         '↝',
         '↞',
         '↟',
         '↠',
         '↡',
         '↢',
         '↣',
         '↤',
         '↥',
         '↦',
         '↧',
         '↨',
         '⇐',
         '⇑',
         '⇒',
         '⇓',
         '⇔',
         '⇕',
         '⇖',
         '⇗',
         '⇘',
         '⇙',
         '⇚',
         '⇛',
         '⇜',
         '⟵',
         '⟶',
         '⟷',
         '⟸',
         '⟹',
         '⟺',
         '➔',
         '➘',
         '➙',
         '➚',
         '➛',
         '➜',
         '➝',
         '➞',
         '➟',
         '➠',
         '➡',
         '➢',
         '➣',
         '➤',
      ],
   },
   {
      title: 'Heart & Love',
      symbols: [
         '♡',
         '♥',
         '❤',
         '❥',
         '❦',
         '❧',
         '💕',
         '💖',
         '💗',
         '💘',
         '💙',
         '💚',
         '💛',
         '💜',
         '💝',
         '💞',
         '💟',
         '💓',
         '💔',
         '❣',
      ],
   },
   {
      title: 'Math Symbols',
      symbols: [
         '±',
         '×',
         '÷',
         '∓',
         '∔',
         '∕',
         '∖',
         '∗',
         '∘',
         '∙',
         '√',
         '∛',
         '∜',
         '∝',
         '∞',
         '∟',
         '∠',
         '∡',
         '∢',
         '∣',
         '∤',
         '∥',
         '∦',
         '∧',
         '∨',
         '∩',
         '∪',
         '∫',
         '∬',
         '∭',
         '∮',
         '∯',
         '∰',
         '∱',
         '∲',
         '∳',
         '⊕',
         '⊗',
         '⊙',
         '≈',
         '≠',
         '≡',
         '≤',
         '≥',
         '⊂',
         '⊃',
         '⊄',
         '⊅',
         '⊆',
         '⊇',
      ],
   },
   {
      title: 'Weather & Nature',
      symbols: [
         '☀',
         '☁',
         '☂',
         '☃',
         '☄',
         '★',
         '☆',
         '☇',
         '☈',
         '☉',
         '☊',
         '☋',
         '☌',
         '☍',
         '☼',
         '☽',
         '☾',
         '☿',
         '♀',
         '♁',
         '♂',
         '♃',
         '♄',
         '♅',
         '♆',
         '♇',
         '🌙',
         '🌞',
         '🌝',
         '🌛',
         '🌜',
         '🌚',
         '🌕',
         '🌖',
         '🌗',
         '🌘',
         '🌑',
         '🌒',
         '🌓',
         '🌔',
         '⛅',
         '🌤',
         '🌦',
         '🌧',
         '⛈',
         '🌩',
         '🌨',
         '❄',
         '☃',
         '⛄',
         '🌬',
         '💨',
         '🌪',
         '🌫',
         '☔',
         '💧',
         '💦',
         '🌊',
      ],
   },
   {
      title: 'Flower & Plant',
      symbols: [
         '❀',
         '❁',
         '❃',
         '❋',
         '✿',
         '✾',
         '✽',
         '✼',
         '✻',
         '✺',
         '✹',
         '✸',
         '✷',
         '❦',
         '❧',
         '🌸',
         '🌺',
         '🌻',
         '🌷',
         '🌹',
         '🥀',
         '🌼',
         '🌿',
         '☘',
         '🍀',
         '🍁',
         '🍂',
         '🍃',
         '🌾',
         '🌱',
         '🌲',
         '🌳',
         '🌴',
         '🌵',
      ],
   },
   {
      title: 'Hand & Finger',
      symbols: [
         '☜',
         '☝',
         '☞',
         '☟',
         '✌',
         '✍',
         '👆',
         '👇',
         '👈',
         '👉',
         '👊',
         '👋',
         '👌',
         '👍',
         '👎',
         '👏',
         '🙌',
         '🙏',
         '💪',
         '🤝',
         '🤞',
         '🤘',
         '🤙',
         '🖐',
         '✋',
      ],
   },
   {
      title: 'Face & Emotion',
      symbols: [
         '☹',
         '☺',
         '☻',
         '😀',
         '😁',
         '😂',
         '😃',
         '😄',
         '😅',
         '😆',
         '😇',
         '😈',
         '😉',
         '😊',
         '😋',
         '😌',
         '😍',
         '😎',
         '😏',
         '😐',
         '😑',
         '😒',
         '😓',
         '😔',
         '😕',
         '😖',
         '😗',
         '😘',
         '😙',
         '😚',
         '😛',
         '😜',
         '😝',
         '😞',
         '😟',
         '😠',
         '😡',
         '😢',
         '😣',
         '😤',
         '😥',
         '😦',
         '😧',
         '😨',
         '😩',
         '😪',
         '😫',
         '😬',
         '😭',
         '😮',
         '😯',
         '😰',
         '😱',
         '😲',
         '😳',
         '😴',
         '😵',
         '😶',
         '😷',
      ],
   },
];

const SymbolButton = memo(({ symbol, onCopy }) => (
   <button
      onClick={() => onCopy(symbol)}
      className="aspect-square flex items-center justify-center text-3xl sm:text-4xl 
               bg-[#18181b] hover:bg-zinc-800 active:bg-zinc-700 rounded-xl 
               transition-all duration-200 border border-zinc-800/80 hover:border-zinc-700
               group shadow-sm">
      <span className="transition-transform duration-200 group-hover:scale-110 text-zinc-300 group-hover:text-zinc-100">
         {symbol}
      </span>
   </button>
));

export default function CoolSymbol() {
   const [activeCategory, setActiveCategory] = useState(0);
   const [recentEmojis, setRecentEmojis] = useState([]);
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
      const stored = JSON.parse(localStorage.getItem('recentSymbol') || '[]');
      setRecentEmojis(stored);
   }, []);

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
      async (symbol) => {
         try {
            await navigator.clipboard.writeText(symbol);
            showNotification(`Copied "${symbol}" to clipboard!`, 'success');

            setRecentEmojis((prev) => {
               const updated = [symbol, ...prev.filter((e) => e !== symbol)];
               const limited = updated.slice(0, 10);
               localStorage.setItem('recentSymbol', JSON.stringify(limited));
               return limited;
            });
         } catch {
            showNotification('Failed to copy 😞', 'error');
         }
      },
      [showNotification],
   );

   const activeSymbols = symbolCategories[activeCategory];

   return (
      <ColumnLines
         columnWidth={80}
         columnCount={34}
         radialFadeStart={15}
         radialFadeEnd={90}
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-4 py-20 md:px-10">
         <SEO
            title="Cool Symbols Copy & Paste | Fancy Text Symbols | Klique"
            description="Browse and copy-paste cool symbols, aesthetic characters, hearts, stars, arrows, and mathematical symbols for your social media bios and gaming handles."
            keywords="symbols copy paste, cool symbols, text symbols, aesthetic symbols, star symbol, heart symbol, klique symbols, aesthetic letters"
            canonicalUrl="https://klique.netlify.app/symbol"
         />

         <div className="w-full sticky top-0 z-30 bg-[#16161b] transition-all duration-300">
            <Navbar />
         </div>

         {/* Toast Notification */}
         <AnimatePresence>
            {toast.visible && (
               <motion.div
                  initial={{ opacity: 0, y: -20, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: -20, x: '-50%' }}
                  className="fixed top-6 left-1/2 z-50">
                  <div
                     className={`px-4 py-3 rounded-full shadow-lg flex items-center gap-3 border bg-[#18181b] backdrop-blur-md ${
                        toast.type === 'error'
                           ? 'border-red-500/50 text-red-400'
                           : 'border-green-500/50 text-green-400'
                     }`}>
                     {toast.type === 'error' ? (
                        <FiCheck className="w-4 h-4 hidden" />
                     ) : (
                        <FiCheck className="w-4 h-4" />
                     )}
                     <p className="text-sm font-medium pr-2">{toast.message}</p>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         <div className="w-full max-w-6xl mx-auto pl-0 lg:pl-20 px-3 sm:px-6 relative z-20">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center mb-10">
               <h1 className="text-3xl sm:text-4xl font-medium text-zinc-100 tracking-tight mb-3">
                  Symbol Browser
               </h1>
               <p className="text-zinc-500 text-sm sm:text-base font-medium">
                  Browse and copy-paste cool aesthetic symbols
               </p>
            </motion.div>

            {/* Category Tabs */}
            <div className="flex flex-wrap justify-center gap-3 mb-10 relative z-20 max-w-4xl mx-auto">
               {symbolCategories.map((cat, idx) => (
                  <button
                     key={cat.title}
                     onClick={() => setActiveCategory(idx)}
                     className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        activeCategory === idx
                           ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                           : 'bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
                     }`}>
                     {cat.title}
                  </button>
               ))}
            </div>

            {recentEmojis.length > 0 && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-4xl mx-auto mb-10 bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative z-20">
                  <h2 className="text-sm font-medium mb-4 text-zinc-400 uppercase tracking-wider">
                     Recently Used
                  </h2>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-10 gap-2">
                     {recentEmojis.map((emoji, i) => (
                        <SymbolButton
                           key={i}
                           symbol={emoji}
                           onCopy={handleCopy}
                        />
                     ))}
                  </div>
               </motion.div>
            )}

            {/* Symbol Grid */}
            <div className="max-w-4xl mx-auto p-6 lg:p-8 bg-[#121214] border border-zinc-800/80 rounded-2xl shadow-xl overflow-y-auto customScrollbar h-[70vh] relative z-20">
               <div className="mb-6 border-b border-zinc-800/50 pb-4">
                  <h2 className="text-xl font-medium text-zinc-200">
                     {activeSymbols.title}
                  </h2>
               </div>
               <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-10 gap-2">
                  {activeSymbols.symbols.map((symbol, i) => (
                     <SymbolButton
                        key={`${activeCategory}-${i}`}
                        symbol={symbol}
                        onCopy={handleCopy}
                     />
                  ))}
               </div>
            </div>
         </div>
      </ColumnLines>
   );
}
