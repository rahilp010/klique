import React, { useEffect, useMemo, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { FaStar } from 'react-icons/fa';
import { FiGlobe } from 'react-icons/fi';
import { Calendar, MapPin, Globe } from 'lucide-react';
import Navbar from '../Navbar';
import SEO from '../SEO';
import { motion, AnimatePresence } from 'motion/react';
import { ColumnLines } from '@/components/ui/download-with-columnlines-utils/columnlines';
import { SelectPicker } from '@/components/ui/CustomControl';
import cityTimezones from 'city-timezones';
import * as countryTimezonesModule from 'countries-and-timezones';

// Time Zone Offset Calculation Utilities
const getOffsetMinutes = (timeZone, date = new Date()) => {
   if (!timeZone) return 0;
   try {
      const parts = new Intl.DateTimeFormat('en-US', {
         timeZone,
         timeZoneName: 'longOffset',
         year: 'numeric',
         month: '2-digit',
         day: '2-digit',
         hour: '2-digit',
         minute: '2-digit',
         second: '2-digit',
         hourCycle: 'h23',
      }).formatToParts(date);

      const offsetPart = parts.find(
         (part) => part.type === 'timeZoneName',
      )?.value;
      if (!offsetPart || offsetPart === 'GMT' || offsetPart === 'UTC') return 0;

      const match = offsetPart.match(/(?:GMT|UTC)([+-])(\d{2}):?(\d{2})?/);
      if (!match) return 0;

      const hours = Number(match[2]);
      const minutes = Number(match[3] || 0);
      const total = hours * 60 + minutes;

      return match[1] === '-' ? -total : total;
   } catch {
      return 0;
   }
};

const getGMTOffset = (timeZone, date = new Date()) => {
   const offsetMinutes = getOffsetMinutes(timeZone, date);
   if (offsetMinutes === 0) return 'UTC +00:00';

   const sign = offsetMinutes >= 0 ? '+' : '-';
   const abs = Math.abs(offsetMinutes);
   const hours = String(Math.floor(abs / 60)).padStart(2, '0');
   const minutes = String(abs % 60).padStart(2, '0');

   return `UTC ${sign}${hours}:${minutes}`;
};

const getTimeZoneAbbreviation = (timeZone, date = new Date()) => {
   if (!timeZone) return 'UTC';
   try {
      return (
         new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'short' })
            .formatToParts(date)
            .find((part) => part.type === 'timeZoneName')?.value || 'UTC'
      );
   } catch {
      return 'UTC';
   }
};

const getTimeZoneDisplay = (timeZone, date, mode = 'gmt') => {
   if (mode === 'abbreviation') return getTimeZoneAbbreviation(timeZone, date);
   if (mode === 'iana') return timeZone?.replace(/_/g, ' ') || 'UTC';
   return getGMTOffset(timeZone, date);
};

const isBusinessOpen = (timeZone, date = new Date()) => {
   try {
      const hour = Number(
         new Intl.DateTimeFormat('en-US', {
            timeZone,
            hour: '2-digit',
            hourCycle: 'h23',
         }).format(date),
      );
      return hour >= 9 && hour < 18;
   } catch {
      return false;
   }
};

const countryTimezones =
   countryTimezonesModule?.default || countryTimezonesModule;

const getRealCityRecords = () => {
   const records = Array.isArray(cityTimezones?.cityMapping)
      ? cityTimezones.cityMapping
      : [];

   return records
      .filter(
         (item) =>
            item?.city &&
            item?.iso2 &&
            item?.timezone &&
            typeof item.city === 'string' &&
            typeof item.timezone === 'string',
      )
      .map((item) => ({
         value: `${item.city} (${item.timezone}) ${item.iso2}`,
         tz: item.timezone,
         city: item.city,
         country: item.iso2,
         countryName: item.country,
         province: item.province || '',
         lat: item.lat,
         lng: item.lng,
         population: Number(item.pop) || 0,
         label: `${item.city},  ${formatCountryName(item.country)} (${item.timezone})`,
      }));
};

