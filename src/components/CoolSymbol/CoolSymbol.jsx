import React, { useState, useCallback, memo, useEffect } from 'react';
import Navbar from '../Navbar';
import SEO from '../SEO';
import { FaBars } from 'react-icons/fa';

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

// 🔸 Toast Component
const Toast = ({ toast }) => {
   if (!toast.visible) return null;
   const isSuccess = toast.type === 'success';

   return (
      <div className="fixed top-6 right-6 z-50 animate-slideIn">
         <div
            className={`px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 border backdrop-blur-md
          ${
             isSuccess
                ? 'bg-green-500/20 border-green-400 text-green-100'
                : 'bg-red-500/20 border-red-400 text-red-100'
          }`}>
            {isSuccess ? (
               <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
               </svg>
            ) : (
               <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
               </svg>
            )}
            <p className="text-sm">{toast.message}</p>
         </div>
      </div>
   );
};

// 🔸 Symbol Button (memoized to avoid unnecessary re-renders)
const SymbolButton = memo(({ symbol, onCopy }) => (
   <button
      onClick={() => onCopy(symbol)}
      className="aspect-square flex items-center justify-center text-3xl sm:text-4xl 
               bg-white/5 hover:bg-white/20 active:bg-white/30 rounded-xl 
               transition-all duration-300 ease-out hover:scale-110 hover:rotate-3 
               active:scale-95 shadow-md hover:shadow-lg hover:shadow-yellow-500/20 
               border border-white/10 relative overflow-hidden group">
      <span className="transition-transform duration-300 group-hover:scale-110">
         {symbol}
      </span>
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
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
      (message, type = 'success', duration = 3000) => {
         setToast({ message, type, visible: true });
         setTimeout(
            () => setToast((prev) => ({ ...prev, visible: false })),
            duration
         );
      },
      []
   );

   const handleCopy = useCallback(
      async (symbol) => {
         try {
            await navigator.clipboard.writeText(symbol);
            showNotification(`Copied "${symbol}" to clipboard!`, 'success');

            setRecentEmojis((prev) => {
               // Remove duplicates and move the current emoji to the top
               const updated = [
                  symbol,
                  ...prev.filter((e) => e.unified !== symbol),
               ];

               // Limit the list to only 10 recent emojis
               const limited = updated.slice(0, 10);

               // Save to localStorage
               localStorage.setItem('recentSymbol', JSON.stringify(limited));

               return limited;
            });
         } catch {
            showNotification('Failed to copy 😞', 'error');
         }
      },
      [showNotification]
   );

   const activeSymbols = symbolCategories[activeCategory];

   return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-black via-gray-900 to-black text-white font-sans px-4 py-20 md:px-10 relative overflow-auto h-[100dvh] customScrollbar">
         <SEO
            title="Cool Symbols Copy & Paste | Fancy Text Symbols | Klique"
            description="Browse and copy-paste cool symbols, aesthetic characters, hearts, stars, arrows, and mathematical symbols for your social media bios and gaming handles."
            keywords="symbols copy paste, cool symbols, text symbols, aesthetic symbols, star symbol, heart symbol, klique symbols, aesthetic letters"
            canonicalUrl="https://klique.com/symbol"
            jsonLd={{
               "@context": "https://schema.org",
               "@type": "SoftwareApplication",
               "name": "Cool Symbol Browser",
               "operatingSystem": "All",
               "applicationCategory": "UtilitiesApplication",
               "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
               }
            }}
         />
         <div
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="fixed top-6 left-6 z-50 p-3 rounded-2xl 
                                      bg-white/10 backdrop-blur-xl border border-white/20
                                      hover:bg-white/20 hover:scale-105
                                      active:scale-95
                                      transition-all duration-300 
                                      shadow-lg shadow-black/20 cursor-pointer">
            <FaBars size={20} className="text-white" />
         </div>

         <Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMobile={isMobile}
         />

         {/* Toast */}
         <Toast toast={toast} />

         {/* Background animation */}
         <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1)_0%,transparent_50%)] animate-pulse" />
         </div>

         {/* Header */}
         <h1
            className="text-4xl text-center  sm:text-3xl md:text-5xl  lg:text-6xl  font-bold mb-8 tracking-tight  animate-fade-in-down relative
         ">
            Symbol{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
               Browser
            </span>
         </h1>

         {/* Category Tabs */}
         <div className="flex flex-wrap justify-center gap-3 mb-8 relative z-10">
            {symbolCategories.map((cat, idx) => (
               <button
                  key={cat.title}
                  onClick={() => setActiveCategory(idx)}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ease-out 
              relative overflow-hidden group cursor-pointer
              ${
                 activeCategory === idx
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}>
                  <span className="relative z-10 text-sm">{cat.title}</span>
               </button>
            ))}
         </div>

         {recentEmojis.length > 0 && (
            <div
               className="max-w-4xl mx-auto mb-10 bg-white/5 border border-white/10 rounded-2xl 
                   backdrop-blur-lg shadow-lg shadow-black/20 p-6 animate-fade-in">
               <h2 className="text-xl font-semibold mb-4 text-white/90">
                  Recently Used
               </h2>
               <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-10 gap-1.5">
                  {recentEmojis.map((emoji, i) => (
                     <SymbolButton key={i} symbol={emoji} onCopy={handleCopy} />
                  ))}
               </div>
            </div>
         )}

         {/* Symbol Grid */}
         <div
            className="max-w-4xl mx-auto p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg 
                      shadow-2xl shadow-black/20 animate-fade-in overflow-y-auto customScrollbar h-[75vh]">
            <h2 className="text-2xl font-semibold mb-6 text-yellow-400">
               {activeSymbols.title}
            </h2>
            <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-10 gap-1.5">
               {activeSymbols.symbols.map((symbol, i) => (
                  <SymbolButton key={i} symbol={symbol} onCopy={handleCopy} />
               ))}
            </div>
         </div>

         {/* Animations & Scrollbar */}
         <style>{`
            @keyframes fade-in-down {
               from {
                  opacity: 0;
                  transform: translateY(-20px);
               }
               to {
                  opacity: 1;
                  transform: translateY(0);
               }
            }
            @keyframes fade-in {
               from {
                  opacity: 0;
                  transform: scale(0.95);
               }
               to {
                  opacity: 1;
                  transform: scale(1);
               }
            }
            @keyframes slideIn {
               from {
                  transform: translateX(100%);
                  opacity: 0;
               }
               to {
                  transform: translateX(0);
                  opacity: 1;
               }
            }
            .animate-fade-in-down {
               animation: fade-in-down 0.6s ease-out;
            }
            .animate-fade-in {
               animation: fade-in 0.5s ease-out;
            }
            .animate-slideIn {
               animation: slideIn 0.3s ease-out;
            }
         `}</style>
      </div>
   );
}
