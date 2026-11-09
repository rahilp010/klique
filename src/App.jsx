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
   '/category': () => import('./features/categories/CategoryPage'),

   // Phase 1 New Tools
   '/tools/gst-calculator': () =>
      import('./features/business/gst-calculator/GSTCalculator'),
   '/tools/emi-calculator': () =>
      import('./features/business/emi-calculator/EMICalculator'),
   '/tools/attendance-calculator': () =>
      import('./features/student/attendance-calculator/AttendanceCalculator'),
   '/tools/cgpa-calculator': () =>
      import('./features/student/cgpa-calculator/CGPACalculator'),
   '/tools/split-bill-calculator': () =>
      import('./features/productivity/split-bill/SplitBillCalculator'),
   '/tools/whatsapp-link-generator': () =>
      import('./features/qr/whatsapp-link/WhatsAppLinkGenerator'),
   '/tools/profit-margin-calculator': () =>
      import('./features/business/profit-margin/ProfitMarginCalculator'),

   // Phase 3 Tools
   '/tools/invoice-generator': () =>
      import('./features/business/invoice-generator/InvoiceGenerator'),
   '/tools/quotation-generator': () =>
      import('./features/business/quotation-generator/QuotationGenerator'),
   '/tools/salary-calculator': () =>
      import('./features/business/salary-calculator/SalaryCalculator'),
   '/tools/upi-qr-generator': () =>
      import('./features/business/upi-qr/UPIQRGenerator'),
   '/tools/email-signature-generator': () =>
      import('./features/business/email-signature/EmailSignatureGenerator'),

   // Phase 2 Developer Tools
   '/tools/regex-tester': () =>
      import('./features/developer/regex-tester/RegexTester'),
   '/tools/json-to-typescript': () =>
      import('./features/developer/json-to-ts/JsonToTypeScript'),
   '/tools/jwt-decoder': () =>
      import('./features/developer/jwt-decoder/JWTDecoder'),
   '/tools/sql-formatter': () =>
      import('./features/developer/sql-formatter/SQLFormatter'),
   '/tools/cron-generator': () =>
      import('./features/developer/cron-generator/CronGenerator'),

   // Phase 4 Productivity & File Tools
   '/tools/pomodoro-timer': () =>
      import('./features/productivity/pomodoro-timer/PomodoroTimer'),
   '/tools/event-countdown': () =>
      import('./features/productivity/event-countdown/EventCountdown'),
   '/tools/subscription-tracker': () =>
      import('./features/productivity/subscription-tracker/SubscriptionTracker'),
   '/tools/bulk-image-compressor': () =>
      import('./features/files/bulk-image-compressor/BulkImageCompressor'),
   '/tools/pdf-signer': () =>
      import('./features/files/pdf-signer/PDFSigner'),
   '/tools/image-to-text': () =>
      import('./features/files/image-to-text/ImageToText'),

   // Phase 5 Advanced Tools
   '/tools/api-request-builder': () =>
      import('./features/developer/api-request-builder/ApiRequestBuilder'),
   '/tools/pdf-compare': () =>
      import('./features/files/pdf-compare/PDFCompare'),
   '/tools/temporary-notes': () =>
      import('./features/productivity/temporary-notes/TemporaryNotes'),
   '/tools/seo-analyzer': () =>
      import('./features/developer/seo-analyzer/SEOAnalyzer'),

   // Complete Catalog Additions
   '/tools/meeting-cost-calculator': () =>
      import('./features/productivity/meeting-cost/MeetingCostCalculator'),
   '/tools/color-extractor': () =>
      import('./features/media/color-extractor/ImageColorExtractor'),
   '/tools/bulk-file-renamer': () =>
      import('./features/files/bulk-renamer/BulkFileRenamer'),
   '/tools/privacy-policy-generator': () =>
      import('./features/business/privacy-policy/PrivacyPolicyGenerator'),
   '/tools/expense-tracker': () =>
      import('./features/business/expense-tracker/PersonalExpenseTracker'),
   '/tools/habit-tracker': () =>
      import('./features/productivity/habit-tracker/HabitTracker'),
   '/tools/typing-speed-test': () =>
      import('./features/student/typing-test/TypingSpeedTest'),
   '/tools/study-timetable': () =>
      import('./features/student/study-timetable/StudyTimetableGenerator'),
   '/tools/flashcard-generator': () =>
      import('./features/student/flashcards/FlashcardGenerator'),
   '/tools/code-playground': () =>
      import('./features/developer/code-playground/CodePlayground'),
   '/tools/qr-menu-generator': () =>
      import('./features/qr/qr-menu/QRMenuGenerator'),
   '/tools/background-remover': () =>
      import('./features/media/background-remover/BackgroundRemover'),
   '/tools/uptime-checker': () =>
      import('./features/developer/uptime-checker/WebsiteUptimeChecker'),

   // Klique Arcade Routes
   '/games': () => import('./pages/GamesPage'),
   '/games/snake': () => import('./pages/games/SnakePage'),
   '/games/2048': () => import('./pages/games/Game2048Page'),
   '/games/tic-tac-toe': () => import('./pages/games/TicTacToePage'),
   '/games/memory-match': () => import('./pages/games/MemoryMatchPage'),
   '/games/reaction-time': () => import('./pages/games/ReactionTimePage'),
   '/games/minesweeper': () => import('./pages/games/MinesweeperPage'),
   '/games/word-guess': () => import('./pages/games/WordGuessPage'),
   '/games/brick-breaker': () => import('./pages/games/BrickBreakerPage'),
   '/games/simon-says': () => import('./pages/games/SimonSaysPage'),
   '/games/block-drop': () => import('./pages/games/BlockDropPage'),
   '/games/neon-dash': () => import('./pages/games/NeonDashPage'),
   '/games/pong': () => import('./pages/games/RetroPongPage'),
   '/games/sudoku': () => import('./pages/games/SudokuPage'),
   '/games/color-flood': () => import('./pages/games/ColorFloodPage'),
   '/games/space-invaders': () => import('./pages/games/SpaceInvadersPage'),

   // 12 Expansion Arcade Games
   '/games/tower-stacker': () => import('./pages/games/TowerStackerPage'),
   '/games/connect-four': () => import('./pages/games/ConnectFourPage'),
   '/games/matrix-flip': () => import('./pages/games/MatrixFlipPage'),
   '/games/cyber-runner': () => import('./pages/games/CyberRunnerPage'),
   '/games/type-storm': () => import('./pages/games/TypeStormPage'),
   '/games/neon-hopper': () => import('./pages/games/NeonHopperPage'),
   '/games/asteroids': () => import('./pages/games/VectorAsteroidsPage'),
   '/games/moon-lander': () => import('./pages/games/MoonLanderPage'),
   '/games/checkers': () => import('./pages/games/NeonCheckersPage'),
   '/games/cyber-pac': () => import('./pages/games/CyberPacPage'),
   '/games/solitaire': () => import('./pages/games/SpeedSolitairePage'),
   '/games/pinball': () => import('./pages/games/NeonPinballPage'),
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

