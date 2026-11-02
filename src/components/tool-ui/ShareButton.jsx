import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';

export default function ShareButton({
   title = 'Klique Tool',
   text = 'Check out this useful free tool on Klique',
   url,
   label = 'Share',
   variant = 'secondary', // 'secondary' | 'icon'
   className = '',
}) {
   const [shared, setShared] = useState(false);
   const { showNotification } = useNotification();

   const handleShare = async () => {
      const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

      if (navigator.share) {
         try {
            await navigator.share({ title, text, url: shareUrl });
            return;
         } catch (err) {
            // Cancelled by user or failed, fallback to copy
            if (err.name === 'AbortError') return;
         }
      }

      try {
         await navigator.clipboard.writeText(shareUrl);
         setShared(true);
         showNotification('Link copied to clipboard!', 'success');
         setTimeout(() => setShared(false), 2000);
      } catch (err) {
         console.error('Failed to copy link:', err);
         showNotification('Failed to copy share link', 'error');
      }
   };

   if (variant === 'icon') {
      return (
         <button
            type="button"
            onClick={handleShare}
            title={label}
            className={`p-2 rounded-lg border border-zinc-800 bg-[#16161b] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all ${className}`}
            aria-label={label}>
            {shared ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
         </button>
      );
   }

   return (
      <button
         type="button"
         onClick={handleShare}
         className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-zinc-800 bg-[#18181d] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all ${className}`}>
         {shared ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
         <span>{shared ? 'Copied Link' : label}</span>
      </button>
   );
}

