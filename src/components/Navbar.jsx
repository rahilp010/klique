import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
   Home,
   Menu,
   X,
   Hash,
   Type,
   Smile,
   Sparkles,
   Sparkle,
} from 'lucide-react';

const Navbar = ({ sidebarOpen, setSidebarOpen, isMobile }) => {
   const location = useLocation();
   const sidebarRef = useRef(null);

   const NAV_ITEMS = [
      {
         title: 'Home',
         path: '/',
         icon: Home,
         gradient: 'from-red-900 to-yellow-400',
         borderColor: 'border-blue-400/30',
      },
      {
         title: 'Font Generator',
         path: '/fontgenerator',
         icon: Type,
         gradient: 'from-blue-500 via-cyan-400 to-teal-400',
         borderColor: 'border-purple-400/30',
      },
      {
         title: 'Emoji Generator',
         path: '/emojigenerator',
         icon: Smile,
         gradient: 'from-purple-500 via-pink-500 to-rose-400',
         borderColor: 'border-yellow-400/30',
      },
      {
         title: 'Cool Symbol',
         path: '/symbol',
         icon: Sparkles,
         gradient: 'from-emerald-500 via-teal-400 to-cyan-400',
         borderColor: 'border-green-400/30',
      },
      {
         title: 'Hashtag',
         path: '/hashtaggenerator',
         icon: Hash,
         gradient: 'from-amber-200 via-orange-500 to-blue-300',
         borderColor: 'border-red-400/30',
      },
      {
         title: 'Bio Generator',
         path: '/bio',
         icon: Sparkle,
         gradient: 'from-indigo-500 via-purple-500 to-pink-500',
         borderColor: 'border-red-400/30',
      },
      {
         title: 'Word Counter',
         path: '/wordcounter',
         icon: Sparkle,
         gradient: 'from-green-500 via-yellow-500 to-cyan-500',
         borderColor: 'border-red-400/30',
      },
      {
         title: 'AI Writer',
         path: '/aiwriter',
         icon: Sparkle,
         gradient: 'from-red-500 via-yellow-500 to-blue-500',
         borderColor: 'border-red-400/30',
      },
      {
         title: 'Username Generator',
         path: '/username',
         icon: Sparkle,
         gradient: 'from-violet-500 via-blue-500 to-blue-500',
         borderColor: 'border-red-400/30',
      },
      {
         title: 'Time Zone Converter',
         path: '/timezone',
         icon: Sparkle,
         gradient: 'from-violet-500 via-blue-500 to-blue-500',
         borderColor: 'border-red-400/30',
      },
   ];

   useEffect(() => {
      const handleClickOutside = (e) => {
         if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
            setSidebarOpen(false);
         }
      };
      if (sidebarOpen)
         document.addEventListener('mousedown', handleClickOutside);
      return () =>
         document.removeEventListener('mousedown', handleClickOutside);
   }, [sidebarOpen]);

   useEffect(() => {
      if (isMobile) setSidebarOpen(false);
   }, [location.pathname]);

   return (
      <>
         {/* Overlay always works when sidebar open */}
         {sidebarOpen && (
            <div
               className="fixed inset-0 z-40 transition-all duration-300 ease-out opacity-100 bg-black/60 backdrop-blur-sm"
               onClick={() => setSidebarOpen(false)}
            />
         )}

         <aside
            ref={sidebarRef}
            className={`fixed top-0 left-0 h-full z-50 w-72 sm:w-80
               bg-gradient-to-br from-white/10 via-white/5 to-transparent
               backdrop-blur-2xl border-r border-white/20 shadow-2xl shadow-black/30
               transition-transform duration-500 ease-out
               ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
            {/* Sidebar content same as before */}
            {/* Animated gradient background */}
            <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
               <div className="absolute -top-20 -left-20 w-60 h-60 bg-purple-500 rounded-full blur-3xl animate-pulse" />
               <div className="absolute top-1/2 -left-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
               <div className="absolute bottom-20 left-10 w-50 h-50 bg-pink-500 rounded-full blur-3xl animate-pulse delay-2000" />
            </div>

            {/* Sidebar Content */}
            <div className="relative h-full flex flex-col p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 customScrollbar">
               {/* Logo/Brand */}
               <div className="mb-8 mt-4">
                  <div className="flex items-center gap-3 px-4 py-3 ">
                     <div>
                        <p className="text-4xl font-bold text-white">Menu</p>
                     </div>
                  </div>
               </div>

               {/* Navigation Links */}
               <nav className="flex-1 space-y-2">
                  {NAV_ITEMS.map((item) => {
                     const isActive = location.pathname === item.path;
                     const Icon = item.icon;

                     return (
                        <Link
                           key={item.path}
                           to={item.path}
                           className={`
                              group relative flex items-center gap-4 px-4 py-3
                              rounded-2xl font-medium text-sm
                              transition-all duration-300 ease-out
                              overflow-hidden
                              ${
                                 isActive
                                    ? `bg-gradient-to-r ${item.gradient} border ${item.borderColor} text-white shadow-lg scale-105`
                                    : 'text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 border border-transparent'
                              }
                           `}>
                           {/* Animated background on hover */}
                           <div
                              className={`
                              absolute inset-0 bg-gradient-to-r ${item.gradient}
                              opacity-0 group-hover:opacity-100 transition-opacity duration-300
                              ${isActive ? 'opacity-100' : ''}
                           `}
                           />

                           {/* Icon */}
                           <div
                              className={`
                              relative z-10 w-10 h-10 rounded-xl 
                              flex items-center justify-center
                              transition-all duration-300
                              ${
                                 isActive
                                    ? 'bg-white/20 shadow-lg'
                                    : 'bg-white/5 group-hover:bg-white/15'
                              }
                           `}>
                              <Icon size={20} />
                           </div>

                           {/* Text */}
                           <span className="relative z-10 flex-1">
                              {item.title}
                           </span>

                           {/* Active indicator */}
                           {isActive && (
                              <div className="relative z-10 w-2 h-2 rounded-full bg-white animate-pulse" />
                           )}
                        </Link>
                     );
                  })}
               </nav>

               {/* Footer */}
               <div className="mt-8 pt-6 border-t border-white/20">
                  <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
                     <p className="text-xs text-gray-400 mb-1">Made with ❤️</p>
                     <p className="text-xs text-white/70">Version 1.0.0</p>
                  </div>
               </div>
            </div>
         </aside>
      </>
   );
};

export default Navbar;
