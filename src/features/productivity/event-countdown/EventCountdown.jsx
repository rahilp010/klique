/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import {
   Calendar,
   Clock,
   Plus,
   Trash2,
   Share2,
   Download,
   Copy,
   Sparkles,
   ChevronDown,
   HelpCircle,
   PartyPopper,
   Tag,
   ArrowRight,
   CheckCircle2,
   ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import {
   calculateTimeRemaining,
   calculateEventProgress,
   generateICS,
} from '../../../lib/calculations/countdown';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link, useSearchParams } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*  PRESETS & SAMPLES                                                         */
/* -------------------------------------------------------------------------- */

const PRESET_EVENTS = [
   {
      id: 'new-year',
      title: 'New Year Countdown',
      targetDate: `${new Date().getFullYear() + 1}-01-01T00:00`,
      category: 'Celebration',
      color: '#daf4aa',
      notes: 'Ringing in the brand new year with resolutions and joy!',
   },
   {
      id: 'product-launch',
      title: 'Product Launch & Major Release',
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
         .toISOString()
         .slice(0, 16),
      category: 'Work',
      color: '#38bdf8',
      notes: 'Final QA, documentation checks, and social announcement rollout.',
   },
   {
      id: 'summer-break',
      title: 'Vacation & Summer Getaway',
      targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
         .toISOString()
         .slice(0, 16),
      category: 'Personal',
      color: '#f59e0b',
      notes: 'Flights booked, packing essentials ready for beach time.',
   },
];

const FAQS = [
   {
      question: 'How do shareable event countdown links work?',
      answer:
         'When you click "Share Link", the event details are encoded safely into the URL parameters. Anyone who opens the link will see your exact countdown in real-time without needing an account.',
   },
   {
      question: 'Can I export this countdown to my Google or Apple calendar?',
      answer:
         'Yes! Click the "Export .ICS" button to instantly download an RFC 5545 compliant calendar invite that adds the event and reminders straight to Google Calendar, Apple Calendar, or Microsoft Outlook.',
   },
   {
      question: 'Are my custom events stored securely?',
      answer:
         'All countdowns are stored locally in your browser’s localStorage. Your personal event dates and private notes are never sent to any external server.',
   },
   {
      question: 'What happens when a countdown reaches zero?',
      answer:
         'The countdown automatically transitions into a celebratory milestone card showing completion and elapsed time since the event occurred.',
   },
];

