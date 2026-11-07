import React from 'react';
import { X, AlertCircle, HelpCircle } from 'lucide-react';
import { InputControl } from '../ui/CustomControl';

export default function ToolInput({
   label,
   id,
   value,
   onChange,
   onClear,
   type = 'text',
   placeholder,
   prefix,
   suffix,
   error,
   helpText,
   min,
   max,
   step,
   disabled = false,
   required = false,
   autoFocus = false,
   className = '',
}) {
   const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

   return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
         {label && (
            <div className="flex items-center justify-between">
               <label
                  htmlFor={inputId}
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
            {prefix && (
               <span className="pl-3.5 pr-1.5 text-xs font-medium text-zinc-500 select-none shrink-0">
                  {prefix}
               </span>
            )}

            <InputControl
               id={inputId}
               type={type}
               value={value ?? ''}
               onChange={onChange}
               placeholder={placeholder}
               min={min}
               max={max}
               step={step}
               disabled={disabled}
               required={required}
               autoFocus={autoFocus}
               className={`w-full bg-transparent py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none ${
                  prefix ? 'pl-0' : 'pl-3.5'
               } ${suffix || (onClear && value) ? 'pr-9' : 'pr-3.5'} border-0 rounded-none px-0`}
            />

            {/* Clear button if value exists */}
            {onClear && value && !disabled && (
               <button
                  type="button"
                  onClick={onClear}
                  className="absolute right-2.5 p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label="Clear input">
                  <X size={14} />
               </button>
            )}

            {suffix && !onClear && (
               <span className="pr-3.5 pl-1.5 text-xs font-medium text-zinc-500 select-none shrink-0">
                  {suffix}
               </span>
            )}
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
