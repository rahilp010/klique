import { useEffect, useState } from 'react';
import { PiSparkleLight } from 'react-icons/pi';
import Navbar from '../Navbar';
import { FaBars } from 'react-icons/fa';

import { Copy } from 'lucide-react';
import { GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';

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
   const [tone, setTone] = useState('');

   const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

   /** 🌐 Check mobile screen */
   useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
   }, []);

   /** 🔔 Show notification */
   const showNotification = (message, type = 'success', duration = 2500) => {
      setToast({ message, type, visible: true });
      setTimeout(() => setToast((p) => ({ ...p, visible: false })), duration);
   };

   /** 🤖 Generate bio using Gemini API */
   const generateBio = async (desc, tone) => {
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
Tone: "${tone}"

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
            }
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

         showNotification('✅ 3 Instagram bios generated!');
         return bios.length ? bios : [text];
      } catch (err) {
         console.error('Gemini API error:', err);
         showNotification(err.message || 'Error generating bio', 'error');
         return [];
      }
   };

   /** 🚀 Handle generation */
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

   /** 📋 Handle copy per bio */
   const handleCopy = (text, index) => {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      showNotification('Bio copied!');
      setTimeout(() => setCopiedIndex(null), 1500);
   };

   /** 🎨 Tone options */
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

   return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-black via-gray-900 to-black text-white">
         {/* 🧁 Toast Notification */}
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

         {/* 🌈 Main Content */}
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-h-[100dvh] overflow-auto customScrollbar">
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

            <div className="max-w-4xl mx-auto mt-16">
               <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-8">
                  {/* 🧠 Header */}
                  <div className="text-center space-y-3">
                     <h1
                        className="text-4xl text-center  sm:text-3xl md:text-5xl  font-extrabold mb-5 tracking-tight  animate-fade-in-down relative
         ">
                        Bio{' '}
                        <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                           Generator
                        </span>
                     </h1>
                     <p className="text-gray-300 text-sm sm:text-base">
                        Generate creative, catchy Instagram bios with AI ✨
                     </p>
                  </div>
                  {/* 📝 Description */}
                  <div>
                     <label className="block mb-2 font-semibold text-gray-200 text-sm sm:text-base">
                        Describe yourself
                     </label>
                     <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyDown={(e) =>
                           e.ctrlKey && e.key === 'Enter' && handleSubmit()
                        }
                        placeholder="e.g. Travel addict 🌍 | Coffee lover ☕ | Dream chaser ✨"
                        className="w-full p-4 bg-black/50 border border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm sm:text-base resize-none"
                        rows="4"
                     />
                     <div className="mt-2 text-xs text-gray-400 text-right">
                        {description.length}/300 characters
                     </div>
                  </div>
                  {/* 🎭 Tone Selection (Grid Layout) */}
                  <div className="space-y-3">
                     <label className="block font-semibold text-gray-200 text-sm sm:text-base">
                        Select Tone
                     </label>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                        {toneOptions.map((option) => (
                           <button
                              key={option.value}
                              onClick={() => setTone(option.value)}
                              className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                                 option.value === tone
                                    ? 'bg-white/20 border-2 border-white/40 text-white shadow-lg scale-105'
                                    : 'bg-white/10 border border-white/10 text-gray-300 hover:bg-white/20 hover:border-white/20'
                              }`}>
                              <span>{option.label}</span>
                           </button>
                        ))}
                     </div>
                  </div>
                  {/* ⚡ Generate Button */}
                  <button
                     onClick={handleSubmit}
                     disabled={isLoading}
                     className="w-full py-4 rounded-2xl font-semibold text-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10
                     border-2 border-white/50 hover:from-gray-900/70 hover:to-black/70 hover:border-white/50 
                     transition-all hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed">
                     {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
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
                        </div>
                     ) : (
                        <div className="flex items-center justify-center gap-3">
                           <PiSparkleLight size={22} />
                           <span>Generate Bio</span>
                        </div>
                     )}
                  </button>
                  {/* 🧾 Result Section */}
                  <div className="flex flex-col gap-3">
                     {isLoading ? (
                        [...Array(3)].map((_, i) => (
                           <div
                              key={i}
                              className="w-full h-7 bg-white/10 rounded-full animate-shimmer"
                           />
                        ))
                     ) : bio.length ? (
                        bio.map((text, i) => (
                           <div
                              key={i}
                              className={`w-full relative bg-gradient-to-r from-purple-500/10 to-pink-500/10 
            border border-white/20 rounded-xl p-4 sm:p-5 text-sm sm:text-base 
            text-gray-100 leading-relaxed whitespace-pre-line transition-all duration-200 
            shadow-lg shadow-black/20 flex items-center justify-between group ${
               copiedIndex === i
                  ? 'ring-2 ring-white/30 scale-[1.02]'
                  : 'hover:scale-[1.01]'
            }`}>
                              <span className="pr-10">{text}</span>

                              {/* Copy Button */}
                              <button
                                 onClick={handleCopy}
                                 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white 
               bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all">
                                 <Copy size={18} />
                              </button>
                           </div>
                        ))
                     ) : (
                        <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-white/70 animate-fade-in">
                           <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 opacity-80 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
                              <GiPerspectiveDiceSixFacesRandom className="text-3xl" />
                           </div>
                           <h3 className="text-2xl font-semibold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent mb-2">
                              No Bio yet
                           </h3>
                           <p className="text-gray-400 max-w-sm">
                              Tap{' '}
                              <span className="text-pink-400 font-medium">
                                 Generate Bio
                              </span>{' '}
                              to create bio instantly ✨
                           </p>
                        </div>
                     )}
                  </div>
                  {/* Keyboard Shortcut Hint - Hidden on very small screens */}{' '}
                  <div className="hidden sm:block text-center text-xs text-gray-500">
                     {' '}
                     Press{' '}
                     <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20">
                        {' '}
                        Ctrl{' '}
                     </kbd>{' '}
                     +{' '}
                     <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20">
                        {' '}
                        Enter{' '}
                     </kbd>{' '}
                     to generate{' '}
                  </div>
               </div>
            </div>
         </div>

         {/* ✨ Animations */}
         <style>{`
            @keyframes shimmer {
               0% { background-position: 200% 0; }
               100% { background-position: -200% 0; }
            }
            .animate-shimmer {
               background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%);
               background-size: 200% 100%;
               animation: shimmer 1.5s infinite;
            }
            @keyframes slideIn {
               from { transform: translateX(100%); opacity: 0; }
               to { transform: translateX(0); opacity: 1; }
            }
            .animate-slideIn { animation: slideIn 0.3s ease-out; }
         `}</style>
      </div>
   );
}