// Phase 4 Lazy Components
const PomodoroTimer = lazy(routeImports['/tools/pomodoro-timer']);
const EventCountdown = lazy(routeImports['/tools/event-countdown']);
const SubscriptionTracker = lazy(routeImports['/tools/subscription-tracker']);
const BulkImageCompressor = lazy(routeImports['/tools/bulk-image-compressor']);
const PDFSigner = lazy(routeImports['/tools/pdf-signer']);
const ImageToText = lazy(routeImports['/tools/image-to-text']);

// Phase 5 Lazy Components
const ApiRequestBuilder = lazy(routeImports['/tools/api-request-builder']);
const PDFCompare = lazy(routeImports['/tools/pdf-compare']);
const TemporaryNotes = lazy(routeImports['/tools/temporary-notes']);
const SEOAnalyzer = lazy(routeImports['/tools/seo-analyzer']);

// Complete Catalog Lazy Components
const MeetingCostCalculator = lazy(routeImports['/tools/meeting-cost-calculator']);
const ImageColorExtractor = lazy(routeImports['/tools/color-extractor']);
const BulkFileRenamer = lazy(routeImports['/tools/bulk-file-renamer']);
const PrivacyPolicyGenerator = lazy(routeImports['/tools/privacy-policy-generator']);
const PersonalExpenseTracker = lazy(routeImports['/tools/expense-tracker']);
const HabitTracker = lazy(routeImports['/tools/habit-tracker']);
const TypingSpeedTest = lazy(routeImports['/tools/typing-speed-test']);
const StudyTimetableGenerator = lazy(routeImports['/tools/study-timetable']);
const FlashcardGenerator = lazy(routeImports['/tools/flashcard-generator']);
const CodePlayground = lazy(routeImports['/tools/code-playground']);
const QRMenuGenerator = lazy(routeImports['/tools/qr-menu-generator']);
const BackgroundRemover = lazy(routeImports['/tools/background-remover']);
const WebsiteUptimeChecker = lazy(routeImports['/tools/uptime-checker']);