const getRealTimezoneRecords = () => {
   const zones =
      typeof countryTimezones?.getAllTimezones === 'function'
         ? countryTimezones.getAllTimezones()
         : {};

   return Object.values(zones)
      .filter((zone) => zone?.name)
      .map((zone) => {
         const country =
            typeof countryTimezones?.getCountryForTimezone === 'function'
               ? countryTimezones.getCountryForTimezone(zone.name)
               : null;

         return {
            value: `Timezone: ${zone.name}`,
            tz: zone.name,
            city: null,
            country: country?.id || null,
            countryName: country?.name || null,
            province: '',
            label: `${zone.name.replace(/_/g, ' ')}${
               country?.name ? ` — ${country.name}` : ''
            }`,
         };
      });
};

const formatCountryName = (countryName = '') => {
   const countryMap = {
      'United States of America': 'USA',
      'United Kingdom': 'UK',
      'United Arab Emirates': 'UAE',
      'Russian Federation': 'Russia',
   };

   const normalized = countryName.trim();

   return countryMap[normalized] || normalized;
};

const REAL_CITY_OPTIONS = getRealCityRecords();

const CITY_OPTIONS = REAL_CITY_OPTIONS.sort((a, b) => {
   const populationDiff = (b.population || 0) - (a.population || 0);
   if (populationDiff !== 0) return populationDiff;

   return `${a.countryName || ''}${a.city}`.localeCompare(
      `${b.countryName || ''}${b.city}`,
   );
}).filter(
   (item, index, array) =>
      array.findIndex(
         (other) =>
            other.city === item.city &&
            other.tz === item.tz &&
            other.country === item.country,
      ) === index,
);

const GLOBAL_TIMEZONE_OPTIONS = [
   {
      value: 'Timezone: UTC',
      tz: 'UTC',
      city: 'UTC',
      country: null,
      countryName: null,
      label: 'UTC',
   },
   ...getRealTimezoneRecords(),
].filter(
   (item, index, array) =>
      array.findIndex((other) => other.tz === item.tz) === index,
);

const OPTIONS = [...CITY_OPTIONS, ...GLOBAL_TIMEZONE_OPTIONS].filter(
   (item, index, array) =>
      array.findIndex(
         (other) =>
            other.value === item.value ||
            (other.tz === item.tz &&
               other.city === item.city &&
               other.country === item.country),
      ) === index,
);

const getZoneCountry = (zone) => {
   if (zone?.country) return zone.country;

   if (
      zone?.tz &&
      typeof countryTimezones?.getCountryForTimezone === 'function'
   ) {
      return countryTimezones.getCountryForTimezone(zone.tz)?.id || null;
   }

   return null;
};

const getZoneCity = (zone) => {
   if (zone?.city) return zone.city;

   const matchingCity = CITY_OPTIONS.find((item) => item.tz === zone?.tz);

   if (matchingCity?.city) return matchingCity.city;

   return zone?.tz?.split('/').pop()?.replace(/_/g, ' ') || 'UTC';
};

const getZoneCountryName = (zone) => {
   if (zone?.countryName) return zone.countryName;

   const countryCode = getZoneCountry(zone);

   if (countryCode && typeof countryTimezones?.getCountry === 'function') {
      return countryTimezones.getCountry(countryCode)?.name || null;
   }

   return null;
};

const getCountryName = (countryCode) => {
   if (!countryCode) return null;
   try {
      return (
         new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) ||
         countryCode
      );
   } catch {
      return countryCode;
   }
};

