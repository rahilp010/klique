/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { FaBars } from 'react-icons/fa6';
import { GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';
import Navbar from '../Navbar';
import SEO from '../SEO';
import { IoCopyOutline } from 'react-icons/io5';
import { ColumnLines } from '@/components/ui/download-with-columnlines-utils/columnlines';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FiCheck, FiSend } from 'react-icons/fi';
import { PiSparkleLight } from 'react-icons/pi';
import { SelectPicker } from '../ui/CustomControl';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const tones = [
   { label: 'Casual', value: 'casual' },
   { label: 'Creative', value: 'creative' },
   { label: 'Formal', value: 'formal' },
   { label: 'Professional', value: 'professional' },
   { label: 'Convincing', value: 'convincing' },
   { label: 'Friendly', value: 'friendly' },
   { label: 'Empathetic', value: 'empathetic' },
   { label: 'Academic', value: 'academic' },
];

const platforms = [
   { label: 'Instagram', value: 'instagram' },
   { label: 'Threads', value: 'threads' },
   { label: 'YouTube', value: 'youtube' },
   { label: 'Facebook', value: 'facebook' },
   { label: 'X', value: 'x' },
   { label: 'Snapchat', value: 'snapchat' },
   { label: 'Reddit', value: 'reddit' },
   { label: 'Pinterest', value: 'pinterest' },
   { label: 'TikTok', value: 'tiktok' },
];

const categories = [
   { label: 'Random', value: 'random' },
   { label: 'Luxury', value: 'luxury' },
   { label: 'Sports', value: 'sports' },
   { label: 'Music', value: 'music' },
   { label: 'Movies', value: 'movies' },
   { label: 'Games', value: 'games' },
   { label: 'Food', value: 'food' },
   { label: 'Travel', value: 'travel' },
   { label: 'Fashion', value: 'fashion' },
   { label: 'Tech', value: 'tech' },
];

const adjectives = [
   'epic',
   'silent',
   'crazy',
   'sparkling',
   'vivid',
   'lucky',
   'shadow',
   'stellar',
   'wild',
   'electric',
];
const nouns = [
   'ninja',
   'phoenix',
   'storm',
   'wizard',
   'vibe',
   'tiger',
   'panda',
   'drifter',
   'robot',
   'warrior',
];

