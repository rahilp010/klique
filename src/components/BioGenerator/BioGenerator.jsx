import { useEffect, useState, useRef } from 'react';
import { PiSparkleLight } from 'react-icons/pi';
import {
   FiSend,
   FiCopy,
   FiCheck,
   FiCode,
   FiCamera,
   FiBriefcase,
   FiUser,
} from 'react-icons/fi';
import Navbar from '../Navbar';
import SEO from '../SEO';
import { FaBars } from 'react-icons/fa';
import { motion, AnimatePresence } from 'motion/react';
import { ColumnLines } from '@/components/ui/download-with-columnlines-utils/columnlines';

export default function BioGenerator() {
   const [description, setDescription] = useState('');
   const [bio, setBio] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [copiedIndex, setCopiedIndex] = useState(null);
   const [toast, setToast] = useState({
      message: '',
      type: '',
      visible: false,
   });
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [isMobile, setIsMobile] = useState(false);
   const [tone, setTone] = useState('creative');
   const textareaRef = useRef(null);

   const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

   useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
   }, []);

   const showNotification = (message, type = 'success', duration = 2500) => {
      setToast({ message, type, visible: true });
      setTimeout(
         () => setToast((prev) => ({ ...prev, visible: false })),
         duration,
      );
   };

   const generateBio = async (desc, selectedTone) => {
      try {
         const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  contents: [
                     {
                        parts: [
                           {
                              text: `
You are a professional Instagram bio writer.
Generate 6 unique, catchy Instagram bios for:
Description: "${desc}"
Tone: "${selectedTone}"

Each bio should:
- Match the tone
- Stay under 150 characters
- Use emojis if they fit the tone
- Be distinct
Separate bios with ---
`,
                           },
                        ],
                     },
                  ],
               }),
            },
         );

         if (!res.ok) throw new Error('Failed to fetch bio');
         const data = await res.json();
         const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
         if (!text) throw new Error('No bio generated');

         const bios = text
            .split(/---+/)
            .map((b) => b.trim())
            .filter((b) => b.length > 0);

         showNotification('✅ Bios generated successfully!');
         return bios.length ? bios : [text];
      } catch (err) {
         console.error('Gemini API error:', err);
         showNotification(err.message || 'Error generating bio', 'error');
         return [];
      }
   };

   const handleSubmit = async () => {
      if (description.length < 10)
         return showNotification('Enter at least 10 characters', 'error');
      if (description.length > 300)
         return showNotification('Max 300 characters allowed', 'error');

      setIsLoading(true);
      setBio([]);

      const result = await generateBio(description, tone);
      setBio(result);
      setIsLoading(false);
   };

   const handleCopy = (text, index) => {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      showNotification('Bio copied!');
      setTimeout(() => setCopiedIndex(null), 1500);
   };

   const handleSuggestionClick = (text) => {
      setDescription(text);
      if (textareaRef.current) {
         textareaRef.current.focus();
      }
   };

   const toneOptions = [
      { label: '😂 Funny', value: 'funny' },
      { label: '😐 Serious', value: 'serious' },
      { label: '🎨 Creative', value: 'creative' },
      { label: '🌟 Inspirational', value: 'inspirational' },
      { label: '💪 Motivational', value: 'motivational' },
      { label: '😄 Humorous', value: 'humorous' },
      { label: '😜 Playful', value: 'playful' },
      { label: '😊 Charming', value: 'charming' },
      { label: '✨ Charismatic', value: 'charismatic' },
      { label: '😢 Sad', value: 'sad' },
   ];

   const suggestions = [
      {
         icon: <FiCode />,
         label: 'Tech & Code',
         prompt:
            'Software engineer building cool SaaS products. Coffee addict and open source contributor.',
      },
      {
         icon: <FiCamera />,
         label: 'Photography',
         prompt:
            'Capturing moments around the world. Landscape and portrait photographer based in NYC.',
      },
      {
         icon: <FiBriefcase />,
         label: 'Entrepreneur',
         prompt:
            'Founder & CEO. Helping businesses scale with AI. Always learning and building.',
      },
      {
         icon: <FiUser />,
         label: 'Fitness',
         prompt:
            'Personal trainer and nutrition coach. Helping you build your best self every day.',
      },
   ];

   return (
      <ColumnLines
         columnWidth={80}
         columnCount={14}
         radialFadeStart={15}
         radialFadeEnd={90}
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-auto">
         <SEO
            title="AI Bio Generator | Creative Social Media Bios | Klique"
            description="Create professional, funny, or creative social media bios for Instagram, TikTok, Twitter, and LinkedIn using advanced AI. Grab attention and optimize your profile."
            keywords="ai bio generator, bio creator, social media bio writer, instagram bio generator, tiktok bio, linkedin bio, klique bio, professional bio generator"
            canonicalUrl="https://klique.netlify.app/bio"
         />

         {/* Toast Notification */}
         <AnimatePresence>
            {toast.visible && (
               <motion.div
                  initial={{ opacity: 0, y: -20, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: -20, x: '-50%' }}
                  className="fixed top-6 left-1/2 z-50">
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

         <div className="w-full sticky top-0 z-30 bg-[#16161b] border-b border-white/10 transition-all duration-300">
            <Navbar />
         </div>

         {/* Main Centered Chat-like Interface */}
         <div className="relative z-10 flex flex-col items-center justify-center min-h-[100dvh] w-full px-4 py-20">
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center mb-10">
               <h1 className="text-3xl sm:text-4xl font-medium text-zinc-100 tracking-tight mb-3">
                  Generate creative bios
               </h1>
               <p className="text-zinc-500 text-sm sm:text-base font-medium">
                  Describe yourself and pick a tone to get started
               </p>
            </motion.div>

            {/* Glowing Animated Input Container */}
            <motion.div
               layout
               className="relative w-full max-w-2xl mx-auto z-20">
               {/* Special Generating Animation Border */}
               <AnimatePresence>
                  {isLoading && (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-spin opacity-80 blur-[2px] -z-10"
                     />
                  )}
               </AnimatePresence>

               <div
                  className={`flex flex-col bg-[#0f0f11] rounded-2xl transition-all duration-300 ${isLoading ? 'border-transparent shadow-[0_0_40px_rgba(168,85,247,0.15)]' : 'border border-zinc-800/80 shadow-2xl'}`}>
                  <textarea
                     ref={textareaRef}
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     onKeyDown={(e) =>
                        e.ctrlKey && e.key === 'Enter' && handleSubmit()
                     }
                     disabled={isLoading}
                     placeholder="e.g. Travel addict 🌍 | Coffee lover ☕ | Dream chaser ✨..."
                     className="w-full min-h-[140px] p-5 bg-transparent resize-none focus:outline-none text-zinc-200 placeholder:text-zinc-600 text-base sm:text-lg leading-relaxed disabled:opacity-50"
                  />

                  {/* Input Bottom Toolbar */}
                  <div className="flex items-center justify-between p-3 border-t border-zinc-800/50 bg-[#0f0f11] rounded-b-2xl">
                     <div className="flex items-center gap-3 pl-2 text-zinc-500">
                        {/* Tone Selector */}
                        <div className="relative flex items-center">
                           <select
                              value={tone}
                              onChange={(e) => setTone(e.target.value)}
                              className="appearance-none bg-[#18181b] border border-zinc-800 text-zinc-300 text-sm font-medium rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-zinc-600 hover:bg-zinc-800 transition-colors cursor-pointer">
                              {toneOptions.map((t) => (
                                 <option key={t.value} value={t.value}>
                                    {t.label}
                                 </option>
                              ))}
                           </select>
                           <svg
                              className="absolute right-2.5 w-4 h-4 text-zinc-500 pointer-events-none"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24">
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth="2"
                                 d="M19 9l-7 7-7-7"
                              />
                           </svg>
                        </div>
                        <span className="text-xs font-medium opacity-50 hidden sm:inline-block">
                           {description.length}/300
                        </span>
                     </div>

                     <button
                        onClick={handleSubmit}
                        disabled={isLoading || !description.trim()}
                        className="flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] disabled:bg-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed text-zinc-200 rounded-lg text-sm font-medium transition-all group">
                        {isLoading ? (
                           <div className="flex items-center gap-2">
                              <PiSparkleLight
                                 className="animate-spin text-purple-400"
                                 size={16}
                              />
                              <span>Generating...</span>
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

            {/* Suggestions / Prompt Chips */}
            <AnimatePresence mode="wait">
               {!bio.length && !isLoading && (
                  <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="flex flex-wrap justify-center gap-3 mt-8 max-w-2xl">
                     {suggestions.map((suggestion, idx) => (
                        <button
                           key={idx}
                           onClick={() =>
                              handleSuggestionClick(suggestion.prompt)
                           }
                           className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800/80 bg-[#121214] hover:bg-[#1f1f22] text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-all hover:border-zinc-700">
                           {suggestion.icon}
                           {suggestion.label}
                        </button>
                     ))}
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Generated Results Area */}
            <AnimatePresence>
               {bio.length > 0 && !isLoading && (
                  <motion.div
                     initial={{ opacity: 0, height: 0, y: 20 }}
                     animate={{ opacity: 1, height: 'auto', y: 0 }}
                     className="w-full max-w-2xl mt-8 relative">
                     <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-xl">
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
                              <PiSparkleLight
                                 className="text-purple-400"
                                 size={20}
                              />
                              Your Bios
                           </h3>
                        </div>

                        <div className="grid gap-3">
                           {bio.map((text, i) => (
                              <motion.div
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: i * 0.1 }}
                                 key={i}
                                 className="relative p-5 bg-[#18181b] border border-zinc-800 rounded-xl group hover:border-zinc-700 transition-colors flex items-start justify-between gap-4">
                                 <p className="text-zinc-300 text-sm whitespace-pre-line leading-relaxed">
                                    {text}
                                 </p>
                                 <button
                                    onClick={() => handleCopy(text, i)}
                                    className="shrink-0 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors">
                                    {copiedIndex === i ? (
                                       <FiCheck
                                          className="text-green-400"
                                          size={16}
                                       />
                                    ) : (
                                       <FiCopy size={16} />
                                    )}
                                 </button>
                              </motion.div>
                           ))}
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Internal Styles for Special Animations */}
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
