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
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-4 py-20 md:px-10">
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

         <div className="w-full sticky top-0 z-30 bg-[#16161b] transition-all duration-300">
            <Navbar />
         </div>

         <div className="w-full max-w-6xl mx-auto pl-0 lg:pl-20 px-3 sm:px-6 relative z-20">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center mb-10 relative z-20">
               <h1 className="text-3xl sm:text-4xl font-medium text-zinc-100 tracking-tight mb-3">
                  Username Generator
               </h1>
               <p className="text-zinc-500 text-sm sm:text-base font-medium">
                  Create creative, cool, or AI-powered usernames instantly
               </p>
            </motion.div>

            {/* Controls */}
            <div className="max-w-4xl mx-auto bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative z-20">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
               <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-4 py-3 bg-[#18181b] border border-zinc-800 text-zinc-300 text-sm font-medium rounded-xl focus:outline-none focus:border-zinc-600 appearance-none cursor-pointer">
                  <option value="">Select Platform</option>
                  {platforms.map((p) => (
                     <option key={p.value} value={p.value}>
                        {p.label}
                     </option>
                  ))}
               </select>

               <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-[#18181b] border border-zinc-800 text-zinc-300 text-sm font-medium rounded-xl focus:outline-none focus:border-zinc-600 appearance-none cursor-pointer">
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                     <option key={c.value} value={c.value}>
                        {c.label}
                     </option>
                  ))}
               </select>

               <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                     type="text"
                     placeholder="Enter Keywords"
                     value={keyword}
                     onChange={(e) => setKeyword(e.target.value)}
                     className="w-full pl-10 pr-4 py-3 bg-[#18181b] border border-zinc-800 text-zinc-200 text-sm font-medium rounded-xl focus:outline-none focus:border-zinc-600 placeholder-zinc-500"
                  />
               </div>
            </div>

            <div className="mb-6">
               <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                  Select Tone
               </h3>
               <div className="flex flex-wrap gap-2.5">
                  {tones.map((option) => (
                     <button
                        key={option.value}
                        onClick={() => setTone(option.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                           option.value === tone
                              ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                              : 'bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80'
                        }`}>
                        {option.label}
                     </button>
                  ))}
               </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-zinc-800/50">
               <button
                  onClick={generateLocal}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#18181b] border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200 text-zinc-400 rounded-xl text-sm font-medium transition-all">
                  <GiPerspectiveDiceSixFacesRandom size={16} /> Random Idea
               </button>
               <button
                  onClick={generateAI}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] disabled:bg-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed text-zinc-200 rounded-xl text-sm font-medium transition-all group">
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
                  className="max-w-4xl mx-auto mt-8 relative z-20">
                  <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 lg:p-8 shadow-xl">
                     <div className="flex items-center justify-between mb-6 border-b border-zinc-800/50 pb-4">
                        <h3 className="text-lg font-medium text-zinc-100 flex items-center gap-2">
                           <PiSparkleLight
                              className="text-purple-400"
                              size={20}
                           />
                           Generated Handles
                        </h3>
                     </div>

                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {loading
                           ? [...Array(12)].map((_, i) => (
                                <div
                                   key={i}
                                   className="w-full h-12 rounded-xl bg-zinc-800/50 animate-pulse border border-zinc-800"></div>
                             ))
                           : usernames.map((name, i) => (
                                <div
                                   key={i}
                                   className="group relative flex items-center justify-between px-4 py-3 rounded-xl bg-[#18181b] border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                                   onClick={() => handleCopy(name, i)}>
                                   <span className="text-sm font-medium text-zinc-300 truncate pr-6">
                                      {name}
                                   </span>
                                   <div className="absolute right-3 text-zinc-500 group-hover:text-zinc-300 transition-colors">
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
               </motion.div>
            )}
         </AnimatePresence>
         </div>
      </ColumnLines>
   );
}
