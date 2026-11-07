/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   Send,
   Copy,
   Download,
   Trash2,
   Sparkles,
   ChevronDown,
   HelpCircle,
   CheckCircle2,
   Clock,
   Layers,
   Terminal,
   Code2,
   FileJson,
   Plus,
   AlertCircle,
   RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import {
   HTTP_METHODS,
   SAMPLE_API_PRESETS,
   buildUrlWithParams,
   generateCurlCommand,
   executeApiRequest,
} from '../../../lib/calculations/apiBuilder';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*  FAQS                                                                      */
/* -------------------------------------------------------------------------- */

const FAQS = [
   {
      question: 'How does client-side API testing work with CORS?',
      answer:
         'Requests are executed directly by your browser via fetch(). If the target API endpoint does not permit cross-origin requests by returning appropriate Access-Control-Allow-Origin headers, your browser will block the response due to CORS security policies.',
   },
   {
      question: 'Are my private API keys or auth tokens stored remotely?',
      answer:
         'Never. All request configs, bearer tokens, headers, and payloads remain strictly in your browser memory and localStorage. No backend proxy intercepts your traffic.',
   },
   {
      question: 'Can I generate an executable cURL command to run in terminal?',
      answer:
         'Yes! Click the "cURL" tab to view and copy an exact terminal command including your query params, headers, and request body.',
   },
   {
      question: 'What HTTP methods are supported?',
      answer:
         'GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS are all supported natively.',
   },
];

