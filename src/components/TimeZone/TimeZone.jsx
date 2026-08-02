import React, { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import ReactCountryFlag from 'react-country-flag';
import { FaClock, FaBars, FaStar } from 'react-icons/fa';
import Navbar from '../Navbar';
import SEO from '../SEO';

const getGMTOffset = (timeZone) => {
   const now = new Date();
   const tzDate = new Date(now.toLocaleString('en-US', { timeZone }));
   const offsetMinutes = Math.round((tzDate - now) / 60000);

   const sign = offsetMinutes >= 0 ? '+' : '-';
   const abs = Math.abs(offsetMinutes);
   const hours = String(Math.floor(abs / 60)).padStart(2, '0');
   const minutes = String(abs % 60).padStart(2, '0');

   return `GMT ${sign}${hours}:${minutes}`;
};

const isBusinessOpen = (timeZone) => {
   const hour = new Date(
      new Date().toLocaleString('en-US', { timeZone })
   ).getHours();
   return hour >= 9 && hour <= 18;
};

const BASE_CITIES = [
   // --- North America ---
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

   // --- South America ---
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

   // --- Europe ---
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

   // --- Africa ---
   { city: 'Cairo', tz: 'Africa/Cairo', country: 'EG' },
   { city: 'Johannesburg', tz: 'Africa/Johannesburg', country: 'ZA' },
   { city: 'Cape Town', tz: 'Africa/Johannesburg', country: 'ZA' },
   { city: 'Lagos', tz: 'Africa/Lagos', country: 'NG' },
   { city: 'Nairobi', tz: 'Africa/Nairobi', country: 'KE' },
   { city: 'Casablanca', tz: 'Africa/Casablanca', country: 'MA' },
   { city: 'Accra', tz: 'Africa/Accra', country: 'GH' },

   // --- Middle East ---
   { city: 'Dubai', tz: 'Asia/Dubai', country: 'AE' },
   { city: 'Abu Dhabi', tz: 'Asia/Dubai', country: 'AE' },
   { city: 'Riyadh', tz: 'Asia/Riyadh', country: 'SA' },
   { city: 'Doha', tz: 'Asia/Qatar', country: 'QA' },
   { city: 'Tel Aviv', tz: 'Asia/Jerusalem', country: 'IL' },
   { city: 'Tehran', tz: 'Asia/Tehran', country: 'IR' },
   { city: 'Baghdad', tz: 'Asia/Baghdad', country: 'IQ' },

   // --- Asia ---
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
   { city: 'Beijing', tz: 'Asia/Shanghai', country: 'CN' }, // China uses one TZ
   { city: 'Shanghai', tz: 'Asia/Shanghai', country: 'CN' },
   { city: 'Taipei', tz: 'Asia/Taipei', country: 'TW' },
   { city: 'Seoul', tz: 'Asia/Seoul', country: 'KR' },
   { city: 'Tokyo', tz: 'Asia/Tokyo', country: 'JP' },
   { city: 'Osaka', tz: 'Asia/Tokyo', country: 'JP' },

   // --- Australia & Oceania ---
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

const CITY_OPTIONS = BASE_CITIES.map((c) => ({
   value: c.tz,
   tz: c.tz,
   search: `${c.city} ${c.tz}`,
   label: (
      <div className="flex items-center gap-2">
         <ReactCountryFlag svg countryCode={c.country} />
         <span>{c.city}</span>
         <span className="text-xs text-gray-400">({getGMTOffset(c.tz)})</span>
      </div>
   ),
}));

const GLOBAL_OPTIONS = ALL_TIMEZONES.map((tz) => ({
   value: tz,
   tz,
   search: tz,
   label: (
      <div className="flex items-center gap-2">
         <span className="text-lg">🌍</span>
         <span className="text-sm">{tz.replace(/_/g, ' ')}</span>
         <span className="text-xs text-gray-400">({getGMTOffset(tz)})</span>
      </div>
   ),
}));

const OPTIONS = [...CITY_OPTIONS, ...GLOBAL_OPTIONS].filter(
   (v, i, a) => a.findIndex((t) => t.value === v.value) === i
);

const TimeZone = () => {
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [fromZone, setFromZone] = useState(
      OPTIONS.find((o) => o.tz === 'Asia/Kolkata')
   );
   const [toZone, setToZone] = useState(
      OPTIONS.find((o) => o.tz === 'America/New_York')
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
      const from = new Date(
         date.toLocaleString('en-US', { timeZone: fromZone.tz })
      );
      const to = new Date(
         date.toLocaleString('en-US', { timeZone: toZone.tz })
      );
      return Math.round((to - from) / 36e5);
   }, [fromZone, toZone, date]);

   const toggleFav = (tz) => {
      setFavorites((p) =>
         p.includes(tz) ? p.filter((f) => f !== tz) : [...p, tz]
      );
   };

   return (
      <div className="dark min-h-screen bg-[#050505] text-slate-200 relative overflow-hidden font-sans">
         <SEO
            title="Time Zone Converter & Meeting Planner | Klique"
            description="Convert times between global time zones seamlessly. Plan meetings, compare time differences, and keep track of your favorite cities worldwide."
            keywords="time zone converter, world clock, meeting planner, convert time zones, timezone calculator, klique timezone, check local time"
            canonicalUrl="https://klique.com/timezone"
            jsonLd={{
               "@context": "https://schema.org",
               "@type": "SoftwareApplication",
               "name": "Time Zone Converter",
               "operatingSystem": "All",
               "applicationCategory": "UtilitiesApplication",
               "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
               }
            }}
         />
         {/* Sidebar Toggle */}
         <div
            onClick={() => setSidebarOpen((p) => !p)}
            className="fixed top-6 left-6 z-40 p-3 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl cursor-pointer">
            <FaBars />
         </div>

         <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

         <div className="max-w-7xl mx-auto px-6 sm:px-10">
            {/* Header */}
            <div className="text-center mt-16 mb-14">
               <h1 className="text-4xl md:text-6xl font-bold text-white">
                  World <span className="gradient-text">Time Zone</span>
               </h1>
               <p className="text-gray-400 mt-4">
                  Convert time between any country, city, or GMT offset
               </p>
            </div>

            {/* Converter */}
            <div className="grid lg:grid-cols-3 gap-6 mb-10">
               {/* FROM */}
               <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="mb-2 font-semibold">From</h3>
                  <Select
                     options={OPTIONS}
                     value={fromZone}
                     onChange={setFromZone}
                     styles={selectStyles}
                     isSearchable
                  />
                  <p className="mt-4 text-xl font-bold text-indigo-400">
                     {formatTime(fromZone.tz)}
                  </p>
                  <p className="text-sm text-gray-400">
                     {getGMTOffset(fromZone.tz)} ·{' '}
                     {isBusinessOpen(fromZone.tz) ? '🟢 Open' : '🔴 Closed'}
                  </p>
               </div>

               {/* TO */}
               <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="mb-2 font-semibold">To</h3>
                  <Select
                     options={OPTIONS}
                     value={toZone}
                     onChange={setToZone}
                     styles={selectStyles}
                     isSearchable
                  />

                  <p className="mt-4 text-xl font-bold text-pink-400">
                     {formatTime(toZone.tz)}
                  </p>
                  <p className="text-sm text-gray-400">
                     {getGMTOffset(toZone.tz)} ·{' '}
                     {isBusinessOpen(toZone.tz) ? '🟢 Open' : '🔴 Closed'}
                  </p>

                  <button
                     onClick={() => toggleFav(toZone.tz)}
                     className="mt-4 px-4 py-2 rounded-xl bg-yellow-500/20">
                     <FaStar
                        className={
                           favorites.includes(toZone.tz)
                              ? 'text-yellow-400'
                              : 'text-gray-400'
                        }
                     />
                  </button>
               </div>

               {/* INFO */}
               <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="flex items-center gap-2 font-semibold mb-4">
                     <FaClock /> Info
                  </h3>

                  <p className="text-gray-400 text-sm">Time Difference</p>
                  <p className="text-3xl font-bold text-cyan-400">
                     {diffHours >= 0 ? '+' : ''}
                     {diffHours} hrs
                  </p>

                  <button
                     onClick={() => setIs24h((p) => !p)}
                     className="mt-6 w-full py-2 rounded-xl bg-slate-700/50">
                     Switch to {is24h ? '12h' : '24h'}
                  </button>
               </div>
            </div>

            {/* Favorites */}
            {favorites.length > 0 && (
               <div className="bg-black/40 border border-gray-700 rounded-2xl p-6 mb-10">
                  <h3 className="mb-4 font-semibold">⭐ Favorites</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                     {favorites.map((tz) => (
                        <div
                           key={tz}
                           className="bg-slate-800/50 rounded-xl p-4">
                           <p className="text-sm text-gray-400">{tz}</p>
                           <p className="text-xl font-bold text-indigo-400">
                              {formatTime(tz)}
                           </p>
                           <p className="text-xs text-gray-500">
                              {getGMTOffset(tz)}
                           </p>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

const selectStyles = {
   control: (base) => ({
      ...base,
      backgroundColor: '#050505',
      borderColor: '#334155',
      borderRadius: '12px',
      minHeight: '48px',
   }),
   menu: (base) => ({
      ...base,
      backgroundColor: '#020617',
      zIndex: 50,
   }),
   option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#1e293b' : '#020617',
      color: '#e5e7eb',
      cursor: 'pointer',
   }),
   singleValue: (base) => ({
      ...base,
      color: '#e5e7eb',
   }),
};

export default TimeZone;
