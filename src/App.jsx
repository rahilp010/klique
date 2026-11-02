/* eslint-disable react-refresh/only-export-components */
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
   '/imagetools': () =>
      import('./components/ImageOptimizer/ImageOptimizer'),
   '/fileencryption': () =>
      import('./components/FileEncryption/FileEncryption'),
   '/secretscanner': () =>
      import('./components/SecretScanner/SecretScanner'),
   '/ogpreviewer': () => import('./components/OGPreviewer/OGPreviewer'),
   '/aboutus': () => import('./components/Company/AboutUs'),
   '/help': () => import('./components/Support/HelpCenter'),
   '/faqs': () => import('./components/Support/FAQs'),
   '/terms': () => import('./components/Support/Terms'),
   '/privacy': () => import('./components/Support/Privacy'),

   // Category Directory
   // '/category': () => import('./features/categories/CategoryPage'),

   // Phase 1 New Tools
   // '/tools/gst-calculator': () =>
   //    import('./features/business/gst-calculator/GSTCalculator'),
   // '/tools/emi-calculator': () =>
   //    import('./features/business/emi-calculator/EMICalculator'),
   // '/tools/attendance-calculator': () =>
   //    import('./features/student/attendance-calculator/AttendanceCalculator'),
   // '/tools/cgpa-calculator': () =>
   //    import('./features/student/cgpa-calculator/CGPACalculator'),
   // '/tools/split-bill-calculator': () =>
   //    import('./features/productivity/split-bill/SplitBillCalculator'),
   // '/tools/whatsapp-link-generator': () =>
   //    import('./features/qr/whatsapp-link/WhatsAppLinkGenerator'),
   // '/tools/profit-margin-calculator': () =>
   //    import('./features/business/profit-margin/ProfitMarginCalculator'),

   // Phase 3 Tools
   // '/tools/invoice-generator': () =>
   //    import('./features/business/invoice-generator/InvoiceGenerator'),
   // '/tools/quotation-generator': () =>
   //    import('./features/business/quotation-generator/QuotationGenerator'),
   // '/tools/salary-calculator': () =>
   //    import('./features/business/salary-calculator/SalaryCalculator'),
   // '/tools/upi-qr-generator': () =>
   //    import('./features/business/upi-qr/UPIQRGenerator'),
   // '/tools/email-signature-generator': () =>
   //    import('./features/business/email-signature/EmailSignatureGenerator'),

   // Phase 2 Developer Tools
   // '/tools/regex-tester': () =>
   //    import('./features/developer/regex-tester/RegexTester'),
   // '/tools/json-to-typescript': () =>
   //    import('./features/developer/json-to-ts/JsonToTypeScript'),
   // '/tools/jwt-decoder': () =>
   //    import('./features/developer/jwt-decoder/JWTDecoder'),
   // '/tools/sql-formatter': () =>
   //    import('./features/developer/sql-formatter/SQLFormatter'),
   // '/tools/cron-generator': () =>
   //    import('./features/developer/cron-generator/CronGenerator'),
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
const FileEncryption = lazy(routeImports['/fileencryption']);
const SecretScanner = lazy(routeImports['/secretscanner']);
const OGPreviewer = lazy(routeImports['/ogpreviewer']);
const AboutUs = lazy(routeImports['/aboutus']);
const HelpCenter = lazy(routeImports['/help']);
const FAQs = lazy(routeImports['/faqs']);
const Terms = lazy(routeImports['/terms']);
const Privacy = lazy(routeImports['/privacy']);
const CategoryPage = lazy(routeImports['/category']);

// Phase 1 Lazy Components
const GSTCalculator = lazy(routeImports['/tools/gst-calculator']);
const EMICalculator = lazy(routeImports['/tools/emi-calculator']);
const AttendanceCalculator = lazy(routeImports['/tools/attendance-calculator']);
const CGPACalculator = lazy(routeImports['/tools/cgpa-calculator']);
const SplitBillCalculator = lazy(routeImports['/tools/split-bill-calculator']);
const WhatsAppLinkGenerator = lazy(routeImports['/tools/whatsapp-link-generator']);
const ProfitMarginCalculator = lazy(routeImports['/tools/profit-margin-calculator']);

// Phase 3 Lazy Components
const InvoiceGenerator = lazy(routeImports['/tools/invoice-generator']);
const QuotationGenerator = lazy(routeImports['/tools/quotation-generator']);
const SalaryCalculator = lazy(routeImports['/tools/salary-calculator']);
const UPIQRGenerator = lazy(routeImports['/tools/upi-qr-generator']);
const EmailSignatureGenerator = lazy(routeImports['/tools/email-signature-generator']);