export default function EventCountdown() {
   const [searchParams, setSearchParams] = useSearchParams();

   // Form states
   const [title, setTitle] = useState('');
   const [targetDate, setTargetDate] = useState('');
   const [category, setCategory] = useState('Personal');
   const [notes, setNotes] = useState('');
   const [color, setColor] = useState('#daf4aa');

   // Saved events list
   const [events, setEvents] = useState(() => {
      const saved = localStorage.getItem('klique_countdown_events');
      if (saved) {
         try {
            return JSON.parse(saved);
         } catch {
            return PRESET_EVENTS;
         }
      }
      return PRESET_EVENTS;
   });

   // Active selected event
   const [selectedEventId, setSelectedEventId] = useState(
      events[0]?.id || 'new-year',
   );

   // Tick state to force re-render every second
   const [currentTime, setCurrentTime] = useState(Date.now());
   useEffect(() => {
      const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
      return () => clearInterval(timer);
   }, []);

   // Parse URL query params if shared
   useEffect(() => {
      const urlTitle = searchParams.get('title');
      const urlDate = searchParams.get('date');
      const urlCategory = searchParams.get('cat') || 'Shared Event';
      const urlColor = searchParams.get('color') || '#daf4aa';

      if (urlTitle && urlDate) {
         const sharedEvent = {
            id: `shared-${Date.now()}`,
            title: decodeURIComponent(urlTitle),
            targetDate: decodeURIComponent(urlDate),
            category: decodeURIComponent(urlCategory),
            color: decodeURIComponent(urlColor),
            startDate: new Date().toISOString(),
            notes: 'Opened via shared countdown link.',
         };

         setEvents((prev) => {
            const exists = prev.some(
               (e) =>
                  e.title === sharedEvent.title &&
                  e.targetDate === sharedEvent.targetDate,
            );
            if (!exists) {
               const updated = [sharedEvent, ...prev];
               localStorage.setItem(
                  'klique_countdown_events',
                  JSON.stringify(updated),
               );
               return updated;
            }
            return prev;
         });
         setSelectedEventId(sharedEvent.id);
      }
   }, [searchParams]);

   // Save events to local storage
   const persistEvents = (newEvents) => {
      setEvents(newEvents);
      localStorage.setItem(
         'klique_countdown_events',
         JSON.stringify(newEvents),
      );
   };

   // Active event lookup
   const activeEvent = useMemo(() => {
      return events.find((e) => e.id === selectedEventId) || events[0] || null;
   }, [events, selectedEventId]);

   // Remaining time calculation
   const timeRemaining = useMemo(() => {
      if (!activeEvent?.targetDate)
         return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false };
      return calculateTimeRemaining(activeEvent.targetDate, currentTime);
   }, [activeEvent, currentTime]);

   // Progress calculation
   const progress = useMemo(() => {
      if (!activeEvent) return 0;
      return calculateEventProgress(
         activeEvent.startDate ||
            new Date(Date.now() - 7 * 86400000).toISOString(),
         activeEvent.targetDate,
         currentTime,
      );
   }, [activeEvent, currentTime]);

   // Toast
   const [toast, setToast] = useState({ visible: false, message: '' });
   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   const [openFaq, setOpenFaq] = useState(null);

   // Add new event
   const handleCreateEvent = (e) => {
      e.preventDefault();
      if (!title.trim() || !targetDate) {
         showToast('Please enter both an event title and target date.');
         return;
      }

      const newEvent = {
         id: `event-${Date.now()}`,
         title: title.trim(),
         targetDate,
         startDate: new Date().toISOString(),
         category,
         color,
         notes: notes.trim(),
      };

      const updated = [newEvent, ...events];
      persistEvents(updated);
      setSelectedEventId(newEvent.id);

      // Reset form
      setTitle('');
      setTargetDate('');
      setNotes('');
      showToast('Event countdown created!');
   };

   // Delete event
   const handleDeleteEvent = (id, eventTitle) => {
      const updated = events.filter((e) => e.id !== id);
      persistEvents(updated);
      if (selectedEventId === id && updated.length > 0) {
         setSelectedEventId(updated[0].id);
      }
      showToast(`Removed "${eventTitle}".`);
   };

   // Share Link
   const handleShareLink = () => {
      if (!activeEvent) return;
      const url = new URL(window.location.origin + '/tools/event-countdown');
      url.searchParams.set('title', activeEvent.title);
      url.searchParams.set('date', activeEvent.targetDate);
      url.searchParams.set('cat', activeEvent.category || 'Event');
      url.searchParams.set('color', activeEvent.color || '#daf4aa');

      navigator.clipboard.writeText(url.toString());
      showToast('Shareable link copied to clipboard!');
   };

   // Export ICS
   const handleExportICS = () => {
      if (!activeEvent) return;
      const icsData = generateICS({
         title: activeEvent.title,
         description: activeEvent.notes,
         targetDate: activeEvent.targetDate,
      });

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${activeEvent.title.replace(/\s+/g, '-').toLowerCase()}-reminder.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Calendar .ICS file downloaded!');
   };

   const relatedTools = useMemo(
      () => getRelatedTools('event-countdown', 4),
      [],
   );

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
            title="Event Countdown Timer - Days, Hours, Minutes Tracker | Klique"
            description="Create live countdown timers for upcoming events, releases, holidays, and milestones. Share custom links and export to calendar."
            keywords="event countdown, date countdown, days until, countdown timer, shareable countdown, new year countdown, online countdown"
            canonicalUrl="https://klique.netlify.app/tools/event-countdown"
         />

         {/* Toast Notification */}
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

         {/* Header / Navbar */}
         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Title Section */}
            <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                     <Calendar size={14} className="text-[#daf4aa]" />
                     <span>Productivity & Time</span>
                     <span className="text-zinc-600">•</span>
                     <span className="text-[#daf4aa]">Shareable & Private</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                     Event <span className="text-[#daf4aa]">Countdown</span>
                  </h1>
                  <p className="text-zinc-400 text-sm max-w-xl">
                     Track important upcoming launches, exams, milestones, and
                     celebrations with live second-by-second countdowns and
                     calendar sync.
                  </p>
               </motion.div>

               {/* Action Buttons */}
               {activeEvent && (
                  <div className="flex items-center gap-3">
                     <button
                        onClick={handleShareLink}
                        className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition-all shadow-md backdrop-blur-md">
                        <Share2 size={15} className="text-[#daf4aa]" />
                        <span>Share Link</span>
                     </button>

                     <button
                        onClick={handleExportICS}
                        className="flex items-center gap-2 rounded-xl border border-[#daf4aa]/30 bg-[#daf4aa]/10 px-4 py-2.5 text-xs font-semibold text-[#daf4aa] hover:bg-[#daf4aa]/20 transition-all shadow-md backdrop-blur-md">
                        <Download size={15} />
                        <span>Export .ICS</span>
                     </button>
                  </div>
               )}
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
               <Link to="/" className="hover:text-zinc-200 transition-colors">
                  Home
               </Link>
               <span>/</span>
               <Link
                  to="/category"
                  className="hover:text-zinc-200 transition-colors">
                  Productivity
               </Link>
               <span>/</span>
               <span className="text-[#daf4aa]">Event Countdown</span>
            </div>

            {/* Main Stage Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
               {/* Center Showcase Card */}
               <div className="lg:col-span-8 flex flex-col gap-6">
                  {activeEvent ? (
                     <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                        {/* Event Category Tag */}
                        <div className="flex items-center justify-between mb-4">
                           <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-zinc-700 bg-zinc-950/60 text-zinc-300">
                              <Tag size={12} className="text-[#daf4aa]" />
                              <span>{activeEvent.category || 'Event'}</span>
                           </span>

                           <span className="text-xs text-zinc-500 font-mono">
                              {new Date(
                                 activeEvent.targetDate,
                              ).toLocaleDateString(undefined, {
                                 weekday: 'short',
                                 year: 'numeric',
                                 month: 'short',
                                 day: 'numeric',
                                 hour: '2-digit',
                                 minute: '2-digit',
                              })}
                           </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
                           {activeEvent.title}
                        </h2>

                        {activeEvent.notes && (
                           <p className="text-xs text-zinc-400 mb-6 leading-relaxed max-w-lg">
                              {activeEvent.notes}
                           </p>
                        )}

                        {/* Countdown Digits Matrix */}
                        {timeRemaining.isPast ? (
                           <div className="rounded-xl border border-[#daf4aa]/30 bg-[#daf4aa]/10 p-6 text-center my-6">
                              <PartyPopper
                                 size={32}
                                 className="text-[#daf4aa] mx-auto mb-2 animate-bounce"
                              />
                              <h3 className="text-lg font-bold text-white mb-1">
                                 Milestone Arrived!
                              </h3>
                              <p className="text-xs text-[#daf4aa]">
                                 This event date has passed. Elapsed time:{' '}
                                 {timeRemaining.days}d {timeRemaining.hours}h{' '}
                                 {timeRemaining.minutes}m{' '}
                                 {timeRemaining.seconds}s ago.
                              </p>
                           </div>
                        ) : (
                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
                              {/* Days */}
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-center shadow-inner">
                                 <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                                    {timeRemaining.days}
                                 </span>
                                 <span className="block text-xs uppercase font-bold text-zinc-400 mt-2 tracking-widest">
                                    Days
                                 </span>
                              </div>

                              {/* Hours */}
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-center shadow-inner">
                                 <span className="text-4xl sm:text-5xl font-black text-[#daf4aa] font-mono tracking-tight">
                                    {String(timeRemaining.hours).padStart(
                                       2,
                                       '0',
                                    )}
                                 </span>
                                 <span className="block text-xs uppercase font-bold text-zinc-400 mt-2 tracking-widest">
                                    Hours
                                 </span>
                              </div>

                              {/* Minutes */}
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-center shadow-inner">
                                 <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                                    {String(timeRemaining.minutes).padStart(
                                       2,
                                       '0',
                                    )}
                                 </span>
                                 <span className="block text-xs uppercase font-bold text-zinc-400 mt-2 tracking-widest">
                                    Minutes
                                 </span>
                              </div>

                              {/* Seconds */}
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-center shadow-inner">
                                 <span className="text-4xl sm:text-5xl font-black text-[#daf4aa] font-mono tracking-tight">
                                    {String(timeRemaining.seconds).padStart(
                                       2,
                                       '0',
                                    )}
                                 </span>
                                 <span className="block text-xs uppercase font-bold text-zinc-400 mt-2 tracking-widest">
                                    Seconds
                                 </span>
                              </div>
                           </div>
                        )}

                        {/* Progress Bar */}
                        <div className="mt-4">
                           <div className="flex justify-between text-xs text-zinc-400 mb-1.5 font-medium">
                              <span>Timeline Progress</span>
                              <span className="font-mono text-zinc-300">
                                 {progress}%
                              </span>
                           </div>
                           <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                              <div
                                 className="h-full bg-[#daf4aa] transition-all duration-500"
                                 style={{ width: `${progress}%` }}
                              />
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-12 text-center text-zinc-500">
                        <Clock
                           size={36}
                           className="mx-auto mb-3 text-zinc-600"
                        />
                        <p className="text-sm">
                           No countdown selected. Create one using the form on
                           the right.
                        </p>
                     </div>
                  )}

                  {/* Saved Events Gallery */}
                  <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
                     <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Clock size={16} className="text-[#daf4aa]" />
                        <span>Your Countdowns ({events.length})</span>
                     </h3>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {events.map((ev) => {
                           const isSelected = activeEvent?.id === ev.id;
                           const rem = calculateTimeRemaining(ev.targetDate);
                           return (
                              <div
                                 key={ev.id}
                                 onClick={() => setSelectedEventId(ev.id)}
                                 className={`cursor-pointer rounded-xl border p-4 transition-all flex items-center justify-between group ${
                                    isSelected
                                       ? 'border-[#daf4aa]/50 bg-[#daf4aa]/10 shadow-md'
                                       : 'border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/50'
                                 }`}>
                                 <div className="truncate mr-3">
                                    <div className="text-xs font-bold text-zinc-200 truncate group-hover:text-[#daf4aa] transition-colors">
                                       {ev.title}
                                    </div>
                                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                                       {rem.isPast ? (
                                          <span className="text-amber-400 font-semibold">
                                             Passed
                                          </span>
                                       ) : (
                                          <span>
                                             {rem.days}d {rem.hours}h{' '}
                                             {rem.minutes}m left
                                          </span>
                                       )}
                                    </div>
                                 </div>

                                 <button
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       handleDeleteEvent(ev.id, ev.title);
                                    }}
                                    className="p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-zinc-800/60 transition-all opacity-0 group-hover:opacity-100"
                                    title="Delete Countdown">
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>

               {/* Right Column: New Event Creator Form */}
               <div className="lg:col-span-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl">
                  <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                     <Plus size={16} className="text-[#daf4aa]" />
                     <span>Create Countdown</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
                     Add any event to start tracking days, minutes, and
                     shareable timers.
                  </p>

                  <form
                     onSubmit={handleCreateEvent}
                     className="space-y-4 text-xs">
                     <div>
                        <label className="block text-zinc-300 font-medium mb-1.5">
                           Event Name *
                        </label>
                        <input
                           type="text"
                           required
                           value={title}
                           onChange={(e) => setTitle(e.target.value)}
                           placeholder="e.g. Graduation Ceremony, App Launch"
                           className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-3.5 py-2.5 text-white placeholder-zinc-500 focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40 focus:outline-none transition-all"
                        />
                     </div>

                     <div>
                        <label className="block text-zinc-300 font-medium mb-1.5">
                           Target Date & Time *
                        </label>
                        <input
                           type="datetime-local"
                           required
                           value={targetDate}
                           onChange={(e) => setTargetDate(e.target.value)}
                           className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-3.5 py-2.5 text-white placeholder-zinc-500 focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40 focus:outline-none transition-all"
                        />
                     </div>

                     <div>
                        <label className="block text-zinc-300 font-medium mb-1.5">
                           Category
                        </label>
                        <select
                           value={category}
                           onChange={(e) => setCategory(e.target.value)}
                           className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-3.5 py-2.5 text-white focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40 focus:outline-none transition-all">
                           <option value="Personal">Personal & Life</option>
                           <option value="Work">Work & Business</option>
                           <option value="Celebration">
                              Celebration & Holiday
                           </option>
                           <option value="Academics">Exams & School</option>
                           <option value="Travel">Vacation & Travel</option>
                        </select>
                     </div>

                     <div>
                        <label className="block text-zinc-300 font-medium mb-1.5">
                           Private Notes (Optional)
                        </label>
                        <textarea
                           rows={2}
                           value={notes}
                           onChange={(e) => setNotes(e.target.value)}
                           placeholder="Checklist, reminders, ticket numbers..."
                           className="w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-3.5 py-2.5 text-white placeholder-zinc-500 focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40 focus:outline-none transition-all resize-none"
                        />
                     </div>

                     <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] py-3 text-xs font-bold text-zinc-950 transition-all shadow-[0_0_15px_rgba(218,244,170,0.3)] cursor-pointer">
                        <Plus size={15} />
                        <span>Save & Start Countdown</span>
                     </button>
                  </form>
               </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
                  <div className="w-10 h-10 rounded-xl bg-[#daf4aa]/10 border border-[#daf4aa]/20 flex items-center justify-center text-[#daf4aa] mb-3">
                     <Share2 size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                     Instant Shareable Links
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                     Send a custom countdown link to friends, team members, or
                     social media followers without any registration.
                  </p>
               </div>

               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
                     <Download size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                     1-Click Calendar Sync
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                     Download ready-to-import RFC 5545 .ICS files that
                     automatically schedule reminders on your devices.
                  </p>
               </div>

               <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
                     <Clock size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">
                     Elapsed Time History
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                     When milestones pass, the timer switches automatically into
                     an anniversary counter to track time elapsed.
                  </p>
               </div>
            </div>

            {/* FAQs Accordion */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl mb-12">
               <div className="flex items-center gap-2 mb-6">
                  <HelpCircle size={18} className="text-[#daf4aa]" />
                  <h2 className="text-lg font-bold text-white">
                     Frequently Asked Questions
                  </h2>
               </div>
               <div className="space-y-4">
                  {FAQS.map((faq, idx) => {
                     const isOpen = openFaq === idx;
                     return (
                        <div
                           key={idx}
                           className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 overflow-hidden transition-all">
                           <button
                              onClick={() => setOpenFaq(isOpen ? null : idx)}
                              className="w-full flex items-center justify-between p-4 text-left text-xs font-semibold text-zinc-200 hover:text-white transition-colors">
                              <span>{faq.question}</span>
                              <ChevronDown
                                 size={16}
                                 className={`transform transition-transform text-zinc-500 ${
                                    isOpen ? 'rotate-180 text-[#daf4aa]' : ''
                                 }`}
                              />
                           </button>
                           {isOpen && (
                              <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-3">
                                 {faq.answer}
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
               <div className="mt-8">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                     <Sparkles size={16} className="text-[#daf4aa]" />
                     <span>Related Productivity Tools</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     {relatedTools.map((tool) => (
                        <Link
                           key={tool.id}
                           to={tool.slug}
                           onMouseEnter={() => preloadRoute(tool.slug)}
                           className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-800/40 backdrop-blur-md">
                           <div className="text-xs font-bold text-zinc-200 group-hover:text-[#daf4aa] transition-colors">
                              {tool.name}
                           </div>
                           <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                              {tool.description}
                           </p>
                        </Link>
                     ))}
                  </div>
               </div>
            )}
         </main>
      </div>
   );
}
