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
import { motion, AnimatePresence } from 'motion/react';
import { ColumnLines } from '@/components/ui/download-with-columnlines-utils/columnlines';
import { callAiApi } from '../../services/aiService';

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

      return () => {
         window.removeEventListener('resize', checkMobile);
      };
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
     GENERATE HASHTAGS
  ============================================================ */

   const generateHashtags = async (desc) => {
      try {
         const prompt = `You are a social media expert.

Generate 15 short, relevant, trending hashtags based on the following description:

"${desc}"

Return only hashtags separated by spaces, no explanations.`;

         const text = await callAiApi(prompt);

         const tags = text.match(/#[\w]+/g)?.slice(0, 15) || [];

         if (!tags.length) {
            throw new Error('No hashtags generated');
         }

         showNotification('Hashtags generated successfully!');

         return tags;
      } catch (err) {
         console.error('Gemini API error:', err);

         showNotification(err.message || 'Error generating hashtags', 'error');

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
      setHashtags([]);

      const tags = await generateHashtags(description);

      setHashtags(tags);
      setIsLoading(false);
   };

   /* ============================================================
     COPY
  ============================================================ */

   const handleCopy = () => {
      if (!hashtags.length) return;

      navigator.clipboard.writeText(hashtags.join(' '));

      setIsCopied(true);

      showNotification(`${hashtags.length} hashtags copied!`);

      setTimeout(() => {
         setIsCopied(false);
      }, 2000);
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
     SUGGESTIONS
  ============================================================ */

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
      <div
         className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#09090b] px-3 py-6 font-sans text-zinc-100 customScrollbar sm:px-5 sm:py-8 md:px-10 overflow-hidden 
    before:absolute
    before:inset-0
    before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]
    after:absolute
    after:inset-0
    after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
         <div
            className="
    pointer-events-none absolute inset-0
    bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]
  "
         />
         <SEO
            title="AI Hashtag Generator | Viral Social Media Tags | Klique"
            description="Boost your social media presence with our AI Hashtag Generator. Create relevant, high-reach hashtags for Instagram, TikTok, YouTube, and Twitter instantly."
            keywords="ai hashtag generator, hashtag creator, instagram hashtags, tiktok hashtags, viral tags, klique hashtags, trending hashtags generator"
            canonicalUrl="https://klique.netlify.app/hashtaggenerator"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'AI Hashtag Generator',
               url: 'https://klique.netlify.app/hashtaggenerator',
               applicationCategory: 'UtilitiesApplication',
               operatingSystem: 'All',
               description:
                  'Generate viral, trending hashtags for Instagram, TikTok, and YouTube using AI.',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
            }}
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
          MAIN CONTENT
      ======================================================== */}

         <div className="relative z-10 flex min-h-[100dvh] w-full flex-col items-center justify-start px-0 pb-32 pt-24 sm:px-2 sm:pb-24 sm:pt-28 md:justify-center md:py-20">
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
                  Generate Trending Hashtags
               </h1>

               <p className="px-2 text-xs font-medium leading-relaxed text-zinc-500 sm:text-sm md:text-base">
                  Type a description of your post to get started
               </p>
            </motion.div>

            {/* ======================================================
            INPUT
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
                     placeholder="Describe your post or paste your caption here..."
                     className="min-h-[125px] w-full resize-none bg-transparent p-4 text-sm leading-relaxed text-zinc-200 placeholder:text-zinc-600 focus:outline-none disabled:opacity-50 sm:min-h-[140px] sm:p-5 sm:text-base md:text-lg"
                  />

                  {/* ==================================================
                RESPONSIVE TOOLBAR
            ================================================== */}

                  <div className="flex flex-col gap-2.5 border-t border-zinc-800/50 bg-[#0f0f11] p-2.5 sm:flex-row sm:items-center sm:justify-between sm:p-3">
                     {/* Left Controls */}

                     <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
                        {/* Attachment */}

                        <button
                           type="button"
                           className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                           title="Attach media">
                           <FiPaperclip size={17} />
                        </button>

                        {/* Commands */}

                        <button
                           type="button"
                           className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
                           title="Commands">
                           <FiCommand size={17} />
                        </button>

                        {/* Character Count */}

                        <span className="ml-0 shrink-0 whitespace-nowrap px-1 text-[11px] font-medium text-zinc-600 sm:ml-1 sm:text-xs">
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
                              <FiSend
                                 size={16}
                                 className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                              />

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
               {!hashtags.length && !isLoading && (
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
            GENERATED HASHTAGS
        ====================================================== */}

            <AnimatePresence>
               {hashtags.length > 0 && !isLoading && (
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
                        {/* Result Header */}

                        <div className="mb-4 flex min-w-0 items-center justify-between gap-3 sm:mb-6">
                           <h3 className="flex min-w-0 items-center gap-2 text-base font-medium text-zinc-100 sm:text-lg">
                              <PiSparkleLight
                                 className="shrink-0 text-purple-400"
                                 size={20}
                              />

                              <span className="truncate">Your Hashtags</span>
                           </h3>

                           {/* Copy All */}

                           <button
                              onClick={handleCopy}
                              className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-zinc-800/50 px-2.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 sm:h-auto sm:px-3 sm:py-1.5 sm:text-sm">
                              {isCopied ? (
                                 <FiCheck className="text-green-400" />
                              ) : (
                                 <FiCopy />
                              )}

                              <span>{isCopied ? 'Copied' : 'Copy All'}</span>
                           </button>
                        </div>

                        {/* Hashtags */}

                        <div className="flex min-w-0 flex-wrap gap-2">
                           {hashtags.map((tag, i) => (
                              <motion.span
                                 initial={{
                                    opacity: 0,
                                    scale: 0.9,
                                 }}
                                 animate={{
                                    opacity: 1,
                                    scale: 1,
                                 }}
                                 transition={{
                                    delay: i * 0.05,
                                 }}
                                 key={i}
                                 className="max-w-full break-all rounded-lg border border-zinc-800 bg-[#18181b] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-purple-500/50 hover:text-purple-300 sm:text-sm">
                                 {tag}
                              </motion.span>
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

        html,
        body {
          max-width: 100%;
          overflow-x: hidden;
        }

        button,
        select,
        textarea {
          touch-action: manipulation;
        }

        * {
          min-width: 0;
        }
      `}</style>
      </div>
   );
}
