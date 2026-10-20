import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
   Upload,
   Download,
   Copy,
   ZoomIn,
   ZoomOut,
   Maximize,
   RefreshCw,
   Settings,
   Palette,
   Code,
   Image as ImageIcon,
   X,
   CheckCircle,
   AlertCircle,
   FileText,
   Sparkles,
   Trash2,
   Edit3,
   Eye,
   LayoutGrid,
   Braces,
} from 'lucide-react';
import Navbar from '../Navbar';
import SEO from '../SEO';
import { AnimatePresence, motion } from 'motion/react';
import { Uploader, SelectPicker, Toggle, Checkbox, Input } from '../ui/CustomControl';
import { optimize } from 'svgo';

// Sample SVG for testing
const SAMPLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="#3b82f6" stroke="#1e40af" stroke-width="2"/>
  <rect x="30" y="30" width="40" height="40" fill="#ef4444" rx="5"/>
  <path d="M 20 80 L 50 20 L 80 80 Z" fill="#10b981" stroke="#059669" stroke-width="2"/>
</svg>`;

const BACKGROUND_OPTIONS = [
   { label: 'Checkerboard', value: 'checkerboard' },
   { label: 'White', value: 'white' },
   { label: 'Black', value: 'black' },
   { label: 'Light Gray', value: 'light-gray' },
   { label: 'Dark Gray', value: 'dark-gray' },
   { label: 'Custom', value: 'custom' },
];

const OUTPUT_TABS = [
   { label: 'SVG', value: 'svg', icon: FileText },
   { label: 'CSS', value: 'css', icon: Code },
   { label: 'Base64', value: 'base64', icon: ImageIcon },
   { label: 'URL', value: 'url', icon: Code },
   { label: 'React JSX', value: 'jsx', icon: Code },
   { label: 'React TS', value: 'tsx', icon: Code },
   { label: 'PNG', value: 'png', icon: ImageIcon },
   { label: 'JPEG', value: 'jpeg', icon: ImageIcon },
   { label: 'WebP', value: 'webp', icon: ImageIcon },
];

const SCALE_PRESETS = [
   { label: '1x', value: 1 },
   { label: '2x', value: 2 },
   { label: '3x', value: 3 },
   { label: '4x', value: 4 },
];

export default function SVGConverter() {
   // SVG State
   const [svgContent, setSvgContent] = useState('');
   const [optimizedSvg, setOptimizedSvg] = useState('');
   const [fileName, setFileName] = useState('');
   const [fileSize, setFileSize] = useState(0);
   const [optimizedSize, setOptimizedSize] = useState(0);

   // UI State
   const [activeTab, setActiveTab] = useState('svg');
   const [zoom, setZoom] = useState(1);
   const [background, setBackground] = useState('checkerboard');
   const [customBgColor, setCustomBgColor] = useState('#ffffff');
   const [isDragging, setIsDragging] = useState(false);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');
   const [loading, setLoading] = useState(false);

   // Settings State
   const [optimizeEnabled, setOptimizeEnabled] = useState(true);
   const [removeComments, setRemoveComments] = useState(true);
   const [removeMetadata, setRemoveMetadata] = useState(true);
   const [precision, setPrecision] = useState(3);

   // Export Settings
   const [exportScale, setExportScale] = useState(1);
   const [exportWidth, setExportWidth] = useState(512);
   const [exportHeight, setExportHeight] = useState(512);
   const [exportQuality, setExportQuality] = useState(0.92);
   const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
   const [exportBgColor, setExportBgColor] = useState('#ffffff');

   // Color Editor State
   const [extractedColors, setExtractedColors] = useState([]);
   const [selectedColor, setSelectedColor] = useState('');
   const [replacementColor, setReplacementColor] = useState('');

   // Intelligence Studio State
   const [diagnostics, setDiagnostics] = useState([]);
   const [qualityScore, setQualityScore] = useState(0);

   const svgPreviewRef = useRef(null);

   // Clear messages after delay
   useEffect(() => {
      if (error) {
         const timer = setTimeout(() => setError(''), 5000);
         return () => clearTimeout(timer);
      }
   }, [error]);

   useEffect(() => {
      if (success) {
         const timer = setTimeout(() => setSuccess(''), 3000);
         return () => clearTimeout(timer);
      }
   }, [success]);

   // Validate SVG
   const validateSVG = (content) => {
      if (!content || !content.trim()) {
         throw new Error('SVG content is empty');
      }

      const parser = new DOMParser();
      const parsedDoc = parser.parseFromString(content, 'image/svg+xml');

      const parseError = parsedDoc.querySelector('parsererror');
      if (parseError) {
         throw new Error('Invalid SVG format: ' + parseError.textContent);
      }

      const svgElement = parsedDoc.querySelector('svg');
      if (!svgElement) {
         throw new Error('No SVG element found in the content');
      }

      return { doc: parsedDoc, svgElement };
   };

   // Extract SVG info
   const getSVGInfo = (svgElement) => {
      const width = svgElement.getAttribute('width');
      const height = svgElement.getAttribute('height');
      const viewBox = svgElement.getAttribute('viewBox');
      const paths = svgElement.querySelectorAll('path').length;
      const groups = svgElement.querySelectorAll('g').length;
      const shapes = svgElement.querySelectorAll('circle, rect, ellipse, line, polygon, polyline').length;

      return { width, height, viewBox, paths, groups, shapes };
   };

   // Extract colors from SVG
   const extractColors = (svgElement) => {
      const colors = new Set();
      const elements = svgElement.querySelectorAll('*');

      elements.forEach((el) => {
         ['fill', 'stroke'].forEach((attr) => {
            const value = el.getAttribute(attr);
            if (value && value !== 'none' && value !== 'currentColor') {
               colors.add(value);
            }
         });
      });

      return Array.from(colors);
   };

   // Run diagnostics
   const runDiagnostics = useCallback((svgElement, info, colors) => {
      const issues = [];
      let score = 100;

      if (!info.viewBox) {
         issues.push({
            severity: 'warning',
            message: 'Missing viewBox attribute - may affect responsive scaling',
         });
         score -= 10;
      }

      if (info.width && info.height) {
         issues.push({
            severity: 'info',
            message: 'Explicit width/height may limit responsive usage',
         });
         score -= 5;
      }

      if (colors.length > 10) {
         issues.push({
            severity: 'info',
            message: `High color count (${colors.length}) - consider reducing`,
         });
         score -= 5;
      }

      if (!svgElement.querySelector('title')) {
         issues.push({
            severity: 'warning',
            message: 'Missing accessibility title element',
         });
         score -= 10;
      }

      setDiagnostics(issues);
      setQualityScore(Math.max(0, score));
   }, []);

   // Load SVG content
   const loadSVG = useCallback((content, name = '') => {
      try {
         setError('');
         const { svgElement } = validateSVG(content);
         const info = getSVGInfo(svgElement);
         const colors = extractColors(svgElement);

         setSvgContent(content);
         setFileName(name || 'image.svg');
         setFileSize(new Blob([content]).size);
         setExtractedColors(colors);
         setZoom(1);

         // Run diagnostics
         runDiagnostics(svgElement, info, colors);

         setSuccess('SVG loaded successfully');
      } catch (error) {
         setError(error.message);
         console.error('SVG loading error:', error);
      }
   }, [runDiagnostics]);

   // Handle file upload
   const handleFileUpload = (files) => {
      if (files && files.length > 0) {
         const file = files[0].blobFile || files[0];
         if (!file.name.endsWith('.svg')) {
            setError('Please upload an SVG file');
            return;
         }

         const reader = new FileReader();
         reader.onload = (e) => {
            loadSVG(e.target.result, file.name);
         };
         reader.onerror = () => setError('Failed to read file');
         reader.readAsText(file);
      }
   };

   // Handle paste
   const handlePaste = (e) => {
      const text = e.clipboardData.getData('text');
      if (text.includes('<svg')) {
         loadSVG(text);
      }
   };

   // Optimize SVG
   const optimizeSVG = useCallback(() => {
      if (!svgContent) return;

      try {
         setLoading(true);
         const result = optimize(svgContent, {
            plugins: [
               {
                  name: 'preset-default',
                  params: {
                     overrides: {
                        removeComments: removeComments,
                        removeMetadata: removeMetadata,
                        precision: precision,
                     },
                  },
               },
            ],
         });

         setOptimizedSvg(result.data);
         setOptimizedSize(new Blob([result.data]).size);
         setSuccess('SVG optimized successfully');
      } catch (error) {
         setError('Optimization failed: ' + error.message);
      } finally {
         setLoading(false);
      }
   }, [svgContent, removeComments, removeMetadata, precision]);

   // Auto-optimize when settings change
   useEffect(() => {
      if (optimizeEnabled && svgContent) {
         const timer = setTimeout(() => optimizeSVG(), 500);
         return () => clearTimeout(timer);
      }
   }, [optimizeEnabled, removeComments, removeMetadata, precision, svgContent, optimizeSVG]);

   // Copy to clipboard
   const copyToClipboard = async (text) => {
      try {
         await navigator.clipboard.writeText(text);
         setSuccess('Copied to clipboard');
      } catch {
         setError('Failed to copy to clipboard');
      }
   };

   // Download file
   const downloadFile = (content, mimeType, extension) => {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName.replace('.svg', '') + extension;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccess('File downloaded');
   };

   // Generate output based on active tab
   const generateOutput = () => {
      const content = optimizedSvg || svgContent;
      if (!content) return '';

      switch (activeTab) {
         case 'svg':
            return content;

         case 'css': {
            const encoded = encodeURIComponent(content)
               .replace(/'/g, '%27')
               .replace(/"/g, '%22');
            return `.icon {
   background-image: url("data:image/svg+xml,${encoded}");
   background-repeat: no-repeat;
   background-position: center;
   background-size: contain;
}`;
         }

         case 'base64': {
            const base64 = btoa(unescape(encodeURIComponent(content)));
            return `data:image/svg+xml;base64,${base64}`;
         }

         case 'url': {
            return `data:image/svg+xml,${encodeURIComponent(content)}`;
         }

         case 'jsx': {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'image/svg+xml');
            const svgElement = doc.querySelector('svg');

            const props = {};
            Array.from(svgElement.attributes).forEach((attr) => {
               const name = attr.name
                  .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
                  .replace(/^(class|for)$/i, 'svg$1');
               props[name] = attr.value;
            });

            const innerHTML = svgElement.innerHTML
               .replace(/class=/g, 'className=')
               .replace(/stroke-width=/g, 'strokeWidth=')
               .replace(/fill-rule=/g, 'fillRule=')
               .replace(/clip-path=/g, 'clipPath=')
               .replace(/stop-color=/g, 'stopColor=');

            return `export default function SvgIcon(props) {
   return (
      <svg {...props} ${Object.entries(props)
                  .map(([k, v]) => `${k}="${v}"`)
                  .join(' ')}>
         ${innerHTML}
      </svg>
   );
}`;
         }

         case 'tsx': {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, 'image/svg+xml');
            const svgElement = doc.querySelector('svg');

            const props = {};
            Array.from(svgElement.attributes).forEach((attr) => {
               const name = attr.name
                  .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
                  .replace(/^(class|for)$/i, 'svg$1');
               props[name] = attr.value;
            });

            const innerHTML = svgElement.innerHTML
               .replace(/class=/g, 'className=')
               .replace(/stroke-width=/g, 'strokeWidth=')
               .replace(/fill-rule=/g, 'fillRule=')
               .replace(/clip-path=/g, 'clipPath=')
               .replace(/stop-color=/g, 'stopColor=');

            return `import React from 'react';

