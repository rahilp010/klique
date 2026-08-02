import { useEffect, useState } from 'react';
import { PiSparkleLight } from 'react-icons/pi';
import Navbar from '../Navbar';
import SEO from '../SEO';
import { FaBars } from 'react-icons/fa';
import { GiPerspectiveDiceSixFacesRandom } from 'react-icons/gi';

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

   useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
   }, []);

   const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

   /** 🔔 Show notification (success/error) */
   const showNotification = (message, type = 'success', duration = 2500) => {
      setToast({ message, type, visible: true });
      setTimeout(
         () => setToast((prev) => ({ ...prev, visible: false })),
         duration
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
            }
         );

         if (!res.ok) throw new Error('Failed to fetch hashtags');
         const data = await res.json();
         const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
         const tags = text.match(/#[\w]+/g)?.slice(0, 15) || [];

         if (!tags.length) throw new Error('No hashtags generated');
         showNotification('✅ Hashtags generated successfully!');
         return tags;
      } catch (err) {
         console.error('Gemini API error:', err);
         showNotification(err.message || 'Error generating hashtags', 'error');
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
      setHashtags([]);

      const tags = await generateHashtags(description);
      setHashtags(tags);
      setIsLoading(false);
   };

   /** 📋 Copy hashtags */
   const handleCopy = () => {
      if (!hashtags.length) return;
      navigator.clipboard.writeText(hashtags.join(' '));
      setIsCopied(true);
      showNotification(`${hashtags.length} hashtags copied!`);
      setTimeout(() => setIsCopied(false), 2000);
   };

   return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-black via-gray-900 to-black text-white">
         <SEO
            title="AI Hashtag Generator | Viral Social Media Tags | Klique"
            description="Boost your social media presence with our AI Hashtag Generator. Create relevant, high-reach hashtags for Instagram, TikTok, YouTube, and Twitter instantly."
            keywords="ai hashtag generator, hashtag creator, instagram hashtags, tiktok hashtags, viral tags, klique hashtags, trending hashtags generator"
            canonicalUrl="https://klique.com/hashtaggenerator"
            jsonLd={{
               "@context": "https://schema.org",
               "@type": "SoftwareApplication",
               "name": "AI Hashtag Generator",
               "operatingSystem": "All",
               "applicationCategory": "SocialNetworkingApplication",
               "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
               }
            }}
         />
         {/* Toast Notification - Responsive positioning */}
         {toast.visible && (
            <div className="fixed top-4 right-4 left-4 sm:left-auto sm:top-6 sm:right-6 animate-slideIn z-50">
               <div
                  className={`px-4 py-3 sm:px-6 rounded-xl shadow-lg flex items-center gap-2 border backdrop-blur-md ${
                     toast.type === 'error'
                        ? 'bg-red-500/20 border-red-400 text-red-100'
                        : 'bg-green-500/20 border-green-400 text-green-100'
                  }`}>
                  <svg
                     className="w-5 h-5 flex-shrink-0"
                     viewBox="0 0 24 24"
                     fill="none"
                     stroke="currentColor"
                     strokeWidth="2">
                     {toast.type === 'error' ? (
                        <>
                           <line x1="18" y1="6" x2="6" y2="18" />
                           <line x1="6" y1="6" x2="18" y2="18" />
                        </>
                     ) : (
                        <polyline points="20 6 9 17 4 12" />
                     )}
                  </svg>
                  <p className="text-sm">{toast.message}</p>
               </div>
            </div>
         )}

         {/* Main Content - Responsive padding and layout */}
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-6 max-h-[100dvh] overflow-auto customScrollbar">
            <div
               onClick={() => setSidebarOpen((prev) => !prev)}
               className="fixed top-6 left-6 z-40 p-3 rounded-2xl 
                              bg-white/10 backdrop-blur-xl border border-white/20
                              hover:bg-white/20 hover:scale-105
                              active:scale-95
                              transition-all duration-300 
                              shadow-lg shadow-black/20 cursor-pointer">
               <FaBars size={20} className="text-white" />
            </div>

            <Navbar
               sidebarOpen={sidebarOpen}
               setSidebarOpen={setSidebarOpen}
               isMobile={isMobile}
            />
            <div className="max-w-4xl mx-auto">
               {/* Card Container - Responsive padding */}
               <div className="bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-2xl backdrop-blur-xl space-y-6 sm:space-y-8 mt-16 ">
                  {/* Header - Responsive text sizes */}
                  <div className="text-center space-y-2 sm:space-y-3">
                     <h1 className="text-3xl sm:text-3xl md:text-5xl font-bold mb-4">
                        Insta
                        <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                           Hash
                        </span>
                     </h1>
                     <p className="text-sm sm:text-base text-gray-300 px-4">
                        Generate unique and trending hashtags powered by AI ✨
                     </p>
                  </div>

                  {/* Input Section - Responsive */}
                  <div>
                     <label className="block mb-2 font-semibold text-gray-200 text-sm sm:text-base">
                        Post Description
                     </label>
                     <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyDown={(e) =>
                           e.ctrlKey && e.key === 'Enter' && handleSubmit()
                        }
                        placeholder="e.g. A cozy café morning with latte art ☕🌿..."
                        className="w-full p-3 sm:p-4 bg-black/50 border border-gray-700 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-500 transition text-sm sm:text-base resize-none"
                        rows="4"
                     />
                     <div className="mt-2 text-xs sm:text-sm text-gray-400 text-right">
                        {description.length}/300 characters
                     </div>
                  </div>

                  {/* Generate Button - Responsive sizing */}
                  <button
                     onClick={handleSubmit}
                     disabled={isLoading}
                     className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-base sm:text-lg 
                     bg-gradient-to-r from-purple-500/10 to-pink-500/10  
                     border border-white/10 backdrop-blur-md 
                     hover:from-gray-900/70 hover:to-black/70 
                     hover:border-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]
                     transition-all transform hover:scale-[1.02] active:scale-100 
                     shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
                     {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                           <svg
                              className="w-5 h-5 animate-spin text-white"
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
                           <span className="text-sm sm:text-base">
                              Generating...
                           </span>
                        </div>
                     ) : (
                        <div className="flex items-center justify-center gap-2 sm:gap-3">
                           <PiSparkleLight size={20} />
                           <span>Generate Hashtags</span>
                        </div>
                     )}
                  </button>

                  {/* Results Section - Responsive height and padding */}
                  <div className="relative max-h-[300px] sm:max-h-[350px] lg:max-h-[400px] overflow-y-auto rounded-xl sm:rounded-2xl p-4 sm:p-6 backdrop-blur-m">
                     {hashtags.length > 0 && (
                        <button
                           onClick={handleCopy}
                           className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition z-10"
                           aria-label="Copy hashtags">
                           {isCopied ? (
                              <svg
                                 className="w-4 h-4 text-green-400"
                                 viewBox="0 0 24 24"
                                 fill="none"
                                 stroke="currentColor"
                                 strokeWidth="2">
                                 <polyline points="20 6 9 17 4 12" />
                              </svg>
                           ) : (
                              <svg
                                 className="w-4 h-4 text-white"
                                 viewBox="0 0 24 24"
                                 fill="none"
                                 stroke="currentColor"
                                 strokeWidth="2">
                                 <rect
                                    x="9"
                                    y="9"
                                    width="13"
                                    height="13"
                                    rx="2"
                                    ry="2"
                                 />
                                 <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                              </svg>
                           )}
                        </button>
                     )}

                     {/* Hashtags Grid - Responsive gap and sizing */}
                     <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        {isLoading ? (
                           [...Array(12)].map((_, i) => (
                              <div
                                 key={i}
                                 className="w-20 h-6 sm:w-24 sm:h-7 bg-white/10 rounded-full animate-shimmer"
                              />
                           ))
                        ) : hashtags.length ? (
                           hashtags.map((tag, i) => (
                              <span
                                 key={i}
                                 className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 
                                 border border-purple-400/30 rounded-full text-xs sm:text-sm font-medium 
                                 hover:scale-105 transition-transform cursor-default break-all">
                                 {tag}
                              </span>
                           ))
                        ) : (
                           <div className="col-span-full flex flex-col items-center justify-center py-16 text-center text-white/70 animate-fade-in">
                              <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-indigo-400 to-pink-400 opacity-80 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
                                 <GiPerspectiveDiceSixFacesRandom className="text-3xl" />
                              </div>
                              <h3 className="text-2xl font-semibold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent mb-2">
                                 No Hashtags yet
                              </h3>
                              <p className="text-gray-400 max-w-sm">
                                 Tap{' '}
                                 <span className="text-pink-400 font-medium">
                                    Generate Hashtags
                                 </span>{' '}
                                 to create hashtags instantly ✨
                              </p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Keyboard Shortcut Hint - Hidden on very small screens */}
                  <div className="hidden sm:block text-center text-xs text-gray-500">
                     Press{' '}
                     <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20">
                        Ctrl
                     </kbd>{' '}
                     +{' '}
                     <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20">
                        Enter
                     </kbd>{' '}
                     to generate
                  </div>
               </div>
            </div>
         </div>

         {/* Animations */}
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
            .animate-slideIn {
               animation: slideIn 0.3s ease-out;
            }
         `}</style>
      </div>
   );
}