// Phase 2 Lazy Components
const RegexTester = lazy(routeImports['/tools/regex-tester']);
const JsonToTypeScript = lazy(routeImports['/tools/json-to-typescript']);
const JWTDecoder = lazy(routeImports['/tools/jwt-decoder']);
const SQLFormatter = lazy(routeImports['/tools/sql-formatter']);
const CronGenerator = lazy(routeImports['/tools/cron-generator']);

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

               {/* Category Directory */}
               <Route path="/category" element={<CategoryPage />} />
               <Route path="/categories" element={<CategoryPage />} />
               <Route path="/category/:slug" element={<CategoryPage />} />
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
               <Route
                  path="/imagetools"
                  element={<ImageOptimizer />}
               />
               <Route
                  path="/fileencryption"
                  element={<FileEncryption />}
               />
               <Route
                  path="/secretscanner"
                  element={<SecretScanner />}
               />
               <Route path="/ogpreviewer" element={<OGPreviewer />} />
               <Route path="/aboutus" element={<AboutUs />} />
               <Route path="/help" element={<HelpCenter />} />
               <Route path="/faqs" element={<FAQs />} />
               <Route path="/terms" element={<Terms />} />
               <Route path="/privacy" element={<Privacy />} />

               {/* Phase 1 Routes (Canonical and Short Aliases) */}
               <Route path="/tools/gst-calculator" element={<GSTCalculator />} />
               <Route path="/gstcalculator" element={<GSTCalculator />} />

               <Route path="/tools/emi-calculator" element={<EMICalculator />} />
               <Route path="/emicalculator" element={<EMICalculator />} />

               <Route path="/tools/attendance-calculator" element={<AttendanceCalculator />} />
               <Route path="/attendancecalculator" element={<AttendanceCalculator />} />

               <Route path="/tools/cgpa-calculator" element={<CGPACalculator />} />
               <Route path="/cgpacalculator" element={<CGPACalculator />} />

               <Route path="/tools/split-bill-calculator" element={<SplitBillCalculator />} />
               <Route path="/splitbill" element={<SplitBillCalculator />} />

               <Route path="/tools/whatsapp-link-generator" element={<WhatsAppLinkGenerator />} />
               <Route path="/whatsapplink" element={<WhatsAppLinkGenerator />} />

               <Route path="/tools/profit-margin-calculator" element={<ProfitMarginCalculator />} />
               <Route path="/profitmargin" element={<ProfitMarginCalculator />} />

               {/* Phase 3 Routes (Canonical and Short Aliases) */}
               <Route path="/tools/invoice-generator" element={<InvoiceGenerator />} />
               <Route path="/invoicegenerator" element={<InvoiceGenerator />} />
               <Route path="/invoice" element={<InvoiceGenerator />} />

               <Route path="/tools/quotation-generator" element={<QuotationGenerator />} />
               <Route path="/quotationgenerator" element={<QuotationGenerator />} />
               <Route path="/quotation" element={<QuotationGenerator />} />

               <Route path="/tools/salary-calculator" element={<SalaryCalculator />} />
               <Route path="/salarycalculator" element={<SalaryCalculator />} />
               <Route path="/salary" element={<SalaryCalculator />} />

               <Route path="/tools/upi-qr-generator" element={<UPIQRGenerator />} />
               <Route path="/upiqrgenerator" element={<UPIQRGenerator />} />
               <Route path="/upiqr" element={<UPIQRGenerator />} />

               <Route path="/tools/email-signature-generator" element={<EmailSignatureGenerator />} />
               <Route path="/emailsignaturegenerator" element={<EmailSignatureGenerator />} />
               <Route path="/emailsignature" element={<EmailSignatureGenerator />} />

               {/* Phase 2 Routes (Canonical and Short Aliases) */}
               <Route path="/tools/regex-tester" element={<RegexTester />} />
               <Route path="/regextester" element={<RegexTester />} />
               <Route path="/regex" element={<RegexTester />} />

               <Route path="/tools/json-to-typescript" element={<JsonToTypeScript />} />
               <Route path="/jsontots" element={<JsonToTypeScript />} />
               <Route path="/jsontotypescript" element={<JsonToTypeScript />} />

               <Route path="/tools/jwt-decoder" element={<JWTDecoder />} />
               <Route path="/jwtdecoder" element={<JWTDecoder />} />
               <Route path="/jwt" element={<JWTDecoder />} />

               <Route path="/tools/sql-formatter" element={<SQLFormatter />} />
               <Route path="/sqlformatter" element={<SQLFormatter />} />
               <Route path="/sql" element={<SQLFormatter />} />

               <Route path="/tools/cron-generator" element={<CronGenerator />} />
               <Route path="/crongenerator" element={<CronGenerator />} />
               <Route path="/cron" element={<CronGenerator />} />
            </Routes>
         </Suspense>
      </>
   );
}

export default App;
