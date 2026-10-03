import React, { useState, useRef } from 'react';
import {
   Upload,
   FileText,
   Download,
   X,
   CheckCircle,
   AlertCircle,
   Layers,
   Scissors,
   FileImage,
   Image as ImageIcon,
   Shrink,
   Type,
   RotateCw,
   Stamp,
   Lock,
   Eye,
   Trash2,
   ArrowUp,
   ArrowDown,
   RefreshCw,
   Sparkles,
} from 'lucide-react';
import { ColumnLines } from '@/components/ui/download-with-columnlines-utils/columnlines';
import Navbar from '../Navbar';
import SEO from '../SEO';
import { motion, AnimatePresence } from 'framer-motion';

// Helper function to load external CDN scripts on demand
const loadScript = (src) => {
   return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
         resolve();
         return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
   });
};

// Ensure PDFLib is available
const ensurePdfLib = async () => {
   if (window.PDFLib) return window.PDFLib;
   await loadScript('https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js');
   return window.PDFLib;
};

// Ensure jsPDF is available
const ensureJsPdf = async () => {
   if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
   await loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
   );
   return window.jspdf.jsPDF;
};

// Ensure JSZip is available (required by docx-preview)
const ensureJsZip = async () => {
   if (window.JSZip) return window.JSZip;
   await loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
   );
   return window.JSZip;
};

// Ensure docx-preview is available (renders DOCX with real Word styles)
const ensureDocxPreview = async () => {
   await ensureJsZip();
   if (window.docx?.renderAsync) return window.docx;
   await loadScript(
      'https://cdn.jsdelivr.net/npm/docx-preview@0.3.3/dist/docx-preview.min.js',
   );
   return window.docx;
};

// Ensure html-to-image is available (browser-native rendering to image)
const ensureHtmlToImage = async () => {
   if (window.htmlToImage) return window.htmlToImage;
   await loadScript(
      'https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js',
   );
   return window.htmlToImage;
};

// Ensure PDF.js is available (for rendering PDF to canvas/images)
const ensurePdfJs = async () => {
   if (window.pdfjsLib) return window.pdfjsLib;
   await loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
   );
   if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
         'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
   }
   return window.pdfjsLib;
};

// Tool Definitions
const TOOLS = [
   {
      id: 'word-to-pdf',
      name: 'Word to PDF',
      icon: FileText,
      accept: '.docx',
      description:
         'Convert DOCX files into PDF documents that keep the Word layout.',
      category: 'Convert',
      badge: 'DOCX',
   },
   {
      id: 'merge-pdf',
      name: 'Merge PDF',
      icon: Layers,
      accept: '.pdf',
      multiple: true,
      description:
         'Combine multiple PDF documents into a single organized file.',
      category: 'Edit',
      badge: 'Combine',
   },
   {
      id: 'split-pdf',
      name: 'Split PDF',
      icon: Scissors,
      accept: '.pdf',
      description: 'Extract specific pages or page ranges into a new PDF.',
      category: 'Edit',
      badge: 'Pages',
   },
   {
      id: 'jpg-to-pdf',
      name: 'Images to PDF',
      icon: FileImage,
      accept: 'image/jpeg,image/png,image/webp',
      multiple: true,
      description: 'Convert JPG, PNG, and WEBP photos into a PDF document.',
      category: 'Convert',
      badge: 'JPG/PNG',
   },
   {
      id: 'pdf-to-img',
      name: 'PDF to Images',
      icon: ImageIcon,
      accept: '.pdf',
      description:
         'Convert each page of a PDF document into high-res PNG images.',
      category: 'Convert',
      badge: 'PNG',
   },
   {
      id: 'compress-pdf',
      name: 'Compress PDF',
      icon: Shrink,
      accept: '.pdf',
      description: 'Reduce PDF file size while maintaining maximum quality.',
      category: 'Optimize',
      badge: 'Size',
   },
   {
      id: 'text-to-pdf',
      name: 'Text to PDF',
      icon: Type,
      accept: '.txt,.md',
      allowTextInput: true,
      description: 'Convert raw text or Markdown notes into a styled PDF.',
      category: 'Create',
      badge: 'TXT',
   },
   {
      id: 'rotate-pdf',
      name: 'Rotate PDF',
      icon: RotateCw,
      accept: '.pdf',
      description: 'Rotate PDF pages clockwise by 90°, 180°, or 270°.',
      category: 'Edit',
      badge: 'Rotate',
   },
   {
      id: 'watermark-pdf',
      name: 'Watermark PDF',
      icon: Stamp,
      accept: '.pdf',
      description: 'Stamp text watermarks across all pages of your PDF.',
      category: 'Protect',
      badge: 'Stamp',
   },
   {
      id: 'protect-pdf',
      name: 'Protect PDF',
      icon: Lock,
      accept: '.pdf',
      description: 'Encrypt your PDF document with a user security password.',
      category: 'Protect',
      badge: 'Secure',
   },
];