interface SvgIconProps extends React.SVGAttributes<SVGElement> {
   ${Object.keys(props).map((k) => `${k}?: string`).join('\n   ')}
}

export default function SvgIcon(props: SvgIconProps) {
   return (
      <svg {...props} ${Object.entries(props)
                  .map(([k, v]) => `${k}="${v}"`)
                  .join(' ')}>
         ${innerHTML}
      </svg>
   );
}`;
         }

         default:
            return content;
      }
   };

   // Export to raster image
   const exportToRaster = async (format) => {
      if (!svgContent) return;

      try {
         setLoading(true);

         const parser = new DOMParser();
         const doc = parser.parseFromString(svgContent, 'image/svg+xml');
         const svgElement = doc.querySelector('svg');

         // Set dimensions
         svgElement.setAttribute('width', exportWidth * exportScale);
         svgElement.setAttribute('height', exportHeight * exportScale);

         const svgString = new XMLSerializer().serializeToString(doc);
         const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
         const url = URL.createObjectURL(svgBlob);

         const img = new Image();
         img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = exportWidth * exportScale;
            canvas.height = exportHeight * exportScale;
            const ctx = canvas.getContext('2d');

            if (format === 'jpeg') {
               ctx.fillStyle = exportBgColor;
               ctx.fillRect(0, 0, canvas.width, canvas.height);
            }

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
            const quality = format === 'png' ? 1 : exportQuality;

            canvas.toBlob(
               (blob) => {
                  if (blob) {
                     const a = document.createElement('a');
                     a.href = URL.createObjectURL(blob);
                     a.download = fileName.replace('.svg', '') + `.${format}`;
                     document.body.appendChild(a);
                     a.click();
                     document.body.removeChild(a);
                     URL.revokeObjectURL(a.href);
                     URL.revokeObjectURL(url);
                     setSuccess(`Exported as ${format.toUpperCase()}`);
                  }
               },
               mimeType,
               quality,
            );
         };

         img.onerror = () => {
            setError('Failed to render SVG for export');
            URL.revokeObjectURL(url);
         };

         img.src = url;
      } catch (err) {
         setError('Export failed: ' + err.message);
      } finally {
         setLoading(false);
      }
   };

   // Replace color
   const replaceColor = () => {
      if (!selectedColor || !replacementColor) {
         setError('Please select a color to replace and a replacement color');
         return;
      }

      try {
         const parser = new DOMParser();
         const doc = parser.parseFromString(svgContent, 'image/svg+xml');
         const elements = doc.querySelectorAll('*');

         elements.forEach((el) => {
            ['fill', 'stroke'].forEach((attr) => {
               const value = el.getAttribute(attr);
               if (value === selectedColor) {
                  el.setAttribute(attr, replacementColor);
               }
            });
         });

         const newContent = new XMLSerializer().serializeToString(doc);
         setSvgContent(newContent);
         setExtractedColors(extractColors(doc.querySelector('svg')));
         setSuccess('Color replaced successfully');
      } catch (err) {
         setError('Color replacement failed: ' + err.message);
      }
   };

   // Clear workspace
   const clearWorkspace = () => {
      setSvgContent('');
      setOptimizedSvg('');
      setFileName('');
      setFileSize(0);
      setOptimizedSize(0);
      setExtractedColors([]);
      setDiagnostics([]);
      setQualityScore(0);
      setZoom(1);
      setError('');
      setSuccess('');
   };

   // Get background style
   const getBackgroundStyle = () => {
      switch (background) {
         case 'checkerboard':
            return {
               backgroundImage:
                  'linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)',
               backgroundSize: '20px 20px',
               backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
               backgroundColor: '#ffffff',
            };
         case 'white':
            return { backgroundColor: '#ffffff' };
         case 'black':
            return { backgroundColor: '#000000' };
         case 'light-gray':
            return { backgroundColor: '#f3f4f6' };
         case 'dark-gray':
            return { backgroundColor: '#374151' };
         case 'custom':
            return { backgroundColor: customBgColor };
         default:
            return { backgroundColor: '#ffffff' };
      }
   };

   const outputContent = generateOutput();

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden
      
          before:absolute
      
          before:inset-0
      
          before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]
      
          after:absolute
      
          after:inset-0
      
          after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">

            <div
            className="

    pointer-events-none absolute inset-0

    bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]

  "
         />

         {/* Static ambient backdrop */}

         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
         />

         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         <SEO
            title="SVG Converter - Professional SVG Workbench | Convert, Optimize & Edit | Klique"
            description="Professional SVG converter and workbench. Convert SVG to PNG, JPEG, WebP, CSS, Base64, React JSX, and TypeScript. Optimize SVG files with SVGO, edit colors, and export to multiple formats. Free online tool."
            keywords="svg converter, svg to png, svg to jpeg, svg to webp, svg optimizer, svg to css, svg to base64, svg to react, svg editor, svg color editor, svg workbench, svg tools, optimize svg, svg minifier, online svg converter, klique svg tool"
            canonicalUrl="https://klique.netlify.app/svgconverter"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'SoftwareApplication',
               name: 'SVG Converter & Workbench',
               applicationCategory: 'DesignApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description: 'Professional SVG converter and workbench with optimization, color editing, and multi-format export capabilities.',
               author: {
                  '@type': 'Organization',
                  name: 'Klique',
               },
               featureList: [
                  'SVG to PNG conversion',
                  'SVG to JPEG conversion',
                  'SVG to WebP conversion',
                  'SVG optimization with SVGO',
                  'SVG to CSS data URI',
                  'SVG to Base64 encoding',
                  'SVG to React JSX component',
                  'SVG to React TypeScript component',
                  'SVG color editing',
                  'SVG intelligence studio',
                  'SVG validation',
                  'Raster export with scale controls',
               ],
            }}
         />
         <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]" />
         <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]" />
         <div className="relative z-[100] w-full">
            <Navbar sidebarOpen={false} setSidebarOpen={() => { }} isMobile={false} />
         </div>

         <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-20 sm:pb-24 sm:pt-16 lg:pl-20">
            <div className="w-full">
               {/* Header */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                     <Braces size={14} className="text-[#daf4aa]" />

                     <span>Developer Suite</span>
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                     SVG Converter & Workbench
                  </h1>

                  <p className="mt-1.5 max-w-2xl text-xs font-medium text-zinc-400 sm:text-sm">
                     Convert, optimize, and edit SVG files with professional-grade tools
                  </p>
               </motion.div>

               {/* Floating status messages, outside normal document flow */}
               <AnimatePresence>
                  {(error || success) && (
                     <motion.div
                        key={error ? 'error' : 'success'}
                        role={error ? 'alert' : 'status'}
                        initial={{ opacity: 0, x: 24, y: -8 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 24, y: -8 }}
                        className={`fixed right-4 top-20 z-[200] flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-xl sm:right-6 ${error ? 'border-red-500/30 bg-[#241316]/95 text-red-200' : 'border-emerald-500/30 bg-[#102119]/95 text-emerald-200'}`}
                     >
                        {error ? <AlertCircle size={19} className="mt-0.5 shrink-0" /> : <CheckCircle size={19} className="mt-0.5 shrink-0" />}
                        <span className="flex-1 text-sm font-medium">{error || success}</span>
                        <button type="button" aria-label="Dismiss notification" onClick={() => { setError(''); setSuccess(''); }} className="rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"><X size={16} /></button>
                     </motion.div>
                  )}
               </AnimatePresence>

               {!svgContent && (
                  <div className="flex min-h-[55dvh] w-full items-center justify-center py-10 sm:py-14">
                     <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false); }}
                        onDrop={(e) => {
                           e.preventDefault();
                           setIsDragging(false);
                           if (e.dataTransfer.files.length) handleFileUpload([{ blobFile: e.dataTransfer.files[0] }]);
                        }}
                        className="relative w-full max-w-3xl rounded-3xl border border-zinc-800 bg-[#0f0f11] p-5 shadow-2xl shadow-black/50 sm:p-8"
                     >
                        <div className="mb-6 text-center">
                           <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#daf4aa]/20 bg-[#daf4aa]/10">
                              <Upload size={25} className="text-[#daf4aa]" />
                           </div>
                           <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Upload your SVG</h2>
                           <p className="mt-2 text-sm text-zinc-400">Start by choosing an SVG file to optimize, preview, edit, or convert.</p>

                        </div>

                        <Uploader accept=".svg,image/svg+xml" onChange={handleFileUpload} className="cursor-pointer">
                           <div className={`rounded-2xl border-2 border-dashed px-5 py-9 text-center transition-colors sm:px-8 ${isDragging ? 'border-[#daf4aa] bg-[#daf4aa]/10' : 'border-zinc-700 bg-[#09090b] hover:border-zinc-500 hover:bg-zinc-900/70'}`}>
                              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300">
                                 <FileText size={23} />
                              </div>
                              <p className="text-sm font-semibold text-white">Drop your .svg file here</p>
                              <p className="mt-1 text-xs text-zinc-500">or click to browse files</p>
                           </div>
                        </Uploader>

                        <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-zinc-600">
                           <span className="h-px flex-1 bg-zinc-800" />
                           or try a sample
                           <span className="h-px flex-1 bg-zinc-800" />
                        </div>
                        <button
                           type="button"
                           onClick={() => loadSVG(SAMPLE_SVG, 'sample.svg')}
                           className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#daf4aa]/20 bg-[#daf4aa]/10 px-4 py-3 text-sm font-semibold text-[#daf4aa] transition-colors hover:bg-[#daf4aa]/15"
                        >
                           <Sparkles size={16} />
                           Load Sample SVG
                        </button>
                     </motion.div>
                  </div>
               )}

               {/* Main Layout */}
               <div className={`grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2 ${!svgContent ? 'hidden' : 'mt-8 sm:mt-10'}`}>
                  {/* Left Panel - Input & Preview */}
                  <div className="space-y-4">
                     {/* Upload Area */}
                     {!svgContent ? (
                        <div
                           className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${isDragging
                              ? 'border-[#daf4aa] bg-[#daf4aa]/5'
                              : 'border-zinc-800 hover:border-zinc-700'
                              }`}
                           onDragOver={(e) => {
                              e.preventDefault();
                              setIsDragging(true);
                           }}
                           onDragLeave={() => setIsDragging(false)}
                           onDrop={(e) => {
                              e.preventDefault();
                              setIsDragging(false);
                              const files = e.dataTransfer.files;
                              if (files.length > 0) {
                                 handleFileUpload([{ blobFile: files[0] }]);
                              }
                           }}>
                           <Uploader
                              accept=".svg"
                              onChange={handleFileUpload}
                              className="cursor-pointer">
                              <div className="space-y-4">
                                 <div className="w-16 h-16 mx-auto rounded-full bg-[#daf4aa]/10 flex items-center justify-center">
                                    <Upload size={32} className="text-[#daf4aa]" />
                                 </div>
                                 <div>
                                    <p className="text-lg font-semibold text-white mb-2">
                                       Upload SVG File
                                    </p>
                                    <p className="text-sm text-zinc-400 mb-4">
                                       Drag and drop or click to browse
                                    </p>
                                    <button
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          loadSVG(SAMPLE_SVG, 'sample.svg');
                                       }}
                                       className="px-4 py-2 rounded-xl bg-[#daf4aa]/10 text-[#daf4aa] hover:bg-[#daf4aa]/20 transition-colors text-sm font-semibold">
                                       Load Sample SVG
                                    </button>
                                 </div>
                              </div>
                           </Uploader>
                        </div>
                     ) : (
                        <>
                           {/* SVG Preview */}
                           <div className="rounded-2xl border border-zinc-800 bg-[#0f0f11] overflow-hidden">
                              {/* Preview Header */}
                              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                                 <div className="flex items-center gap-2">
                                    <FileText size={20} className="text-[#daf4aa]" />
                                    <span className="font-semibold text-sm">{fileName}</span>
                                    <span className="text-xs text-zinc-500">
                                       {(fileSize / 1024).toFixed(2)} KB
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <button
                                       onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                                       className="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                                       <ZoomOut size={18} />
                                    </button>
                                    <span className="text-sm font-mono w-12 text-center">
                                       {Math.round(zoom * 100)}%
                                    </span>
                                    <button
                                       onClick={() => setZoom(Math.min(4, zoom + 0.25))}
                                       className="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                                       <ZoomIn size={18} />
                                    </button>
                                    <button
                                       onClick={() => setZoom(1)}
                                       className="p-2 rounded-lg hover:bg-zinc-800 transition-colors">
                                       <RefreshCw size={18} />
                                    </button>
                                 </div>
                              </div>

                              {/* Preview Area */}
                              <div
                                 ref={svgPreviewRef}
                                 className="relative min-h-[400px] flex items-center justify-center overflow-auto"
                                 style={getBackgroundStyle()}>
                                 <div
                                    dangerouslySetInnerHTML={{ __html: svgContent }}
                                    style={{
                                       transform: `scale(${zoom})`,
                                       transition: 'transform 0.2s',
                                    }}
                                 />
                              </div>

                              {/* Preview Footer */}
                              <div className="flex items-center justify-between p-4 border-t border-zinc-800">
                                 <SelectPicker
                                    data={BACKGROUND_OPTIONS}
                                    value={background}
                                    onChange={setBackground}
                                    placeholder="Background"
                                    className="w-40"
                                 />
                                 {background === 'custom' && (
                                    <input
                                       type="color"
                                       value={customBgColor}
                                       onChange={(e) => setCustomBgColor(e.target.value)}
                                       className="w-10 h-10 rounded cursor-pointer"
                                    />
                                 )}
                                 <button
                                    onClick={clearWorkspace}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm">
                                    <Trash2 size={16} />
                                    Clear
                                 </button>
                              </div>
                           </div>

                           {/* SVG Editor */}
                           <div className="rounded-2xl border border-zinc-800 bg-[#0f0f11] overflow-hidden">
                              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                                 <div className="flex items-center gap-2">
                                    <Edit3 size={20} className="text-[#daf4aa]" />
                                    <span className="font-semibold text-sm">SVG Editor</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <button
                                       onClick={() => copyToClipboard(svgContent)}
                                       className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-zinc-800 transition-colors text-xs">
                                       <Copy size={14} />
                                       Copy
                                    </button>
                                 </div>
                              </div>
                              <textarea
                                 value={svgContent}
                                 onChange={(e) => {
                                    setSvgContent(e.target.value);
                                 }}
                                 onPaste={handlePaste}
                                 className="w-full h-48 p-4 bg-[#09090b] text-sm font-mono text-zinc-300 outline-none resize-none"
                                 placeholder="Paste SVG code here..."
                              />
                           </div>
                        </>
                     )}
                  </div>

                  {/* Right Panel - Output & Settings */}
                  <div className="space-y-4">
                     {/* Output Tabs */}
                     {svgContent && (
                        <>
                           <div className="rounded-2xl border border-zinc-800 bg-[#0f0f11] overflow-hidden">
                              <div className="flex items-center gap-1 p-2 border-b border-zinc-800 overflow-x-auto">
                                 {OUTPUT_TABS.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                       <button
                                          key={tab.value}
                                          onClick={() => setActiveTab(tab.value)}
                                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${activeTab === tab.value
                                             ? 'bg-[#daf4aa] text-[#16161b]'
                                             : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                             }`}>
                                          <Icon size={14} />
                                          {tab.label}
                                       </button>
                                    );
                                 })}
                              </div>

                              {/* Output Content */}
                              <div className="p-4">
                                 {['png', 'jpeg', 'webp'].includes(activeTab) ? (
                                    <div className="space-y-4">
                                       <div className="grid grid-cols-2 gap-4">
                                          <div>
                                             <label className="text-xs text-zinc-500 mb-1 block">
                                                Scale
                                             </label>
                                             <SelectPicker
                                                data={SCALE_PRESETS}
                                                value={exportScale}
                                                onChange={setExportScale}
                                             />
                                          </div>
                                          <div>
                                             <label className="text-xs text-zinc-500 mb-1 block">
                                                Quality
                                             </label>
                                             <Input
                                                type="number"
                                                value={exportQuality}
                                                onChange={setExportQuality}
                                                min="0.1"
                                                max="1"
                                                step="0.01"
                                             />
                                          </div>
                                       </div>
                                       <div className="grid grid-cols-2 gap-4">
                                          <div>
                                             <label className="text-xs text-zinc-500 mb-1 block">
                                                Width (px)
                                             </label>
                                             <Input
                                                type="number"
                                                value={exportWidth}
                                                onChange={(v) => {
                                                   setExportWidth(v);
                                                   if (aspectRatioLocked) {
                                                      const ratio =
                                                         exportHeight / exportWidth;
                                                      setExportHeight(Math.round(v * ratio));
                                                   }
                                                }}
                                             />
                                          </div>
                                          <div>
                                             <label className="text-xs text-zinc-500 mb-1 block">
                                                Height (px)
                                             </label>
                                             <Input
                                                type="number"
                                                value={exportHeight}
                                                onChange={(v) => {
                                                   setExportHeight(v);
                                                   if (aspectRatioLocked) {
                                                      const ratio =
                                                         exportWidth / exportHeight;
                                                      setExportWidth(Math.round(v * ratio));
                                                   }
                                                }}
                                             />
                                          </div>
                                       </div>
                                       <Checkbox
                                          checked={aspectRatioLocked}
                                          onChange={setAspectRatioLocked}>
                                          Lock aspect ratio
                                       </Checkbox>
                                       {activeTab === 'jpeg' && (
                                          <div>
                                             <label className="text-xs text-zinc-500 mb-1 block">
                                                Background Color
                                             </label>
                                             <input
                                                type="color"
                                                value={exportBgColor}
                                                onChange={(e) =>
                                                   setExportBgColor(e.target.value)
                                                }
                                                className="w-full h-10 rounded cursor-pointer"
                                             />
                                          </div>
                                       )}
                                       <button
                                          onClick={() => exportToRaster(activeTab)}
                                          disabled={loading}
                                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#daf4aa] text-[#16161b] font-semibold hover:bg-[#cbe699] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                          <Download size={18} />
                                          Export as {activeTab.toUpperCase()}
                                       </button>
                                    </div>
                                 ) : (
                                    <div className="space-y-4">
                                       <textarea
                                          value={outputContent}
                                          readOnly
                                          className="w-full h-48 p-4 bg-[#09090b] text-sm font-mono text-zinc-300 outline-none resize-none rounded-xl"
                                       />
                                       <div className="flex gap-2">
                                          <button
                                             onClick={() => copyToClipboard(outputContent)}
                                             className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#18181b] hover:bg-zinc-800 transition-colors text-sm font-semibold">
                                             <Copy size={16} />
                                             Copy
                                          </button>
                                          <button
                                             onClick={() =>
                                                downloadFile(
                                                   outputContent,
                                                   'text/plain',
                                                   `.${activeTab}`,
                                                )
                                             }
                                             className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#daf4aa]/10 text-[#daf4aa] hover:bg-[#daf4aa]/20 transition-colors text-sm font-semibold">
                                             <Download size={16} />
                                             Download
                                          </button>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>

                           {/* Optimization Settings */}
                           <div className="rounded-2xl border border-zinc-800 bg-[#0f0f11] overflow-hidden">
                              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                                 <div className="flex items-center gap-2">
                                    <Sparkles size={20} className="text-[#daf4aa]" />
                                    <span className="font-semibold text-sm">Optimization</span>
                                 </div>
                                 <Toggle
                                    checked={optimizeEnabled}
                                    onChange={setOptimizeEnabled}
                                    checkedChildren="ON"
                                    unCheckedChildren="OFF"
                                 />
                              </div>
                              <div className="p-4 space-y-4">
                                 <Checkbox
                                    checked={removeComments}
                                    onChange={setRemoveComments}
                                    disabled={!optimizeEnabled}>
                                    Remove comments
                                 </Checkbox>
                                 <Checkbox
                                    checked={removeMetadata}
                                    onChange={setRemoveMetadata}
                                    disabled={!optimizeEnabled}>
                                    Remove metadata
                                 </Checkbox>
                                 <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">
                                       Precision: {precision}
                                    </label>
                                    <input
                                       type="range"
                                       min="0"
                                       max="10"
                                       value={precision}
                                       onChange={(e) => setPrecision(Number(e.target.value))}
                                       disabled={!optimizeEnabled}
                                       className="w-full"
                                    />
                                 </div>
                                 {optimizedSvg && (
                                    <div className="p-3 rounded-xl bg-[#daf4aa]/10 border border-[#daf4aa]/20">
                                       <div className="flex items-center justify-between text-sm">
                                          <span className="text-[#daf4aa]">
                                             Original: {(fileSize / 1024).toFixed(2)} KB
                                          </span>
                                          <span className="text-[#daf4aa]">
                                             Optimized: {(optimizedSize / 1024).toFixed(2)} KB
                                          </span>
                                       </div>
                                       <div className="mt-2 text-xs text-zinc-400">
                                          Saved: {((1 - optimizedSize / fileSize) * 100).toFixed(1)}%
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>

                           {/* Color Editor */}
                           <div className="rounded-2xl border border-zinc-800 bg-[#0f0f11] overflow-hidden">
                              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                                 <div className="flex items-center gap-2">
                                    <Palette size={20} className="text-[#daf4aa]" />
                                    <span className="font-semibold text-sm">Color Editor</span>
                                 </div>
                              </div>
                              <div className="p-4 space-y-4">
                                 {extractedColors.length > 0 ? (
                                    <>
                                       <div>
                                          <label className="text-xs text-zinc-500 mb-2 block">
                                             Select color to replace:
                                          </label>
                                          <div className="flex flex-wrap gap-2">
                                             {extractedColors.map((color, idx) => (
                                                <button
                                                   key={idx}
                                                   onClick={() => setSelectedColor(color)}
                                                   className={`w-10 h-10 rounded-lg border-2 transition-all ${selectedColor === color
                                                      ? 'border-[#daf4aa] ring-2 ring-[#daf4aa]/50'
                                                      : 'border-white/20'
                                                      }`}
                                                   style={{ backgroundColor: color }}
                                                />
                                             ))}
                                          </div>
                                       </div>
                                       <div>
                                          <label className="text-xs text-zinc-500 mb-2 block">
                                             Replacement color:
                                          </label>
                                          <div className="flex gap-2">
                                             <input
                                                type="color"
                                                value={replacementColor}
                                                onChange={(e) =>
                                                   setReplacementColor(e.target.value)
                                                }
                                                className="w-12 h-10 rounded cursor-pointer"
                                             />
                                             <Input
                                                value={replacementColor}
                                                onChange={setReplacementColor}
                                                placeholder="#000000"
                                             />
                                          </div>
                                       </div>
                                       <button
                                          onClick={replaceColor}
                                          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#daf4aa]/10 text-[#daf4aa] hover:bg-[#daf4aa]/20 transition-colors text-sm font-semibold">
                                          <RefreshCw size={16} />
                                          Replace Color
                                       </button>
                                    </>
                                 ) : (
                                    <p className="text-sm text-zinc-500">
                                       No colors found in SVG
                                    </p>
                                 )}
                              </div>
                           </div>

                           {/* Intelligence Studio */}
                           <div className="rounded-2xl border border-zinc-800 bg-[#0f0f11] overflow-hidden">
                              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                                 <div className="flex items-center gap-2">
                                    <Sparkles size={20} className="text-[#daf4aa]" />
                                    <span className="font-semibold text-sm">
                                       Intelligence Studio
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-[#daf4aa]">
                                       {qualityScore}
                                    </span>
                                    <span className="text-xs text-zinc-500">/ 100</span>
                                 </div>
                              </div>
                              <div className="p-4">
                                 {diagnostics.length > 0 ? (
                                    <div className="space-y-2">
                                       {diagnostics.map((diag, idx) => (
                                          <div
                                             key={idx}
                                             className={`p-3 rounded-xl ${diag.severity === 'warning'
                                                ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                                                : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                                                }`}>
                                             <p className="text-sm">{diag.message}</p>
                                          </div>
                                       ))}
                                    </div>
                                 ) : (
                                    <p className="text-sm text-zinc-500">
                                       Load an SVG to see diagnostics
                                    </p>
                                 )}
                              </div>
                           </div>
                        </>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
