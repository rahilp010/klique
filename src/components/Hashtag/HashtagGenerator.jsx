import { useEffect, useState, useRef } from 'react';
import { PiSparkleLight } from 'react-icons/pi';
import {
   FiSend,
   FiPaperclip,
   FiCommand,
   FiCopy,
   FiCheck,
   FiImage,
   FiLayout,
   FiEdit2,
} from 'react-icons/fi';
import Navbar from '../Navbar';
import SEO from '../SEO';
import { FaBars } from 'react-icons/fa';
import { motion, AnimatePresence } from 'motion/react';
import { ColumnLines } from '@/components/ui/download-with-columnlines-utils/columnlines';

export default function HashtagGenerator() {
   const [description, setDescription] = useState('');
   const [hashtags, setHashtags] = useState([]);
   const [isLoading, setIsLoading] = useState(false);
   const [isCopied, setIsCopied] = useState(false);
   const [toast, setToast] = useState({
      message: '',
      type: '',
      visible: false,
   });
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [isMobile, setIsMobile] = useState(false);
   const textareaRef = useRef(null);

   useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
   }, []);

   const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

   const showNotification = (message, type = 'success', duration = 2500) => {
      setToast({ message, type, visible: true });
      setTimeout(
         () => setToast((prev) => ({ ...prev, visible: false })),
         duration,
      );
   };

   const generateHashtags = async (desc) => {
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
                              text: `You are a social media expert.
Generate 15 short, relevant, trending hashtags based on the following description:
"${desc}"
Return only hashtags separated by spaces, no explanations.`,
                           },
                        ],
                     },
                  ],
               }),
            },
         );

         if (!res.ok) throw new Error('Failed to fetch hashtags');
         const data = await res.json();
         const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
         const tags = text.match(/#[\w]+/g)?.slice(0, 15) || [];

         if (!tags.length) throw new Error('No hashtags generated');
         showNotification('Hashtags generated successfully!');
         return tags;
      } catch (err) {
         console.error('Gemini API error:', err);
         showNotification(err.message || 'Error generating hashtags', 'error');
         return [];
      }
   };

   const handleSubmit = async () => {
      if (description.length < 10)
         return showNotification('Enter at least 10 characters', 'error');
      if (description.length > 300)
         return showNotification('Max 300 characters allowed', 'error');

      setIsLoading(true);
      setHashtags([]);

      const tags = await generateHashtags(description);
      setHashtags(tags);
      setIsLoading(false);
   };

   const handleCopy = () => {
      if (!hashtags.length) return;
      navigator.clipboard.writeText(hashtags.join(' '));
      setIsCopied(true);
      showNotification(`${hashtags.length} hashtags copied!`);
      setTimeout(() => setIsCopied(false), 2000);
   };

   const handleSuggestionClick = (text) => {
      setDescription(text);
      if (textareaRef.current) {
         textareaRef.current.focus();
      }
   };

   const suggestions = [
      {
         icon: <FiImage />,
         label: 'Travel & Nature',
         prompt:
            'A beautiful sunset over the mountains during my weekend hiking trip 🏔️🌅',
      },
      {
         icon: <FiLayout />,
         label: 'Tech Setup',
         prompt:
            'My new minimal coding workspace with mechanical keyboard and ultrawide monitor 💻⌨️',
      },
      {
         icon: <FiEdit2 />,
         label: 'Fitness Journey',
         prompt:
            'Hit a new personal record at the gym today! Consistency is key 💪🏋️‍♂️',
      },
      {
         icon: <PiSparkleLight />,
         label: 'Food & Dining',
         prompt:
            'Trying out the best aesthetic cafe in town. The matcha latte was amazing 🍵✨',
      },
   ];

   return (
      <ColumnLines
         columnWidth={80}
         columnCount={34}
         radialFadeStart={15}
         radialFadeEnd={90}
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto">
         <SEO
            title="AI Hashtag Generator | Viral Social Media Tags | Klique"
            description="Boost your social media presence with our AI Hashtag Generator. Create relevant, high-reach hashtags for Instagram, TikTok, YouTube, and Twitter instantly."
            keywords="ai hashtag generator, hashtag creator, instagram hashtags, tiktok hashtags, viral tags, klique hashtags, trending hashtags generator"
            canonicalUrl="https://klique.netlify.app/hashtaggenerator"
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
                        <FiCheck className="w-4 h-4 hidden" /> // Placeholder for spacing
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
                  Generate Trending Hashtags
               </h1>
               <p className="text-zinc-500 text-sm sm:text-base font-medium">
                  Type a description of your post to get started
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
                     placeholder="Describe your post or paste your caption here..."
                     className="w-full min-h-[140px] p-5 bg-transparent resize-none focus:outline-none text-zinc-200 placeholder:text-zinc-600 text-base sm:text-lg leading-relaxed disabled:opacity-50"
                  />

                  {/* Input Bottom Toolbar */}
                  <div className="flex items-center justify-between p-3 border-t border-zinc-800/50 bg-[#0f0f11] rounded-b-2xl">
                     <div className="flex items-center gap-2 pl-2 text-zinc-500">
                        <button
                           className="p-2 rounded-lg hover:bg-zinc-800 hover:text-zinc-300 transition-colors tooltip-trigger"
                           title="Attach media">
                           <FiPaperclip size={18} />
                        </button>
                        <button
                           className="p-2 rounded-lg hover:bg-zinc-800 hover:text-zinc-300 transition-colors tooltip-trigger"
                           title="Commands">
                           <FiCommand size={18} />
                        </button>
                        <span className="text-xs font-medium ml-2 opacity-50 hidden sm:inline-block">
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
               {!hashtags.length && !isLoading && (
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
               {hashtags.length > 0 && !isLoading && (
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
                              Your Hashtags
                           </h3>
                           <button
                              onClick={handleCopy}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors">
                              {isCopied ? (
                                 <FiCheck className="text-green-400" />
                              ) : (
                                 <FiCopy />
                              )}
                              {isCopied ? 'Copied' : 'Copy All'}
                           </button>
                        </div>

                        <div className="flex flex-wrap gap-2.5">
                           {hashtags.map((tag, i) => (
                              <motion.span
                                 initial={{ opacity: 0, scale: 0.9 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 transition={{ delay: i * 0.05 }}
                                 key={i}
                                 className="px-3.5 py-1.5 bg-[#18181b] border border-zinc-800 rounded-lg text-sm font-medium text-zinc-300 hover:border-purple-500/50 hover:text-purple-300 transition-colors cursor-default select-all">
                                 {tag}
                              </motion.span>
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
