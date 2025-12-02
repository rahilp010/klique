/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '../Navbar';
import fontMaps from './text';
import { FaBars } from 'react-icons/fa';
import { Copy, Download, Heart } from 'lucide-react';
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
         apply: (text) => convertUsingFont(text, font),
      }));

      const extras = [
         {
            id: 'underline',
            name: 'Underline',
            icon: 'U̲',
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

   return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white py-16 px-4 flex flex-col items-center">
         {/* Sidebar Toggle */}
         <div
            onClick={() => setSidebarOpen((p) => !p)}
            className="fixed top-6 left-6 z-50 p-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 cursor-pointer hover:bg-white/20 transition">
            <FaBars size={20} className="text-white" />
         </div>

         <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

         <Toast toast={toast} />

         {/* HEADER */}
         <div className="text-center mb-10">
            <h1 className="text-5xl font-bold">
               Fancy{' '}
               <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                  Font Generator
               </span>
            </h1>
            <p className="text-gray-400 mt-2">
               Input → Choose Style → Output Updates Instantly
            </p>
         </div>

         {/* INPUT + OUTPUT (side-by-side) */}
         <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6 items-center justify-center mb-10">
            {/* INPUT */}
            <div className="w-full md:w-1/2 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-xl">
               <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type text here..."
                  className="w-full h-40 bg-black/40 p-4 rounded-2xl border border-gray-700 resize-none text-white text-lg"
               />
            </div>

            {/* ARROW */}
            <div className="hidden md:block text-2xl font-bold">➜</div>

            {/* OUTPUT */}
            <div className="w-full md:w-1/2 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-xl shadow-xl relative">
               <div className="flex justify-between items-center mb-2 absolute right-8 bottom-7">
                  <div className="flex gap-2">
                     <button
                        onClick={() => {
                           navigator.clipboard.writeText(outputText);
                           showToast('Copied!');
                        }}
                        className="px-3 py-2 bg-white/10 rounded-xl hover:bg-white/20">
                        <Copy size={15} />
                     </button>

                     <button
                        onClick={downloadTxt}
                        className="px-3 py-2 bg-white/10 rounded-xl hover:bg-white/20">
                        <Download size={15} />
                     </button>
                  </div>
               </div>

               <textarea
                  value={outputText}
                  readOnly
                  className="w-full h-40 bg-black/40 p-4 rounded-2xl border border-gray-700 text-white resize-none text-lg"
               />
            </div>
         </div>

         {/* SEARCH + FAVORITE ONLY + CLEAR */}
         <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <input
               type="text"
               placeholder="Search styles..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl w-72"
            />

            <button
               onClick={() => setFavoriteOnly((p) => !p)}
               className={`px-4 py-2 rounded-xl border transition ${
                  favoriteOnly
                     ? 'bg-pink-500/80 border-pink-400'
                     : 'bg-white/10 border-white/20'
               }`}>
               {favoriteOnly ? 'Favorites Only' : 'All Styles'}
            </button>

            <button
               onClick={() => {
                  setInputText('');
                  setOutputText('');
               }}
               className="px-4 py-2 bg-red-500/80 hover:bg-red-600 rounded-xl">
               Clear All
            </button>
         </div>

         {/* TRANSFORMATIONS */}
         <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTransformations.map((item) => {
               const isFavorite = favorites.includes(item.id);
               const isSelected = selectedFont === item.id;
               const samplePreview = item.apply('Font');

               return (
                  <div
                     key={item.id}
                     className={`
          group relative overflow-hidden
          bg-gradient-to-br from-white/10 to-white/5 
          border rounded-2xl p-6 shadow-xl backdrop-blur-2xl
          flex justify-between items-center gap-4 
          transition-all duration-500 cursor-pointer
          hover:shadow-2xl hover:scale-[1.02] hover:from-white/15 hover:to-white/8
          ${
             isSelected
                ? 'border-indigo-400/60 border-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/10 shadow-indigo-500/20 scale-[1.02]'
                : 'border-white/10 hover:border-white/30'
          }
        `}>
                     {/* Animated gradient overlay on hover */}
                     <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-x-full group-hover:translate-x-full transform"
                        style={{ transition: 'transform 1.5s ease' }}
                     />

                     {/* LEFT SIDE: TITLE + SAMPLE PREVIEW */}
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
                        className="flex flex-col gap-3 w-full relative z-10">
                        {/* NAME + ICON */}
                        <div className="flex items-center gap-3">
                           <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent text-2xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                              {item.icon}
                           </span>
                           <span className="text-lg font-medium bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent group-hover:text-white transition-colors">
                              {item.name}
                           </span>
                        </div>

                        {/* SAMPLE FONT PREVIEW */}
                        <div
                           className={`
               text-lg font-medium
              p-4
              transition-all duration-300
             group-hover:border-white/20 border-b-2
              ${isSelected ? 'border-indigo-300/40 ' : 'border-white/10'}
            `}
                           style={{
                              fontSize: '1.30rem',
                              letterSpacing: '0.02em',
                           }}>
                           {samplePreview}
                        </div>
                     </div>

                     {/* FAVORITE BUTTON */}
                     <button
                        onClick={() => toggleFavorite(item.id)}
                        className="relative z-10 p-3 rounded-full hover:bg-white/15 active:scale-95 transition-all duration-200 group/btn">
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
   );
};

export default FancyFontGenerator;