export default function ApiRequestBuilder() {
   // Request states
   const [method, setMethod] = useState('GET');
   const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/users');
   const [activeTab, setActiveTab] = useState('params'); // 'params' | 'headers' | 'body' | 'curl'

   // Params & Headers rows
   const [queryParams, setQueryParams] = useState([{ key: 'limit', value: '5', enabled: true }]);
   const [headers, setHeaders] = useState([
      { key: 'Accept', value: 'application/json', enabled: true },
   ]);
   const [body, setBody] = useState('');

   // Response states
   const [isLoading, setIsLoading] = useState(false);
   const [response, setResponse] = useState(null);
   const [responseError, setResponseError] = useState(null);
   const [responseTab, setResponseTab] = useState('body'); // 'body' | 'headers'

   // Toast
   const [toast, setToast] = useState({ visible: false, message: '' });
   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   const [openFaq, setOpenFaq] = useState(null);

   // Load Preset
   const handleLoadPreset = (preset) => {
      setMethod(preset.method);
      setUrl(preset.url);
      setHeaders(preset.headers || []);
      setQueryParams(preset.queryParams || []);
      setBody(preset.body || '');
      setResponse(null);
      setResponseError(null);
      showToast(`Loaded preset: ${preset.name}`);
   };

   // Add Param row
   const addParamRow = () => {
      setQueryParams((prev) => [...prev, { key: '', value: '', enabled: true }]);
   };
   const removeParamRow = (idx) => {
      setQueryParams((prev) => prev.filter((_, i) => i !== idx));
   };

   // Add Header row
   const addHeaderRow = () => {
      setHeaders((prev) => [...prev, { key: '', value: '', enabled: true }]);
   };
   const removeHeaderRow = (idx) => {
      setHeaders((prev) => prev.filter((_, i) => i !== idx));
   };

   // Send Request
   const handleSendRequest = async () => {
      if (!url.trim()) {
         showToast('Please specify a destination URL.');
         return;
      }

      setIsLoading(true);
      setResponse(null);
      setResponseError(null);

      try {
         const res = await executeApiRequest({
            url: url.trim(),
            method,
            headers,
            queryParams,
            body,
         });
         setResponse(res);
         showToast(`Received ${res.status} ${res.statusText} (${res.latencyMs}ms)`);
      } catch (err) {
         setResponseError(err.message);
         showToast('Request failed. Check CORS or URL.');
      } finally {
         setIsLoading(false);
      }
   };

   // Generated cURL
   const curlSnippet = useMemo(() => {
      return generateCurlCommand({ url, method, headers, queryParams, body });
   }, [url, method, headers, queryParams, body]);

   // Copy Response
   const handleCopyResponse = () => {
      if (!response?.data) return;
      navigator.clipboard.writeText(response.data);
      showToast('Response data copied to clipboard!');
   };

   // Copy cURL
   const handleCopyCurl = () => {
      navigator.clipboard.writeText(curlSnippet);
      showToast('cURL command copied!');
   };

   const relatedTools = useMemo(() => getRelatedTools('api-request-builder', 4), []);

   return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-emerald-500/30 selection:text-emerald-300 relative overflow-hidden font-sans">
         {/* Static ambient backdrop matching JsonFormatter */}
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.12),transparent_55%)]"
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         <SEO
            title="API Request Builder & Client - Online REST & HTTP Tester | Klique"
            description="Build, inspect, and execute HTTP requests client-side. Test REST endpoints, configure headers, parameters, and payloads, and generate cURL commands."
            keywords="api request builder, rest client, online postman, test api, http client, test endpoint, curl generator, klique"
            canonicalUrl="https://klique.netlify.app/tools/api-request-builder"
         />

         {/* Toast Notification */}
         <AnimatePresence>
            {toast.visible && (
               <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-2 rounded-full border border-[#daf4aa]/30 bg-zinc-900/90 px-4 py-2 text-xs font-semibold text-[#daf4aa] shadow-2xl backdrop-blur-md">
                  <Sparkles size={14} className="animate-spin text-[#daf4aa]" />
                  <span>{toast.message}</span>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Header / Navbar */}
         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Title Section */}
            <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                     <Code2 size={14} className="text-[#daf4aa]" />
                     <span>Developer Suite</span>
                     <span className="text-zinc-600">•</span>
                     <span className="text-[#daf4aa]">100% Client-Side Privacy</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
                     API Request <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#daf4aa] via-lime-300 to-emerald-400">Builder</span>
                  </h1>
                  <p className="text-zinc-400 text-sm max-w-xl">
                     Execute, debug, and benchmark HTTP REST requests directly in your browser. Inspect status,
                     latency, headers, and export cURL.
                  </p>
               </motion.div>

               {/* Quick Presets Menu */}
               <div className="flex items-center gap-2">
                  {SAMPLE_API_PRESETS.map((p) => (
                     <button
                        key={p.id}
                        onClick={() => handleLoadPreset(p)}
                        className="px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-xs font-medium text-zinc-300 hover:text-white hover:border-[#daf4aa]/40 hover:text-[#daf4aa] transition-all backdrop-blur-md cursor-pointer">
                        {p.name.split(' ')[0]} {p.name.split(' ')[1]}
                     </button>
                  ))}
               </div>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
               <Link to="/" className="hover:text-zinc-200 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category" className="hover:text-zinc-200 transition-colors">Developer & Code</Link>
               <span>/</span>
               <span className="text-[#daf4aa]">API Request Builder</span>
            </div>

            {/* URL Input Bar */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 backdrop-blur-xl shadow-xl mb-6">
               <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Method Selector */}
                  <select
                     value={method}
                     onChange={(e) => setMethod(e.target.value)}
                     className="w-full sm:w-32 rounded-xl border border-zinc-800 bg-zinc-950 font-mono font-bold text-xs py-3 px-3.5 text-[#daf4aa] focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40 focus:outline-none transition-all cursor-pointer">
                     {HTTP_METHODS.map((m) => (
                        <option key={m} value={m}>
                           {m}
                        </option>
                     ))}
                  </select>

                  {/* URL Input */}
                  <input
                     type="text"
                     value={url}
                     onChange={(e) => setUrl(e.target.value)}
                     placeholder="https://api.example.com/v1/resource"
                     className="w-full flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs text-white placeholder-zinc-500 font-mono focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40 focus:outline-none transition-all"
                  />

                  {/* Send Button */}
                  <button
                     onClick={handleSendRequest}
                     disabled={isLoading}
                     className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] disabled:opacity-50 px-6 py-3 text-xs font-bold text-zinc-950 transition-all shadow-[0_0_15px_rgba(218,244,170,0.3)] shrink-0 cursor-pointer">
                     {isLoading ? (
                        <>
                           <RefreshCw size={15} className="animate-spin" />
                           <span>Sending...</span>
                        </>
                     ) : (
                        <>
                           <Send size={15} />
                           <span>Send Request</span>
                        </>
                     )}
                  </button>
               </div>
            </div>

            {/* Request Configuration Tabs & Response Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">
               {/* Left Column: Request Configuration */}
               <div className="lg:col-span-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl flex flex-col min-h-[460px]">
                  {/* Sub-tabs header */}
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                     <div className="flex items-center gap-1">
                        <button
                           onClick={() => setActiveTab('params')}
                           className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              activeTab === 'params'
                                 ? 'bg-[#daf4aa] text-zinc-950 font-bold shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                                 : 'text-zinc-400 hover:text-white'
                           }`}>
                           Query Params ({queryParams.filter((p) => p.enabled && p.key).length})
                        </button>

                        <button
                           onClick={() => setActiveTab('headers')}
                           className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              activeTab === 'headers'
                                 ? 'bg-[#daf4aa] text-zinc-950 font-bold shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                                 : 'text-zinc-400 hover:text-white'
                           }`}>
                           Headers ({headers.filter((h) => h.enabled && h.key).length})
                        </button>

                        <button
                           onClick={() => setActiveTab('body')}
                           className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              activeTab === 'body'
                                 ? 'bg-[#daf4aa] text-zinc-950 font-bold shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                                 : 'text-zinc-400 hover:text-white'
                           }`}>
                           Body
                        </button>

                        <button
                           onClick={() => setActiveTab('curl')}
                           className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              activeTab === 'curl'
                                 ? 'bg-[#daf4aa] text-zinc-950 font-bold shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                                 : 'text-zinc-400 hover:text-white'
                           }`}>
                           cURL
                        </button>
                     </div>
                  </div>

                  {/* Tab 1: Query Params */}
                  {activeTab === 'params' && (
                     <div className="space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                           {queryParams.map((param, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                 <input
                                    type="checkbox"
                                    checked={param.enabled}
                                    onChange={(e) => {
                                       const updated = [...queryParams];
                                       updated[idx].enabled = e.target.checked;
                                       setQueryParams(updated);
                                    }}
                                    className="accent-emerald-500 cursor-pointer"
                                 />
                                 <input
                                    type="text"
                                    placeholder="Parameter Key"
                                    value={param.key}
                                    onChange={(e) => {
                                       const updated = [...queryParams];
                                       updated[idx].key = e.target.value;
                                       setQueryParams(updated);
                                    }}
                                    className="w-1/2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-white font-mono placeholder-zinc-600 focus:outline-none"
                                 />
                                 <input
                                    type="text"
                                    placeholder="Value"
                                    value={param.value}
                                    onChange={(e) => {
                                       const updated = [...queryParams];
                                       updated[idx].value = e.target.value;
                                       setQueryParams(updated);
                                    }}
                                    className="w-1/2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-white font-mono placeholder-zinc-600 focus:outline-none"
                                 />
                                 <button
                                    onClick={() => removeParamRow(idx)}
                                    className="text-zinc-600 hover:text-rose-400 p-1">
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           ))}
                        </div>

                        <button
                           onClick={addParamRow}
                           className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold pt-2">
                           <Plus size={14} />
                           <span>Add Parameter</span>
                        </button>
                     </div>
                  )}

                  {/* Tab 2: Headers */}
                  {activeTab === 'headers' && (
                     <div className="space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                           {headers.map((h, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs">
                                 <input
                                    type="checkbox"
                                    checked={h.enabled}
                                    onChange={(e) => {
                                       const updated = [...headers];
                                       updated[idx].enabled = e.target.checked;
                                       setHeaders(updated);
                                    }}
                                    className="accent-emerald-500 cursor-pointer"
                                 />
                                 <input
                                    type="text"
                                    placeholder="Header Name"
                                    value={h.key}
                                    onChange={(e) => {
                                       const updated = [...headers];
                                       updated[idx].key = e.target.value;
                                       setHeaders(updated);
                                    }}
                                    className="w-1/2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-white font-mono placeholder-zinc-600 focus:outline-none"
                                 />
                                 <input
                                    type="text"
                                    placeholder="Header Value"
                                    value={h.value}
                                    onChange={(e) => {
                                       const updated = [...headers];
                                       updated[idx].value = e.target.value;
                                       setHeaders(updated);
                                    }}
                                    className="w-1/2 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-white font-mono placeholder-zinc-600 focus:outline-none"
                                 />
                                 <button
                                    onClick={() => removeHeaderRow(idx)}
                                    className="text-zinc-600 hover:text-rose-400 p-1">
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           ))}
                        </div>

                        <button
                           onClick={addHeaderRow}
                           className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-semibold pt-2">
                           <Plus size={14} />
                           <span>Add Header</span>
                        </button>
                     </div>
                  )}

                  {/* Tab 3: Request Body */}
                  {activeTab === 'body' && (
                     <div className="flex-1 flex flex-col">
                        <textarea
                           value={body}
                           onChange={(e) => setBody(e.target.value)}
                           placeholder='{\n  "key": "value"\n}'
                           className="w-full flex-1 min-h-[220px] rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
                        />
                     </div>
                  )}

                  {/* Tab 4: cURL */}
                  {activeTab === 'curl' && (
                     <div className="flex-1 flex flex-col justify-between">
                        <pre className="w-full flex-1 rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                           {curlSnippet}
                        </pre>
                        <button
                           onClick={handleCopyCurl}
                           className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white transition-all">
                           <Copy size={13} />
                           <span>Copy cURL Command</span>
                        </button>
                     </div>
                  )}
               </div>

               {/* Right Column: Response Viewer */}
               <div className="lg:col-span-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-xl shadow-xl flex flex-col min-h-[460px]">
                  {/* Response Header Status */}
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
                     <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                           Response
                        </span>

                        {response && (
                           <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${
                                 response.success
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                              {response.status} {response.statusText}
                           </span>
                        )}
                     </div>

                     {response && (
                        <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                           <span>{response.latencyMs} ms</span>
                           <span>&bull;</span>
                           <span>{(response.bodySizeBytes / 1024).toFixed(2)} KB</span>
                           <button
                              onClick={handleCopyResponse}
                              className="p-1 rounded text-zinc-400 hover:text-white transition-all ml-1"
                              title="Copy Response">
                              <Copy size={14} />
                           </button>
                        </div>
                     )}
                  </div>

                  {/* Body Content */}
                  {isLoading ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                        <RefreshCw size={28} className="animate-spin text-emerald-400 mb-3" />
                        <span className="text-xs">Waiting for response...</span>
                     </div>
                  ) : responseError ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-rose-400 p-6 text-center">
                        <AlertCircle size={32} className="mb-2 text-rose-500" />
                        <span className="text-xs font-semibold leading-relaxed max-w-sm">
                           {responseError}
                        </span>
                     </div>
                  ) : response ? (
                     <div className="flex-1 flex flex-col">
                        <pre className="w-full flex-1 max-h-[340px] rounded-xl border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs text-zinc-200 overflow-auto leading-relaxed">
                           {response.data}
                        </pre>
                     </div>
                  ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 text-center p-8">
                        <Send size={32} className="mx-auto mb-2 text-zinc-600" />
                        <p className="text-xs">
                           Enter a URL and click "Send Request" to inspect the JSON response and headers.
                        </p>
                     </div>
                  )}
               </div>
            </div>

            {/* FAQs Accordion */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-xl mb-12">
               <div className="flex items-center gap-2 mb-6">
                  <HelpCircle size={18} className="text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">Frequently Asked Questions</h2>
               </div>
               <div className="space-y-4">
                  {FAQS.map((faq, idx) => {
                     const isOpen = openFaq === idx;
                     return (
                        <div
                           key={idx}
                           className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 overflow-hidden transition-all">
                           <button
                              onClick={() => setOpenFaq(isOpen ? null : idx)}
                              className="w-full flex items-center justify-between p-4 text-left text-xs font-semibold text-zinc-200 hover:text-white transition-colors">
                              <span>{faq.question}</span>
                              <ChevronDown
                                 size={16}
                                 className={`transform transition-transform text-zinc-500 ${
                                    isOpen ? 'rotate-180 text-emerald-400' : ''
                                 }`}
                              />
                           </button>
                           {isOpen && (
                              <div className="px-4 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/40 pt-3">
                                 {faq.answer}
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
               <div className="mt-8">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                     <Sparkles size={16} className="text-emerald-400" />
                     <span>Related Developer Tools</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                     {relatedTools.map((tool) => (
                        <Link
                           key={tool.id}
                           to={tool.slug}
                           onMouseEnter={() => preloadRoute(tool.slug)}
                           className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-800/40 backdrop-blur-md">
                           <div className="text-xs font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                              {tool.name}
                           </div>
                           <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                              {tool.description}
                           </p>
                        </Link>
                     ))}
                  </div>
               </div>
            )}
         </main>
      </div>
   );
}

