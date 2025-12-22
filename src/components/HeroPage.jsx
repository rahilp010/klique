import React, { useState, useEffect, useRef } from 'react';
import {
   FaSmile,
   FaUserAlt,
   FaHashtag,
   FaPalette,
   FaBars,
   FaTimes,
   FaTwitter,
   FaArrowRight,
} from 'react-icons/fa';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BiFont } from 'react-icons/bi';
import { SiNamecheap } from 'react-icons/si';
import { HiAtSymbol } from 'react-icons/hi2';
import { IoSparklesOutline } from 'react-icons/io5';
import {
   FaFacebook,
   FaFax,
   FaGithub,
   FaInstagram,
   FaLinkedin,
   FaX,
} from 'react-icons/fa6';
import { LiaLongArrowAltRightSolid } from 'react-icons/lia';
import { File } from 'lucide-react';

const tools = [
   {
      icon: <FaSmile size={32} />,
      title: 'Font Creator',
      desc: 'Mix and match emojis to create unique combinations.',
      link: '/fontgenerator',
      gradient: 'from-blue-500 via-cyan-400 to-teal-400',
   },
   {
      icon: <FaUserAlt size={32} />,
      title: 'Emojis',
      desc: 'Generate creative bios for your social media profiles.',
      link: '/emojigenerator',
      gradient: 'from-purple-500 via-pink-500 to-rose-400',
   },
   {
      icon: <HiAtSymbol size={32} />,
      title: 'Symbols',
      desc: 'Generate relevant hashtags and captions for your posts.',
      link: '/symbol',
      gradient: 'from-emerald-500 via-teal-400 to-cyan-400',
   },
   {
      icon: <FaPalette size={32} />,
      title: 'AI Bio Creator',
      desc: 'Create personalized and engaging bio content.',
      link: '/bio',
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
   },
   {
      icon: <FaHashtag size={32} />,
      title: 'AI HashTag',
      desc: 'Create personalized and engaging bio content.',
      link: '/hashtaggenerator',
      gradient: 'from-amber-200 via-orange-500 to-blue-300',
   },
   {
      icon: <BiFont size={32} />,
      title: 'Word Counter',
      desc: 'Create personalized and engaging bio content.',
      link: '/wordCounter',
      gradient: 'from-green-500 via-yellow-500 to-cyan-500',
   },
   {
      icon: <IoSparklesOutline size={32} />,
      title: 'AI Writer',
      desc: 'Create personalized and engaging bio content.',
      link: '/aiwriter',
      gradient: 'from-red-500 via-indigo-500 to-pink-500',
   },
   {
      icon: <SiNamecheap size={32} />,
      title: 'Username Generator',
      desc: 'Create personalized and engaging bio content.',
      link: '/username',
      gradient: 'from-violet-500 via-blue-500 to-blue-500',
   },
   {
      icon: <SiNamecheap size={32} />,
      title: 'Time Zone',
      desc: 'Create personalized and engaging bio content.',
      link: '/timezone',
      gradient: 'from-violet-500 via-blue-500 to-blue-500',
   },
   // {
   //    icon: <File size={32} />,
   //    title: 'PDF Tools',
   //    desc: 'Convert PDF to anything.',
   //    link: '/pdftools',
   //    gradient: 'from-red-500 via-green-500 to-pink-500',
   // },
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

         // Always show navbar near top (hero area)
         if (currentY < 150) {
            setShowNavbar(true);
         } else {
            // Hide on scroll down, show on scroll up
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

   return (
      <div
         ref={sectionRef}
         className="max-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-auto customScrollbar">
         {/* Decorative blurred gradient blobs */}
         <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-[150px]" />
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-500/30 rounded-full blur-[150px]" />

         {/* Navbar */}
         <header
            className={`fixed top-2 left-1/2 transform -translate-x-1/2 z-40 
    transition-all duration-500 ease-in-out
    ${showNavbar ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-20'}
    ${
       scrolled
          ? 'backdrop-blur-xl bg-white/20 border-white/20 shadow-lg'
          : 'backdrop-blur-lg bg-white/10'
    }
    border border-white/10 px-8 py-3 rounded-full flex items-center justify-between w-[90%] md:w-[70%] max-w-5xl`}>
            {/* Logo */}
            <div className="flex items-center space-x-2">
               <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                  TapClick
               </span>
            </div>

            {/* Get Started Button */}
            <button
               className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full text-sm font-semibold hover:scale-105 hover:shadow-md hover:shadow-pink-500/30 transition-all duration-300"
               onClick={handleScroll}>
               Get Started
            </button>

            {/* Mobile Menu Button */}
            <button
               onClick={() => setSidebarOpen(!sidebarOpen)}
               className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
               aria-label="Toggle menu">
               {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
         </header>

         {/* Mobile Sidebar */}
         <div
            className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
               sidebarOpen
                  ? 'opacity-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none'
            }`}>
            <div
               className="absolute inset-0 bg-black/70 backdrop-blur-md"
               onClick={() => setSidebarOpen(false)}
            />
            <div
               className={`absolute left-0 top-0 bottom-0 w-64 bg-white/10 backdrop-blur-xl border-r border-white/10 shadow-2xl transform transition-transform duration-300 ${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
               }`}>
               <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                     <span className="text-lg font-bold">Menu</span>
                     <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-lg">
                        <FaTimes size={20} />
                     </button>
                  </div>
                  <nav className="space-y-4">
                     {['Features', 'Tools', 'Pricing', 'About'].map((item) => (
                        <a
                           key={item}
                           href={`#${item.toLowerCase()}`}
                           className="block py-2 text-gray-300 hover:text-white transition-colors">
                           {item}
                        </a>
                     ))}
                  </nav>
               </div>
            </div>
         </div>

         {/* Hero Section */}
         <section className="pt-40 pb-20 px-6 text-center relative z-10 customScrollbar">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
               Create <span className="gradient-text">Amazing Content</span>
               <br />
               Effortlessly
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-10">
               Explore tools designed to help you create engaging content for
               your social media and digital presence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
               <button
                  className="px-12 py-4 pr-16 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full text-lg text-white hover:shadow-2xl hover:shadow-pink-500/40 transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto relative overflow-hidden font-bold"
                  onClick={handleScroll}>
                  Start Creating
                  <span className="absolute right-1 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full flex items-center justify-center">
                     <LiaLongArrowAltRightSolid
                        size={24}
                        className="text-indigo-500 font-bold"
                     />
                  </span>
               </button>
            </div>
         </section>

         {/* Tools Section */}
         <section
            id="tools"
            className="py-20 px-6 relative z-10"
            ref={toolsSectionRef}>
            <div className="max-w-7xl mx-auto text-center">
               <h2 className="text-4xl md:text-5xl font-bold mb-4 ">
                  Our <span className="gradient-text">Trending Tools</span>
               </h2>
               <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-16">
                  Powerful, intuitive tools designed to elevate your creative
                  workflow.
               </p>

               <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-6 md:px-10 pb-20"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={{
                     visible: { transition: { staggerChildren: 0.15 } },
                  }}>
                  {tools.map((tool, i) => (
                     <motion.div
                        key={i}
                        variants={{
                           hidden: { opacity: 0, y: 40 },
                           visible: { opacity: 1, y: 0 },
                        }}
                        whileHover={{
                           y: -8,
                           scale: 1.03,
                           boxShadow: '0 0 25px rgba(139,92,246,0.3)',
                        }}
                        whileTap={{
                           scale: 0.98,
                        }}
                        transition={{ type: 'spring', stiffness: 250 }}
                        className="rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 overflow-hidden backdrop-blur-md">
                        <Link to={tool.link}>
                           <div
                              className={`bg-gradient-to-br ${tool.gradient} text-white flex flex-col items-center justify-center p-10 space-y-4`}>
                              {tool.icon}
                           </div>
                           <div className="p-6 text-center">
                              <h3 className="font-semibold text-white text-lg">
                                 {tool.title}
                              </h3>
                              <p className="text-gray-400 text-sm mt-2">
                                 {tool.desc}
                              </p>
                           </div>
                        </Link>
                     </motion.div>
                  ))}
               </motion.div>
            </div>
         </section>

         {/* Popular This Week */}
         <section className="pb-20 px-18 relative z-10">
            <div className="max-w-7xl mx-auto text-center">
               <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Popular <span className="gradient-text">This Week</span>
               </h2>
               <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-16">
                  Check out the most trending tools used by our community.
               </p>

               <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}>
                  {tools.slice(0, 3).map((tool, index) => (
                     <motion.div
                        key={index}
                        whileHover={{ scale: 1.05, y: -10 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="rounded-3xl p-6 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.1)] 
                          relative overflow-hidden">
                        {/* Animated Liquid Blob */}
                        <motion.div
                           className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-pink-500/20 blur-2xl"
                           animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.3, 0.6, 0.3],
                           }}
                           transition={{
                              duration: 6,
                              repeat: Infinity,
                              ease: 'easeInOut',
                           }}
                        />

                        <div className="relative z-10 text-center">
                           <div className="flex items-center justify-center mb-4">
                              {tool.icon}
                           </div>
                           <h3 className="text-xl font-semibold text-white">
                              {tool.title}
                           </h3>
                           <p className="text-gray-400 text-sm mt-2">
                              {tool.desc}
                           </p>
                        </div>
                     </motion.div>
                  ))}
               </motion.div>
            </div>
         </section>

         {/* COMMUNITY LOVE SECTION */}
         <section className="py-32 px-16 relative z-10">
            <div className="max-w-7xl mx-auto text-center mb-14">
               <h2 className="text-4xl md:text-5xl font-bold">
                  Community <span className="gradient-text">Love</span>
               </h2>
               <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  Real feedback from real creators using TapClick.
               </p>
            </div>

            {/* SLIDER CONTAINER */}
            <div className="overflow-hidden relative">
               <motion.div
                  className="flex gap-8"
                  animate={{ x: ['0%', '-100%'] }}
                  transition={{
                     duration: 70,
                     repeat: Infinity,
                     ease: 'linear',
                  }}
                  whileHover={{ animationPlayState: 'paused' }}
                  style={{ animationPlayState: 'running' }}>
                  {[1, 2].map((loop) => (
                     <div className="flex gap-8" key={loop}>
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
                                 'Beautiful UI, smooth animations and super helpful tools. I use TapClick every day!',
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
                              className="min-w-[360px] p-8 rounded-3xl bg-white/10 backdrop-blur-xl
border border-white/20 shadow-[0_0_35px_rgba(255,255,255,0.15)]
flex flex-col gap-3 relative overflow-hidden h-[260px]"
                              whileHover={{ scale: 1.01 }}
                              transition={{ type: 'spring', stiffness: 180 }}>
                              {/* LIQUID ANIMATION */}
                              <motion.div
                                 className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 blur-2xl rounded-3xl"
                                 animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.3, 0.6, 0.3],
                                 }}
                                 transition={{ duration: 6, repeat: Infinity }}
                              />

                              {/* TOP SECTION */}
                              <div className="relative z-10 flex items-center gap-4">
                                 <img
                                    src={u.img}
                                    className="w-16 h-16 rounded-full border border-white/30 shadow-lg object-cover"
                                    alt=""
                                 />
                                 <div>
                                    <h3 className="text-white font-semibold text-xl">
                                       {u.name}
                                    </h3>
                                    <div className="flex">
                                       {Array.from({ length: u.rating }).map(
                                          (_, i) => (
                                             <span
                                                key={i}
                                                className="text-yellow-300 text-lg">
                                                ★
                                             </span>
                                          )
                                       )}
                                    </div>
                                 </div>
                              </div>

                              {/* COMMENT WITH QUOTE */}
                              <div className="relative z-10 flex-1">
                                 <span className="text-pink-400 text-4xl leading-none opacity-70 block mb-2">
                                    ❝
                                 </span>
                                 <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 break-words break-normal whitespace-normal">
                                    {u.comment}
                                 </p>
                              </div>

                              {/* GRADIENT LINE */}
                              <div className="relative z-10 h-[3px] w-full bg-gradient-to-r from-indigo-400 to-pink-400 rounded-full opacity-60" />
                           </motion.div>
                        ))}
                     </div>
                  ))}
               </motion.div>
            </div>
         </section>

         {/* PROFESSIONAL FOOTER */}
         <footer className="bg-gradient-to-b from-black/40 to-black/80 border-t border-white/10 pt-16 pb-10 mt-20 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-14">
               {/* Brand */}
               <div>
                  <h3 className="text-2xl font-bold gradient-text">TapClick</h3>
                  <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                     Create stunning content, bios, hashtags, and more with our
                     powerful AI tools. Designed for creators who want speed,
                     aesthetics, and creativity.
                  </p>

                  {/* Social Icons */}
                  <div className="flex gap-4 mt-6">
                     {[
                        { name: 'facebook', icon: <FaFacebook /> },
                        { name: 'github', icon: <FaGithub /> },
                        { name: 'instagram', icon: <FaInstagram /> },
                        { name: 'linkedin', icon: <FaLinkedin /> },
                     ].map((s, i) => (
                        <a
                           key={i}
                           href="#"
                           className="w-10 h-10 flex items-center justify-center 
                             bg-white/10 hover:bg-white/20 text-white 
                             rounded-full transition-all backdrop-blur-xl">
                           <span className="text-lg">{s.icon}</span>
                        </a>
                     ))}
                  </div>
               </div>

               {/* Tools */}
               <div>
                  <h4 className="text-white font-semibold text-lg mb-4">
                     Tools
                  </h4>
                  <ul className="space-y-3 text-gray-400 text-sm">
                     <li>
                        <a href="/fontgenerator" className="hover:text-white">
                           Font Creator
                        </a>
                     </li>
                     <li>
                        <a href="/emojigenerator" className="hover:text-white">
                           Emoji Generator
                        </a>
                     </li>
                     <li>
                        <a href="/symbol" className="hover:text-white">
                           Symbol Generator
                        </a>
                     </li>
                     <li>
                        <a href="/bio" className="hover:text-white">
                           AI Bio Creator
                        </a>
                     </li>
                     <li>
                        <a href="/aiwriter" className="hover:text-white">
                           AI Writer
                        </a>
                     </li>
                  </ul>
               </div>

               {/* Company */}
               <div>
                  <h4 className="text-white font-semibold text-lg mb-4">
                     Company
                  </h4>
                  <ul className="space-y-3 text-gray-400 text-sm">
                     <li>
                        <a href="#" className="hover:text-white">
                           About Us
                        </a>
                     </li>
                     <li>
                        <a href="#" className="hover:text-white">
                           Pricing
                        </a>
                     </li>
                     <li>
                        <a href="#" className="hover:text-white">
                           Blog
                        </a>
                     </li>
                     <li>
                        <a href="#" className="hover:text-white">
                           Careers
                        </a>
                     </li>
                  </ul>
               </div>

               {/* Support */}
               <div>
                  <h4 className="text-white font-semibold text-lg mb-4">
                     Support
                  </h4>
                  <ul className="space-y-3 text-gray-400 text-sm">
                     <li>
                        <a href="#" className="hover:text-white">
                           Help Center
                        </a>
                     </li>
                     <li>
                        <a href="#" className="hover:text-white">
                           FAQs
                        </a>
                     </li>
                     <li>
                        <a href="#" className="hover:text-white">
                           Contact
                        </a>
                     </li>
                     <li>
                        <a href="#" className="hover:text-white">
                           Terms & Conditions
                        </a>
                     </li>
                     <li>
                        <a href="#" className="hover:text-white">
                           Privacy Policy
                        </a>
                     </li>
                  </ul>
               </div>
            </div>

            {/* Bottom Row */}
            <div className="border-t border-white/10 mt-12 pt-6">
               <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
                  <p className="text-gray-500 text-sm">
                     © {new Date().getFullYear()} TapClick. All rights reserved.
                  </p>

                  <div className="flex gap-6 text-sm mt-4 md:mt-0">
                     <a href="#" className="text-gray-400 hover:text-white">
                        Terms
                     </a>
                     <a href="#" className="text-gray-400 hover:text-white">
                        Privacy
                     </a>
                     <a href="#" className="text-gray-400 hover:text-white">
                        Cookies
                     </a>
                  </div>
               </div>
            </div>
         </footer>
      </div>
   );
}
