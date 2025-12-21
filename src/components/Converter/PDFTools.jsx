import React, { useState } from 'react';
import {
   Upload,
   FileText,
   Download,
   X,
   CheckCircle,
   AlertCircle,
} from 'lucide-react';

export default function WordToPdf() {
   const [file, setFile] = useState(null);
   const [loading, setLoading] = useState(false);
   const [converted, setConverted] = useState(null);
   const [error, setError] = useState('');

   // Handle file select
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

   // Convert Word → PDF
   const convertFile = async () => {
      if (!file) return;

      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('file', file); // ✅ MUST BE "file"

      try {
         const response = await fetch('http://localhost:8001/api/convert', {
            method: 'POST',
            body: formData,
         });

         if (!response.ok) {
            throw new Error('Conversion failed');
         }

         const blob = await response.blob();
         const url = window.URL.createObjectURL(blob);

         setConverted({
            url,
            name: file.name.replace(/\.(doc|docx)$/i, '.pdf'),
         });
      } catch (err) {
         setError('Failed to convert file. Please try again.');
      } finally {
         setLoading(false);
      }
   };

   // Download file
   const downloadFile = () => {
      const a = document.createElement('a');
      a.href = converted.url;
      a.download = converted.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
   };

   // Reset
   const reset = () => {
      setFile(null);
      setConverted(null);
      setError('');
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white p-6">
         <div className="w-full max-w-xl bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-xl">
            {/* HEADER */}
            <div className="text-center mb-8">
               <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <FileText className="text-indigo-400 w-8 h-8" />
               </div>
               <h1 className="text-3xl font-bold">
                  Word to{' '}
                  <span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
                     PDF
                  </span>
               </h1>
               <p className="text-gray-400 mt-2">
                  Convert DOC / DOCX to PDF instantly
               </p>
            </div>

            {/* UPLOAD */}
            {!file && !converted && (
               <div className="border-2 border-dashed border-indigo-500/40 rounded-xl p-10 text-center bg-black/40 hover:border-indigo-400 transition">
                  <input
                     type="file"
                     accept=".doc,.docx"
                     onChange={handleFileChange}
                     id="fileInput"
                     className="hidden"
                  />
                  <label htmlFor="fileInput" className="cursor-pointer">
                     <Upload className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                     <p className="text-lg">
                        Drag & drop Word file or{' '}
                        <span className="text-indigo-400 font-semibold">
                           browse
                        </span>
                     </p>
                     <p className="text-sm text-gray-500 mt-1">
                        DOC & DOCX supported
                     </p>
                  </label>
               </div>
            )}

            {/* FILE PREVIEW */}
            {file && !converted && (
               <div className="space-y-6">
                  <div className="bg-black/40 border border-gray-700 rounded-xl p-4 flex justify-between items-center">
                     <div className="flex gap-3 items-center">
                        <FileText className="text-blue-400" />
                        <div>
                           <p className="font-medium">{file.name}</p>
                           <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                           </p>
                        </div>
                     </div>
                     <button onClick={reset}>
                        <X className="text-gray-400 hover:text-white" />
                     </button>
                  </div>

                  <button
                     onClick={convertFile}
                     disabled={loading}
                     className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                     {loading ? (
                        <>
                           <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                           Converting...
                        </>
                     ) : (
                        <>
                           <FileText size={18} />
                           Convert to PDF
                        </>
                     )}
                  </button>
               </div>
            )}

            {/* SUCCESS */}
            {converted && (
               <div className="space-y-6">
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex gap-3">
                     <CheckCircle className="text-green-400" />
                     <div>
                        <p className="font-semibold text-green-300">
                           Conversion successful
                        </p>
                        <p className="text-sm text-green-400">
                           Your PDF is ready
                        </p>
                     </div>
                  </div>

                  <div className="flex gap-3">
                     <button
                        onClick={downloadFile}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 font-semibold flex items-center justify-center gap-2">
                        <Download size={18} />
                        Download PDF
                     </button>
                     <button
                        onClick={reset}
                        className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition">
                        Convert Another
                     </button>
                  </div>
               </div>
            )}

            {/* ERROR */}
            {error && (
               <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-2">
                  <AlertCircle className="text-red-400" />
                  <p className="text-red-300 text-sm">{error}</p>
               </div>
            )}

            <p className="text-center text-xs text-gray-500 mt-8">
               Files are processed securely and deleted automatically
            </p>
         </div>
      </div>
   );
}
