/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../Navbar';
import SEO from '../SEO';
import fontMaps from './text';
import { FaBars } from 'react-icons/fa';
import {
   ArrowLeft,
   ArrowRight,
   Copy,
   Download,
   Heart,
   Search,
} from 'lucide-react';
import { BsHeartFill } from 'react-icons/bs';

const Toast = ({ toast }) => {
   if (!toast.visible) return null;

   return (
      <div className="fixed top-6 right-6 z-50 animate-slideIn">
         <div
            className={`px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 border backdrop-blur-md
        ${
           toast.type === 'success'
              ? 'bg-green-500/20 border-green-400 text-green-100'
              : 'bg-red-500/20 border-red-400 text-red-100'
        }`}>
            <p>{toast.message}</p>
         </div>
      </div>
   );
};

const FancyFontGenerator = () => {
   const [inputText, setInputText] = useState('');
   const [outputText, setOutputText] = useState('');
   const [favorites, setFavorites] = useState([]);
   const [favoriteOnly, setFavoriteOnly] = useState(false);
   const [search, setSearch] = useState('');
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [characters, setCharacters] = useState(0);
   const [toast, setToast] = useState({
      message: '',
      type: 'success',
      visible: false,
   });
   const [selectedFont, setSelectedFont] = useState(null);

   const showToast = (msg, type = 'success') => {
      setToast({ message: msg, type, visible: true });
      setTimeout(() => setToast((p) => ({ ...p, visible: false })), 1800);
   };

   const normalLower = 'abcdefghijklmnopqrstuvwxyz'.split('');
   const normalUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
   const normalDigits = '0123456789'.split('');

   const convertUsingFont = (text, font) => {
      return text
         .split('')
         .map((char) => {
            if (normalLower.includes(char))
               return font.fontLower[normalLower.indexOf(char)] || char;
            if (normalUpper.includes(char))
               return font.fontUpper[normalUpper.indexOf(char)] || char;
            if (normalDigits.includes(char))
               return font.fontDigits[normalDigits.indexOf(char)] || char;
            return char;
         })
         .join('');
   };

   // -------------------------
   // TRANSFORMATION LIST (unique, deduped, stable)
   // -------------------------
   const transformations = useMemo(() => {
      const mapItems = fontMaps.map((font, index) => ({
         id: `font-${index}`,
         name: font.fontName,
         icon: font.fontLower[1] || '✦',
         category: font.category,
         apply: (text) => convertUsingFont(text, font),
      }));

      const extras = [
         {
            id: 'underline',
            name: 'Underline',
            icon: 'U̲',
            category: 'Underline',
            apply: (txt) =>
               txt
                  .split('')
                  .map((c) => (/\s/.test(c) ? c : c + '\u0332'))
                  .join(''),
         },
         {
            id: 'strike',
            name: 'Strikethrough',
            icon: 'S̶',
            category: 'Strikethrough',
            apply: (txt) =>
               txt
                  .split('')
                  .map((c) => (/\s/.test(c) ? c : c + '\u0336'))
                  .join(''),
         },
      ];

      // 🔥 Deduplicate by ID + Name to avoid duplicates after sorting + search
      const unique = new Map();
      [...mapItems, ...extras].forEach((item) =>
         unique.set(item.name.toLowerCase(), item)
      );

      return [...unique.values()];
   }, []);

   // -------------------------
   // FAVORITES + SEARCH + FILTER
   // -------------------------
   const filteredTransformations = useMemo(() => {
      let list = [...transformations];

      // sort favorites first
      list.sort((a, b) => {
         const fa = favorites.includes(a.id);
         const fb = favorites.includes(b.id);
         return fa === fb ? 0 : fa ? -1 : 1;
      });

      // favorite-only mode
      if (favoriteOnly) {
         list = list.filter((t) => favorites.includes(t.id));
      }

      // search filter
      if (search.trim() !== '') {
         const s = search.toLowerCase();
         list = list.filter((t) => t.name.toLowerCase().includes(s));
      }

      return list;
   }, [transformations, favorites, favoriteOnly, search]);

   const toggleFavorite = (id) => {
      setFavorites((prev) =>
         prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      );
   };

   const downloadTxt = () => {
      if (!outputText) return showToast('Nothing to download!', 'error');

      const blob = new Blob([outputText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'styled-text.txt';
      link.click();

      URL.revokeObjectURL(url);
      showToast('Downloaded!');
   };

   useEffect(() => {
      if (selectedFont) {
         const selected = transformations.find((t) => t.id === selectedFont);
         if (selected) {
            setOutputText(selected.apply(inputText));
         }
      }
   }, [inputText, selectedFont, transformations]);

   useEffect(() => {
      calculateStats(inputText);
   }, [inputText]);

   const calculateStats = (content) => {
      // const charCount = content.length;
      const charNoSpaces = content.replace(/\s/g, '').length;
      setCharacters(charNoSpaces);
   };

   return (
      <div className="dark min-h-screen bg-[#050505] text-slate-200 relative overflow-hidden font-sans">
         <SEO
            title="Fancy Font Generator | Aesthetic Text Fonts Changer | Klique"
            description="Convert your normal text into cool, stylish, and aesthetic fancy text formats. Copy and paste stylish fonts directly to Instagram, Twitter, and TikTok."
            keywords="font generator, fancy text generator, cool fonts, aesthetic text changer, instagram fonts, klique font generator, custom fonts copy and paste"
            canonicalUrl="https://klique.com/fontgenerator"
            jsonLd={{
               "@context": "https://schema.org",
               "@type": "SoftwareApplication",
               "name": "Fancy Font Generator",
               "operatingSystem": "All",
               "applicationCategory": "UtilitiesApplication",
               "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
               }
            }}
         />
         {/* ambient glow */}
         <div className="pointer-events-none absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-[#a78bfa]/10 blur-[180px] rounded-full opacity-40" />
         <div className="pointer-events-none absolute bottom-[-25%] right-[-15%] w-[60%] h-[60%] bg-[#f472b6]/10 blur-[180px] rounded-full opacity-40" />

         <div className="relative z-10 py-16 px-4 flex flex-col items-center">
            {/* Sidebar Toggle */}
            <div
               onClick={() => setSidebarOpen((p) => !p)}
               className="fixed top-6 left-6 z-50 p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 cursor-pointer hover:bg-white/20 transition">
               <FaBars size={20} className="text-white" />
            </div>

            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <Toast toast={toast} />

            {/* HEADER */}
            <div className="text-center mb-20">
               <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
                  Fancy <span className="gradient-text">Font Generator</span>
               </h1>

               <p className="text-slate-400 mt-6 max-w-xl mx-auto leading-relaxed">
                  Transform your text into stylish aesthetics for social media.
                  <br />
                  Dark mode optimized for late-night creativity.
               </p>
            </div>

            {/* INPUT + OUTPUT (side-by-side) */}
            <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6 items-center justify-center mb-10">
               {/* INPUT */}
               <div className="relative glass inner-shadow bg-[#141416] border-3 border-white/10 rounded-[2rem] shadow-2xl p-6 w-full hover:shadow-glow focus:ring-0 group-focus-within:border-primary/50 group-focus-within:shadow-glow">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                     Input Text
                  </label>

                  <textarea
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                     placeholder="Type something amazing..."
                     className="custom-scrollbar w-full h-64 bg-transparent border-none resize-none focus:ring-0 text-xl text-slate-100 placeholder:text-slate-600 leading-relaxed focus:border-0"
                     style={{ outline: 0 }}
                  />

                  <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex justify-between gap-3 absolute bottom-0 w-full left-0">
                     <p className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Ready To Convert
                     </p>
                     <p className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 transition-all active:scale-95 shadow-glass">
                        <span className="text-sm">{characters}</span> chars
                     </p>
                  </div>
               </div>

               {/* ARROW */}
               {/* <div className="hidden md:block text-2xl font-bold">➜</div> */}
               <div className="hidden md:flex items-center">
                  <div className="w-12 h-12 rounded-full bg-[#0f0f11] border-3 border-white/10 flex items-center justify-center shadow-xl">
                     <ArrowRight className="text-primary" />
                  </div>
               </div>

               {/* OUTPUT */}
               <div className="relative glass inner-shadow bg-[#141416] border-3 border-white/10 rounded-[2rem] shadow-2xl p-6 w-full">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                     Live Preview
                  </label>

                  <textarea
                     value={outputText}
                     readOnly
                     placeholder="Your fancy text appears here..."
                     className="custom-scrollbar w-full h-64 bg-transparent border-none resize-none focus:ring-0 text-xl text-slate-100 placeholder:text-slate-600 leading-relaxed"
                     style={{ outline: 0 }}
                  />

                  <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex justify-end gap-3 absolute bottom-0 w-full left-0">
                     <button
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 shadow-glass text-xs font-bold text-slate-400 uppercase tracking-wider"
                        onClick={() => {
                           navigator.clipboard.writeText(outputText);
                           outputText.length > 0
                              ? showToast('Copied!')
                              : showToast('Nothing to copy!', 'error');
                        }}>
                        <Copy size={16} />
                        Copy
                     </button>
                     <button
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 shadow-glass text-xs font-bold text-slate-400 uppercase tracking-wider"
                        onClick={downloadTxt}>
                        <Download size={16} />
                        Text
                     </button>
                  </div>
               </div>
            </div>

            {/* SEARCH + FAVORITE ONLY + CLEAR */}
            <div className="min-w-5xl flex justify-between items-center gap-4 py-2">
               <div className="relative w-full md:w-96 group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                     <Search className="text-slate-500 text-xl" />
                  </span>

                  <input
                     type="text"
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     className="pl-12 pr-4 py-3.5 w-full bg-[#141416] border border-[#2a2a2a]
               rounded-3xl focus:ring-2 focus:ring-pink-500/40
               focus:border-pink-500/40 placeholder:text-slate-600
               shadow-lg transition-all text-sm font-semibold
               text-slate-300 tracking-wider"
                     placeholder="Search styles (e.g., Bold, Cursive)..."
                  />
               </div>

               <div class="flex gap-3 w-full md:w-auto">
                  <button
                     className={`flex-1 md:flex-none px-6 py-3.5 bg-card border border-border-subtle rounded-4xl hover:bg-white/5 transition-all shadow-lg flex items-center justify-center gap-2 hover:border-border-highlight text-xs font-bold text-slate-400 uppercase tracking-wider ${
                        favoriteOnly
                           ? 'bg-pink-500/80 border-pink-400'
                           : 'bg-white/10 border-white/20'
                     }`}
                     onClick={() => setFavoriteOnly((p) => !p)}>
                     {favoriteOnly ? 'Favorites Only' : 'All Styles'}
                  </button>
                  <button
                     class="px-6 py-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-4xl text-sm font-semibold transition-all flex items-center gap-2 hover:border-red-500/40"
                     onClick={() => {
                        setInputText('');
                        setOutputText('');
                     }}>
                     Clear All
                  </button>
               </div>
            </div>

            {/* TRANSFORMATIONS */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
               {filteredTransformations.map((item) => {
                  const isFavorite = favorites.includes(item.id);
                  const isSelected = selectedFont === item.id;
                  const samplePreview = item.apply('Font');

                  return (
                     <div
                        key={item.id}
                        className={`
          group relative overflow-hidden
          bg-[#1a1a1a] rounded-3xl p-6
          border-2 border-[#2a2a2a]
          transition-[border-color,background-color] duration-300 cursor-pointer
          hover:border-pink-500/50
          ${isSelected ? 'border-pink-500/50 bg-[#1f1f1f] border-2' : ''}
        `}>
                        {/* TOP SECTION: ICON + TITLE + DESCRIPTION */}
                        <div
                           onClick={() => {
                              if (selectedFont === item.id) {
                                 setSelectedFont(null);
                                 setOutputText('');
                              } else {
                                 setSelectedFont(item.id);
                                 setOutputText(item.apply(inputText));
                              }
                           }}
                           className="flex flex-col gap-4 relative z-10">
                           {/* Icon and Title */}
                           <div className="flex items-center gap-4">
                              <div
                                 className={`w-7 h-7 rounded-2xl flex items-center justify-center text-2xl gradient-text border`}>
                                 {item.icon}
                              </div>
                              <div className="flex flex-col">
                                 <h3 className="text-lg font-bold gradient-text">
                                    {item.name}
                                 </h3>
                                 <p className="text-sm text-gray-400">
                                    {item.description}
                                 </p>
                              </div>
                           </div>

                           {/* SAMPLE FONT PREVIEW */}
                           <div className="bg-black/40 rounded-2xl p-4 border border-[#2a2a2a]">
                              <div className="text-2xl font-medium text-white tracking-wide">
                                 {samplePreview}
                              </div>
                           </div>

                           {/* CATEGORY TAGS */}
                           <div className="flex gap-2 flex-wrap">
                              {item.category.split(' ').map((cat, idx) => (
                                 <span
                                    key={idx}
                                    className="px-3 py-1 bg-[#2a2a2a] text-gray-400 text-[11px] font-medium rounded-lg uppercase tracking-wider">
                                    {cat.trim()}
                                 </span>
                              ))}
                           </div>
                        </div>

                        {/* FAVORITE BUTTON - TOP RIGHT */}
                        <button
                           onClick={() => toggleFavorite(item.id)}
                           className="absolute top-6 right-6 z-20 p-2 rounded-full hover:bg-white/15 active:scale-95 transition-all duration-200 group/btn">
                           {isFavorite ? (
                              <BsHeartFill className="text-red-500 text-xl animate-pulse" />
                           ) : (
                              <Heart
                                 className="text-gray-400 group-hover/btn:text-red-400 group-hover:text-white transition-colors"
                                 size={20}
                              />
                           )}
                        </button>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
   );
};

export default FancyFontGenerator;
