import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HeroPage from './components/HeroPage'; // Loaded synchronously for instant LCP

// Define route import factories for preloading
export const routeImports = {
   '/emojigenerator': () => import('./components/EmojiGenerator/EmojiCopy'),
   '/fontgenerator': () =>
      import('./components/FanceyFont/FanceyFontGenerarot'),
   '/symbol': () => import('./components/CoolSymbol/CoolSymbol'),
   '/hashtaggenerator': () => import('./components/Hashtag/HashtagGenerator'),
   '/bio': () => import('./components/BioGenerator/BioGenerator'),
   '/wordcounter': () => import('./components/WordCounter/WordCounter'),
   '/aiwriter': () => import('./components/Paraphrase/Paraphrase'),
   '/username': () => import('./components/UserName/UserName'),
   '/timezone': () => import('./components/TimeZone/TimeZone'),
   '/convert': () => import('./components/Converter/PDFTools'),
};

// Preload specific route or all routes in background
export const preloadRoute = (path) => {
   if (path && routeImports[path]) {
      routeImports[path]();
   } else {
      Object.values(routeImports).forEach((importFn) => importFn());
   }
};

// Lazy components
const EmojiCopy = lazy(routeImports['/emojigenerator']);
const FancyFontGenerator = lazy(routeImports['/fontgenerator']);
const CoolSymbol = lazy(routeImports['/symbol']);
const HashtagGenerator = lazy(routeImports['/hashtaggenerator']);
const BioGenerator = lazy(routeImports['/bio']);
const WordCounter = lazy(routeImports['/wordcounter']);
const Paraphrase = lazy(routeImports['/aiwriter']);
const UsernameGenerator = lazy(routeImports['/username']);
const TimeZone = lazy(routeImports['/timezone']);
const PDFTools = lazy(routeImports['/convert']);

// Simple loading indicator during chunk fetches (if network is very slow)
const LoadingFallback = () => (
   <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
         <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
         <p className="text-gray-400 text-xs font-semibold tracking-wider uppercase animate-pulse">
            Loading tool...
         </p>
      </div>
   </div>
);

function App() {
   useEffect(() => {
      // Preload all route chunks in the background right after initial mount
      const timer = setTimeout(() => {
         if ('requestIdleCallback' in window) {
            requestIdleCallback(() => preloadRoute());
         } else {
            preloadRoute();
         }
      }, 100);
      return () => clearTimeout(timer);
   }, []);

   return (
      <>
         <Suspense fallback={<LoadingFallback />}>
            <Routes>
               <Route path="/" element={<HeroPage />} />
               <Route path="/emojigenerator" element={<EmojiCopy />} />
               <Route path="/fontgenerator" element={<FancyFontGenerator />} />
               <Route path="/symbol" element={<CoolSymbol />} />
               <Route path="/hashtaggenerator" element={<HashtagGenerator />} />
               <Route path="/bio" element={<BioGenerator />} />
               <Route path="/wordcounter" element={<WordCounter />} />
               <Route path="/aiwriter" element={<Paraphrase />} />
               <Route path="/username" element={<UsernameGenerator />} />
               <Route path="/timezone" element={<TimeZone />} />
               <Route path="/convert" element={<PDFTools />} />
            </Routes>
         </Suspense>
      </>
   );
}

export default App;
