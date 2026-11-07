/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   Layers,
   RotateCw,
   ArrowLeft,
   ArrowRight,
   Shuffle,
   CheckCircle,
   Plus,
   Trash2,
   Download,
   Sparkles,
   ChevronRight,
   HelpCircle,
   BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';
import { InputControl } from '../../../components/ui/CustomControl';

const SAMPLE_DECKS = [
   {
      id: 'webdev',
      name: 'Web Dev & JavaScript',
      cards: [
         { q: 'What is the Virtual DOM in React?', a: 'An in-memory representation of real DOM elements synced with the real DOM via reconciliation.' },
         { q: 'What is a closure in JavaScript?', a: 'A function bundled together with references to its surrounding lexical state (lexical scope).' },
         { q: 'What does CSS box-sizing: border-box do?', a: 'Includes padding and border in the element\'s total specified width and height.' },
         { q: 'What is the purpose of HTTP status code 404?', a: 'Indicates the server cannot find the requested resource endpoint.' },
      ],
   },
   {
      id: 'datascience',
      name: 'Machine Learning Basics',
      cards: [
         { q: 'What is Overfitting?', a: 'When a model learns noise in training data too well, degrading performance on unseen test data.' },
         { q: 'What is Supervised Learning?', a: 'Training algorithms on labeled input-output pairs to predict outcomes for new inputs.' },
         { q: 'What is Gradient Descent?', a: 'An iterative optimization algorithm used to find the local minimum of a loss function.' },
      ],
   },
];

const FAQS = [
   {
      question: 'How do flashcards improve memory recall?',
      answer:
         'Flashcards employ active recall and spaced repetition, forcing cognitive retrieval rather than passive reading. This strengthens synaptic pathways and long-term retention.',
   },
   {
      question: 'Can I flip cards using keyboard shortcuts?',
      answer:
         'Yes! Click on the card or use Spacebar to flip between question and answer, and Left/Right arrows to navigate.',
   },
   {
      question: 'Are my decks saved privately on my computer?',
      answer:
         'Yes! All flashcard decks are stored 100% locally in your browser storage. You can also export decks to JSON or CSV anytime.',
   },
   {
      question: 'Can I import external flashcards?',
      answer:
         'You can add your own cards individually or choose from pre-loaded study decks across programming, science, and general knowledge.',
   },
];

