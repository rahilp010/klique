import React from 'react';
import { Download } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';
import { trackToolDownload } from '../../lib/analytics';

export default function DownloadButton({
   content,
   filename = 'download.txt',
   mimeType = 'text/plain;charset=utf-8',
   toolId = 'tool',
   label = 'Download',
   variant = 'secondary', // 'primary' | 'secondary' | 'icon'
   disabled = false,
   className = '',
}) {
   const { showNotification } = useNotification();

   const handleDownload = () => {
      if (!content || disabled) return;

      try {
         const blob =
            content instanceof Blob
               ? content
               : new Blob([content], { type: mimeType });
         const url = URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.download = filename;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         URL.revokeObjectURL(url);

         showNotification(`Downloaded ${filename}`, 'success');
         trackToolDownload(toolId, {
            fileType: filename.split('.').pop() || '',
            fileSize: blob.size,
         });
      } catch (err) {
         console.error('Download failed:', err);
         showNotification('Download failed', 'error');
      }
   };

   if (variant === 'icon') {
      return (
         <button
            type="button"
            onClick={handleDownload}
            disabled={disabled || !content}
            title={label}
            className={`p-2 rounded-lg border border-zinc-800 bg-[#16161b] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all ${className}`}
            aria-label={label}>
            <Download size={15} />
         </button>
      );
   }

   const isPrimary = variant === 'primary';

   return (
      <button
         type="button"
         onClick={handleDownload}
         disabled={disabled || !content}
         className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            isPrimary
               ? 'bg-[#daf4aa] text-zinc-950 hover:bg-[#daf4aa]/90 shadow-[0_0_20px_rgba(218,244,170,0.25)]'
               : 'bg-[#18181d] border border-zinc-800 text-zinc-200 hover:bg-zinc-800/80 hover:text-white'
         } disabled:opacity-40 disabled:cursor-not-allowed ${className}`}>
         <Download size={16} />
         <span>{label}</span>
      </button>
   );
}

