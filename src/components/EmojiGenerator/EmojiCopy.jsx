/* eslint-disable react-hooks/exhaustive-deps */
import React, { useMemo, useState, memo, useCallback, useEffect } from 'react';
import emojis from 'emoji-datasource';
import Navbar from '../Navbar';
import SEO from '../SEO';
import { FaBars } from 'react-icons/fa';

import ReactCountryFlag from 'react-country-flag';

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
         onClick={() => onCopy(emoji)} // ✅ FIX HERE
         className="aspect-square flex items-center justify-center text-3xl sm:text-2xl lg:text-4xl 
               bg-white/10 hover:bg-white/25 active:bg-white/35 rounded-2xl 
               transition-all duration-300 ease-out hover:scale-110 hover:rotate-3 
               active:scale-95 shadow-lg hover:shadow-xl hover:shadow-yellow-500/25 
               border border-white/15 min-h-[3rem] sm:min-h-[3rem] lg:min-h-[4rem] relative overflow-hidden group">
         {isFlag && countryCode ? (
            <ReactCountryFlag
               countryCode={countryCode}
               svg
               style={{ width: '1em', height: '1em' }}
            />
         ) : (
            <span className="transition-transform duration-300 group-hover:scale-110">
               {emoji.char}
            </span>
         )}
         <div
            className="absolute inset-0 bg-gradient-to-br from-yellow-400/25 to-transparent 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
         />
      </button>
   );
});

// Toast notification component
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
            <p className="text-sm font-medium">{toast.message}</p>
         </div>
      </div>
   );
};

