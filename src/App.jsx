import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, Zoom } from 'react-toastify';
import HeroPage from './components/HeroPage'; // Loaded synchronously for instant LCP
// Lazy-load sub-routes to split the bundles and optimize initial rendering

import EmojiCopy from './components/EmojiGenerator/EmojiCopy';
import FancyFontGenerator from './components/FanceyFont/FanceyFontGenerarot';
import CoolSymbol from './components/CoolSymbol/CoolSymbol';
import HashtagGenerator from './components/Hashtag/HashtagGenerator';
import BioGenerator from './components/BioGenerator/BioGenerator';
import WordCounter from './components/WordCounter/WordCounter';
import Paraphrase from './components/Paraphrase/Paraphrase';
import UsernameGenerator from './components/UserName/UserName';
import TimeZone from './components/TimeZone/TimeZone';
import PDFTools from './components/Converter/PDFTools';

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
         <ToastContainer
            position="top-right"
            autoClose={1000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            transition={Zoom}
         />
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
