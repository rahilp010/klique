import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import HeroPage from './components/HeroPage'; // Loaded synchronously for instant LCP

// Keep heavy tool dependencies out of the initial homepage bundle.
const EmojiCopy = lazy(() => import('./components/EmojiGenerator/EmojiCopy'));
const FancyFontGenerator = lazy(() => import('./components/FanceyFont/FanceyFontGenerarot'));
const CoolSymbol = lazy(() => import('./components/CoolSymbol/CoolSymbol'));
const HashtagGenerator = lazy(() => import('./components/Hashtag/HashtagGenerator'));
const BioGenerator = lazy(() => import('./components/BioGenerator/BioGenerator'));
const WordCounter = lazy(() => import('./components/WordCounter/WordCounter'));
const Paraphrase = lazy(() => import('./components/Paraphrase/Paraphrase'));
const UsernameGenerator = lazy(() => import('./components/UserName/UserName'));
const TimeZone = lazy(() => import('./components/TimeZone/TimeZone'));
const PDFTools = lazy(() => import('./components/Converter/PDFTools'));

// Simple loading indicator during chunk fetches
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
