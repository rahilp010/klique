/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   Share2,
   Copy,
   Check,
   Globe,
   Sparkles,
   Sliders,
   Image as ImageIcon,
   Upload,
   Eye,
   FileCode,
   AlertCircle,
   CheckCircle2,
   ExternalLink,
   MessageSquare,
   Search,
   RefreshCw,
   Braces,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '../Navbar';
import SEO from '../SEO';

const SOCIAL_TABS = [
   { id: 'twitter', label: 'Twitter / X', icon: Share2 },
   { id: 'linkedin', label: 'LinkedIn', icon: Share2 },
   { id: 'facebook', label: 'Facebook', icon: Share2 },
   { id: 'discord', label: 'Discord Embed', icon: MessageSquare },
   { id: 'google', label: 'Google Search', icon: Search },
];

const PRESETS = [
   {
      name: 'Tech SaaS',
      title: 'Klique - All-in-One Creator & Developer Suite',
      description:
         'High-performance developer utilities, AI copywriters, vector format converters, and branded QR codes in one aesthetic workspace.',
      url: 'https://klique.netlify.app',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop',
      siteName: 'Klique',
      twitterHandle: '@kliqueapp',
   },
   {
      name: 'Blog Article',
      title: 'Building Modern High-Performance Web Apps in 2026',
      description:
         'A comprehensive engineering guide on client-side WebAssembly, zero-server privacy, and interactive UI design.',
      url: 'https://klique.netlify.app/blog/modern-web-apps',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
      siteName: 'Klique Engineering',
      twitterHandle: '@rahilp010',
   },
   {
      name: 'Product Launch',
      title: 'Next-Gen Developer Toolkit - Now Available',
      description:
         'Empower your workflow with instant offline-ready converters, regex visualizers, and code screenshot generators.',
      url: 'https://klique.netlify.app/launch',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop',
      siteName: 'Klique Products',
      twitterHandle: '@kliqueapp',
   },
];

