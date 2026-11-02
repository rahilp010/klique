import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { getRelatedTools } from '../../data/tools';
import { preloadRoute } from '../../App';

export default function RelatedTools({ currentToolId, limit = 3, className = '' }) {
   const related = getRelatedTools(currentToolId, limit);

   if (!related || related.length === 0) return null;

   return (
      <section className={`mt-12 sm:mt-16 pt-8 border-t border-zinc-800/60 ${className}`}>
         <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
               <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <Sparkles size={16} className="text-[#daf4aa]" />
                  Related Utilities
               </h3>
               <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  Frequently paired tools to help you finish your workflow
               </p>
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {related.map((tool) => (
               <Link
                  key={tool.id}
                  to={tool.slug}
                  onMouseEnter={() => preloadRoute(tool.slug)}
                  className="group relative flex flex-col justify-between p-4 rounded-2xl bg-[#121216] border border-zinc-800/80 hover:border-zinc-700 hover:bg-[#16161b] transition-all">
                  <div>
                     <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                           {tool.category}
                        </span>
                        <div className="text-zinc-600 group-hover:text-[#daf4aa] transition-colors">
                           <ArrowUpRight size={15} />
                        </div>
                     </div>
                     <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-white mb-1 transition-colors">
                        {tool.name}
                     </h4>
                     <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                        {tool.description}
                     </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[11px] font-medium text-zinc-400 group-hover:text-[#daf4aa] transition-colors">
                     <span>Open tool</span>
                     <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </div>
               </Link>
            ))}
         </div>
      </section>
   );
}

