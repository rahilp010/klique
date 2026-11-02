/* eslint-disable no-unused-vars */
import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ToolResult({
   label,
   value,
   description,
   subvalue,
   highlight = false,
   trend, // 'positive' | 'negative' | 'neutral'
   icon: Icon,
   actions,
   className = '',
}) {
   return (
      <div
         className={`relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl border transition-all ${
            highlight
               ? 'bg-gradient-to-b from-[#1b1e16] to-[#131416] border-[#daf4aa]/30 shadow-[0_0_25px_rgba(218,244,170,0.06)]'
               : 'bg-[#121216] border-zinc-800/80 hover:border-zinc-700/80'
         } ${className}`}>
         <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
               {Icon && (
                  <div
                     className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        highlight
                           ? 'bg-[#daf4aa]/20 text-[#daf4aa]'
                           : 'bg-zinc-800 text-zinc-400'
                     }`}>
                     <Icon size={14} />
                  </div>
               )}
               <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {label}
               </span>
            </div>

            {trend && (
               <div className="flex items-center gap-1 text-[11px] font-medium">
                  {trend === 'positive' && (
                     <span className="text-emerald-400 flex items-center gap-0.5">
                        <TrendingUp size={13} />
                     </span>
                  )}
                  {trend === 'negative' && (
                     <span className="text-rose-400 flex items-center gap-0.5">
                        <TrendingDown size={13} />
                     </span>
                  )}
                  {trend === 'neutral' && (
                     <span className="text-zinc-500 flex items-center gap-0.5">
                        <Minus size={13} />
                     </span>
                  )}
               </div>
            )}

            {actions && <div className="shrink-0">{actions}</div>}
         </div>

         <div className="my-1">
            <div
               className={`text-2xl sm:text-3xl font-bold tracking-tight truncate ${
                  highlight ? 'text-[#daf4aa]' : 'text-zinc-100'
               }`}>
               {value ?? '—'}
            </div>
            {subvalue && (
               <div className="text-xs text-zinc-400 font-medium mt-0.5 truncate">
                  {subvalue}
               </div>
            )}
         </div>

         {description && (
            <p className="text-[11px] text-zinc-500 font-normal leading-normal mt-1 border-t border-zinc-800/50 pt-2">
               {description}
            </p>
         )}
      </div>
   );
}