export default function OGPreviewer() {
   const [activeSocialTab, setActiveSocialTab] = useState('twitter');
   const [title, setTitle] = useState(PRESETS[0].title);
   const [description, setDescription] = useState(PRESETS[0].description);
   const [url, setUrl] = useState(PRESETS[0].url);
   const [imageUrl, setImageUrl] = useState(PRESETS[0].image);
   const [siteName, setSiteName] = useState(PRESETS[0].siteName);
   const [twitterHandle, setTwitterHandle] = useState(PRESETS[0].twitterHandle);
   const [twitterCardType, setTwitterCardType] = useState(
      'summary_large_image',
   );

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

   const handleImageUpload = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
         setImageUrl(event.target.result);
         showToast('Uploaded preview image!');
      };
      reader.readAsDataURL(file);
   };

   const applyPreset = (preset) => {
      setTitle(preset.title);
      setDescription(preset.description);
      setUrl(preset.url);
      setImageUrl(preset.image);
      setSiteName(preset.siteName);
      setTwitterHandle(preset.twitterHandle);
      showToast(`Applied ${preset.name} preset!`);
   };

   // Clean domain name for mockups
   const domain = useMemo(() => {
      try {
         return new URL(url).hostname;
      } catch (e) {
         return 'klique.netlify.app';
      }
   }, [url]);

   // Generated Meta Tags HTML
   const generatedHtml = useMemo(() => {
      return `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${description}">
<link rel="canonical" href="${url}">

<!-- Open Graph / Facebook / LinkedIn -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${imageUrl}">
<meta property="og:site_name" content="${siteName}">

<!-- Twitter / X Card -->
<meta name="twitter:card" content="${twitterCardType}">
<meta name="twitter:url" content="${url}">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${imageUrl}">
<meta name="twitter:site" content="${twitterHandle}">
<meta name="twitter:creator" content="${twitterHandle}">

<!-- JSON-LD Structured Data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "${title}",
  "description": "${description}",
  "url": "${url}"
}
</script>`;
   }, [
      title,
      description,
      url,
      imageUrl,
      siteName,
      twitterHandle,
      twitterCardType,
   ]);

   const copyCode = () => {
      navigator.clipboard.writeText(generatedHtml);
      showToast('Copied full Open Graph & Meta HTML snippet!');
   };

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden

    before:absolute

    before:inset-0

    before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]

    after:absolute

    after:inset-0

    after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
         <div
            className="

    pointer-events-none absolute inset-0

    bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]

  "
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

         <SEO
            title="Social Open Graph (OG) Previewer & Meta Tag Generator - Free Online Tool | Klique"
            description="Free online Open Graph previewer and social meta tag generator. Test and preview link cards for Twitter / X, LinkedIn, Facebook, Discord, and Google. Generate SEO meta tags and Schema.org JSON-LD instantly."
            keywords="open graph previewer, og image tester, twitter card generator, linkedin share preview, facebook link preview, discord embed preview, social media meta tags, og meta tag generator, schema org json ld, seo meta generator, klique"
            canonicalUrl="https://klique.netlify.app/ogpreviewer"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'SoftwareApplication',
               name: 'Social Open Graph (OG) Previewer',
               applicationCategory: 'DeveloperApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Free online Open Graph previewer and social meta tag generator with live Twitter, LinkedIn, Facebook, Discord, and Google previews.',
               author: {
                  '@type': 'Organization',
                  name: 'Klique',
               },
               featureList: [
                  'Live Twitter / X card preview (Large image & summary)',
                  'LinkedIn post share preview',
                  'Facebook link preview',
                  'Discord rich embed preview',
                  'Google search snippet preview',
                  'Real-time title and description character counter',
                  'Complete Open Graph HTML meta tag generation',
                  'Twitter card meta tag generation',
                  'Schema.org JSON-LD structured data generator',
               ],
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

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-7xl flex-col pb-28 pt-10 sm:pb-24 sm:pt-6 lg:pl-20">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center sm:text-left">
               <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                  <Braces size={14} className="text-[#daf4aa]" />

                  <span>Developer Suite</span>
               </div>
               <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                  Social Open Graph (OG) Previewer
               </h1>
               <p className="mt-1 text-sm text-zinc-400 max-w-2xl">
                  Inspect and preview how your website link cards look across X,
                  LinkedIn, Facebook, Discord, and Google. Generate bulletproof
                  meta tags.
               </p>
            </motion.div>

            {/* Quick Presets Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
               <span className="text-xs text-zinc-400 font-medium mr-1">
                  Try Sample Templates:
               </span>
               {PRESETS.map((p) => (
                  <button
                     key={p.name}
                     type="button"
                     onClick={() => applyPreset(p)}
                     className="px-3 py-1.5 rounded-xl bg-[#18181b] hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white transition-colors">
                     {p.name}
                  </button>
               ))}
            </div>

            {/* Main Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
               {/* Left Column: Form Fields */}
               <div className="lg:col-span-6 space-y-5">
                  <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-4 shadow-xl">
                     <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-[#daf4aa]" />
                        Meta & Open Graph Parameters
                     </h2>

                     {/* Title */}
                     <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-zinc-300">
                           <span className="font-medium">
                              Page Title (og:title)
                           </span>
                           <span
                              className={`font-mono text-[11px] ${
                                 title.length > 60
                                    ? 'text-amber-400 font-semibold'
                                    : 'text-zinc-500'
                              }`}>
                              {title.length} / 60 chars
                           </span>
                        </div>
                        <input
                           type="text"
                           value={title}
                           onChange={(e) => setTitle(e.target.value)}
                           className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60"
                        />
                     </div>

                     {/* Description */}
                     <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs text-zinc-300">
                           <span className="font-medium">
                              Description (og:description)
                           </span>
                           <span
                              className={`font-mono text-[11px] ${
                                 description.length > 160
                                    ? 'text-amber-400 font-semibold'
                                    : 'text-zinc-500'
                              }`}>
                              {description.length} / 160 chars
                           </span>
                        </div>
                        <textarea
                           rows={3}
                           value={description}
                           onChange={(e) => setDescription(e.target.value)}
                           className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60 leading-relaxed"
                        />
                     </div>

                     {/* URL */}
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300">
                           Canonical URL (og:url)
                        </label>
                        <input
                           type="url"
                           value={url}
                           onChange={(e) => setUrl(e.target.value)}
                           placeholder="https://example.com"
                           className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60"
                        />
                     </div>

                     {/* Image URL & Upload */}
                     <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                           <span>Preview Image (og:image)</span>
                           <span className="text-[11px] text-zinc-500 font-normal">
                              Recommended 1200×630px
                           </span>
                        </label>
                        <div className="flex gap-2">
                           <input
                              type="text"
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              placeholder="https://example.com/og-image.jpg"
                              className="flex-1 bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60"
                           />
                           <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 cursor-pointer transition-colors shrink-0">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload</span>
                              <input
                                 type="file"
                                 accept="image/*"
                                 onChange={handleImageUpload}
                                 className="hidden"
                              />
                           </label>
                        </div>
                     </div>

                     {/* Site Name & Twitter Details */}
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                           <label className="text-xs font-medium text-zinc-400">
                              Site Name (og:site_name)
                           </label>
                           <input
                              type="text"
                              value={siteName}
                              onChange={(e) => setSiteName(e.target.value)}
                              placeholder="My Brand"
                              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#daf4aa]/60 mt-1"
                           />
                        </div>
                        <div>
                           <label className="text-xs font-medium text-zinc-400">
                              Twitter Handle (twitter:site)
                           </label>
                           <input
                              type="text"
                              value={twitterHandle}
                              onChange={(e) => setTwitterHandle(e.target.value)}
                              placeholder="@handle"
                              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#daf4aa]/60 mt-1"
                           />
                        </div>
                     </div>
                  </div>

                  {/* HTML Meta Generator Box */}
                  <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-3">
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                           <FileCode className="w-4 h-4 text-[#daf4aa]" />
                           Generated HTML & JSON-LD
                        </span>
                        <button
                           type="button"
                           onClick={copyCode}
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#daf4aa] hover:bg-[#cbe699] text-[#16161b] text-xs font-semibold transition-all">
                           <Copy className="w-3.5 h-3.5" />
                           <span>Copy Meta Code</span>
                        </button>
                     </div>
                     <pre className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed customScrollbar max-h-56">
                        {generatedHtml}
                     </pre>
                  </div>
               </div>

               {/* Right Column: Live Social Network Card Mockups */}
               <div className="lg:col-span-6 space-y-5 sticky top-28">
                  {/* Platform Selector Tabs */}
                  <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl border border-zinc-800 bg-[#0f0f11]">
                     {SOCIAL_TABS.map((tab) => {
                        const isSelected = activeSocialTab === tab.id;
                        return (
                           <button
                              key={tab.id}
                              type="button"
                              onClick={() => setActiveSocialTab(tab.id)}
                              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                 isSelected
                                    ? 'bg-[#daf4aa] text-black shadow-md'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                              }`}>
                              <span>{tab.label}</span>
                           </button>
                        );
                     })}
                  </div>

                  {/* PREVIEW CONTAINER */}
                  <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0f0f11] backdrop-blur-xl shadow-2xl space-y-4">
                     {/* 1. Twitter / X Card Preview */}
                     {activeSocialTab === 'twitter' && (
                        <div className="space-y-3">
                           <div className="flex items-center gap-2.5 text-xs text-zinc-400">
                              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white">
                                 𝕏
                              </div>
                              <div>
                                 <div className="font-bold text-white">
                                    {siteName || 'Klique'}
                                 </div>
                                 <div className="text-[11px] text-zinc-500">
                                    {twitterHandle} · 2m
                                 </div>
                              </div>
                           </div>

                           <div className="rounded-2xl border border-zinc-800 bg-black overflow-hidden shadow-xl max-w-lg">
                              <div className="w-full h-52 bg-zinc-900 relative overflow-hidden">
                                 {imageUrl ? (
                                    <img
                                       src={imageUrl}
                                       alt={title}
                                       className="w-full h-full object-cover"
                                    />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                       No Image Provided
                                    </div>
                                 )}
                              </div>
                              <div className="p-3.5 space-y-1">
                                 <div className="text-[11px] text-zinc-500 font-mono">
                                    {domain}
                                 </div>
                                 <div className="text-sm font-bold text-white line-clamp-1">
                                    {title}
                                 </div>
                                 <div className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                                    {description}
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* 2. LinkedIn Feed Share Card */}
                     {activeSocialTab === 'linkedin' && (
                        <div className="space-y-3">
                           <div className="flex items-center gap-2.5 text-xs text-zinc-400">
                              <div className="w-8 h-8 rounded-md bg-[#0077b5] flex items-center justify-center font-bold text-white">
                                 in
                              </div>
                              <div>
                                 <div className="font-bold text-white">
                                    {siteName}
                                 </div>
                                 <div className="text-[11px] text-zinc-500">
                                    Promoted / Shared Link
                                 </div>
                              </div>
                           </div>

                           <div className="rounded-xl border border-zinc-800 bg-[#1b1f24] overflow-hidden shadow-xl max-w-lg">
                              <div className="w-full h-52 bg-zinc-900 overflow-hidden">
                                 {imageUrl && (
                                    <img
                                       src={imageUrl}
                                       alt={title}
                                       className="w-full h-full object-cover"
                                    />
                                 )}
                              </div>
                              <div className="p-3.5 space-y-1">
                                 <div className="text-sm font-semibold text-white line-clamp-1">
                                    {title}
                                 </div>
                                 <div className="text-xs text-zinc-400 line-clamp-2">
                                    {description}
                                 </div>
                                 <div className="text-[11px] text-zinc-500 font-mono pt-1">
                                    {domain}
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* 3. Facebook Link Card */}
                     {activeSocialTab === 'facebook' && (
                        <div className="space-y-3">
                           <div className="rounded-xl border border-zinc-800 bg-[#242526] overflow-hidden shadow-xl max-w-lg">
                              <div className="w-full h-52 bg-zinc-900 overflow-hidden">
                                 {imageUrl && (
                                    <img
                                       src={imageUrl}
                                       alt={title}
                                       className="w-full h-full object-cover"
                                    />
                                 )}
                              </div>
                              <div className="p-3 bg-[#3a3b3c]/60 space-y-1">
                                 <div className="text-[10px] uppercase font-mono text-zinc-400">
                                    {domain}
                                 </div>
                                 <div className="text-sm font-bold text-white line-clamp-1">
                                    {title}
                                 </div>
                                 <div className="text-xs text-zinc-300 line-clamp-2">
                                    {description}
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* 4. Discord Rich Embed */}
                     {activeSocialTab === 'discord' && (
                        <div className="p-4 rounded-xl border border-zinc-800 bg-[#2b2d31] max-w-lg space-y-2">
                           <div className="flex items-center gap-2 text-xs font-semibold text-white">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              <span>Bot · Today at 4:20 PM</span>
                           </div>

                           <div className="border-l-4 border-[#5865f2] pl-3 py-1 space-y-1.5 bg-[#1e1f22] rounded-r-lg p-3">
                              <div className="text-[11px] text-zinc-400 font-medium">
                                 {siteName}
                              </div>
                              <a
                                 href={url}
                                 target="_blank"
                                 rel="noreferrer"
                                 className="text-sm font-bold text-[#00a8fc] hover:underline block line-clamp-1">
                                 {title}
                              </a>
                              <div className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                                 {description}
                              </div>
                              {imageUrl && (
                                 <div className="w-full h-44 rounded-lg overflow-hidden mt-2 bg-black/40">
                                    <img
                                       src={imageUrl}
                                       alt={title}
                                       className="w-full h-full object-cover"
                                    />
                                 </div>
                              )}
                           </div>
                        </div>
                     )}

                     {/* 5. Google Search Snippet */}
                     {activeSocialTab === 'google' && (
                        <div className="p-4 rounded-xl border border-zinc-800 bg-[#202124] max-w-lg space-y-1 font-sans">
                           <div className="flex items-center gap-2 text-xs text-zinc-400">
                              <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-[10px]">
                                 🌐
                              </div>
                              <span className="truncate">{url}</span>
                           </div>
                           <h3 className="text-base text-[#8ab4f8] hover:underline font-normal cursor-pointer line-clamp-1 pt-1">
                              {title}
                           </h3>
                           <p className="text-xs text-[#bdc1c6] line-clamp-2 leading-relaxed">
                              {description}
                           </p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </main>
      </div>
   );
}
