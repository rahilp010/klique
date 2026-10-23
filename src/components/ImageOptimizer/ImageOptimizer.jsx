/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
   ImageIcon,
   Upload,
   Download,
   Sliders,
   Trash2,
   RefreshCw,
   CheckCircle2,
   AlertCircle,
   ArrowRight,
   Zap,
   Maximize2,
   Eye,
   FileImage,
   FileArchive,
   Sparkles,
   Split,
   Braces,
   Crop,
   ArrowRightLeft,
   RotateCw,
   RotateCcw,
   Stamp,
   Type,
   Code2,
   Copy,
   Check,
   FlipHorizontal,
   FlipVertical,
   Layers,
   Wand2,
   Link as LinkIcon,
   Unlink,
   ZoomIn,
   ZoomOut,
   Share2,
   FileText,
   CheckCheck,
   Pipette,
   Plus,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import Navbar from '../Navbar';
import SEO from '../SEO';

/* -------------------------------------------------------------------------- */
/*  TOOLS DEFINITIONS (MIRRORING PDFTOOLS SUITE)                               */
/* -------------------------------------------------------------------------- */

const TOOLS = [
   {
      id: 'compress-img',
      name: 'Compress Image',
      icon: ShrinkIcon,
      accept: 'image/jpeg,image/png,image/webp',
      multiple: true,
      description:
         'Reduce JPG, PNG, and WebP file sizes with precision quality & live before/after preview.',
      category: 'Optimize',
      badge: 'Size',
   },
   {
      id: 'resize-img',
      name: 'Resize Image',
      icon: Maximize2,
      accept: 'image/jpeg,image/png,image/webp,image/bmp',
      multiple: false,
      description:
         'Resize image dimensions by exact pixels or percentage with aspect ratio lock.',
      category: 'Dimensions',
      badge: 'Resize',
   },
   {
      id: 'crop-img',
      name: 'Crop Image',
      icon: Crop,
      accept: 'image/jpeg,image/png,image/webp,image/bmp',
      multiple: false,
      description:
         'Crop images to 1:1, 16:9, 9:16, 4:3 social aspect ratios or custom pixel coordinates.',
      category: 'Edit',
      badge: 'Crop',
   },
   {
      id: 'convert-img',
      name: 'Convert Image',
      icon: ArrowRightLeft,
      accept: 'image/jpeg,image/png,image/webp,image/bmp,image/svg+xml,image/gif',
      multiple: true,
      description:
         'Batch convert photos between PNG, JPG, WebP, and BMP with one-click ZIP download.',
      category: 'Convert',
      badge: 'Format',
   },
   {
      id: 'rotate-img',
      name: 'Rotate & Flip',
      icon: RotateCw,
      accept: 'image/jpeg,image/png,image/webp',
      multiple: false,
      description:
         'Rotate 90°, 180°, or fine-tune angles, plus horizontal & vertical mirror flips.',
      category: 'Edit',
      badge: 'Rotate',
   },
   {
      id: 'watermark-img',
      name: 'Watermark Image',
      icon: Stamp,
      accept: 'image/jpeg,image/png,image/webp',
      multiple: false,
      description:
         'Stamp custom text watermarks with opacity, angle, and 9-point placement grid.',
      category: 'Protect',
      badge: 'Stamp',
   },
   {
      id: 'filter-img',
      name: 'Filters & Adjust',
      icon: Sliders,
      accept: 'image/jpeg,image/png,image/webp',
      multiple: false,
      description:
         'Fine-tune brightness, contrast, saturation, blur, sepia, and apply instant presets.',
      category: 'Enhance',
      badge: 'Filter',
   },
   {
      id: 'remove-bg',
      name: 'Remove Background',
      icon: Sparkles,
      accept: 'image/jpeg,image/png,image/webp',
      multiple: false,
      description:
         'Chroma-key erase solid backgrounds (white, green, black) into transparent PNGs.',
      category: 'Cutout',
      badge: 'Erase',
   },
   {
      id: 'meme-img',
      name: 'Meme Generator',
      icon: Type,
      accept: 'image/jpeg,image/png,image/webp',
      multiple: false,
      description:
         'Generate classic bold meme captions with outline strokes and custom font sizes.',
      category: 'Create',
      badge: 'Meme',
   },
   {
      id: 'base64-img',
      name: 'Base64 Converter',
      icon: Code2,
      accept: 'image/jpeg,image/png,image/webp,image/svg+xml',
      allowTextInput: true,
      multiple: false,
      description:
         'Convert images to Base64 URIs, HTML tags, CSS backgrounds, or decode Base64 to image.',
      category: 'Developer',
      badge: 'Base64',
   },
];

function ShrinkIcon(props) {
   return (
      <svg
         width={props.size || 24}
         height={props.size || 24}
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         strokeWidth="2"
         strokeLinecap="round"
         strokeLinejoin="round"
         {...props}>
         <path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8" />
         <path d="M9 19.8V15m0 0H4.2M9 15l-6 6" />
         <path d="M15 4.2V9m0 0h4.8M15 9l6-6" />
         <path d="M9 4.2V9m0 0H4.2M9 9 3 3" />
      </svg>
   );
}

const COMPRESS_FORMAT_OPTIONS = [
   { id: 'auto', label: 'Auto (Best Quality & Size)', ext: 'webp' },
   { id: 'image/webp', label: 'WebP (Smallest File Size)', ext: 'webp' },
   { id: 'image/jpeg', label: 'JPEG (Standard Photo)', ext: 'jpg' },
   { id: 'image/png', label: 'PNG (Lossless / Transparent)', ext: 'png' },
];

const FORMAT_OPTIONS = [
   { id: 'image/webp', label: 'WebP (Modern & Compact)', ext: 'webp' },
   { id: 'image/jpeg', label: 'JPEG / JPG (Standard Photo)', ext: 'jpg' },
   { id: 'image/png', label: 'PNG (Lossless / Transparent)', ext: 'png' },
   { id: 'image/bmp', label: 'BMP (Bitmap)', ext: 'bmp' },
];

const ASPECT_RATIOS = [
   { label: 'Freeform', value: 'free' },
   { label: '1:1 Square (Avatar/Post)', value: '1:1', ratio: 1 },
   { label: '16:9 Landscape (YouTube)', value: '16:9', ratio: 16 / 9 },
   { label: '9:16 Story (Reels/TikTok)', value: '9:16', ratio: 9 / 16 },
   { label: '4:3 Standard Photo', value: '4:3', ratio: 4 / 3 },
   { label: '3:2 Classic Photo', value: '3:2', ratio: 3 / 2 },
];

const FILTER_PRESETS = [
   {
      name: 'Normal',
      brightness: 100,
      contrast: 100,
      saturate: 100,
      grayscale: 0,
      sepia: 0,
      blur: 0,
      invert: 0,
   },
   {
      name: 'Vivid & Crisp',
      brightness: 105,
      contrast: 120,
      saturate: 135,
      grayscale: 0,
      sepia: 0,
      blur: 0,
      invert: 0,
   },
   {
      name: 'Vintage 70s',
      brightness: 110,
      contrast: 90,
      saturate: 80,
      grayscale: 0,
      sepia: 50,
      blur: 0,
      invert: 0,
   },
   {
      name: 'Noir (B&W)',
      brightness: 100,
      contrast: 130,
      saturate: 0,
      grayscale: 100,
      sepia: 0,
      blur: 0,
      invert: 0,
   },
   {
      name: 'Warm Sunset',
      brightness: 105,
      contrast: 105,
      saturate: 120,
      grayscale: 0,
      sepia: 25,
      blur: 0,
      invert: 0,
   },
   {
      name: 'Cool Dusk',
      brightness: 95,
      contrast: 110,
      saturate: 110,
      grayscale: 10,
      sepia: 0,
      blur: 0,
      invert: 0,
   },
   {
      name: 'Inverted X-Ray',
      brightness: 100,
      contrast: 100,
      saturate: 100,
      grayscale: 0,
      sepia: 0,
      blur: 0,
      invert: 100,
   },
];

const WATERMARK_POSITIONS = [
   { id: 'top-left', label: 'Top Left' },
   { id: 'top-center', label: 'Top Center' },
   { id: 'top-right', label: 'Top Right' },
   { id: 'middle-left', label: 'Mid Left' },
   { id: 'center', label: 'Center' },
   { id: 'middle-right', label: 'Mid Right' },
   { id: 'bottom-left', label: 'Bottom Left' },
   { id: 'bottom-center', label: 'Bottom Center' },
   { id: 'bottom-right', label: 'Bottom Right' },
];

/* -------------------------------------------------------------------------- */
/*  MAIN COMPONENT                                                            */
/* -------------------------------------------------------------------------- */