export default function EmojiCopy() {
   const [selectedTab, setSelectedTab] = useState('All');
   const [searchTerm, setSearchTerm] = useState('');
   const [recentEmojis, setRecentEmojis] = useState([]);
   const [placeholderIndex, setPlaceholderIndex] = useState(0);

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

   // Preprocess emojis once
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
      []
   );

   // Group by category
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
      [groupedEmojis]
   );

   // Updated: Filter by tab AND search term
   const displayedEmojis = useMemo(() => {
      let filtered =
         selectedTab === 'All'
            ? processedEmojis
            : groupedEmojis[selectedTab] || [];

      if (searchTerm.trim()) {
         const lowerSearch = searchTerm.toLowerCase();
         filtered = filtered.filter((emoji) =>
            emoji.name.toLowerCase().includes(lowerSearch)
         );
      }

      return filtered;
   }, [selectedTab, groupedEmojis, processedEmojis, searchTerm]);

   // Determine current section title
   const currentSectionTitle = useMemo(() => {
      if (searchTerm.trim()) return `Search Results for "${searchTerm}"`;
      if (selectedTab === 'All') return 'All Emojis';
      return selectedTab;
   }, [searchTerm, selectedTab]);

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
      async (emojiObj) => {
         try {
            await navigator.clipboard.writeText(emojiObj.char);
            showNotification(
               `Copied ${emojiObj.char} to clipboard!`,
               'success'
            );

            setRecentEmojis((prev) => {
               // Remove duplicates and move the current emoji to the top
               const updated = [
                  emojiObj,
                  ...prev.filter((e) => e.unified !== emojiObj.unified),
               ];

               // Limit the list to only 10 recent emojis
               const limited = updated.slice(0, 10);

               // Save to localStorage
               localStorage.setItem('recentEmojis', JSON.stringify(limited));

               return limited;
            });
         } catch {
            showNotification('Failed to copy 😞', 'error');
         }
      },
      [showNotification]
   );

   // New: Handle search input
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
      <div className="min-h-[100dvh] bg-gradient-to-br from-black via-gray-900 to-black text-white font-sans px-4 py-20 md:px-10 relative overflow-y-auto h-[100dvh] customScrollbar indexwise">
         <SEO
            title="Emoji Mixer & Generator | Combine Emojis | Klique"
            description="Browse, mix, and copy-paste emojis easily. Create unique emoji combinations, search by category or country, and access trending emojis instantly."
            keywords="emoji mixer, emoji generator, copy paste emojis, mix emojis, emoji merger, klique emojis, emojis browser"
            canonicalUrl="https://klique.com/emojigenerator"
            jsonLd={{
               "@context": "https://schema.org",
               "@type": "SoftwareApplication",
               "name": "Emoji Mixer & Generator",
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

         <Toast toast={toast} />

         <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1)_0%,transparent_50%)] animate-pulse"></div>
         </div>

         <h1
            className="text-4xl text-center  sm:text-3xl md:text-5xl  lg:text-6xl  font-bold mb-8 tracking-tight  animate-fade-in-down relative
         ">
            Emoji{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
               Browser
            </span>
         </h1>

         {/* Search Input */}
         <div className="max-w-2xl mx-auto mb-8 relative">
            <div className="relative">
               <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <path
                     d="M21 21l-4.35-4.35"
                     strokeWidth="2"
                     strokeLinecap="round"
                  />
               </svg>
               <input
                  type="text"
                  placeholder={placeholder[placeholderIndex]}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 border border-white/20 
                             backdrop-blur-lg text-white placeholder-white/60 
                             focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50
                             transition-all duration-300 text-base font-medium
                             hover:bg-white/15"
               />
               {searchTerm && (
                  <button
                     onClick={() => setSearchTerm('')}
                     className="absolute right-4 top-1/2 transform -translate-y-1/2 
                                w-6 h-6 flex items-center justify-center
                                text-white/60 hover:text-white hover:bg-white/10 
                                rounded-full transition-all duration-200">
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
               <p className="text-sm text-white/70 mt-3 text-center font-semibold">
                  Found{' '}
                  <span className="font-bold text-yellow-400">
                     {displayedEmojis.length}
                  </span>{' '}
                  emoji{displayedEmojis.length !== 1 ? 's' : ''}
               </p>
            )}
         </div>

         {recentEmojis.length > 0 && (
            <div
               className="max-w-4xl mx-auto mb-10 bg-white/5 border border-white/10 rounded-2xl 
                   backdrop-blur-lg shadow-lg shadow-black/20 p-6 animate-fade-in">
               <h2 className="text-xl font-semibold mb-4 text-white/90">
                  Recently Used
               </h2>
               <div className="flex flex-wrap justify-center gap-3">
                  {recentEmojis.map((emoji, i) => (
                     <EmojiButton key={i} emoji={emoji} onCopy={handleCopy} />
                  ))}
               </div>
            </div>
         )}

         {/* Category Tabs */}
         {!searchTerm && (
            <div className="max-w-4xl mx-auto mb-8">
               <div className="flex flex-wrap justify-center gap-3">
                  {categories
                     .filter((cat) => cat !== 'Flag' && cat !== 'Component')
                     .map((cat) => (
                        <button
                           key={cat}
                           onClick={() => setSelectedTab(cat)}
                           className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ease-out relative overflow-hidden group cursor-pointer min-w-[80px]
                     ${
                        selectedTab === cat
                           ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-lg shadow-yellow-500/25'
                           : 'bg-white/5 hover:bg-white/10 border border-white/15 hover:shadow-md'
                     }`}>
                           <span className="relative z-10">{cat}</span>
                           {selectedTab === cat && (
                              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 -skew-x-12 transform translate-x-[-50%] opacity-0 group-hover:opacity-100 transition-opacity" />
                           )}
                        </button>
                     ))}
               </div>
            </div>
         )}

         <div
            key={`${selectedTab}-${searchTerm}`} // Key includes search for re-render on search
            className="max-w-4xl mx-auto p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-lg 
                      shadow-2xl shadow-black/20 animate-fade-in overflow-y-auto customScrollbar h-[70vh] md:h-[80vh]">
            {/* Section Header */}
            <div className="mb-6 text-center">
               <h2 className="text-2xl md:text-3xl font-bold text-white/90 mb-1">
                  {currentSectionTitle}
               </h2>
               {!searchTerm && selectedTab !== 'All' && (
                  <p className="text-sm text-white/60">
                     {groupedEmojis[selectedTab]?.length || 0} emojis in this
                     category
                  </p>
               )}
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
               {displayedEmojis.length > 0 ? (
                  displayedEmojis.map((emoji, i) => (
                     <EmojiButton key={i} emoji={emoji} onCopy={handleCopy} />
                  ))
               ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-gray-400">
                     <span className="text-8xl mb-6">🔍</span>
                     <p className="text-xl md:text-2xl font-semibold mb-2">
                        No emojis found
                     </p>
                     {searchTerm ? (
                        <p className="text-base">
                           No matches for "{searchTerm}". Try a different term.
                        </p>
                     ) : (
                        <p className="text-base">
                           Switch to another category or search.
                        </p>
                     )}
                  </div>
               )}
            </div>
         </div>

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
            .animate-slideIn {
               animation: slideIn 0.3s ease-out;
            }
            .animate-fade-in-down {
               animation: fade-in-down 0.6s ease-out;
            }
            .animate-fade-in {
               animation: fade-in 0.5s ease-out;
            }
         `}</style>
      </div>
   );
}
