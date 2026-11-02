import React from 'react';
import { ChevronDown, AlertCircle, HelpCircle } from 'lucide-react';

export default function ToolSelect({
   label,
   id,
   value,
   onChange,
   options = [],
   error,
   helpText,
   disabled = false,
   required = false,
   className = '',
}) {
   const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

   return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
         {label && (
            <div className="flex items-center justify-between">
               <label
                  htmlFor={selectId}
                  className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <span>{label}</span>
                  {required && <span className="text-rose-400">*</span>}
                  {helpText && (
                     <span className="text-zinc-500 hover:text-zinc-300 cursor-help" title={helpText}>
                        <HelpCircle size={12} />
                     </span>
                  )}
               </label>
            </div>
         )}

         <div
            className={`relative flex items-center w-full rounded-xl border bg-[#0d0d10] transition-all focus-within:ring-1 focus-within:ring-[#daf4aa]/50 ${
               error
                  ? 'border-rose-500/80 focus-within:border-rose-500'
                  : 'border-zinc-800 hover:border-zinc-700 focus-within:border-[#daf4aa]'
            } ${disabled ? 'opacity-50 cursor-not-allowed bg-zinc-900/50' : ''}`}>
            <select
               id={selectId}
               value={value}
               onChange={onChange}
               disabled={disabled}
               className="w-full appearance-none bg-transparent py-2.5 pl-3.5 pr-10 text-sm text-zinc-100 outline-none cursor-pointer">
               {options.map((opt) => {
                  const val = typeof opt === 'object' ? opt.value : opt;
                  const lbl = typeof opt === 'object' ? opt.label : opt;
                  return (
                     <option key={val} value={val} className="bg-[#141418] text-zinc-200">
                        {lbl}
                     </option>
                  );
               })}
            </select>

            <ChevronDown
               size={16}
               className="pointer-events-none absolute right-3.5 text-zinc-500"
            />
         </div>

         {error && (
            <p className="flex items-center gap-1 text-[11px] font-medium text-rose-400 mt-0.5">
               <AlertCircle size={12} className="shrink-0" />
               <span>{error}</span>
            </p>
         )}
      </div>
   );
}