export default function UsernameGenerator() {
   const [keyword, setKeyword] = useState('');
   const [tone, setTone] = useState('creative');
   const [platform, setPlatform] = useState('');
   const [category, setCategory] = useState('');
   const [usernames, setUsernames] = useState([]);
   const [loading, setLoading] = useState(false);
   const [toast, setToast] = useState({
      visible: false,
      message: '',
      type: '',
   });

   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [isMobile, setIsMobile] = useState(false);
   const [copiedIndex, setCopiedIndex] = useState(null);

   useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
   }, []);

   const showNotification = (msg, type = 'success', duration = 2500) => {
      setToast({ visible: true, message: msg, type });
      setTimeout(() => setToast((p) => ({ ...p, visible: false })), duration);
   };

   const generateLocal = () => {
      const results = Array.from({ length: 12 }, () => {
         const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
         const noun = nouns[Math.floor(Math.random() * nouns.length)];
         const num = Math.floor(Math.random() * 999);
         return `${adj}${keyword || noun}${num}`.toLowerCase();
      });
      setUsernames(results);
      showNotification('Random usernames generated!');
   };

   const generateAI = async () => {
      if (!GEMINI_API_KEY) {
         showNotification('Missing Gemini API key!', 'error');
         return;
      }

      try {
         setLoading(true);
         setUsernames([]);
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
You are a social media branding expert who creates short, catchy, and platform-optimized usernames.
Generate 15 unique usernames suitable for the following context:
Platform: ${platform || 'Any'}
Tone/Style: ${tone}
Category/Theme: ${category || 'general'}
Keyword (optional): ${keyword || 'none'}

Rules:
- Adapt tone dynamically (e.g. funny -> playful, professional -> clean)
- Keep under 15 characters, no spaces/emojis.
- Return usernames separated by new lines only — no markdown.
`,
                           },
                        ],
                     },
                  ],
               }),
            },
         );

         if (!res.ok) throw new Error('Gemini API request failed');
         const data = await res.json();
         const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
         const parsed = text
            .split('\n')
            .map((u) => u.replace(/[-*•]/g, '').trim())
            .filter(Boolean);

         setUsernames(parsed.length ? parsed : ['No usernames generated 😢']);
         showNotification('AI usernames generated!');
      } catch (err) {
         console.error(err);
         showNotification('Failed to generate via AI', 'error');
      } finally {
         setLoading(false);
      }
   };

   const handleCopy = (name, index) => {
      navigator.clipboard.writeText(name);
      setCopiedIndex(index);
      showNotification(`Copied "${name}"`);
      setTimeout(() => setCopiedIndex(null), 1500);
   };

   return (
      <ColumnLines
         columnWidth={80}
         columnCount={34}
         radialFadeStart={15}
         radialFadeEnd={90}
         className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#09090b] px-3 py-6 font-sans text-zinc-100 customScrollbar sm:px-5 sm:py-8 md:px-10">
         <SEO
            title="Aesthetic Username Generator | Custom Gamertags & Handles | Klique"
            description="Create cool, unique, and aesthetic usernames for Instagram, TikTok, YouTube, Reddit, Roblox, and gaming. Find the perfect handle instantly using AI."
            keywords="username generator, cool usernames, gamer tag generator, aesthetic handles, instagram username generator, klique, tiktok username generator"
            canonicalUrl="https://klique.netlify.app/username"
         />

         {/* Toast Notification */}
         <AnimatePresence>
            {toast.visible && (
               <motion.div
                  initial={{ opacity: 0, y: -20, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: -20, x: '-50%' }}
                  className="fixed left-1/2 top-4 z-[10000] w-[calc(100%-24px)] max-w-md">
                  <div
                     className={`flex items-center gap-3 rounded-full border bg-[#18181b] px-4 py-3 shadow-lg backdrop-blur-md ${
                        toast.type === 'error'
                           ? 'border-red-500/50 text-red-400'
                           : 'border-green-500/50 text-green-400'
                     }`}>
                     {toast.type === 'error' ? (
                        <FiCheck className="w-4 h-4 hidden" />
                     ) : (
                        <FiCheck className="w-4 h-4" />
                     )}
                     <p className="min-w-0 break-words pr-2 text-xs font-medium sm:text-sm">
                        {toast.message}
                     </p>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         <div className="relative z-[100] w-full">
            <Navbar />
         </div>

         <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-0 pb-32 pt-24 sm:px-2 sm:pb-24 sm:pt-28 lg:pl-20">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="relative z-20 mb-7 min-w-0 text-center sm:mb-10">
               <h1 className="mb-2 text-2xl font-medium tracking-tight text-zinc-100 sm:mb-3 sm:text-4xl">
                  Username Generator
               </h1>
               <p className="px-2 text-xs font-medium leading-5 text-zinc-500 sm:text-base">
                  Create creative, cool, or AI-powered usernames instantly
               </p>
            </motion.div>

            {/* Controls */}
            <div className="relative z-20 mx-auto w-full max-w-4xl min-w-0 overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#121214] p-4 shadow-xl sm:p-6">
               <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-3 sm:gap-4">
                  <SelectPicker
                     data={platforms}
                     value={platform?.value}
                     onChange={(val, item) => item && setPlatform(item)}
                     cleanable={false}
                     searchable={true}
                     placeholder="Select Platform"
                     menuMaxHeight={360}
                     className="w-full min-w-0  !text-zinc-200"
                  />

                  <SelectPicker
                     data={categories}
                     value={category?.value}
                     onChange={(val, item) => item && setCategory(item)}
                     cleanable={false}
                     searchable={true}
                     placeholder="Select Category"
                     menuMaxHeight={360}
                     className="w-full min-w-0  !text-zinc-200"
                  />

                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                     <input
                        type="text"
                        placeholder="Enter Keywords"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="min-w-0 w-full rounded-xl border border-zinc-800 bg-[#18181b] py-3 pl-10 pr-3.5 text-sm font-medium text-zinc-200 placeholder-zinc-500 focus:border-zinc-600 focus:outline-none"
                     />

                     
                  </div>
               </div>

               <div className="mb-5 sm:mb-6">
                  <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                     Select Tone
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
                     {tones.map((option) => (
                        <button
                           key={option.value}
                           onClick={() => setTone(option.value)}
                           className={`min-w-0 w-full rounded-lg px-3 py-2 text-xs font-medium transition-all sm:w-auto sm:px-4 sm:text-sm ${
                              option.value === tone
                                 ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                                 : 'bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
                           }`}>
                           {option.label}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="flex flex-col gap-2.5 border-t border-zinc-800/50 pt-4 sm:flex-row sm:justify-end sm:gap-3">
                  <button
                     onClick={generateLocal}
                     disabled={loading}
                     className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-300 transition-all hover:border-cyan-400/50 hover:bg-cyan-500/20 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-5 sm:py-2.5">
                     <GiPerspectiveDiceSixFacesRandom size={16} /> Random Idea
                  </button>
                  <button
                     onClick={generateAI}
                     disabled={loading}
                     className="group flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/15 px-4 py-3 text-sm font-medium text-purple-300 transition-all hover:border-purple-400/50 hover:bg-purple-500/25 hover:text-purple-200 disabled:cursor-not-allowed disabled:bg-zinc-900 disabled:text-zinc-600 sm:w-auto sm:px-5 sm:py-2.5">
                     {loading ? (
                        <>
                           <PiSparkleLight
                              className="animate-spin text-purple-400"
                              size={16}
                           />{' '}
                           Generating...
                        </>
                     ) : (
                        <>
                           <FiSend
                              size={16}
                              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                           />{' '}
                           Generate AI
                        </>
                     )}
                  </button>
               </div>
            </div>

            {/* Results */}
            <AnimatePresence>
               {(usernames.length > 0 || loading) && (
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="relative z-20 mx-auto mt-6 w-full max-w-4xl min-w-0 sm:mt-8">
                     <div className="relative w-full min-w-0">
                        <AnimatePresence>
                           {loading && (
                              <motion.div
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 exit={{ opacity: 0 }}
                                 className="absolute -inset-[1px] -z-10 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80 blur-[2px] animate-gradient-spin"
                              />
                           )}
                        </AnimatePresence>

                        <div
                           className={`w-full min-w-0 overflow-hidden rounded-2xl bg-[#121214] p-4 transition-all duration-300 sm:p-6 lg:p-8 ${
                              loading
                                 ? 'border border-transparent shadow-[0_0_40px_rgba(168,85,247,0.15)]'
                                 : 'border border-zinc-800/80 shadow-xl'
                           }`}>
                           <div className="mb-5 flex min-w-0 items-center justify-between gap-3 border-b border-zinc-800/50 pb-4 sm:mb-6">
                              <h3 className="flex min-w-0 items-center gap-2 text-base font-medium text-zinc-100 sm:text-lg">
                                 <PiSparkleLight
                                    className="text-purple-400"
                                    size={20}
                                 />
                                 Generated Handles
                              </h3>
                           </div>

                           <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-3 md:grid-cols-3">
                              {loading
                                 ? [...Array(12)].map((_, i) => (
                                      <div
                                         key={i}
                                         className="h-11 w-full min-w-0 rounded-xl border border-zinc-800 bg-zinc-800/50 animate-pulse sm:h-12"></div>
                                   ))
                                 : usernames.map((name, i) => (
                                      <div
                                         key={i}
                                         className="group relative flex min-w-0 w-full cursor-pointer items-center justify-between overflow-hidden rounded-xl border border-zinc-800 bg-[#18181b] px-3 py-3 transition-colors hover:border-zinc-700 sm:px-4"
                                         onClick={() => handleCopy(name, i)}>
                                         <span className="min-w-0 max-w-full truncate pr-6 text-xs font-medium text-zinc-300 sm:text-sm">
                                            {name}
                                         </span>
                                         <div className="absolute right-2.5 shrink-0 text-zinc-500 transition-colors group-hover:text-zinc-300 sm:right-3">
                                            {copiedIndex === i ? (
                                               <FiCheck className="text-green-400" />
                                            ) : (
                                               <IoCopyOutline />
                                            )}
                                         </div>
                                      </div>
                                   ))}
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
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

         html,
         body {
            max-width: 100%;
            overflow-x: hidden;
         }

         button,
         input,
         select,
         textarea {
            touch-action: manipulation;
         }

         * {
            min-width: 0;
         }
      `}</style>
      </ColumnLines>
   );
}
