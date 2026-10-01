import React, { useState, useEffect, useRef } from 'react';
import {
   FaSmile,
   FaUserAlt,
   FaHashtag,
   FaPalette,
   FaBars,
   FaTimes,
} from 'react-icons/fa';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BiFont } from 'react-icons/bi';
import { SiNamecheap } from 'react-icons/si';
import { HiAtSymbol } from 'react-icons/hi2';
import { IoSparklesOutline } from 'react-icons/io5';
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa6';
import { LiaLongArrowAltRightSolid } from 'react-icons/lia';
import SEO from './SEO';
import { ColumnLines } from '@/components/ui/download-with-columnlines-utils/columnlines';

const tools = [
   {
      icon: <FaSmile size={32} />,
      title: 'Font Creator',
      desc: 'Mix and match emojis to create unique combinations.',
      link: '/fontgenerator',
   },
   {
      icon: <FaUserAlt size={32} />,
      title: 'Emojis',
      desc: 'Generate creative bios for your social media profiles.',
      link: '/emojigenerator',
   },
   {
      icon: <HiAtSymbol size={32} />,
      title: 'Symbols',
      desc: 'Generate relevant hashtags and captions for your posts.',
      link: '/symbol',
   },
   {
      icon: <FaPalette size={32} />,
      title: 'AI Bio Creator',
      desc: 'Create personalized and engaging bio content.',
      link: '/bio',
   },
   {
      icon: <FaHashtag size={32} />,
      title: 'AI HashTag',
      desc: 'Generate viral, high-reach hashtags for your social posts automatically.',
      link: '/hashtaggenerator',
   },
   {
      icon: <BiFont size={32} />,
      title: 'Word Counter',
      desc: 'Analyze text structure, count words, characters, and estimate reading time.',
      link: '/wordcounter',
   },
   {
      icon: <IoSparklesOutline size={32} />,
      title: 'AI Writer',
      desc: 'Rephrase sentences, rewrite articles, and generate creative copy with AI.',
      link: '/aiwriter',
   },
   {
      icon: <SiNamecheap size={32} />,
      title: 'Username Generator',
      desc: 'Create unique, cool, and aesthetic usernames and handles instantly.',
      link: '/username',
   },
   {
      icon: <SiNamecheap size={32} />,
      title: 'Time Zone',
      desc: 'Convert times between different time zones and plan global meetings.',
      link: '/timezone',
   },
];

