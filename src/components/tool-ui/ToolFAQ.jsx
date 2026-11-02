/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToolFAQ({ faqs = [], className = '' }) {
   const [openIndex, setOpenIndex] = useState(null);

   if (!faqs || faqs.length === 0) return null;

   const toggleFAQ = (index) => {
      setOpenIndex(openIndex === index ? null : index);
   };

   return (
      <section className={`mt-10 sm:mt-12 pt-8 border-t border-zinc-800/60 ${className}`}>
         <div className="mb-6 text-left">
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
               <HelpCircle size={16} className="text-[#daf4aa]" />
               Frequently Asked Questions
            </h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
               Common answers, formulas, and usage guidelines
            </p>
         </div>

         <div className="flex flex-col gap-2.5">
            {faqs.map((faq, index) => {
               const isOpen = openIndex === index;

               return (
                  <div
                     key={index}
                     className="rounded-2xl border border-zinc-800/80 bg-[#121216] overflow-hidden transition-colors">
                     <button
                        type="button"
                        onClick={() => toggleFAQ(index)}
                        className="w-full flex items-center justify-between gap-4 p-4 text-left text-xs sm:text-sm font-semibold text-zinc-200 hover:text-white transition-colors"
                        aria-expanded={isOpen}>
                        <span>{faq.question}</span>
                        <ChevronDown
                           size={16}
                           className={`text-zinc-500 transition-transform duration-200 shrink-0 ${
                              isOpen ? 'rotate-180 text-[#daf4aa]' : ''
                           }`}
                        />
                     </button>

                     <AnimatePresence>
                        {isOpen && (
                           <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden">
                              <div className="px-4 pb-4 pt-1 text-xs text-zinc-400 font-normal leading-relaxed border-t border-zinc-800/40">
                                 {faq.answer}
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               );
            })}
         </div>
      </section>
   );
}