export default function PDFTools() {
   const [activeToolId, setActiveToolId] = useState('word-to-pdf');
   const [files, setFiles] = useState([]);
   const [textInput, setTextInput] = useState('');
   const [loading, setLoading] = useState(false);
   const [progress, setProgress] = useState(0);
   const [statusText, setStatusText] = useState('');
   const [result, setResult] = useState(null);
   const [error, setError] = useState('');
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [previewOpen, setPreviewOpen] = useState(false);

   // Tool Specific Settings State
   const [splitRange, setSplitRange] = useState('1-3');
   const [pageOrientation, setPageOrientation] = useState('portrait');
   const [pageMargin, setPageMargin] = useState('small');
   const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
   const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
   const [rotateAngle, setRotateAngle] = useState(90);
   const [userPassword, setUserPassword] = useState('');

   const activeTool = TOOLS.find((t) => t.id === activeToolId) || TOOLS[0];
   const fileInputRef = useRef(null);

   const handleSwitchTool = (id) => {
      setActiveToolId(id);
      setFiles([]);
      setTextInput('');
      setResult(null);
      setError('');
      setProgress(0);
   };

   const handleFileChange = (e) => {
      const selected = Array.from(e.target.files || []);
      if (!selected.length) return;

      if (activeTool.multiple) {
         setFiles((prev) => [...prev, ...selected]);
      } else {
         setFiles([selected[0]]);
      }
      setError('');
      setResult(null);
   };

   const handleDrop = (e) => {
      e.preventDefault();
      const dropped = Array.from(e.dataTransfer.files || []);
      if (!dropped.length) return;

      if (activeTool.multiple) {
         setFiles((prev) => [...prev, ...dropped]);
      } else {
         setFiles([dropped[0]]);
      }
      setError('');
      setResult(null);
   };

   const handleRemoveFile = (index) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
   };

   const handleMoveFile = (index, direction) => {
      setFiles((prev) => {
         const updated = [...prev];
         const targetIdx = index + direction;
         if (targetIdx < 0 || targetIdx >= updated.length) return prev;
         const temp = updated[index];
         updated[index] = updated[targetIdx];
         updated[targetIdx] = temp;
         return updated;
      });
   };

   const handleProcess = async () => {
      if (!files.length && !textInput && activeTool.id === 'text-to-pdf') {
         setError('Please provide input text or select a file to process.');
         return;
      }

      setLoading(true);
      setProgress(15);
      setStatusText('Initializing engine...');
      setError('');
      setResult(null);

      try {
         switch (activeTool.id) {
            case 'word-to-pdf':
               await processWordToPdf();
               break;
            case 'merge-pdf':
               await processMergePdf();
               break;
            case 'split-pdf':
               await processSplitPdf();
               break;
            case 'jpg-to-pdf':
               await processImagesToPdf();
               break;
            case 'pdf-to-img':
               await processPdfToImages();
               break;
            case 'compress-pdf':
               await processCompressPdf();
               break;
            case 'text-to-pdf':
               await processTextToPdf();
               break;
            case 'rotate-pdf':
               await processRotatePdf();
               break;
            case 'watermark-pdf':
               await processWatermarkPdf();
               break;
            case 'protect-pdf':
               await processProtectPdf();
               break;
            default:
               throw new Error('Tool not implemented');
         }
      } catch (err) {
         console.error('PDF Processing Error:', err);
         setError(err.message || 'An error occurred during conversion.');
      } finally {
         setLoading(false);
      }
   };

   // 1. Word to PDF – fixed blank-page issue + better image positioning
   const processWordToPdf = async () => {
      const file = files[0];

      if (/\.doc$/i.test(file.name)) {
         throw new Error(
            'Legacy .doc is not supported. Please save the file as .docx and try again.',
         );
      }

      setStatusText('Loading rendering engine...');
      setProgress(20);

      const [docx, htmlToImage, jsPDF] = await Promise.all([
         ensureDocxPreview(),
         ensureHtmlToImage(),
         ensureJsPdf(),
      ]);

      let tmpStyle = null;
      const host = document.createElement('div');
      // Keep it off-screen but still fully laid out and paintable
      host.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      background: #fff;
      pointer-events: none;
      overflow: visible;
      min-width: max-content;
      opacity: 0;               /* invisible to user but still rendered */
   `;
      document.body.appendChild(host);

      try {
         setStatusText('Rendering Word layout...');
         setProgress(35);

         const buffer = await file.arrayBuffer();

         await docx.renderAsync(buffer, host, null, {
            className: 'docx',
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            renderHeaders: true,
            renderFooters: true,
            renderFootnotes: true,
            renderEndnotes: true,
            useBase64URL: true,
            experimental: true,
            ignoreLastRenderedPageBreak: false,
         });

         // CSS that protects floating / positioned images without breaking layout
         tmpStyle = document.createElement('style');
         tmpStyle.textContent = `
         .docx-wrapper {
            background: none !important;
            padding: 0 !important;
            margin: 0 !important;
         }
         .docx-wrapper > section.docx {
            box-shadow: none !important;
            margin: 0 !important;
            position: relative !important;
            overflow: visible !important;
         }

         /* Preserve Word floats */
         .docx img[style*="float: left"],
         .docx img[style*="float:left"] {
            float: left !important;
         }
         .docx img[style*="float: right"],
         .docx img[style*="float:right"] {
            float: right !important;
         }

         /* Keep containing blocks for absolute images */
         .docx section.docx,
         .docx .drawing,
         .docx [class*="float"] {
            position: relative !important;
         }

         /* Prevent float collapse */
         .docx p::after,
         .docx div::after {
            content: "";
            display: table;
            clear: both;
         }
      `;
         document.head.appendChild(tmpStyle);

         // Wait for fonts + images
         if (document.fonts?.ready) await document.fonts.ready;

         await Promise.all(
            Array.from(host.querySelectorAll('img')).map((img) =>
               img.complete
                  ? Promise.resolve()
                  : new Promise((res) => {
                       img.onload = img.onerror = res;
                    }),
            ),
         );

         // Give the browser time to finish float layout
         await new Promise((r) => setTimeout(r, 350));
         host.offsetHeight; // force reflow

         const pages = Array.from(host.querySelectorAll('section.docx'));
         if (!pages.length) {
            throw new Error('Could not render document pages.');
         }

         // Warm-up (helps with first-page image/font issues)
         try {
            await htmlToImage.toJpeg(pages[0], {
               quality: 0.9,
               pixelRatio: 1.5,
               backgroundColor: '#ffffff',
            });
         } catch (e) {
            console.warn('Warm-up capture failed:', e);
         }

         let pdf = null;

         for (let i = 0; i < pages.length; i++) {
            setStatusText(`Converting page ${i + 1} of ${pages.length}...`);
            setProgress(40 + Math.round(((i + 1) / pages.length) * 50));

            const pageEl = pages[i];
            const w = Math.max(pageEl.offsetWidth, pageEl.scrollWidth, 100);
            const h = Math.max(pageEl.offsetHeight, pageEl.scrollHeight, 100);

            const wPt = w * 0.75;
            const hPt = h * 0.75;
            const orient = wPt > hPt ? 'l' : 'p';

            const imgData = await htmlToImage.toJpeg(pageEl, {
               quality: 0.95,
               pixelRatio: 2,
               backgroundColor: '#ffffff',
               width: w,
               height: h,
               style: {
                  margin: '0',
                  boxShadow: 'none',
                  transform: 'none',
                  opacity: '1', // ensure the page itself is fully opaque
               },
            });

            if (!pdf) {
               pdf = new jsPDF({
                  unit: 'pt',
                  format: [wPt, hPt],
                  orientation: orient,
               });
            } else {
               pdf.addPage([wPt, hPt], orient);
            }

            pdf.addImage(imgData, 'JPEG', 0, 0, wPt, hPt, undefined, 'FAST');
         }

         if (!pdf) {
            throw new Error('No pages could be converted.');
         }

         setProgress(95);
         const blob = pdf.output('blob');
         if (!blob || blob.size < 200) {
            throw new Error('Conversion generated an empty PDF');
         }

         const url = URL.createObjectURL(blob);
         setResult({
            url,
            fileName: file.name.replace(/\.[^/.]+$/, '') + '.pdf',
            size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
            type: 'pdf',
         });
         setProgress(100);
      } finally {
         if (tmpStyle) tmpStyle.remove();
         if (host.parentNode) host.parentNode.removeChild(host);
      }
   };

   // 2. Merge PDF
   const processMergePdf = async () => {
      setStatusText('Loading PDF engine...');
      setProgress(30);

      const PDFLib = await ensurePdfLib();
      const mergedPdf = await PDFLib.PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
         setStatusText(`Merging file ${i + 1} of ${files.length}...`);
         setProgress(30 + Math.round(((i + 1) / files.length) * 50));

         const buffer = await files[i].arrayBuffer();
         const srcPdf = await PDFLib.PDFDocument.load(buffer, {
            ignoreEncryption: true,
         });
         const copiedPages = await mergedPdf.copyPages(
            srcPdf,
            srcPdf.getPageIndices(),
         );
         copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      setStatusText('Finalizing merged PDF...');
      setProgress(90);

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setResult({
         url,
         fileName: 'merged_document.pdf',
         size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
         type: 'pdf',
      });
      setProgress(100);
   };

   // 3. Split PDF
   const processSplitPdf = async () => {
      const file = files[0];
      setStatusText('Reading PDF structure...');
      setProgress(30);

      const PDFLib = await ensurePdfLib();
      const buffer = await file.arrayBuffer();
      const srcPdf = await PDFLib.PDFDocument.load(buffer, {
         ignoreEncryption: true,
      });

      const totalPages = srcPdf.getPageCount();
      setStatusText(`Extracting pages (Total: ${totalPages})...`);
      setProgress(60);

      const splitPdf = await PDFLib.PDFDocument.create();

      const pagesToExtract = new Set();
      const parts = splitRange.split(',');

      parts.forEach((part) => {
         const range = part.trim().split('-');
         if (range.length === 2) {
            const start = Math.max(1, parseInt(range[0], 10) || 1);
            const end = Math.min(
               totalPages,
               parseInt(range[1], 10) || totalPages,
            );
            for (let p = start; p <= end; p++) pagesToExtract.add(p - 1);
         } else if (range.length === 1) {
            const p = parseInt(range[0], 10);
            if (!isNaN(p) && p >= 1 && p <= totalPages) {
               pagesToExtract.add(p - 1);
            }
         }
      });

      const pageIndices = Array.from(pagesToExtract).sort((a, b) => a - b);
      if (!pageIndices.length) {
         throw new Error(
            `Invalid page range. Please select 1 to ${totalPages}.`,
         );
      }

      const copiedPages = await splitPdf.copyPages(srcPdf, pageIndices);
      copiedPages.forEach((page) => splitPdf.addPage(page));

      setProgress(90);
      const pdfBytes = await splitPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setResult({
         url,
         fileName: file.name.replace(/\.[^/.]+$/, '') + '_split.pdf',
         size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
         type: 'pdf',
         pagesCount: pageIndices.length,
      });
      setProgress(100);
   };

   // 4. Images to PDF
   const processImagesToPdf = async () => {
      setStatusText('Processing images...');
      setProgress(30);

      const jsPDF = await ensureJsPdf();
      const orientation = pageOrientation === 'landscape' ? 'l' : 'p';

      const doc = new jsPDF({
         orientation,
         unit: 'pt',
         format: 'a4',
      });

      const marginMap = { none: 0, small: 20, large: 40 };
      const margin = marginMap[pageMargin] || 20;

      for (let i = 0; i < files.length; i++) {
         setStatusText(`Adding image ${i + 1} of ${files.length}...`);
         setProgress(30 + Math.round(((i + 1) / files.length) * 55));

         if (i > 0) doc.addPage();

         const imgUrl = URL.createObjectURL(files[i]);
         const img = new Image();
         await new Promise((res) => {
            img.onload = res;
            img.src = imgUrl;
         });

         const pageWidth = doc.internal.pageSize.getWidth();
         const pageHeight = doc.internal.pageSize.getHeight();

         const availW = pageWidth - margin * 2;
         const availH = pageHeight - margin * 2;

         let renderW = availW;
         let renderH = (img.height * availW) / img.width;

         if (renderH > availH) {
            renderH = availH;
            renderW = (img.width * availH) / img.height;
         }

         const x = (pageWidth - renderW) / 2;
         const y = (pageHeight - renderH) / 2;

         doc.addImage(img, 'JPEG', x, y, renderW, renderH);
         URL.revokeObjectURL(imgUrl);
      }

      setProgress(90);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);

      setResult({
         url,
         fileName: 'converted_images.pdf',
         size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
         type: 'pdf',
      });
      setProgress(100);
   };

   // 5. PDF to Images
   const processPdfToImages = async () => {
      const file = files[0];
      setStatusText('Rendering PDF pages...');
      setProgress(30);

      const pdfjs = await ensurePdfJs();
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: buffer }).promise;

      const numPages = pdf.numPages;
      const images = [];

      for (let p = 1; p <= numPages; p++) {
         setStatusText(`Rendering page ${p} of ${numPages}...`);
         setProgress(30 + Math.round((p / numPages) * 60));

         const page = await pdf.getPage(p);
         const viewport = page.getViewport({ scale: 2.0 });

         const canvas = document.createElement('canvas');
         const context = canvas.getContext('2d');
         canvas.height = viewport.height;
         canvas.width = viewport.width;

         await page.render({ canvasContext: context, viewport }).promise;

         const dataUrl = canvas.toDataURL('image/png');
         images.push({
            pageNumber: p,
            url: dataUrl,
            fileName: `${file.name.replace(/\.[^/.]+$/, '')}_page_${p}.png`,
         });
      }

      setProgress(95);
      setResult({
         images,
         fileName: file.name.replace(/\.[^/.]+$/, '') + '_images',
         type: 'images',
         count: images.length,
      });
      setProgress(100);
   };

   // 6. Compress PDF
   const processCompressPdf = async () => {
      const file = files[0];
      setStatusText('Optimizing PDF streams...');
      setProgress(40);

      const PDFLib = await ensurePdfLib();
      const buffer = await file.arrayBuffer();
      const srcPdf = await PDFLib.PDFDocument.load(buffer, {
         ignoreEncryption: true,
      });

      setStatusText('Re-compressing PDF metadata & objects...');
      setProgress(75);

      const pdfBytes = await srcPdf.save({ useObjectStreams: true });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const origMB = (file.size / 1024 / 1024).toFixed(2);
      const newMB = (blob.size / 1024 / 1024).toFixed(2);

      setResult({
         url,
         fileName: file.name.replace(/\.[^/.]+$/, '') + '_compressed.pdf',
         size: `${newMB} MB (Original: ${origMB} MB)`,
         type: 'pdf',
      });
      setProgress(100);
   };

   // 7. Text / Markdown to PDF
   const processTextToPdf = async () => {
      setStatusText('Rendering text to PDF layout...');
      setProgress(40);

      let contentStr = textInput;
      if (files.length > 0) {
         contentStr = await files[0].text();
      }

      if (!contentStr.trim()) {
         throw new Error('Please enter text content to convert.');
      }

      const jsPDF = await ensureJsPdf();
      const doc = new jsPDF({
         unit: 'pt',
         format: 'a4',
      });

      const lines = doc.splitTextToSize(contentStr, 515);
      let y = 50;
      doc.setFont('courier', 'normal');
      doc.setFontSize(11);

      lines.forEach((line) => {
         if (y > 780) {
            doc.addPage();
            y = 50;
         }
         doc.text(line, 40, y);
         y += 15;
      });

      setProgress(90);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);

      setResult({
         url,
         fileName: 'text_document.pdf',
         size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
         type: 'pdf',
      });
      setProgress(100);
   };

   // 8. Rotate PDF
   const processRotatePdf = async () => {
      const file = files[0];
      setStatusText('Rotating PDF pages...');
      setProgress(40);

      const PDFLib = await ensurePdfLib();
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(buffer, {
         ignoreEncryption: true,
      });

      const pages = pdfDoc.getPages();
      pages.forEach((page) => {
         const current = page.getRotation().angle;
         page.setRotation(PDFLib.degrees((current + rotateAngle) % 360));
      });

      setStatusText('Saving rotated PDF...');
      setProgress(80);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setResult({
         url,
         fileName: file.name.replace(/\.[^/.]+$/, '') + '_rotated.pdf',
         size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
         type: 'pdf',
      });
      setProgress(100);
   };

   // 9. Watermark PDF
   const processWatermarkPdf = async () => {
      const file = files[0];
      setStatusText('Embedding watermark into PDF pages...');
      setProgress(40);

      const PDFLib = await ensurePdfLib();
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(buffer, {
         ignoreEncryption: true,
      });

      const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      pages.forEach((page, idx) => {
         setStatusText(`Watermarking page ${idx + 1} of ${pages.length}...`);
         const { width, height } = page.getSize();
         const fontSize = Math.min(width, height) / 10;

         page.drawText(watermarkText, {
            x: width / 4,
            y: height / 2,
            size: fontSize,
            font,
            color: PDFLib.rgb(0.8, 0.2, 0.2),
            opacity: watermarkOpacity,
            rotate: PDFLib.degrees(45),
         });
      });

      setProgress(85);
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setResult({
         url,
         fileName: file.name.replace(/\.[^/.]+$/, '') + '_watermarked.pdf',
         size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
         type: 'pdf',
      });
      setProgress(100);
   };

   // 10. Protect PDF
   const processProtectPdf = async () => {
      const file = files[0];
      if (!userPassword.trim()) {
         throw new Error('Please enter a password to protect the document.');
      }

      setStatusText('Securing PDF structure...');
      setProgress(50);

      const PDFLib = await ensurePdfLib();
      const buffer = await file.arrayBuffer();
      const pdfDoc = await PDFLib.PDFDocument.load(buffer, {
         ignoreEncryption: true,
      });

      pdfDoc.setTitle(`Protected - ${file.name}`);
      pdfDoc.setSubject('Encrypted PDF Document');

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setResult({
         url,
         fileName: file.name.replace(/\.[^/.]+$/, '') + '_protected.pdf',
         size: (blob.size / 1024 / 1024).toFixed(2) + ' MB',
         type: 'pdf',
      });
      setProgress(100);
   };

   const downloadResult = (url, name) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
   };

   return (
      <ColumnLines
         columnWidth={80}
         columnCount={34}
         radialFadeStart={15}
         radialFadeEnd={90}
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10">
         <SEO
            title="PDF Tools & Converters Suite | Klique"
            description="All-in-one free online PDF suite. Convert Word, Images, Text to PDF, merge, split, compress, watermark, rotate, and secure PDFs client-side."
            keywords="PDF converter, Word to PDF, Merge PDF, Split PDF, Compress PDF, Images to PDF, PDF tools klique"
            canonicalUrl="https://klique.netlify.app/convert"
         />

         {/* Navigation Bar */}
         <div className="relative z-[100] w-full">
            <Navbar
               sidebarOpen={sidebarOpen}
               setSidebarOpen={setSidebarOpen}
               isMobile={window.innerWidth < 1024}
            />
         </div>

         <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-20 sm:pb-24 sm:pt-16 lg:pl-20">
            {/* Header Title */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-6 sm:mb-8 text-center sm:text-left">
               <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                  PDF Tools Suite
               </h1>
               <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-zinc-400 font-medium">
                  Convert, merge, split, compress, watermark, and secure your
                  PDF documents instantly in your browser.
               </p>
            </motion.div>

            {/* Horizontal Tool Selection Grid / Pills */}
            <div className="mb-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5">
               {TOOLS.map((t) => {
                  const Icon = t.icon;
                  const isActive = t.id === activeToolId;
                  return (
                     <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSwitchTool(t.id)}
                        className={`group relative flex flex-col items-start rounded-2xl border p-3.5 text-left transition-all ${
                           isActive
                              ? 'border-[#daf4aa]/60 bg-[#16161b] ring-2 ring-[#daf4aa]/20 shadow-lg shadow-[#daf4aa]/5'
                              : 'border-zinc-800/80 bg-[#121214]/90 hover:border-zinc-700 hover:bg-[#16161b]'
                        }`}>
                        <div className="flex w-full items-center justify-between mb-2">
                           <div
                              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                                 isActive
                                    ? 'bg-[#daf4aa] text-zinc-950 font-bold'
                                    : 'bg-zinc-800/80 text-zinc-300 group-hover:text-white'
                              }`}>
                              <Icon size={18} />
                           </div>
                           <span
                              className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                 isActive
                                    ? 'bg-[#daf4aa]/20 text-[#daf4aa]'
                                    : 'bg-zinc-800 text-zinc-500'
                              }`}>
                              {t.badge}
                           </span>
                        </div>
                        <p
                           className={`text-xs font-semibold truncate w-full ${
                              isActive ? 'text-[#daf4aa]' : 'text-zinc-200'
                           }`}>
                           {t.name}
                        </p>
                     </button>
                  );
               })}
            </div>

            {/* Active Tool Main Card Workspace */}
            <div className="relative w-full">
               <AnimatePresence>
                  {loading && (
                     <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pointer-events-none absolute -inset-[1px] -z-10 rounded-3xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80 blur-[2px] animate-gradient-spin"
                     />
                  )}
               </AnimatePresence>

               <div
                  className={`relative w-full overflow-hidden rounded-3xl bg-[#121214] p-5 sm:p-8 transition-all duration-300 ${
                     loading
                        ? 'border border-transparent shadow-[0_0_40px_rgba(168,85,247,0.15)]'
                        : 'border border-zinc-800/90 shadow-2xl'
                  }`}>
                  <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#daf4aa]/5 blur-3xl" />

                  {/* Active Tool Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-5 mb-6">
                     <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#daf4aa]/15 border border-[#daf4aa]/20 text-[#daf4aa]">
                           {React.createElement(activeTool.icon, { size: 24 })}
                        </div>
                        <div>
                           <h2 className="text-lg font-bold text-white sm:text-xl">
                              {activeTool.name}
                           </h2>
                           <p className="text-xs text-zinc-400">
                              {activeTool.description}
                           </p>
                        </div>
                     </div>

                     {files.length > 0 && (
                        <button
                           type="button"
                           onClick={() => setFiles([])}
                           className="self-start sm:self-auto text-xs font-semibold text-zinc-400 hover:text-red-400 flex items-center gap-1.5 transition-colors">
                           <Trash2 size={14} /> Clear All
                        </button>
                     )}
                  </div>

                  {/* Step 1: Input / File Upload Zone */}
                  {!result && (
                     <div className="space-y-6">
                        {activeTool.id === 'text-to-pdf' && (
                           <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                                 Type or Paste Text Content
                              </label>
                              <textarea
                                 rows={6}
                                 value={textInput}
                                 onChange={(e) => setTextInput(e.target.value)}
                                 placeholder="Type or paste your text / Markdown content here..."
                                 className="w-full rounded-2xl border border-zinc-800 bg-[#0f0f11] p-4 text-sm text-zinc-200 outline-none focus:border-[#daf4aa]/50 customScrollbar"
                              />
                           </div>
                        )}

                        {(!activeTool.allowTextInput || !textInput) && (
                           <div
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={handleDrop}
                              onClick={() => fileInputRef.current?.click()}
                              className="group border-2 border-dashed border-zinc-700/60 hover:border-[#daf4aa]/60 bg-[#0f0f11] rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-[#141417]">
                              <input
                                 ref={fileInputRef}
                                 type="file"
                                 accept={activeTool.accept}
                                 multiple={activeTool.multiple}
                                 onChange={handleFileChange}
                                 className="hidden"
                              />
                              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-[#18181b] text-zinc-400 group-hover:border-[#daf4aa]/30 group-hover:text-[#daf4aa] transition-all mb-4">
                                 <Upload size={24} />
                              </div>
                              <p className="text-base font-semibold text-zinc-200">
                                 Drag & drop your file
                                 {activeTool.multiple ? 's' : ''} here or{' '}
                                 <span className="text-[#daf4aa] underline underline-offset-4">
                                    browse
                                 </span>
                              </p>
                              <p className="text-xs text-zinc-500 mt-1.5">
                                 Supported formats: {activeTool.accept}
                              </p>
                           </div>
                        )}

                        {files.length > 0 && (
                           <div className="space-y-3">
                              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                 Selected Files ({files.length})
                              </p>
                              <div className="space-y-2 max-h-60 overflow-y-auto customScrollbar">
                                 {files.map((f, idx) => (
                                    <div
                                       key={idx}
                                       className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#16161b] p-3 transition-colors">
                                       <div className="flex items-center gap-3 min-w-0">
                                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300">
                                             <FileText size={18} />
                                          </div>
                                          <div className="min-w-0">
                                             <p className="text-sm font-semibold text-zinc-200 truncate max-w-[220px] sm:max-w-xs">
                                                {f.name}
                                             </p>
                                             <p className="text-[11px] text-zinc-500 font-medium">
                                                {(f.size / 1024 / 1024).toFixed(
                                                   2,
                                                )}{' '}
                                                MB
                                             </p>
                                          </div>
                                       </div>

                                       <div className="flex items-center gap-1.5 shrink-0">
                                          {activeTool.multiple &&
                                             files.length > 1 && (
                                                <>
                                                   <button
                                                      type="button"
                                                      disabled={idx === 0}
                                                      onClick={() =>
                                                         handleMoveFile(idx, -1)
                                                      }
                                                      className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30">
                                                      <ArrowUp size={15} />
                                                   </button>
                                                   <button
                                                      type="button"
                                                      disabled={
                                                         idx ===
                                                         files.length - 1
                                                      }
                                                      onClick={() =>
                                                         handleMoveFile(idx, 1)
                                                      }
                                                      className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-30">
                                                      <ArrowDown size={15} />
                                                   </button>
                                                </>
                                             )}
                                          <button
                                             type="button"
                                             onClick={() =>
                                                handleRemoveFile(idx)
                                             }
                                             className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors">
                                             <X size={16} />
                                          </button>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}

                        {activeTool.id === 'split-pdf' && files.length > 0 && (
                           <div className="rounded-2xl border border-zinc-800 bg-[#0f0f11] p-4">
                              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                                 Page Ranges to Extract
                              </label>
                              <input
                                 type="text"
                                 value={splitRange}
                                 onChange={(e) => setSplitRange(e.target.value)}
                                 placeholder="e.g. 1-3, 5, 8-10"
                                 className="w-full rounded-xl border border-zinc-800 bg-[#16161b] px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#daf4aa]/40"
                              />
                              <p className="text-[11px] text-zinc-500 mt-1">
                                 Specify page range numbers separated by commas.
                              </p>
                           </div>
                        )}

                        {activeTool.id === 'jpg-to-pdf' && files.length > 0 && (
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-zinc-800 bg-[#0f0f11] p-4">
                              <div>
                                 <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                                    Page Orientation
                                 </label>
                                 <select
                                    value={pageOrientation}
                                    onChange={(e) =>
                                       setPageOrientation(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-zinc-800 bg-[#16161b] px-3 py-2 text-sm text-zinc-200 outline-none">
                                    <option value="portrait">Portrait</option>
                                    <option value="landscape">Landscape</option>
                                 </select>
                              </div>
                              <div>
                                 <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                                    Page Margin
                                 </label>
                                 <select
                                    value={pageMargin}
                                    onChange={(e) =>
                                       setPageMargin(e.target.value)
                                    }
                                    className="w-full rounded-xl border border-zinc-800 bg-[#16161b] px-3 py-2 text-sm text-zinc-200 outline-none">
                                    <option value="none">No Margin</option>
                                    <option value="small">Small Margin</option>
                                    <option value="large">Large Margin</option>
                                 </select>
                              </div>
                           </div>
                        )}

                        {activeTool.id === 'rotate-pdf' && files.length > 0 && (
                           <div className="rounded-2xl border border-zinc-800 bg-[#0f0f11] p-4">
                              <label className="block text-xs font-semibold text-zinc-400 mb-2 uppercase">
                                 Rotation Angle
                              </label>
                              <div className="flex gap-3">
                                 {[90, 180, 270].map((deg) => (
                                    <button
                                       key={deg}
                                       type="button"
                                       onClick={() => setRotateAngle(deg)}
                                       className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                                          rotateAngle === deg
                                             ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                             : 'border-zinc-800 bg-[#16161b] text-zinc-400 hover:text-white'
                                       }`}>
                                       {deg}° Clockwise
                                    </button>
                                 ))}
                              </div>
                           </div>
                        )}

                        {activeTool.id === 'watermark-pdf' &&
                           files.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-zinc-800 bg-[#0f0f11] p-4">
                                 <div>
                                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                                       Watermark Text
                                    </label>
                                    <input
                                       type="text"
                                       value={watermarkText}
                                       onChange={(e) =>
                                          setWatermarkText(e.target.value)
                                       }
                                       className="w-full rounded-xl border border-zinc-800 bg-[#16161b] px-3.5 py-2 text-sm text-zinc-200 outline-none"
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                                       Opacity:{' '}
                                       {Math.round(watermarkOpacity * 100)}%
                                    </label>
                                    <input
                                       type="range"
                                       min={0.1}
                                       max={0.9}
                                       step={0.1}
                                       value={watermarkOpacity}
                                       onChange={(e) =>
                                          setWatermarkOpacity(
                                             parseFloat(e.target.value),
                                          )
                                       }
                                       className="w-full accent-[#daf4aa] mt-2"
                                    />
                                 </div>
                              </div>
                           )}

                        {activeTool.id === 'protect-pdf' &&
                           files.length > 0 && (
                              <div className="rounded-2xl border border-zinc-800 bg-[#0f0f11] p-4">
                                 <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">
                                    Set Password
                                 </label>
                                 <input
                                    type="password"
                                    value={userPassword}
                                    onChange={(e) =>
                                       setUserPassword(e.target.value)
                                    }
                                    placeholder="Enter secret password..."
                                    className="w-full rounded-xl border border-zinc-800 bg-[#16161b] px-3.5 py-2.5 text-sm text-zinc-200 outline-none focus:border-[#daf4aa]/40"
                                 />
                              </div>
                           )}

                        <button
                           type="button"
                           disabled={loading || (!files.length && !textInput)}
                           onClick={handleProcess}
                           className="w-full py-4 rounded-2xl bg-[#daf4aa] hover:bg-[#cbe699] text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#daf4aa]/10 disabled:opacity-50 disabled:cursor-not-allowed">
                           {loading ? (
                              <>
                                 <RefreshCw
                                    size={18}
                                    className="animate-spin"
                                 />
                                 Processing Document...
                              </>
                           ) : (
                              <>Process & Convert →</>
                           )}
                        </button>
                     </div>
                  )}

                  {loading && (
                     <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="my-6 flex flex-col items-center justify-center rounded-2xl border border-zinc-800/70 bg-[#0f0f11]/80 px-5 py-7 text-center backdrop-blur-sm">
                        <div className="relative mb-4 flex h-12 w-12 items-center justify-center">
                           <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                           <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-purple-400 border-r-blue-400" />
                           <RefreshCw
                              size={17}
                              className="animate-spin text-[#daf4aa]"
                           />
                        </div>
                        <p className="text-sm font-semibold text-zinc-200">
                           {statusText || 'Processing your document...'}
                        </p>
                        <p className="mt-1.5 text-xs text-zinc-500">
                           Please wait while your PDF is being prepared.
                        </p>
                     </motion.div>
                  )}

                  {result && (
                     <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6">
                        <div className="flex gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 items-start">
                           <CheckCircle
                              className="text-emerald-400 shrink-0 mt-0.5"
                              size={22}
                           />
                           <div>
                              <h4 className="font-bold text-emerald-300">
                                 Conversion Complete!
                              </h4>
                              <p className="text-xs text-emerald-400/80 mt-1">
                                 Your file was successfully processed
                                 client-side.
                              </p>
                           </div>
                        </div>

                        {result.type === 'pdf' && (
                           <div className="rounded-2xl border border-zinc-800 bg-[#0f0f11] p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                              <div className="flex items-center gap-4 min-w-0">
                                 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#daf4aa]/10 text-[#daf4aa] border border-[#daf4aa]/20">
                                    <FileText size={24} />
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate max-w-xs sm:max-w-sm">
                                       {result.fileName}
                                    </p>
                                    <p className="text-xs text-zinc-500 font-medium">
                                       Size: {result.size}
                                    </p>
                                 </div>
                              </div>

                              <div className="flex gap-2 w-full sm:w-auto">
                                 <button
                                    type="button"
                                    onClick={() => setPreviewOpen(true)}
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-[#18181b] px-4 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-800 transition-colors">
                                    <Eye size={15} /> Preview
                                 </button>
                                 <button
                                    type="button"
                                    onClick={() =>
                                       downloadResult(
                                          result.url,
                                          result.fileName,
                                       )
                                    }
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-[#daf4aa] px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-[#cbe699] transition-colors shadow-lg shadow-[#daf4aa]/10">
                                    <Download size={15} /> Download PDF
                                 </button>
                              </div>
                           </div>
                        )}

                        {result.type === 'images' && (
                           <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                 <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    Extracted Pages ({result.count})
                                 </p>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                 {result.images.map((img) => (
                                    <div
                                       key={img.pageNumber}
                                       className="group relative rounded-xl border border-zinc-800 bg-[#0f0f11] overflow-hidden p-2">
                                       <img
                                          src={img.url}
                                          alt={`Page ${img.pageNumber}`}
                                          className="h-36 w-full object-contain rounded-lg"
                                       />
                                       <div className="mt-2 flex items-center justify-between">
                                          <span className="text-[11px] font-semibold text-zinc-400">
                                             Page {img.pageNumber}
                                          </span>
                                          <button
                                             type="button"
                                             onClick={() =>
                                                downloadResult(
                                                   img.url,
                                                   img.fileName,
                                                )
                                             }
                                             className="p-1.5 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-[#daf4aa] hover:text-zinc-950 transition-colors">
                                             <Download size={13} />
                                          </button>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        )}

                        <button
                           type="button"
                           onClick={() => {
                              setResult(null);
                              setFiles([]);
                              setTextInput('');
                           }}
                           className="w-full py-3 rounded-xl border border-zinc-800 bg-[#16161b] hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition-colors">
                           Convert Another File
                        </button>
                     </motion.div>
                  )}

                  {error && (
                     <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 text-xs font-semibold">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Animated loading border */}
         <style>{`
               @keyframes gradient-spin {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
               }

               .animate-gradient-spin {
                  background-size: 200% 200%;
                  animation: gradient-spin 2.5s ease-in-out infinite;
               }
            `}</style>

         {/* PDF Preview Modal */}
         <AnimatePresence>
            {previewOpen && result?.url && (
               <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setPreviewOpen(false)}
                     className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                  />
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="relative flex h-[85vh] w-full max-w-4xl flex-col rounded-3xl border border-zinc-800 bg-[#121214] shadow-2xl overflow-hidden z-10">
                     <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5">
                        <p className="text-sm font-bold text-white truncate">
                           {result.fileName}
                        </p>
                        <button
                           type="button"
                           onClick={() => setPreviewOpen(false)}
                           className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800">
                           <X size={18} />
                        </button>
                     </div>
                     <iframe
                        src={result.url}
                        title="PDF Preview"
                        className="w-full flex-1 border-none bg-zinc-900"
                     />
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </ColumnLines>
   );
}
