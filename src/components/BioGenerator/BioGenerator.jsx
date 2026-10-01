import { useEffect, useRef, useState } from 'react';
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
import { motion, AnimatePresence } from 'motion/react';
import { ColumnLines } from '@/components/ui/download-with-columnlines-utils/columnlines';
import Loader from '../ui/loader';

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

   /* ============================================================
     MOBILE DETECTION
  ============================================================ */

   useEffect(() => {
      const checkMobile = () => {
         setIsMobile(window.innerWidth < 768);
      };

      checkMobile();

      window.addEventListener('resize', checkMobile);

      return () => window.removeEventListener('resize', checkMobile);
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
     GENERATE BIO
  ============================================================ */

   const generateBio = async (desc, selectedTone) => {
      try {
         const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
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
- Be ready to copy and use
- Separate bios with ---
`,
                           },
                        ],
                     },
                  ],
               }),
            },
         );

         if (!res.ok) {
            throw new Error('Failed to fetch bio');
         }

         const data = await res.json();

         const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

         if (!text) {
            throw new Error('No bio generated');
         }

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

   /* ============================================================
     SUBMIT
  ============================================================ */

   const handleSubmit = async () => {
      if (description.length < 10) {
         return showNotification('Enter at least 10 characters', 'error');
      }

      if (description.length > 300) {
         return showNotification('Max 300 characters allowed', 'error');
      }

      setIsLoading(true);
      setBio([]);

      const result = await generateBio(description, tone);

      setBio(result);
      setIsLoading(false);
   };

   /* ============================================================
     COPY BIO
  ============================================================ */

   const handleCopy = (text, index) => {
      navigator.clipboard.writeText(text);

      setCopiedIndex(index);

      showNotification('Bio copied!');

      setTimeout(() => {
         setCopiedIndex(null);
      }, 1500);
   };

   /* ============================================================
     SUGGESTION CLICK
  ============================================================ */

   const handleSuggestionClick = (text) => {
      setDescription(text);

      if (textareaRef.current) {
         textareaRef.current.focus();
      }
   };

   /* ============================================================
     TONE OPTIONS
  ============================================================ */

   const toneOptions = [
      {
         label: '😂 Funny',
         value: 'funny',
      },
      {
         label: '😐 Serious',
         value: 'serious',
      },
      {
         label: '🎨 Creative',
         value: 'creative',
      },
      {
         label: '🌟 Inspirational',
         value: 'inspirational',
      },
      {
         label: '💪 Motivational',
         value: 'motivational',
      },
      {
         label: '😄 Humorous',
         value: 'humorous',
      },
      {
         label: '😜 Playful',
         value: 'playful',
      },
      {
         label: '😊 Charming',
         value: 'charming',
      },
      {
         label: '✨ Charismatic',
         value: 'charismatic',
      },
      {
         label: '😢 Sad',
         value: 'sad',
      },
   ];

   /* ============================================================
     SUGGESTIONS
  ============================================================ */

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

   /* ============================================================
     UI
  ============================================================ */

   return (
      <ColumnLines
         columnWidth={80}
         columnCount={34}
         radialFadeStart={15}
         radialFadeEnd={90}
         className="relative min-h-[100dvh] w-full overflow-x-hidden overflow-y-auto bg-[#09090b] px-3 py-6 font-sans text-zinc-100 customScrollbar sm:px-5 sm:py-8 md:px-10">
         <SEO
            title="AI Bio Generator | Creative Social Media Bios | Klique"
            description="Create professional, funny, or creative social media bios for Instagram, TikTok, Twitter, and LinkedIn using advanced AI. Grab attention and optimize your profile."
            keywords="ai bio generator, bio creator, social media bio writer, instagram bio generator, tiktok bio, linkedin bio, klique bio, professional bio generator"
            canonicalUrl="https://klique.netlify.app/bio"
         />

         {/* ========================================================
          TOAST
      ======================================================== */}

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
                  className="fixed left-1/2 top-4 z-[100] w-[calc(100%-24px)] max-w-sm">
                  <div
                     className={`flex w-full items-center gap-3 rounded-full border bg-[#18181b]/95 px-4 py-3 shadow-lg backdrop-blur-md ${
                        toast.type === 'error'
                           ? 'border-red-500/50 text-red-400'
                           : 'border-green-500/50 text-green-400'
                     }`}>
                     <FiCheck className="h-4 w-4 shrink-0" />

                     <p className="min-w-0 flex-1 break-words pr-1 text-xs font-medium sm:text-sm">
                        {toast.message}
                     </p>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         {/* ========================================================
          NAVBAR
      ======================================================== */}
         <div className="relative z-[100] w-full">
            <Navbar />
         </div>

         {/* ========================================================
          LOADING
      ======================================================== */}

         {isLoading && <Loader text="Generating creative bios with AI..." />}

         {/* ========================================================
          MAIN CONTENT
      ======================================================== */}

         <div className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-start px-0 pb-28 pt-24 sm:px-2 sm:pb-24 sm:pt-28 md:justify-center md:py-20">
            {/* ======================================================
            HEADING
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
               className="mb-7 w-full max-w-2xl px-2 text-center sm:mb-10">
               <h1 className="mb-2 text-2xl font-medium tracking-tight text-zinc-100 sm:mb-3 sm:text-3xl md:text-4xl">
                  Generate creative bios
               </h1>

               <p className="px-2 text-xs font-medium leading-relaxed text-zinc-500 sm:text-sm md:text-base">
                  Describe yourself and pick a tone to get started
               </p>
            </motion.div>

            {/* ======================================================
            INPUT CONTAINER
        ====================================================== */}

            <motion.div
               layout
               className="relative z-20 mx-auto w-full max-w-2xl min-w-0">
               {/* Animated Loading Border */}

               <AnimatePresence>
                  {isLoading && (
                     <motion.div
                        initial={{
                           opacity: 0,
                        }}
                        animate={{
                           opacity: 1,
                        }}
                        exit={{
                           opacity: 0,
                        }}
                        className="absolute -inset-[1px] -z-10 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80 blur-[2px] animate-gradient-spin"
                     />
                  )}
               </AnimatePresence>

               {/* Input Card */}

               <div
                  className={`flex min-w-0 flex-col overflow-hidden rounded-2xl bg-[#0f0f11] transition-all duration-300 ${
                     isLoading
                        ? 'border-transparent shadow-[0_0_40px_rgba(168,85,247,0.15)]'
                        : 'border border-zinc-800/80 shadow-2xl'
                  }`}>
                  {/* Textarea */}

                  <textarea
                     ref={textareaRef}
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === 'Enter') {
                           handleSubmit();
                        }
                     }}
                     disabled={isLoading}
                     placeholder="e.g. Travel addict 🌍 | Coffee lover ☕ | Dream chaser ✨..."
                     className="min-h-[125px] w-full resize-none bg-transparent p-4 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50 sm:min-h-[140px] sm:p-5 sm:text-base md:text-lg"
                  />

                  {/* ==================================================
                INPUT TOOLBAR
            ================================================== */}

                  <div className="flex flex-col gap-2.5 border-t border-zinc-800/50 bg-[#0f0f11] p-2.5 sm:flex-row sm:items-center sm:justify-between sm:p-3">
                     {/* Left Controls */}

                     <div className="flex min-w-0 flex-1 items-center gap-2">
                        {/* Tone */}

                        <div className="relative min-w-0 flex-1 sm:flex-none">
                           <select
                              value={tone}
                              onChange={(e) => setTone(e.target.value)}
                              className="h-10 w-full appearance-none rounded-lg border border-zinc-800 bg-[#18181b] pl-3 pr-9 text-xs font-medium text-zinc-300 outline-none transition-colors hover:bg-zinc-800 focus:border-zinc-600 sm:w-auto sm:min-w-[145px] sm:text-sm">
                              {toneOptions.map((t) => (
                                 <option key={t.value} value={t.value}>
                                    {t.label}
                                 </option>
                              ))}
                           </select>

                           <svg
                              className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
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

                        {/* Character Count */}

                        <span className="shrink-0 whitespace-nowrap px-1 text-[11px] font-medium text-zinc-600 sm:text-xs">
                           {description.length}/300
                        </span>
                     </div>

                     {/* Generate */}

                     <button
                        onClick={handleSubmit}
                        disabled={isLoading || !description.trim()}
                        className="flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#27272a] px-4 text-xs font-medium text-zinc-200 transition-all hover:bg-[#3f3f46] disabled:cursor-not-allowed disabled:bg-zinc-900 disabled:text-zinc-600 sm:w-auto sm:min-w-[120px] sm:text-sm">
                        {isLoading ? (
                           <div className="flex items-center justify-center gap-2">
                              <PiSparkleLight
                                 className="animate-spin text-purple-400"
                                 size={16}
                              />

                              <span>Generating...</span>
                           </div>
                        ) : (
                           <>
                              <FiSend size={16} />

                              <span>Generate</span>
                           </>
                        )}
                     </button>
                  </div>
               </div>
            </motion.div>

            {/* ======================================================
            SUGGESTIONS
        ====================================================== */}

            <AnimatePresence mode="wait">
               {!bio.length && !isLoading && (
                  <motion.div
                     initial={{
                        opacity: 0,
                        y: 10,
                     }}
                     animate={{
                        opacity: 1,
                        y: 0,
                     }}
                     exit={{
                        opacity: 0,
                        y: -10,
                     }}
                     className="mt-6 grid w-full max-w-2xl grid-cols-2 gap-2.5 sm:mt-8 sm:gap-3">
                     {suggestions.map((suggestion, idx) => (
                        <button
                           key={idx}
                           onClick={() =>
                              handleSuggestionClick(suggestion.prompt)
                           }
                           className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl border border-zinc-800/80 bg-[#121214] px-2.5 py-3 text-xs font-medium text-zinc-400 transition-all hover:border-zinc-700 hover:bg-[#1f1f22] hover:text-zinc-200 sm:px-4 sm:py-2.5 sm:text-sm">
                           <span className="shrink-0 text-base">
                              {suggestion.icon}
                           </span>

                           <span className="truncate">{suggestion.label}</span>
                        </button>
                     ))}
                  </motion.div>
               )}
            </AnimatePresence>

            {/* ======================================================
            GENERATED RESULTS
        ====================================================== */}

            <AnimatePresence>
               {bio.length > 0 && !isLoading && (
                  <motion.div
                     initial={{
                        opacity: 0,
                        height: 0,
                        y: 20,
                     }}
                     animate={{
                        opacity: 1,
                        height: 'auto',
                        y: 0,
                     }}
                     className="relative mt-6 w-full max-w-2xl min-w-0 sm:mt-8">
                     <div className="rounded-2xl border border-zinc-800/80 bg-[#121214] p-3.5 shadow-xl sm:p-6 md:p-8">
                        {/* Results Header */}

                        <div className="mb-4 flex min-w-0 items-center justify-between sm:mb-6">
                           <h3 className="flex min-w-0 items-center gap-2 text-base font-medium text-zinc-100 sm:text-lg">
                              <PiSparkleLight
                                 className="shrink-0 text-purple-400"
                                 size={20}
                              />

                              <span className="truncate">Your Bios</span>
                           </h3>
                        </div>

                        {/* Bios */}

                        <div className="grid gap-2.5 sm:gap-3">
                           {bio.map((text, i) => (
                              <motion.div
                                 initial={{
                                    opacity: 0,
                                    y: 10,
                                 }}
                                 animate={{
                                    opacity: 1,
                                    y: 0,
                                 }}
                                 transition={{
                                    delay: i * 0.1,
                                 }}
                                 key={i}
                                 className="relative flex min-w-0 items-start gap-2.5 rounded-xl border border-zinc-800 bg-[#18181b] p-3.5 transition-colors hover:border-zinc-700 sm:gap-4 sm:p-5">
                                 {/* Bio Text */}

                                 <p className="min-w-0 flex-1 break-words whitespace-pre-line text-xs leading-relaxed text-zinc-300 sm:text-sm">
                                    {text}
                                 </p>

                                 {/* Copy */}

                                 <button
                                    onClick={() => handleCopy(text, i)}
                                    aria-label="Copy bio"
                                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800/50 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200">
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

         {/* ========================================================
          ANIMATIONS
      ======================================================== */}

         <style>{`
        @keyframes gradient-spin {
          0% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }

          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient-spin {
          background-size: 200% 200%;
          animation: gradient-spin 2.5s ease-in-out infinite;
        }

        /* Prevent accidental horizontal scrolling */
        html,
        body {
          max-width: 100%;
          overflow-x: hidden;
        }

        /* Better mobile tap behavior */
        button,
        select {
          touch-action: manipulation;
        }

        /* Prevent long generated text from expanding containers */
        * {
          min-width: 0;
        }
      `}</style>
      </ColumnLines>
   );
}
