import React, { useState, useEffect } from 'react';
import { FaTrash, FaDownload, FaCopy } from 'react-icons/fa';
import { IoCloudUploadOutline } from 'react-icons/io5';
import { FileText, Clock, Info } from 'lucide-react';
import Navbar from '../Navbar';
import SEO from '../SEO';
import { ColumnLines } from '@/components/ui/download-with-columnlines-utils/columnlines';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const WordCounter = () => {
   const [text, setText] = useState('');

   const [stats, setStats] = useState({
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: 0,
      speakingTime: 0,
   });

   const [copied, setCopied] = useState(false);

   const [toast, setToast] = useState({
      message: '',
      type: '',
      visible: false,
   });

   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [isMobile, setIsMobile] = useState(false);

   /* ============================================================
     MOBILE DETECTION
  ============================================================ */

   useEffect(() => {
      const checkMobile = () => {
         setIsMobile(window.innerWidth < 768);
      };

      checkMobile();

      window.addEventListener('resize', checkMobile);

      return () => {
         window.removeEventListener('resize', checkMobile);
      };
   }, []);

   /* ============================================================
     TOAST
  ============================================================ */

   const showNotification = (message, type = 'success', duration = 2500) => {
      setToast({
         message,
         type,
         visible: true,
      });

      setTimeout(() => {
         setToast((prev) => ({
            ...prev,
            visible: false,
         }));
      }, duration);
   };

   /* ============================================================
     CALCULATE STATS
  ============================================================ */

   useEffect(() => {
      const words = text
         .trim()
         .split(/\s+/)
         .filter((word) => word.length > 0);

      const wordCount = text.trim() === '' ? 0 : words.length;

      const charCount = text.length;

      const charNoSpaces = text.replace(/\s/g, '').length;

      const sentences = text
         .split(/[.!?]+/)
         .filter((s) => s.trim().length > 0).length;

      const paragraphs = text
         .split(/\n\n+/)
         .filter((p) => p.trim().length > 0).length;

      setStats({
         words: wordCount,
         characters: charCount,
         charactersNoSpaces: charNoSpaces,
         sentences,
         paragraphs,
         readingTime: Math.ceil(wordCount / 200),
         speakingTime: Math.ceil(wordCount / 150),
      });
   }, [text]);

   /* ============================================================
     COPY
  ============================================================ */

   const handleCopy = () => {
      if (!text) return;

      navigator.clipboard.writeText(text);

      setCopied(true);

      showNotification('Text copied to clipboard!');

      setTimeout(() => {
         setCopied(false);
      }, 2000);
   };

   /* ============================================================
     DOWNLOAD
  ============================================================ */

   const handleDownload = () => {
      if (!text) return;

      const element = document.createElement('a');

      element.href = URL.createObjectURL(
         new Blob([text], {
            type: 'text/plain',
         }),
      );

      element.download = 'document.txt';

      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);

      URL.revokeObjectURL(element.href);
   };

   /* ============================================================
     UPLOAD
  ============================================================ */

   const handleUpload = (e) => {
      const file = e.target.files?.[0];

      if (file) {
         const reader = new FileReader();

         reader.onload = (event) => {
            setText(event.target.result);
         };

         reader.readAsText(file);
      }

      e.target.value = '';
   };

   /* ============================================================
     CLEAR
  ============================================================ */

   const handleClear = () => {
      setText('');
      setCopied(false);
   };

   /* ============================================================
     STAT CARDS
  ============================================================ */

   const statCards = [
      {
         label: 'Words',
         value: stats.words,
      },
      {
         label: 'Characters',
         value: stats.characters,
      },
      {
         label: 'Without Spaces',
         value: stats.charactersNoSpaces,
      },
      {
         label: 'Sentences',
         value: stats.sentences,
      },
      {
         label: 'Paragraphs',
         value: stats.paragraphs,
      },
      {
         label: 'Reading Time',
         value: `${stats.readingTime}m`,
      },
   ];

   return (
      <ColumnLines
         columnWidth={80}
         columnCount={34}
         radialFadeStart={15}
         radialFadeEnd={90}
         className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#09090b] px-3 py-6 font-sans text-zinc-100 customScrollbar sm:px-5 sm:py-8 md:px-10">
         <SEO
            title="Word Counter | Character & Sentence Text Analyzer | Klique"
            description="Analyze your text online in real-time. Count words, characters, sentences, paragraphs, and estimate average reading and speaking times instantly."
            keywords="word counter, character counter, word count tool, text analyzer, count words online, reading time estimator, klique word counter"
            canonicalUrl="https://klique.netlify.app/wordcounter"
         />

         {/* ========================================================
          NAVBAR
      ======================================================== */}

         <div className="relative z-[100] w-full">
            <Navbar />
         </div>

         {/* ========================================================
          MAIN
      ======================================================== */}

         <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-0 pb-32 pt-24 sm:px-2 sm:pb-24 sm:pt-28 md:py-20 lg:pl-20">
            {/* ======================================================
            TOAST
        ====================================================== */}

            <AnimatePresence>
               {toast.visible && (
                  <motion.div
                     initial={{
                        opacity: 0,
                        y: -20,
                        x: '-50%',
                     }}
                     animate={{
                        opacity: 1,
                        y: 0,
                        x: '-50%',
                     }}
                     exit={{
                        opacity: 0,
                        y: -20,
                        x: '-50%',
                     }}
                     className="fixed left-1/2 top-4 z-[200] w-[calc(100%-24px)] max-w-sm">
                     <div className="flex w-full items-center gap-3 rounded-full border border-zinc-700 bg-[#18181b]/95 px-4 py-3 text-zinc-200 shadow-lg backdrop-blur-md">
                        <FiCheck className="h-4 w-4 shrink-0 text-green-400" />

                        <p className="min-w-0 flex-1 break-words pr-1 text-xs font-medium sm:text-sm">
                           {toast.message}
                        </p>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            {/* ======================================================
            HEADER
        ====================================================== */}

            <motion.div
               initial={{
                  opacity: 0,
                  y: 20,
               }}
               animate={{
                  opacity: 1,
                  y: 0,
               }}
               className="mb-7 w-full text-center sm:mb-10">
               <h1 className="mb-2 text-2xl font-medium tracking-tight text-zinc-100 sm:mb-3 sm:text-3xl md:text-4xl">
                  Word Counter
               </h1>

               <p className="px-2 text-xs font-medium leading-relaxed text-zinc-500 sm:text-sm md:text-base">
                  Analyze text with real-time statistics, density, and
                  readability.
               </p>
            </motion.div>

            {/* ======================================================
            MAIN GRID
        ====================================================== */}

            <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3 lg:gap-6">
               {/* ====================================================
              EDITOR
          ==================================================== */}

               <motion.div
                  initial={{
                     opacity: 0,
                     y: 20,
                  }}
                  animate={{
                     opacity: 1,
                     y: 0,
                  }}
                  className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#121214] p-3.5 shadow-xl sm:p-5 md:p-6 lg:col-span-2">
                  {/* Editor Header */}

                  <div className="mb-3 flex min-w-0 flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
                     <h2 className="flex min-w-0 items-center gap-2 text-base font-medium text-zinc-200 sm:text-lg">
                        <FileText
                           size={18}
                           className="shrink-0 text-zinc-400"
                        />

                        <span className="truncate">Your Text</span>
                     </h2>

                     {/* Action Buttons */}

                     <div className="grid w-full grid-cols-4 gap-1.5 sm:flex sm:w-auto sm:items-center sm:gap-2">
                        {/* Upload */}

                        <label
                           className="flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border border-zinc-800 bg-[#18181b] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 sm:h-auto sm:w-auto sm:p-2"
                           title="Upload">
                           <input
                              type="file"
                              accept=".txt"
                              onChange={handleUpload}
                              className="hidden"
                           />

                           <IoCloudUploadOutline size={18} />
                        </label>

                        {/* Copy */}

                        <button
                           onClick={handleCopy}
                           disabled={!text}
                           className="flex h-10 w-full items-center justify-center rounded-lg border border-zinc-800 bg-[#18181b] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 sm:h-auto sm:w-auto sm:p-2"
                           title="Copy">
                           {copied ? (
                              <FiCheck className="text-green-400" size={18} />
                           ) : (
                              <FaCopy size={17} />
                           )}
                        </button>

                        {/* Download */}

                        <button
                           onClick={handleDownload}
                           disabled={!text}
                           className="flex h-10 w-full items-center justify-center rounded-lg border border-zinc-800 bg-[#18181b] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40 sm:h-auto sm:w-auto sm:p-2"
                           title="Download">
                           <FaDownload size={17} />
                        </button>

                        {/* Clear */}

                        <button
                           onClick={handleClear}
                           disabled={!text}
                           className="flex h-10 w-full items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40 sm:h-auto sm:w-auto sm:p-2"
                           title="Clear">
                           <FaTrash size={17} />
                        </button>
                     </div>
                  </div>

                  {/* Text Editor */}

                  <textarea
                     value={text}
                     onChange={(e) => setText(e.target.value)}
                     placeholder="Start typing or paste your text here..."
                     className="min-h-[300px] w-full min-w-0 resize-none rounded-xl border border-zinc-800/80 bg-[#0f0f11] p-4 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 outline-none transition-colors focus:border-zinc-600 customScrollbar sm:min-h-[350px] sm:p-5 sm:text-base lg:min-h-[500px]"
                  />

                  {/* Editor Footer */}

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-600 sm:mt-4 sm:text-xs">
                     <span>{stats.words} words</span>

                     <span>{stats.characters} characters</span>
                  </div>
               </motion.div>

               {/* ====================================================
              STATS
          ==================================================== */}

               <div className="flex min-w-0 flex-col gap-4 sm:gap-5 lg:gap-6">
                  {/* Overview */}

                  <motion.div
                     initial={{
                        opacity: 0,
                        y: 20,
                     }}
                     animate={{
                        opacity: 1,
                        y: 0,
                     }}
                     transition={{
                        delay: 0.05,
                     }}
                     className="min-w-0 flex-1 rounded-2xl border border-zinc-800/80 bg-[#121214] p-3.5 shadow-xl sm:p-5 md:p-6">
                     <h2 className="mb-4 flex items-center gap-2 text-base font-medium text-zinc-200 sm:mb-6 sm:text-lg">
                        <Clock size={18} className="shrink-0 text-zinc-400" />

                        <span>Overview</span>
                     </h2>

                     <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                        {statCards.map((stat, i) => (
                           <motion.div
                              key={i}
                              initial={{
                                 opacity: 0,
                                 scale: 0.95,
                              }}
                              animate={{
                                 opacity: 1,
                                 scale: 1,
                              }}
                              transition={{
                                 delay: 0.05 + i * 0.04,
                              }}
                              className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-zinc-800 bg-[#18181b] p-3 text-center sm:p-4">
                              <span className="mb-1.5 max-w-full truncate text-[9px] font-medium uppercase tracking-wider text-zinc-500 sm:mb-2 sm:text-xs">
                                 {stat.label}
                              </span>

                              <span className="max-w-full break-words text-xl font-bold text-zinc-100 sm:text-2xl">
                                 {stat.value}
                              </span>
                           </motion.div>
                        ))}
                     </div>
                  </motion.div>

                  {/* Analysis */}

                  <motion.div
                     initial={{
                        opacity: 0,
                        y: 20,
                     }}
                     animate={{
                        opacity: 1,
                        y: 0,
                     }}
                     transition={{
                        delay: 0.1,
                     }}
                     className="min-w-0 rounded-2xl border border-zinc-800 bg-[#18181b] p-3.5 shadow-xl sm:p-5 md:p-6">
                     <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-zinc-300">
                        <Info size={16} className="shrink-0 text-zinc-500" />

                        <span>Analysis</span>
                     </h3>

                     <div className="space-y-3 sm:space-y-4">
                        {/* Average Word Length */}

                        <div className="flex items-center justify-between gap-3 border-b border-zinc-800/50 pb-3">
                           <span className="min-w-0 text-xs text-zinc-500 sm:text-sm">
                              Avg. Word Length
                           </span>

                           <span className="shrink-0 text-xs font-semibold text-zinc-200 sm:text-sm">
                              {stats.words > 0
                                 ? (
                                      stats.charactersNoSpaces / stats.words
                                   ).toFixed(1)
                                 : 0}
                           </span>
                        </div>

                        {/* Words per Sentence */}

                        <div className="flex items-center justify-between gap-3 border-b border-zinc-800/50 pb-3">
                           <span className="min-w-0 text-xs text-zinc-500 sm:text-sm">
                              Words per Sentence
                           </span>

                           <span className="shrink-0 text-xs font-semibold text-zinc-200 sm:text-sm">
                              {stats.sentences > 0
                                 ? (stats.words / stats.sentences).toFixed(1)
                                 : 0}
                           </span>
                        </div>

                        {/* Space Ratio */}

                        <div className="flex items-center justify-between gap-3">
                           <span className="min-w-0 text-xs text-zinc-500 sm:text-sm">
                              Space Ratio
                           </span>

                           <span className="shrink-0 text-xs font-semibold text-zinc-200 sm:text-sm">
                              {stats.characters > 0
                                 ? (
                                      (1 -
                                         stats.charactersNoSpaces /
                                            stats.characters) *
                                      100
                                   ).toFixed(1)
                                 : 0}
                              %
                           </span>
                        </div>
                     </div>
                  </motion.div>
               </div>
            </div>
         </div>

         {/* ========================================================
          GLOBAL MOBILE SAFETY
      ======================================================== */}

         <style>{`
        html,
        body {
          max-width: 100%;
          overflow-x: hidden;
        }

        button,
        label,
        textarea {
          touch-action: manipulation;
        }

        * {
          min-width: 0;
        }
      `}</style>
      </ColumnLines>
   );
};

export default WordCounter;
