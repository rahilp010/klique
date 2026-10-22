import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HeroPage from './components/HeroPage'; // Loaded synchronously for instant LCP
import ScrollToTop from './components/ScrollToTop';
import Loader from './components/Loader';

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
   '/jsonformatter': () => import('./components/JsonFormatter/JsonFormatter'),
   '/svgconverter': () => import('./components/SVGConverter/SVGConverter'),
   '/qrlinktools': () => import('./components/QRCodeLinkTools/QRCodeLinkTools'),
   '/codeimage': () => import('./components/CodeToImage/CodeToImage'),
   '/favicongenerator': () =>
      import('./components/FaviconGenerator/FaviconGenerator'),
   '/imageoptimizer': () =>
      import('./components/ImageOptimizer/ImageOptimizer'),
   '/ogpreviewer': () => import('./components/OGPreviewer/OGPreviewer'),
   '/aboutus': () => import('./components/Company/AboutUs'),
   '/help': () => import('./components/Support/HelpCenter'),
   '/faqs': () => import('./components/Support/FAQs'),
   '/terms': () => import('./components/Support/Terms'),
   '/privacy': () => import('./components/Support/Privacy'),
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
const JsonFormatter = lazy(routeImports['/jsonformatter']);
const SVGConverter = lazy(routeImports['/svgconverter']);
const QRCodeLinkTools = lazy(routeImports['/qrlinktools']);
const CodeToImage = lazy(routeImports['/codeimage']);
const FaviconGenerator = lazy(routeImports['/favicongenerator']);
const ImageOptimizer = lazy(routeImports['/imageoptimizer']);
const OGPreviewer = lazy(routeImports['/ogpreviewer']);
const AboutUs = lazy(routeImports['/aboutus']);
const HelpCenter = lazy(routeImports['/help']);
const FAQs = lazy(routeImports['/faqs']);
const Terms = lazy(routeImports['/terms']);
const Privacy = lazy(routeImports['/privacy']);

// Simple loading indicator during chunk fetches (if network is very slow)
const LoadingFallback = () => (
   <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader />
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
         <ScrollToTop />
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
               <Route path="/jsonformatter" element={<JsonFormatter />} />
               <Route path="/svgconverter" element={<SVGConverter />} />
               <Route path="/qrlinktools" element={<QRCodeLinkTools />} />
               <Route path="/codeimage" element={<CodeToImage />} />
               <Route
                  path="/favicongenerator"
                  element={<FaviconGenerator />}
               />
               <Route
                  path="/imageoptimizer"
                  element={<ImageOptimizer />}
               />
               <Route path="/ogpreviewer" element={<OGPreviewer />} />
               <Route path="/aboutus" element={<AboutUs />} />
               <Route path="/help" element={<HelpCenter />} />
               <Route path="/faqs" element={<FAQs />} />
               <Route path="/terms" element={<Terms />} />
               <Route path="/privacy" element={<Privacy />} />
            </Routes>
         </Suspense>
      </>
   );
}

export default App;
