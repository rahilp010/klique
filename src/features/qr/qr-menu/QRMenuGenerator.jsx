/* eslint-disable no-unused-vars */
import React, { useState, useRef, useMemo } from 'react';
import {
   UtensilsCrossed,
   QrCode,
   Download,
   Plus,
   Trash2,
   Sparkles,
   ChevronRight,
   HelpCircle,
   Smartphone,
   Share2,
   Copy,
   Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

const DEFAULT_ITEMS = [
   { id: 'm1', name: 'Artisan Woodfired Margherita', category: 'Mains', price: 420, isVeg: true, desc: 'San Marzano tomatoes, fresh buffalo mozzarella, fresh basil, extra virgin olive oil.' },
   { id: 'm2', name: 'Truffle & Parmesan Fries', category: 'Starters', price: 280, isVeg: true, desc: 'Crispy hand-cut russet potatoes tossed with black truffle oil and 24-month aged parmesan.' },
   { id: 'm3', name: 'Cold Brew Vanilla Cloud', category: 'Beverages', price: 210, isVeg: true, desc: '18-hour single origin cold brew topped with silky Madagascar vanilla sweet cream.' },
   { id: 'm4', name: 'Classic Tiramisu', category: 'Desserts', price: 340, isVeg: true, desc: 'Espresso-soaked savoiardi biscuits layered with mascarpone cream and Belgian cocoa.' },
];

const FAQS = [
   {
      question: 'How do customers view the digital menu via QR code?',
      answer:
         'Customers scan the printed QR code on their table using their phone camera, immediately opening your contactless digital menu without downloading any mobile app.',
   },
   {
      question: 'Can I download the QR code for table stand printing?',
      answer:
         'Yes! Click "Download QR Code" to get a crisp, high-resolution PNG image ready for acrylic table tents, posters, or stickers.',
   },
   {
      question: 'Are there any monthly subscription costs?',
      answer:
         'No! Unlike traditional QR menu SaaS platforms that charge $30/month, Klique QR Menu Generator is 100% free and runs in your browser.',
   },
   {
      question: 'Can I mark vegetarian, vegan, or spicy dishes?',
      answer:
         'Yes! You can toggle vegetarian badges for dietary transparency and sort items cleanly into Starters, Mains, Drinks, and Desserts.',
   },
];

export default function QRMenuGenerator() {
   const [restaurantName, setRestaurantName] = useState('Cafe Bella');
   const [tagline, setTagline] = useState('Artisan Coffee & Woodfired Kitchen');
   const [currency, setCurrency] = useState('₹');
   const [menuItems, setMenuItems] = useState(DEFAULT_ITEMS);

   // New item state
   const [itemName, setItemName] = useState('');
   const [itemCat, setItemCat] = useState('Mains');
   const [itemPrice, setItemPrice] = useState('');
   const [itemDesc, setItemDesc] = useState('');
   const [itemVeg, setItemVeg] = useState(true);

   const [qrDataUrl, setQrDataUrl] = useState('');
   const [toast, setToast] = useState({ visible: false, message: '' });

   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   // Generate QR Code encoding restaurant details
   useEffect(() => {
      const payload = `🍽️ ${restaurantName}\n${tagline}\n\n` +
         menuItems.map((item) => `• ${item.name} (${currency}${item.price}): ${item.desc}`).join('\n');

      QRCode.toDataURL(payload, {
         width: 400,
         margin: 2,
         color: {
            dark: '#09090b',
            light: '#ffffff',
         },
      })
         .then((url) => setQrDataUrl(url))
         .catch((err) => console.error('QR generation error:', err));
   }, [restaurantName, tagline, currency, menuItems]);

   const handleAddItem = (e) => {
      e.preventDefault();
      const p = parseFloat(itemPrice);
      if (!itemName.trim() || isNaN(p) || p <= 0) {
         showToast('Please provide a valid dish name and price.');
         return;
      }

      const newItem = {
         id: `m_${Date.now()}`,
         name: itemName.trim(),
         category: itemCat,
         price: p,
         isVeg: itemVeg,
         desc: itemDesc.trim(),
      };

      setMenuItems((prev) => [...prev, newItem]);
      setItemName('');
      setItemPrice('');
      setItemDesc('');
      showToast(`Added ${newItem.name} to menu!`);
   };

   const handleDeleteItem = (id) => {
      setMenuItems((prev) => prev.filter((i) => i.id !== id));
      showToast('Removed dish from menu.');
   };

   const handleDownloadQR = () => {
      if (!qrDataUrl) return;
      const a = document.createElement('a');
      a.href = qrDataUrl;
      a.download = `${restaurantName.toLowerCase().replace(/\s+/g, '-')}-qr-menu.png`;
      a.click();

      trackToolDownload('qr-menu-generator', { fileType: 'png' });
      showToast('Downloaded Table Stand QR Code PNG!');
   };

   const handleReset = () => {
      setRestaurantName('Cafe Bella');
      setTagline('Artisan Coffee & Woodfired Kitchen');
      setCurrency('₹');
      setMenuItems(DEFAULT_ITEMS);
      trackToolReset('qr-menu-generator');
      showToast('Reset to default cafe menu.');
   };

   const relatedTools = useMemo(() => getRelatedTools('qr-menu-generator', 3), []);

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
            title="QR Menu Generator - Contactless Digital Restaurant Menu Maker | Klique"
            description="Create an aesthetic, contactless digital restaurant or cafe menu and generate high-resolution QR codes for table stands and flyers 100% free."
            keywords="qr menu generator, restaurant qr menu maker, contactless digital menu, cafe qr code creator, free digital menu, klique"
            canonicalUrl="https://klique.netlify.app/tools/qr-menu-generator"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'QR Menu Generator',
               applicationCategory: 'BusinessApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Free contactless restaurant and cafe digital menu builder with table stand QR code generation.',
            }}
         />

         <AnimatePresence>
            {toast.visible && (
               <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-2 rounded-full border border-[#daf4aa]/30 bg-zinc-900/90 px-4 py-2 text-xs font-semibold text-[#daf4aa] shadow-2xl backdrop-blur-md">
                  <Sparkles size={14} className="animate-spin text-[#daf4aa]" />
                  <span>{toast.message}</span>
               </motion.div>
            )}
         </AnimatePresence>

         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-xs text-zinc-400">
               <Link to="/" className="hover:text-zinc-200 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category" className="hover:text-zinc-200 transition-colors">QR & Barcodes</Link>
               <span>/</span>
               <span className="text-[#daf4aa]">QR Menu Generator</span>
            </div>

            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:items-center">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#daf4aa]/30 bg-[#daf4aa]/10 text-[#daf4aa] text-xs font-medium tracking-wide mb-3">
                     <UtensilsCrossed size={13} className="text-[#daf4aa]" />
                     <span>HOSPITALITY & QR SUITE</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                     QR Menu <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#daf4aa] via-lime-300 to-emerald-400">Generator</span>
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                     Build contactless mobile menus for your restaurant or cafe and download print-ready QR codes for table stands without monthly subscriptions.
                  </p>
               </div>
               <div className="flex items-center gap-2">
                  <button
                     onClick={handleReset}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 text-xs text-zinc-400 hover:text-zinc-200 transition-all">
                     <RotateCcw size={13} />
                     <span>Reset</span>
                  </button>
               </div>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
               {/* Left Column: Menu Builder Form & Dish List */}
               <div className="lg:col-span-7 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl space-y-5">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                     <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <UtensilsCrossed size={16} className="text-[#daf4aa]" />
                        Restaurant Profile & Menu Items
                     </h2>
                  </div>

                  {/* Brand Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                     <div className="space-y-1 sm:col-span-2">
                        <label className="text-xs font-medium text-zinc-300">Restaurant / Cafe Name</label>
                        <input
                           type="text"
                           value={restaurantName}
                           onChange={(e) => setRestaurantName(e.target.value)}
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-300">Currency Symbol</label>
                        <input
                           type="text"
                           value={currency}
                           onChange={(e) => setCurrency(e.target.value)}
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 text-center font-mono focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                        />
                     </div>
                  </div>

                  <div className="space-y-1">
                     <label className="text-xs font-medium text-zinc-300">Tagline / Subtitle</label>
                     <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                     />
                  </div>

                  {/* Add Dish Form */}
                  <form onSubmit={handleAddItem} className="space-y-3 pt-3 border-t border-zinc-800/80">
                     <span className="text-xs font-semibold text-zinc-300">Add New Dish</span>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                           type="text"
                           value={itemName}
                           onChange={(e) => setItemName(e.target.value)}
                           placeholder="Dish name..."
                           className="sm:col-span-2 bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                        />
                        <input
                           type="number"
                           min="1"
                           value={itemPrice}
                           onChange={(e) => setItemPrice(e.target.value)}
                           placeholder="Price"
                           className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                        <select
                           value={itemCat}
                           onChange={(e) => setItemCat(e.target.value)}
                           className="bg-zinc-950/80 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60 cursor-pointer">
                           <option value="Starters">Starters / Appetizers</option>
                           <option value="Mains">Mains / Entrees</option>
                           <option value="Beverages">Beverages / Drinks</option>
                           <option value="Desserts">Desserts</option>
                        </select>
                        <label className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-1.5 cursor-pointer">
                           <input
                              type="checkbox"
                              checked={itemVeg}
                              onChange={(e) => setItemVeg(e.target.checked)}
                              className="accent-emerald-500 rounded"
                           />
                           Vegetarian (Veg)
                        </label>
                     </div>
                     <input
                        type="text"
                        value={itemDesc}
                        onChange={(e) => setItemDesc(e.target.value)}
                        placeholder="Description (e.g. ingredients, allergens)..."
                        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                     />
                     <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] text-zinc-950 font-bold text-xs shadow-[0_0_15px_rgba(218,244,170,0.3)] transition-all cursor-pointer">
                        + Add Dish to Menu
                     </button>
                  </form>

                  {/* Current Items List */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                     <span className="text-xs font-semibold text-zinc-400">Current Items ({menuItems.length})</span>
                     <div className="max-h-[220px] overflow-y-auto customScrollbar divide-y divide-zinc-800/40 border border-zinc-800/60 rounded-xl bg-zinc-950/50">
                        {menuItems.map((item) => (
                           <div key={item.id} className="p-2.5 text-xs flex items-center justify-between">
                              <div className="min-w-0 pr-2">
                                 <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-zinc-100 truncate">{item.name}</span>
                                    {item.isVeg && (
                                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                                    )}
                                 </div>
                                 <div className="text-[11px] text-zinc-500 truncate">{item.category} • {item.desc}</div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                 <span className="font-mono font-bold text-[#daf4aa]">{currency}{item.price}</span>
                                 <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer">
                                    <Trash2 size={13} />
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Right Column: Live Mobile Preview & QR Code Stand */}
               <div className="lg:col-span-5 space-y-6">
                  {/* QR Code Table Stand Card */}
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl text-center space-y-4">
                     <h3 className="text-sm font-semibold text-white flex items-center justify-center gap-2">
                        <QrCode size={16} className="text-[#daf4aa]" />
                        Table Stand QR Code
                     </h3>

                     {qrDataUrl && (
                        <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl mx-auto">
                           <img
                              src={qrDataUrl}
                              alt="Table Stand QR Code"
                              className="w-44 h-44 object-contain rounded-lg"
                           />
                        </div>
                     )}

                     <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                        Scan with any smartphone camera to open the instant digital menu.
                     </p>

                     <button
                        onClick={handleDownloadQR}
                        className="w-full py-2.5 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] text-zinc-950 font-bold text-xs shadow-[0_0_15px_rgba(218,244,170,0.3)] flex items-center justify-center gap-2 transition-all cursor-pointer">
                        <Download size={14} />
                        <span>Download QR Code (PNG)</span>
                     </button>
                  </div>

                  {/* Smartphone Live Preview */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4 max-w-sm mx-auto">
                     <div className="flex items-center justify-between text-[11px] text-zinc-500 border-b border-zinc-800 pb-2">
                        <span className="flex items-center gap-1">
                           <Smartphone size={12} className="text-[#daf4aa]" />
                           Mobile View
                        </span>
                        <span>klique.menu</span>
                     </div>

                     <div className="text-center space-y-1">
                        <h4 className="text-base font-black text-white">{restaurantName}</h4>
                        <p className="text-[11px] text-zinc-400">{tagline}</p>
                     </div>

                     {/* Menu Items List inside Phone */}
                     <div className="max-h-[220px] overflow-y-auto customScrollbar space-y-2 pt-1">
                        {menuItems.map((item) => (
                           <div key={item.id} className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80 text-xs space-y-1">
                              <div className="flex justify-between items-center">
                                 <span className="font-semibold text-zinc-100 flex items-center gap-1.5">
                                    <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-400' : 'bg-red-400'}`} />
                                    {item.name}
                                 </span>
                                 <span className="font-mono font-bold text-[#daf4aa]">{currency}{item.price}</span>
                              </div>
                              <p className="text-[10px] text-zinc-400 leading-tight">{item.desc}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* FAQs Accordion */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md shadow-xl space-y-4 mb-8">
               <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <HelpCircle size={18} className="text-[#daf4aa]" />
                  Frequently Asked Questions
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FAQS.map((faq, i) => (
                     <div key={i} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50 space-y-1.5">
                        <h4 className="text-sm font-semibold text-zinc-200">{faq.question}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">{faq.answer}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
               <div className="border-t border-zinc-800/80 pt-8 space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-base font-semibold text-white">Related Tools</h3>
                     <Link
                        to="/category"
                        className="text-xs text-[#daf4aa] hover:underline flex items-center gap-1 transition-colors">
                        Browse all tools <ChevronRight size={13} />
                     </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     {relatedTools.map((tool) => (
                        <Link
                           key={tool.id}
                           to={tool.slug}
                           onMouseEnter={() => preloadRoute(tool.slug)}
                           className="group p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all">
                           <div className="text-xs font-semibold text-zinc-200 group-hover:text-[#daf4aa] transition-colors">
                              {tool.name}
                           </div>
                           <div className="text-[11px] text-zinc-500 line-clamp-2 mt-1">
                              {tool.description}
                           </div>
                        </Link>
                     ))}
                  </div>
               </div>
            )}
         </main>
      </div>
   );
}

