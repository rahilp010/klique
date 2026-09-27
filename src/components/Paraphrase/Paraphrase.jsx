import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaTrash, FaDownload } from 'react-icons/fa';
import { IoCloudUploadOutline } from 'react-icons/io5';
import {
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
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../SEO';
import { callGeminiApi, toolPrompts } from './AI';
import { MdSummarize } from 'react-icons/md';
import { TbTextGrammar } from 'react-icons/tb';
import { FiSend, FiCopy, FiCheck, FiSettings, FiUpload } from 'react-icons/fi';
import { ColumnLines } from '@/components/ui/download-with-columnlines-utils/columnlines';
import { Input, InputNumber } from '@/components/ui/CustomControl';
import Navbar from '../Navbar';

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
   const [showSettings, setShowSettings] = useState(false);
   const [copied, setCopied] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [showToolPicker, setShowToolPicker] = useState(false);
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
         desc: 'Summarize content',
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
      Paraphrase: 'Paraphrase the following text accurately.',
      GrammerChecker:
         'Check the following text for grammar errors and provide corrections.',
      Summarizer: 'Summarize the following text accurately.',
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
      // Auto-collapse sidebar on smaller screens
      if (window.innerWidth < 1024) setSidebarExpanded(false);
   }, []);

   useEffect(() => {
      localStorage.setItem('ai_history', JSON.stringify(history));
   }, [history]);

   function showNotification(message, type = 'success', duration = 2500) {
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
      [prompt, isGenerating],
   );

   const filteredTools = useMemo(
      () =>
         tools.filter((tool) =>
            tool.name.toLowerCase().includes(searchQuery.toLowerCase()),
         ),
      [searchQuery],
   );

   function handlePromptChange(e) {
      const value = e.target.value;
      setPrompt(value);
      if (value.trim().toLowerCase() === '\\tools') {
         setSearchQuery('');
         setShowToolPicker(true);
      } else if (!value.trim().toLowerCase().startsWith('\\tools')) {
         setShowToolPicker(false);
      }
   }

   function selectTool(toolName) {
      setActiveTool(toolName);
      setPrompt('');
      setSearchQuery('');
      setShowToolPicker(false);
      showNotification(`${toolName} selected`);
   }

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

      try {
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

         const aiText = await callGeminiApi(fullPrompt);

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

         showNotification('Content generated successfully!');
      } catch (err) {
         console.error(err);
         showNotification('Failed to generate content', 'error');
      } finally {
         setIsGenerating(false);
      }
   }

   function handleCopy() {
      if (!result) return;
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showNotification('Copied to clipboard');
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
      element.download = `${(queryName || 'ai-output').replace(/\s+/g, '-')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      showNotification('Downloaded successfully');
   }

   function handleUpload(e) {
      const file = e.target.files[0];
      if (file) {
         const reader = new FileReader();
         reader.onload = (ev) => setPrompt(ev.target.result);
         reader.readAsText(file);
         showNotification('File uploaded');
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
            w-full px-4 py-2.5 
            bg-[#18181b] border border-zinc-800 text-zinc-300 rounded-lg
            focus:ring-1 focus:ring-zinc-600 focus:outline-none 
            appearance-none cursor-pointer text-sm
            transition-colors
            ${className}
         `}>
            {placeholder && <option value="">{placeholder}</option>}
            {children}
         </select>
         <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <path
               fillRule="evenodd"
               d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"
               clipRule="evenodd"
            />
         </svg>
      </div>
   );

   return (
      <ColumnLines
         columnWidth={80}
         columnCount={16}
         radialFadeStart={15}
         radialFadeEnd={90}
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-auto">
         <SEO
            title="AI Writer & Paraphrasing Tool | Rephrase Text | Klique"
            description="Rephrase sentences, improve articles, fix grammar, and write creative copy with our free AI writer and paraphrase tool powered by advanced AI."
            keywords="ai writer, paraphrasing tool, article rewriter, rephrase sentences, content generator, ai copywriter, klique ai writer, grammar checker"
            canonicalUrl="https://klique.netlify.app/aiwriter"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'SoftwareApplication',
               name: 'AI Writer Studio',
               operatingSystem: 'All',
               applicationCategory: 'UtilitiesApplication',
            }}
         />

         <div className="w-full sticky top-0 z-30 bg-[#16161b]  transition-all duration-300">
            <Navbar />
         </div>

         {/* Toast Notification */}
         <AnimatePresence>
            {toast.visible && (
               <motion.div
                  initial={{ opacity: 0, y: -20, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: -20, x: '-50%' }}
                  className="fixed top-6 left-1/2 z-[60]">
                  <div
                     className={`px-4 py-3 rounded-full shadow-lg flex items-center gap-3 border bg-[#18181b] backdrop-blur-md ${
                        toast.type === 'error'
                           ? 'border-red-500/50 text-red-400'
                           : 'border-green-500/50 text-green-400'
                     }`}>
                     {toast.type === 'error' ? (
                        <FiCheck className="w-4 h-4 hidden" />
                     ) : (
                        <FiCheck className="w-4 h-4" />
                     )}
                     <p className="text-sm font-medium pr-2">{toast.message}</p>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         <div className="min-h-[100dvh] ml-10">
            {/* Main Content Area */}
            <main className="min-h-[100dvh] overflow-y-auto customScrollbar p-4 pt-10 sm:p-8 lg:p-10 relative">
               <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 pb-10">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                     <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-1">
                        <h1 className="text-zinc-500 text-sm sm:text-base font-light text-mono tracking-wider">
                           AI Writing Studio
                        </h1>
                        <h1 className="text-3xl sm:text-4xl font-medium text-zinc-100 tracking-tight">
                           {activeTool}
                        </h1>
                        {/* <p className="text-zinc-500 text-sm sm:text-base font-medium">
                           {tools.find((t) => t.name === activeTool)?.desc ||
                              'AI writing assistant'}
                        </p> */}
                     </motion.div>

                     <div className="flex items-center gap-2">
                        <label
                           className="p-2 rounded-lg bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer tooltip-trigger"
                           title="Upload prompt file">
                           <input
                              type="file"
                              accept=".txt"
                              onChange={handleUpload}
                              className="hidden"
                           />
                           <FiUpload size={18} />
                        </label>
                        <button
                           onClick={() => setShowSettings(!showSettings)}
                           className={`p-2 rounded-lg border transition-colors ${showSettings ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'}`}
                           title="Generation Settings">
                           <FiSettings size={18} />
                        </button>
                     </div>
                  </div>

                  {/* Tool command hint */}
                  <div className="flex items-center justify-between gap-3 -mt-3">
                     <button
                        type="button"
                        onClick={() => {
                           setPrompt('\\tools');
                           setSearchQuery('');
                           setShowToolPicker(true);
                        }}
                        className="group flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                        <span>Switch tools anytime</span>
                        <kbd className="px-2 py-1 rounded-md border border-zinc-800 bg-[#121214] text-zinc-400 font-mono group-hover:border-zinc-700 transition-colors">
                           \tools
                        </kbd>
                     </button>
                     <span className="hidden sm:block text-xs text-zinc-600">
                        Type{' '}
                        <span className="font-mono text-zinc-500">\tools</span>{' '}
                        in the editor to browse all tools
                     </span>
                  </div>

                  {/* Settings Panel */}
                  <AnimatePresence>
                     {showSettings && (
                        <motion.div
                           initial={{ opacity: 0, height: 0, y: -10 }}
                           animate={{ opacity: 1, height: 'auto', y: 0 }}
                           exit={{ opacity: 0, height: 0, y: -10 }}
                           className="overflow-hidden">
                           <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-5 mb-2">
                              <h3 className="text-sm font-medium text-zinc-400 mb-4">
                                 Configuration
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                                          onChange={(e) =>
                                             setTone(e.target.value)
                                          }
                                          placeholder="Select Tone">
                                          {[
                                             'Neutral',
                                             'Professional',
                                             'Casual',
                                             'Friendly',
                                             'Formal',
                                          ].map((t) => (
                                             <option key={t}>{t}</option>
                                          ))}
                                       </Select>
                                    )}
                                 {activeTool === 'Paraphrase' && (
                                    <Select
                                       value={tone}
                                       onChange={(e) => setTone(e.target.value)}
                                       placeholder="Select Tone">
                                       {toneOptionsParaphrase.map((t) => (
                                          <option key={t.value} value={t.value}>
                                             {t.label}
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
                                          ].map((l) => (
                                             <option key={l}>{l}</option>
                                          ))}
                                       </Select>
                                    )}
                                 {(activeTool === 'Article' ||
                                    activeTool === 'Essay') && (
                                    <div className="relative">
                                       <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm pointer-events-none">
                                          Words:
                                       </span>
                                       <input
                                          type="number"
                                          min={0}
                                          max={2000}
                                          value={length}
                                          onChange={(e) =>
                                             setLength(Number(e.target.value))
                                          }
                                          className="w-full pl-16 pr-4 py-2.5 bg-[#18181b] border border-zinc-800 text-zinc-300 rounded-lg focus:ring-1 focus:ring-zinc-600 focus:outline-none transition-colors text-sm"
                                       />
                                    </div>
                                 )}
                                 <Select
                                    value={selectedTemplate || ''}
                                    onChange={(e) => {
                                       const template = templates.find(
                                          (t) => t.id === e.target.value,
                                       );
                                       if (template) applyTemplate(template);
                                    }}
                                    placeholder="Quick Template">
                                    {templates.map((t) => (
                                       <option key={t.id} value={t.id}>
                                          {t.title}
                                       </option>
                                    ))}
                                 </Select>
                              </div>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>

                  {/* Command Tool Picker */}
                  <AnimatePresence>
                     {showToolPicker && (
                        <motion.div
                           initial={{ opacity: 0, y: -8, scale: 0.98 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           exit={{ opacity: 0, y: -8, scale: 0.98 }}
                           transition={{ duration: 0.16 }}
                           className="relative z-30 w-full">
                           <div className="rounded-2xl border border-zinc-800/80 bg-[#101012]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-zinc-800/70">
                                 <div>
                                    <p className="text-sm font-medium text-zinc-200">
                                       Choose a tool
                                    </p>
                                    <p className="text-xs text-zinc-500 mt-0.5">
                                       Select a tool to continue with the same
                                       editor.
                                    </p>
                                 </div>
                                 <button
                                    type="button"
                                    onClick={() => {
                                       setShowToolPicker(false);
                                       setPrompt('');
                                    }}
                                    className="text-xs text-zinc-500 hover:text-zinc-200 px-2 py-1 rounded-lg hover:bg-zinc-800">
                                    Esc
                                 </button>
                              </div>
                              <div className="p-3">
                                 <div className="relative mb-3">
                                    <LuSearch
                                       size={15}
                                       className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                                    />
                                    <input
                                       autoFocus
                                       value={searchQuery}
                                       onChange={(e) =>
                                          setSearchQuery(e.target.value)
                                       }
                                       placeholder="Search tools..."
                                       className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#18181b] border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700"
                                    />
                                 </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto customScrollbar pr-1">
                                    {filteredTools.map((tool) => (
                                       <button
                                          key={tool.name}
                                          type="button"
                                          onClick={() => selectTool(tool.name)}
                                          className={`flex items-center gap-3 p-3 rounded-xl text-left border transition-all ${activeTool === tool.name ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-[#141416] border-zinc-800/70 text-zinc-400 hover:bg-zinc-800/70 hover:border-zinc-700 hover:text-zinc-100'}`}>
                                          <span className="w-9 h-9 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                                             {tool.icon}
                                          </span>
                                          <span className="min-w-0">
                                             <span className="block text-sm font-medium truncate">
                                                {tool.name}
                                             </span>
                                             <span className="block text-xs text-zinc-500 truncate mt-0.5">
                                                {tool.desc}
                                             </span>
                                          </span>
                                       </button>
                                    ))}
                                 </div>
                                 {filteredTools.length === 0 && (
                                    <div className="py-8 text-center text-sm text-zinc-500">
                                       No tools found.
                                    </div>
                                 )}
                              </div>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>

                  {/* Input / Editor Box */}
                  <motion.div layout className="relative w-full z-20">
                     <AnimatePresence>
                        {isGenerating && (
                           <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-spin opacity-60 blur-[3px] -z-10"
                           />
                        )}
                     </AnimatePresence>

                     <div
                        className={`flex flex-col bg-[#0f0f11] rounded-2xl transition-all duration-300 ${isGenerating ? 'border-transparent shadow-[0_0_40px_rgba(168,85,247,0.1)]' : 'border border-zinc-800/80 shadow-2xl'}`}>
                        <textarea
                           value={prompt}
                           onChange={handlePromptChange}
                           placeholder={`What do you want to write or edit?\n\nExample: ${placeholder[activeTool]}`}
                           className="w-full min-h-[160px] sm:min-h-[200px] p-5 bg-transparent resize-y focus:outline-none text-zinc-200 placeholder:text-zinc-600 text-base leading-relaxed disabled:opacity-50 customScrollbar"
                           disabled={isGenerating}
                        />

                        <div className="flex flex-wrap items-center justify-between p-3 gap-3 border-t border-zinc-800/50 bg-[#0f0f11] rounded-b-2xl">
                           <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 pl-2">
                              <span>{prompt.length} chars</span>
                              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-zinc-700"></span>
                              <span className="hidden sm:inline-block">
                                 {prompt.trim()
                                    ? prompt.trim().split(/\s+/).length
                                    : 0}{' '}
                                 words
                              </span>

                              {prompt.length > 0 && (
                                 <button
                                    onClick={handleClear}
                                    disabled={isGenerating}
                                    className="text-zinc-500 hover:text-red-400 transition-colors ml-2">
                                    <FaTrash size={12} />
                                 </button>
                              )}
                           </div>

                           <button
                              ref={generateButtonRef}
                              onClick={generate}
                              disabled={!canGenerate}
                              className="flex items-center gap-2 px-5 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] disabled:bg-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed text-zinc-200 rounded-xl text-sm font-medium transition-all group ml-auto">
                              {isGenerating ? (
                                 <div className="flex items-center gap-2">
                                    <PiSparkleLight
                                       className="animate-spin text-purple-400"
                                       size={16}
                                    />
                                    <span>Processing...</span>
                                 </div>
                              ) : (
                                 <>
                                    <FiSend
                                       size={16}
                                       className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                                    />
                                    <span>Generate</span>
                                 </>
                              )}
                           </button>
                        </div>
                     </div>
                  </motion.div>

                  {/* Output / Result Box */}
                  <AnimatePresence>
                     {(result || isGenerating) && (
                        <motion.div
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="w-full relative mt-4">
                           <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-1 pb-4 shadow-xl flex flex-col">
                              <div className="flex items-center justify-between p-4 mb-1 border-b border-zinc-800/50">
                                 <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                    <PiSparkleLight
                                       className="text-purple-400"
                                       size={18}
                                    />
                                    Generated Output
                                 </h3>
                                 <div className="flex items-center gap-2">
                                    <button
                                       onClick={handleCopy}
                                       disabled={!result || isGenerating}
                                       className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800/50 text-zinc-300 text-sm font-medium transition-colors">
                                       {copied ? (
                                          <FiCheck className="text-green-400" />
                                       ) : (
                                          <FiCopy />
                                       )}
                                       <span className="hidden sm:inline-block">
                                          {copied ? 'Copied' : 'Copy'}
                                       </span>
                                    </button>
                                    <button
                                       onClick={handleDownload}
                                       disabled={!result || isGenerating}
                                       className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 disabled:opacity-50 disabled:hover:bg-zinc-800/50 text-zinc-300 text-sm font-medium transition-colors">
                                       <FaDownload size={13} />
                                       <span className="hidden sm:inline-block">
                                          Save
                                       </span>
                                    </button>
                                 </div>
                              </div>

                              <div className="px-4 pt-4">
                                 {isGenerating ? (
                                    <div className="w-full min-h-[200px] flex flex-col items-center justify-center gap-4 opacity-70">
                                       <PiSparkleLight
                                          className="text-purple-400 animate-pulse"
                                          size={32}
                                       />
                                       <div className="space-y-2 w-full max-w-sm">
                                          <div className="h-2 bg-zinc-800 rounded-full w-full animate-pulse"></div>
                                          <div className="h-2 bg-zinc-800 rounded-full w-4/5 animate-pulse"></div>
                                          <div className="h-2 bg-zinc-800 rounded-full w-5/6 animate-pulse"></div>
                                       </div>
                                    </div>
                                 ) : (
                                    <textarea
                                       value={result}
                                       onChange={(e) =>
                                          setResult(e.target.value)
                                       }
                                       className="w-full min-h-[250px] p-4 rounded-xl bg-[#0f0f11] border border-zinc-800/60 text-zinc-200 text-base leading-relaxed focus:outline-none focus:border-zinc-600 resize-y customScrollbar"
                                    />
                                 )}
                              </div>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </main>
         </div>

         <style>{`
            @keyframes gradient-spin {
               0% { background-position: 0% 50%; }
               50% { background-position: 100% 50%; }
               100% { background-position: 0% 50%; }
            }
            .animate-gradient-spin {
               background-size: 200% 200%;
               animation: gradient-spin 2.5s ease-in-out infinite;
            }
         `}</style>
      </ColumnLines>
   );
}
