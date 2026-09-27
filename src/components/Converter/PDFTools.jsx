import React, { useState } from 'react';
import {
   Upload,
   FileText,
   Download,
   X,
   CheckCircle,
   AlertCircle,
} from 'lucide-react';
import { ColumnLines } from '@/components/ui/download-with-columnlines-utils/columnlines';
import Navbar from '../Navbar';
import { FaBars } from 'react-icons/fa';

export default function WordToPdf() {
   const [file, setFile] = useState(null);
   const [loading, setLoading] = useState(false);
   const [converted, setConverted] = useState(null);
   const [error, setError] = useState('');
   const [sidebarOpen, setSidebarOpen] = useState(false);

   const handleFileChange = (e) => {
      const selected = e.target.files[0];
      if (!selected) return;
      if (!selected.name.match(/\.(doc|docx)$/i)) {
         setError('Only Word files (.doc, .docx) are supported');
         return;
      }
      setFile(selected);
      setError('');
      setConverted(null);
   };

   const convertFile = async () => {
      if (!file) return;
      setLoading(true);
      setError('');
      const formData = new FormData();
      formData.append('file', file);

      try {
         const response = await fetch('http://localhost:8001/api/convert', {
            method: 'POST',
            body: formData,
         });

         if (!response.ok) throw new Error('Conversion failed');
         const blob = await response.blob();
         setConverted({
            url: window.URL.createObjectURL(blob),
            name: file.name.replace(/\.(doc|docx)$/i, '.pdf'),
         });
      } catch (err) {
         setError('Failed to convert file. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   const downloadFile = () => {
      const a = document.createElement('a');
      a.href = converted.url;
      a.download = converted.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
   };

   const reset = () => {
      setFile(null);
      setConverted(null);
      setError('');
   };

   return (
      <ColumnLines
         columnWidth={80}
         columnCount={14}
         radialFadeStart={15}
         radialFadeEnd={90}
         className="relative min-h-[100dvh] flex items-center justify-center w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-auto px-4 py-20 md:px-10">
         <div
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="fixed top-6 left-6 z-40 p-3 rounded-xl bg-[#18181b] border border-zinc-800 hover:bg-zinc-800 transition shadow-sm cursor-pointer">
            <FaBars size={20} className="text-zinc-400" />
         </div>

         <Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMobile={window.innerWidth < 768}
         />

         <div className="w-full max-w-xl bg-[#121214] border border-zinc-800/80 rounded-2xl p-8 sm:p-10 shadow-xl relative z-20">
            <div className="text-center mb-8">
               <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#18181b] border border-zinc-800 flex items-center justify-center">
                  <FileText className="text-zinc-300 w-8 h-8" />
               </div>
               <h1 className="text-2xl sm:text-3xl font-medium tracking-tight mb-2">
                  Word to PDF
               </h1>
               <p className="text-zinc-500 text-sm font-medium">
                  Convert DOC / DOCX to PDF instantly
               </p>
            </div>

            {!file && !converted && (
               <div className="border-2 border-dashed border-zinc-700/60 rounded-xl p-10 text-center bg-[#0f0f11] hover:border-zinc-500 transition-colors">
                  <input
                     type="file"
                     accept=".doc,.docx"
                     onChange={handleFileChange}
                     id="fileInput"
                     className="hidden"
                  />
                  <label
                     htmlFor="fileInput"
                     className="cursor-pointer flex flex-col items-center">
                     <Upload className="w-10 h-10 text-zinc-500 mb-4" />
                     <p className="text-base font-medium text-zinc-300">
                        Drag & drop file or{' '}
                        <span className="text-zinc-100 font-semibold underline underline-offset-4 decoration-zinc-600">
                           browse
                        </span>
                     </p>
                     <p className="text-sm text-zinc-600 mt-2">
                        DOC & DOCX supported
                     </p>
                  </label>
               </div>
            )}

            {file && !converted && (
               <div className="space-y-6">
                  <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-4 flex justify-between items-center">
                     <div className="flex gap-4 items-center">
                        <div className="p-2.5 bg-zinc-800/50 rounded-lg">
                           <FileText className="text-zinc-300 w-5 h-5" />
                        </div>
                        <div>
                           <p className="font-medium text-sm text-zinc-200 truncate max-w-[200px] sm:max-w-[250px]">
                              {file.name}
                           </p>
                           <p className="text-xs font-medium text-zinc-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                           </p>
                        </div>
                     </div>
                     <button
                        onClick={reset}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                        <X className="text-zinc-500 hover:text-zinc-300 w-5 h-5" />
                     </button>
                  </div>

                  <button
                     onClick={convertFile}
                     disabled={loading}
                     className="w-full py-3.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                     {loading ? (
                        <>
                           <span className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                           Processing...
                        </>
                     ) : (
                        <>Convert to PDF</>
                     )}
                  </button>
               </div>
            )}

            {converted && (
               <div className="space-y-6">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5 flex gap-4 items-start">
                     <CheckCircle className="text-green-500 w-5 h-5 shrink-0 mt-0.5" />
                     <div>
                        <p className="font-medium text-green-400 mb-1">
                           Conversion successful
                        </p>
                        <p className="text-sm font-medium text-green-500/70">
                           Your document is ready to download.
                        </p>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                     <button
                        onClick={downloadFile}
                        className="flex-1 py-3.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 font-semibold flex items-center justify-center gap-2 transition-colors">
                        <Download size={18} /> Download PDF
                     </button>
                     <button
                        onClick={reset}
                        className="flex-1 py-3.5 rounded-xl bg-[#18181b] border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-semibold transition-colors">
                        Convert Another
                     </button>
                  </div>
               </div>
            )}

            {error && (
               <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 items-start">
                  <AlertCircle className="text-red-400 w-5 h-5 shrink-0" />
                  <p className="text-red-400 text-sm font-medium">{error}</p>
               </div>
            )}
         </div>
      </ColumnLines>
   );
}