// Klique Arcade Lazy Components
const GamesPage = lazy(routeImports['/games']);
const SnakePage = lazy(routeImports['/games/snake']);
const Game2048Page = lazy(routeImports['/games/2048']);
const TicTacToePage = lazy(routeImports['/games/tic-tac-toe']);
const MemoryMatchPage = lazy(routeImports['/games/memory-match']);
const ReactionTimePage = lazy(routeImports['/games/reaction-time']);
const MinesweeperPage = lazy(routeImports['/games/minesweeper']);
const WordGuessPage = lazy(routeImports['/games/word-guess']);
const BrickBreakerPage = lazy(routeImports['/games/brick-breaker']);
const SimonSaysPage = lazy(routeImports['/games/simon-says']);
const BlockDropPage = lazy(routeImports['/games/block-drop']);
const NeonDashPage = lazy(routeImports['/games/neon-dash']);
const RetroPongPage = lazy(routeImports['/games/pong']);
const SudokuPage = lazy(routeImports['/games/sudoku']);
const ColorFloodPage = lazy(routeImports['/games/color-flood']);
const SpaceInvadersPage = lazy(routeImports['/games/space-invaders']);

// 12 Expansion Arcade Pages
const TowerStackerPage = lazy(routeImports['/games/tower-stacker']);
const ConnectFourPage = lazy(routeImports['/games/connect-four']);
const MatrixFlipPage = lazy(routeImports['/games/matrix-flip']);
const CyberRunnerPage = lazy(routeImports['/games/cyber-runner']);
const TypeStormPage = lazy(routeImports['/games/type-storm']);
const NeonHopperPage = lazy(routeImports['/games/neon-hopper']);
const VectorAsteroidsPage = lazy(routeImports['/games/asteroids']);
const MoonLanderPage = lazy(routeImports['/games/moon-lander']);
const NeonCheckersPage = lazy(routeImports['/games/checkers']);
const CyberPacPage = lazy(routeImports['/games/cyber-pac']);
const SpeedSolitairePage = lazy(routeImports['/games/solitaire']);
const NeonPinballPage = lazy(routeImports['/games/pinball']);

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

               {/* Phase 4 Routes (Canonical and Short Aliases) */}
               <Route path="/tools/pomodoro-timer" element={<PomodoroTimer />} />
               <Route path="/pomodoro" element={<PomodoroTimer />} />
               <Route path="/pomodorotimer" element={<PomodoroTimer />} />

               <Route path="/tools/event-countdown" element={<EventCountdown />} />
               <Route path="/countdown" element={<EventCountdown />} />
               <Route path="/eventcountdown" element={<EventCountdown />} />

               <Route path="/tools/subscription-tracker" element={<SubscriptionTracker />} />
               <Route path="/subscriptiontracker" element={<SubscriptionTracker />} />
               <Route path="/subscriptions" element={<SubscriptionTracker />} />

               <Route path="/tools/bulk-image-compressor" element={<BulkImageCompressor />} />
               <Route path="/bulkcompressor" element={<BulkImageCompressor />} />
               <Route path="/imagecompressor" element={<BulkImageCompressor />} />

               <Route path="/tools/pdf-signer" element={<PDFSigner />} />
               <Route path="/pdfsigner" element={<PDFSigner />} />
               <Route path="/signpdf" element={<PDFSigner />} />

               <Route path="/tools/image-to-text" element={<ImageToText />} />
               <Route path="/imagetotext" element={<ImageToText />} />
               <Route path="/ocr" element={<ImageToText />} />

               {/* Phase 5 Routes (Canonical and Short Aliases) */}
               <Route path="/tools/api-request-builder" element={<ApiRequestBuilder />} />
               <Route path="/apibuilder" element={<ApiRequestBuilder />} />
               <Route path="/apiclient" element={<ApiRequestBuilder />} />

               <Route path="/tools/pdf-compare" element={<PDFCompare />} />
               <Route path="/pdfcompare" element={<PDFCompare />} />
               <Route path="/diffpdf" element={<PDFCompare />} />

               <Route path="/tools/temporary-notes" element={<TemporaryNotes />} />
               <Route path="/tempnotes" element={<TemporaryNotes />} />
               <Route path="/privatenotes" element={<TemporaryNotes />} />

               <Route path="/tools/seo-analyzer" element={<SEOAnalyzer />} />
               <Route path="/seoanalyzer" element={<SEOAnalyzer />} />
               <Route path="/seochecker" element={<SEOAnalyzer />} />

               {/* Complete Catalog Routes (Canonical and Short Aliases) */}
               <Route path="/tools/meeting-cost-calculator" element={<MeetingCostCalculator />} />
               <Route path="/meetingcost" element={<MeetingCostCalculator />} />
               <Route path="/meetingtimer" element={<MeetingCostCalculator />} />

               <Route path="/tools/color-extractor" element={<ImageColorExtractor />} />
               <Route path="/colorextractor" element={<ImageColorExtractor />} />
               <Route path="/imagecolor" element={<ImageColorExtractor />} />

               <Route path="/tools/bulk-file-renamer" element={<BulkFileRenamer />} />
               <Route path="/bulkrenamer" element={<BulkFileRenamer />} />
               <Route path="/renamer" element={<BulkFileRenamer />} />

               <Route path="/tools/privacy-policy-generator" element={<PrivacyPolicyGenerator />} />
               <Route path="/privacypolicy" element={<PrivacyPolicyGenerator />} />
               <Route path="/privacygenerator" element={<PrivacyPolicyGenerator />} />

               <Route path="/tools/expense-tracker" element={<PersonalExpenseTracker />} />
               <Route path="/expensetracker" element={<PersonalExpenseTracker />} />
               <Route path="/expenses" element={<PersonalExpenseTracker />} />

               <Route path="/tools/habit-tracker" element={<HabitTracker />} />
               <Route path="/habittracker" element={<HabitTracker />} />
               <Route path="/habits" element={<HabitTracker />} />

               <Route path="/tools/typing-speed-test" element={<TypingSpeedTest />} />
               <Route path="/typingtest" element={<TypingSpeedTest />} />
               <Route path="/typingspeed" element={<TypingSpeedTest />} />

               <Route path="/tools/study-timetable" element={<StudyTimetableGenerator />} />
               <Route path="/studytimetable" element={<StudyTimetableGenerator />} />
               <Route path="/examtimetable" element={<StudyTimetableGenerator />} />

               <Route path="/tools/flashcard-generator" element={<FlashcardGenerator />} />
               <Route path="/flashcards" element={<FlashcardGenerator />} />
               <Route path="/flashcardgenerator" element={<FlashcardGenerator />} />

               <Route path="/tools/code-playground" element={<CodePlayground />} />
               <Route path="/codeplayground" element={<CodePlayground />} />
               <Route path="/playground" element={<CodePlayground />} />

               <Route path="/tools/qr-menu-generator" element={<QRMenuGenerator />} />
               <Route path="/qrmenu" element={<QRMenuGenerator />} />
               <Route path="/qrmenugenerator" element={<QRMenuGenerator />} />

               <Route path="/tools/background-remover" element={<BackgroundRemover />} />
               <Route path="/backgroundremover" element={<BackgroundRemover />} />
               <Route path="/removebg" element={<BackgroundRemover />} />

               <Route path="/tools/uptime-checker" element={<WebsiteUptimeChecker />} />
               <Route path="/uptimechecker" element={<WebsiteUptimeChecker />} />
               <Route path="/uptime" element={<WebsiteUptimeChecker />} />

               {/* Klique Arcade Routes (Canonical & Aliases) */}
               <Route path="/games" element={<GamesPage />} />
               <Route path="/arcade" element={<GamesPage />} />
               <Route path="/games/snake" element={<SnakePage />} />
               <Route path="/snake" element={<SnakePage />} />
               <Route path="/games/2048" element={<Game2048Page />} />
               <Route path="/2048" element={<Game2048Page />} />
               <Route path="/games/tic-tac-toe" element={<TicTacToePage />} />
               <Route path="/tictactoe" element={<TicTacToePage />} />
               <Route path="/games/memory-match" element={<MemoryMatchPage />} />
               <Route path="/memorymatch" element={<MemoryMatchPage />} />
               <Route path="/games/reaction-time" element={<ReactionTimePage />} />
               <Route path="/reactiontime" element={<ReactionTimePage />} />

               {/* New 10 Arcade Additions */}
               <Route path="/games/minesweeper" element={<MinesweeperPage />} />
               <Route path="/minesweeper" element={<MinesweeperPage />} />
               <Route path="/games/word-guess" element={<WordGuessPage />} />
               <Route path="/wordguess" element={<WordGuessPage />} />
               <Route path="/wordle" element={<WordGuessPage />} />
               <Route path="/games/brick-breaker" element={<BrickBreakerPage />} />
               <Route path="/brickbreaker" element={<BrickBreakerPage />} />
               <Route path="/breakout" element={<BrickBreakerPage />} />
               <Route path="/games/simon-says" element={<SimonSaysPage />} />
               <Route path="/simonsays" element={<SimonSaysPage />} />
               <Route path="/games/block-drop" element={<BlockDropPage />} />
               <Route path="/blockdrop" element={<BlockDropPage />} />
               <Route path="/tetris" element={<BlockDropPage />} />
               <Route path="/games/neon-dash" element={<NeonDashPage />} />
               <Route path="/neondash" element={<NeonDashPage />} />
               <Route path="/flappy" element={<NeonDashPage />} />
               <Route path="/games/pong" element={<RetroPongPage />} />
               <Route path="/pong" element={<RetroPongPage />} />
               <Route path="/games/sudoku" element={<SudokuPage />} />
               <Route path="/sudoku" element={<SudokuPage />} />
               <Route path="/games/color-flood" element={<ColorFloodPage />} />
               <Route path="/colorflood" element={<ColorFloodPage />} />
               <Route path="/flood" element={<ColorFloodPage />} />
               <Route path="/games/space-invaders" element={<SpaceInvadersPage />} />
               <Route path="/spaceinvaders" element={<SpaceInvadersPage />} />
               <Route path="/space" element={<SpaceInvadersPage />} />

               {/* 12 Expansion Arcade Routes */}
               <Route path="/games/tower-stacker" element={<TowerStackerPage />} />
               <Route path="/stacker" element={<TowerStackerPage />} />
               <Route path="/towerstacker" element={<TowerStackerPage />} />

               <Route path="/games/connect-four" element={<ConnectFourPage />} />
               <Route path="/connectfour" element={<ConnectFourPage />} />
               <Route path="/connect4" element={<ConnectFourPage />} />

               <Route path="/games/matrix-flip" element={<MatrixFlipPage />} />
               <Route path="/matrixflip" element={<MatrixFlipPage />} />
               <Route path="/lightsout" element={<MatrixFlipPage />} />

               <Route path="/games/cyber-runner" element={<CyberRunnerPage />} />
               <Route path="/cyberrunner" element={<CyberRunnerPage />} />
               <Route path="/runner" element={<CyberRunnerPage />} />

               <Route path="/games/type-storm" element={<TypeStormPage />} />
               <Route path="/typestorm" element={<TypeStormPage />} />

               <Route path="/games/neon-hopper" element={<NeonHopperPage />} />
               <Route path="/neonhopper" element={<NeonHopperPage />} />
               <Route path="/crossy" element={<NeonHopperPage />} />
               <Route path="/frogger" element={<NeonHopperPage />} />

               <Route path="/games/asteroids" element={<VectorAsteroidsPage />} />
               <Route path="/asteroids" element={<VectorAsteroidsPage />} />

               <Route path="/games/moon-lander" element={<MoonLanderPage />} />
               <Route path="/moonlander" element={<MoonLanderPage />} />
               <Route path="/lander" element={<MoonLanderPage />} />

               <Route path="/games/checkers" element={<NeonCheckersPage />} />
               <Route path="/checkers" element={<NeonCheckersPage />} />

               <Route path="/games/cyber-pac" element={<CyberPacPage />} />
               <Route path="/cyberpac" element={<CyberPacPage />} />
               <Route path="/pacman" element={<CyberPacPage />} />

               <Route path="/games/solitaire" element={<SpeedSolitairePage />} />
               <Route path="/solitaire" element={<SpeedSolitairePage />} />

               <Route path="/games/pinball" element={<NeonPinballPage />} />
               <Route path="/pinball" element={<NeonPinballPage />} />
            </Routes>
         </Suspense>
      </>
   );
}

export default App;
