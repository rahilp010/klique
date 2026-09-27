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

   const homeItem = NAV_ITEMS[0];
   const toolItems = NAV_ITEMS.slice(1);

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
      const handleClickOutside = (e) => {
         if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
            setSidebarOpen?.(false);
         }
      };
      if (sidebarOpen && isMobile) {
         document.addEventListener('mousedown', handleClickOutside);
      }
      return () =>
         document.removeEventListener('mousedown', handleClickOutside);
   }, [sidebarOpen, isMobile, setSidebarOpen]);

   useEffect(() => {
      if (isMobile) setSidebarOpen?.(false);
      setActiveTooltip(null);
   }, [location.pathname, isMobile, setSidebarOpen]);

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
         {/* Overlay for Mobile */}
         {sidebarOpen && isMobile && (
            <div
               className="fixed inset-0 z-40 transition-opacity duration-300 ease-out opacity-100 bg-black/60 backdrop-blur-sm lg:hidden"
               onClick={() => setSidebarOpen?.(false)}
            />
         )}

         {/* Fixed Thin Sidebar */}
         <aside
            ref={sidebarRef}
            className={`fixed top-0 left-0 h-full z-50 w-20 flex flex-col items-center py-6
               bg-transparent transition-transform duration-300 ease-out
               ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
            {/* Navigation Container - No horizontal or vertical scrollbars */}
            <nav className="flex flex-col gap-3 w-full h-full items-center overflow-hidden px-2">
               {/* Brand / Logo */}
               <div className="flex items-center space-x-2">
                  <span
                     className="
                     absolute
                     top-4 left-6
                     text-2xl font-bold
                     bg-[linear-gradient(110deg,#ffffff_25%,#a1a1aa_40%,#ffffff_50%,#a1a1aa_60%,#ffffff_75%)]
                     bg-[length:300%_100%]
                     bg-clip-text
                     text-transparent
                     animate-klique-shine
                  ">
                     Klique
                  </span>
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

         {/* Floating Portal Tooltip to prevent any overflow/scroll clipping */}
         {activeTooltip &&
            createPortal(
               <div
                  style={{ top: activeTooltip.top }}
                  className="fixed left-[88px] -translate-y-1/2 z-[999999] pointer-events-none whitespace-nowrap rounded-lg border border-zinc-800 bg-[#18181b] px-3.5 py-2 text-xs font-semibold text-zinc-100 shadow-2xl animate-fadeIn">
                  {activeTooltip.title}
               </div>,
               document.body,
            )}
      </>
   );
};

export default Navbar;
