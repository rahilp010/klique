import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { trackToolReset } from '../../lib/analytics';

export default function ResetButton({
   onReset,
   toolId = 'tool',
   label = 'Reset',
   disabled = false,
   variant = 'ghost', // 'ghost' | 'secondary'
   confirm = false,
   confirmMessage = 'Are you sure you want to reset all inputs?',
   className = '',
}) {
   const { showNotification } = useNotification();

   const handleReset = () => {
      if (disabled) return;
      if (confirm && !window.confirm(confirmMessage)) return;

      if (onReset) onReset();
      trackToolReset(toolId);
      showNotification('Reset to defaults', 'info');
   };

   return (
      <button
         type="button"
         onClick={handleReset}
         disabled={disabled}
         className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            variant === 'ghost'
               ? 'text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10'
               : 'bg-[#18181d] border border-zinc-800 text-zinc-400 hover:text-zinc-200'
         } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}>
         <RotateCcw size={14} />
         <span>{label}</span>
      </button>
   );
}

