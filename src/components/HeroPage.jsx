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
         columnCount={14}
         radialFadeStart={15}
         radialFadeEnd={90}
         className="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 customScrollbar overflow-auto">
         <div ref={sectionRef} className="relative z-10 w-full h-full">
            <SEO
               title="Klique - All-in-One Content Creator & Social Media Toolbox"
               description="Enhance your digital presence with Klique. Access free tools for custom fonts, emoji mixing, cool symbols, AI bios, viral hashtags, AI writer, word counter, and timezone converter."
               keywords="klique, content creator tools, social media toolbox, fancy font generator, emoji mixer, cool symbols, copy paste symbols, AI bio generator, viral hashtag generator, AI writer, word counter, username generator, timezone converter"
               canonicalUrl="https://klique.netlify.app/"
               jsonLd={homeJsonLd}
            />

            {/* Navbar */}
            <header
               className={`fixed top-2 z-40 
               transition-[opacity,transform,background-color,border-color] duration-500 ease-in-out
               ${showNavbar ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-24'}
             
                ${scrolled ? 'border-zinc-200' : 'border-transparent'} 
               px-6 py-3 rounded-2xl flex items-center justify-between w-full`}>
               <div className="flex items-center space-x-2">
                  <span
                     className="
      text-2xl font-bold
      bg-[linear-gradient(110deg,#ffffff_25%,#a1a1aa_40%,#ffffff_50%,#a1a1aa_60%,#ffffff_75%)]
      bg-[length:300%_100%]
      bg-clip-text
      text-transparent
      animate-klique-shine
    ">
                     Klique
                  </span>
               </div>
               <button
                  className="px-5 py-2 rounded-xl border-2 border-zinc-900 bg-transparent text-sm font-semibold text-zinc-900 transition-all hover:bg-zinc-900 hover:text-white dark:border-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 hidden md:block"
                  onClick={handleScroll}>
                  Get Started
               </button>
               <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-lg text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Toggle menu">
                  {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
               </button>
            </header>

            {/* Hero Section */}
            <section className="pt-40 pb-24 px-6 text-center relative z-10 mx-auto max-w-7xl flex flex-col items-center justify-center">
               <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-zinc-900 dark:text-zinc-100 max-w-4xl">
                  Create <span className="gradient-text">Amazing Content</span>{' '}
                  <br /> Effortlessly
               </motion.h1>

               <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
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
                     className="flex items-center gap-2.5 rounded-xl border-2 border-zinc-900 px-8 py-3 text-base font-semibold text-zinc-900 transition-all hover:bg-zinc-900 hover:text-white dark:border-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 w-full sm:w-auto"
                     onClick={handleScroll}>
                     Start Creating
                     <LiaLongArrowAltRightSolid size={20} />
                  </button>
               </motion.div>
            </section>

            {/* Tools Section */}
            <section
               id="tools"
               className="py-20 px-6 relative z-10"
               ref={toolsSectionRef}>
               <div className="max-w-7xl mx-auto text-center">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
                     Our Trending Tools
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto mb-16">
                     Powerful, intuitive tools designed to elevate your creative
                     workflow.
                  </p>

                  <motion.div
                     className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-20"
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
                           className="rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                           <Link to={tool.link} className="block h-full">
                              <div className="p-8 text-left h-full flex flex-col">
                                 <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-zinc-100 mb-6">
                                    {tool.icon}
                                 </div>
                                 <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-xl mb-2">
                                    {tool.title}
                                 </h3>
                                 <p className="text-zinc-500 dark:text-zinc-400 text-sm flex-grow">
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
            <section className="pb-32 px-6 relative z-10  bg-white/30 dark:bg-zinc-950/30">
               <div className="max-w-7xl mx-auto text-center mb-14">
                  <h2 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                     Community Love
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
                     Real feedback from real creators using Klique.
                  </p>
               </div>

               <div className="overflow-hidden relative max-w-7xl mx-auto">
                  <motion.div
                     className="flex gap-6"
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
                                 className="min-w-[320px] p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-4 h-[240px]"
                                 whileHover={{ scale: 1.02 }}>
                                 <div className="flex items-center gap-4">
                                    <img
                                       src={u.img}
                                       className="w-14 h-14 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover"
                                       alt={u.name}
                                    />
                                    <div>
                                       <h3 className="text-zinc-900 dark:text-zinc-100 font-semibold text-lg">
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
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
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
            <footer className="relative z-10 bg-transparent pt-16 pb-8">
               <div className="max-w-7xl mx-auto px-10 grid grid-cols-1 md:grid-cols-4 gap-12">
                  <div>
                     <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        Klique
                     </h3>
                     <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-4 leading-relaxed">
                        Create stunning content, bios, hashtags, and more with
                        our powerful tools. Designed for creators who want speed
                        and precision.
                     </p>
                     <div className="flex gap-4 mt-6">
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
                              className="w-10 h-10 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
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
                        <li>
                           <a
                              href="#"
                              className="hover:text-zinc-900 dark:hover:text-zinc-100">
                              Blog
                           </a>
                        </li>
                        <li>
                           <a
                              href="#"
                              className="hover:text-zinc-900 dark:hover:text-zinc-100">
                              Careers
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
                              Contact
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

               <div className="border-t border-zinc-200 dark:border-zinc-800 mt-12 pt-6 px-4">
                  <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                     <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        © {new Date().getFullYear()} Klique. All rights
                        reserved.
                     </p>
                     <div className="flex gap-6 text-sm mt-4 md:mt-0">
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
