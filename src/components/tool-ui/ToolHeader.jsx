import React from 'react';
import { Bookmark, ShieldCheck, Cloud, Sparkles } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { useNotification } from '../../hooks/useNotification';

export default function ToolHeader({
   toolId,
   title,
   description,
   category,
   privacy = 'local', // 'local' | 'cloud'
   badge,
   actions,
}) {
   const { favorited, toggle } = useFavorites(toolId);
   const { showNotification } = useNotification();

   const handleFavorite = () => {
      const isNowFav = toggle();
      showNotification(
         isNowFav ? 'Saved to Favorites' : 'Removed from Favorites',
         'info'
      );
   };

   return (
      <header className="mb-6 sm:mb-8 text-left">
         <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            {/* Badges container */}
            <div className="flex flex-wrap items-center gap-2">
               {category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 shadow-sm">
                     {category}
                  </span>
               )}

               {privacy === 'local' ? (
                  <span
                     className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                     title="Runs entirely in your browser. No data leaves your device.">
                     <ShieldCheck size={12} />
                     <span>Client-Side · Private</span>
                  </span>
               ) : (
                  <span
                     className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/25"
                     title="Processes data using external AI/Cloud API">
                     <Cloud size={12} />
                     <span>Cloud Processed</span>
                  </span>
               )}

               {badge && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#daf4aa]/15 text-[#daf4aa] border border-[#daf4aa]/30">
                     <Sparkles size={11} />
                     {badge}
                  </span>
               )}
            </div>

            {/* Header Right Actions (Bookmark / Custom) */}
            <div className="flex items-center gap-2">
               {actions}
               {toolId && (
                  <button
                     onClick={handleFavorite}
                     className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        favorited
                           ? 'bg-[#daf4aa]/15 text-[#daf4aa] border-[#daf4aa]/40 shadow-[0_0_12px_rgba(218,244,170,0.15)]'
                           : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                     }`}
                     title={favorited ? 'Favorited' : 'Add to Favorites'}>
                     <Bookmark
                        size={14}
                        className={favorited ? 'fill-[#daf4aa]' : ''}
                     />
                     <span className="hidden sm:inline">
                        {favorited ? 'Saved' : 'Favorite'}
                     </span>
                  </button>
               )}
            </div>
         </div>

         {/* Title & Description */}
         <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-zinc-100 mb-2">
            {title}
         </h1>
         {description && (
            <p className="text-sm sm:text-base text-zinc-400 font-normal leading-relaxed max-w-3xl">
               {description}
            </p>
         )}
      </header>
   );
}

