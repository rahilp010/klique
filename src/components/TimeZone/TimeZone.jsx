import React, { useEffect, useMemo, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { FaStar } from 'react-icons/fa';
import { FiClock, FiGlobe, FiInfo } from 'react-icons/fi';
import Navbar from '../Navbar';
import SEO from '../SEO';
import { motion } from 'motion/react';
import { ColumnLines } from '@/components/ui/download-with-columnlines-utils/columnlines';
import { SelectPicker } from '@/components/ui/CustomControl';

const GMT_OFFSET_CACHE = new Map();

const getGMTOffset = (timeZone) => {
   if (!timeZone) return 'GMT +00:00';
   if (GMT_OFFSET_CACHE.has(timeZone)) {
      return GMT_OFFSET_CACHE.get(timeZone);
   }
   try {
      const now = new Date();
      const tzDate = new Date(now.toLocaleString('en-US', { timeZone }));
      const offsetMinutes = Math.round((tzDate - now) / 60000);

      const sign = offsetMinutes >= 0 ? '+' : '-';
      const abs = Math.abs(offsetMinutes);
      const hours = String(Math.floor(abs / 60)).padStart(2, '0');
      const minutes = String(abs % 60).padStart(2, '0');

      const res = `GMT ${sign}${hours}:${minutes}`;
      GMT_OFFSET_CACHE.set(timeZone, res);
      return res;
   } catch {
      return 'GMT +00:00';
   }
};

const isBusinessOpen = (timeZone) => {
   const hour = new Date(
      new Date().toLocaleString('en-US', { timeZone }),
   ).getHours();
   return hour >= 9 && hour <= 18;
};

const BASE_CITIES = [
   { city: 'New York', tz: 'America/New_York', country: 'US' },
   { city: 'Los Angeles', tz: 'America/Los_Angeles', country: 'US' },
   { city: 'Chicago', tz: 'America/Chicago', country: 'US' },
   { city: 'Denver', tz: 'America/Denver', country: 'US' },
   { city: 'Phoenix', tz: 'America/Phoenix', country: 'US' },
   { city: 'Anchorage', tz: 'America/Anchorage', country: 'US' },
   { city: 'Honolulu', tz: 'Pacific/Honolulu', country: 'US' },
   { city: 'Toronto', tz: 'America/Toronto', country: 'CA' },
   { city: 'Vancouver', tz: 'America/Vancouver', country: 'CA' },
   { city: 'Montreal', tz: 'America/Montreal', country: 'CA' },
   { city: 'Mexico City', tz: 'America/Mexico_City', country: 'MX' },
   { city: 'São Paulo', tz: 'America/Sao_Paulo', country: 'BR' },
   { city: 'Rio de Janeiro', tz: 'America/Sao_Paulo', country: 'BR' },
   {
      city: 'Buenos Aires',
      tz: 'America/Argentina/Buenos_Aires',
      country: 'AR',
   },
   { city: 'Santiago', tz: 'America/Santiago', country: 'CL' },
   { city: 'Lima', tz: 'America/Lima', country: 'PE' },
   { city: 'Bogotá', tz: 'America/Bogota', country: 'CO' },
   { city: 'Caracas', tz: 'America/Caracas', country: 'VE' },
   { city: 'London', tz: 'Europe/London', country: 'GB' },
   { city: 'Dublin', tz: 'Europe/Dublin', country: 'IE' },
   { city: 'Paris', tz: 'Europe/Paris', country: 'FR' },
   { city: 'Berlin', tz: 'Europe/Berlin', country: 'DE' },
   { city: 'Frankfurt', tz: 'Europe/Berlin', country: 'DE' },
   { city: 'Rome', tz: 'Europe/Rome', country: 'IT' },
   { city: 'Madrid', tz: 'Europe/Madrid', country: 'ES' },
   { city: 'Amsterdam', tz: 'Europe/Amsterdam', country: 'NL' },
   { city: 'Brussels', tz: 'Europe/Brussels', country: 'BE' },
   { city: 'Vienna', tz: 'Europe/Vienna', country: 'AT' },
   { city: 'Zurich', tz: 'Europe/Zurich', country: 'CH' },
   { city: 'Stockholm', tz: 'Europe/Stockholm', country: 'SE' },
   { city: 'Oslo', tz: 'Europe/Oslo', country: 'NO' },
   { city: 'Copenhagen', tz: 'Europe/Copenhagen', country: 'DK' },
   { city: 'Helsinki', tz: 'Europe/Helsinki', country: 'FI' },
   { city: 'Warsaw', tz: 'Europe/Warsaw', country: 'PL' },
   { city: 'Prague', tz: 'Europe/Prague', country: 'CZ' },
   { city: 'Budapest', tz: 'Europe/Budapest', country: 'HU' },
   { city: 'Athens', tz: 'Europe/Athens', country: 'GR' },
   { city: 'Istanbul', tz: 'Europe/Istanbul', country: 'TR' },
   { city: 'Moscow', tz: 'Europe/Moscow', country: 'RU' },
   { city: 'Kyiv', tz: 'Europe/Kyiv', country: 'UA' },
   { city: 'Cairo', tz: 'Africa/Cairo', country: 'EG' },
   { city: 'Johannesburg', tz: 'Africa/Johannesburg', country: 'ZA' },
   { city: 'Cape Town', tz: 'Africa/Johannesburg', country: 'ZA' },
   { city: 'Lagos', tz: 'Africa/Lagos', country: 'NG' },
   { city: 'Nairobi', tz: 'Africa/Nairobi', country: 'KE' },
   { city: 'Casablanca', tz: 'Africa/Casablanca', country: 'MA' },
   { city: 'Accra', tz: 'Africa/Accra', country: 'GH' },
   { city: 'Dubai', tz: 'Asia/Dubai', country: 'AE' },
   { city: 'Abu Dhabi', tz: 'Asia/Dubai', country: 'AE' },
   { city: 'Riyadh', tz: 'Asia/Riyadh', country: 'SA' },
   { city: 'Doha', tz: 'Asia/Qatar', country: 'QA' },
   { city: 'Tel Aviv', tz: 'Asia/Jerusalem', country: 'IL' },
   { city: 'Tehran', tz: 'Asia/Tehran', country: 'IR' },
   { city: 'Baghdad', tz: 'Asia/Baghdad', country: 'IQ' },
   { city: 'Mumbai', tz: 'Asia/Kolkata', country: 'IN' },
   { city: 'Delhi', tz: 'Asia/Kolkata', country: 'IN' },
   { city: 'Bangalore', tz: 'Asia/Kolkata', country: 'IN' },
   { city: 'Kolkata', tz: 'Asia/Kolkata', country: 'IN' },
   { city: 'Karachi', tz: 'Asia/Karachi', country: 'PK' },
   { city: 'Dhaka', tz: 'Asia/Dhaka', country: 'BD' },
   { city: 'Bangkok', tz: 'Asia/Bangkok', country: 'TH' },
   { city: 'Jakarta', tz: 'Asia/Jakarta', country: 'ID' },
   { city: 'Ho Chi Minh City', tz: 'Asia/Ho_Chi_Minh', country: 'VN' },
   { city: 'Kuala Lumpur', tz: 'Asia/Kuala_Lumpur', country: 'MY' },
   { city: 'Singapore', tz: 'Asia/Singapore', country: 'SG' },
   { city: 'Manila', tz: 'Asia/Manila', country: 'PH' },
   { city: 'Hong Kong', tz: 'Asia/Hong_Kong', country: 'HK' },
   { city: 'Beijing', tz: 'Asia/Shanghai', country: 'CN' },
   { city: 'Shanghai', tz: 'Asia/Shanghai', country: 'CN' },
   { city: 'Taipei', tz: 'Asia/Taipei', country: 'TW' },
   { city: 'Seoul', tz: 'Asia/Seoul', country: 'KR' },
   { city: 'Tokyo', tz: 'Asia/Tokyo', country: 'JP' },
   { city: 'Osaka', tz: 'Asia/Tokyo', country: 'JP' },
   { city: 'Sydney', tz: 'Australia/Sydney', country: 'AU' },
   { city: 'Melbourne', tz: 'Australia/Melbourne', country: 'AU' },
   { city: 'Brisbane', tz: 'Australia/Brisbane', country: 'AU' },
   { city: 'Perth', tz: 'Australia/Perth', country: 'AU' },
   { city: 'Adelaide', tz: 'Australia/Adelaide', country: 'AU' },
   { city: 'Auckland', tz: 'Pacific/Auckland', country: 'NZ' },
   { city: 'Wellington', tz: 'Pacific/Auckland', country: 'NZ' },
   { city: 'Fiji', tz: 'Pacific/Fiji', country: 'FJ' },
];

const ALL_TIMEZONES = Intl.supportedValuesOf('timeZone');

const CITY_OPTIONS = BASE_CITIES.map((c) => {
   const offset = getGMTOffset(c.tz);
   return {
      value: `${c.city} (${c.tz})`,
      tz: c.tz,
      city: c.city,
      country: c.country,
      offset,
      label: `${c.city} (${c.tz}) ${offset}`,
   };
});

const GLOBAL_OPTIONS = ALL_TIMEZONES.map((tz) => {
   const offset = getGMTOffset(tz);
   return {
      value: tz,
      tz,
      city: null,
      country: null,
      offset,
      label: `${tz.replace(/_/g, ' ')} (${offset})`,
   };
});

const OPTIONS = [...CITY_OPTIONS, ...GLOBAL_OPTIONS].filter(
   (v, i, a) => a.findIndex((t) => t.value === v.value) === i,
);

const renderTZItem = (label, item) => (
   <div className="flex items-center justify-between w-full gap-3 py-1">
      <div className="flex items-center gap-2.5 min-w-0">
         {item?.country ? (
            <ReactCountryFlag
               svg
               countryCode={item.country}
               title={item.city || label}
               style={{ borderRadius: '2px', width: '1.2em', height: '1.2em' }}
               className="shrink-0"
            />
         ) : (
            <FiGlobe className="text-zinc-400 shrink-0" size={16} />
         )}
         <span className="font-medium truncate text-zinc-100">
            {item?.city ? item.city : item?.tz?.replace(/_/g, ' ')}
         </span>
         {item?.city && (
            <span className="text-xs text-zinc-400 truncate hidden sm:inline">
               ({item.tz})
            </span>
         )}
      </div>
      <span className="text-xs font-mono text-[#daf4aa] bg-[#daf4aa]/10 px-2 py-0.5 rounded shrink-0">
         {item?.offset || getGMTOffset(item?.tz || 'UTC')}
      </span>
   </div>
);

const TimeZone = () => {
   const [fromZone, setFromZone] = useState(
      () => OPTIONS.find((o) => o.tz === 'Asia/Kolkata') || OPTIONS[0],
   );
   const [toZone, setToZone] = useState(
      () => OPTIONS.find((o) => o.tz === 'America/New_York') || OPTIONS[1],
   );
   const [date, setDate] = useState(new Date());
   const [is24h, setIs24h] = useState(true);
   const [favorites, setFavorites] = useState([]);

   useEffect(() => {
      const timer = setInterval(() => setDate(new Date()), 1000);
      return () => clearInterval(timer);
   }, []);

   const formatTime = (tz) => {
      try {
         return new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: !is24h,
         }).format(date);
      } catch {
         return '--';
      }
   };

   const diffHours = useMemo(() => {
      if (!fromZone?.tz || !toZone?.tz) return 0;
      const from = new Date(
         date.toLocaleString('en-US', { timeZone: fromZone.tz }),
      );
      const to = new Date(
         date.toLocaleString('en-US', { timeZone: toZone.tz }),
      );
      return Math.round((to - from) / 36e5);
   }, [fromZone, toZone, date]);

   const toggleFav = (tz) => {
      setFavorites((p) =>
         p.includes(tz) ? p.filter((f) => f !== tz) : [...p, tz],
      );
   };

   return (
      <ColumnLines
         columnWidth={80}
         columnCount={14}
         radialFadeStart={15}
         radialFadeEnd={90}
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-auto px-4 py-20 md:px-10">
         <SEO
            title="Time Zone Converter & Meeting Planner | Klique"
            description="Convert times between global time zones seamlessly. Plan meetings, compare time differences, and keep track of your favorite cities worldwide."
            keywords="time zone converter, world clock, meeting planner, convert time zones, timezone calculator, klique timezone, check local time"
            canonicalUrl="https://klique.netlify.app/timezone"
         />

         <div className="w-full sticky top-0 z-30 bg-[#16161b] transition-all duration-300">
            <Navbar />
         </div>

         <div className="max-w-6xl mx-auto relative z-20 ml-12">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center mb-10">
               <h1 className="text-3xl sm:text-4xl font-medium text-zinc-100 tracking-tight mb-3">
                  Time Zone Converter
               </h1>
               <p className="text-zinc-500 text-sm sm:text-base font-medium">
                  Convert time between any country, city, or GMT offset
               </p>
            </motion.div>

            {/* Converter */}
            <div className="grid lg:grid-cols-3 gap-6 mb-10">
               {/* FROM */}
               <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 shadow-xl">
                  <h3 className="mb-4 text-sm font-medium text-zinc-400 uppercase tracking-wider">
                     From
                  </h3>
                  <SelectPicker
                     data={OPTIONS}
                     value={fromZone?.value}
                     onChange={(val, item) => item && setFromZone(item)}
                     cleanable={false}
                     searchable={true}
                     placeholder="Search time zone..."
                     renderMenuItem={renderTZItem}
                     menuMaxHeight={300}
                     className="w-full"
                  />
                  <div className="mt-6 flex flex-col gap-2">
                     <p className="text-2xl font-bold text-zinc-100">
                        {formatTime(fromZone?.tz)}
                     </p>
                     <div className="flex items-center gap-3 text-sm font-medium">
                        <span className="text-zinc-500">
                           {getGMTOffset(fromZone?.tz)}
                        </span>
                        <span className="text-zinc-700">•</span>
                        <span
                           className={
                              isBusinessOpen(fromZone?.tz)
                                 ? 'text-green-500'
                                 : 'text-red-400'
                           }>
                           {isBusinessOpen(fromZone?.tz)
                              ? 'Working Hours'
                              : 'Outside Hours'}
                        </span>
                     </div>
                  </div>
               </div>

               {/* TO */}
               <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative">
                  <h3 className="mb-4 text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                     <span>To</span>
                     <button
                        onClick={() => toggleFav(toZone?.tz)}
                        className="p-1.5 rounded-md hover:bg-zinc-800 transition-colors tooltip-trigger"
                        title={
                           favorites.includes(toZone?.tz)
                              ? 'Remove from Favorites'
                              : 'Add to Favorites'
                        }>
                        <FaStar
                           className={
                              favorites.includes(toZone?.tz)
                                 ? 'text-yellow-400'
                                 : 'text-zinc-600'
                           }
                           size={16}
                        />
                     </button>
                  </h3>
                  <SelectPicker
                     data={OPTIONS}
                     value={toZone?.value}
                     onChange={(val, item) => item && setToZone(item)}
                     cleanable={false}
                     searchable={true}
                     placeholder="Search time zone..."
                     renderMenuItem={renderTZItem}
                     menuMaxHeight={300}
                     className="w-full"
                  />

                  <div className="mt-6 flex flex-col gap-2">
                     <p className="text-2xl font-bold text-zinc-100">
                        {formatTime(toZone?.tz)}
                     </p>
                     <div className="flex items-center gap-3 text-sm font-medium">
                        <span className="text-zinc-500">
                           {getGMTOffset(toZone?.tz)}
                        </span>
                        <span className="text-zinc-700">•</span>
                        <span
                           className={
                              isBusinessOpen(toZone?.tz)
                                 ? 'text-green-500'
                                 : 'text-red-400'
                           }>
                           {isBusinessOpen(toZone?.tz)
                              ? 'Working Hours'
                              : 'Outside Hours'}
                        </span>
                     </div>
                  </div>
               </div>

               {/* INFO */}
               <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-400 uppercase tracking-wider mb-6">
                     <FiInfo size={16} /> Details
                  </h3>

                  <div className="flex-1 flex flex-col justify-center">
                     <p className="text-zinc-500 text-sm font-medium mb-1">
                        Time Difference
                     </p>
                     <p className="text-4xl font-semibold text-zinc-100">
                        {diffHours >= 0 ? '+' : ''}
                        {diffHours}{' '}
                        <span className="text-2xl text-zinc-500 font-medium">
                           hrs
                        </span>
                     </p>
                  </div>

                  <button
                     onClick={() => setIs24h((p) => !p)}
                     className="mt-6 w-full py-2.5 rounded-xl bg-[#18181b] border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200 text-zinc-400 text-sm font-medium transition-all flex items-center justify-center gap-2">
                     <FiClock size={16} />
                     Switch to {is24h ? '12-hour' : '24-hour'} format
                  </button>
               </div>
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 mb-10 shadow-xl">
                  <h3 className="mb-6 text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                     <FaStar className="text-yellow-400" /> Saved Time Zones
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     {favorites.map((tz) => (
                        <div
                           key={tz}
                           className="bg-[#0f0f11] border border-zinc-800/60 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                           <p className="text-sm font-medium text-zinc-300 mb-2 truncate">
                              {tz}
                           </p>
                           <p className="text-xl font-bold text-zinc-100 mb-1">
                              {formatTime(tz)}
                           </p>
                           <p className="text-xs font-medium text-zinc-500">
                              {getGMTOffset(tz)}
                           </p>
                        </div>
                     ))}
                  </div>
               </motion.div>
            )}
         </div>
      </ColumnLines>
   );
};

export default TimeZone;
