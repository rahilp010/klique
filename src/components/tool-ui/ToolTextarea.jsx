import React from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function ToolTextarea({
   label,
   id,
   value,
   onChange,
   onClear,
   placeholder,
   rows = 6,
   error,
   disabled = false,
   required = false,
   showCount = false,
   className = '',
}) {
   const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
   const charCount = (value || '').length;
   const wordCount = (value || '').trim() === '' ? 0 : (value || '').trim().split(/\s+/).length;

   return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
         {label && (
            <div className="flex items-center justify-between">
               <label
                  htmlFor={textareaId}
                  className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <span>{label}</span>
                  {required && <span className="text-rose-400">*</span>}
               </label>
               {onClear && value && !disabled && (
                  <button
                     type="button"
                     onClick={onClear}
                     className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-0.5">
                     <X size={12} />
                     <span>Clear</span>
                  </button>
               )}
            </div>
         )}

         <div
            className={`relative flex w-full rounded-xl border bg-[#0d0d10] transition-all focus-within:ring-1 focus-within:ring-[#daf4aa]/50 ${
               error
                  ? 'border-rose-500/80 focus-within:border-rose-500'
                  : 'border-zinc-800 hover:border-zinc-700 focus-within:border-[#daf4aa]'
            } ${disabled ? 'opacity-50 cursor-not-allowed bg-zinc-900/50' : ''}`}>
            <textarea
               id={textareaId}
               value={value ?? ''}
               onChange={onChange}
               placeholder={placeholder}
               rows={rows}
               disabled={disabled}
               className="w-full bg-transparent p-3.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none resize-y customScrollbar leading-relaxed"
            />
         </div>

         <div className="flex items-center justify-between min-h-[16px]">
            {error ? (
               <p className="flex items-center gap-1 text-[11px] font-medium text-rose-400">
                  <AlertCircle size={12} className="shrink-0" />
                  <span>{error}</span>
               </p>
            ) : <span />}

            {showCount && (
               <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                  <span>{wordCount} words</span>
                  <span>·</span>
                  <span>{charCount} chars</span>
               </div>
            )}
         </div>
      </div>
   );
}

