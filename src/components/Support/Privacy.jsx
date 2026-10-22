/* eslint-disable no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import {
   ShieldCheck,
   Lock,
   EyeOff,
   HardDrive,
   Cpu,
   CheckCircle2,
   AlertCircle,
   ArrowRight,
   Braces,
} from 'lucide-react';
import { motion } from 'motion/react';
import Navbar from '../Navbar';
import SEO from '../SEO';

const PILLARS = [
   {
      icon: EyeOff,
      title: 'Zero File Uploads',
      desc: 'When you upload an image, SVG, or JSON file, it is processed strictly in your local browser memory. Files are never transmitted over the network to any server.',
   },
   {
      icon: Lock,
      title: 'Zero User Tracking',
      desc: 'We do not sell personal data, profile visitors, or deploy invasive cross-site advertising trackers.',
   },
   {
      icon: HardDrive,
      title: 'Device-Local Storage',
      desc: 'Settings such as dark mode or editor font preferences are saved only in your device’s localStorage and remain completely under your control.',
   },
];

export default function Privacy() {
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
            title="Privacy Policy - 100% Client-Side Privacy Guarantee | Klique"
            description="Learn how Klique protects developer and creator privacy with zero server uploads, no data harvesting, and device-local processing."
            keywords="privacy policy, client side privacy, klique privacy guarantee, zero server upload, developer data protection"
            canonicalUrl="https://klique.netlify.app/privacy"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebPage',
               name: 'Klique Privacy Policy',
               description:
                  'Privacy guarantee and data protection details for Klique users.',
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

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-4xl flex-col pb-28 pt-10 sm:pb-24 sm:pt-6 lg:pl-20">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center sm:text-left mb-10">
               <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                  <Braces size={14} className="text-[#daf4aa]" />
                  <span>Privacy First Philosophy</span>
               </div>
               <h1 className="text-3xl font-medium tracking-tight text-white sm:text-5xl">
                  Privacy Policy
               </h1>
               <p className="mt-2 text-xs sm:text-sm text-zinc-400">
                  Last updated: October 2026 · We do not collect or store your
                  files.
               </p>
            </motion.div>

            {/* Privacy Highlight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
               {PILLARS.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                     <div
                        key={idx}
                        className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11]/80 backdrop-blur-xl space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-[#daf4aa]/10 border border-[#daf4aa]/20 flex items-center justify-center">
                           <Icon className="w-4 h-4 text-[#daf4aa]" />
                        </div>
                        <h2 className="text-sm font-bold text-white">
                           {p.title}
                        </h2>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                           {p.desc}
                        </p>
                     </div>
                  );
               })}
            </div>

            {/* Policy Details */}
            <div className="p-6 sm:p-10 rounded-3xl border border-zinc-800 bg-[#0f0f11] backdrop-blur-xl shadow-2xl space-y-8 text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
               <section className="space-y-3">
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                     <ShieldCheck className="w-5 h-5 text-[#daf4aa]" />
                     1. The Client-Side Execution Guarantee
                  </h2>
                  <p>
                     Unlike conventional online utility platforms that send your
                     files to a remote cloud server for processing, Klique is
                     designed from the ground up as a{' '}
                     <strong>client-side first web application</strong>.
                  </p>
                  <p>
                     When you format JSON, optimize or convert images
                     (WebP/JPEG/PNG), generate code screenshot cards, create
                     favicons, or parse URL parameters:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-xs">
                     <li>
                        All calculations occur inside your browser memory using
                        HTML5 Canvas, Web APIs, and client-side JavaScript
                        libraries.
                     </li>
                     <li>
                        Your files are never transmitted to, inspected by, or
                        stored on our servers.
                     </li>
                     <li>
                        Closing or refreshing the browser tab instantly erases
                        memory buffers from your device.
                     </li>
                  </ul>
               </section>

               <section className="space-y-3 pt-3 border-t border-zinc-800/80">
                  <h2 className="text-base sm:text-lg font-bold text-white">
                     2. Information We Do NOT Collect
                  </h2>
                  <p>
                     We believe the best way to protect your privacy is not to
                     collect your data in the first place:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-xs">
                     <li>
                        We do NOT collect, save, or log your code snippets.
                     </li>
                     <li>
                        We do NOT store your images, documents, or vector SVGs.
                     </li>
                     <li>
                        We do NOT require passwords, credit cards, or personal
                        accounts.
                     </li>
                     <li>
                        We do NOT sell, license, or share user data with data
                        brokers.
                     </li>
                  </ul>
               </section>

               <section className="space-y-3 pt-3 border-t border-zinc-800/80">
                  <h2 className="text-base sm:text-lg font-bold text-white">
                     3. Local Storage on Your Device
                  </h2>
                  <p>
                     Klique may use your browser’s standard{' '}
                     <code className="text-[#daf4aa] bg-black/40 px-1 py-0.5 rounded font-mono">
                        localStorage
                     </code>{' '}
                     strictly to remember user interface preferences, such as:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-zinc-400 text-xs">
                     <li>Dark / Light theme settings.</li>
                     <li>
                        Code screenshot editor presets (font, padding, syntax
                        theme).
                     </li>
                     <li>Recent conversion parameters.</li>
                  </ul>
                  <p>
                     This information never leaves your device and can be
                     cleared at any time by clearing your browser cache and
                     local storage.
                  </p>
               </section>

               <section className="space-y-3 pt-3 border-t border-zinc-800/80">
                  <h2 className="text-base sm:text-lg font-bold text-white">
                     4. Content Delivery & Hosting
                  </h2>
                  <p>
                     Our static web assets (HTML, CSS, JavaScript chunks) are
                     hosted securely via Netlify's global content delivery
                     network (CDN). Netlify may log standard HTTP server
                     requests (IP address, user-agent, request timestamp) solely
                     for infrastructure reliability, DDoS mitigation, and
                     routing. These logs are not combined with user activities.
                  </p>
               </section>

               <section className="space-y-3 pt-3 border-t border-zinc-800/80">
                  <h2 className="text-base sm:text-lg font-bold text-white">
                     5. GDPR & CCPA Compliance
                  </h2>
                  <p>
                     Because Klique operates on a client-side architecture and
                     does not collect, store, or process personal identification
                     records, our platform is inherently compliant with GDPR,
                     CCPA, and global privacy frameworks by design.
                  </p>
               </section>

               <section className="space-y-3 pt-3 border-t border-zinc-800/80">
                  <h2 className="text-base sm:text-lg font-bold text-white">
                     6. Contact Us
                  </h2>
                  <p>
                     If you have any questions about this Privacy Policy or our
                     security practices, please contact us at{' '}
                     <a
                        href="mailto:rahilp704@gmail.com"
                        className="text-[#daf4aa] hover:underline font-mono">
                        rahilp704@gmail.com
                     </a>
                     .
                  </p>
               </section>
            </div>
         </main>
      </div>
   );
}
