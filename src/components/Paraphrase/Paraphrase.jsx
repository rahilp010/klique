import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaCopy, FaTrash, FaDownload, FaBars, FaRedo } from 'react-icons/fa';
import { IoCloudUploadOutline } from 'react-icons/io5';
import {
   FaNewspaper,
   FaEnvelope,
   FaPenNib,
   FaKey,
   FaLightbulb,
   FaParagraph,
   FaBullseye,
   FaTag,
   FaGlobe,
   FaRegNewspaper,
} from 'react-icons/fa6';
import { HiRocketLaunch } from 'react-icons/hi2';
import { LuMail, LuGraduationCap, LuSearch, LuSparkles } from 'react-icons/lu';
import { Settings } from 'lucide-react';
import { PiSparkleLight } from 'react-icons/pi';
import { motion } from 'framer-motion';
import Navbar from '../Navbar';
import SEO from '../SEO';
import { callGeminiApi, toolPrompts } from './AI';
import { MdOutlineArrowBackIosNew, MdSummarize } from 'react-icons/md';
import { TbTextGrammar } from 'react-icons/tb';

export default function AIWriter() {
   const [activeTool, setActiveTool] = useState('GrammerChecker');
   const [prompt, setPrompt] = useState('');
   const [tone, setTone] = useState('Neutral');
   const [language, setLanguage] = useState('English');
   const [length, setLength] = useState(150);
   const [result, setResult] = useState('');
   const [isGenerating, setIsGenerating] = useState(false);
   const [history, setHistory] = useState([]);
   const [selectedTemplate, setSelectedTemplate] = useState(null);
   const [queryName, setQueryName] = useState('');
   const [showSettings, setShowSettings] = useState(true);
   const [copied, setCopied] = useState(false);
   const [sidebarExpanded, setSidebarExpanded] = useState(true);
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const generateButtonRef = useRef(null);

   const [toast, setToast] = useState({
      message: '',
      type: '',
      visible: false,
   });

   const tools = [
      {
         name: 'GrammerChecker',
         icon: <TbTextGrammar className="text-lg" />,
         desc: 'Grammar checker',
      },
      {
         name: 'Paraphrase',
         icon: <FaBullseye className="text-lg" />,
         desc: 'Paraphrase text',
      },

      {
         name: 'Email',
         icon: <FaEnvelope className="text-lg" />,
         desc: 'Professional emails',
      },
      {
         name: 'Translation',
         icon: <FaGlobe className="text-lg" />,
         desc: 'Language translation',
      },
      {
         name: 'Summarizer',
         icon: <MdSummarize className="text-lg" />,
         desc: 'Write full articles',
      },
      {
         name: 'Article',
         icon: <FaRegNewspaper className="text-lg" />,
         desc: 'Write full articles',
      },
      {
         name: 'Essay',
         icon: <FaPenNib className="text-lg" />,
         desc: 'Academic essays',
      },
      {
         name: 'Keywords',
         icon: <FaKey className="text-lg" />,
         desc: 'SEO keywords',
      },
      {
         name: 'Paragraph',
         icon: <FaParagraph className="text-lg" />,
         desc: 'Content blocks',
      },
      {
         name: 'Title',
         icon: <FaTag className="text-lg" />,
         desc: 'Catchy titles',
      },
      {
         name: 'Name',
         icon: <FaLightbulb className="text-lg" />,
         desc: 'Brand names',
      },
   ];

   const placeholder = {
      Article: 'Write a full article about "Your Topic".',
      Email: 'Write a professional email to recipient about "Your Topic".',
      Essay: 'Write an essay about "Your Topic".',
      Keywords: 'Generate 15 relevant SEO keywords related to "Your Topic".',
      Name: 'Generate 10 creative names for a product brand or company.',
      Paragraph:
         'Write a descriptive and coherent paragraph about "Your Topic".',
      Prompt:
         'You are an expert in AI prompt engineering. Create an optimized, detailed prompt for the topic "Your Topic".',
      Title: 'Generate 10 catchy, attention-grabbing titles for the topic "Your Topic".',
      Translation:
         'Translate the following text accurately into "Your Language".',
      Paraphrase:
         'Paraphrase the following text accurately into "Your Language".',
      GrammerChecker:
         'Check the following text for grammar errors and provide corrections.',
      Summarizer:
         'Summarize the following text accurately into "Your Language".',
   };

   const templates = [
      {
         id: 'article_intro',
         title: 'Article Intro',
         icon: <HiRocketLaunch className="text-lg text-indigo-400" />,
         text: `Write a compelling article introduction about {topic} that grabs the reader's attention.`,
      },
      {
         id: 'email_template',
         title: 'Email Template',
         icon: <LuMail className="text-lg text-emerald-400" />,
         text: 'Write a professional email to {recipient} about {topic} in a clear and concise way.',
      },
      {
         id: 'essay_body',
         title: 'Essay Paragraph',
         icon: <LuGraduationCap className="text-lg text-blue-400" />,
         text: 'Write a detailed essay paragraph about {topic} with examples and explanations.',
      },
      {
         id: 'keyword_list',
         title: 'SEO Keywords',
         icon: <LuSearch className="text-lg text-yellow-400" />,
         text: 'Generate 15 relevant SEO keywords related to {topic}.',
      },
      {
         id: 'name_ideas',
         title: 'Name Ideas',
         icon: <LuSparkles className="text-lg text-pink-400" />,
         text: 'Generate 10 creative names for a {product} brand or company.',
      },
   ];

   useEffect(() => {
      const saved = JSON.parse(localStorage.getItem('ai_history') || '[]');
      setHistory(saved);
   }, []);

   useEffect(() => {
      localStorage.setItem('ai_history', JSON.stringify(history));
   }, [history]);

   function showNotification(message, type = 'success', duration = 3000) {
      setToast({ message, type, visible: true });
      setTimeout(() => setToast((t) => ({ ...t, visible: false })), duration);
   }

   const handleScroll = () => {
      if (generateButtonRef.current) {
         generateButtonRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
         });
      }
   };

   const canGenerate = useMemo(
      () => prompt.trim().length > 0 && !isGenerating,
      [prompt, isGenerating]
   );

   function applyTemplate(t) {
      setSelectedTemplate(t.id);
      const filled = t.text
         .replace(/{topic}/g, 'your topic here')
         .replace(/{product}/g, 'your product')
         .replace(/{paragraph}/g, 'your paragraph')
         .replace(/{goal}/g, 'your goal')
         .replace(/{language}/g, 'target language')
         .replace(/{text}/g, 'your text')
         .replace(/{recipient}/g, 'recipient name');
      setPrompt(filled);
      showNotification('Template applied');
   }

   function saveToHistory(entry) {
      const newHistory = [entry, ...history].slice(0, 50);
      setHistory(newHistory);
   }

   async function generate() {
      if (!canGenerate) return;
      setIsGenerating(true);
      setResult('');
      showNotification('✨✨Generating content✨✨', 'success', 1500);

      try {
         // ✅ Combine prompt with user tone/language/length preferences
         handleScroll();
         const buildPrompt = toolPrompts[activeTool];
         let fullPrompt;
         if (activeTool === 'Article' || activeTool === 'Essay') {
            fullPrompt = buildPrompt
               ? buildPrompt(prompt, tone, language, length)
               : `${prompt}\nTone: ${tone}\nLanguage: ${language}\nLength: ${length} words.`;
         } else if (activeTool === 'Translation') {
            fullPrompt = buildPrompt
               ? buildPrompt(prompt, language)
               : `${prompt}\nLanguage: ${language}`;
         } else {
            fullPrompt = buildPrompt
               ? buildPrompt(prompt, tone, language)
               : `${prompt}\nTone: ${tone}\nLanguage: ${language}`;
         }

         // ✅ Call Gemini API
         const aiText = await callGeminiApi(fullPrompt);

         // ✅ Save result
         setResult(aiText);
         saveToHistory({
            id: Date.now(),
            tool: activeTool,
            prompt,
            tone,
            language,
            length,
            result: aiText,
            createdAt: new Date().toISOString(),
            name: queryName || undefined,
         });

         showNotification('✨✨Content generated✨✨');
      } catch (err) {
         console.error(err);
         showNotification('❌ Failed to generate content', 'error');
      } finally {
         setIsGenerating(false);
      }
   }

   function handleCopy() {
      if (!result) return;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showNotification('☑️ Copied to clipboard');
   }

   function handleClear() {
      setPrompt('');
      setResult('');
      setQueryName('');
   }

   function handleDownload() {
      const textToSave = result || prompt || '';
      const element = document.createElement('a');
      const file = new Blob([textToSave], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${(queryName || 'ai-output').replace(
         /\s+/g,
         '-'
      )}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showNotification('✅ Downloaded successfully');
   }

   function handleUpload(e) {
      const file = e.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = (ev) => setPrompt(ev.target.result);
         reader.readAsText(file);
         showNotification('✅ File uploaded');
      }
   }

   const toneOptionsParaphrase = [
      { label: '🙂 Friendly', value: 'friendly' },
      { label: '💎 Luxury', value: 'luxury' },
      { label: '🎨 Artistic', value: 'artistic' },
      { label: '😌 Relaxed', value: 'relaxed' },
      { label: '🧐 Motivational', value: 'motivational' },
      { label: '😄 Humorous', value: 'humorous' },
      { label: '💼 Professional', value: 'professional' },
      { label: '💡 Witty', value: 'witty' },
      { label: '✨ Charismatic', value: 'charismatic' },
      { label: '💪🏼 Bold', value: 'bold' },
   ];

   const Select = ({
      value,
      onChange,
      children,
      placeholder,
      className = '',
   }) => (
      <div className="relative w-full">
         <select
            value={value}
            onChange={onChange}
            className={`
            w-full px-4 py-3 
            bg-black/50 border border-white/10 text-white rounded-xl
            focus:ring-2 focus:ring-indigo-400 focus:outline-none 
            appearance-none cursor-pointer
            transition-all duration-300
            ${className}
         `}>
            {placeholder && <option value="">{placeholder}</option>}
            {children}
         </select>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5 text-white/60 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200">
            <path
               fillRule="evenodd"
               d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
               clipRule="evenodd"
            />
         </svg>
      </div>
   );

   return (
      <div className="max-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white customScrollbar">
         <SEO
            title="AI Writer & Paraphrasing Tool | Rephrase Text | Klique"
            description="Rephrase sentences, improve articles, fix grammar, and write creative copy with our free AI writer and paraphrase tool powered by advanced AI."
            keywords="ai writer, paraphrasing tool, article rewriter, rephrase sentences, content generator, ai copywriter, klique ai writer, grammar checker"
            canonicalUrl="https://klique.netlify.app/aiwriter"
            jsonLd={{
               "@context": "https://schema.org",
               "@type": "SoftwareApplication",
               "name": "AI Writer Studio",
               "operatingSystem": "All",
               "applicationCategory": "UtilitiesApplication",
               "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
               }
            }}
         />
         <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

         {/* Toast Notification */}
         {toast.visible && (
            <div className="fixed top-6 right-6 z-50 animate-slide-in">
               <div
                  className={`px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-xl ${
                     toast.type === 'error'
                        ? 'bg-red-500/20 border-red-400/50 text-red-100'
                        : 'bg-green-500/20 border-green-400/50 text-green-100'
                  }`}>
                  <p className="text-sm font-medium">{toast.message}</p>
               </div>
            </div>
         )}

         {/* Header */}
         <header className="sticky top-0 z-30 glass-effect border-b border-white/10 shadow-lg backdrop-blur-xl">
            <div className="max-w-[1800px] mx-auto px-4 py-4 flex items-center justify-between">
               {/* Left: Sidebar Toggle + Title */}
               <div className="flex items-center gap-6">
                  <div
                     onClick={() => setSidebarOpen((prev) => !prev)}
                     className="z-40 p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl 
               hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer">
                     <FaBars size={18} className="text-white" />
                  </div>

                  <div>
                     <p className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(99,102,241,0.3)] tracking-wide">
                        AI Writer Studio
                     </p>
                  </div>
               </div>
            </div>
         </header>

         <div className="flex max-w-[1800px] mx-auto min-h-screen relative">
            {/* Collapsible Sidebar */}
            <aside
               className={`sticky top-16 h-screen flex-shrink-0 transition-all duration-300 ease-in-out 
  glass-effect bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-black/80 border-r border-white/10
  ${sidebarExpanded ? 'w-64' : 'w-18'} ease-in-out`}
               onMouseEnter={() => setSidebarExpanded(true)}>
               <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between py-5 px-4 border-b border-white/10 transition-all duration-300 ease-in-out">
                     <div className="flex items-center relative w-full">
                        <p
                           className={`text-2xl font-semibold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent
        ${!sidebarExpanded && 'hidden'}`}>
                           Tools
                        </p>
                        <MdOutlineArrowBackIosNew
                           size={30}
                           className={`absolute right-0 ${
                              !sidebarExpanded && 'hidden'
                           } hover:scale-110 cursor-pointer p-1.5 bg-gradient-to-r from-indigo-400 to-pink-400 rounded-4xl`}
                           onClick={() => setSidebarExpanded(false)}
                        />
                     </div>
                     {!sidebarExpanded && (
                        <p
                           className={`text-lg font-semibold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent 
        ${sidebarExpanded && 'hidden'}`}>
                           Tools
                        </p>
                     )}
                  </div>

                  {/* Search */}
                  <div className="p-3 relative">
                     {sidebarExpanded ? (
                        <>
                           <input
                              type="text"
                              placeholder="Search..."
                              value={searchQuery}
                              onChange={(e) => {
                                 setSearchQuery(e.target.value);
                                 if (e.target.value.length > 0)
                                    setSidebarExpanded(true);
                              }}
                              className="w-full rounded-lg pl-8 pr-3 py-2 bg-black/30 border border-white/10 text-sm text-white
                       placeholder-gray-500 focus:border-indigo-500/50 outline-none"
                           />
                           <LuSearch
                              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
                              size={16}
                           />
                        </>
                     ) : (
                        <button
                           onClick={() => setSidebarExpanded(true)}
                           className="flex items-center justify-center w-10 h-10 rounded-lg bg-black/30 border border-white/10 hover:bg-white/10 transition"
                           title="Search tools">
                           <LuSearch className="text-gray-300" size={18} />
                        </button>
                     )}
                  </div>

                  <div className="border-t border-white/10 "></div>

                  {/* Scrollable Tool + Template List */}
                  <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent customScrollbar">
                     <nav className="py-3 px-2 space-y-1">
                        {tools
                           .filter((tool) =>
                              tool.name
                                 .toLowerCase()
                                 .includes(searchQuery.toLowerCase())
                           )
                           .map((tool) => (
                              <button
                                 key={tool.name}
                                 onClick={() => {
                                    setActiveTool(tool.name);
                                    setSidebarOpen(false);
                                 }}
                                 className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left
              ${
                 activeTool === tool.name
                    ? 'bg-gradient-to-r from-indigo-600/30 to-pink-500/20 border border-indigo-500/40 text-white shadow-md shadow-indigo-500/20'
                    : 'hover:bg-white/10'
              }`}>
                                 <span className="text-xl">{tool.icon}</span>
                                 {sidebarExpanded && (
                                    <span className="text-sm font-medium">
                                       {tool.name}
                                    </span>
                                 )}
                              </button>
                           ))}
                     </nav>
                  </div>
               </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 space-y-6">
               {/* Editor Card */}
               <div className="glass-effect rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                     <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-1 text-white text-lg font-semibold shadow-lg mb-5 tracking-wide">
                        {activeTool}
                     </span>
                     <div className="flex flex-wrap items-center gap-3 mb-5">
                        <label
                           className="p-2.5 glass-effect rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                           title="Upload prompt from file">
                           <input
                              type="file"
                              accept=".txt"
                              onChange={handleUpload}
                              className="hidden"
                           />
                           <IoCloudUploadOutline
                              size={18}
                              className="text-gray-300"
                           />
                        </label>
                        <div
                           className="p-2.5 glass-effect rounded-xl cursor-pointer hover:bg-white/10 transition-colors"
                           title="Settings"
                           onClick={() => setShowSettings(!showSettings)}>
                           <Settings size={18} className="text-gray-300" />
                        </div>
                     </div>
                  </div>

                  {showSettings && (
                     <div className="mb-5 p-5 glass-effect rounded-xl border border-white/10">
                        <p className="text-lg font-light mb-3 flex items-center gap-2">
                           Generation Settings
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                           {activeTool !== 'Prompt' &&
                              activeTool !== 'Translation' &&
                              activeTool !== 'Name' &&
                              activeTool !== 'Keywords' &&
                              activeTool !== 'Title' &&
                              activeTool !== 'Paraphrase' &&
                              activeTool !== 'GrammerChecker' &&
                              activeTool !== 'Summarizer' && (
                                 <Select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    placeholder="Select Tone">
                                    {[
                                       'Neutral',
                                       'Professional',
                                       'Casual',
                                       'Friendly',
                                       'Formal',
                                    ].map((tone) => (
                                       <option key={tone}>{tone}</option>
                                    ))}
                                 </Select>
                              )}
                           {activeTool === 'Paraphrase' && (
                              <Select
                                 value={tone}
                                 onChange={(e) => setTone(e.target.value)}
                                 placeholder="Select Tone">
                                 {toneOptionsParaphrase.map((tone) => (
                                    <option key={tone.value}>
                                       {tone.label}
                                    </option>
                                 ))}
                              </Select>
                           )}
                           {activeTool !== 'Prompt' &&
                              activeTool !== 'Paraphrase' &&
                              activeTool !== 'GrammerChecker' &&
                              activeTool !== 'Summarizer' && (
                                 <Select
                                    value={language}
                                    onChange={(e) =>
                                       setLanguage(e.target.value)
                                    }
                                    placeholder="Select Language">
                                    {[
                                       'English',
                                       'Gujarati',
                                       'Hindi',
                                       'Spanish',
                                       'French',
                                       'German',
                                       'Italian',
                                    ].map((language) => (
                                       <option key={language}>
                                          {language}
                                       </option>
                                    ))}
                                 </Select>
                              )}
                           {(activeTool === 'Article' ||
                              activeTool === 'Essay') && (
                              <div className="flex items-center">
                                 <label
                                    htmlFor="length"
                                    className="w-36 text-sm">
                                    Total words :
                                 </label>
                                 <input
                                    id="length"
                                    type="text"
                                    min={0}
                                    max={1000}
                                    value={length}
                                    onChange={(e) =>
                                       setLength(Number(e.target.value))
                                    }
                                    className="w-full px-3 py-3 bg-black/50 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none appearance-none cursor-pointer transition-all duration-300"
                                 />
                              </div>
                           )}
                           <Select
                              value={selectedTemplate || ''}
                              onChange={(e) => {
                                 const template = templates.find(
                                    (t) => t.id === e.target.value
                                 );
                                 if (template) applyTemplate(template);
                              }}
                              placeholder="Select Template">
                              {templates.map((t) => (
                                 <option key={t.id} value={t.id}>
                                    {t.title}
                                 </option>
                              ))}
                           </Select>
                        </div>
                     </div>
                  )}

                  <textarea
                     value={prompt}
                     onChange={(e) => setPrompt(e.target.value)}
                     placeholder={`✨ Describe what you want to create with ${activeTool}...\n\nExample: ${placeholder[activeTool]}`}
                     className="w-full h-48 p-4 bg-black/50 border border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm sm:text-base resize-none customScrollbar"></textarea>

                  <div className="mt-6 flex flex-wrap items-center gap-4 relative z-10">
                     {/* 🪄 Generate Button */}
                     <motion.button
                        ref={generateButtonRef}
                        onClick={generate}
                        disabled={!canGenerate}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`group relative overflow-hidden px-6 py-3 rounded-2xl font-semibold text-lg border-2 transition-all
         ${
            isGenerating
               ? 'bg-gradient-to-r from-indigo-500/20 to-pink-500/20 border-white/30 text-white/80'
               : 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-white/40 text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]'
         }
         disabled:opacity-50 disabled:cursor-not-allowed`}>
                        {/* Animated background glow */}
                        <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-pink-500/30 blur-lg opacity-0 group-hover:opacity-60 transition-opacity"></span>

                        {isGenerating ? (
                           <motion.div
                              className="flex items-center justify-center gap-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}>
                              <svg
                                 className="w-5 h-5 animate-spin"
                                 viewBox="0 0 24 24">
                                 <circle
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                    opacity="0.25"
                                 />
                                 <path
                                    d="M12 2a10 10 0 0 1 10 10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                 />
                              </svg>
                              <span>Generating...</span>
                           </motion.div>
                        ) : (
                           <motion.div
                              className="flex items-center justify-center gap-3"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}>
                              <PiSparkleLight
                                 size={22}
                                 className="text-pink-400"
                              />
                              <span>Generate Content</span>
                           </motion.div>
                        )}
                     </motion.button>

                     {/* 🧹 Clear Button */}
                     <motion.button
                        onClick={handleClear}
                        whileHover={{ scale: 1.07, rotate: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative overflow-hidden px-5 py-3 rounded-2xl border-2 border-white/40 bg-gradient-to-r from-red-600/20 to-red-500/20 
                 text-sm font-medium hover:shadow-[0_0_15px_rgba(255,0,0,0.2)] transition-all">
                        <span className="absolute inset-0 bg-gradient-to-r from-red-500/40 to-pink-500/30 blur-lg opacity-0 hover:opacity-70 transition-opacity"></span>
                        <FaTrash className="inline mr-2 text-red-400" />
                        Clear
                     </motion.button>

                     {/* ✨ Character + Word Count */}
                     <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="ml-auto flex items-center gap-3 text-xs">
                        <div className="px-4 py-2 glass-effect rounded-xl border border-white/10 hover:border-white/20 transition-all">
                           <span className="text-gray-400">Characters:</span>
                           <span className="ml-2 font-semibold">
                              {prompt.length}
                           </span>
                        </div>
                        <div className="px-4 py-2 glass-effect rounded-xl border border-white/10 hover:border-white/20 transition-all">
                           <span className="text-gray-400">Words:</span>
                           <span className="ml-2 font-semibold">
                              {prompt.trim()
                                 ? prompt.trim().split(/\s+/).length
                                 : 0}
                           </span>
                        </div>
                     </motion.div>
                  </div>
               </div>

               {/* Result Card */}
               <div className="glass-effect rounded-2xl p-6 shadow-2xl">
                  <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
                     <h3 className="text-lg font-bold flex items-center gap-2">
                        <span>✨</span> Generated Result
                     </h3>
                     <div className="flex items-center gap-2">
                        <button
                           onClick={handleCopy}
                           disabled={!result}
                           className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              result
                                 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg text-white'
                                 : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                           }`}>
                           {copied ? (
                              <>✓ Copied</>
                           ) : (
                              <>
                                 <FaCopy className="inline mr-2" />
                                 Copy
                              </>
                           )}
                        </button>

                        <button
                           onClick={handleDownload}
                           disabled={!result && !prompt}
                           className="px-4 py-2 rounded-lg glass-effect text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                           <FaDownload className="inline mr-2" />
                           Download
                        </button>
                     </div>
                  </div>

                  {isGenerating ? (
                     <div className="w-full h-96 rounded-xl border border-white/10 p-8 shimmer flex items-center justify-center">
                        <div className="text-center">
                           <div className="text-6xl mb-4 animate-bounce">
                              ✨
                           </div>
                           <div className="text-lg font-semibold mb-2">
                              Creating your content...
                           </div>
                           <div className="text-sm text-gray-400">
                              This may take a few seconds
                           </div>
                        </div>
                     </div>
                  ) : (
                     <textarea
                        value={result}
                        onChange={(e) => setResult(e.target.value)}
                        placeholder="Your generated content will appear here...\n\nYou can edit it directly after generation."
                        className="w-full h-96 rounded-xl p-4 text-sm border bg-black/50 border-gray-700 resize-none focus:border-gray-500 focus:border-2  transition-colors outline-none placeholder:text-gray-500"
                     />
                  )}

                  {result && (
                     <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
                        <div className="px-3 py-1.5 glass-effect rounded-lg">
                           Characters:{' '}
                           <span className="font-semibold text-white">
                              {result.length}
                           </span>
                        </div>
                        <div className="px-3 py-1.5 glass-effect rounded-lg">
                           Words:{' '}
                           <span className="font-semibold text-white">
                              {result.trim().split(/\s+/).length}
                           </span>
                        </div>
                        <div className="px-3 py-1.5 glass-effect rounded-lg">
                           Lines:{' '}
                           <span className="font-semibold text-white">
                              {result.split('\n').length}
                           </span>
                        </div>
                     </div>
                  )}
               </div>
            </main>
         </div>

         {/* Mobile Overlay */}
         {sidebarOpen && (
            <div
               className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 lg:hidden"
               onClick={() => setSidebarOpen(false)}
            />
         )}
      </div>
   );
}
