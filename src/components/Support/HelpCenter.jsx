/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
   Search,
   HelpCircle,
   BookOpen,
   MessageSquare,
   FileCode,
   Image as ImageIcon,
   ShieldCheck,
   Sparkles,
   ArrowRight,
   CheckCircle2,
   AlertCircle,
   ExternalLink,
   Copy,
   Check,
   Mail,
   Braces,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../Navbar';
import SEO from '../SEO';

const HELP_CATEGORIES = [
   {
      id: 'developer',
      title: 'Developer Tools',
      icon: FileCode,
      desc: 'Guides for JSON Formatter & Diff, Code to Image, SVG Converter, and QR Link Tools.',
      articles: [
         {
            title: 'How to compare and repair JSON data with diffing',
            desc: 'Use the interactive tree visualizer, line numbers, and JSON repair engine to fix malformed keys.',
            link: '/jsonformatter',
         },
         {
            title: 'Exporting 3x Retina code snippet screenshots',
            desc: 'Configure custom themes, font sizes, macOS buttons, and download crisp retina PNGs or vector SVGs.',
            link: '/codeimage',
         },
         {
            title: 'Optimizing SVGs with SVGO and converting to React JSX',
            desc: 'Clean redundant vector paths, minify XML, and export directly as TypeScript or JSX components.',
            link: '/svgconverter',
         },
      ],
   },
   {
      id: 'media',
      title: 'Media & File Converters',
      icon: ImageIcon,
      desc: 'Learn about client-side image compression, favicon suites, and PDF transformations.',
      articles: [
         {
            title: 'Client-side image compression to WebP without uploads',
            desc: 'How browser Canvas compression preserves confidentiality while cutting file sizes by up to 85%.',
            link: '/imageoptimizer',
         },
         {
            title: 'Generating full PWA webmanifest and multi-resolution icons',
            desc: 'Create 16x16, 32x32, 192x192, 512x512 icons, Apple touch icons, and download a ready-to-use ZIP.',
            link: '/favicongenerator',
         },
      ],
   },
   {
      id: 'marketing',
      title: 'Social & Marketing Suite',
      icon: Sparkles,
      desc: 'Inspect link previews, build trackable UTMs, and craft engaging social copy.',
      articles: [
         {
            title: 'Testing Open Graph cards for Twitter, LinkedIn & Discord',
            desc: 'Verify character limits, preview social link cards, and copy complete HTML meta tag snippets.',
            link: '/ogpreviewer',
         },
         {
            title: 'Creating UTM campaign tracking links with presets',
            desc: 'Add utm_source, utm_medium, and utm_campaign query parameters to track marketing conversions.',
            link: '/qrlinktools',
         },
      ],
   },
   {
      id: 'privacy',
      title: 'Privacy & Architecture',
      icon: ShieldCheck,
      desc: 'Learn how Klique protects your data with 100% in-browser processing.',
      articles: [
         {
            title: 'Why your files never leave your device',
            desc: 'Learn about our zero-server processing architecture and client-side cryptography.',
            link: '/privacy',
         },
         {
            title: 'Browser local storage and preference caching',
            desc: 'How your selected themes, options, and preferences are stored locally on your machine.',
            link: '/terms',
         },
      ],
   },
];