export default function ImageTools() {
   const [activeToolId, setActiveToolId] = useState('compress-img');
   const [files, setFiles] = useState([]);
   const [selectedFileIndex, setSelectedFileIndex] = useState(0);
   const [isProcessing, setIsProcessing] = useState(false);
   const [result, setResult] = useState(null);
   const [sidebarOpen, setSidebarOpen] = useState(false);

   // Toast State
   const [toast, setToast] = useState({
      visible: false,
      message: '',
      type: 'success',
   });

   const showToast = (message, type = 'success') => {
      setToast({ visible: true, message, type });
      setTimeout(
         () => setToast({ visible: false, message: '', type: 'success' }),
         2600,
      );
   };

   // 1. Compress tool state
   const [compressFormat, setCompressFormat] = useState('auto');
   const [compressMode, setCompressMode] = useState('auto'); // 'auto', 'slider', 'target-kb'
   const [compressQuality, setCompressQuality] = useState(0.65);
   const [compressTargetKB, setCompressTargetKB] = useState(250);
   const [compressMaxWidth, setCompressMaxWidth] = useState(0); // 0 = original
   const [autoGuaranteeSmaller, setAutoGuaranteeSmaller] = useState(true);
   const [sliderPos, setSliderPos] = useState(50); // Split slider position (0-100)

   // 2. Resize tool state
   const [resizeWidth, setResizeWidth] = useState(800);
   const [resizeHeight, setResizeHeight] = useState(600);
   const [lockAspectRatio, setLockAspectRatio] = useState(true);
   const [aspectRatioValue, setAspectRatioValue] = useState(1);
   const [resizeFormat, setResizeFormat] = useState('image/png');

   // 3. Crop tool state
   const [cropPreset, setCropPreset] = useState('free');
   const [cropX, setCropX] = useState(0);
   const [cropY, setCropY] = useState(0);
   const [cropWidth, setCropWidth] = useState(400);
   const [cropHeight, setCropHeight] = useState(400);

   // 4. Convert tool state
   const [convertFormat, setConvertFormat] = useState('image/webp');
   const [convertQuality, setConvertQuality] = useState(0.9);

   // 5. Rotate tool state
   const [rotateAngle, setRotateAngle] = useState(0);
   const [flipH, setFlipH] = useState(false);
   const [flipV, setFlipV] = useState(false);

   // 6. Watermark tool state
   const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
   const [watermarkColor, setWatermarkColor] = useState('#ffffff');
   const [watermarkOpacity, setWatermarkOpacity] = useState(0.4);
   const [watermarkSize, setWatermarkSize] = useState(42);
   const [watermarkRotation, setWatermarkRotation] = useState(-25);
   const [watermarkPosition, setWatermarkPosition] = useState('center');
   const [watermarkTiled, setWatermarkTiled] = useState(false);

   // 7. Filter tool state
   const [filterBrightness, setFilterBrightness] = useState(100);
   const [filterContrast, setFilterContrast] = useState(100);
   const [filterSaturate, setFilterSaturate] = useState(100);
   const [filterGrayscale, setFilterGrayscale] = useState(0);
   const [filterSepia, setFilterSepia] = useState(0);
   const [filterBlur, setFilterBlur] = useState(0);
   const [filterInvert, setFilterInvert] = useState(0);

   // 8. Remove Background tool state
   const [keyColor, setKeyColor] = useState('#ffffff');
   const [tolerance, setTolerance] = useState(25);
   const [feather, setFeather] = useState(4);

   // 9. Meme tool state
   const [memeTopText, setMemeTopText] = useState('WHEN CODE BUILDS');
   const [memeBottomText, setMemeBottomText] = useState('ON FIRST TRY');
   const [memeFontSize, setMemeFontSize] = useState(44);
   const [memeUppercase, setMemeUppercase] = useState(true);

   // 10. Base64 tool state
   const [base64InputText, setBase64InputText] = useState('');
   const [base64Output, setBase64Output] = useState('');
   const [copiedType, setCopiedType] = useState(null);

   // Live Preview Reactive States
   const [livePreviewUrl, setLivePreviewUrl] = useState(null);
   const [liveCompressedUrl, setLiveCompressedUrl] = useState(null);
   const [liveMetrics, setLiveMetrics] = useState({
      width: 0,
      height: 0,
      estimatedSize: 0,
   });

   const activeTool = TOOLS.find((t) => t.id === activeToolId) || TOOLS[0];
   const activeFile = files[selectedFileIndex] || files[0];

   /* ----------------------------------------------------------------------- */
   /*  FILE HANDLING                                                          */
   /* ----------------------------------------------------------------------- */

   const handleAddFiles = (fileList) => {
      const selected = Array.from(fileList || []).filter((f) =>
         f.type.startsWith('image/'),
      );
      if (!selected.length) {
         showToast('Please select valid image files', 'error');
         return;
      }

      const newFileObjs = selected.map((file) => ({
         file,
         name: file.name,
         size: file.size,
         type: file.type,
         originalUrl: URL.createObjectURL(file),
         width: 0,
         height: 0,
      }));

      const merged = activeTool.multiple
         ? [...files, ...newFileObjs]
         : [newFileObjs[0]];

      setFiles(merged);
      setSelectedFileIndex(0);
      setResult(null);

      // Preload first image for dimension calculations
      const img = new Image();
      img.onload = () => {
         const w = img.naturalWidth || img.width;
         const h = img.naturalHeight || img.height;
         setResizeWidth(w);
         setResizeHeight(h);
         setAspectRatioValue(w / h);
         setCropWidth(Math.round(w * 0.8));
         setCropHeight(Math.round(h * 0.8));
         setCropX(Math.round(w * 0.1));
         setCropY(Math.round(h * 0.1));
         setFiles((prev) =>
            prev.map((item, idx) =>
               idx === 0 ? { ...item, width: w, height: h } : item,
            ),
         );
      };
      img.src = newFileObjs[0].originalUrl;

      showToast(`Loaded ${newFileObjs.length} image(s)`);
   };

   const removeFile = (index) => {
      if (files[index]?.originalUrl) {
         URL.revokeObjectURL(files[index].originalUrl);
      }
      const updated = files.filter((_, i) => i !== index);
      setFiles(updated);
      setSelectedFileIndex(Math.max(0, updated.length - 1));
      if (updated.length === 0) {
         setResult(null);
         setLivePreviewUrl(null);
         setLiveCompressedUrl(null);
      }
   };

   const clearAll = () => {
      files.forEach((f) => {
         if (f.originalUrl) URL.revokeObjectURL(f.originalUrl);
      });
      if (result?.url) URL.revokeObjectURL(result.url);
      if (livePreviewUrl) URL.revokeObjectURL(livePreviewUrl);
      if (liveCompressedUrl) URL.revokeObjectURL(liveCompressedUrl);
      setFiles([]);
      setSelectedFileIndex(0);
      setResult(null);
      setLivePreviewUrl(null);
      setLiveCompressedUrl(null);
      setBase64InputText('');
      setBase64Output('');
      setIsProcessing(false);
      showToast('Cleared all images and state');
   };

   const handleSwitchTool = (id) => {
      setActiveToolId(id);
      setResult(null);
   };

   // Aspect ratio update helper for Resize
   const handleWidthChange = (val) => {
      const w = parseInt(val, 10) || 0;
      setResizeWidth(w);
      if (lockAspectRatio && aspectRatioValue) {
         setResizeHeight(Math.round(w / aspectRatioValue));
      }
   };

   const handleHeightChange = (val) => {
      const h = parseInt(val, 10) || 0;
      setResizeHeight(h);
      if (lockAspectRatio && aspectRatioValue) {
         setResizeWidth(Math.round(h * aspectRatioValue));
      }
   };

   const handleAspectPresetChange = (presetValue) => {
      setCropPreset(presetValue);
      if (!activeFile) return;
      const img = new Image();
      img.onload = () => {
         const w = img.naturalWidth;
         const h = img.naturalHeight;
         const selectedPreset = ASPECT_RATIOS.find(
            (p) => p.value === presetValue,
         );
         if (!selectedPreset || !selectedPreset.ratio) {
            setCropX(0);
            setCropY(0);
            setCropWidth(w);
            setCropHeight(h);
            return;
         }
         const r = selectedPreset.ratio;
         let targetW = w;
         let targetH = Math.round(targetW / r);
         if (targetH > h) {
            targetH = h;
            targetW = Math.round(targetH * r);
         }
         setCropWidth(targetW);
         setCropHeight(targetH);
         setCropX(Math.round((w - targetW) / 2));
         setCropY(Math.round((h - targetH) / 2));
      };
      img.src = activeFile.originalUrl;
   };

   /* ----------------------------------------------------------------------- */
   /*  CORE PROCESSING ENGINES (100% CLIENT-SIDE CANVAS)                      */
   /* ----------------------------------------------------------------------- */

   const loadImage = (url) => {
      return new Promise((resolve, reject) => {
         const img = new Image();
         img.crossOrigin = 'anonymous';
         img.onload = () => resolve(img);
         img.onerror = () => reject(new Error('Failed to load image into memory'));
         img.src = url;
      });
   };

   const hexToRgb = (hex) => {
      const cleanHex = hex.replace('#', '');
      const num = parseInt(cleanHex, 16);
      if (cleanHex.length === 3) {
         const r = (num >> 8) & 0xf;
         const g = (num >> 4) & 0xf;
         const b = num & 0xf;
         return [r * 17, g * 17, b * 17];
      }
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
   };

   const canvasToBlobPromise = (c, mime, q) =>
      new Promise((res) => c.toBlob(res, mime, q));

   // Smart Adaptive Compression Engine
   const compressImageFile = async (
      fileObj,
      { format, mode, quality, targetKB, maxWidth, autoGuarantee },
   ) => {
      const img = await loadImage(fileObj.originalUrl);
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      const originalBytes = fileObj.size;

      let targetFormat = format;
      if (targetFormat === 'auto') {
         targetFormat =
            fileObj.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp';
      }

      const targetExt =
         FORMAT_OPTIONS.find((f) => f.id === targetFormat)?.ext ||
         (targetFormat === 'image/jpeg' ? 'jpg' : 'webp');

      let maxAllowedBytes = Infinity;
      if (mode === 'target-kb' && targetKB > 0) {
         maxAllowedBytes = targetKB * 1024;
      } else if (mode === 'auto' || autoGuarantee) {
         maxAllowedBytes = Math.round(originalBytes * 0.85); // Target at least 15% reduction
      }

      let targetW = naturalW;
      let targetH = naturalH;
      if (maxWidth > 0 && targetW > maxWidth) {
         targetH = Math.round((targetH * maxWidth) / targetW);
         targetW = maxWidth;
      }

      const renderCanvas = (scale = 1.0) => {
         const c = document.createElement('canvas');
         const w = Math.max(10, Math.round(targetW * scale));
         const h = Math.max(10, Math.round(targetH * scale));
         c.width = w;
         c.height = h;
         const cCtx = c.getContext('2d', { willReadFrequently: true });
         cCtx.imageSmoothingEnabled = true;
         cCtx.imageSmoothingQuality = 'high';
         if (targetFormat === 'image/jpeg') {
            cCtx.fillStyle = '#ffffff';
            cCtx.fillRect(0, 0, w, h);
         }
         cCtx.drawImage(img, 0, 0, w, h);
         return c;
      };

      let curCanvas = renderCanvas(1.0);
      let curQuality = mode === 'auto' ? 0.65 : quality;
      let curBlob = null;

      if (targetFormat === 'image/png') {
         curBlob = await canvasToBlobPromise(curCanvas, 'image/png');
         if (curBlob && curBlob.size >= originalBytes && autoGuarantee) {
            targetFormat = 'image/webp';
         }
      }

      if (targetFormat !== 'image/png') {
         curBlob = await canvasToBlobPromise(curCanvas, targetFormat, curQuality);

         if (curBlob && curBlob.size > maxAllowedBytes) {
            const testQualities = [0.55, 0.45, 0.35, 0.25, 0.15];
            for (const q of testQualities) {
               const testBlob = await canvasToBlobPromise(curCanvas, targetFormat, q);
               if (testBlob) {
                  curBlob = testBlob;
                  curQuality = q;
                  if (testBlob.size <= maxAllowedBytes) break;
               }
            }

            if (curBlob && curBlob.size >= originalBytes && autoGuarantee) {
               const downScales = [0.85, 0.70, 0.55];
               for (const sc of downScales) {
                  curCanvas = renderCanvas(sc);
                  const testBlob = await canvasToBlobPromise(curCanvas, targetFormat, 0.55);
                  if (testBlob && testBlob.size < originalBytes * 0.9) {
                     curBlob = testBlob;
                     curQuality = 0.55;
                     break;
                  }
               }
            }
         }
      }

      return {
         blob: curBlob,
         canvas: curCanvas,
         format: targetFormat,
         ext: targetExt,
         quality: curQuality,
      };
   };

   /* ----------------------------------------------------------------------- */
   /*  REAL-TIME REACTIVE LIVE PREVIEW GENERATOR                              */
   /* ----------------------------------------------------------------------- */

   useEffect(() => {
      let isCancelled = false;
      if (!activeFile) {
         setLivePreviewUrl(null);
         setLiveCompressedUrl(null);
         return;
      }

      const timer = setTimeout(async () => {
         try {
            const img = await loadImage(activeFile.originalUrl);
            if (isCancelled) return;
            const naturalW = img.naturalWidth || img.width;
            const naturalH = img.naturalHeight || img.height;

            if (activeToolId === 'compress-img') {
               const comp = await compressImageFile(activeFile, {
                  format: compressFormat,
                  mode: compressMode,
                  quality: compressQuality,
                  targetKB: compressTargetKB,
                  maxWidth: compressMaxWidth,
                  autoGuarantee: autoGuaranteeSmaller,
               });
               if (isCancelled) return;
               const compUrl = URL.createObjectURL(comp.blob);
               setLiveCompressedUrl(compUrl);
               setLivePreviewUrl(compUrl);
               setLiveMetrics({
                  width: comp.canvas.width,
                  height: comp.canvas.height,
                  estimatedSize: comp.blob.size,
               });
               return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            if (activeToolId === 'resize-img') {
               const w = Math.max(1, resizeWidth || naturalW);
               const h = Math.max(1, resizeHeight || naturalH);
               canvas.width = w;
               canvas.height = h;
               if (resizeFormat === 'image/jpeg') {
                  ctx.fillStyle = '#ffffff';
                  ctx.fillRect(0, 0, w, h);
               }
               ctx.drawImage(img, 0, 0, w, h);
            } else if (activeToolId === 'crop-img') {
               const sx = Math.max(0, Math.min(naturalW - 10, cropX));
               const sy = Math.max(0, Math.min(naturalH - 10, cropY));
               const sw = Math.max(10, Math.min(naturalW - sx, cropWidth));
               const sh = Math.max(10, Math.min(naturalH - sy, cropHeight));
               canvas.width = sw;
               canvas.height = sh;
               ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
            } else if (activeToolId === 'rotate-img') {
               const rad = (rotateAngle * Math.PI) / 180;
               const sin = Math.abs(Math.sin(rad));
               const cos = Math.abs(Math.cos(rad));
               const newW = Math.round(naturalW * cos + naturalH * sin);
               const newH = Math.round(naturalW * sin + naturalH * cos);
               canvas.width = newW;
               canvas.height = newH;
               ctx.translate(newW / 2, newH / 2);
               ctx.rotate(rad);
               ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
               ctx.drawImage(img, -naturalW / 2, -naturalH / 2);
            } else if (activeToolId === 'watermark-img') {
               canvas.width = naturalW;
               canvas.height = naturalH;
               ctx.drawImage(img, 0, 0);
               if (watermarkText.trim()) {
                  ctx.save();
                  ctx.globalAlpha = watermarkOpacity;
                  ctx.fillStyle = watermarkColor;
                  ctx.font = `bold ${watermarkSize}px Inter, sans-serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  if (watermarkTiled) {
                     const stepX = watermarkSize * 6;
                     const stepY = watermarkSize * 4;
                     for (let x = -naturalW; x < naturalW * 2; x += stepX) {
                        for (let y = -naturalH; y < naturalH * 2; y += stepY) {
                           ctx.save();
                           ctx.translate(x, y);
                           ctx.rotate((watermarkRotation * Math.PI) / 180);
                           ctx.fillText(watermarkText, 0, 0);
                           ctx.restore();
                        }
                     }
                  } else {
                     let px = naturalW / 2;
                     let py = naturalH / 2;
                     const pad = 40;
                     if (watermarkPosition.includes('left')) px = pad + watermarkSize * 2;
                     if (watermarkPosition.includes('right')) px = naturalW - pad - watermarkSize * 2;
                     if (watermarkPosition.includes('top')) py = pad + watermarkSize;
                     if (watermarkPosition.includes('bottom')) py = naturalH - pad - watermarkSize;
                     ctx.translate(px, py);
                     ctx.rotate((watermarkRotation * Math.PI) / 180);
                     ctx.fillText(watermarkText, 0, 0);
                  }
                  ctx.restore();
               }
            } else if (activeToolId === 'filter-img') {
               canvas.width = naturalW;
               canvas.height = naturalH;
               ctx.filter = `brightness(${filterBrightness}%) contrast(${filterContrast}%) saturate(${filterSaturate}%) grayscale(${filterGrayscale}%) sepia(${filterSepia}%) blur(${filterBlur}px) invert(${filterInvert}%)`;
               ctx.drawImage(img, 0, 0);
            } else if (activeToolId === 'remove-bg') {
               canvas.width = naturalW;
               canvas.height = naturalH;
               ctx.drawImage(img, 0, 0);
               const imageData = ctx.getImageData(0, 0, naturalW, naturalH);
               const data = imageData.data;
               const [targetR, targetG, targetB] = hexToRgb(keyColor);
               const maxTol = Math.max(1, tolerance * 4.41);
               const featherRange = Math.max(1, feather * 10);
               for (let i = 0; i < data.length; i += 4) {
                  const r = data[i];
                  const g = data[i + 1];
                  const b = data[i + 2];
                  const distance = Math.sqrt((r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2);
                  if (distance <= maxTol) {
                     if (distance > maxTol - featherRange) {
                        const alphaRatio = (distance - (maxTol - featherRange)) / featherRange;
                        data[i + 3] = Math.round(data[i + 3] * alphaRatio);
                     } else {
                        data[i + 3] = 0;
                     }
                  }
               }
               ctx.putImageData(imageData, 0, 0);
            } else if (activeToolId === 'meme-img') {
               canvas.width = naturalW;
               canvas.height = naturalH;
               ctx.drawImage(img, 0, 0);
               const fontFace = 'Impact, "Arial Black", Montserrat, sans-serif';
               ctx.font = `bold ${memeFontSize}px ${fontFace}`;
               ctx.textAlign = 'center';
               ctx.fillStyle = '#ffffff';
               ctx.strokeStyle = '#000000';
               ctx.lineWidth = Math.max(4, Math.round(memeFontSize * 0.12));
               ctx.lineJoin = 'round';
               const top = memeUppercase ? memeTopText.toUpperCase() : memeTopText;
               const bot = memeUppercase ? memeBottomText.toUpperCase() : memeBottomText;
               if (top) {
                  ctx.textBaseline = 'top';
                  ctx.strokeText(top, naturalW / 2, 24);
                  ctx.fillText(top, naturalW / 2, 24);
               }
               if (bot) {
                  ctx.textBaseline = 'bottom';
                  ctx.strokeText(bot, naturalW / 2, naturalH - 24);
                  ctx.fillText(bot, naturalW / 2, naturalH - 24);
               }
            } else {
               canvas.width = naturalW;
               canvas.height = naturalH;
               if (convertFormat === 'image/jpeg') {
                  ctx.fillStyle = '#ffffff';
                  ctx.fillRect(0, 0, naturalW, naturalH);
               }
               ctx.drawImage(img, 0, 0);
            }

            canvas.toBlob((blob) => {
               if (isCancelled || !blob) return;
               const url = URL.createObjectURL(blob);
               setLivePreviewUrl(url);
               setLiveMetrics({
                  width: canvas.width,
                  height: canvas.height,
                  estimatedSize: blob.size,
               });
            }, 'image/png');
         } catch (err) {
            console.error('Error updating live preview:', err);
         }
      }, 40);

      return () => {
         isCancelled = true;
         clearTimeout(timer);
      };
   }, [
      activeFile,
      activeToolId,
      compressFormat,
      compressMode,
      compressQuality,
      compressTargetKB,
      compressMaxWidth,
      autoGuaranteeSmaller,
      resizeWidth,
      resizeHeight,
      resizeFormat,
      cropPreset,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      rotateAngle,
      flipH,
      flipV,
      watermarkText,
      watermarkColor,
      watermarkOpacity,
      watermarkSize,
      watermarkRotation,
      watermarkPosition,
      watermarkTiled,
      filterBrightness,
      filterContrast,
      filterSaturate,
      filterGrayscale,
      filterSepia,
      filterBlur,
      filterInvert,
      keyColor,
      tolerance,
      feather,
      memeTopText,
      memeBottomText,
      memeFontSize,
      memeUppercase,
      convertFormat,
      convertQuality,
   ]);

   // Master process executor
   const executeProcessing = async () => {
      if (activeToolId === 'base64-img') {
         if (base64InputText.trim()) {
            try {
               const cleanStr = base64InputText.trim();
               const isDataUri = cleanStr.startsWith('data:image/');
               const finalUri = isDataUri
                  ? cleanStr
                  : `data:image/png;base64,${cleanStr}`;
               const img = await loadImage(finalUri);
               const canvas = document.createElement('canvas');
               canvas.width = img.naturalWidth || img.width;
               canvas.height = img.naturalHeight || img.height;
               const ctx = canvas.getContext('2d');
               ctx.drawImage(img, 0, 0);
               canvas.toBlob((blob) => {
                  const url = URL.createObjectURL(blob);
                  setResult({
                     url,
                     name: `decoded-image-${Date.now()}.png`,
                     size: blob.size,
                     width: canvas.width,
                     height: canvas.height,
                  });
                  setLivePreviewUrl(url);
                  showToast('Base64 decoded into image successfully!');
               }, 'image/png');
               return;
            } catch (err) {
               showToast('Invalid Base64 image data', 'error');
               return;
            }
         } else if (activeFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
               setBase64Output(reader.result);
               showToast('Generated Base64 Data URI string!');
            };
            reader.readAsDataURL(activeFile.file);
            return;
         }
      }

      if (!activeFile) {
         showToast('Please select or drop an image first', 'error');
         return;
      }

      setIsProcessing(true);

      try {
         const img = await loadImage(activeFile.originalUrl);
         const naturalW = img.naturalWidth || img.width;
         const naturalH = img.naturalHeight || img.height;

         const canvas = document.createElement('canvas');
         const ctx = canvas.getContext('2d', { willReadFrequently: true });
         ctx.imageSmoothingEnabled = true;
         ctx.imageSmoothingQuality = 'high';

         let finalBlob = null;
         let outputMime = 'image/png';
         let outputExt = 'png';
         let outputQuality = 0.92;

         /* --- TOOL 1: COMPRESS --- */
         if (activeToolId === 'compress-img') {
            const comp = await compressImageFile(activeFile, {
               format: compressFormat,
               mode: compressMode,
               quality: compressQuality,
               targetKB: compressTargetKB,
               maxWidth: compressMaxWidth,
               autoGuarantee: autoGuaranteeSmaller,
            });

            canvas.width = comp.canvas.width;
            canvas.height = comp.canvas.height;
            ctx.drawImage(comp.canvas, 0, 0);

            outputMime = comp.format;
            outputExt = comp.ext;
            finalBlob = comp.blob;
         }

         /* --- TOOL 2: RESIZE --- */
         else if (activeToolId === 'resize-img') {
            const w = Math.max(1, resizeWidth || naturalW);
            const h = Math.max(1, resizeHeight || naturalH);
            canvas.width = w;
            canvas.height = h;

            outputMime = resizeFormat;
            outputExt =
               FORMAT_OPTIONS.find((f) => f.id === resizeFormat)?.ext || 'png';

            if (resizeFormat === 'image/jpeg') {
               ctx.fillStyle = '#ffffff';
               ctx.fillRect(0, 0, w, h);
            }
            ctx.drawImage(img, 0, 0, w, h);
         }

         /* --- TOOL 3: CROP --- */
         else if (activeToolId === 'crop-img') {
            const sx = Math.max(0, Math.min(naturalW - 10, cropX));
            const sy = Math.max(0, Math.min(naturalH - 10, cropY));
            const sw = Math.max(10, Math.min(naturalW - sx, cropWidth));
            const sh = Math.max(10, Math.min(naturalH - sy, cropHeight));

            canvas.width = sw;
            canvas.height = sh;
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
         }

         /* --- TOOL 4: CONVERT --- */
         else if (activeToolId === 'convert-img') {
            canvas.width = naturalW;
            canvas.height = naturalH;
            outputMime = convertFormat;
            outputExt =
               FORMAT_OPTIONS.find((f) => f.id === convertFormat)?.ext || 'webp';
            outputQuality = convertQuality;

            if (convertFormat === 'image/jpeg') {
               ctx.fillStyle = '#ffffff';
               ctx.fillRect(0, 0, naturalW, naturalH);
            }
            ctx.drawImage(img, 0, 0, naturalW, naturalH);
         }

         /* --- TOOL 5: ROTATE & FLIP --- */
         else if (activeToolId === 'rotate-img') {
            const rad = (rotateAngle * Math.PI) / 180;
            const sin = Math.abs(Math.sin(rad));
            const cos = Math.abs(Math.cos(rad));
            const newW = Math.round(naturalW * cos + naturalH * sin);
            const newH = Math.round(naturalW * sin + naturalH * cos);

            canvas.width = newW;
            canvas.height = newH;

            ctx.translate(newW / 2, newH / 2);
            ctx.rotate(rad);
            ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
            ctx.drawImage(img, -naturalW / 2, -naturalH / 2);
         }

         /* --- TOOL 6: WATERMARK --- */
         else if (activeToolId === 'watermark-img') {
            canvas.width = naturalW;
            canvas.height = naturalH;
            ctx.drawImage(img, 0, 0);

            if (watermarkText.trim()) {
               ctx.save();
               ctx.globalAlpha = watermarkOpacity;
               ctx.fillStyle = watermarkColor;
               ctx.font = `bold ${watermarkSize}px Inter, sans-serif`;
               ctx.textAlign = 'center';
               ctx.textBaseline = 'middle';

               if (watermarkTiled) {
                  const stepX = watermarkSize * 6;
                  const stepY = watermarkSize * 4;
                  for (let x = -naturalW; x < naturalW * 2; x += stepX) {
                     for (let y = -naturalH; y < naturalH * 2; y += stepY) {
                        ctx.save();
                        ctx.translate(x, y);
                        ctx.rotate((watermarkRotation * Math.PI) / 180);
                        ctx.fillText(watermarkText, 0, 0);
                        ctx.restore();
                     }
                  }
               } else {
                  let px = naturalW / 2;
                  let py = naturalH / 2;
                  const pad = 40;

                  if (watermarkPosition.includes('left')) px = pad + watermarkSize * 2;
                  if (watermarkPosition.includes('right'))
                     px = naturalW - pad - watermarkSize * 2;
                  if (watermarkPosition.includes('top')) py = pad + watermarkSize;
                  if (watermarkPosition.includes('bottom'))
                     py = naturalH - pad - watermarkSize;

                  ctx.translate(px, py);
                  ctx.rotate((watermarkRotation * Math.PI) / 180);
                  ctx.fillText(watermarkText, 0, 0);
               }
               ctx.restore();
            }
         }

         /* --- TOOL 7: FILTERS & ADJUST --- */
         else if (activeToolId === 'filter-img') {
            canvas.width = naturalW;
            canvas.height = naturalH;
            ctx.filter = `brightness(${filterBrightness}%) contrast(${filterContrast}%) saturate(${filterSaturate}%) grayscale(${filterGrayscale}%) sepia(${filterSepia}%) blur(${filterBlur}px) invert(${filterInvert}%)`;
            ctx.drawImage(img, 0, 0);
         }

         /* --- TOOL 8: REMOVE BACKGROUND (CHROMA KEY) --- */
         else if (activeToolId === 'remove-bg') {
            canvas.width = naturalW;
            canvas.height = naturalH;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, naturalW, naturalH);
            const data = imageData.data;
            const [targetR, targetG, targetB] = hexToRgb(keyColor);
            const maxTol = Math.max(1, tolerance * 4.41);
            const featherRange = Math.max(1, feather * 10);

            for (let i = 0; i < data.length; i += 4) {
               const r = data[i];
               const g = data[i + 1];
               const b = data[i + 2];

               const distance = Math.sqrt(
                  (r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2,
               );

               if (distance <= maxTol) {
                  if (distance > maxTol - featherRange) {
                     const alphaRatio =
                        (distance - (maxTol - featherRange)) / featherRange;
                     data[i + 3] = Math.round(data[i + 3] * alphaRatio);
                  } else {
                     data[i + 3] = 0;
                  }
               }
            }
            ctx.putImageData(imageData, 0, 0);
            outputMime = 'image/png';
            outputExt = 'png';
         }

         /* --- TOOL 9: MEME GENERATOR --- */
         else if (activeToolId === 'meme-img') {
            canvas.width = naturalW;
            canvas.height = naturalH;
            ctx.drawImage(img, 0, 0);

            const fontFace = 'Impact, "Arial Black", Montserrat, sans-serif';
            ctx.font = `bold ${memeFontSize}px ${fontFace}`;
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = Math.max(4, Math.round(memeFontSize * 0.12));
            ctx.lineJoin = 'round';

            const top = memeUppercase ? memeTopText.toUpperCase() : memeTopText;
            const bot = memeUppercase
               ? memeBottomText.toUpperCase()
               : memeBottomText;

            if (top) {
               ctx.textBaseline = 'top';
               ctx.strokeText(top, naturalW / 2, 24);
               ctx.fillText(top, naturalW / 2, 24);
            }
            if (bot) {
               ctx.textBaseline = 'bottom';
               ctx.strokeText(bot, naturalW / 2, naturalH - 24);
               ctx.fillText(bot, naturalW / 2, naturalH - 24);
            }
         }

         // Convert canvas to blob & result
         const blob =
            finalBlob ||
            (await canvasToBlobPromise(canvas, outputMime, outputQuality));

         setIsProcessing(false);
         if (!blob) {
            showToast('Error generating image file', 'error');
            return;
         }

         const url = URL.createObjectURL(blob);
         const baseName =
            activeFile.name.substring(0, activeFile.name.lastIndexOf('.')) ||
            activeFile.name;
         const finalName = `${baseName}-${activeTool.id}.${outputExt}`;

         setResult({
            url,
            blob,
            name: finalName,
            size: blob.size,
            width: canvas.width,
            height: canvas.height,
            originalSize: activeFile.size,
         });

         showToast(`${activeTool.name} processed successfully!`);
      } catch (err) {
         setIsProcessing(false);
         showToast('Error processing image: ' + err.message, 'error');
      }
   };

   // Direct Download of current live preview
   const handleDownloadLive = async () => {
      if (result?.url) {
         const link = document.createElement('a');
         link.href = result.url;
         link.download = result.name;
         link.click();
         showToast(`Downloaded ${result.name}`);
         return;
      }
      await executeProcessing();
   };

   // Batch download all files in ZIP (for Compress & Convert tools)
   const handleBatchZipDownload = async () => {
      if (files.length === 0) return;
      setIsProcessing(true);
      try {
         const zip = new JSZip();
         showToast(`Compiling ${files.length} images into ZIP...`);

         for (let idx = 0; idx < files.length; idx++) {
            const f = files[idx];
            if (activeToolId === 'compress-img') {
               const comp = await compressImageFile(f, {
                  format: compressFormat,
                  mode: compressMode,
                  quality: compressQuality,
                  targetKB: compressTargetKB,
                  maxWidth: compressMaxWidth,
                  autoGuarantee: autoGuaranteeSmaller,
               });
               const base = f.name.substring(0, f.name.lastIndexOf('.')) || f.name;
               zip.file(`${base}-compressed.${comp.ext}`, comp.blob);
            } else {
               const img = await loadImage(f.originalUrl);
               const canvas = document.createElement('canvas');
               canvas.width = img.naturalWidth || img.width;
               canvas.height = img.naturalHeight || img.height;
               const ctx = canvas.getContext('2d');
               if (convertFormat === 'image/jpeg') {
                  ctx.fillStyle = '#ffffff';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
               }
               ctx.drawImage(img, 0, 0);

               const targetExt =
                  FORMAT_OPTIONS.find((fo) => fo.id === convertFormat)?.ext || 'webp';
               const blob = await canvasToBlobPromise(
                  canvas,
                  convertFormat,
                  convertQuality,
               );
               const base = f.name.substring(0, f.name.lastIndexOf('.')) || f.name;
               zip.file(`${base}-converted.${targetExt}`, blob);
            }
         }

         const zipBlob = await zip.generateAsync({ type: 'blob' });
         const link = document.createElement('a');
         link.href = URL.createObjectURL(zipBlob);
         link.download = `klique-images-bundle-${Date.now()}.zip`;
         link.click();
         URL.revokeObjectURL(link.href);
         setIsProcessing(false);
         showToast('Downloaded ZIP bundle successfully!');
      } catch (err) {
         setIsProcessing(false);
         showToast('Failed to create ZIP package', 'error');
      }
   };

   // Copy helper for Base64
   const handleCopy = (text, type) => {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      showToast(`Copied ${type} to clipboard!`);
      setTimeout(() => setCopiedType(null), 2000);
   };

   return (
      <div className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden px-3 py-6 sm:px-6 sm:py-8 md:px-10">
         {/* Ambient Backdrops */}
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         {/* SEO Metadata */}
         <SEO
            title="Image Tools Suite - Compress, Resize, Crop, Convert & Edit Online | Klique"
            description="All-in-one free online image tools suite. Compress, resize, crop, convert formats (PNG, JPG, WebP), rotate, watermark, apply filters, and erase backgrounds 100% client-side with zero file uploads."
            keywords="image tools, image compressor, resize image online, crop image, convert image to webp, remove background, rotate photo, watermark images, image filters, meme generator, base64 image converter, klique image suite"
            canonicalUrl="https://klique.netlify.app/imageoptimizer"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'Klique All-in-One Image Tools Suite',
               url: 'https://klique.netlify.app/imageoptimizer',
               applicationCategory: 'MultimediaApplication',
               operatingSystem: 'All',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Comprehensive in-browser image studio. Compress, resize, crop, convert formats, add watermarks, remove background, and apply filters client-side.',
               author: {
                  '@type': 'Organization',
                  name: 'Klique',
               },
               featureList: [
                  '100% client-side image compression with size reduction guarantee',
                  'Pixel & percentage image resizing with aspect ratio lock',
                  'Social aspect ratio crop tool (1:1, 16:9, 9:16, 4:3)',
                  'Batch conversion to WebP, PNG, JPEG, and BMP with ZIP export',
                  'Lossless image rotation and horizontal/vertical flips',
                  'Custom text watermarks with 9-point grid placement',
                  'Chroma-key background removal into transparent PNG',
                  'Instagram-style image filters and fine-tuning sliders',
                  'Impact font meme generator with outline stroke',
                  'Bidirectional Base64 image encoder and decoder',
               ],
            }}
         />

         {/* Navigation Bar */}
         <div className="relative z-[100] w-full mb-6">
            <Navbar
               sidebarOpen={sidebarOpen}
               setSidebarOpen={setSidebarOpen}
               isMobile={typeof window !== 'undefined' && window.innerWidth < 1024}
            />
         </div>

         {/* Toast Notification */}
         <AnimatePresence>
            {toast.visible && (
               <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="fixed right-4 top-4 z-[10000] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-xl border border-zinc-800 bg-[#0f0f11]/95 px-4 py-3 text-sm font-medium shadow-2xl shadow-black/50 backdrop-blur-xl sm:right-6 sm:top-6">
                  {toast.type === 'error' ? (
                     <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  ) : (
                     <CheckCircle2 className="w-4 h-4 text-[#daf4aa] shrink-0" />
                  )}
                  <span className="text-zinc-200">{toast.message}</span>
               </motion.div>
            )}
         </AnimatePresence>

         {/* Main Workspace Container */}
         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-3 pb-28 pt-10 sm:px-6 sm:pb-24 sm:pt-6 md:px-8 lg:pl-20">
            {/* Header Title */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-6 sm:mb-8 text-center sm:text-left">
               <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                  <ImageIcon size={14} className="text-[#daf4aa]" />
                  <span>Developer & Creator Studio</span>
               </div>
               <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                  Image Tools Suite
               </h1>
               <p className="mt-1.5 max-w-2xl text-xs sm:text-sm text-zinc-400 font-medium">
                  Compress, resize, crop, convert, watermark, and enhance your photos
                  instantly. 100% private in-browser processing with zero server uploads.
               </p>
            </motion.div>

            {/* Horizontal Tool Selection Grid (Mirrors PDFTools) */}
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
               <div className="relative w-full overflow-hidden rounded-3xl bg-[#121214] p-5 sm:p-8 border border-zinc-800/90 shadow-2xl transition-all duration-300">
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

                     {(files.length > 0 || base64InputText || result) && (
                        <button
                           type="button"
                           onClick={clearAll}
                           disabled={isProcessing}
                           className="self-start sm:self-auto text-xs font-semibold text-zinc-400 hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors">
                           <Trash2 size={14} /> Clear All
                        </button>
                     )}
                  </div>

                  {/* Base64 Text Input Area (if activeTool is base64) */}
                  {activeTool.id === 'base64-img' && (
                     <div className="mb-6 space-y-3">
                        <div className="flex items-center justify-between">
                           <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                              Option A: Paste Base64 String to Decode as Image
                           </label>
                           {base64InputText && (
                              <button
                                 type="button"
                                 onClick={() => setBase64InputText('')}
                                 className="text-[11px] text-zinc-500 hover:text-zinc-300">
                                 Clear Text
                              </button>
                           )}
                        </div>
                        <textarea
                           rows={3}
                           value={base64InputText}
                           onChange={(e) => setBase64InputText(e.target.value)}
                           placeholder="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
                           className="w-full rounded-2xl border border-white/[0.08] bg-[#16161b]/90 p-4 text-xs font-mono text-zinc-200 outline-none transition-all focus:border-[#daf4aa]/40 focus:ring-4 focus:ring-[#daf4aa]/[0.06] customScrollbar"
                        />
                     </div>
                  )}

                  {/* CASE 1: NO FILE UPLOADED YET - BIG WELCOMING DROPZONE */}
                  {files.length === 0 && (!base64InputText || activeTool.id !== 'base64-img') && (
                     <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                           e.preventDefault();
                           if (e.dataTransfer.files) handleAddFiles(e.dataTransfer.files);
                        }}
                        className="relative rounded-2xl border-2 border-dashed border-zinc-800 hover:border-[#daf4aa]/60 bg-[#16161b]/50 p-10 sm:p-14 text-center transition-all">
                        <input
                           type="file"
                           accept={activeTool.accept}
                           multiple={activeTool.multiple}
                           onChange={(e) => {
                              if (e.target.files) handleAddFiles(e.target.files);
                              e.target.value = '';
                           }}
                           className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#daf4aa]/10 border border-[#daf4aa]/20 text-[#daf4aa] mb-4">
                           <Upload size={28} />
                        </div>
                        <h3 className="text-base font-bold text-white mb-1">
                           {activeTool.multiple
                              ? 'Drop your images here, or browse files'
                              : 'Drop an image here, or browse file'}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-400 max-w-md mx-auto">
                           Supports JPG, PNG, WebP, SVG, and BMP. Processed 100% locally in your browser memory.
                        </p>
                     </div>
                  )}

                  {/* CASE 2: FILE UPLOADED - PROMINENT METADATA & LIVE PREVIEW WORKSPACE */}
                  {activeFile && (
                     <div className="space-y-6">
                        {/* File Metadata Bar & Upload More / Replace Action */}
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-[#16161b] px-4 py-3">
                           <div className="flex items-center gap-3 min-w-0">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 text-[#daf4aa]">
                                 <FileImage size={20} />
                              </div>
                              <div className="min-w-0">
                                 <h4 className="truncate text-sm font-bold text-white max-w-[200px] sm:max-w-xs md:max-w-md">
                                    {activeFile.name}
                                 </h4>
                                 <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                                    <span>
                                       {activeFile.width && activeFile.height
                                          ? `${activeFile.width} × ${activeFile.height} px`
                                          : 'Image loaded'}
                                    </span>
                                    <span>•</span>
                                    <span>{(activeFile.size / 1024).toFixed(1)} KB</span>
                                    <span className="rounded bg-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-300 uppercase">
                                       {activeFile.type.replace('image/', '')}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-2">
                              {/* Add / Replace Image Input */}
                              <label className="relative flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-[#daf4aa] hover:text-[#daf4aa] cursor-pointer transition-all">
                                 <Plus size={14} />
                                 <span>{activeTool.multiple ? 'Add More' : 'Replace Image'}</span>
                                 <input
                                    type="file"
                                    accept={activeTool.accept}
                                    multiple={activeTool.multiple}
                                    onChange={(e) => {
                                       if (e.target.files) handleAddFiles(e.target.files);
                                       e.target.value = '';
                                    }}
                                    className="hidden"
                                 />
                              </label>

                              <button
                                 type="button"
                                 onClick={() => removeFile(selectedFileIndex)}
                                 className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-red-400 transition-colors"
                                 title="Remove active image">
                                 <Trash2 size={13} />
                              </button>
                           </div>
                        </div>

                        {/* Multi-File Thumbnail Reel */}
                        {files.length > 1 && (
                           <div className="flex items-center gap-2 overflow-x-auto pb-1 customScrollbar">
                              {files.map((f, i) => (
                                 <div
                                    key={i}
                                    onClick={() => {
                                       setSelectedFileIndex(i);
                                       setResult(null);
                                    }}
                                    className={`group relative flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border p-2 transition-all ${
                                       selectedFileIndex === i
                                          ? 'border-[#daf4aa] bg-[#1a1a22]'
                                          : 'border-zinc-800 bg-[#121214] hover:border-zinc-700'
                                    }`}>
                                    <img
                                       src={f.originalUrl}
                                       alt={f.name}
                                       className="h-10 w-10 rounded-lg object-cover"
                                    />
                                    <div className="max-w-[100px] text-left">
                                       <p className="truncate text-xs font-medium text-zinc-200">
                                          {f.name}
                                       </p>
                                       <p className="text-[10px] text-zinc-500">
                                          {(f.size / 1024).toFixed(1)} KB
                                       </p>
                                    </div>
                                    <button
                                       type="button"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          removeFile(i);
                                       }}
                                       className="ml-1 text-zinc-500 hover:text-red-400 p-0.5">
                                       <Trash2 size={12} />
                                    </button>
                                 </div>
                              ))}
                           </div>
                        )}

                        {/* =================================================== */}
                        {/* THE PROMINENT LIVE PREVIEW STAGE                    */}
                        {/* =================================================== */}
                        <div className="relative rounded-2xl border border-zinc-800 bg-[#0a0a0c] p-3 sm:p-5 overflow-hidden shadow-inner">
                           {/* Transparency Checkerboard Pattern */}
                           <div
                              className="absolute inset-0 opacity-15 pointer-events-none"
                              style={{
                                 backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                                 backgroundSize: '16px 16px',
                              }}
                           />

                           {/* TOOL 1: COMPRESS SPLIT BEFORE/AFTER COMPARISON VIEW */}
                           {activeToolId === 'compress-img' && (
                              <div className="relative w-full flex flex-col items-center">
                                 <div className="relative w-full h-[320px] sm:h-[420px] max-w-4xl rounded-xl overflow-hidden bg-black/40 border border-zinc-800/80 flex items-center justify-center select-none">
                                    {/* After (Optimized) Image Layer */}
                                    <img
                                       src={liveCompressedUrl || activeFile.originalUrl}
                                       alt="Optimized Preview"
                                       className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                    />

                                    {/* Before (Original) Image Layer - Clipped by Slider */}
                                    <div
                                       className="absolute inset-0 overflow-hidden pointer-events-none"
                                       style={{ width: `${sliderPos}%` }}>
                                       <img
                                          src={activeFile.originalUrl}
                                          alt="Original Preview"
                                          className="absolute inset-0 w-full h-full object-contain max-w-none"
                                       />
                                    </div>

                                    {/* Split Divider Bar */}
                                    <div
                                       className="absolute top-0 bottom-0 w-0.5 bg-[#daf4aa] pointer-events-none z-10 flex items-center justify-center shadow-[0_0_15px_rgba(218,244,170,0.5)]"
                                       style={{ left: `${sliderPos}%` }}>
                                       <div className="w-8 h-8 rounded-full bg-[#16161b] border-2 border-[#daf4aa] flex items-center justify-center shadow-lg">
                                          <Split className="w-4 h-4 text-[#daf4aa]" />
                                       </div>
                                    </div>

                                    {/* Invisible Range Slider on top for smooth dragging */}
                                    <input
                                       type="range"
                                       min={0}
                                       max={100}
                                       value={sliderPos}
                                       onChange={(e) => setSliderPos(Number(e.target.value))}
                                       className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                                       title="Drag left/right to compare Before & After"
                                    />

                                    {/* Floating Informational Badges */}
                                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono text-zinc-300 pointer-events-none">
                                       <span className="text-zinc-400">Original:</span>{' '}
                                       <span className="font-bold text-white">
                                          {(activeFile.size / 1024).toFixed(1)} KB
                                       </span>
                                    </div>
                                    <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono text-[#daf4aa] pointer-events-none">
                                       <span className="text-zinc-400">Optimized:</span>{' '}
                                       <span className="font-bold text-[#daf4aa]">
                                          {liveMetrics.estimatedSize
                                             ? `${(liveMetrics.estimatedSize / 1024).toFixed(1)} KB`
                                             : 'Calculating...'}
                                       </span>
                                       {liveMetrics.estimatedSize > 0 && (
                                          <span className="ml-1.5 font-bold">
                                             (
                                             {(
                                                ((activeFile.size - liveMetrics.estimatedSize) /
                                                   activeFile.size) *
                                                100
                                             ).toFixed(1)}
                                             % saved)
                                          </span>
                                       )}
                                    </div>

                                    <div className="absolute bottom-3 inset-x-0 mx-auto w-fit z-10 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[11px] text-zinc-400 pointer-events-none">
                                       ⇄ Drag slider horizontally to compare clarity
                                    </div>
                                 </div>
                              </div>
                           )}

                           {/* TOOL 3: CROP LIVE OVERLAY & PREVIEW */}
                           {activeToolId === 'crop-img' && (
                              <div className="relative w-full flex flex-col items-center">
                                 <div className="relative w-full h-[320px] sm:h-[400px] max-w-4xl rounded-xl overflow-hidden bg-black/40 border border-zinc-800 flex items-center justify-center p-2">
                                    <img
                                       src={livePreviewUrl || activeFile.originalUrl}
                                       alt="Cropped Preview"
                                       className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                                    />
                                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono text-zinc-200">
                                       Cropped Output: {liveMetrics.width || cropWidth} ×{' '}
                                       {liveMetrics.height || cropHeight} px
                                    </div>
                                 </div>
                              </div>
                           )}

                           {/* ALL OTHER TOOLS: REAL-TIME CANVAS LIVE PREVIEW */}
                           {activeToolId !== 'compress-img' && activeToolId !== 'crop-img' && (
                              <div className="relative w-full flex flex-col items-center">
                                 <div className="relative w-full h-[320px] sm:h-[420px] max-w-4xl rounded-xl overflow-hidden bg-black/40 border border-zinc-800/80 flex items-center justify-center p-2">
                                    <img
                                       src={livePreviewUrl || activeFile.originalUrl}
                                       alt={`${activeTool.name} Live Preview`}
                                       className="relative max-h-full max-w-full rounded-lg object-contain shadow-2xl transition-all duration-150"
                                    />
                                    <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono text-zinc-300">
                                       Live Preview: {liveMetrics.width || activeFile.width || 0} ×{' '}
                                       {liveMetrics.height || activeFile.height || 0} px
                                    </div>
                                    {activeToolId === 'remove-bg' && (
                                       <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[11px] text-[#daf4aa]">
                                          Transparency Preview (Checkerboard)
                                       </div>
                                    )}
                                 </div>
                              </div>
                           )}
                        </div>

                        {/* =================================================== */}
                        {/* TOOL SETTINGS & CONTROLS SECTION                    */}
                        {/* =================================================== */}
                        <div className="rounded-2xl border border-zinc-800/80 bg-[#16161b]/70 p-5 space-y-5">
                           {/* 1. COMPRESS SETTINGS */}
                           {activeToolId === 'compress-img' && (
                              <div className="space-y-4">
                                 {/* Strategy Tabs & Size Indicator */}
                                 <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                                    <div>
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                          Compression Strategy
                                       </label>
                                       <div className="flex flex-wrap gap-2">
                                          {[
                                             { id: 'auto', label: 'Smart Auto (Guaranteed Reduction)' },
                                             { id: 'slider', label: 'Quality Slider' },
                                             { id: 'target-kb', label: 'Target Max Size (KB)' },
                                          ].map((m) => (
                                             <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setCompressMode(m.id)}
                                                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                                                   compressMode === m.id
                                                      ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                                      : 'border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:border-zinc-600'
                                                }`}>
                                                {m.label}
                                             </button>
                                          ))}
                                       </div>
                                    </div>

                                    <div className="flex items-center gap-2 rounded-xl bg-zinc-800/60 border border-zinc-700/60 px-3 py-1.5 text-xs">
                                       <span className="text-zinc-400">Original File:</span>
                                       <span className="font-mono font-bold text-white">
                                          {(activeFile.size / 1024).toFixed(1)} KB
                                       </span>
                                    </div>
                                 </div>

                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                          Output Format
                                       </label>
                                       <select
                                          value={compressFormat}
                                          onChange={(e) => setCompressFormat(e.target.value)}
                                          className="w-full rounded-xl border border-zinc-700 bg-[#121214] px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#daf4aa]">
                                          {COMPRESS_FORMAT_OPTIONS.map((f) => (
                                             <option key={f.id} value={f.id}>
                                                {f.label}
                                             </option>
                                          ))}
                                       </select>
                                       {compressFormat === 'image/png' && (
                                          <p className="mt-1 text-[11px] text-amber-400">
                                             Note: PNG is lossless. Photos may increase in size; use WebP/JPEG for compression.
                                          </p>
                                       )}
                                    </div>

                                    {compressMode === 'slider' && (
                                       <div>
                                          <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                             Quality ({Math.round(compressQuality * 100)}%)
                                          </label>
                                          <input
                                             type="range"
                                             min="0.1"
                                             max="0.95"
                                             step="0.05"
                                             value={compressQuality}
                                             onChange={(e) =>
                                                setCompressQuality(parseFloat(e.target.value))
                                             }
                                             className="w-full accent-[#daf4aa] cursor-pointer"
                                          />
                                          <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                                             <span>Ultra (30%)</span>
                                             <span>Balanced (65%)</span>
                                             <span>High (85%)</span>
                                          </div>
                                       </div>
                                    )}

                                    {compressMode === 'target-kb' && (
                                       <div>
                                          <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                             Desired File Size Target
                                          </label>
                                          <div className="flex items-center gap-2">
                                             <input
                                                type="number"
                                                value={compressTargetKB}
                                                onChange={(e) =>
                                                   setCompressTargetKB(
                                                      Math.max(10, parseInt(e.target.value, 10) || 0),
                                                   )
                                                }
                                                placeholder="e.g. 200"
                                                className="w-full rounded-xl border border-zinc-700 bg-[#121214] px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:border-[#daf4aa]"
                                             />
                                             <span className="text-xs font-semibold text-zinc-400">KB</span>
                                          </div>
                                          <div className="flex gap-1.5 mt-1.5">
                                             {[100, 200, 300, 500].map((kb) => (
                                                <button
                                                   key={kb}
                                                   type="button"
                                                   onClick={() => setCompressTargetKB(kb)}
                                                   className="rounded-lg border border-zinc-800 bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-300 hover:border-[#daf4aa]">
                                                   {kb}KB
                                                </button>
                                             ))}
                                          </div>
                                       </div>
                                    )}

                                    {compressMode === 'auto' && (
                                       <div>
                                          <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                             Auto Optimization
                                          </label>
                                          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-2 text-xs text-zinc-300">
                                             <span className="text-[#daf4aa] font-semibold">Adaptive:</span> Auto-adjusts bitrate to guarantee significant size reduction without visible degradation.
                                          </div>
                                       </div>
                                    )}

                                    <div>
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                          Max Width (Optional Scale)
                                       </label>
                                       <select
                                          value={compressMaxWidth}
                                          onChange={(e) =>
                                             setCompressMaxWidth(parseInt(e.target.value, 10))
                                          }
                                          className="w-full rounded-xl border border-zinc-700 bg-[#121214] px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#daf4aa]">
                                          <option value={0}>Original Dimensions (No scale)</option>
                                          <option value={1920}>1920px (Full HD)</option>
                                          <option value={1280}>1280px (Web Optimized)</option>
                                          <option value={800}>800px (Mobile / Blog)</option>
                                          <option value={400}>400px (Thumbnail)</option>
                                       </select>
                                    </div>
                                 </div>

                                 <label className="flex items-center gap-2 cursor-pointer pt-2">
                                    <input
                                       type="checkbox"
                                       checked={autoGuaranteeSmaller}
                                       onChange={(e) => setAutoGuaranteeSmaller(e.target.checked)}
                                       className="rounded border-zinc-700 text-[#daf4aa] focus:ring-0"
                                    />
                                    <span className="text-xs font-medium text-zinc-300">
                                       Guaranteed Size Reduction (Auto-step quality to ensure output is strictly smaller than original)
                                    </span>
                                 </label>
                              </div>
                           )}

                           {/* 2. RESIZE SETTINGS */}
                           {activeToolId === 'resize-img' && (
                              <div className="space-y-4">
                                 <div className="flex flex-wrap items-center gap-4">
                                    <div className="w-36">
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1 block">
                                          Width (px)
                                       </label>
                                       <input
                                          type="number"
                                          value={resizeWidth}
                                          onChange={(e) => handleWidthChange(e.target.value)}
                                          className="w-full rounded-xl border border-zinc-700 bg-[#121214] px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:border-[#daf4aa]"
                                       />
                                    </div>
                                    <button
                                       type="button"
                                       onClick={() => setLockAspectRatio(!lockAspectRatio)}
                                       title={
                                          lockAspectRatio
                                             ? 'Aspect Ratio Locked'
                                             : 'Aspect Ratio Free'
                                       }
                                       className={`mt-4 flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
                                          lockAspectRatio
                                             ? 'border-[#daf4aa]/60 bg-[#daf4aa]/15 text-[#daf4aa]'
                                             : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                                       }`}>
                                       {lockAspectRatio ? (
                                          <LinkIcon size={16} />
                                       ) : (
                                          <Unlink size={16} />
                                       )}
                                    </button>
                                    <div className="w-36">
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1 block">
                                          Height (px)
                                       </label>
                                       <input
                                          type="number"
                                          value={resizeHeight}
                                          onChange={(e) => handleHeightChange(e.target.value)}
                                          className="w-full rounded-xl border border-zinc-700 bg-[#121214] px-3 py-2 text-xs font-mono text-zinc-200 outline-none focus:border-[#daf4aa]"
                                       />
                                    </div>
                                    <div className="w-44">
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1 block">
                                          Format
                                       </label>
                                       <select
                                          value={resizeFormat}
                                          onChange={(e) => setResizeFormat(e.target.value)}
                                          className="w-full rounded-xl border border-zinc-700 bg-[#121214] px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#daf4aa]">
                                          {FORMAT_OPTIONS.map((f) => (
                                             <option key={f.id} value={f.id}>
                                                {f.label}
                                             </option>
                                          ))}
                                       </select>
                                    </div>
                                 </div>
                                 <div className="flex flex-wrap items-center gap-2 pt-1">
                                    <span className="text-[11px] font-semibold text-zinc-400 mr-2">
                                       Quick Scale:
                                    </span>
                                    {[25, 50, 75, 150, 200].map((pct) => (
                                       <button
                                          key={pct}
                                          type="button"
                                          onClick={() => {
                                             if (aspectRatioValue && activeFile.width) {
                                                const newW = Math.round((activeFile.width * pct) / 100);
                                                handleWidthChange(newW);
                                             }
                                          }}
                                          className="rounded-lg border border-zinc-700/80 bg-zinc-800/60 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:border-[#daf4aa] hover:text-[#daf4aa]">
                                          {pct}%
                                       </button>
                                    ))}
                                 </div>
                              </div>
                           )}

                           {/* 3. CROP SETTINGS */}
                           {activeToolId === 'crop-img' && (
                              <div className="space-y-4">
                                 <div>
                                    <label className="text-xs font-semibold uppercase text-zinc-400 mb-2 block">
                                       Social & Aspect Ratio Presets
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                       {ASPECT_RATIOS.map((ar) => (
                                          <button
                                             key={ar.value}
                                             type="button"
                                             onClick={() => handleAspectPresetChange(ar.value)}
                                             className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                                                cropPreset === ar.value
                                                   ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                                   : 'border-zinc-700 bg-zinc-800/80 text-zinc-300 hover:border-zinc-600'
                                             }`}>
                                             {ar.label}
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                    <div>
                                       <label className="text-[11px] text-zinc-400 block mb-1">
                                          X Offset: {cropX}px
                                       </label>
                                       <input
                                          type="range"
                                          min="0"
                                          max={Math.max(100, (activeFile.width || 1200) - 50)}
                                          value={cropX}
                                          onChange={(e) => setCropX(parseInt(e.target.value, 10))}
                                          className="w-full accent-[#daf4aa]"
                                       />
                                    </div>
                                    <div>
                                       <label className="text-[11px] text-zinc-400 block mb-1">
                                          Y Offset: {cropY}px
                                       </label>
                                       <input
                                          type="range"
                                          min="0"
                                          max={Math.max(100, (activeFile.height || 1200) - 50)}
                                          value={cropY}
                                          onChange={(e) => setCropY(parseInt(e.target.value, 10))}
                                          className="w-full accent-[#daf4aa]"
                                       />
                                    </div>
                                    <div>
                                       <label className="text-[11px] text-zinc-400 block mb-1">
                                          Crop Width: {cropWidth}px
                                       </label>
                                       <input
                                          type="range"
                                          min="50"
                                          max={activeFile.width || 2000}
                                          value={cropWidth}
                                          onChange={(e) =>
                                             setCropWidth(parseInt(e.target.value, 10))
                                          }
                                          className="w-full accent-[#daf4aa]"
                                       />
                                    </div>
                                    <div>
                                       <label className="text-[11px] text-zinc-400 block mb-1">
                                          Crop Height: {cropHeight}px
                                       </label>
                                       <input
                                          type="range"
                                          min="50"
                                          max={activeFile.height || 2000}
                                          value={cropHeight}
                                          onChange={(e) =>
                                             setCropHeight(parseInt(e.target.value, 10))
                                          }
                                          className="w-full accent-[#daf4aa]"
                                       />
                                    </div>
                                 </div>
                              </div>
                           )}

                           {/* 4. CONVERT SETTINGS */}
                           {activeToolId === 'convert-img' && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div>
                                    <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                       Target Format
                                    </label>
                                    <select
                                       value={convertFormat}
                                       onChange={(e) => setConvertFormat(e.target.value)}
                                       className="w-full rounded-xl border border-zinc-700 bg-[#121214] px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#daf4aa]">
                                       {FORMAT_OPTIONS.map((f) => (
                                          <option key={f.id} value={f.id}>
                                             {f.label}
                                          </option>
                                       ))}
                                    </select>
                                 </div>
                                 <div>
                                    <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                       Output Quality ({Math.round(convertQuality * 100)}%)
                                    </label>
                                    <input
                                       type="range"
                                       min="0.2"
                                       max="1.0"
                                       step="0.05"
                                       value={convertQuality}
                                       onChange={(e) =>
                                          setConvertQuality(parseFloat(e.target.value))
                                       }
                                       className="w-full accent-[#daf4aa] mt-2 cursor-pointer"
                                    />
                                 </div>
                              </div>
                           )}

                           {/* 5. ROTATE & FLIP SETTINGS */}
                           {activeToolId === 'rotate-img' && (
                              <div className="space-y-4">
                                 <div className="flex flex-wrap items-center gap-3">
                                    <button
                                       type="button"
                                       onClick={() => setRotateAngle((prev) => (prev + 90) % 360)}
                                       className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:border-[#daf4aa] hover:text-[#daf4aa]">
                                       <RotateCw size={14} /> +90° Clockwise
                                    </button>
                                    <button
                                       type="button"
                                       onClick={() =>
                                          setRotateAngle((prev) => (prev - 90 + 360) % 360)
                                       }
                                       className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:border-[#daf4aa] hover:text-[#daf4aa]">
                                       <RotateCcw size={14} /> -90° Counter-CW
                                    </button>
                                    <button
                                       type="button"
                                       onClick={() => setFlipH(!flipH)}
                                       className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                                          flipH
                                             ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                             : 'border-zinc-700 bg-zinc-800 text-zinc-200'
                                       }`}>
                                       <FlipHorizontal size={14} /> Flip Horizontal
                                    </button>
                                    <button
                                       type="button"
                                       onClick={() => setFlipV(!flipV)}
                                       className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                                          flipV
                                             ? 'border-[#daf4aa] bg-[#daf4aa]/15 text-[#daf4aa]'
                                             : 'border-zinc-700 bg-zinc-800 text-zinc-200'
                                       }`}>
                                       <FlipVertical size={14} /> Flip Vertical
                                    </button>
                                 </div>
                                 <div className="pt-2">
                                    <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                       Fine-Tune Rotation Angle: {rotateAngle}°
                                    </label>
                                    <input
                                       type="range"
                                       min="0"
                                       max="360"
                                       value={rotateAngle}
                                       onChange={(e) =>
                                          setRotateAngle(parseInt(e.target.value, 10))
                                       }
                                       className="w-full accent-[#daf4aa]"
                                    />
                                 </div>
                              </div>
                           )}

                           {/* 6. WATERMARK SETTINGS */}
                           {activeToolId === 'watermark-img' && (
                              <div className="space-y-4">
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                          Watermark Text
                                       </label>
                                       <input
                                          type="text"
                                          value={watermarkText}
                                          onChange={(e) => setWatermarkText(e.target.value)}
                                          placeholder="e.g. © 2026 YOUR NAME"
                                          className="w-full rounded-xl border border-zinc-700 bg-[#121214] px-3.5 py-2 text-xs text-zinc-200 outline-none focus:border-[#daf4aa]"
                                       />
                                    </div>
                                    <div className="flex items-center gap-4">
                                       <div>
                                          <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                             Color
                                          </label>
                                          <input
                                             type="color"
                                             value={watermarkColor}
                                             onChange={(e) => setWatermarkColor(e.target.value)}
                                             className="h-9 w-14 rounded-xl border border-zinc-700 bg-zinc-800 p-1 cursor-pointer"
                                          />
                                       </div>
                                       <div className="flex-1">
                                          <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                             Opacity ({Math.round(watermarkOpacity * 100)}%)
                                          </label>
                                          <input
                                             type="range"
                                             min="0.1"
                                             max="1.0"
                                             step="0.05"
                                             value={watermarkOpacity}
                                             onChange={(e) =>
                                                setWatermarkOpacity(parseFloat(e.target.value))
                                             }
                                             className="w-full accent-[#daf4aa]"
                                          />
                                       </div>
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                                    <div>
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                          Font Size: {watermarkSize}px
                                       </label>
                                       <input
                                          type="range"
                                          min="16"
                                          max="120"
                                          value={watermarkSize}
                                          onChange={(e) =>
                                             setWatermarkSize(parseInt(e.target.value, 10))
                                          }
                                          className="w-full accent-[#daf4aa]"
                                       />
                                    </div>
                                    <div>
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                          Rotation Angle: {watermarkRotation}°
                                       </label>
                                       <input
                                          type="range"
                                          min="-90"
                                          max="90"
                                          value={watermarkRotation}
                                          onChange={(e) =>
                                             setWatermarkRotation(parseInt(e.target.value, 10))
                                          }
                                          className="w-full accent-[#daf4aa]"
                                       />
                                    </div>
                                    <div>
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                          Grid Placement
                                       </label>
                                       <select
                                          value={watermarkPosition}
                                          onChange={(e) =>
                                             setWatermarkPosition(e.target.value)
                                          }
                                          className="w-full rounded-xl border border-zinc-700 bg-[#121214] px-3 py-2 text-xs text-zinc-200 outline-none focus:border-[#daf4aa]">
                                          {WATERMARK_POSITIONS.map((pos) => (
                                             <option key={pos.id} value={pos.id}>
                                                {pos.label}
                                             </option>
                                          ))}
                                       </select>
                                    </div>
                                 </div>
                                 <label className="flex items-center gap-2 cursor-pointer pt-1">
                                    <input
                                       type="checkbox"
                                       checked={watermarkTiled}
                                       onChange={(e) => setWatermarkTiled(e.target.checked)}
                                       className="rounded border-zinc-700 text-[#daf4aa] focus:ring-0"
                                    />
                                    <span className="text-xs font-medium text-zinc-300">
                                       Repeat as diagonal full-page security pattern
                                    </span>
                                 </label>
                              </div>
                           )}

                           {/* 7. FILTER SETTINGS */}
                           {activeToolId === 'filter-img' && (
                              <div className="space-y-4">
                                 <div>
                                    <label className="text-xs font-semibold uppercase text-zinc-400 mb-2 block">
                                       One-Click Presets
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                       {FILTER_PRESETS.map((p) => (
                                          <button
                                             key={p.name}
                                             type="button"
                                             onClick={() => {
                                                setFilterBrightness(p.brightness);
                                                setFilterContrast(p.contrast);
                                                setFilterSaturate(p.saturate);
                                                setFilterGrayscale(p.grayscale);
                                                setFilterSepia(p.sepia);
                                                setFilterBlur(p.blur);
                                                setFilterInvert(p.invert);
                                             }}
                                             className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:border-[#daf4aa] hover:text-[#daf4aa]">
                                             {p.name}
                                          </button>
                                       ))}
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                    <div>
                                       <label className="text-[11px] text-zinc-400 block mb-1">
                                          Brightness: {filterBrightness}%
                                       </label>
                                       <input
                                          type="range"
                                          min="50"
                                          max="180"
                                          value={filterBrightness}
                                          onChange={(e) =>
                                             setFilterBrightness(parseInt(e.target.value, 10))
                                          }
                                          className="w-full accent-[#daf4aa]"
                                       />
                                    </div>
                                    <div>
                                       <label className="text-[11px] text-zinc-400 block mb-1">
                                          Contrast: {filterContrast}%
                                       </label>
                                       <input
                                          type="range"
                                          min="50"
                                          max="200"
                                          value={filterContrast}
                                          onChange={(e) =>
                                             setFilterContrast(parseInt(e.target.value, 10))
                                          }
                                          className="w-full accent-[#daf4aa]"
                                       />
                                    </div>
                                    <div>
                                       <label className="text-[11px] text-zinc-400 block mb-1">
                                          Saturation: {filterSaturate}%
                                       </label>
                                       <input
                                          type="range"
                                          min="0"
                                          max="250"
                                          value={filterSaturate}
                                          onChange={(e) =>
                                             setFilterSaturate(parseInt(e.target.value, 10))
                                          }
                                          className="w-full accent-[#daf4aa]"
                                       />
                                    </div>
                                    <div>
                                       <label className="text-[11px] text-zinc-400 block mb-1">
                                          Blur: {filterBlur}px
                                       </label>
                                       <input
                                          type="range"
                                          min="0"
                                          max="15"
                                          value={filterBlur}
                                          onChange={(e) =>
                                             setFilterBlur(parseInt(e.target.value, 10))
                                          }
                                          className="w-full accent-[#daf4aa]"
                                       />
                                    </div>
                                 </div>
                              </div>
                           )}

                           {/* 8. REMOVE BACKGROUND SETTINGS */}
                           {activeToolId === 'remove-bg' && (
                              <div className="space-y-4">
                                 <div className="flex flex-wrap items-center gap-4">
                                    <div>
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                          Target Color to Erase
                                       </label>
                                       <div className="flex items-center gap-2">
                                          <input
                                             type="color"
                                             value={keyColor}
                                             onChange={(e) => setKeyColor(e.target.value)}
                                             className="h-9 w-14 rounded-xl border border-zinc-700 bg-zinc-800 p-1 cursor-pointer"
                                          />
                                          <div className="flex gap-1.5">
                                             {[
                                                { label: 'White', color: '#ffffff' },
                                                { label: 'Black', color: '#000000' },
                                                { label: 'Green', color: '#00ff00' },
                                             ].map((p) => (
                                                <button
                                                   key={p.color}
                                                   type="button"
                                                   onClick={() => setKeyColor(p.color)}
                                                   className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] font-medium text-zinc-300 hover:border-[#daf4aa]">
                                                   {p.label}
                                                </button>
                                             ))}
                                          </div>
                                       </div>
                                    </div>
                                    <div className="flex-1 min-w-[160px]">
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                          Tolerance ({tolerance})
                                       </label>
                                       <input
                                          type="range"
                                          min="5"
                                          max="80"
                                          value={tolerance}
                                          onChange={(e) =>
                                             setTolerance(parseInt(e.target.value, 10))
                                          }
                                          className="w-full accent-[#daf4aa]"
                                       />
                                    </div>
                                    <div className="w-32">
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                          Feathering ({feather}px)
                                       </label>
                                       <input
                                          type="range"
                                          min="0"
                                          max="15"
                                          value={feather}
                                          onChange={(e) =>
                                             setFeather(parseInt(e.target.value, 10))
                                          }
                                          className="w-full accent-[#daf4aa]"
                                       />
                                    </div>
                                 </div>
                              </div>
                           )}

                           {/* 9. MEME SETTINGS */}
                           {activeToolId === 'meme-img' && (
                              <div className="space-y-4">
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                          Top Caption Text
                                       </label>
                                       <input
                                          type="text"
                                          value={memeTopText}
                                          onChange={(e) => setMemeTopText(e.target.value)}
                                          className="w-full rounded-xl border border-zinc-700 bg-[#121214] px-3.5 py-2 text-xs font-bold text-zinc-200 uppercase outline-none focus:border-[#daf4aa]"
                                       />
                                    </div>
                                    <div>
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1.5 block">
                                          Bottom Caption Text
                                       </label>
                                       <input
                                          type="text"
                                          value={memeBottomText}
                                          onChange={(e) => setMemeBottomText(e.target.value)}
                                          className="w-full rounded-xl border border-zinc-700 bg-[#121214] px-3.5 py-2 text-xs font-bold text-zinc-200 uppercase outline-none focus:border-[#daf4aa]"
                                       />
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-4 pt-1">
                                    <div className="flex-1">
                                       <label className="text-xs font-semibold uppercase text-zinc-400 mb-1 block">
                                          Font Size: {memeFontSize}px
                                       </label>
                                       <input
                                          type="range"
                                          min="24"
                                          max="90"
                                          value={memeFontSize}
                                          onChange={(e) =>
                                             setMemeFontSize(parseInt(e.target.value, 10))
                                          }
                                          className="w-full accent-[#daf4aa]"
                                       />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer pt-4">
                                       <input
                                          type="checkbox"
                                          checked={memeUppercase}
                                          onChange={(e) => setMemeUppercase(e.target.checked)}
                                          className="rounded border-zinc-700 text-[#daf4aa] focus:ring-0"
                                       />
                                       <span className="text-xs font-medium text-zinc-300">
                                          Auto Uppercase
                                       </span>
                                    </label>
                                 </div>
                              </div>
                           )}

                           {/* Primary Action / Execution Bar */}
                           <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
                              <div className="flex items-center gap-2 text-xs text-zinc-400">
                                 <span>Live State:</span>
                                 <span className="font-semibold text-zinc-200">
                                    {liveMetrics.width && liveMetrics.height
                                       ? `${liveMetrics.width} × ${liveMetrics.height} px`
                                       : `${activeFile.width || 0} × ${activeFile.height || 0} px`}
                                 </span>
                                 <span className="text-zinc-500">
                                    {liveMetrics.estimatedSize > 0
                                       ? `(${(liveMetrics.estimatedSize / 1024).toFixed(1)} KB)`
                                       : `(${(activeFile.size / 1024).toFixed(1)} KB)`}
                                 </span>
                              </div>

                              <div className="flex items-center gap-3">
                                 {files.length > 1 &&
                                    (activeToolId === 'compress-img' ||
                                       activeToolId === 'convert-img') && (
                                       <button
                                          type="button"
                                          onClick={handleBatchZipDownload}
                                          disabled={isProcessing}
                                          className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-200 hover:border-[#daf4aa] hover:text-[#daf4aa] transition-all">
                                          <FileArchive size={15} /> Download All (ZIP)
                                       </button>
                                    )}

                                 <button
                                    type="button"
                                    onClick={handleDownloadLive}
                                    disabled={isProcessing}
                                    className="flex items-center gap-2 rounded-xl bg-[#daf4aa] px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-lg shadow-[#daf4aa]/10 hover:bg-[#cde99a] active:scale-95 transition-all disabled:opacity-50">
                                    {isProcessing ? (
                                       <RefreshCw size={15} className="animate-spin" />
                                    ) : (
                                       <Download size={15} />
                                    )}
                                    <span>
                                       {isProcessing
                                          ? 'Processing...'
                                          : `Download ${activeTool.name}`}
                                    </span>
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Base64 Output Section */}
                  {activeTool.id === 'base64-img' && base64Output && (
                     <div className="mt-6 rounded-2xl border border-zinc-800/80 bg-[#16161b] p-5 space-y-4">
                        <div className="flex items-center justify-between">
                           <h3 className="text-sm font-bold text-white flex items-center gap-2">
                              <Code2 size={16} className="text-[#daf4aa]" />
                              Generated Base64 Data URI
                           </h3>
                           <span className="text-[11px] text-zinc-500 font-mono">
                              Length: {base64Output.length.toLocaleString()} chars
                           </span>
                        </div>

                        <div className="relative">
                           <textarea
                              rows={4}
                              readOnly
                              value={base64Output}
                              className="w-full rounded-xl border border-zinc-800 bg-[#121214] p-3 text-xs font-mono text-zinc-300 outline-none select-all customScrollbar"
                           />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                           <button
                              type="button"
                              onClick={() => handleCopy(base64Output, 'Data URI')}
                              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:border-[#daf4aa] hover:text-[#daf4aa]">
                              {copiedType === 'Data URI' ? (
                                 <Check size={14} className="text-emerald-400" />
                              ) : (
                                 <Copy size={14} />
                              )}
                              Copy Data URI
                           </button>
                           <button
                              type="button"
                              onClick={() =>
                                 handleCopy(
                                    `<img src="${base64Output}" alt="Klique Image" />`,
                                    'HTML Tag',
                                 )
                              }
                              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:border-[#daf4aa] hover:text-[#daf4aa]">
                              {copiedType === 'HTML Tag' ? (
                                 <Check size={14} className="text-emerald-400" />
                              ) : (
                                 <Copy size={14} />
                              )}
                              Copy &lt;img&gt; Tag
                           </button>
                           <button
                              type="button"
                              onClick={() =>
                                 handleCopy(
                                    `background-image: url('${base64Output}');`,
                                    'CSS Rule',
                                 )
                              }
                              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 hover:border-[#daf4aa] hover:text-[#daf4aa]">
                              {copiedType === 'CSS Rule' ? (
                                 <Check size={14} className="text-emerald-400" />
                              ) : (
                                 <Copy size={14} />
                              )}
                              Copy CSS Rule
                           </button>
                        </div>
                     </div>
                  )}

                  {/* Result Showcase Card (shown after manual click or full process) */}
                  {result && (
                     <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 rounded-2xl border border-[#daf4aa]/30 bg-[#16161b]/90 p-5 sm:p-6 shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                           <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#daf4aa]/20 text-[#daf4aa]">
                                 <CheckCircle2 size={20} />
                              </div>
                              <div>
                                 <h3 className="text-sm font-bold text-white">
                                    Processed Output Ready
                                 </h3>
                                 <p className="text-xs text-zinc-400">
                                    {result.width} × {result.height} px •{' '}
                                    <span className="font-mono font-semibold text-zinc-200">
                                       {(result.size / 1024).toFixed(1)} KB
                                    </span>
                                    {result.originalSize && (
                                       result.size < result.originalSize ? (
                                          <span className="ml-2 font-semibold text-[#daf4aa]">
                                             (Saved{' '}
                                             {(
                                                ((result.originalSize - result.size) /
                                                   result.originalSize) *
                                                100
                                             ).toFixed(1)}
                                             % • {(result.originalSize / 1024).toFixed(1)} KB →{' '}
                                             {(result.size / 1024).toFixed(1)} KB)
                                          </span>
                                       ) : (
                                          <span className="ml-2 font-semibold text-amber-400">
                                             (+
                                             {(
                                                ((result.size - result.originalSize) /
                                                   result.originalSize) *
                                                100
                                             ).toFixed(1)}
                                             % larger due to lossless format conversion)
                                          </span>
                                       )
                                    )}
                                 </p>
                              </div>
                           </div>

                           <a
                              href={result.url}
                              download={result.name}
                              className="flex items-center justify-center gap-2 rounded-xl bg-[#daf4aa] px-5 py-2.5 text-xs font-bold text-zinc-950 shadow-md hover:bg-[#cde99a] transition-all">
                              <Download size={15} />
                              <span>Download {result.name}</span>
                           </a>
                        </div>

                        {/* Interactive Preview Canvas / Container */}
                        <div className="mt-5 relative flex items-center justify-center rounded-xl border border-zinc-800 bg-[#0c0c0e] p-4 overflow-hidden min-h-[220px]">
                           <div
                              className="absolute inset-0 opacity-20"
                              style={{
                                 backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
                                 backgroundSize: '16px 16px',
                              }}
                           />
                           <img
                              src={result.url}
                              alt="Result Preview"
                              className="relative max-h-[360px] w-auto max-w-full rounded-lg object-contain shadow-2xl"
                           />
                        </div>
                     </motion.div>
                  )}
               </div>
            </div>
         </main>
      </div>
   );
}