export default function HeroPage() {
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [scrolled, setScrolled] = useState(false);
   const [showNavbar, setShowNavbar] = useState(true);
   const sectionRef = useRef(null);
   const toolsSectionRef = useRef(null);

   useEffect(() => {
      const handleScroll = () => setScrolled(window.scrollY > 20);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
   }, []);

   useEffect(() => {
      const scrollContainer = sectionRef.current;
      if (!scrollContainer) return;

      let lastY = 0;

      const controlNavbar = () => {
         const currentY = scrollContainer.scrollTop;
         if (currentY < 150) {
            setShowNavbar(true);
         } else {
            if (currentY > lastY + 10) setShowNavbar(false);
            else if (currentY < lastY - 10) setShowNavbar(true);
         }
         lastY = currentY;
      };

      scrollContainer.addEventListener('scroll', controlNavbar, {
         passive: true,
      });
      return () => scrollContainer.removeEventListener('scroll', controlNavbar);
   }, []);

   const handleScroll = () => {
      if (toolsSectionRef.current) {
         toolsSectionRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
         });
      }
   };

   const homeJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Klique',
      url: 'https://klique.netlify.app/',
      description: 'All-in-One Content Creator and Social Media Toolbox',
   };

   return (
      <ColumnLines
         columnWidth={80}
         columnCount={34}
         radialFadeStart={15}
         radialFadeEnd={90}
         className="relative min-h-[100dvh] w-full overflow-x-hidden bg-zinc-50 dark:bg-zinc-950 customScrollbar">
         <div ref={sectionRef} className="relative z-10 w-full min-w-0">
            <SEO
               title="Klique - All-in-One Content Creator & Social Media Toolbox"
               description="Enhance your digital presence with Klique. Access free tools for custom fonts, emoji mixing, cool symbols, AI bios, viral hashtags, AI writer, word counter, and timezone converter."
               keywords="klique, content creator tools, social media toolbox, fancy font generator, emoji mixer, cool symbols, copy paste symbols, AI bio generator, viral hashtag generator, AI writer, word counter, username generator, timezone converter"
               canonicalUrl="https://klique.netlify.app/"
               jsonLd={homeJsonLd}
            />

            {/* Navbar */}
            <header
               className={`fixed left-2 right-2 top-2 z-[9999]
               transition-[opacity,transform,background-color,border-color] duration-500 ease-in-out
               ${showNavbar ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-24'}
               rounded-2xl flex w-[calc(100%-16px)] max-w-7xl mx-auto items-center justify-between px-3 py-2.5 sm:px-5 sm:py-3`}>
               <div className="flex items-center space-x-2">
                  <span
                     className="
      text-xl font-bold sm:text-2xl
      bg-[linear-gradient(110deg,#ffffff_25%,#a1a1aa_40%,#ffffff_50%,#a1a1aa_60%,#ffffff_75%)]
      bg-[length:300%_100%]
      bg-clip-text
      text-transparent
      animate-klique-shine
    ">
                     Klique
                  </span>
               </div>
            </header>

            {/* Hero Section */}
            <section className="relative z-10 mx-auto flex max-w-7xl flex-col items-center justify-center px-4 pb-16 pt-32 text-center sm:px-6 sm:pb-24 sm:pt-40">
               <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mb-4 max-w-4xl text-4xl font-bold leading-[1.08] text-zinc-900 dark:text-zinc-100 sm:mb-6 sm:text-5xl md:text-6xl lg:text-7xl">
                  Create <span className="gradient-text">Amazing Content</span>{' '}
                  <br /> Effortlessly
               </motion.h1>

               <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mx-auto mb-7 max-w-2xl px-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400 sm:mb-10 sm:text-lg md:text-xl">
                  Explore tools designed to help you create engaging content for
                  your social media and digital presence. Operate swiftly with
                  precise accuracy.
               </motion.p>

               <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                     className="flex w-full items-center justify-center gap-2.5 rounded-xl border-2 border-zinc-900 bg-zinc-900 px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-transparent hover:text-zinc-900 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-transparent dark:hover:text-zinc-100 sm:w-auto sm:px-8 sm:text-base"
                     onClick={handleScroll}>
                     Start Creating
                     <LiaLongArrowAltRightSolid size={20} />
                  </button>
               </motion.div>
            </section>

            {/* Tools Section */}
            <section
               id="tools"
               className="relative z-10 px-4 py-16 sm:px-6 sm:py-20"
               ref={toolsSectionRef}>
               <div className="max-w-7xl mx-auto text-center">
                  <h2 className="mb-3 text-3xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-4xl md:text-5xl">
                     Our Trending Tools
                  </h2>
                  <p className="mx-auto mb-10 max-w-2xl px-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400 sm:mb-16 sm:text-lg">
                     Powerful, intuitive tools designed to elevate your creative
                     workflow.
                  </p>

                  <motion.div
                     className="grid grid-cols-1 gap-4 px-0 pb-16 sm:grid-cols-2 sm:gap-6 sm:px-4 sm:pb-20 lg:grid-cols-3"
                     initial="hidden"
                     whileInView="visible"
                     viewport={{ once: true }}
                     variants={{
                        visible: { transition: { staggerChildren: 0.1 } },
                     }}>
                     {tools.map((tool, i) => (
                        <motion.div
                           key={i}
                           variants={{
                              hidden: { opacity: 0, y: 40 },
                              visible: { opacity: 1, y: 0 },
                           }}
                           whileHover={{ y: -4, scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           transition={{ type: 'spring', stiffness: 300 }}
                           className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/50">
                           <Link to={tool.link} className="block h-full">
                              <div className="flex h-full min-w-0 flex-col p-5 text-left sm:p-8">
                                 <div className="mb-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100 sm:mb-6 sm:h-12 sm:w-12">
                                    {tool.icon}
                                 </div>
                                 <h3 className="mb-2 break-words text-lg font-semibold text-zinc-900 dark:text-zinc-100 sm:text-xl">
                                    {tool.title}
                                 </h3>
                                 <p className="break-words text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                                    {tool.desc}
                                 </p>
                              </div>
                           </Link>
                        </motion.div>
                     ))}
                  </motion.div>
               </div>
            </section>

            {/* Community Love Section */}
            <section className="relative z-10 bg-white/30 px-4 pb-28 dark:bg-zinc-950/30 sm:px-6 sm:pb-32">
               <div className="mx-auto mb-10 max-w-7xl text-center sm:mb-14">
                  <h2 className="mb-3 text-3xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-4xl md:text-5xl">
                     Community Love
                  </h2>
                  <p className="mx-auto max-w-2xl px-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400 sm:text-lg">
                     Real feedback from real creators using Klique.
                  </p>
               </div>

               <div className="relative mx-auto w-full max-w-7xl min-w-0 overflow-hidden">
                  <motion.div
                     className="flex gap-4 sm:gap-6"
                     animate={{ x: ['0%', '-100%'] }}
                     transition={{
                        duration: 60,
                        repeat: Infinity,
                        ease: 'linear',
                     }}
                     whileHover={{ animationPlayState: 'paused' }}>
                     {[1, 2].map((loop) => (
                        <div className="flex gap-6" key={loop}>
                           {[
                              {
                                 img: 'https://i.pravatar.cc/150?img=32',
                                 name: 'Aarav Sharma',
                                 rating: 5,
                                 comment:
                                    'The emoji and bio tools helped me grow my social media very fast. This site is a gem!',
                              },
                              {
                                 img: 'https://i.pravatar.cc/150?img=15',
                                 name: 'Sophia Patel',
                                 rating: 4,
                                 comment:
                                    'Beautiful UI, smooth animations and super helpful tools. I use Klique every day!',
                              },
                              {
                                 img: 'https://i.pravatar.cc/150?img=48',
                                 name: 'Rahul Verma',
                                 rating: 5,
                                 comment:
                                    'Hashtag generator gives perfect hashtags. My reach increased instantly!',
                              },
                              {
                                 img: 'https://i.pravatar.cc/150?img=22',
                                 name: 'Emily Carter',
                                 rating: 5,
                                 comment:
                                    'Love the username generator! Helped me pick the perfect brand username.',
                              },
                           ].map((u, index) => (
                              <motion.div
                                 key={index}
                                 className="flex h-[220px] w-[calc(100vw-48px)] min-w-[280px] max-w-[360px] flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:h-[240px] sm:min-w-[320px] sm:p-8"
                                 whileHover={{ scale: 1.02 }}>
                                 <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                    <img
                                       src={u.img}
                                       className="h-12 w-12 shrink-0 rounded-full border border-zinc-200 object-cover dark:border-zinc-700 sm:h-14 sm:w-14"
                                       alt={u.name}
                                    />
                                    <div>
                                       <h3 className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100 sm:text-lg">
                                          {u.name}
                                       </h3>
                                       <div className="flex">
                                          {Array.from({ length: u.rating }).map(
                                             (_, i) => (
                                                <span
                                                   key={i}
                                                   className="text-zinc-900 dark:text-zinc-100 text-sm">
                                                   ★
                                                </span>
                                             ),
                                          )}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex-1 mt-2">
                                    <p className="break-words text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                                       "{u.comment}"
                                    </p>
                                 </div>
                              </motion.div>
                           ))}
                        </div>
                     ))}
                  </motion.div>
               </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 bg-transparent pb-8 pt-12 sm:pt-16">
               <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-5 sm:px-6 md:grid-cols-4 md:gap-12">
                  <div>
                     <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        Klique
                     </h3>
                     <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 sm:mt-4">
                        Create stunning content, bios, hashtags, and more with
                        our powerful tools. Designed for creators who want speed
                        and precision.
                     </p>
                     <div className="mt-5 flex flex-wrap gap-3 sm:mt-6 sm:gap-4">
                        {[
                           { name: 'Facebook', icon: <FaFacebook /> },
                           { name: 'GitHub', icon: <FaGithub /> },
                           { name: 'Instagram', icon: <FaInstagram /> },
                           { name: 'LinkedIn', icon: <FaLinkedin /> },
                        ].map((s, i) => (
                           <a
                              key={i}
                              href="#"
                              aria-label={`Visit Klique on ${s.name}`}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                              <span className="text-lg" aria-hidden="true">
                                 {s.icon}
                              </span>
                           </a>
                        ))}
                     </div>
                  </div>

                  <div>
                     <h4 className="text-zinc-900 dark:text-zinc-100 font-semibold mb-4">
                        Tools
                     </h4>
                     <ul className="space-y-3 text-zinc-500 dark:text-zinc-400 text-sm">
                        <li>
                           <a
                              href="/fontgenerator"
                              className="hover:text-zinc-900 dark:hover:text-zinc-100">
                              Font Creator
                           </a>
                        </li>
                        <li>
                           <a
                              href="/emojigenerator"
                              className="hover:text-zinc-900 dark:hover:text-zinc-100">
                              Emoji Generator
                           </a>
                        </li>
                        <li>
                           <a
                              href="/symbol"
                              className="hover:text-zinc-900 dark:hover:text-zinc-100">
                              Symbol Generator
                           </a>
                        </li>
                        <li>
                           <a
                              href="/bio"
                              className="hover:text-zinc-900 dark:hover:text-zinc-100">
                              AI Bio Creator
                           </a>
                        </li>
                        <li>
                           <a
                              href="/aiwriter"
                              className="hover:text-zinc-900 dark:hover:text-zinc-100">
                              AI Writer
                           </a>
                        </li>
                     </ul>
                  </div>

                  <div>
                     <h4 className="text-zinc-900 dark:text-zinc-100 font-semibold mb-4">
                        Company
                     </h4>
                     <ul className="space-y-3 text-zinc-500 dark:text-zinc-400 text-sm">
                        <li>
                           <a
                              href="#"
                              className="hover:text-zinc-900 dark:hover:text-zinc-100">
                              About Us
                           </a>
                        </li>
                        <li>
                           <a
                              href="#"
                              className="hover:text-zinc-900 dark:hover:text-zinc-100">
                              Pricing
                           </a>
                        </li>
                     </ul>
                  </div>

                  <div>
                     <h4 className="text-zinc-900 dark:text-zinc-100 font-semibold mb-4">
                        Support
                     </h4>
                     <ul className="space-y-3 text-zinc-500 dark:text-zinc-400 text-sm">
                        <li>
                           <a
                              href="#"
                              className="hover:text-zinc-900 dark:hover:text-zinc-100">
                              Help Center
                           </a>
                        </li>
                        <li>
                           <a
                              href="#"
                              className="hover:text-zinc-900 dark:hover:text-zinc-100">
                              FAQs
                           </a>
                        </li>
                        <li>
                           <a
                              href="#"
                              className="hover:text-zinc-900 dark:hover:text-zinc-100">
                              Terms & Conditions
                           </a>
                        </li>
                        <li>
                           <a
                              href="#"
                              className="hover:text-zinc-900 dark:hover:text-zinc-100">
                              Privacy Policy
                           </a>
                        </li>
                     </ul>
                  </div>
               </div>

               <div className="mt-10 border-t border-zinc-200 px-4 pt-6 dark:border-zinc-800">
                  <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-2 text-center sm:px-6 md:flex-row md:text-left">
                     <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        © {new Date().getFullYear()} Klique. All rights
                        reserved.
                     </p>
                     <div className="flex flex-wrap justify-center gap-4 text-sm sm:gap-6 md:mt-0">
                        <a
                           href="#"
                           className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                           Terms
                        </a>
                        <a
                           href="#"
                           className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                           Privacy
                        </a>
                        <a
                           href="#"
                           className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                           Cookies
                        </a>
                     </div>
                  </div>
               </div>
            </footer>
         </div>
      </ColumnLines>
   );
}
