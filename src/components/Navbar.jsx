import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
   Home,
   Type,
   Smile,
   Sparkles,
   Hash,
   Sparkle,
   FileText,
   PenTool,
   AtSign,
   Clock,
   LayoutGrid,
   X,
} from 'lucide-react';

const NAV_ITEMS = [
   { title: 'Home', path: '/', icon: Home },
   { title: 'Font Generator', path: '/fontgenerator', icon: Type },
   { title: 'Emoji Generator', path: '/emojigenerator', icon: Smile },
   { title: 'Cool Symbol', path: '/symbol', icon: Sparkles },
   { title: 'Hashtag', path: '/hashtaggenerator', icon: Hash },
   { title: 'Bio Generator', path: '/bio', icon: Sparkle },
   { title: 'Word Counter', path: '/wordcounter', icon: FileText },
   { title: 'AI Writer', path: '/aiwriter', icon: PenTool },
   { title: 'Username Generator', path: '/username', icon: AtSign },
   { title: 'Time Zone Converter', path: '/timezone', icon: Clock },
];

const Navbar = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
   const location = useLocation();
   const sidebarRef = useRef(null);
   const [activeTooltip, setActiveTooltip] = useState(null);
   const [toolsMenuOpen, setToolsMenuOpen] = useState(false);

   const homeItem = NAV_ITEMS[0];
   const toolItems = NAV_ITEMS.slice(1);

   const currentTool = toolItems.find(
      (item) => item.path === location.pathname,
   );
   const isHomeActive = location.pathname === '/';

   const activeToolIndex = toolItems.findIndex(
      (item) => item.path === location.pathname,
   );

   const TOTAL_TOOLS_SHOWN = 6;
   let start = activeToolIndex >= 0 ? activeToolIndex - 2 : 0;
   if (start < 0) start = 0;
   if (start + TOTAL_TOOLS_SHOWN > toolItems.length) {
      start = Math.max(0, toolItems.length - TOTAL_TOOLS_SHOWN);
   }

   const visibleTools = toolItems.slice(start, start + TOTAL_TOOLS_SHOWN);
   const currentNavItems = [homeItem, ...visibleTools];

   useEffect(() => {
      setToolsMenuOpen(false);
      setActiveTooltip(null);
   }, [location.pathname]);

   const handleMouseEnter = (item, e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setActiveTooltip({
         title: item.title,
         top: rect.top + rect.height / 2,
      });
   };

   const handleMouseLeave = () => {
      setActiveTooltip(null);
   };

   return (
      <>
         {/* MOBILE TOP HEADER: Klique logo on top left */}
         <header className="absolute top-0 left-0 right-0 z-40 px-1 flex items-center justify-between pointer-events-none lg:hidden">
            <Link
               to="/"
               className="pointer-events-auto flex items-center gap-2 group">
               <span className="inline-block whitespace-nowrap text-2xl font-bold tracking-tight bg-[linear-gradient(110deg,#ffffff_25%,#a1a1aa_40%,#ffffff_50%,#a1a1aa_60%,#ffffff_75%)] bg-[length:300%_100%] bg-clip-text text-transparent animate-klique-shine drop-shadow-md">
                  Klique
               </span>
            </Link>

            {currentTool && (
               <div className="pointer-events-auto rounded-full bg-zinc-900/80 border border-zinc-800/80 px-3 py-1 text-xs font-semibold text-zinc-300 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                  <currentTool.icon size={13} className="text-[#daf4aa]" />
                  <span className="truncate max-w-[120px] sm:max-w-none">
                     {currentTool.title}
                  </span>
               </div>
            )}
         </header>

         {/* MOBILE BOTTOM DOCK CENTER */}
         <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-[#121215]/90 backdrop-blur-xl border border-zinc-800/80 px-3 py-2 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.85)] lg:hidden">
            {/* Home Button */}
            <Link
               to="/"
               aria-label="Home"
               className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                  isHomeActive
                     ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_20px_rgba(218,244,170,0.35)]'
                     : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
               }`}>
               <Home size={18} />
               <span>Home</span>
            </Link>

            {/* Divider */}
            <div className="h-4 w-px bg-zinc-800 mx-0.5" />

            {/* Tools Button */}
            <button
               onClick={() => setToolsMenuOpen(true)}
               aria-label="Tools"
               className={`relative flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                  toolsMenuOpen || (!isHomeActive && currentTool)
                     ? 'bg-zinc-800 text-[#daf4aa] border border-zinc-700/60 shadow-md'
                     : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
               }`}>
               <LayoutGrid size={18} />
               <span>Tools</span>

               {!isHomeActive && currentTool && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#daf4aa] animate-pulse" />
               )}
            </button>
         </nav>

         {/* MOBILE TOOLS MODAL / DRAWER */}
         <AnimatePresence>
            {toolsMenuOpen && (
               <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 lg:hidden">
                  {/* Backdrop */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setToolsMenuOpen(false)}
                     className="fixed inset-0 bg-black/80 backdrop-blur-md"
                  />

                  {/* Modal Container */}
                  <motion.div
                     initial={{ y: '100%', opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     exit={{ y: '100%', opacity: 0 }}
                     transition={{
                        type: 'spring',
                        damping: 26,
                        stiffness: 320,
                     }}
                     className="relative w-full max-w-lg bg-[#121216] border border-zinc-800/90 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl max-h-[80vh] flex flex-col z-10 overflow-hidden">
                     {/* Header */}
                     <div className="flex items-center justify-between pb-4 border-b border-zinc-800/60 mb-4 shrink-0">
                        <div>
                           <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                              <LayoutGrid
                                 size={18}
                                 className="text-[#daf4aa]"
                              />
                              All Tools
                           </h3>
                           <p className="text-xs text-zinc-500 font-medium mt-0.5">
                              Select a tool to start using
                           </p>
                        </div>
                        <button
                           onClick={() => setToolsMenuOpen(false)}
                           className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                           <X size={18} />
                        </button>
                     </div>

                     {/* Grid of Tools */}
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto customScrollbar pr-1 pb-2">
                        {toolItems.map((item) => {
                           const Icon = item.icon;
                           const isActive = location.pathname === item.path;

                           return (
                              <Link
                                 key={item.path}
                                 to={item.path}
                                 onClick={() => setToolsMenuOpen(false)}
                                 className={`group flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all duration-200 ${
                                    isActive
                                       ? 'bg-[#daf4aa]/10 border-[#daf4aa]/40 text-[#daf4aa]'
                                       : 'bg-zinc-900/60 border-zinc-800/70 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/60'
                                 }`}>
                                 <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2.5 transition-all ${
                                       isActive
                                          ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                                          : 'bg-zinc-800/80 text-zinc-400 group-hover:text-white group-hover:bg-zinc-700'
                                    }`}>
                                    <Icon size={20} />
                                 </div>
                                 <span className="text-xs font-semibold tracking-tight line-clamp-1">
                                    {item.title}
                                 </span>
                              </Link>
                           );
                        })}
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

         {/* DESKTOP SIDEBAR (Visible on lg: screen size and above) */}
         <aside
            ref={sidebarRef}
            className="hidden lg:flex fixed top-0 left-0 h-full z-50 w-20 flex-col items-center py-6 bg-transparent overflow-visible">
            <nav className="flex flex-col gap-3 w-full h-full items-center overflow-visible px-2">
               {/* Brand / Logo */}
               <div className="relative flex items-center justify-center w-full mb-2 overflow-visible">
                  <Link
                     to="/"
                     className="group ml-4 shrink-0 whitespace-nowrap">
                     <span className="inline-block whitespace-nowrap text-2xl font-bold bg-[linear-gradient(110deg,#ffffff_25%,#a1a1aa_40%,#ffffff_50%,#a1a1aa_60%,#ffffff_75%)] bg-[length:300%_100%] bg-clip-text text-transparent animate-klique-shine ml-5">
                        Klique
                     </span>
                  </Link>
               </div>

               {/* Navigation Links */}
               <div className="flex flex-col gap-4 w-full items-center py-2 flex-1 justify-center">
                  <AnimatePresence mode="popLayout" initial={false}>
                     {currentNavItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                           <motion.div
                              key={item.path}
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                              className="relative flex items-center justify-center">
                              <Link
                                 to={item.path}
                                 aria-label={item.title}
                                 onMouseEnter={(e) => handleMouseEnter(item, e)}
                                 onMouseLeave={handleMouseLeave}
                                 className="group relative flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 outline-none">
                                 {/* Inactive background hover effect */}
                                 <div
                                    className={`pointer-events-none absolute inset-0 rounded-full border border-transparent transition-all duration-300 ${
                                       isActive
                                          ? 'bg-[#daf4aa] shadow-[0_0_20px_rgba(218,244,170,0.3)]'
                                          : 'bg-zinc-800/40 shadow-sm group-hover:bg-zinc-700/80'
                                    }`}
                                 />

                                 {/* Animated active background */}
                                 {isActive && (
                                    <motion.div
                                       layoutId="activeSidebarTab"
                                       className="pointer-events-none absolute inset-0 rounded-full bg-[#daf4aa] shadow-[0_0_20px_rgba(218,244,170,0.3)]"
                                       transition={{
                                          type: 'spring',
                                          stiffness: 400,
                                          damping: 30,
                                       }}
                                    />
                                 )}

                                 {/* Icon Element */}
                                 <span
                                    className={`pointer-events-none relative z-10 flex items-center justify-center transition-all duration-300 ${
                                       isActive
                                          ? 'text-[#16161b]'
                                          : 'text-zinc-400 group-hover:text-zinc-100'
                                    }`}>
                                    <Icon size={22} />
                                 </span>
                              </Link>
                           </motion.div>
                        );
                     })}
                  </AnimatePresence>
               </div>
            </nav>
         </aside>

         {/* Floating Tooltip for Desktop */}
         {activeTooltip &&
            createPortal(
               <div
                  style={{ top: activeTooltip.top }}
                  className="hidden lg:block fixed left-[88px] -translate-y-1/2 z-[999999] pointer-events-none whitespace-nowrap rounded-lg border border-zinc-800 bg-[#18181b] px-3.5 py-2 text-xs font-semibold text-zinc-100 shadow-2xl animate-fadeIn">
                  {activeTooltip.title}
               </div>,
               document.body,
            )}
      </>
   );
};

export default Navbar;
