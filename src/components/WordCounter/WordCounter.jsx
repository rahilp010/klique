import React, { useState, useEffect } from 'react';
import {
   FaFileAlt,
   FaCopy,
   FaTrash,
   FaDownload,
   FaClock,
   FaBars,
} from 'react-icons/fa';
import { IoCloudUploadOutline } from 'react-icons/io5';
import Navbar from '../Navbar';

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

   const showNotification = (message, type = 'success', duration = 2500) => {
      setToast({ message, type, visible: true });
      setTimeout(() => setToast((p) => ({ ...p, visible: false })), duration);
   };

   useEffect(() => {
      calculateStats(text);
   }, [text]);

   const calculateStats = (content) => {
      // Word count
      const words = content
         .trim()
         .split(/\s+/)
         .filter((word) => word.length > 0);
      const wordCount = content.trim() === '' ? 0 : words.length;

      // Character counts
      const charCount = content.length;
      const charNoSpaces = content.replace(/\s/g, '').length;

      // Sentence count
      const sentences = content
         .split(/[.!?]+/)
         .filter((s) => s.trim().length > 0);
      const sentenceCount = sentences.length;

      // Paragraph count
      const paragraphs = content
         .split(/\n\n+/)
         .filter((p) => p.trim().length > 0);
      const paragraphCount = paragraphs.length;

      // Reading time (average 200 words per minute)
      const readingTime = Math.ceil(wordCount / 200);

      // Speaking time (average 150 words per minute)
      const speakingTime = Math.ceil(wordCount / 150);

      setStats({
         words: wordCount,
         characters: charCount,
         charactersNoSpaces: charNoSpaces,
         sentences: sentenceCount,
         paragraphs: paragraphCount,
         readingTime: readingTime,
         speakingTime: speakingTime,
      });
   };

   const handleCopy = () => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   const handleClear = () => {
      setText('');
   };

   const handleDownload = () => {
      const element = document.createElement('a');
      const file = new Blob([text], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = 'document.txt';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
   };

   const handleUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = (event) => {
            setText(event.target.result);
         };
         reader.readAsText(file);
      }
   };

   useEffect(() => {
      if (copied) {
         showNotification('Text copied to clipboard!');
      }
   }, [copied]);

   const statCards = [
      {
         label: 'Words',
         value: stats.words,
         color: 'from-blue-500 to-cyan-400',
      },
      {
         label: 'Characters',
         value: stats.characters,
         color: 'from-purple-500 to-pink-400',
      },
      {
         label: 'Characters (no spaces)',
         value: stats.charactersNoSpaces,
         color: 'from-emerald-500 to-teal-400',
      },
      {
         label: 'Sentences',
         value: stats.sentences,
         color: 'from-orange-500 to-red-400',
      },
      {
         label: 'Paragraphs',
         value: stats.paragraphs,
         color: 'from-indigo-500 to-purple-400',
      },
      {
         label: 'Reading Time',
         value: `${stats.readingTime} min`,
         color: 'from-pink-500 to-rose-400',
      },
      {
         label: 'Speaking Time',
         value: `${stats.speakingTime} min`,
         color: 'from-amber-500 to-orange-400',
      },
   ];

   return (
      <div className="dark min-h-screen bg-[#050505] text-slate-200 relative overflow-hidden font-sans ">
         <div className="pointer-events-none absolute top-[-25%] left-[-15%] w-[60%] h-[60%] bg-[#a78bfa]/10 blur-[180px] rounded-full opacity-40" />
         <div className="pointer-events-none absolute bottom-[-25%] right-[-15%] w-[60%] h-[60%] bg-[#f472b6]/10 blur-[180px] rounded-full opacity-40" />
         <div
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="fixed top-6 left-6 z-40 p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl 
                       hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer">
            <FaBars size={20} className="text-white" />
         </div>

         <Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMobile={isMobile}
         />

         {toast.visible && (
            <div className="fixed top-4 right-4 left-4 sm:left-auto sm:top-6 sm:right-6 animate-slideIn z-50">
               <div
                  className={`px-4 py-3 sm:px-6 rounded-xl shadow-lg flex items-center gap-2 border backdrop-blur-md ${
                     toast.type === 'error'
                        ? 'bg-red-500/20 border-red-400 text-red-100'
                        : 'bg-green-500/20 border-green-400 text-green-100'
                  }`}>
                  <p className="text-sm">{toast.message}</p>
               </div>
            </div>
         )}
         <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-14 mt-14">
               <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
                  Word <span className="gradient-text">Counter</span>
               </h1>

               <p className="text-slate-400 mt-6 max-w-xl mx-auto leading-relaxed">
                  Analyze your text with real-time statistics, density, and
                  readability.
                  <br />
                  Dark mode optimized for focus writing.
               </p>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8 px-10">
               {/* Text Editor */}
               <div className="lg:col-span-2 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-xl font-semibold flex items-center gap-2">
                        <FaFileAlt className="text-indigo-400" />
                        Your Text
                     </h2>
                     <div className="flex gap-2">
                        <label
                           className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
                           title="Upload text">
                           <input
                              type="file"
                              accept=".txt"
                              onChange={handleUpload}
                              className="hidden"
                           />
                           <IoCloudUploadOutline
                              size={20}
                              className="text-gray-300"
                           />
                        </label>
                        <button
                           onClick={handleCopy}
                           className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors"
                           title="Copy text">
                           <FaCopy
                              className={
                                 copied ? 'text-green-400' : 'text-gray-300'
                              }
                           />
                        </button>
                        <button
                           onClick={handleDownload}
                           disabled={!text}
                           className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                           title="Download as .txt">
                           <FaDownload className="text-gray-300" />
                        </button>
                        <button
                           onClick={handleClear}
                           disabled={!text}
                           className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                           title="Clear text">
                           <FaTrash className="text-red-400" />
                        </button>
                     </div>
                  </div>
                  <textarea
                     value={text}
                     onChange={(e) => setText(e.target.value)}
                     placeholder="Start typing or paste your text here..."
                     className="w-full h-[calc(80vh-4rem)] p-4 bg-black/50 border border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm sm:text-base resize-none"
                     style={{ fontFamily: 'monospace' }}
                  />
               </div>

               {/* Stats Cards */}
               <div className="space-y-4">
                  <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl h-full">
                     <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 tracking-wide">
                        <FaClock className="text-indigo-400" />
                        Statistics
                     </h2>
                     <div className="grid grid-cols-2 gap-4">
                        {statCards.map((stat, index) => (
                           <div
                              key={index}
                              className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30 hover:border-pink-500/40 transition-all">
                              <div className="flex flex-col items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <span className="text-gray-400 text-sm text-center">
                                       {stat.label}
                                    </span>
                                 </div>
                                 <span className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                                    {stat.value}
                                 </span>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl border border-indigo-500/20 p-6 shadow-xl my-5 mx-10">
               <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  💡 Quick Tips
               </h3>
               <ul className="space-y-2 text-sm text-gray-400">
                  <li>• Average reading speed: 200 words/min</li>
                  <li>• Average speaking speed: 150 words/min</li>
                  <li>• Upload .txt files for quick analysis</li>
                  <li>• Use copy/download for easy sharing</li>
               </ul>
            </div>

            {/* Density Analysis */}
            {text && (
               <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 shadow-xl mb-10">
                  <h2 className="text-xl font-semibold mb-4">Text Density</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="bg-black/50 border border-gray-700 rounded-xl p-4 text-center">
                        <p className="text-gray-400 text-sm mb-1">
                           Avg. Word Length
                        </p>
                        <p className="text-2xl font-bold text-indigo-400">
                           {stats.words > 0
                              ? (
                                   stats.charactersNoSpaces / stats.words
                                ).toFixed(1)
                              : 0}
                        </p>
                     </div>
                     <div className="bg-black/50 border border-gray-700 rounded-xl p-4 text-center">
                        <p className="text-gray-400 text-sm mb-1">
                           Words per Sentence
                        </p>
                        <p className="text-2xl font-bold text-purple-400">
                           {stats.sentences > 0
                              ? (stats.words / stats.sentences).toFixed(1)
                              : 0}
                        </p>
                     </div>
                     <div className="bg-black/50 border border-gray-700 rounded-xl p-4 text-center">
                        <p className="text-gray-400 text-sm mb-1">
                           Sentences per Paragraph
                        </p>
                        <p className="text-2xl font-bold text-pink-400">
                           {stats.paragraphs > 0
                              ? (stats.sentences / stats.paragraphs).toFixed(1)
                              : 0}
                        </p>
                     </div>
                     <div className="bg-black/50 border border-gray-700 rounded-xl p-4 text-center">
                        <p className="text-gray-400 text-sm mb-1">
                           Space Ratio
                        </p>
                        <p className="text-2xl font-bold text-cyan-400">
                           {stats.characters > 0
                              ? (
                                   (1 -
                                      stats.charactersNoSpaces /
                                         stats.characters) *
                                   100
                                ).toFixed(1)
                              : 0}
                           %
                        </p>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default WordCounter;
