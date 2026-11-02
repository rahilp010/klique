import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import SEO from '../SEO';
import ToolBreadcrumb from './ToolBreadcrumb';
import ToolHeader from './ToolHeader';
import RelatedTools from './RelatedTools';
import ToolFAQ from './ToolFAQ';
import ToolSearch from './ToolSearch';
import { NotificationProvider } from '../../hooks/useNotification';
import { addRecentTool } from '../../lib/storage';
import { trackToolView } from '../../lib/analytics';
import { Search } from 'lucide-react';

function ToolLayoutContent({
   toolId,
   title,
   description,
   category,
   privacy = 'local',
   badge,
   keywords,
   canonicalUrl,
   seoJsonLd,
   faqs = [],
   showRelated = true,
   headerActions,
   children,
   maxWidth = 'max-w-5xl',
}) {
   const [searchOpen, setSearchOpen] = useState(false);

   useEffect(() => {
      if (toolId) {
         addRecentTool(toolId);
         trackToolView(toolId, category);
      }
   }, [toolId, category]);

   // Default JSON-LD software/web application schema
   const defaultJsonLd = seoJsonLd || {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: title,
      applicationCategory: category || 'UtilitiesApplication',
      operatingSystem: 'Any',
      description: description,
      offers: {
         '@type': 'Offer',
         price: '0',
         priceCurrency: 'USD',
      },
   };

   return (
      <div className="relative min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-[#daf4aa]/30 selection:text-white">
         {/* SEO metadata */}
         <SEO
            title={`${title} - Free Online Tool | Klique`}
            description={description}
            keywords={keywords}
            canonicalUrl={canonicalUrl}
            jsonLd={defaultJsonLd}
         />

         {/* Navigation */}
         <div className="relative z-[100] w-full">
            <Navbar />
         </div>

         {/* Floating Quick Search Button for Desktop */}
         <div className="fixed top-5 right-6 z-40 hidden md:block">
            <button
               onClick={() => setSearchOpen(true)}
               className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 hover:text-white hover:border-zinc-700 backdrop-blur-md transition-all shadow-lg">
               <Search size={13} className="text-[#daf4aa]" />
               <span>Search tools</span>
               <kbd className="px-1.5 py-0.2 bg-zinc-800 rounded text-[10px] text-zinc-400 font-mono">
                  ⌘K
               </kbd>
            </button>
         </div>

         {/* Main Container */}
         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full flex-col px-4 pb-28 pt-20 sm:px-6 sm:pb-24 sm:pt-24 lg:pl-24 lg:pr-8">
            <div className={`mx-auto w-full ${maxWidth}`}>
               {/* Breadcrumbs */}
               <ToolBreadcrumb
                  category={category}
                  toolName={title}
               />

               {/* Standardized Tool Header */}
               <ToolHeader
                  toolId={toolId}
                  title={title}
                  description={description}
                  category={category}
                  privacy={privacy}
                  badge={badge}
                  actions={headerActions}
               />

               {/* Main Tool Workspace */}
               <div className="w-full min-w-0">
                  {children}
               </div>

               {/* FAQs Section */}
               {faqs && faqs.length > 0 && (
                  <ToolFAQ faqs={faqs} />
               )}

               {/* Related Tools Section */}
               {showRelated && toolId && (
                  <RelatedTools currentToolId={toolId} />
               )}
            </div>
         </main>

         {/* Global Tool Search Modal */}
         <ToolSearch
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
         />
      </div>
   );
}

export default function ToolLayout(props) {
   return (
      <NotificationProvider>
         <ToolLayoutContent {...props} />
      </NotificationProvider>
   );
}

