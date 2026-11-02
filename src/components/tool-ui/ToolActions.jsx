import React from 'react';

export default function ToolActions({ children, className = '' }) {
   return (
      <div
         className={`flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-800/60 ${className}`}>
         {children}
      </div>
   );
}

