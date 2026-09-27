import React, { useState, useEffect } from 'react';
import { FaBars, FaTrash, FaDownload, FaCopy } from 'react-icons/fa';
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

   useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
   }, []);

   const showNotification = (message, type = 'success', duration = 2500) => {
      setToast({ message, type, visible: true });
      setTimeout(() => setToast((p) => ({ ...p, visible: false })), duration);
   };

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

   const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      showNotification('Text copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
   };

   const handleDownload = () => {
      const element = document.createElement('a');
      element.href = URL.createObjectURL(
         new Blob([text], { type: 'text/plain' }),
      );
      element.download = 'document.txt';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
   };

   const handleUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = (event) => setText(event.target.result);
         reader.readAsText(file);
      }
   };

   const statCards = [
      { label: 'Words', value: stats.words },
      { label: 'Characters', value: stats.characters },
      { label: 'Without Spaces', value: stats.charactersNoSpaces },
      { label: 'Sentences', value: stats.sentences },
      { label: 'Paragraphs', value: stats.paragraphs },
      { label: 'Reading Time', value: `${stats.readingTime}m` },
   ];

   return (
      <ColumnLines
         columnWidth={80}
         columnCount={34}
         radialFadeStart={15}
         radialFadeEnd={90}
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-4 py-20 md:px-10">
         <SEO
            title="Word Counter | Character & Sentence Text Analyzer | Klique"
            description="Analyze your text online in real-time. Count words, characters, sentences, paragraphs, and estimate average reading and speaking times instantly."
            keywords="word counter, character counter, word count tool, text analyzer, count words online, reading time estimator, klique word counter"
            canonicalUrl="https://klique.netlify.app/wordcounter"
         />

         <div className="w-full sticky top-0 z-30 bg-[#16161b] transition-all duration-300">
            <Navbar />
         </div>

         <div className="w-full max-w-6xl mx-auto pl-0 lg:pl-20 px-3 sm:px-6 relative z-20">
            {/* Toast Notification */}
            <AnimatePresence>
               {toast.visible && (
                  <motion.div
                     initial={{ opacity: 0, y: -20, x: '-50%' }}
                     animate={{ opacity: 1, y: 0, x: '-50%' }}
                     exit={{ opacity: 0, y: -20, x: '-50%' }}
                     className="fixed top-6 left-1/2 z-50">
                     <div className="px-4 py-3 rounded-full shadow-lg flex items-center gap-3 border bg-[#18181b] border-zinc-700 backdrop-blur-md text-zinc-200">
                        <FiCheck className="text-green-400 w-4 h-4" />
                        <p className="text-sm font-medium pr-2">
                           {toast.message}
                        </p>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto relative z-20">
               <div className="text-center mb-10">
                  <h1 className="text-3xl sm:text-4xl font-medium text-zinc-100 tracking-tight mb-3">
                     Word Counter
                  </h1>
                  <p className="text-zinc-500 text-sm sm:text-base font-medium">
                     Analyze text with real-time statistics, density, and
                     readability.
                  </p>
               </div>

               <div className="grid lg:grid-cols-3 gap-6 mb-8">
                  {/* Editor */}
                  <div className="lg:col-span-2 bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col">
                     <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
                        <h2 className="text-lg font-medium flex items-center gap-2 text-zinc-200">
                           <FileText size={18} className="text-zinc-400" /> Your
                           Text
                        </h2>
                        <div className="flex items-center gap-2">
                           <label
                              className="p-2 bg-[#18181b] border border-zinc-800 hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors text-zinc-400 hover:text-zinc-200"
                              title="Upload">
                              <input
                                 type="file"
                                 accept=".txt"
                                 onChange={handleUpload}
                                 className="hidden"
                              />
                              <IoCloudUploadOutline size={18} />
                           </label>
                           <button
                              onClick={handleCopy}
                              className="p-2 bg-[#18181b] border border-zinc-800 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-200"
                              title="Copy">
                              {copied ? (
                                 <FiCheck
                                    className="text-green-400"
                                    size={18}
                                 />
                              ) : (
                                 <FaCopy size={18} />
                              )}
                           </button>
                           <button
                              onClick={handleDownload}
                              disabled={!text}
                              className="p-2 bg-[#18181b] border border-zinc-800 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-zinc-200 disabled:opacity-50"
                              title="Download">
                              <FaDownload size={18} />
                           </button>
                           <button
                              onClick={() => setText('')}
                              disabled={!text}
                              className="p-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-lg transition-colors text-red-400 disabled:opacity-50"
                              title="Clear">
                              <FaTrash size={18} />
                           </button>
                        </div>
                     </div>
                     <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Start typing or paste your text here..."
                        className="w-full flex-1 min-h-[300px] lg:min-h-[500px] p-5 bg-[#0f0f11] border border-zinc-800/80 rounded-xl focus:outline-none focus:border-zinc-600 text-zinc-200 placeholder-zinc-600 text-base resize-none customScrollbar"
                     />
                  </div>

                  {/* Stats Column */}
                  <div className="flex flex-col gap-6">
                     <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex-1">
                        <h2 className="text-lg font-medium mb-6 flex items-center gap-2 text-zinc-200">
                           <Clock size={18} className="text-zinc-400" />{' '}
                           Overview
                        </h2>
                        <div className="grid grid-cols-2 gap-3">
                           {statCards.map((stat, i) => (
                              <div
                                 key={i}
                                 className="bg-[#18181b] rounded-xl p-4 border border-zinc-800 flex flex-col justify-center items-center text-center">
                                 <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                                    {stat.label}
                                 </span>
                                 <span className="text-2xl font-bold text-zinc-100">
                                    {stat.value}
                                 </span>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-sm font-medium mb-4 flex items-center gap-2 text-zinc-300">
                           <Info size={16} className="text-zinc-500" /> Analysis
                        </h3>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                              <span className="text-sm text-zinc-500">
                                 Avg. Word Length
                              </span>
                              <span className="text-sm font-semibold text-zinc-200">
                                 {stats.words > 0
                                    ? (
                                         stats.charactersNoSpaces / stats.words
                                      ).toFixed(1)
                                    : 0}
                              </span>
                           </div>
                           <div className="flex justify-between items-center pb-3 border-b border-zinc-800/50">
                              <span className="text-sm text-zinc-500">
                                 Words per Sentence
                              </span>
                              <span className="text-sm font-semibold text-zinc-200">
                                 {stats.sentences > 0
                                    ? (stats.words / stats.sentences).toFixed(1)
                                    : 0}
                              </span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="text-sm text-zinc-500">
                                 Space Ratio
                              </span>
                              <span className="text-sm font-semibold text-zinc-200">
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
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </ColumnLines>
   );
};

export default WordCounter;