const renderTZItem = (
   label,
   item,
   displayMode = 'abbreviation',
   date = new Date(),
) => (
   <div className="group flex items-center gap-3 w-full rounded-xl px-2 py-2.5 transition-colors hover:bg-zinc-800/60">
      {/* Country Flag */}
      <div className="w-9 h-9 rounded-lg bg-zinc-800/80 border border-zinc-700/70 flex items-center justify-center shrink-0 overflow-hidden">
         {item?.country ? (
            <ReactCountryFlag
               svg
               countryCode={item.country}
               title={item.city || label}
               style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
               }}
            />
         ) : (
            <FiGlobe className="text-cyan-300" size={17} />
         )}
      </div>

      {/* City / Country / Timezone */}
      <div className="min-w-0 flex-1">
         <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-sm text-zinc-100 truncate group-hover:text-white">
               {item?.city || item?.tz?.replace(/_/g, ' ') || 'UTC'}
            </span>

            {item?.country && (
               <span className="text-[10px] uppercase tracking-wider text-zinc-500 shrink-0">
                  {formatCountryName(item.country)}
               </span>
            )}
         </div>

         <div className="flex items-center gap-2 mt-0.5 min-w-0">
            {/* IANA timezone */}
            <span className="text-xs text-zinc-500 truncate">
               {item?.tz?.replace(/_/g, ' ')}
            </span>

            <span className="text-zinc-700">•</span>

            {/* Real timezone abbreviation */}
            <span className="text-[11px] font-semibold text-cyan-300 truncate">
               {getTimeZoneAbbreviation(item?.tz || 'UTC', date)}
            </span>
         </div>
      </div>

      {/* Timezone abbreviation */}
      <span className="shrink-0 min-w-[48px] text-center rounded-md border border-[#daf4aa]/20 bg-[#daf4aa]/10 px-2 py-1 text-[11px] font-mono font-semibold text-[#daf4aa]">
         {getTimeZoneAbbreviation(item?.tz || 'UTC', date)}
      </span>
   </div>
);

const SelectedZoneSummary = ({
   zone,
   date,
   isOpen,
   onFavorite,
   isFavorite,
}) => {
   const city = getZoneCity(zone);
   const country = getZoneCountry(zone);
   const countryName = getZoneCountryName(zone) || getCountryName(country);
   return (
      <div className="mt-5 rounded-2xl border border-zinc-800/80 bg-[#0b0b0e] p-4 sm:p-5">
         <div className="flex items-center gap-3">
            <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-800">
               {country ? (
                  <ReactCountryFlag
                     svg
                     countryCode={country}
                     title={city}
                     style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                     }}
                  />
               ) : (
                  <div className="flex h-full w-full items-center justify-center">
                     <Globe size={22} className="text-cyan-300" />
                  </div>
               )}
            </div>
            <div className="min-w-0 flex-1">
               <div className="flex items-center gap-2">
                  <h4 className="truncate text-lg font-semibold text-zinc-100">
                     {city}
                  </h4>
                  {country && (
                     <span className="rounded-md bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                        {formatCountryName(countryName)}
                     </span>
                  )}
               </div>
               <p className="mt-0.5 truncate text-xs text-zinc-500">
                  {zone?.tz?.replace(/_/g, ' ') || 'UTC'}
               </p>
            </div>
            {onFavorite && (
               <button
                  onClick={onFavorite}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-500 transition hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-300"
                  title={
                     isFavorite ? 'Remove from Favorites' : 'Add to Favorites'
                  }>
                  <FaStar
                     size={15}
                     className={isFavorite ? 'text-yellow-300' : ''}
                  />
               </button>
            )}
         </div>
         <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/70 px-3 py-2.5">
               <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Local Time
               </p>
               <p className="mt-1 truncate text-sm font-semibold text-zinc-100">
                  {new Intl.DateTimeFormat('en-US', {
                     timeZone: zone?.tz || 'UTC',
                     hour: '2-digit',
                     minute: '2-digit',
                     second: '2-digit',
                     hour12: false,
                  }).format(date)}
               </p>
            </div>
            <div className="rounded-xl border border-[#daf4aa]/15 bg-[#daf4aa]/5 px-3 py-2.5">
               <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                  Offset
               </p>
               <p className="mt-1 truncate text-sm font-bold text-[#daf4aa]">
                  {getGMTOffset(zone?.tz || 'UTC', date)}
               </p>
            </div>
         </div>
         <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 font-semibold text-cyan-300">
               {getGMTOffset(zone?.tz || 'UTC', date)}
            </span>
            <span
               className={`rounded-full px-2.5 py-1 font-semibold ${isOpen ? 'bg-emerald-400/10 text-emerald-300' : 'bg-zinc-800 text-zinc-500'}`}>
               {isOpen ? 'Working Hours' : 'Outside Hours'}
            </span>
         </div>
      </div>
   );
};

