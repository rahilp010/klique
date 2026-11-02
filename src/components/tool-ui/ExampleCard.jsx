import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function ExampleCard({
   title,
   description,
   onApply,
   badge = 'Example',
   className = '',
}) {
   return (
      <div
         onClick={onApply}
         role="button"
         tabIndex={0}
         onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
               e.preventDefault();
               onApply?.();
            }
         }}
         className={`group text-left p-3.5 rounded-xl border border-zinc-800/80 bg-[#121215] hover:bg-zinc-900/80 hover:border-zinc-700/80 transition-all cursor-pointer flex items-center justify-between gap-3 ${className}`}>
         <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {badge}
               </span>
               <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
                  {title}
               </h4>
            </div>
            {description && (
               <p className="text-[11px] text-zinc-500 line-clamp-1">
                  {description}
               </p>
            )}
         </div>

         <div className="w-7 h-7 rounded-lg bg-zinc-800/60 text-zinc-400 group-hover:bg-[#daf4aa] group-hover:text-zinc-950 flex items-center justify-center shrink-0 transition-all">
            <ArrowRight size={13} />
         </div>
      </div>
   );
}

