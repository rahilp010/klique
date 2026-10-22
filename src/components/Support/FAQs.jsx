/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
   HelpCircle,
   ChevronDown,
   Search,
   Sparkles,
   ShieldCheck,
   Code2,
   Zap,
   MessageSquare,
   ExternalLink,
   ArrowRight,
   Braces,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../Navbar';
import SEO from '../SEO';

const FAQ_DATA = [
   {
      category: 'Privacy & Security',
      question:
         'Does Klique upload or store my data, images, or JSON on a server?',
      answer:
         'No. Klique is strictly engineered around a client-side architecture. When you format JSON, optimize an image, parse URLs, or render a code card, all processing executes directly in your browser memory via JavaScript, HTML5 Canvas, and WebAssembly. Your data never touches our servers.',
   },
   {
      category: 'General',
      question: 'Is Klique completely free to use?',
      answer:
         'Yes, 100% free. There are no subscriptions, hidden limits, premium tiers, or forced account registrations. All utilities are unlocked and unrestricted for both personal and commercial use.',
   },
   {
      category: 'Developer Tools',
      question:
         'Can I use generated QR codes, code images, and favicons for commercial projects?',
      answer:
         'Absolutely. Any asset you generate or convert with Klique (including QR codes, retina code screenshots, optimized WebP images, and favicon packages) is your sole intellectual property. You can freely use them in commercial apps, client websites, and marketing campaigns.',
   },
   {
      category: 'Converters & Media',
      question:
         'What is the advantage of converting images to WebP in Image Optimizer?',
      answer:
         'WebP provides superior lossless and lossy compression for web images. On average, WebP images are 25–34% smaller than comparable JPEGs and up to 80% smaller than PNGs while preserving visual clarity and alpha transparency, resulting in much faster website load times and improved SEO.',
   },
   {
      category: 'Developer Tools',
      question: 'How does the JSON Repair feature work in JSON Formatter?',
      answer:
         'The JSON repair algorithm analyzes common syntax mistakes—such as unquoted keys, single quotes instead of double quotes, trailing commas, and escaped characters—and automatically reconstructs valid standard JSON without manual editing.',
   },
   {
      category: 'Converters & Media',
      question:
         'What sizes are included in the Favicon Generator ZIP download?',
      answer:
         'The generated ZIP package includes standard sizes: 16×16, 32×32, 48×48 (for desktop browsers), 180×180 (Apple touch icon for iOS), 192×192 and 512×512 (Android Chrome PWA icons), a Windows tile icon (150×150), and a ready-to-use site.webmanifest file with HTML meta tags.',
   },
   {
      category: 'General',
      question: 'What browsers and devices does Klique support?',
      answer:
         'Klique is fully responsive and compatible with all modern evergreen browsers including Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, and mobile browsers on iOS and Android.',
   },
   {
      category: 'Privacy & Security',
      question: 'Do you track users or use third-party advertising cookies?',
      answer:
         'No. We do not use third-party advertising tracking cookies or intrusive surveillance scripts. We respect developer privacy and keep our codebase clean, transparent, and minimal.',
   },
];

const CATEGORIES = [
   'All',
   'Privacy & Security',
   'Developer Tools',
   'Converters & Media',
   'General',
];