export default function FlashcardGenerator() {
   const [cards, setCards] = useState(SAMPLE_DECKS[0].cards);
   const [currentIndex, setCurrentIndex] = useState(0);
   const [isFlipped, setIsFlipped] = useState(false);
   const [mastered, setMastered] = useState(new Set());

   // Form states
   const [newQuestion, setNewQuestion] = useState('');
   const [newAnswer, setNewAnswer] = useState('');
   const [toast, setToast] = useState({ visible: false, message: '' });

   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   const currentCard = cards[currentIndex] || { q: 'No cards', a: 'Add cards below' };

   const handleFlip = () => {
      setIsFlipped((prev) => !prev);
   };

   const handleNext = () => {
      setIsFlipped(false);
      setCurrentIndex((prev) => (prev + 1) % cards.length);
   };

   const handlePrev = () => {
      setIsFlipped(false);
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
   };

   const handleShuffle = () => {
      setIsFlipped(false);
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setCurrentIndex(0);
      showToast('Deck shuffled!');
   };

   const handleToggleMastered = () => {
      setMastered((prev) => {
         const next = new Set(prev);
         if (next.has(currentIndex)) {
            next.delete(currentIndex);
            showToast('Marked as review needed');
         } else {
            next.add(currentIndex);
            showToast('Marked card as mastered! 🎯');
         }
         return next;
      });
   };

   const handleAddCard = (e) => {
      e.preventDefault();
      if (!newQuestion.trim() || !newAnswer.trim()) {
         showToast('Please provide both question and answer.');
         return;
      }
      setCards((prev) => [...prev, { q: newQuestion.trim(), a: newAnswer.trim() }]);
      setNewQuestion('');
      setNewAnswer('');
      showToast('Added flashcard to deck!');
   };

   const handleDeleteCurrentCard = () => {
      if (cards.length <= 1) {
         showToast('Deck must have at least one card.');
         return;
      }
      setCards((prev) => prev.filter((_, i) => i !== currentIndex));
      setCurrentIndex(0);
      setIsFlipped(false);
      showToast('Card deleted.');
   };

   const handleLoadSampleDeck = (deck) => {
      setCards(deck.cards);
      setCurrentIndex(0);
      setIsFlipped(false);
      setMastered(new Set());
      showToast(`Loaded deck: ${deck.name}`);
   };

   const handleExportJSON = () => {
      const data = JSON.stringify(cards, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `klique-flashcards-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      trackToolDownload('flashcard-generator', { fileType: 'json' });
      showToast('Downloaded deck as JSON!');
   };

   const relatedTools = useMemo(() => getRelatedTools('flashcard-generator', 3), []);

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
            title="Interactive Flashcard Generator - Active Recall Study Cards | Klique"
            description="Create, practice, and master digital study flashcards with 3D flip animation, active recall testing, shuffle mode, and instant JSON export."
            keywords="flashcard generator, online flashcards study, active recall cards, digital flashcards free, create study deck, klique"
            canonicalUrl="https://klique.netlify.app/tools/flashcard-generator"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'Flashcard Generator',
               applicationCategory: 'EducationalApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Build customized active-recall study flashcard decks with flip animations and zero cloud accounts.',
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
               <Link to="/category" className="hover:text-zinc-200 transition-colors">Student & Education</Link>
               <span>/</span>
               <span className="text-[#daf4aa]">Flashcard Generator</span>
            </div>

            {/* Header */}
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-zinc-800/80 pb-6 sm:flex-row sm:items-center">
               <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#daf4aa]/30 bg-[#daf4aa]/10 text-[#daf4aa] text-xs font-medium tracking-wide mb-3">
                     <Layers size={13} className="text-[#daf4aa]" />
                     <span>STUDY & RECALL SUITE</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                     Flashcard <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#daf4aa] via-lime-300 to-emerald-400">Generator</span>
                  </h1>
                  <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                     Master concepts faster with interactive 3D flip study cards. Test active recall, shuffle decks, and track mastery.
                  </p>
               </div>
               <div className="flex items-center gap-2">
                  <button
                     onClick={handleExportJSON}
                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-xs font-medium text-zinc-200 transition-all cursor-pointer">
                     <Download size={13} />
                     <span>Export Deck</span>
                  </button>
               </div>
            </div>

            {/* Deck Presets Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
               <span className="text-xs text-zinc-500 font-medium">Decks:</span>
               {SAMPLE_DECKS.map((d) => (
                  <button
                     key={d.id}
                     onClick={() => handleLoadSampleDeck(d)}
                     className="px-3 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:border-[#daf4aa]/40 hover:text-[#daf4aa] text-xs text-zinc-300 transition-all cursor-pointer">
                     {d.name}
                  </button>
               ))}
            </div>

            {/* Main Interactive Flip Arena */}
            <div className="max-w-2xl mx-auto w-full space-y-6 mb-8">
               {/* 3D Flip Card Container */}
               <div
                  onClick={handleFlip}
                  className="relative h-64 sm:h-72 w-full cursor-pointer perspective-[1000px] select-none group">
                  <motion.div
                     animate={{ rotateY: isFlipped ? 180 : 0 }}
                     transition={{ duration: 0.5, ease: 'easeInOut' }}
                     className="w-full h-full relative [transform-style:preserve-3d]">
                     {/* FRONT (QUESTION) */}
                     <div className="absolute inset-0 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 p-8 flex flex-col justify-between backdrop-blur-xl shadow-2xl [backface-visibility:hidden]">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                           <span className="font-semibold uppercase tracking-wider text-[#daf4aa]">Question</span>
                           <span className="font-mono">Card {currentIndex + 1} of {cards.length}</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-center text-white leading-relaxed my-auto">
                           {currentCard.q}
                        </div>
                        <div className="text-center text-xs text-zinc-500 flex items-center justify-center gap-1.5">
                           <RotateCw size={12} className="text-[#daf4aa] group-hover:rotate-180 transition-transform" />
                           <span>Click or spacebar to reveal answer</span>
                        </div>
                     </div>

                     {/* BACK (ANSWER) */}
                     <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-[#daf4aa]/40 p-8 flex flex-col justify-between backdrop-blur-xl shadow-2xl [transform:rotateY(180deg)] [backface-visibility:hidden]">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                           <span className="font-semibold uppercase tracking-wider text-emerald-400">Answer</span>
                           <span className="font-mono">Card {currentIndex + 1} of {cards.length}</span>
                        </div>
                        <div className="text-lg sm:text-xl font-medium text-center text-zinc-100 leading-relaxed my-auto">
                           {currentCard.a}
                        </div>
                        <div className="text-center text-xs text-zinc-500 flex items-center justify-center gap-1.5">
                           <RotateCw size={12} className="text-emerald-400" />
                           <span>Click to flip back to question</span>
                        </div>
                     </div>
                  </motion.div>
               </div>

               {/* Navigation Controls */}
               <div className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl">
                  <div className="flex items-center gap-2">
                     <button
                        onClick={handlePrev}
                        className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer">
                        <ArrowLeft size={16} />
                     </button>
                     <button
                        onClick={handleNext}
                        className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer">
                        <ArrowRight size={16} />
                     </button>
                     <button
                        onClick={handleShuffle}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer">
                        <Shuffle size={13} />
                        <span>Shuffle</span>
                     </button>
                  </div>

                  <div className="flex items-center gap-2">
                     <button
                        onClick={handleToggleMastered}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                           mastered.has(currentIndex)
                              ? 'bg-[#daf4aa] text-zinc-950 font-bold shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                              : 'border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                        }`}>
                        <CheckCircle size={13} />
                        <span>{mastered.has(currentIndex) ? 'Mastered' : 'Mark Mastered'}</span>
                     </button>
                     <button
                        onClick={handleDeleteCurrentCard}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 text-zinc-400 transition-colors cursor-pointer">
                        <Trash2 size={15} />
                     </button>
                  </div>
               </div>
            </div>

            {/* Add Card & Export Deck */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-8">
               <form
                  onSubmit={handleAddCard}
                  className="md:col-span-8 p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                     <Plus size={15} className="text-[#daf4aa]" />
                     Add Custom Card to Deck
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     <InputControl
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Question prompt..."
                        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                     />
                     <InputControl
                        type="text"
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        placeholder="Answer / Solution..."
                        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                     />
                  </div>
                  <button
                     type="submit"
                     className="px-5 py-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] text-zinc-950 font-bold text-xs shadow-[0_0_15px_rgba(218,244,170,0.3)] transition-all cursor-pointer">
                     + Add Flashcard
                  </button>
               </form>

               <div className="md:col-span-4 p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl space-y-3">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                     <BookOpen size={15} className="text-[#daf4aa]" />
                     Deck Stats
                  </h3>
                  <div className="space-y-1 text-xs text-zinc-400">
                     <div className="flex justify-between">
                        <span>Total Cards:</span>
                        <span className="font-mono text-white font-bold">{cards.length}</span>
                     </div>
                     <div className="flex justify-between">
                        <span>Mastered:</span>
                        <span className="font-mono text-[#daf4aa] font-bold">{mastered.size}</span>
                     </div>
                  </div>
                  <button
                     onClick={handleExportJSON}
                     className="w-full py-2 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                     <Download size={13} />
                     <span>Export Deck (JSON)</span>
                  </button>
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