export default function HelpCenter() {
   const [searchQuery, setSearchQuery] = useState('');
   const [toast, setToast] = useState({
      visible: false,
      message: '',
      type: 'success',
   });

   const showToast = (message, type = 'success') => {
      setToast({ visible: true, message, type });
      setTimeout(
         () => setToast({ visible: false, message: '', type: 'success' }),
         2600,
      );
   };

   // Filter articles based on search query
   const filteredCategories = useMemo(() => {
      if (!searchQuery.trim()) return HELP_CATEGORIES;
      const q = searchQuery.toLowerCase();
      return HELP_CATEGORIES.map((cat) => ({
         ...cat,
         articles: cat.articles.filter(
            (art) =>
               art.title.toLowerCase().includes(q) ||
               art.desc.toLowerCase().includes(q) ||
               cat.title.toLowerCase().includes(q),
         ),
      })).filter((cat) => cat.articles.length > 0);
   }, [searchQuery]);

   const copyEmail = () => {
      navigator.clipboard.writeText('support@klique.app');
      showToast('Support email copied to clipboard!');
   };

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden
         before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]
         after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
         <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]" />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         <SEO
            title="Help Center & User Guides - Klique Creator & Developer Suite"
            description="Find tutorials, troubleshooting steps, and user guides for Klique tools including JSON Formatter, Code to Image, Image Optimizer, and QR Link Tools."
            keywords="klique help center, developer tools guides, image optimizer tutorial, code to image help, json formatter tutorial, klique support"
            canonicalUrl="https://klique.netlify.app/help"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'HelpPage',
               name: 'Klique Help Center',
               description:
                  'Tutorials, troubleshooting guides, and documentation for Klique tools.',
               publisher: {
                  '@type': 'Organization',
                  name: 'Klique',
                  url: 'https://klique.netlify.app',
               },
            }}
         />

         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         {/* Toast Notification */}
         <AnimatePresence>
            {toast.visible && (
               <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="fixed right-4 top-4 z-[10000] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-zinc-800 bg-[#0f0f11]/95 px-4 py-3 text-sm font-medium shadow-2xl shadow-black/50 backdrop-blur-xl sm:right-6 sm:top-6">
                  {toast.type === 'error' ? (
                     <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                     <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span className="text-zinc-200">{toast.message}</span>
               </motion.div>
            )}
         </AnimatePresence>

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col pb-28 pt-10 sm:pb-24 sm:pt-6 lg:pl-20">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center sm:text-left mb-8">
               <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                  <Braces size={14} className="text-[#daf4aa]" />
                  <span>Support Knowledge Base</span>
               </div>
               <h1 className="text-3xl font-medium tracking-tight text-white sm:text-5xl">
                  How can we help you?
               </h1>
               <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
                  Explore tutorials, FAQs, and workflow tips across all Klique
                  developer and creator utilities.
               </p>

               {/* Search Bar */}
               <div className="mt-6 max-w-xl relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
                  <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search articles, guides, or tool names..."
                     className="w-full bg-[#18181b] border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40 transition-all shadow-xl"
                  />
                  {searchQuery && (
                     <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-3 text-xs text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800">
                        Clear
                     </button>
                  )}
               </div>
            </motion.div>

            {/* Quick Link Shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
               {[
                  { label: 'Frequently Asked Questions', to: '/faqs' },
                  { label: 'Privacy Policy', to: '/privacy' },
                  { label: 'Terms & Conditions', to: '/terms' },
                  { label: 'About Us', to: '/aboutus' },
               ].map((item, idx) => (
                  <Link
                     key={idx}
                     to={item.to}
                     className="p-3.5 rounded-xl border border-zinc-800 bg-[#0f0f11]/80 hover:border-[#daf4aa]/50 hover:bg-[#18181b] transition-all text-center text-xs font-medium text-zinc-300 hover:text-white">
                     {item.label}
                  </Link>
               ))}
            </div>

            {/* Categories & Articles List */}
            <div className="space-y-8 mb-14">
               {filteredCategories.length === 0 ? (
                  <div className="p-10 rounded-2xl border border-zinc-800 bg-[#0f0f11] text-center space-y-2">
                     <p className="text-sm font-medium text-zinc-300">
                        No articles matched "{searchQuery}"
                     </p>
                     <p className="text-xs text-zinc-500">
                        Try searching for another keyword like "JSON", "Image",
                        "Privacy", or "QR".
                     </p>
                  </div>
               ) : (
                  filteredCategories.map((cat) => {
                     const Icon = cat.icon;
                     return (
                        <div
                           key={cat.id}
                           className="p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-[#0f0f11] backdrop-blur-xl shadow-xl space-y-5">
                           <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4">
                              <div className="w-10 h-10 rounded-xl bg-[#daf4aa]/10 border border-[#daf4aa]/20 flex items-center justify-center">
                                 <Icon className="w-5 h-5 text-[#daf4aa]" />
                              </div>
                              <div>
                                 <h2 className="text-base font-bold text-white">
                                    {cat.title}
                                 </h2>
                                 <p className="text-xs text-zinc-400 mt-0.5">
                                    {cat.desc}
                                 </p>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {cat.articles.map((art, aIdx) => (
                                 <Link
                                    key={aIdx}
                                    to={art.link}
                                    className="p-4 rounded-xl border border-zinc-800/70 bg-[#18181b]/50 hover:bg-[#18181b] hover:border-[#daf4aa]/40 transition-all group flex flex-col justify-between space-y-2">
                                    <div>
                                       <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-white flex items-center justify-between">
                                          <span>{art.title}</span>
                                          <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#daf4aa] transition-transform group-hover:translate-x-1 shrink-0 ml-2" />
                                       </h3>
                                       <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed line-clamp-2">
                                          {art.desc}
                                       </p>
                                    </div>
                                    <span className="text-[11px] font-medium text-[#daf4aa] pt-1">
                                       Launch Tool →
                                    </span>
                                 </Link>
                              ))}
                           </div>
                        </div>
                     );
                  })
               )}
            </div>

            {/* Need More Help / Contact Card */}
            <div className="p-8 rounded-3xl border border-zinc-800 bg-[#0f0f11] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
               <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                     <MessageSquare className="w-3.5 h-3.5 text-[#daf4aa]" />
                     <span>Still have questions?</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                     Get in touch with our team
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-md">
                     Encountering a bug, have a feature suggestion, or need help
                     with a specific utility? We’re always listening.
                  </p>
               </div>
               <button
                  type="button"
                  onClick={copyEmail}
                  className="px-5 py-3 rounded-xl bg-[#daf4aa] hover:bg-[#cbe699] text-[#16161b] font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-[#daf4aa]/15 shrink-0">
                  <Mail className="w-4 h-4" />
                  <span>Copy rahilp704@gmail.com</span>
               </button>
            </div>
         </main>
      </div>
   );
}
