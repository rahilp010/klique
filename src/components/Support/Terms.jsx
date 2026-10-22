/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import {
   FileText,
   ShieldCheck,
   CheckCircle2,
   AlertCircle,
   Scale,
   ArrowRight,
   ExternalLink,
   Braces,
} from 'lucide-react';
import { motion } from 'motion/react';
import Navbar from '../Navbar';
import SEO from '../SEO';

const SECTIONS = [
   { id: 'acceptance', title: '1. Acceptance of Terms' },
   { id: 'services', title: '2. Description of Services' },
   { id: 'ownership', title: '3. Intellectual Property & User Ownership' },
   { id: 'acceptable-use', title: '4. Acceptable Use Policy' },
   { id: 'disclaimer', title: '5. Disclaimer of Warranties' },
   { id: 'liability', title: '6. Limitation of Liability' },
   { id: 'modifications', title: '7. Service Modifications' },
   { id: 'contact', title: '8. Contact Information' },
];

export default function Terms() {
   const scrollTo = (id) => {
      const el = document.getElementById(id);
      if (el) {
         el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
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
            title="Terms & Conditions - Klique Developer Suite"
            description="Read the terms of service, user rights, licensing, and usage policies for the Klique developer and creator platform."
            keywords="terms and conditions, klique terms of service, developer tools license, usage policy"
            canonicalUrl="https://klique.netlify.app/terms"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebPage',
               name: 'Klique Terms & Conditions',
               description:
                  'Terms of service, licensing, and usage agreements for Klique.',
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

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col pb-28 pt-10 sm:pb-24 sm:pt-6 lg:pl-20">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center sm:text-left mb-10">
               <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                  <Braces size={14} className="text-[#daf4aa]" />
                  <span>Legal & Compliance</span>
               </div>
               <h1 className="text-3xl font-medium tracking-tight text-white sm:text-5xl">
                  Terms & Conditions
               </h1>
               <p className="mt-2 text-xs sm:text-sm text-zinc-400">
                  Last updated: October 2026 · Effective immediately for all
                  visitors
               </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
               {/* Sticky Table of Contents (Desktop) */}
               <div className="hidden lg:block lg:col-span-4 sticky top-28 p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-2">
                     Table of Contents
                  </span>
                  <nav className="space-y-1">
                     {SECTIONS.map((sec) => (
                        <button
                           key={sec.id}
                           type="button"
                           onClick={() => scrollTo(sec.id)}
                           className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors truncate">
                           {sec.title}
                        </button>
                     ))}
                  </nav>
               </div>

               {/* Legal Content Body */}
               <div className="lg:col-span-8 p-6 sm:p-10 rounded-3xl border border-zinc-800 bg-[#0f0f11] backdrop-blur-xl shadow-2xl space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                  <section id="acceptance" className="space-y-3 pt-2">
                     <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <Scale className="w-4 h-4 text-[#daf4aa]" />
                        1. Acceptance of Terms
                     </h2>
                     <p>
                        By accessing, browsing, or using Klique (located at{' '}
                        <span className="text-[#daf4aa] font-mono">
                           https://klique.netlify.app
                        </span>
                        ), you acknowledge that you have read, understood, and
                        agree to be bound by these Terms & Conditions. If you do
                        not agree to these terms, you should discontinue using
                        the platform.
                     </p>
                  </section>

                  <section
                     id="services"
                     className="space-y-3 pt-2 border-t border-zinc-800/80">
                     <h2 className="text-base sm:text-lg font-bold text-white">
                        2. Description of Services
                     </h2>
                     <p>
                        Klique provides an all-in-one suite of web-based
                        developer, creator, and marketing tools, including
                        without limitation: JSON formatting & validation, Code
                        Snippet to Image generators, Client-Side Image
                        Optimizers, Favicon & Web App Manifest builders, Open
                        Graph card inspectors, QR Code & UTM tools, and text
                        converters.
                     </p>
                     <p>
                        All utilities are provided free of charge for both
                        individual and commercial usage without mandatory user
                        account creation.
                     </p>
                  </section>

                  <section
                     id="ownership"
                     className="space-y-3 pt-2 border-t border-zinc-800/80">
                     <h2 className="text-base sm:text-lg font-bold text-white">
                        3. Intellectual Property & User Ownership
                     </h2>
                     <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-emerald-300 space-y-1.5">
                        <div className="font-semibold text-xs flex items-center gap-1.5">
                           <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                           <span>You Own Everything You Create</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-zinc-300">
                           Klique claims zero ownership over code snippets, text
                           inputs, images, QR codes, SVG files, or assets
                           generated through our tools. All rights, title, and
                           ownership remain exclusively with you.
                        </p>
                     </div>
                     <p>
                        The Klique brand, logo, user interface design, code, and
                        source components are protected by copyright and
                        intellectual property laws. You may not duplicate,
                        reverse-engineer, or sell the Klique website application
                        as a standalone commercial product.
                     </p>
                  </section>

                  <section
                     id="acceptable-use"
                     className="space-y-3 pt-2 border-t border-zinc-800/80">
                     <h2 className="text-base sm:text-lg font-bold text-white">
                        4. Acceptable Use Policy
                     </h2>
                     <p>You agree not to use Klique to:</p>
                     <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-xs">
                        <li>
                           Generate deceptive, fraudulent, phishing, or
                           malicious QR codes or links.
                        </li>
                        <li>
                           Attempt to disrupt, overload, or reverse-engineer the
                           web service infrastructure.
                        </li>
                        <li>
                           Use automated bots to scrape or bypass platform
                           functionality in an abusive manner.
                        </li>
                     </ul>
                  </section>

                  <section
                     id="disclaimer"
                     className="space-y-3 pt-2 border-t border-zinc-800/80">
                     <h2 className="text-base sm:text-lg font-bold text-white">
                        5. Disclaimer of Warranties
                     </h2>
                     <p className="text-zinc-400 text-xs">
                        THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS
                        AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER
                        EXPRESS OR IMPLIED. KLIQUE DOES NOT WARRANT THAT
                        CONVERSIONS, CODE GENERATION, OR DATA PARSING WILL BE
                        ERROR-FREE, CONTINUOUS, OR UNINTERRUPTED.
                     </p>
                  </section>

                  <section
                     id="liability"
                     className="space-y-3 pt-2 border-t border-zinc-800/80">
                     <h2 className="text-base sm:text-lg font-bold text-white">
                        6. Limitation of Liability
                     </h2>
                     <p className="text-zinc-400 text-xs">
                        IN NO EVENT SHALL KLIQUE, ITS CREATORS, OR CONTRIBUTORS
                        BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
                        OR CONSEQUENTIAL DAMAGES (INCLUDING LOSS OF DATA,
                        REVENUE, OR PRODUCTION DOWNTIME) ARISING FROM THE USE OF
                        OR INABILITY TO USE THE SERVICES.
                     </p>
                  </section>

                  <section
                     id="modifications"
                     className="space-y-3 pt-2 border-t border-zinc-800/80">
                     <h2 className="text-base sm:text-lg font-bold text-white">
                        7. Service Modifications
                     </h2>
                     <p>
                        We reserve the right to modify, add, or deprecate
                        utilities or features at any time to improve the
                        platform experience. Changes to these terms will be
                        posted on this page with an updated timestamp.
                     </p>
                  </section>

                  <section
                     id="contact"
                     className="space-y-3 pt-2 border-t border-zinc-800/80">
                     <h2 className="text-base sm:text-lg font-bold text-white">
                        8. Contact Information
                     </h2>
                     <p>
                        For any legal inquiries, copyright concerns, or
                        questions regarding these terms, please email{' '}
                        <a
                           href="mailto:rahilp704@gmail.com"
                           className="text-[#daf4aa] hover:underline font-mono">
                           rahilp704@gmail.com
                        </a>
                        .
                     </p>
                  </section>
               </div>
            </div>
         </main>
      </div>
   );
}
