/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Copy, Heart, Menu, X } from 'lucide-react';
import Navbar from '../Navbar';
import fontMaps from './text';
import { FaBars } from 'react-icons/fa';

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
            <p className="text-sm">{toast.message}</p>
         </div>
      </div>
   );
};

const FancyFontGenerator = () => {
   const [inputText, setInputText] = useState('');
   const [includeEmojis, setIncludeEmojis] = useState(false);
   const [copiedIndex, setCopiedIndex] = useState(null);
   const [favorites, setFavorites] = useState([]);
   const [toast, setToast] = useState({
      message: '',
      type: 'success',
      visible: false,
   });

   const normalLower = 'abcdefghijklmnopqrstuvwxyz'.split('');
   const normalUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
   const normalDigits = '0123456789'.split('');

   // Convert text with a font map entry
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
      const dynamicFontItems = fontMaps.map((font) => ({
         name: font.fontName,
         icon: font.fontLower[1] || '✦',
         transform: (text) => convertUsingFont(text, font),
      }));

      return [
         ...dynamicFontItems,
         {
            name: 'Underline',
            icon: 'U̲',
            transform: (text) =>
               text
                  .split('')
                  .map((c) => (/[\s]/.test(c) ? c : c + '\u0332'))
                  .join(''),
            previewStyle: { textDecoration: 'underline' },
         },
         {
            name: 'Strikethrough',
            icon: 'S̶',
            transform: (text) =>
               text
                  .split('')
                  .map((c) => (/[\s]/.test(c) ? c : c + '\u0336'))
                  .join(''),
            previewStyle: { textDecoration: 'line-through' },
         },
      ];
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

   /** 🔹 Copy Handler */
   const handleCopy = useCallback((text, index) => {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      showNotification('Copied to clipboard!', 'success', 2000);
   }, []);

   /** 🔹 Favorite Handler */
   const handleFavorite = useCallback((name) => {
      setFavorites((prev) =>
         prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
      );
   }, []);

   /** 🔹 Emoji Add Helper */
   const applyEmojis = useCallback(
      (text) => (includeEmojis ? `${text} ✨🌈🔥` : text),
      [includeEmojis]
   );

   /** 🔹 Transform Generator */
   const getTransform = useCallback((item, text) => {
      if (item.transform) return item.transform(text);
      if (item.mapKey && fontMaps[item.mapKey]) {
         return text
            .split('')
            .map((c) => fontMaps[item.mapKey][c] || c)
            .join('');
      }
      return text;
   }, []);

   /** 🔹 Sort favorites first */
   const sortedTransformations = useMemo(() => {
      return [...transformations].sort((a, b) => {
         const aFav = favorites.includes(a.name);
         const bFav = favorites.includes(b.name);
         return aFav === bFav ? 0 : aFav ? -1 : 1;
      });
   }, [favorites, transformations]);

   /** 🔹 Sidebar logic */
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [isMobile, setIsMobile] = useState(false);

   useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
   }, []);

   /** Toggle sidebar manually */
   const toggleSidebar = () => setSidebarOpen((prev) => !prev);

   return (
      <div className="relative max-h-[100dvh] flex flex-col items-center py-16 px-4 bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-y-auto customScrollbar">
         {/* 🔹 Always visible hamburger button */}
         <div
            onClick={toggleSidebar}
            className="fixed top-6 left-6 z-50 p-3 rounded-2xl 
                     bg-white/10 backdrop-blur-xl border border-white/20
                     hover:bg-white/20 hover:scale-105
                     active:scale-95 transition-all duration-300 
                     shadow-lg shadow-black/20 cursor-pointer">
            <FaBars size={20} className="text-white" />
         </div>

         {/* Navbar */}
         <Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMobile={isMobile}
         />

         <Toast toast={toast} />

         {/* Header */}
         <div className="text-center mb-12 mt-10">
            <h1 className="text-5xl sm:text-3xl md:text-5xl font-bold mb-4">
               Fancy{' '}
               <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                  Font Generator
               </span>
            </h1>
            <p className="text-gray-400 text-lg">
               Create stylish text instantly — clean & minimal.
            </p>
         </div>

         {/* Input Box */}
         <div className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-3xl p-8 mb-10 shadow-2xl backdrop-blur-xl">
            <textarea
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               placeholder="Type or paste your text here..."
               className="w-full p-5 bg-black/50 border border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-500 resize-none text-white text-lg placeholder-gray-500"
               rows="4"
            />
            <div className="flex items-center justify-between mt-5">
             
               {inputText && (
                  <button
                     onClick={() => setInputText('')}
                     className="text-white font-bold bg-red-500 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-white/10 transition">
                     Clear
                  </button>
               )}
            </div>
         </div>

         {/* Transformations (Cleaner UI) */}
         <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-5">
            {sortedTransformations.map(
               ({ name, icon, mapKey, transform, previewStyle }, index) => {
                  const copyText = applyEmojis(
                     getTransform({ mapKey, transform }, inputText || name)
                  );
                  const isCopied = copiedIndex === index;
                  const isFav = favorites.includes(name);

                  return (
                     <div
                        key={name}
                        className="bg-gradient-to-br from-white/5 to-transparent border border-white/10
                     rounded-3xl p-6 flex flex-col justify-between shadow-lg 
                     hover:shadow-xl hover:border-white/20 transition-all duration-300
                     backdrop-blur-xl group">
                        {/* Header: Icon + Title */}
                        <div className="flex justify-between items-center mb-3">
                           <div className="flex items-center gap-3">
                              <span className="text-2xl text-gray-400">
                                 {icon}
                              </span>
                              <span className="text-sm tracking-wide text-gray-300 font-medium">
                                 {name}
                              </span>
                           </div>

                           {/* Favorite button */}
                           <Heart
                              size={20}
                              className={`cursor-pointer transition-transform duration-200 hover:scale-125 ${
                                 isFav
                                    ? 'text-red-500'
                                    : 'text-gray-500 hover:text-red-400'
                              }`}
                              onClick={() => handleFavorite(name)}
                              fill={isFav ? 'currentColor' : 'none'}
                           />
                        </div>

                        {/* Font Preview */}
                        <div
                           className="text-white text-xl leading-relaxed break-words 
                       mb-5 tracking-wide">
                           {previewStyle ? (
                              <span style={previewStyle}>
                                 {copyText.replace(/[\u0336\u0331]/g, '')}
                              </span>
                           ) : (
                              copyText
                           )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end">
                           <button
                              onClick={() => handleCopy(copyText, index)}
                              className={`px-5 py-2 rounded-xl flex items-center gap-2 text-sm font-medium
                          transition-all duration-200 shadow-md active:scale-95 cursor-pointer ${
                             isCopied
                                ? 'bg-gray-700 text-white'
                                : 'bg-white text-black hover:bg-gray-100'
                          }`}>
                              <Copy size={16} />
                              <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                           </button>
                        </div>
                     </div>
                  );
               }
            )}
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
};

export default FancyFontGenerator;
