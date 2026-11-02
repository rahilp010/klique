import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { trackToolCopy } from '../../lib/analytics';

export default function CopyButton({
   text,
   toolId = 'tool',
   label = 'Copy',
   copiedLabel = 'Copied!',
   variant = 'secondary', // 'primary' | 'secondary' | 'icon'
   disabled = false,
   className = '',
}) {
   const [copied, setCopied] = useState(false);
   const { showNotification } = useNotification();

   const handleCopy = async () => {
      if (!text || disabled) return;

      try {
         await navigator.clipboard.writeText(String(text));
         setCopied(true);
         showNotification('Copied to clipboard!', 'success');
         trackToolCopy(toolId, { outputType: typeof text, size: String(text).length });
         setTimeout(() => setCopied(false), 2000);
      } catch (err) {
         console.error('Failed to copy text:', err);
         showNotification('Failed to copy to clipboard', 'error');
      }
   };

   if (variant === 'icon') {
      return (
         <button
            type="button"
            onClick={handleCopy}
            disabled={disabled || !text}
            title={copied ? copiedLabel : label}
            className={`p-2 rounded-lg border transition-all ${
               copied
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-800 bg-[#16161b] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
            } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
            aria-label={label}>
            {copied ? <Check size={15} /> : <Copy size={15} />}
         </button>
      );
   }

   const isPrimary = variant === 'primary';

   return (
      <button
         type="button"
         onClick={handleCopy}
         disabled={disabled || !text}
         className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            copied
               ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
               : isPrimary
               ? 'bg-[#daf4aa] text-zinc-950 hover:bg-[#daf4aa]/90 shadow-[0_0_20px_rgba(218,244,170,0.25)]'
               : 'bg-[#18181d] border border-zinc-800 text-zinc-200 hover:bg-zinc-800/80 hover:text-white'
         } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}>
         {copied ? <Check size={16} /> : <Copy size={16} />}
         <span>{copied ? copiedLabel : label}</span>
      </button>
   );
}