const TimeZone = () => {
   const [fromZone, setFromZone] = useState(
      () => OPTIONS.find((o) => o.tz === 'Asia/Kolkata') || OPTIONS[0],
   );
   const [toZone, setToZone] = useState(
      () => OPTIONS.find((o) => o.tz === 'America/New_York') || OPTIONS[1],
   );
   const [date, setDate] = useState(new Date());
   const [is12h, setIs12h] = useState(true);
   const [favorites, setFavorites] = useState([]);

   // Meeting Planner State
   const [plannerTarget, setPlannerTarget] = useState(null);
   const [plannerDate, setPlannerDate] = useState(
      new Date().toISOString().split('T')[0],
   );
   const [plannerTime, setPlannerTime] = useState(
      new Date().toLocaleTimeString('en-US', {
         hour12: false,
         hour: '2-digit',
         minute: '2-digit',
      }),
   );
   const [plannerResult, setPlannerResult] = useState(null);

   useEffect(() => {
      const timer = setInterval(() => setDate(new Date()), 1000);
      return () => clearInterval(timer);
   }, []);

   const formatCurrentTime = (tz) => {
      try {
         return new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: is12h,
         }).format(date);
      } catch {
         return '--';
      }
   };

   const diffMinutes = useMemo(() => {
      if (!fromZone?.tz || !toZone?.tz) return 0;
      return (
         getOffsetMinutes(toZone.tz, date) - getOffsetMinutes(fromZone.tz, date)
      );
   }, [fromZone, toZone, date]);

   const formatDifference = (minutes) => {
      if (minutes === 0) return 'Same time';
      const sign = minutes > 0 ? '+' : '-';
      const abs = Math.abs(minutes);
      const hours = Math.floor(abs / 60);
      const mins = abs % 60;
      if (mins === 0) return `${sign}${hours}h`;
      if (hours === 0) return `${sign}${mins}m`;
      return `${sign}${hours}h ${mins}m`;
   };

   const toggleFav = (tz) => {
      setFavorites((p) =>
         p.includes(tz) ? p.filter((f) => f !== tz) : [...p, tz],
      );
   };

   const handleShowTime = () => {
      if (!plannerTarget || !plannerDate || !plannerTime) return;
      try {
         // Create local date object
         const localDate = new Date(`${plannerDate}T${plannerTime}:00`);

         const formatterTime = new Intl.DateTimeFormat('en-US', {
            timeZone: plannerTarget.tz,
            hour: '2-digit',
            minute: '2-digit',
            hour12: is12h,
         });

         const formatterDate = new Intl.DateTimeFormat('en-US', {
            timeZone: plannerTarget.tz,
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
         });

         setPlannerResult({
            time: formatterTime.format(localDate),
            date: formatterDate.format(localDate),
            location: plannerTarget.city || plannerTarget.tz.replace(/_/g, ' '),
         });
      } catch (err) {
         console.error('Invalid date or timezone', err);
      }
   };

   return (
      <ColumnLines
         columnWidth={80}
         columnCount={34}
         radialFadeStart={15}
         radialFadeEnd={90}
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden px-3 sm:px-6 md:px-10 py-16 sm:py-20">
         <SEO
            title="Time Zone Converter & Meeting Planner | Klique"
            description="Convert times between global IANA time zones. Compare time differences, plan meetings, and keep track of favorite cities worldwide."
            keywords="time zone converter, world clock, meeting planner, klique timezone, check local time"
            canonicalUrl="https://klique.netlify.app/timezone"
         />

         <div className="w-full sticky top-0 z-30 transition-all duration-300">
            <Navbar
               sidebarOpen={false}
               setSidebarOpen={() => {}}
               isMobile={window.innerWidth < 1024}
            />
         </div>

         <div className="max-w-6xl mx-auto relative z-20 w-full pl-0 lg:pl-20 px-3 sm:px-6 mt-4">
            {/* Header */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-8">
               <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-zinc-100 tracking-tight mb-3 flex items-center gap-3">
                  Time Zone Converter
               </h1>
               <p className="text-zinc-500 text-sm font-medium">
                  Convert time between different time zones and plan your
                  meetings with ease.
               </p>
            </motion.div>

            {/* Converter Layout (From -> Diff -> To) */}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_200px_minmax(0,1fr)] gap-4 sm:gap-6 mb-10 items-stretch w-full">
               {/* FROM */}
               <div className="group rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-[#151518] to-[#0f0f11] p-5 sm:p-6 shadow-2xl shadow-black/20 transition-all hover:border-cyan-400/20">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300/80">
                           Source
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-zinc-100">
                           From
                        </h3>
                     </div>
                     <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                        Current
                     </span>
                  </div>
                  <div className="mt-4">
                     <SelectPicker
                        data={OPTIONS}
                        value={fromZone?.value}
                        onChange={(val, item) => item && setFromZone(item)}
                        cleanable={false}
                        searchable={true}
                        placeholder="Search city, country or timezone..."
                        renderMenuItem={(label, item) =>
                           renderTZItem(label, item, 'gmt', date)
                        }
                        menuMaxHeight={360}
                        className="w-full !bg-[#18181b] !border-zinc-800 !text-zinc-200"
                     />
                  </div>
                  <SelectedZoneSummary
                     zone={fromZone}
                     date={date}
                     isOpen={isBusinessOpen(fromZone?.tz, date)}
                  />
               </div>

               {/* DIFFERENCE INFO (Middle Panel) */}
               <div className="relative overflow-hidden bg-[#0f0f11] border border-zinc-800/60 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col items-center justify-between text-center lg:min-w-[120px]">
                  {/* Decorative glow */}
                  <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-[#daf4aa]/5 blur-3xl" />

                  {/* Header */}
                  <div className="relative z-10">
                     <div className="flex items-center justify-center gap-2 mb-1">
                        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-[0.18em]">
                           Time Difference
                        </p>
                     </div>
                  </div>

                  {/* Main Difference */}
                  <div className="relative z-10 flex flex-col items-center my-5">
                     <div className="relative">
                        <p className="text-3xl font-bold text-[#daf4aa] tracking-tight leading-none">
                           {formatDifference(diffMinutes)}
                        </p>

                        {/* Glow behind number */}
                        <div className="absolute inset-0 -z-10 blur-2xl bg-[#daf4aa]/10" />
                     </div>

                     <p className="mt-3 text-xs font-medium text-zinc-500">
                        {diffMinutes > 0
                           ? `${toZone?.city || 'Destination'} is ahead`
                           : diffMinutes < 0
                             ? `${fromZone?.city || 'Source'} is ahead`
                             : 'Both locations have the same time'}
                     </p>
                  </div>

                  {/* Timezone Connection */}
                  <div className="relative z-10 w-full mb-5">
                     <div className="flex items-center justify-center gap-2">
                        {/* From */}
                        <div className="flex-1 min-w-0 rounded-xl py-6">
                           <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-0.5">
                              From
                           </p>

                           <p className="text-sm font-bold text-cyan-300 truncate">
                              {getTimeZoneAbbreviation(
                                 fromZone?.tz || 'UTC',
                                 date,
                              )}
                           </p>
                        </div>

                        {/* Connector */}
                        <div className="flex flex-col items-center shrink-0">
                           <div className="flex items-center gap-0.5">
                              <span className="w-1 h-1 rounded-full bg-cyan-400" />
                              <span className="w-3 h-px bg-zinc-700" />
                              <span className="w-3 h-px bg-zinc-700" />
                              <span className="w-1 h-1 rounded-full bg-[#daf4aa]" />
                           </div>
                        </div>

                        {/* To */}
                        <div className="flex-1 min-w-0 rounded-xl py-8">
                           <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-0.5">
                              To
                           </p>

                           <p className="text-sm font-bold text-[#daf4aa] truncate">
                              {getTimeZoneAbbreviation(
                                 toZone?.tz || 'UTC',
                                 date,
                              )}
                           </p>
                        </div>
                     </div>
                  </div>

                  {/* Time Format */}
                  <div className="relative z-10 flex flex-col items-center gap-2 w-full mt-auto">
                     <div className="flex items-center gap-2">
                        <span className="text-zinc-600 text-[10px] uppercase tracking-[0.16em] font-semibold">
                           Time Format
                        </span>

                        <span className="text-[10px] font-semibold text-[#daf4aa] bg-[#daf4aa]/10 px-1.5 py-0.5 rounded">
                           {is12h ? '12H' : '24H'}
                        </span>
                     </div>

                     <button
                        onClick={() => setIs12h(!is12h)}
                        aria-label="Switch time format"
                        className="relative flex h-10 w-[138px] items-center rounded-full border border-zinc-700 bg-[#18181b] p-1 focus:outline-none">
                        {/* Active background */}
                        <span
                           className={`absolute top-1 bottom-1 w-[65px] rounded-full bg-[#daf4aa] shadow-lg shadow-[#daf4aa]/10 transition-all duration-300 ease-out ${
                              is12h ? 'left-1' : 'left-[68px]'
                           }`}
                        />

                        {/* 12 Hour */}
                        <span
                           className={`relative z-10 flex h-full w-1/2 items-center justify-center text-[11px] font-semibold transition-colors duration-200 ${
                              is12h ? 'text-zinc-950' : 'text-zinc-500'
                           }`}>
                           12-hour
                        </span>

                        {/* 24 Hour */}
                        <span
                           className={`relative z-10 flex h-full w-1/2 items-center justify-center text-[11px] font-semibold transition-colors duration-200 ${
                              !is12h ? 'text-zinc-950' : 'text-zinc-500'
                           }`}>
                           24-hour
                        </span>
                     </button>
                  </div>
               </div>

               {/* TO */}
               <div className="group rounded-3xl border border-zinc-800/80 bg-gradient-to-b from-[#151518] to-[#0f0f11] p-5 sm:p-6 shadow-2xl shadow-black/20 transition-all hover:border-[#daf4aa]/20">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#daf4aa]/80">
                           Destination
                        </p>
                        <h3 className="mt-1 text-lg font-semibold text-zinc-100">
                           To
                        </h3>
                     </div>
                     <button
                        onClick={() => toggleFav(toZone?.tz)}
                        className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-500 transition hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-300"
                        title={
                           favorites.includes(toZone?.tz)
                              ? 'Remove from Favorites'
                              : 'Add to Favorites'
                        }>
                        <FaStar
                           className={
                              favorites.includes(toZone?.tz)
                                 ? 'text-yellow-300'
                                 : ''
                           }
                           size={15}
                        />
                     </button>
                  </div>
                  <div className="mt-4">
                     <SelectPicker
                        data={OPTIONS}
                        value={toZone?.value}
                        onChange={(val, item) => item && setToZone(item)}
                        cleanable={false}
                        searchable={true}
                        placeholder="Search city, country or timezone..."
                        renderMenuItem={(label, item) =>
                           renderTZItem(label, item, 'gmt', date)
                        }
                        menuMaxHeight={360}
                        className="w-full !bg-[#18181b] !border-zinc-800 !text-zinc-200"
                     />
                  </div>
                  <SelectedZoneSummary
                     zone={toZone}
                     date={date}
                     isOpen={isBusinessOpen(toZone?.tz, date)}
                     onFavorite={() => toggleFav(toZone?.tz)}
                     isFavorite={favorites.includes(toZone?.tz)}
                  />
               </div>
            </div>

            {/* Meeting Planner Section */}
            <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden mb-10">
               <div className="p-5 sm:p-6 border-b border-zinc-800/50 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-400/15 bg-purple-400/10">
                     <Calendar className="text-purple-300" size={20} />
                  </div>
                  <div>
                     <h2 className="text-xl font-medium text-zinc-100 tracking-tight">
                        Meeting Planner
                     </h2>
                     <p className="text-zinc-500 text-sm font-medium">
                        Enter your local time to get the exact time in any
                        country or city.
                     </p>
                  </div>
               </div>

               <div className="grid lg:grid-cols-[1.5fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-zinc-800/50">
                  {/* Left side - Inputs */}
                  <div className="p-6 sm:p-8 space-y-6">
                     <h3 className="text-sm font-semibold text-zinc-100">
                        Your Details
                     </h3>

                     <div className="space-y-5">
                        <div>
                           <label className="block text-xs font-medium text-zinc-500 mb-2">
                              Country or City (Target)
                           </label>
                           <SelectPicker
                              data={OPTIONS}
                              value={plannerTarget?.value}
                              onChange={(val, item) =>
                                 item && setPlannerTarget(item)
                              }
                              cleanable={true}
                              searchable={true}
                              placeholder="Select country or city"
                              renderMenuItem={(label, item) =>
                                 renderTZItem(label, item, 'gmt', date)
                              }
                              className="w-full !bg-[#18181b] !border-zinc-800 !text-zinc-200"
                           />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div>
                              <label className="block text-xs font-medium text-zinc-500 mb-2">
                                 Date (Local)
                              </label>
                              <input
                                 type="date"
                                 value={plannerDate}
                                 onChange={(e) =>
                                    setPlannerDate(e.target.value)
                                 }
                                 className="w-full px-4 py-2 bg-[#18181b] border border-zinc-800 text-zinc-200 text-sm rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                              />
                           </div>
                           <div>
                              <label className="block text-xs font-medium text-zinc-500 mb-2">
                                 Time (Local)
                              </label>
                              <div className="flex gap-2 items-center">
                                 <input
                                    type="time"
                                    value={plannerTime}
                                    onChange={(e) =>
                                       setPlannerTime(e.target.value)
                                    }
                                    className="flex-1 px-4 py-2 bg-[#18181b] border border-zinc-800 text-zinc-200 text-sm rounded-lg focus:outline-none focus:border-zinc-600 transition-colors"
                                 />
                                 <span className="text-xs font-semibold text-zinc-500 bg-[#0f0f11] px-3 py-2 rounded-lg border border-zinc-800/50">
                                    {is12h ? '12h' : '24h'}
                                 </span>
                              </div>
                           </div>
                        </div>

                        <button
                           onClick={handleShowTime}
                           className="w-full sm:w-auto px-6 py-2.5 mt-2 bg-[#daf4aa] hover:bg-[#c9e99a] text-zinc-950 font-semibold rounded-xl shadow-lg shadow-[#daf4aa]/10 transition-colors flex items-center justify-center gap-2">
                           Show Time →
                        </button>
                     </div>
                  </div>

                  {/* Right side - Result */}
                  <div className="p-6 sm:p-4 m-6 bg-[#0a0a0c] rounded-4xl flex flex-col">
                     <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2 ml-4">
                        <MapPin size={16} className="text-red-500" /> Selected
                        Time
                     </h3>

                     <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <AnimatePresence mode="wait">
                           {plannerResult ? (
                              <motion.div
                                 key="result"
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 className="space-y-3 bg-[#121214] border border-zinc-800/80 p-8 rounded-2xl shadow-xl w-full">
                                 <Globe
                                    size={28}
                                    className="mx-auto text-zinc-600 mb-2"
                                 />
                                 <p className="text-cyan-300 text-sm font-semibold uppercase tracking-wider">
                                    {plannerResult.location}
                                 </p>
                                 <p className="text-4xl font-bold text-[#daf4aa] tracking-tight">
                                    {plannerResult.time}
                                 </p>
                                 <p className="text-zinc-500 text-sm font-medium">
                                    {plannerResult.date}
                                 </p>
                              </motion.div>
                           ) : (
                              <motion.div
                                 key="placeholder"
                                 initial={{ opacity: 0 }}
                                 animate={{ opacity: 1 }}
                                 className="text-zinc-500 space-y-4">
                                 <Globe
                                    size={48}
                                    className="mx-auto opacity-30"
                                 />
                                 <p className="text-sm max-w-[220px] mx-auto leading-relaxed">
                                    Choose a country or city and click{' '}
                                    <span className="text-zinc-400 font-medium">
                                       "Show Time"
                                    </span>{' '}
                                    to see the converted time.
                                 </p>
                              </motion.div>
                           )}
                        </AnimatePresence>
                     </div>
                  </div>
               </div>
            </div>

            {/* Favorites Section */}
            {favorites.length > 0 && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 mb-10 shadow-xl">
                  <h3 className="mb-6 text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                     <FaStar className="text-yellow-400" /> Saved Time Zones
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     {favorites.map((tz) => (
                        <div
                           key={tz}
                           className="bg-[#0f0f11] border border-zinc-800/60 rounded-xl p-5 hover:border-zinc-700 transition-colors">
                           <p className="text-sm font-semibold text-cyan-300 mb-2 truncate">
                              {tz.replace(/_/g, ' ')}
                           </p>
                           <p className="text-xl font-bold text-[#daf4aa] mb-1 tracking-tight">
                              {formatCurrentTime(tz)}
                           </p>
                           <p className="text-xs font-medium text-zinc-500">
                              {getTimeZoneDisplay(tz, date, 'gmt')}
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
