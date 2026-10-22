/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import {
   Sparkles,
   ShieldCheck,
   Zap,
   Palette,
   Heart,
   Code2,
   Terminal,
   Users,
   Globe,
   ArrowRight,
   Layers,
   Lock,
   Cpu,
   CheckCircle2,
   Braces,
} from 'lucide-react';
import { motion } from 'motion/react';
import Navbar from '../Navbar';
import SEO from '../SEO';

const VALUES = [
   {
      icon: ShieldCheck,
      title: '100% Client-Side Privacy',
      desc: 'Your files, code snippets, and confidential data never leave your browser. All computations, conversions, and rendering happen locally on your device.',
   },
   {
      icon: Zap,
      title: 'Blazing Fast & Zero Bloat',
      desc: 'Engineered for speed. No intrusive ads, no forced registrations, and no paywalls. Instant startup and responsive interactions.',
   },
   {
      icon: Palette,
      title: 'Designer-Grade Aesthetics',
      desc: 'Tooling shouldn’t look like it was built in 1998. Klique is built with sleek dark ergonomics, curated palettes, and micro-interactions.',
   },
   {
      icon: Terminal,
      title: 'Developer & Creator Centric',
      desc: 'From JSON diffing and SVG optimization to high-res code screenshots and PWA manifest generation, every utility solves real workflows.',
   },
];

const MILESTONES = [
   { value: '15+', label: 'Built-in Utilities' },
   { value: '0', label: 'Server Data Tracking' },
   { value: '100%', label: 'Free & Client-Side' },
   { value: '60fps', label: 'Smooth Native Feel' },
];

export default function AboutUs() {
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
            title="About Us - The Klique Mission & Story | Free Developer & Creator Suite"
            description="Learn about Klique, our client-side privacy philosophy, and our mission to provide high-performance, ad-free developer and creator utilities."
            keywords="about klique, developer tools company, client side privacy, free online developer suite, creator tools, klique mission"
            canonicalUrl="https://klique.netlify.app/aboutus"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'AboutPage',
               name: 'About Klique',
               description:
                  'Learn about Klique, our client-side privacy philosophy, and our mission to build fast, beautiful developer and creator utilities.',
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
            {/* Hero Header */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center sm:text-left mb-12">
               <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                  <Braces size={14} className="text-[#daf4aa]" />
                  <span>Our Mission & Story</span>
               </div>
               <h1 className="text-3xl font-medium tracking-tight text-white sm:text-5xl">
                  Empowering Creators & Developers Without Compromise
               </h1>
               <p className="mt-3 text-base text-zinc-400 max-w-3xl leading-relaxed">
                  Klique was founded on a simple conviction: online developer and creator
                  utilities should be fast, aesthetically refined, completely free, and
                  strictly respectful of user privacy.
               </p>
            </motion.div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-14">
               {MILESTONES.map((m, idx) => (
                  <motion.div
                     key={idx}
                     initial={{ opacity: 0, y: 15 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.08 }}
                     className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11]/90 backdrop-blur-xl text-center">
                     <div className="text-2xl sm:text-3xl font-black text-[#daf4aa] font-mono">
                        {m.value}
                     </div>
                     <div className="text-xs text-zinc-400 font-medium mt-1">
                        {m.label}
                     </div>
                  </motion.div>
               ))}
            </div>

            {/* The Story Section */}
            <div className="p-8 sm:p-10 rounded-3xl border border-zinc-800 bg-[#0f0f11] backdrop-blur-xl shadow-2xl mb-12 space-y-6">
               <div className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  <Sparkles className="w-4 h-4 text-[#daf4aa]" />
                  <span>Why We Built Klique</span>
               </div>
               <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Tired of ad-riddled, slow, and insecure utility websites.
               </h2>
               <div className="space-y-4 text-sm text-zinc-300 leading-relaxed font-normal">
                  <p>
                     Every developer and creator knows the pain: you need to format a JSON
                     string, optimize an image, generate a favicon, or test an Open Graph
                     tag, so you search Google. You land on a website covered in flashing
                     banner ads, cookie consent modals, paywalls, and slow backend server
                     roundtrips. Worse, you are forced to upload your proprietary code or
                     images to an unknown remote server.
                  </p>
                  <p>
                     We set out to change that. Klique brings together modern client-side
                     technologies—leveraging HTML5 Canvas, WebAssembly, modern browser
                     cryptography, and React 19—to execute operations entirely inside your
                     own browser.
                  </p>
                  <p>
                     No servers inspecting your payloads. No data harvesting. Just a clean,
                     distraction-free toolbox you can keep pinned in your tabs all day.
                  </p>
               </div>
            </div>

            {/* Core Values Grid */}
            <div className="space-y-6 mb-14">
               <div>
                  <h3 className="text-lg font-bold text-white">Our Core Principles</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                     The standards that guide every tool we build.
                  </p>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {VALUES.map((val, idx) => {
                     const Icon = val.icon;
                     return (
                        <div
                           key={idx}
                           className="p-6 rounded-2xl border border-zinc-800 bg-[#0f0f11]/80 hover:border-[#daf4aa]/40 transition-all space-y-3">
                           <div className="w-10 h-10 rounded-xl bg-[#daf4aa]/10 border border-[#daf4aa]/20 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-[#daf4aa]" />
                           </div>
                           <h4 className="text-base font-semibold text-white">
                              {val.title}
                           </h4>
                           <p className="text-xs text-zinc-400 leading-relaxed">
                              {val.desc}
                           </p>
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* CTA Section */}
            <div className="p-8 sm:p-10 rounded-3xl border border-zinc-800 bg-gradient-to-br from-[#12141c] to-[#09090b] text-center space-y-4 shadow-2xl">
               <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Ready to upgrade your workflow?
               </h3>
               <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto">
                  Explore our growing suite of developer converters, social marketing
                  utilities, and AI creators—free forever.
               </p>
               <div className="pt-2">
                  <Link
                     to="/"
                     className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#daf4aa] hover:bg-[#cbe699] text-[#16161b] font-bold text-sm transition-all shadow-lg shadow-[#daf4aa]/15">
                     <span>Explore All Tools</span>
                     <ArrowRight className="w-4 h-4" />
                  </Link>
               </div>
            </div>
         </main>
      </div>
   );
}
