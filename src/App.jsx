import EmojiCopy from './components/EmojiGenerator/EmojiCopy';
import FancyFontGenerator from './components/FanceyFont/FanceyFontGenerarot';
import HeroPage from './components/HeroPage';
import { ToastContainer, Zoom } from 'react-toastify';
import { Routes, Route } from 'react-router-dom';
import CoolSymbol from './components/CoolSymbol/CoolSymbol';
import HashtagGenerator from './components/Hashtag/HashtagGenerator';
import BioGenerator from './components/BioGenerator/BioGenerator';
import WordCounter from './components/WordCounter/WordCounter';
import Paraphrase from './components/Paraphrase/Paraphrase';
import UsernameGenerator from './components/UserName/UserName';
import PDFTools from './components/Converter/PDFTools';
import TimeZone from './components/TimeZone/TimeZone';

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
            {/* <Route path="/pdftools" element={<PDFTools />} /> */}
         </Routes>
      </>
   );
}

export default App;
