/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function ToolBreadcrumb({ category, categorySlug, toolName }) {
   return (
      <nav
         aria-label="Breadcrumb"
         className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap customScrollbar py-1">
         <Link
            to="/"
            className="flex items-center gap-1 hover:text-zinc-200 transition-colors text-zinc-500">
            <Home size={13} />
            <span>Home</span>
         </Link>

         {category && (
            <>
               <ChevronRight size={13} className="text-zinc-700 shrink-0" />
               <span className="hover:text-zinc-300 transition-colors text-zinc-500">
                  {category}
               </span>
            </>
         )}

         {toolName && (
            <>
               <ChevronRight size={13} className="text-zinc-700 shrink-0" />
               <span className="text-zinc-300 font-semibold truncate max-w-[200px] sm:max-w-none">
                  {toolName}
               </span>
            </>
         )}
      </nav>
   );
}
