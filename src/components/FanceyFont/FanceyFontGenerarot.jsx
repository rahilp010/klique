/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../Navbar';
import SEO from '../SEO';
import fontMaps from './text';
import { FaBars } from 'react-icons/fa';
import { ArrowRight, Copy, Download, Heart, Search } from 'lucide-react';
import { BsHeartFill } from 'react-icons/bs';
import { ColumnLines } from '@/components/ui/download-with-columnlines-utils/columnlines';
import { Input } from '@/components/ui/CustomControl';
import { motion, AnimatePresence } from 'motion/react';

const Toast = ({ toast }) => {
   if (!toast.visible) return null;

   return (
      <div className="fixed top-6 right-6 z-50 animate-slideIn">
         <div
            className={`px-6 py-3 rounded-xl shadow-sm flex items-center gap-2 border bg-white dark:bg-zinc-900
        ${
           toast.type === 'success'
              ? 'border-green-500 text-green-700 dark:text-green-400'
              : 'border-red-500 text-red-700 dark:text-red-400'
        }`}>
            <p className="text-sm font-medium">{toast.message}</p>
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

      const unique = new Map();
      [...mapItems, ...extras].forEach((item) =>
         unique.set(item.name.toLowerCase(), item),
      );

      return [...unique.values()];
   }, []);

   const filteredTransformations = useMemo(() => {
      let list = [...transformations];

      list.sort((a, b) => {
         const fa = favorites.includes(a.id);
         const fb = favorites.includes(b.id);
         return fa === fb ? 0 : fa ? -1 : 1;
      });

      if (favoriteOnly) {
         list = list.filter((t) => favorites.includes(t.id));
      }

      if (search.trim() !== '') {
         const s = search.toLowerCase();
         list = list.filter((t) => t.name.toLowerCase().includes(s));
      }

      return list;
   }, [transformations, favorites, favoriteOnly, search]);

   const toggleFavorite = (id) => {
      setFavorites((prev) =>
         prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
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
      const charNoSpaces = content.replace(/\s/g, '').length;
      setCharacters(charNoSpaces);
   };

   return (
      <ColumnLines
         columnWidth={80}
         columnCount={34}
         radialFadeStart={15}
         radialFadeEnd={90}
         className="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 customScrollbar overflow-x-hidden overflow-y-auto text-zinc-900 dark:text-zinc-100 font-sans">
         <SEO
            title="Fancy Font Generator | Aesthetic Text Fonts Changer | Klique"
            description="Convert your normal text into cool, stylish, and aesthetic fancy text formats. Copy and paste stylish fonts directly to Instagram, Twitter, and TikTok."
            keywords="font generator, fancy text generator, cool fonts, aesthetic text changer, instagram fonts, klique font generator, custom fonts copy and paste"
            canonicalUrl="https://klique.netlify.app/fontgenerator"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'SoftwareApplication',
               name: 'Fancy Font Generator',
               operatingSystem: 'All',
               applicationCategory: 'UtilitiesApplication',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
            }}
         />

         <div className="relative z-10 py-16 px-4 flex flex-col items-center">
            {/* Sidebar Toggle */}

            <div className="w-full sticky top-0 z-30 bg-[#16161b]  transition-all duration-300">
               <Navbar />
            </div>

            <Toast toast={toast} />

            {/* HEADER */}

            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center mb-10">
               <h1 className="text-3xl sm:text-4xl font-medium text-zinc-100 tracking-tight mb-3">
                  Fancy Font Generator
               </h1>
               <p className="text-zinc-500 text-sm sm:text-base font-medium">
                  Transform your text into stylish aesthetics for social media.
                  <br />
                  Operate swiftly with precise accuracy.
               </p>
            </motion.div>

            {/* INPUT + OUTPUT */}
            <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6 items-center justify-center mb-10">
               {/* INPUT */}
               <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm p-6 w-full focus-within:ring-2 focus-within:ring-zinc-900 dark:focus-within:ring-zinc-100 transition-all">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
                     Input Text
                  </label>

                  <textarea
                     value={inputText}
                     onChange={(e) => setInputText(e.target.value)}
                     placeholder="Type something amazing..."
                     className="custom-scrollbar w-full h-64 bg-transparent border-none resize-none focus:ring-0 text-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 leading-relaxed outline-none"
                  />

                  <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center gap-3 absolute bottom-0 w-full left-0 rounded-b-3xl">
                     <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        Ready To Convert
                     </p>
                     <p className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                        <span className="text-sm mr-1">{characters}</span> chars
                     </p>
                  </div>
               </div>

               {/* ARROW */}
               <div className="hidden md:flex items-center">
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm text-zinc-900 dark:text-zinc-100">
                     <ArrowRight size={20} />
                  </div>
               </div>

               {/* OUTPUT */}
               <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm p-6 w-full">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
                     Live Preview
                  </label>

                  <textarea
                     value={outputText}
                     readOnly
                     placeholder="Your fancy text appears here..."
                     className="custom-scrollbar w-full h-64 bg-transparent border-none resize-none focus:ring-0 text-xl text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 leading-relaxed outline-none"
                  />

                  <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3 absolute bottom-0 w-full left-0 rounded-b-3xl">
                     <button
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
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
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider"
                        onClick={downloadTxt}>
                        <Download size={16} />
                        Text
                     </button>
                  </div>
               </div>
            </div>

            {/* SEARCH + FILTER */}
            <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center gap-4 py-2 mt-4">
               <div className="relative w-full md:w-96 group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors">
                     <Search className="text-zinc-400 text-xl" size={18} />
                  </span>

                  <Input
                     type="text"
                     value={search}
                     onChange={(val) => setSearch(val)}
                     className="pl-12 pr-4 py-3 w-full bg-[#16161b] border border-white/10 rounded-2xl placeholder:text-zinc-500 text-sm font-semibold text-white tracking-wider"
                     placeholder="Search styles (e.g., Bold, Cursive)..."
                  />
               </div>

               <div className="flex gap-3 w-full md:w-auto">
                  <button
                     className={`flex-1 md:flex-none px-6 py-3 rounded-2xl border transition-all text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 ${
                        favoriteOnly
                           ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                           : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                     }`}
                     onClick={() => setFavoriteOnly((p) => !p)}>
                     {favoriteOnly ? 'Favorites Only' : 'All Styles'}
                  </button>
                  <button
                     className="px-6 py-3 bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 border border-zinc-200 dark:border-zinc-800 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:border-red-900 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm"
                     onClick={() => {
                        setInputText('');
                        setOutputText('');
                     }}>
                     Clear All
                  </button>
               </div>
            </div>

            {/* TRANSFORMATIONS */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
               {filteredTransformations.map((item) => {
                  const isFavorite = favorites.includes(item.id);
                  const isSelected = selectedFont === item.id;
                  const samplePreview = item.apply('Font');

                  return (
                     <div
                        key={item.id}
                        className={`
                        group relative overflow-hidden
                        bg-white dark:bg-zinc-900 rounded-3xl p-6
                        border-2 transition-all duration-200 cursor-pointer shadow-sm
                        hover:border-zinc-300 dark:hover:border-zinc-700
                        ${isSelected ? 'border-zinc-900 dark:border-zinc-100' : 'border-zinc-200 dark:border-zinc-800'}
                        `}>
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
                              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-lg font-medium text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
                                 {item.icon}
                              </div>
                              <div className="flex flex-col">
                                 <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                    {item.name}
                                 </h3>
                                 <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    {item.description}
                                 </p>
                              </div>
                           </div>

                           {/* SAMPLE FONT PREVIEW */}
                           <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 mt-2">
                              <div className="text-2xl font-medium text-zinc-900 dark:text-zinc-100 tracking-wide">
                                 {samplePreview}
                              </div>
                           </div>

                           {/* CATEGORY TAGS */}
                           <div className="flex gap-2 flex-wrap mt-1">
                              {item.category.split(' ').map((cat, idx) => (
                                 <span
                                    key={idx}
                                    className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-semibold rounded-lg uppercase tracking-wider border border-zinc-200 dark:border-zinc-700">
                                    {cat.trim()}
                                 </span>
                              ))}
                           </div>
                        </div>

                        {/* FAVORITE BUTTON */}
                        <button
                           onClick={() => toggleFavorite(item.id)}
                           className="absolute top-6 right-6 z-20 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition-all duration-200 group/btn border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                           {isFavorite ? (
                              <BsHeartFill className="text-red-500 text-xl" />
                           ) : (
                              <Heart
                                 className="text-zinc-400 group-hover/btn:text-red-500 transition-colors"
                                 size={20}
                              />
                           )}
                        </button>
                     </div>
                  );
               })}
            </div>
         </div>
      </ColumnLines>
   );
};

export default FancyFontGenerator;
