/* eslint-disable no-unused-vars */
import React, { useRef, useState } from 'react';
import {
   AnimatePresence,
   motion,
   useMotionTemplate,
   useMotionValue,
   useMotionValueEvent,
   useReducedMotion,
   useScroll,
   useSpring,
} from 'framer-motion';
import {
   AlignLeft,
   ArrowRight,
   ArrowUpRight,
   AtSign,
   Clock,
   Command,
   FileText,
   Github,
   Hash,
   Instagram,
   Linkedin,
   Smile,
   Sparkles,
   Type,
   UserRound,
   Braces,
   GalleryHorizontalEnd,
   QrCode,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from './SEO';
import { preloadRoute } from '../App';

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const CATEGORIES = ['All', 'Writing', 'Text & Symbols', 'Utilities'];

const tools = [
   {
      icon: Sparkles,
      title: 'AI Writer',
      desc: 'Rephrase sentences, rewrite articles, and generate creative copy.',
      link: '/aiwriter',
      category: 'Writing',
      ai: true,
   },
   {
      icon: UserRound,
      title: 'AI Bio Creator',
      desc: 'Create personalized, engaging bios for your social profiles.',
      link: '/bio',
      category: 'Writing',
      ai: true,
   },
   {
      icon: Hash,
      title: 'AI Hashtag',
      desc: 'Generate high-reach hashtags and captions for your posts.',
      link: '/hashtaggenerator',
      category: 'Writing',
      ai: true,
   },
   {
      icon: FileText,
      title: 'PDF Converter',
      desc: 'Convert Word documents to high-quality PDFs.',
      link: '/convert',
      category: 'Utilities',
   },
   {
      icon: Braces,
      title: 'JSON Formatter & Diff',
      desc: 'Format, validate, repair, and compare JSON data instantly.',
      link: '/jsonformatter',
      category: 'Utilities',
   },
   {
      icon: GalleryHorizontalEnd,
      title: 'SVG Converter',
      desc: 'Convert SVG files to various formats and optimize them.',
      link: '/svgconverter',
      category: 'Utilities',
   },
   {
      icon: QrCode,
      title: 'QR Code & Link Tools',
      desc: 'Create custom QR codes, build UTM links, parse and encode URLs, and scan QR codes.',
      link: '/qrlinktools',
      category: 'Utilities',
   },
   {
      icon: Clock,
      title: 'Time Zone',
      desc: 'Convert times between zones and plan global meetings.',
      link: '/timezone',
      category: 'Utilities',
   },
   {
      icon: AtSign,
      title: 'Username Generator',
      desc: 'Create unique, aesthetic usernames and handles instantly.',
      link: '/username',
      category: 'Writing',
      ai: true,
   },
   {
      icon: Type,
      title: 'Font Creator',
      desc: 'Turn plain text into stylish fonts you can copy and paste.',
      link: '/fontgenerator',
      category: 'Text & Symbols',
   },
   {
      icon: Smile,
      title: 'Emoji Generator',
      desc: 'Mix and match emojis to create unique combinations.',
      link: '/emojigenerator',
      category: 'Text & Symbols',
   },
   {
      icon: Command,
      title: 'Symbols',
      desc: 'Browse and copy cool symbols for bios, names, and posts.',
      link: '/symbol',
      category: 'Text & Symbols',
   },
   {
      icon: AlignLeft,
      title: 'Word Counter',
      desc: 'Count words and characters, and estimate reading time.',
      link: '/wordcounter',
      category: 'Utilities',
   },
];

const footerLinks = {
   Tools: [
      { label: 'QR & Link Tools', to: '/qrlinktools' },
      { label: 'PDF Tools', to: '/convert' },
      { label: 'JSON Formatter', to: '/jsonformatter' },
      { label: 'SVG Converter', to: '/svgconverter' },
      { label: 'Font Creator', to: '/fontgenerator' },
      { label: 'Emoji Generator', to: '/emojigenerator' },
      { label: 'Symbol Generator', to: '/symbol' },
      { label: 'AI Bio Creator', to: '/bio' },
      { label: 'AI Writer', to: '/aiwriter' },
   ],
   Company: [
      { label: 'About Us', to: '/aboutus' },
      { label: 'Pricing', href: '#' },
   ],
   Support: [
      { label: 'Help Center', href: '#' },
      { label: 'FAQs', href: '#' },
      { label: 'Terms & Conditions', href: '#' },
      { label: 'Privacy Policy', href: '#' },
   ],
};

const socials = [
   { name: 'GitHub', icon: Github },
   { name: 'Instagram', icon: Instagram },
   { name: 'LinkedIn', icon: Linkedin },
];

const EASE = [0.22, 1, 0.36, 1];

const homeJsonLd = {
   '@context': 'https://schema.org',
   '@graph': [
      {
         '@type': 'WebSite',
         '@id': 'https://klique.netlify.app/#website',
         url: 'https://klique.netlify.app/',
         name: 'Klique',
         description: 'All-in-One Content Creator & Social Media Toolbox',
         potentialAction: {
            '@type': 'SearchAction',
            target: 'https://klique.netlify.app/?q={search_term_string}',
            'query-input': 'required name=search_term_string',
         },
      },
      {
         '@type': 'Organization',
         '@id': 'https://klique.netlify.app/#organization',
         name: 'Klique',
         url: 'https://klique.netlify.app/',
         logo: 'https://klique.netlify.app/assets/klique.png',
      },
      {
         '@type': 'WebApplication',
         name: 'Klique Creator Suite',
         applicationCategory: 'UtilitiesApplication',
         operatingSystem: 'All',
         url: 'https://klique.netlify.app/',
         offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
   ],
};

/* -------------------------------------------------------------------------- */
/*  Tool card — cursor-tracked spotlight, icon + arrow micro-interactions     */
/* -------------------------------------------------------------------------- */

function ToolCard({ tool, index }) {
   const reduce = useReducedMotion();
   const mx = useMotionValue(-300);
   const my = useMotionValue(-300);
   const spotlight = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, rgba(161,161,170,0.18), transparent 70%)`;
   const ring = useMotionTemplate`radial-gradient(180px circle at ${mx}px ${my}px, rgba(161,161,170,0.55), transparent 70%)`;
   const Icon = tool.icon;

   const onMove = (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      mx.set(e.clientX - r.left);
      my.set(e.clientY - r.top);
   };
   const onLeave = () => {
      mx.set(-300);
      my.set(-300);
   };

   return (
      <motion.li
         layout={!reduce}
         initial={reduce ? false : { opacity: 0, y: 18 }}
         whileInView={{ opacity: 1, y: 0 }}
         exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
         viewport={{ once: true, margin: '0px 0px -60px 0px' }}
         transition={{
            duration: 0.5,
            ease: EASE,
            delay: reduce ? 0 : (index % 3) * 0.06,
         }}
         className="list-none">
         <Link
            to={tool.link}
            onMouseEnter={() => preloadRoute(tool.link)}
            onTouchStart={() => preloadRoute(tool.link)}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className="group relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 text-left transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-900/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700 dark:hover:shadow-black/40 dark:focus-visible:ring-offset-zinc-950 sm:p-7">
            {/* cursor spotlight (fill) */}
            <motion.div
               aria-hidden
               className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
               style={{ background: spotlight }}
            />
            {/* cursor spotlight (border ring) */}
            <motion.div
               aria-hidden
               className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
               style={{
                  background: ring,
                  padding: 1,
                  WebkitMask:
                     'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
               }}
            />

            <div className="relative flex items-start justify-between">
               {/* Tinted hover state for icon */}
               <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-900 transition-all duration-300 ease-out group-hover:scale-105 group-hover:-rotate-3 group-hover:border-[#daf4aa] group-hover:bg-[#daf4aa] group-hover:text-zinc-950 dark:border-zinc-700/60 dark:bg-zinc-800 dark:text-zinc-100 dark:group-hover:border-[#daf4aa] dark:group-hover:bg-[#daf4aa] dark:group-hover:text-zinc-950">
                  <Icon size={22} strokeWidth={1.75} />
               </div>

               <span className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-zinc-400 transition-all duration-300 group-hover:border-zinc-200 group-hover:text-zinc-900 dark:group-hover:border-zinc-700 dark:group-hover:text-zinc-100">
                  <ArrowUpRight
                     size={16}
                     className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
               </span>
            </div>

            <h3 className="relative mt-6 text-lg font-semibold tracking-tight text-zinc-900 transition-colors duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-zinc-900 group-hover:to-zinc-500 dark:text-zinc-100 dark:group-hover:from-white dark:group-hover:to-zinc-400">
               {tool.title}
            </h3>
            <p className="relative mt-2 flex-1 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
               {tool.desc}
            </p>

            <div className="relative mt-5 flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
               <span>{tool.category}</span>
               {tool.ai && (
                  <>
                     <span className="rounded-full border border-[#daf4aa]/50 bg-[#daf4aa]/10 px-2 py-0.5 font-medium text-zinc-700 dark:border-[#daf4aa]/30 dark:text-[#daf4aa]">
                        AI
                     </span>
                  </>
               )}
            </div>
         </Link>
      </motion.li>
   );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function HeroPage() {
   const reduce = useReducedMotion();
   const toolsSectionRef = useRef(null);
   const lastY = useRef(0);

   const [showNavbar, setShowNavbar] = useState(true);
   const [scrolled, setScrolled] = useState(false);
   const [category, setCategory] = useState('All');

   /* Navbar: hide on scroll down, show on scroll up (window scroll) */
   const { scrollY, scrollYProgress } = useScroll();
   const progress = useSpring(scrollYProgress, {
      stiffness: 120,
      damping: 30,
      restDelta: 0.001,
   });

   useMotionValueEvent(scrollY, 'change', (y) => {
      setScrolled(y > 24);
      if (y < 150) setShowNavbar(true);
      else if (y > lastY.current + 10) setShowNavbar(false);
      else if (y < lastY.current - 10) setShowNavbar(true);
      lastY.current = y;
   });

   /* Hero: cursor-following glow */
   const gx = useMotionValue(600);
   const gy = useMotionValue(260);
   const sx = useSpring(gx, { stiffness: 70, damping: 20 });
   const sy = useSpring(gy, { stiffness: 70, damping: 20 });
   const heroGlow = useMotionTemplate`radial-gradient(520px circle at ${sx}px ${sy}px, rgba(255,255,255,0.07), transparent 65%)`;

   const onHeroMove = (e) => {
      if (reduce) return;
      const r = e.currentTarget.getBoundingClientRect();
      gx.set(e.clientX - r.left);
      gy.set(e.clientY - r.top);
   };

   const handleScroll = () =>
      toolsSectionRef.current?.scrollIntoView({
         behavior: reduce ? 'auto' : 'smooth',
         block: 'start',
      });

   const visibleTools =
      category === 'All' ? tools : tools.filter((t) => t.category === category);

   const countFor = (c) =>
      c === 'All' ? tools.length : tools.filter((t) => t.category === c).length;

   /* Hero entrance — one orchestrated sequence */
   const heroItem = (delay) => ({
      initial: reduce ? false : { opacity: 0, y: 24, filter: 'blur(8px)' },
      animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
      transition: { duration: 0.8, ease: EASE, delay },
   });

   return (
      <div className="customScrollbar relative min-h-[100dvh] w-full overflow-x-hidden bg-zinc-50 text-zinc-900 dark:bg-[#09090b] dark:text-zinc-100 select-none">
         <SEO
            title="Klique - All-in-One Content Creator & Social Media Toolbox"
            description="Enhance your digital presence with Klique. Access free tools for custom fonts, emoji mixing, cool symbols, AI bios, viral hashtags, AI writer, word counter, PDF converters, and timezone tools."
            keywords="klique, content creator tools, social media toolbox, fancy font generator, emoji mixer, cool symbols, copy paste symbols, AI bio generator, viral hashtag generator, AI writer, word counter, username generator, timezone converter, pdf converter"
            canonicalUrl="https://klique.netlify.app/"
            jsonLd={homeJsonLd}
         />

         {/* Scroll progress */}
         <motion.div
            aria-hidden
            className="fixed inset-x-0 top-0 z-[10000] h-[2px] origin-left bg-[#daf4aa] dark:bg-[#daf4aa]"
            style={{ scaleX: progress }}
         />

         {/* Static ambient backdrop */}
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         <div className="relative z-10 w-full min-w-0">
            {/* Navbar */}
            <motion.header
               initial={reduce ? false : { opacity: 0, y: -24 }}
               animate={{
                  opacity: showNavbar ? 1 : 0,
                  y: showNavbar ? 0 : -96,
               }}
               transition={{ duration: 0.45, ease: EASE }}
               className={`fixed left-2 right-2 top-3 z-[9999] mx-auto flex w-[calc(100%-16px)] max-w-6xl items-center justify-between rounded-2xl px-3 py-2.5 transition-[background-color,border-color,backdrop-filter] duration-500 sm:px-5 sm:py-3 ${
                  scrolled ? '' : 'border-transparent bg-transparent'
               }`}>
               <Link to="/" className="flex items-center gap-2.5">
                  <span className="animate-klique-shine bg-[linear-gradient(110deg,#18181b_25%,#71717a_40%,#18181b_50%,#71717a_60%,#18181b_75%)] bg-[length:300%_100%] bg-clip-text text-xl font-bold text-transparent dark:bg-[linear-gradient(110deg,#ffffff_25%,#a1a1aa_40%,#ffffff_50%,#a1a1aa_60%,#ffffff_75%)] sm:text-2xl">
                     Klique
                  </span>
               </Link>

               <motion.button
                  type="button"
                  onClick={handleScroll}
                  whileHover={reduce ? undefined : { y: -1, scale: 1.02 }}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  className="
    group relative inline-flex shrink-0 items-center gap-2
    overflow-hidden rounded-full
    border border-zinc-200/80
    bg-white/75 px-4 py-2.5
    text-sm font-semibold text-zinc-800
    shadow-sm shadow-zinc-900/[0.03]
    backdrop-blur-xl
    transition-all duration-300
    hover:border-[#daf4aa] hover:bg-white
    hover:shadow-md hover:shadow-zinc-900/[0.06]
    focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-zinc-400
    dark:border-zinc-700/80
    dark:bg-zinc-900/75 dark:text-zinc-100
    dark:hover:border-[#daf4aa]/60 dark:hover:bg-zinc-800
  ">
                  <span
                     className="
    flex h-6 w-6 items-center justify-center
    rounded-full bg-zinc-100 text-zinc-700
    transition-colors duration-300
    group-hover:bg-[#daf4aa] group-hover:text-zinc-950
    dark:bg-zinc-800 dark:text-zinc-200
    dark:group-hover:bg-[#daf4aa] dark:group-hover:text-zinc-950
  ">
                     <Command size={13} />
                  </span>

                  <span>Browse tools</span>

                  <ArrowRight
                     size={15}
                     className="transition-transform duration-300 group-hover:translate-x-1"
                  />
               </motion.button>
            </motion.header>

            {/* Hero */}
            <section
               onMouseMove={onHeroMove}
               className="relative mx-auto flex max-w-7xl flex-col items-center justify-center px-4 pb-20 pt-36 text-center sm:px-6 sm:pb-28 sm:pt-36">
               <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 hidden sm:block"
                  style={{ background: heroGlow }}
               />

               <motion.h1
                  {...heroItem(0.05)}
                  className="relative mb-5 max-w-4xl text-4xl font-bold leading-[1.06] tracking-tight sm:mb-7 sm:text-5xl md:text-6xl lg:text-7xl">
                  Create {/* Animated Tinted Gradient Text */}
                  <span className="gradient-text">Amazing Content</span>
                  <br />
                  Effortlessly
               </motion.h1>

               <motion.p
                  {...heroItem(0.18)}
                  className="relative mx-auto mb-8 max-w-2xl px-2 text-sm font-light leading-6 text-zinc-500 dark:text-zinc-400 sm:mb-11 sm:text-lg md:text-xl">
                  Explore tools designed to help you create engaging content for
                  your social media and digital presence. Operate swiftly with
                  precise accuracy.
               </motion.p>

               <motion.div
                  {...heroItem(0.3)}
                  className="relative flex flex-col items-center gap-5">
                  <motion.button
                     type="button"
                     onClick={handleScroll}
                     whileHover={reduce ? undefined : { scale: 1.035, y: -2 }}
                     whileTap={reduce ? undefined : { scale: 0.97 }}
                     transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 22,
                     }}
                     className="
    group relative isolate inline-flex w-full
    items-center justify-center gap-3
    overflow-hidden rounded-full
    border border-zinc-700/80
    bg-gradient-to-br from-zinc-800 via-zinc-950 to-black
    px-7 py-4
    text-sm font-semibold tracking-wide text-white
    shadow-lg shadow-zinc-950/15
    transition-shadow duration-300
    hover:shadow-xl hover:shadow-zinc-950/25
    focus-visible:outline-none
    focus-visible:ring-2 focus-visible:ring-[#daf4aa]
    focus-visible:ring-offset-4 focus-visible:ring-offset-zinc-50
    dark:border-zinc-200/80
    dark:from-zinc-100 dark:via-white dark:to-zinc-200
    dark:text-zinc-950
    dark:focus-visible:ring-offset-zinc-950
    sm:w-auto sm:min-w-[220px] sm:px-9
  ">
                     {/* Soft ambient glow */}
                     <span
                        aria-hidden="true"
                        className="
      pointer-events-none absolute -inset-10 -z-10
      bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.18),transparent_65%)]
      opacity-0 blur-xl transition-opacity duration-500
      group-hover:opacity-100
      dark:bg-[radial-gradient(ellipse_at_center,rgba(113,113,122,0.25),transparent_65%)]
    "
                     />

                     {/* Moving sheen */}
                     <span
                        aria-hidden="true"
                        className="
      pointer-events-none absolute inset-y-0 -left-1/2
      w-1/3 -skew-x-12
      bg-gradient-to-r from-transparent via-white/20 to-transparent
      transition-transform duration-700 ease-out
      group-hover:translate-x-[450%]
      dark:via-zinc-950/10
    "
                     />

                     <span
                        className="
    relative flex h-8 w-8 items-center justify-center
    rounded-xl border border-white/15 bg-white/10
    transition-transform duration-300
    group-hover:rotate-6 group-hover:scale-110
    dark:border-zinc-900/10 dark:bg-zinc-900/5
  ">
                        <Sparkles size={18} />
                     </span>

                     <span className="relative flex flex-col items-center gap-1">
                        <span className="text-base font-bold leading-tight group-hover:text-[#daf4aa] dark:group-hover:text-zinc-700 transition-colors duration-300">
                           Start Creating
                        </span>
                        <span className="text-[9px] font-light text-white/65 dark:text-zinc-600 uppercase">
                           Explore free tools
                        </span>
                     </span>

                     <ArrowRight
                        size={19}
                        className="
      relative ml-1 transition-transform duration-300
      group-hover:translate-x-1
    "
                     />
                  </motion.button>

                  <p className="text-xs text-zinc-500 dark:text-zinc-500 uppercase">
                     {/* Animated Gradient Tint applied to Tools Counter */}
                     <span className="animate-klique-shine bg-[linear-gradient(110deg,#daf4aa_25%,#bbf7d0_50%,#daf4aa_75%)] bg-[length:200%_100%] bg-clip-text text-transparent font-bold">
                        {tools.length} free{' '}
                     </span>
                     tools, ready to use
                  </p>
               </motion.div>
            </section>

            {/* Tools */}
            <section
               id="tools"
               className="relative scroll-mt-8 px-4 py-16 sm:px-6 sm:py-20">
               <div className="mx-auto max-w-6xl">
                  <motion.div
                     initial={reduce ? false : { opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true, margin: '-80px' }}
                     transition={{ duration: 0.6, ease: EASE }}
                     className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
                     <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Our Trending Tools
                     </h2>
                     <p
                        ref={toolsSectionRef}
                        className="px-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400 sm:text-lg">
                        Powerful, intuitive tools designed to elevate your
                        creative workflow.
                     </p>
                  </motion.div>
                  {/* Filter */}
                  <div
                     role="tablist"
                     aria-label="Filter tools by category"
                     className="mx-auto mb-8 flex max-w-full justify-start gap-1 overflow-x-auto rounded-full border border-zinc-200 bg-white/60 p-1 backdrop-blur sm:mb-10 sm:w-fit sm:justify-center dark:border-zinc-800 dark:bg-zinc-900/50 [&::-webkit-scrollbar]:hidden">
                     {CATEGORIES.map((c) => {
                        const active = category === c;
                        return (
                           <button
                              key={c}
                              role="tab"
                              aria-selected={active}
                              onClick={() => setCategory(c)}
                              className={`relative shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                                 active
                                    ? 'text-zinc-950'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                              }`}>
                              {active && (
                                 <motion.span
                                    layoutId="filter-pill"
                                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#daf4aa] to-[#bbf7d0] dark:from-[#daf4aa] dark:to-[#bbf7d0]"
                                    transition={{
                                       type: 'spring',
                                       stiffness: 420,
                                       damping: 34,
                                    }}
                                 />
                              )}
                              <span className="relative flex items-center gap-2">
                                 {c}
                                 <span
                                    className={`text-xs tabular-nums ${
                                       active
                                          ? 'opacity-80 text-zinc-950 font-semibold'
                                          : 'opacity-50'
                                    }`}>
                                    {countFor(c)}
                                 </span>
                              </span>
                           </button>
                        );
                     })}
                  </div>
                  {/* Grid */}
                  <AnimatePresence mode="wait" initial={false}>
                     <motion.ul
                        key={category}
                        initial={reduce ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduce ? undefined : { opacity: 0, y: -5 }}
                        transition={{
                           duration: reduce ? 0 : 0.18,
                           ease: EASE,
                        }}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                        {visibleTools.map((tool, i) => (
                           <ToolCard key={tool.link} tool={tool} index={i} />
                        ))}
                     </motion.ul>
                  </AnimatePresence>
               </div>
            </section>

            {/* Footer */}
            <footer className="relative bg-transparent pb-8 pt-16 sm:pt-20">
               <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 border-t border-zinc-200 px-5 pt-12 dark:border-zinc-800 sm:px-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-12">
                  <div>
                     <h3 className="text-2xl font-bold">Klique</h3>
                     <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        Create stunning content, bios, hashtags, and more with
                        our powerful tools. Designed for creators who want speed
                        and precision.
                     </p>
                     <div className="mt-6 flex flex-wrap gap-3">
                        {socials.map(({ name, icon: SocialIcon }) => (
                           <motion.a
                              key={name}
                              href="#"
                              aria-label={`Visit Klique on ${name}`}
                              whileHover={reduce ? undefined : { y: -3 }}
                              whileTap={reduce ? undefined : { scale: 0.92 }}
                              transition={{
                                 type: 'spring',
                                 stiffness: 400,
                                 damping: 20,
                              }}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition-colors hover:border-[#daf4aa] hover:bg-[#daf4aa] hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-[#daf4aa] dark:hover:bg-[#daf4aa] dark:hover:text-zinc-950">
                              <SocialIcon size={18} aria-hidden="true" />
                           </motion.a>
                        ))}
                     </div>
                  </div>

                  {Object.entries(footerLinks).map(([heading, links]) => (
                     <div key={heading}>
                        <h4 className="mb-4 text-sm font-semibold">
                           {heading}
                        </h4>
                        <ul className="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                           {links.map((l) => (
                              <li key={l.label}>
                                 {l.to ? (
                                    <Link
                                       to={l.to}
                                       onMouseEnter={() => preloadRoute(l.to)}
                                       onTouchStart={() => preloadRoute(l.to)}
                                       className="footer-link hover:text-[#daf4aa] dark:hover:text-[#daf4aa] transition-colors">
                                       {l.label}
                                    </Link>
                                 ) : (
                                    <a
                                       href={l.href}
                                       className="footer-link hover:text-[#daf4aa] dark:hover:text-[#daf4aa] transition-colors">
                                       {l.label}
                                    </a>
                                 )}
                              </li>
                           ))}
                        </ul>
                     </div>
                  ))}
               </div>

               <div className="mx-auto mt-10 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-zinc-200 px-5 pt-6 text-center dark:border-zinc-800 sm:px-10 md:flex-row md:text-left">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                     © {new Date().getFullYear()} Klique. All rights reserved.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm sm:gap-6">
                     {['Terms', 'Privacy', 'Cookies'].map((t) => (
                        <a
                           key={t}
                           href="#"
                           className="footer-link hover:text-[#daf4aa] dark:hover:text-[#daf4aa] transition-colors">
                           {t}
                        </a>
                     ))}
                  </div>
               </div>
            </footer>
         </div>

         {/* Footer link underline micro-interaction (scoped) */}
         <style>{`
            .footer-link {
               position: relative;
               display: inline-block;
               color: inherit;
               transition: color .2s ease;
            }
            .footer-link::after {
               content: '';
               position: absolute;
               left: 0; right: 0; bottom: -2px;
               height: 1px;
               background: currentColor;
               transform: scaleX(0);
               transform-origin: left;
               transition: transform .3s cubic-bezier(.22,1,.36,1);
            }
            .footer-link:hover::after { transform: scaleX(1); }
            .footer-link:focus-visible { outline: 2px solid rgb(161 161 170); outline-offset: 3px; border-radius: 4px; }
            @media (prefers-reduced-motion: reduce) {
               .footer-link::after { transition: none; }
            }
         `}</style>
      </div>
   );
}
