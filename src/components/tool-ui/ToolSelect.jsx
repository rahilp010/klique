import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';
import { Dropdown } from '../ui/CustomControl';

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

         <Dropdown
            id={selectId}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className={`min-h-11 h-auto rounded-xl bg-[#0d0d10] px-3.5 py-2.5 text-sm text-zinc-100 ${
               error
                  ? 'border-rose-500/80'
                  : 'border-zinc-800 hover:border-zinc-700'
            }`}>
            {options.map((opt) => {
               const val = typeof opt === 'object' ? opt.value : opt;
               const lbl = typeof opt === 'object' ? opt.label : opt;
               return (
                  <option key={val} value={val} className="bg-[#141418] text-zinc-200">
                     {lbl}
                  </option>
               );
            })}
         </Dropdown>

         {error && (
            <p className="flex items-center gap-1 text-[11px] font-medium text-rose-400 mt-0.5">
               <AlertCircle size={12} className="shrink-0" />
               <span>{error}</span>
            </p>
         )}
      </div>
   );
}