export default function FAQs() {
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedCategory, setSelectedCategory] = useState('All');
   const [openIndex, setOpenIndex] = useState(null);

   const toggleFaq = (index) => {
      setOpenIndex(openIndex === index ? null : index);
   };

   const filteredFaqs = useMemo(() => {
      return FAQ_DATA.filter((faq) => {
         const matchesCategory =
            selectedCategory === 'All' || faq.category === selectedCategory;
         const q = searchQuery.toLowerCase().trim();
         const matchesSearch =
            !q ||
            faq.question.toLowerCase().includes(q) ||
            faq.answer.toLowerCase().includes(q) ||
            faq.category.toLowerCase().includes(q);
         return matchesCategory && matchesSearch;
      });
   }, [searchQuery, selectedCategory]);

   // Schema.org FAQPage Structured Data
   const faqJsonLd = useMemo(() => {
      return {
         '@context': 'https://schema.org',
         '@type': 'FAQPage',
         mainEntity: FAQ_DATA.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
               '@type': 'Answer',
               text: item.answer,
            },
         })),
      };
   }, []);

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
            title="Frequently Asked Questions (FAQs) - Klique Utilities Suite"
            description="Find instant answers to questions regarding client-side privacy, free commercial usage, image optimization, JSON formatting, and developer tools."
            keywords="klique faqs, frequently asked questions, developer tools faqs, client side privacy faq, webp converter questions, json validator faq"
            canonicalUrl="https://klique.netlify.app/faqs"
            jsonLd={faqJsonLd}
         />

         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col pb-28 pt-10 sm:pb-24 sm:pt-6 lg:pl-20">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center sm:text-left mb-8">
               <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                  <Braces size={14} className="text-[#daf4aa]" />
                  <span>Common Questions Answered</span>
               </div>
               <h1 className="text-3xl font-medium tracking-tight text-white sm:text-5xl">
                  Frequently Asked Questions
               </h1>
               <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
                  Everything you need to know about Klique's features,
                  client-side privacy, file handling, and licensing.
               </p>

               {/* Search Bar */}
               <div className="mt-6 relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-4 top-3.5" />
                  <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Search questions or keywords..."
                     className="w-full bg-[#18181b] border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40 transition-all shadow-xl"
                  />
               </div>

               {/* Category Filter Pills */}
               <div className="flex flex-wrap gap-2 mt-4">
                  {CATEGORIES.map((cat) => (
                     <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                           selectedCategory === cat
                              ? 'bg-[#daf4aa] text-black font-semibold shadow-md'
                              : 'bg-[#18181b] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}>
                        {cat}
                     </button>
                  ))}
               </div>
            </motion.div>

            {/* Accordion FAQ List */}
            <div className="space-y-3 mb-14">
               {filteredFaqs.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-zinc-800 bg-[#0f0f11] text-center text-sm text-zinc-400">
                     No questions found matching "{searchQuery}".
                  </div>
               ) : (
                  filteredFaqs.map((faq, idx) => {
                     const isOpen = openIndex === idx;
                     return (
                        <div
                           key={idx}
                           className="rounded-2xl border border-zinc-800 bg-[#0f0f11]/90 backdrop-blur-xl overflow-hidden transition-all">
                           <button
                              type="button"
                              onClick={() => toggleFaq(idx)}
                              className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                              <span className="text-sm sm:text-base font-semibold text-zinc-200">
                                 {faq.question}
                              </span>
                              <div
                                 className={`w-7 h-7 rounded-lg border border-zinc-800 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                                    isOpen
                                       ? 'bg-[#daf4aa]/20 border-[#daf4aa]/40 rotate-180'
                                       : 'bg-[#18181b]'
                                 }`}>
                                 <ChevronDown
                                    className={`w-4 h-4 ${
                                       isOpen
                                          ? 'text-[#daf4aa]'
                                          : 'text-zinc-400'
                                    }`}
                                 />
                              </div>
                           </button>

                           <AnimatePresence initial={false}>
                              {isOpen && (
                                 <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden border-t border-zinc-800/80 bg-[#18181b]/30">
                                    <div className="p-5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                                       {faq.answer}
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     );
                  })
               )}
            </div>

            {/* Need More Assistance Card */}
            <div className="p-8 rounded-3xl border border-zinc-800 bg-[#0f0f11] text-center space-y-3 shadow-xl">
               <h3 className="text-base font-bold text-white">
                  Didn't find your answer?
               </h3>
               <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Check out our detailed guides in the Help Center or review our
                  Terms & Privacy Policy.
               </p>
               <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <Link
                     to="/help"
                     className="px-4 py-2 rounded-xl bg-[#daf4aa] hover:bg-[#cbe699] text-[#16161b] font-semibold text-xs transition-all">
                     Visit Help Center
                  </Link>
                  <Link
                     to="/privacy"
                     className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 transition-all">
                     Read Privacy Policy
                  </Link>
               </div>
            </div>
         </main>
      </div>
   );
}
