/* eslint-disable no-unused-vars */
import React, {
   useState,
   useEffect,
   useRef,
   useMemo,
   useCallback,
} from 'react';
import {
   QrCode,
   Link2,
   Wifi,
   Contact,
   FileText,
   Mail,
   Phone,
   MessageSquare,
   Download,
   Copy,
   Check,
   RefreshCw,
   ExternalLink,
   Sliders,
   Image as ImageIcon,
   ShieldCheck,
   Trash2,
   Upload,
   Sparkles,
   Split,
   Binary,
   Layers,
   AlertCircle,
   Info,
   Share2,
   ArrowRight,
   ArrowLeftRight,
   Zap,
   Plus,
   Minus,
   Search,
   CheckCircle2,
   Scan,
   Eraser,
   Send,
   Globe,
   Hash,
   Braces,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import Navbar from '../Navbar';
import SEO from '../SEO';

/* -------------------------------------------------------------------------- */
/*  CONSTANTS & PRESETS                                                       */
/* -------------------------------------------------------------------------- */

const TABS = [
   {
      id: 'qr-generator',
      label: 'QR Generator',
      icon: QrCode,
      badge: 'High-Res',
   },
   { id: 'qr-scanner', label: 'QR Scanner', icon: Scan, badge: 'Auto-Detect' },
   {
      id: 'utm-builder',
      label: 'UTM Campaign Builder',
      icon: Zap,
      badge: 'Marketing',
   },
   {
      id: 'url-parser',
      label: 'URL Parser & Params',
      icon: Split,
      badge: 'Interactive',
   },
   {
      id: 'url-encoder',
      label: 'URL Encoder / Decoder',
      icon: Binary,
      badge: 'Base64 & URI',
   },
   {
      id: 'direct-links',
      label: 'Direct Links Hub',
      icon: Share2,
      badge: 'WhatsApp & Mail',
   },
   {
      id: 'url-cleaner',
      label: 'Privacy Link Cleaner',
      icon: Eraser,
      badge: 'Anti-Tracking',
   },
];

const QR_DATA_TYPES = [
   { id: 'url', label: 'Website / URL', icon: Globe },
   { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
   { id: 'vcard', label: 'Contact Card (vCard)', icon: Contact },
   { id: 'text', label: 'Plain Text', icon: FileText },
   { id: 'whatsapp', label: 'WhatsApp Chat', icon: MessageSquare },
   { id: 'email', label: 'Email Message', icon: Mail },
   { id: 'sms', label: 'SMS Text', icon: Send },
   { id: 'phone', label: 'Phone Call', icon: Phone },
];

const COLOR_PRESETS_FG = [
   { label: 'Obsidian Black', value: '#000000' },
   { label: 'Electric Indigo', value: '#6366f1' },
   { label: 'Cyan Glow', value: '#06b6d4' },
   { label: 'Emerald Mint', value: '#10b981' },
   { label: 'Sunset Amber', value: '#f59e0b' },
   { label: 'Neon Rose', value: '#f43f5e' },
   { label: 'Royal Violet', value: '#8b5cf6' },
   { label: 'Crisp White', value: '#ffffff' },
];

const COLOR_PRESETS_BG = [
   { label: 'Crisp White', value: '#ffffff' },
   { label: 'Slate Dark', value: '#0f172a' },
   { label: 'Midnight Black', value: '#050508' },
   { label: 'Soft Cream', value: '#faf8f5' },
   { label: 'Ice Blue', value: '#f0f9ff' },
   { label: 'Transparent', value: 'transparent' },
];

const UTM_PRESETS = [
   {
      name: 'Google Ads',
      source: 'google',
      medium: 'cpc',
      campaign: 'brand_search',
   },
   {
      name: 'Meta / Facebook Ads',
      source: 'facebook',
      medium: 'cpc',
      campaign: 'feed_prospecting',
   },
   {
      name: 'Email Newsletter',
      source: 'newsletter',
      medium: 'email',
      campaign: 'weekly_digest',
   },
   {
      name: 'Twitter / X Post',
      source: 'x.com',
      medium: 'social',
      campaign: 'organic_launch',
   },
   {
      name: 'LinkedIn Post',
      source: 'linkedin',
      medium: 'social',
      campaign: 'thought_leadership',
   },
   {
      name: 'YouTube Link',
      source: 'youtube',
      medium: 'video',
      campaign: 'description_cta',
   },
];

const TRACKING_PARAMS = [
   'utm_source',
   'utm_medium',
   'utm_campaign',
   'utm_term',
   'utm_content',
   'utm_id',
   'utm_source_platform',
   'utm_creative_format',
   'utm_marketing_tactic',
   'fbclid',
   'gclid',
   'gclsrc',
   'dclid',
   'msclkid',
   'mc_eid',
   'mc_cid',
   'igshid',
   '_hsenc',
   '_hsmi',
   'vero_id',
   'ref',
   'ref_src',
   'ref_url',
   'source',
   'spm',
   'si',
   'feature',
   'yclid',
   'zanpid',
];

export default function QRCodeLinkTools() {
   const [activeTab, setActiveTab] = useState('qr-generator');
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

   /* ----------------------------------------------------------------------- */
   /*  TAB 1: QR CODE GENERATOR STATE                                         */
   /* ----------------------------------------------------------------------- */
   const [qrType, setQrType] = useState('url');
   const [qrUrl, setQrUrl] = useState('https://klique.netlify.app');
   const [qrWifi, setQrWifi] = useState({
      ssid: 'MyHomeWiFi',
      password: '',
      encryption: 'WPA',
      hidden: false,
   });
   const [qrVcard, setQrVcard] = useState({
      firstName: 'Alex',
      lastName: 'Rivers',
      phone: '+1 555 019 2834',
      email: 'alex@example.com',
      org: 'Klique Studios',
      title: 'Product Designer',
      website: 'https://klique.netlify.app',
      note: 'Met at Design Summit',
   });
   const [qrText, setQrText] = useState(
      'Klique - All-in-one Creator & Developer Toolbox',
   );
   const [qrWhatsApp, setQrWhatsApp] = useState({
      phone: '14155552671',
      message: 'Hello! I am reaching out from your website.',
   });
   const [qrEmail, setQrEmail] = useState({
      to: 'contact@example.com',
      subject: 'Project Inquiry',
      body: 'Hi, I would love to connect!',
   });
   const [qrSms, setQrSms] = useState({
      phone: '14155552671',
      message: 'Check out this link: https://klique.netlify.app',
   });
   const [qrPhone, setQrPhone] = useState('+14155552671');

   // Styling Options
   const [fgColor, setFgColor] = useState('#000000');
   const [bgColor, setBgColor] = useState('#ffffff');
   const [qrSize, setQrSize] = useState(384);
   const [errorLevel, setErrorLevel] = useState('H');
   const [qrMargin, setQrMargin] = useState(2);
   const [centerLogo, setCenterLogo] = useState(null); // Data URL or null
   const [logoSizePercent, setLogoSizePercent] = useState(22); // 15% - 28%

   const canvasRef = useRef(null);
   const [isGenerating, setIsGenerating] = useState(false);
   const [lastGeneratedPayload, setLastGeneratedPayload] = useState('');

   // Compute final QR payload string based on current type
   const qrPayload = useMemo(() => {
      switch (qrType) {
         case 'url': {
            let u = qrUrl.trim();
            if (u && !/^https?:\/\//i.test(u) && !u.startsWith('/')) {
               u = 'https://' + u;
            }
            return u || 'https://klique.netlify.app';
         }
         case 'wifi': {
            const enc = qrWifi.encryption || 'WPA';
            const hidden = qrWifi.hidden ? 'true' : 'false';
            return `WIFI:T:${enc};S:${qrWifi.ssid};P:${qrWifi.password};H:${hidden};;`;
         }
         case 'vcard': {
            const parts = [
               'BEGIN:VCARD',
               'VERSION:3.0',
               `N:${qrVcard.lastName};${qrVcard.firstName};;;`,
               `FN:${qrVcard.firstName} ${qrVcard.lastName}`.trim(),
            ];
            if (qrVcard.org) parts.push(`ORG:${qrVcard.org}`);
            if (qrVcard.title) parts.push(`TITLE:${qrVcard.title}`);
            if (qrVcard.phone) parts.push(`TEL;TYPE=CELL:${qrVcard.phone}`);
            if (qrVcard.email) parts.push(`EMAIL:${qrVcard.email}`);
            if (qrVcard.website) parts.push(`URL:${qrVcard.website}`);
            if (qrVcard.note) parts.push(`NOTE:${qrVcard.note}`);
            parts.push('END:VCARD');
            return parts.join('\n');
         }
         case 'whatsapp': {
            const cleanPhone = qrWhatsApp.phone.replace(/[^0-9]/g, '');
            const encodedMsg = encodeURIComponent(qrWhatsApp.message);
            return `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
         }
         case 'email': {
            const params = [];
            if (qrEmail.subject)
               params.push(`subject=${encodeURIComponent(qrEmail.subject)}`);
            if (qrEmail.body)
               params.push(`body=${encodeURIComponent(qrEmail.body)}`);
            const qs = params.length > 0 ? `?${params.join('&')}` : '';
            return `mailto:${qrEmail.to.trim()}${qs}`;
         }
         case 'sms': {
            const cleanPhone = qrSms.phone.replace(/[^0-9+]/g, '');
            const body = qrSms.message
               ? `?body=${encodeURIComponent(qrSms.message)}`
               : '';
            return `sms:${cleanPhone}${body}`;
         }
         case 'phone': {
            const cleanPhone = qrPhone.replace(/[^0-9+]/g, '');
            return `tel:${cleanPhone}`;
         }
         case 'text':
         default:
            return qrText || 'Hello from Klique!';
      }
   }, [
      qrType,
      qrUrl,
      qrWifi,
      qrVcard,
      qrWhatsApp,
      qrEmail,
      qrSms,
      qrPhone,
      qrText,
   ]);

   // Generate QR onto canvas with center logo support
   const renderQRCode = useCallback(async () => {
      if (!canvasRef.current) return;
      setIsGenerating(true);
      try {
         const canvas = canvasRef.current;
         const ctx = canvas.getContext('2d');
         const actualSize = qrSize;

         // Temporary offscreen canvas for crisp QR render
         const tempCanvas = document.createElement('canvas');
         await QRCode.toCanvas(tempCanvas, qrPayload, {
            width: actualSize,
            margin: qrMargin,
            errorCorrectionLevel: errorLevel,
            color: {
               dark: fgColor,
               light: bgColor === 'transparent' ? '#00000000' : bgColor,
            },
         });

         canvas.width = actualSize;
         canvas.height = actualSize;

         ctx.clearRect(0, 0, actualSize, actualSize);
         if (bgColor !== 'transparent') {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, actualSize, actualSize);
         }
         ctx.drawImage(tempCanvas, 0, 0);

         // Center Logo drawing
         if (centerLogo) {
            const logoImg = new Image();
            logoImg.crossOrigin = 'anonymous';
            logoImg.src = centerLogo;
            await new Promise((resolve, reject) => {
               logoImg.onload = resolve;
               logoImg.onerror = reject;
            });

            const logoPx = Math.floor(actualSize * (logoSizePercent / 100));
            const badgePx = logoPx + 16;
            const center = actualSize / 2;
            const badgeRadius = 12;

            // Draw contrasting badge backing
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.25)';
            ctx.shadowBlur = 10;
            ctx.fillStyle = bgColor === 'transparent' ? '#ffffff' : bgColor;

            ctx.beginPath();
            ctx.roundRect(
               center - badgePx / 2,
               center - badgePx / 2,
               badgePx,
               badgePx,
               badgeRadius,
            );
            ctx.fill();

            // Border around logo badge
            ctx.strokeStyle = fgColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();

            // Draw image inside
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(
               center - logoPx / 2,
               center - logoPx / 2,
               logoPx,
               logoPx,
               8,
            );
            ctx.clip();
            ctx.drawImage(
               logoImg,
               center - logoPx / 2,
               center - logoPx / 2,
               logoPx,
               logoPx,
            );
            ctx.restore();
         }

         setLastGeneratedPayload(qrPayload);
      } catch (err) {
         console.error('Failed to generate QR Code:', err);
      } finally {
         setIsGenerating(false);
      }
   }, [
      qrPayload,
      qrSize,
      qrMargin,
      errorLevel,
      fgColor,
      bgColor,
      centerLogo,
      logoSizePercent,
   ]);

   // Render only after React has committed the preview canvas to the DOM.
   // The animation-frame callback also handles the first mount and tab switches.
   useEffect(() => {
      if (activeTab !== 'qr-generator') return undefined;

      let cancelled = false;
      const frameId = requestAnimationFrame(() => {
         if (!cancelled && canvasRef.current) {
            renderQRCode();
         }
      });

      return () => {
         cancelled = true;
         cancelAnimationFrame(frameId);
      };
   }, [activeTab, renderQRCode]);

   // Handle Logo Upload
   const handleLogoUpload = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) {
         showToast('Please upload a valid image file', 'error');
         return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
         setCenterLogo(event.target.result);
         setErrorLevel('H');
         showToast(
            'Logo added! Error correction set to High for scan reliability.',
         );
      };
      reader.readAsDataURL(file);
   };

   // Download Actions
   const downloadPNG = () => {
      if (!canvasRef.current) return;
      const link = document.createElement('a');
      link.download = `klique-qrcode-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png', 1.0);
      link.click();
      showToast('Downloaded High-Res PNG QR Code!');
   };

   const downloadSVG = async () => {
      try {
         const svgString = await QRCode.toString(qrPayload, {
            type: 'svg',
            margin: qrMargin,
            errorCorrectionLevel: errorLevel,
            color: {
               dark: fgColor,
               light: bgColor === 'transparent' ? '#00000000' : bgColor,
            },
         });
         const blob = new Blob([svgString], {
            type: 'image/svg+xml;charset=utf-8',
         });
         const url = URL.createObjectURL(blob);
         const link = document.createElement('a');
         link.href = url;
         link.download = `klique-qrcode-${Date.now()}.svg`;
         link.click();
         URL.revokeObjectURL(url);
         showToast('Downloaded Vector SVG QR Code!');
      } catch (err) {
         showToast('Could not generate SVG: ' + err.message, 'error');
      }
   };

   const copyQRImageToClipboard = async () => {
      if (!canvasRef.current) return;
      try {
         canvasRef.current.toBlob(async (blob) => {
            if (!blob) throw new Error('Canvas blob failed');
            await navigator.clipboard.write([
               new ClipboardItem({ 'image/png': blob }),
            ]);
            showToast('QR Code image copied to clipboard!');
         });
      } catch (err) {
         navigator.clipboard.writeText(qrPayload);
         showToast('Copied QR raw payload to clipboard!');
      }
   };

   /* ----------------------------------------------------------------------- */
   /*  TAB 2: QR SCANNER / DECODER STATE                                      */
   /* ----------------------------------------------------------------------- */
   const [scannedResult, setScannedResult] = useState(null);
   const [scannedImagePreview, setScannedImagePreview] = useState(null);
   const [isScanning, setIsScanning] = useState(false);

   const processImageForQR = (imgSrc) => {
      setIsScanning(true);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
         const canvas = document.createElement('canvas');
         const ctx = canvas.getContext('2d');
         canvas.width = img.width;
         canvas.height = img.height;
         ctx.drawImage(img, 0, 0);

         const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
         const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
         });

         setIsScanning(false);
         if (code && code.data) {
            setScannedResult({
               raw: code.data,
               parsedType: detectQRContent(code.data),
               timestamp: new Date().toLocaleTimeString(),
            });
            showToast('QR Code scanned and decoded successfully!');
         } else {
            const codeInvert = jsQR(
               imageData.data,
               imageData.width,
               imageData.height,
               {
                  inversionAttempts: 'invertFirst',
               },
            );
            if (codeInvert && codeInvert.data) {
               setScannedResult({
                  raw: codeInvert.data,
                  parsedType: detectQRContent(codeInvert.data),
                  timestamp: new Date().toLocaleTimeString(),
               });
               showToast('QR Code decoded with inverted contrast!');
            } else {
               showToast(
                  'No QR code detected in this image. Try a sharper image.',
                  'error',
               );
            }
         }
      };
      img.onerror = () => {
         setIsScanning(false);
         showToast('Failed to load image for scanning', 'error');
      };
      img.src = imgSrc;
   };

   const detectQRContent = (text) => {
      const trimmed = text.trim();
      if (/^https?:\/\//i.test(trimmed)) {
         return { type: 'URL', isUrl: true, url: trimmed };
      }
      if (/^WIFI:/i.test(trimmed)) {
         const ssid = trimmed.match(/S:([^;]+)/i)?.[1] || 'Unknown';
         const password = trimmed.match(/P:([^;]+)/i)?.[1] || 'None / Open';
         const enc = trimmed.match(/T:([^;]+)/i)?.[1] || 'WPA';
         return { type: 'Wi-Fi', isWifi: true, ssid, password, enc };
      }
      if (/BEGIN:VCARD/i.test(trimmed)) {
         const name =
            trimmed.match(/FN:([^\r\n]+)/i)?.[1] ||
            trimmed.match(/N:([^\r\n]+)/i)?.[1] ||
            '';
         const phone = trimmed.match(/TEL[^:]*:([^\r\n]+)/i)?.[1] || '';
         const email = trimmed.match(/EMAIL[^:]*:([^\r\n]+)/i)?.[1] || '';
         const org = trimmed.match(/ORG[^:]*:([^\r\n]+)/i)?.[1] || '';
         return {
            type: 'Contact Card (vCard)',
            isVcard: true,
            name,
            phone,
            email,
            org,
         };
      }
      if (/^mailto:/i.test(trimmed)) {
         return {
            type: 'Email',
            isMail: true,
            mail: trimmed.replace(/^mailto:/i, ''),
         };
      }
      if (/^tel:/i.test(trimmed)) {
         return {
            type: 'Phone',
            isPhone: true,
            phone: trimmed.replace(/^tel:/i, ''),
         };
      }
      if (/^sms:/i.test(trimmed)) {
         return {
            type: 'SMS',
            isSms: true,
            sms: trimmed.replace(/^sms:/i, ''),
         };
      }
      return { type: 'Plain Text', isText: true, text: trimmed };
   };

   const handleScanFileUpload = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
         setScannedImagePreview(event.target.result);
         processImageForQR(event.target.result);
      };
      reader.readAsDataURL(file);
   };

   useEffect(() => {
      const handlePaste = (e) => {
         if (activeTab !== 'qr-scanner') return;
         const items = e.clipboardData?.items;
         if (!items) return;
         for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
               const blob = items[i].getAsFile();
               const reader = new FileReader();
               reader.onload = (event) => {
                  setScannedImagePreview(event.target.result);
                  processImageForQR(event.target.result);
                  showToast('Pasted image from clipboard!');
               };
               reader.readAsDataURL(blob);
               break;
            }
         }
      };
      window.addEventListener('paste', handlePaste);
      return () => window.removeEventListener('paste', handlePaste);
   }, [activeTab]);

   const loadScannedIntoGenerator = () => {
      if (!scannedResult) return;
      const raw = scannedResult.raw;
      if (scannedResult.parsedType?.isUrl) {
         setQrType('url');
         setQrUrl(raw);
      } else if (scannedResult.parsedType?.isWifi) {
         setQrType('wifi');
         setQrWifi({
            ssid: scannedResult.parsedType.ssid,
            password:
               scannedResult.parsedType.password === 'None / Open'
                  ? ''
                  : scannedResult.parsedType.password,
            encryption: scannedResult.parsedType.enc,
            hidden: false,
         });
      } else {
         setQrType('text');
         setQrText(raw);
      }
      setActiveTab('qr-generator');
      showToast('Loaded scanned payload into QR Designer!');
   };

   /* ----------------------------------------------------------------------- */
   /*  TAB 3: UTM CAMPAIGN LINK BUILDER STATE                                 */
   /* ----------------------------------------------------------------------- */
   const [utmWebsite, setUtmWebsite] = useState('https://klique.netlify.app');
   const [utmSource, setUtmSource] = useState('google');
   const [utmMedium, setUtmMedium] = useState('cpc');
   const [utmCampaign, setUtmCampaign] = useState('creator_tools_launch');
   const [utmTerm, setUtmTerm] = useState('qr+code+generator');
   const [utmContent, setUtmContent] = useState('hero_banner_cta');

   const generatedUtmUrl = useMemo(() => {
      let base = utmWebsite.trim();
      if (!base) return '';
      if (!/^https?:\/\//i.test(base) && !base.startsWith('/')) {
         base = 'https://' + base;
      }
      try {
         const urlObj = new URL(base);
         if (utmSource.trim())
            urlObj.searchParams.set('utm_source', utmSource.trim());
         if (utmMedium.trim())
            urlObj.searchParams.set('utm_medium', utmMedium.trim());
         if (utmCampaign.trim())
            urlObj.searchParams.set('utm_campaign', utmCampaign.trim());
         if (utmTerm.trim())
            urlObj.searchParams.set('utm_term', utmTerm.trim());
         if (utmContent.trim())
            urlObj.searchParams.set('utm_content', utmContent.trim());
         return urlObj.toString();
      } catch (err) {
         return base;
      }
   }, [utmWebsite, utmSource, utmMedium, utmCampaign, utmTerm, utmContent]);

   const applyUtmPreset = (preset) => {
      setUtmSource(preset.source);
      setUtmMedium(preset.medium);
      setUtmCampaign(preset.campaign);
      showToast(`Applied preset: ${preset.name}`);
   };

   const sendUtmToQrGenerator = () => {
      setQrType('url');
      setQrUrl(generatedUtmUrl);
      setActiveTab('qr-generator');
      showToast('Sent UTM Campaign link to QR Designer!');
   };

   /* ----------------------------------------------------------------------- */
   /*  TAB 4: URL PARSER & QUERY PARAMS EDITOR STATE                          */
   /* ----------------------------------------------------------------------- */
   const [parseInputUrl, setParseInputUrl] = useState(
      'https://shop.example.com:8080/products/shoes?category=running&brand=nike&sort=desc&page=1#reviews',
   );
   const [parsedParamsList, setParsedParamsList] = useState([]);
   const [parsedUrlParts, setParsedUrlParts] = useState(null);

   useEffect(() => {
      try {
         let raw = parseInputUrl.trim();
         if (!raw) {
            setParsedUrlParts(null);
            setParsedParamsList([]);
            return;
         }
         if (!/^https?:\/\//i.test(raw) && !raw.startsWith('/')) {
            raw = 'https://' + raw;
         }
         const urlObj = new URL(raw);
         setParsedUrlParts({
            protocol: urlObj.protocol,
            hostname: urlObj.hostname,
            port: urlObj.port || '(default 80/443)',
            pathname: urlObj.pathname,
            hash: urlObj.hash,
            origin: urlObj.origin,
            isSecure: urlObj.protocol === 'https:',
         });

         const list = [];
         urlObj.searchParams.forEach((val, key) => {
            list.push({
               id: Math.random().toString(36).substring(2, 9),
               key,
               value: val,
            });
         });
         setParsedParamsList(list);
      } catch (err) {
         setParsedUrlParts(null);
         setParsedParamsList([]);
      }
   }, [parseInputUrl]);

   const reconstructedUrl = useMemo(() => {
      if (!parsedUrlParts) return parseInputUrl;
      try {
         let base = parseInputUrl.trim();
         if (!/^https?:\/\//i.test(base) && !base.startsWith('/')) {
            base = 'https://' + base;
         }
         const urlObj = new URL(base);
         urlObj.search = '';
         parsedParamsList.forEach((item) => {
            if (item.key.trim()) {
               urlObj.searchParams.append(item.key.trim(), item.value);
            }
         });
         return urlObj.toString();
      } catch (err) {
         return parseInputUrl;
      }
   }, [parseInputUrl, parsedUrlParts, parsedParamsList]);

   const handleAddQueryParam = () => {
      setParsedParamsList((prev) => [
         ...prev,
         {
            id: Math.random().toString(36).substring(2, 9),
            key: 'param',
            value: 'value',
         },
      ]);
   };

   const handleUpdateQueryParam = (id, field, val) => {
      setParsedParamsList((prev) =>
         prev.map((item) =>
            item.id === id ? { ...item, [field]: val } : item,
         ),
      );
   };

   const handleDeleteQueryParam = (id) => {
      setParsedParamsList((prev) => prev.filter((item) => item.id !== id));
      showToast('Parameter removed');
   };

   const copyParamsAsJson = () => {
      const obj = {};
      parsedParamsList.forEach((item) => {
         if (item.key.trim()) obj[item.key.trim()] = item.value;
      });
      navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
      showToast('Copied parameters as JSON format!');
   };

   /* ----------------------------------------------------------------------- */
   /*  TAB 5: URL ENCODER / DECODER STATE                                     */
   /* ----------------------------------------------------------------------- */
   const [encodeMode, setEncodeMode] = useState('component');
   const [encodeInput, setEncodeInput] = useState(
      'https://example.com/search?query=react 19 & next.js & tag=web#section 2',
   );
   const [encodeAction, setEncodeAction] = useState('encode');

   const encodedResult = useMemo(() => {
      const text = encodeInput;
      if (!text) return '';
      try {
         if (encodeAction === 'encode') {
            if (encodeMode === 'component') return encodeURIComponent(text);
            if (encodeMode === 'fullUrl') return encodeURI(text);
            if (encodeMode === 'base64')
               return btoa(unescape(encodeURIComponent(text)));
         } else {
            if (encodeMode === 'component') return decodeURIComponent(text);
            if (encodeMode === 'fullUrl') return decodeURI(text);
            if (encodeMode === 'base64')
               return decodeURIComponent(escape(atob(text)));
         }
      } catch (err) {
         return (
            'Error: Invalid sequence for this decode operation (' +
            err.message +
            ')'
         );
      }
      return '';
   }, [encodeInput, encodeMode, encodeAction]);

   const swapEncoderValues = () => {
      if (encodedResult && !encodedResult.startsWith('Error:')) {
         setEncodeInput(encodedResult);
         setEncodeAction((prev) => (prev === 'encode' ? 'decode' : 'encode'));
         showToast('Swapped input & result!');
      }
   };

   /* ----------------------------------------------------------------------- */
   /*  TAB 6: DIRECT LINKS HUB (WHATSAPP, EMAIL, SMS, CALL)                  */
   /* ----------------------------------------------------------------------- */
   const [hubType, setHubType] = useState('whatsapp');
   const [hubWa, setHubWa] = useState({
      phone: '+14155552671',
      text: 'Hi! I found your portfolio online.',
   });
   const [hubMail, setHubMail] = useState({
      to: 'team@klique.com',
      cc: '',
      bcc: '',
      subject: 'Collaboration Opportunity',
      body: 'Hi team, would love to talk!',
   });
   const [hubSms, setHubSms] = useState({
      phone: '+14155552671',
      text: 'Hey, sending you the link!',
   });
   const [hubCall, setHubCall] = useState({ phone: '+14155552671' });

   const directLinkResult = useMemo(() => {
      switch (hubType) {
         case 'whatsapp': {
            const clean = hubWa.phone.replace(/[^0-9]/g, '');
            const msg = encodeURIComponent(hubWa.text);
            return `https://wa.me/${clean}${msg ? `?text=${msg}` : ''}`;
         }
         case 'email': {
            const p = [];
            if (hubMail.cc) p.push(`cc=${encodeURIComponent(hubMail.cc)}`);
            if (hubMail.bcc) p.push(`bcc=${encodeURIComponent(hubMail.bcc)}`);
            if (hubMail.subject)
               p.push(`subject=${encodeURIComponent(hubMail.subject)}`);
            if (hubMail.body)
               p.push(`body=${encodeURIComponent(hubMail.body)}`);
            const qs = p.length ? `?${p.join('&')}` : '';
            return `mailto:${hubMail.to.trim()}${qs}`;
         }
         case 'sms': {
            const clean = hubSms.phone.replace(/[^0-9+]/g, '');
            const body = hubSms.text
               ? `?body=${encodeURIComponent(hubSms.text)}`
               : '';
            return `sms:${clean}${body}`;
         }
         case 'call': {
            return `tel:${hubCall.phone.replace(/[^0-9+]/g, '')}`;
         }
         default:
            return '';
      }
   }, [hubType, hubWa, hubMail, hubSms, hubCall]);

   const sendDirectLinkToQr = () => {
      if (hubType === 'whatsapp') {
         setQrType('whatsapp');
         setQrWhatsApp({ phone: hubWa.phone, message: hubWa.text });
      } else if (hubType === 'email') {
         setQrType('email');
         setQrEmail({
            to: hubMail.to,
            subject: hubMail.subject,
            body: hubMail.body,
         });
      } else if (hubType === 'sms') {
         setQrType('sms');
         setQrSms({ phone: hubSms.phone, message: hubSms.text });
      } else {
         setQrType('phone');
         setQrPhone(hubCall.phone);
      }
      setActiveTab('qr-generator');
      showToast('Generated QR code for this direct link!');
   };

   /* ----------------------------------------------------------------------- */
   /*  TAB 7: URL CLEANER & TRACKING STRIPPER                                 */
   /* ----------------------------------------------------------------------- */
   const [dirtyUrl, setDirtyUrl] = useState(
      'https://www.example.com/item/4921?utm_source=facebook&utm_medium=cpc&utm_campaign=summer_promo&fbclid=IwAR2d8f9q28j&gclid=CjwKCAjw&ref=feed&page=1',
   );

   const cleanedUrlData = useMemo(() => {
      if (!dirtyUrl.trim())
         return { cleanUrl: '', removedCount: 0, removedList: [] };
      try {
         let raw = dirtyUrl.trim();
         if (!/^https?:\/\//i.test(raw) && !raw.startsWith('/')) {
            raw = 'https://' + raw;
         }
         const urlObj = new URL(raw);
         const removed = [];
         const keys = Array.from(urlObj.searchParams.keys());

         keys.forEach((key) => {
            const lower = key.toLowerCase();
            const isTracking =
               TRACKING_PARAMS.includes(lower) ||
               lower.startsWith('utm_') ||
               lower.startsWith('fb_') ||
               lower.startsWith('gcl');
            if (isTracking) {
               removed.push({ key, value: urlObj.searchParams.get(key) });
               urlObj.searchParams.delete(key);
            }
         });

         return {
            cleanUrl: urlObj.toString(),
            removedCount: removed.length,
            removedList: removed,
         };
      } catch (err) {
         return { cleanUrl: dirtyUrl, removedCount: 0, removedList: [] };
      }
   }, [dirtyUrl]);

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden px-3 py-6 sm:px-6 sm:py-8 md:px-10

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
            title="QR Code & Link Tools - High-Res Generator, UTM Builder & Scanner | Klique"
            description="Comprehensive QR code and link suite. Generate custom branded QR codes for URLs, Wi-Fi, vCards, WhatsApp, and emails. Build UTM campaign links, parse and edit query parameters, and decode QR codes. Free online tool."
            keywords="qr code generator, wifi qr code, vcard qr code, utm campaign builder, url parser, query param editor, qr code scanner, link cleaner, high res qr code, custom qr code with logo, developer tools, klique"
            canonicalUrl="https://klique.netlify.app/qrlinktools"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'SoftwareApplication',
               name: 'QR Code & Link Tools',
               applicationCategory: 'DeveloperApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'All-in-one suite to generate branded QR codes, build campaign UTM tracking links, inspect and edit URL query parameters, and decode QR codes.',
               author: {
                  '@type': 'Organization',
                  name: 'Klique',
               },
               featureList: [
                  'Custom high-resolution QR code generator (PNG & SVG)',
                  'Support for URL, Wi-Fi, vCard, WhatsApp, Email, SMS, and Plain Text',
                  'Center logo embedding with error correction level controls',
                  'Foreground and background color customizer',
                  'UTM Campaign URL builder with marketing presets',
                  'Interactive URL query parameter parser and editor',
                  'In-browser QR code scanner and decoder from image or clipboard',
                  'Privacy link tracking parameters cleaner',
               ],
            }}
         />

         <div className="relative z-[100] w-full mb-6">
            <Navbar />
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
                     <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span className="text-zinc-200">{toast.message}</span>
               </motion.div>
            )}
         </AnimatePresence>

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Header / Hero Section */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-center sm:text-left">
               <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                  <Braces size={14} className="text-[#daf4aa]" />
                  <span>Developer Suite</span>
               </div>
               <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                  QR Code & Link Tools
               </h1>
               <p className="mt-1 text-sm text-zinc-400">
                  Design branded QR codes, craft trackable UTM marketing links,
                  inspect and edit URL query parameters, encode strings, decode
                  images, and strip privacy trackers.
               </p>
            </motion.div>

            {/* Navigation Tabs Bar - Redesigned to remove horizontal scroll and wrap features cleanly */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 mt-10 pb-6 mb-8 border-b border-zinc-800/50">
               {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                     <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all relative ${
                           isActive
                              ? 'text-white bg-[#18181b] shadow-lg shadow-[#daf4aa]/10 border border-zinc-700'
                              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-transparent'
                        }`}>
                        <Icon
                           className={`w-4 h-4 ${isActive ? 'text-[#daf4aa]' : 'text-zinc-500'}`}
                        />
                        <span>{tab.label}</span>
                        {tab.badge && (
                           <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold tracking-wider uppercase ${
                                 isActive
                                    ? 'bg-[#daf4aa]/10 text-[#daf4aa] border border-[#daf4aa]/30'
                                    : 'bg-zinc-800 text-zinc-500'
                              }`}>
                              {tab.badge}
                           </span>
                        )}
                     </button>
                  );
               })}
            </div>

            {/* TAB CONTENTS */}
            <div className="mt-2">
               {/* ---------------------------------------------------------------- */}
               {/* TAB 1: QR CODE GENERATOR                                         */}
               {/* ---------------------------------------------------------------- */}
               {activeTab === 'qr-generator' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                     {/* Left Column: Form & Styling Controls */}
                     <div className="lg:col-span-7 space-y-4">
                        {/* QR Content Type Picker */}
                        <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11]">
                           <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <Layers className="w-4 h-4 text-[#daf4aa]" />
                              1. Select QR Code Type
                           </h2>
                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {QR_DATA_TYPES.map((t) => {
                                 const Icon = t.icon;
                                 const isSelected = qrType === t.id;
                                 return (
                                    <button
                                       key={t.id}
                                       type="button"
                                       onClick={() => setQrType(t.id)}
                                       className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left border ${
                                          isSelected
                                             ? 'bg-[#daf4aa]/10 border-[#daf4aa]/50 text-white shadow-sm shadow-[#daf4aa]/10'
                                             : 'bg-[#18181b] border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
                                       }`}>
                                       <Icon
                                          className={`w-3.5 h-3.5 ${isSelected ? 'text-[#daf4aa]' : 'text-zinc-500'}`}
                                       />
                                       <span className="truncate">
                                          {t.label}
                                       </span>
                                    </button>
                                 );
                              })}
                           </div>
                        </div>

                        {/* Payload Form Fields */}
                        <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-4">
                           <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                              <Sliders className="w-4 h-4 text-[#daf4aa]" />
                              2. Enter Content Details
                           </h2>

                           {/* URL Field */}
                           {qrType === 'url' && (
                              <div className="space-y-2">
                                 <label className="text-xs font-medium text-zinc-300">
                                    Target Website URL
                                 </label>
                                 <div className="relative">
                                    <Globe className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                                    <input
                                       type="url"
                                       value={qrUrl}
                                       onChange={(e) =>
                                          setQrUrl(e.target.value)
                                       }
                                       placeholder="https://yourwebsite.com"
                                       className="w-full bg-[#18181b] border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa] transition-colors"
                                    />
                                 </div>
                                 <p className="text-[11px] text-zinc-500">
                                    Automatically opens browser on scan.
                                 </p>
                              </div>
                           )}

                           {/* Wi-Fi Form */}
                           {qrType === 'wifi' && (
                              <div className="space-y-3">
                                 <div>
                                    <label className="text-xs font-medium text-zinc-300">
                                       Network Name (SSID)
                                    </label>
                                    <input
                                       type="text"
                                       value={qrWifi.ssid}
                                       onChange={(e) =>
                                          setQrWifi({
                                             ...qrWifi,
                                             ssid: e.target.value,
                                          })
                                       }
                                       placeholder="Office_Guest_5G"
                                       className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60 mt-1"
                                    />
                                 </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                       <label className="text-xs font-medium text-zinc-300">
                                          Password
                                       </label>
                                       <input
                                          type="text"
                                          value={qrWifi.password}
                                          onChange={(e) =>
                                             setQrWifi({
                                                ...qrWifi,
                                                password: e.target.value,
                                             })
                                          }
                                          placeholder="Leave empty for open network"
                                          className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#daf4aa]/60 mt-1"
                                       />
                                    </div>
                                    <div>
                                       <label className="text-xs font-medium text-zinc-300">
                                          Encryption
                                       </label>
                                       <select
                                          value={qrWifi.encryption}
                                          onChange={(e) =>
                                             setQrWifi({
                                                ...qrWifi,
                                                encryption: e.target.value,
                                             })
                                          }
                                          className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#daf4aa]/60 mt-1">
                                          <option value="WPA">
                                             WPA / WPA2 / WPA3 (Standard)
                                          </option>
                                          <option value="WEP">
                                             WEP (Legacy)
                                          </option>
                                          <option value="nopass">
                                             None (Open Network)
                                          </option>
                                       </select>
                                    </div>
                                 </div>
                                 <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer pt-1">
                                    <input
                                       type="checkbox"
                                       checked={qrWifi.hidden}
                                       onChange={(e) =>
                                          setQrWifi({
                                             ...qrWifi,
                                             hidden: e.target.checked,
                                          })
                                       }
                                       className="rounded border-zinc-700 bg-zinc-800 text-[#daf4aa] focus:ring-[#daf4aa]"
                                    />
                                    <span>Hidden Wi-Fi SSID</span>
                                 </label>
                              </div>
                           )}

                           {/* vCard Form */}
                           {qrType === 'vcard' && (
                              <div className="space-y-3">
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                       <label className="text-xs font-medium text-zinc-300">
                                          First Name
                                       </label>
                                       <input
                                          type="text"
                                          value={qrVcard.firstName}
                                          onChange={(e) =>
                                             setQrVcard({
                                                ...qrVcard,
                                                firstName: e.target.value,
                                             })
                                          }
                                          className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                       />
                                    </div>
                                    <div>
                                       <label className="text-xs font-medium text-zinc-300">
                                          Last Name
                                       </label>
                                       <input
                                          type="text"
                                          value={qrVcard.lastName}
                                          onChange={(e) =>
                                             setQrVcard({
                                                ...qrVcard,
                                                lastName: e.target.value,
                                             })
                                          }
                                          className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                       />
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                       <label className="text-xs font-medium text-zinc-300">
                                          Phone
                                       </label>
                                       <input
                                          type="tel"
                                          value={qrVcard.phone}
                                          onChange={(e) =>
                                             setQrVcard({
                                                ...qrVcard,
                                                phone: e.target.value,
                                             })
                                          }
                                          className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                       />
                                    </div>
                                    <div>
                                       <label className="text-xs font-medium text-zinc-300">
                                          Email
                                       </label>
                                       <input
                                          type="email"
                                          value={qrVcard.email}
                                          onChange={(e) =>
                                             setQrVcard({
                                                ...qrVcard,
                                                email: e.target.value,
                                             })
                                          }
                                          className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                       />
                                    </div>
                                 </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                       <label className="text-xs font-medium text-zinc-300">
                                          Company / Org
                                       </label>
                                       <input
                                          type="text"
                                          value={qrVcard.org}
                                          onChange={(e) =>
                                             setQrVcard({
                                                ...qrVcard,
                                                org: e.target.value,
                                             })
                                          }
                                          className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                       />
                                    </div>
                                    <div>
                                       <label className="text-xs font-medium text-zinc-300">
                                          Job Title
                                       </label>
                                       <input
                                          type="text"
                                          value={qrVcard.title}
                                          onChange={(e) =>
                                             setQrVcard({
                                                ...qrVcard,
                                                title: e.target.value,
                                             })
                                          }
                                          className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                       />
                                    </div>
                                 </div>
                                 <div>
                                    <label className="text-xs font-medium text-zinc-300">
                                       Website
                                    </label>
                                    <input
                                       type="url"
                                       value={qrVcard.website}
                                       onChange={(e) =>
                                          setQrVcard({
                                             ...qrVcard,
                                             website: e.target.value,
                                          })
                                       }
                                       className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                    />
                                 </div>
                              </div>
                           )}

                           {/* WhatsApp */}
                           {qrType === 'whatsapp' && (
                              <div className="space-y-3">
                                 <div>
                                    <label className="text-xs font-medium text-zinc-300">
                                       Phone Number (with Country Code, no + or
                                       spaces)
                                    </label>
                                    <input
                                       type="text"
                                       value={qrWhatsApp.phone}
                                       onChange={(e) =>
                                          setQrWhatsApp({
                                             ...qrWhatsApp,
                                             phone: e.target.value,
                                          })
                                       }
                                       placeholder="14155552671"
                                       className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                    />
                                 </div>
                                 <div>
                                    <label className="text-xs font-medium text-zinc-300">
                                       Prefilled Message
                                    </label>
                                    <textarea
                                       rows={3}
                                       value={qrWhatsApp.message}
                                       onChange={(e) =>
                                          setQrWhatsApp({
                                             ...qrWhatsApp,
                                             message: e.target.value,
                                          })
                                       }
                                       className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                    />
                                 </div>
                              </div>
                           )}

                           {/* Email */}
                           {qrType === 'email' && (
                              <div className="space-y-3">
                                 <div>
                                    <label className="text-xs font-medium text-zinc-300">
                                       Recipient Email Address
                                    </label>
                                    <input
                                       type="email"
                                       value={qrEmail.to}
                                       onChange={(e) =>
                                          setQrEmail({
                                             ...qrEmail,
                                             to: e.target.value,
                                          })
                                       }
                                       placeholder="support@example.com"
                                       className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                    />
                                 </div>
                                 <div>
                                    <label className="text-xs font-medium text-zinc-300">
                                       Subject
                                    </label>
                                    <input
                                       type="text"
                                       value={qrEmail.subject}
                                       onChange={(e) =>
                                          setQrEmail({
                                             ...qrEmail,
                                             subject: e.target.value,
                                          })
                                       }
                                       className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                    />
                                 </div>
                                 <div>
                                    <label className="text-xs font-medium text-zinc-300">
                                       Message Body
                                    </label>
                                    <textarea
                                       rows={2}
                                       value={qrEmail.body}
                                       onChange={(e) =>
                                          setQrEmail({
                                             ...qrEmail,
                                             body: e.target.value,
                                          })
                                       }
                                       className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                    />
                                 </div>
                              </div>
                           )}

                           {/* SMS */}
                           {qrType === 'sms' && (
                              <div className="space-y-3">
                                 <div>
                                    <label className="text-xs font-medium text-zinc-300">
                                       Phone Number
                                    </label>
                                    <input
                                       type="tel"
                                       value={qrSms.phone}
                                       onChange={(e) =>
                                          setQrSms({
                                             ...qrSms,
                                             phone: e.target.value,
                                          })
                                       }
                                       placeholder="+1 555 123 4567"
                                       className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                    />
                                 </div>
                                 <div>
                                    <label className="text-xs font-medium text-zinc-300">
                                       Prefilled SMS Text
                                    </label>
                                    <textarea
                                       rows={2}
                                       value={qrSms.message}
                                       onChange={(e) =>
                                          setQrSms({
                                             ...qrSms,
                                             message: e.target.value,
                                          })
                                       }
                                       className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                    />
                                 </div>
                              </div>
                           )}

                           {/* Phone Call */}
                           {qrType === 'phone' && (
                              <div>
                                 <label className="text-xs font-medium text-zinc-300">
                                    Phone Number
                                 </label>
                                 <input
                                    type="tel"
                                    value={qrPhone}
                                    onChange={(e) => setQrPhone(e.target.value)}
                                    placeholder="+1 555 123 4567"
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                 />
                              </div>
                           )}

                           {/* Plain Text */}
                           {qrType === 'text' && (
                              <div>
                                 <label className="text-xs font-medium text-zinc-300">
                                    Plain Text Message / Payload
                                 </label>
                                 <textarea
                                    rows={4}
                                    value={qrText}
                                    onChange={(e) => setQrText(e.target.value)}
                                    placeholder="Enter any text, code, or cryptographic address..."
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                 />
                              </div>
                           )}
                        </div>

                        {/* QR Styling & Customization Box - Redesigned to decluster and improve spacing */}
                        <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-6 shadow-xl">
                           <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2 border-b border-zinc-800/50 pb-3">
                              <Sparkles className="w-4 h-4 text-[#daf4aa]" />
                              3. Style & Brand QR Code
                           </h2>

                           {/* Colors Group */}
                           <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50 space-y-5">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                 {/* Foreground */}
                                 <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs text-zinc-300">
                                       <span className="font-medium">
                                          Foreground Color
                                       </span>
                                       <span className="font-mono text-zinc-500 text-[11px] bg-black/40 px-1.5 py-0.5 rounded">
                                          {fgColor}
                                       </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <input
                                          type="color"
                                          value={fgColor}
                                          onChange={(e) =>
                                             setFgColor(e.target.value)
                                          }
                                          className="w-10 h-10 rounded-lg border border-zinc-700 cursor-pointer bg-transparent p-0"
                                       />
                                       <div className="flex flex-wrap gap-2 flex-1">
                                          {COLOR_PRESETS_FG.map((col) => (
                                             <button
                                                key={col.label}
                                                type="button"
                                                title={col.label}
                                                onClick={() =>
                                                   setFgColor(col.value)
                                                }
                                                className={`w-6 h-6 rounded-md border shadow-sm transition-transform ${
                                                   fgColor === col.value
                                                      ? 'ring-2 ring-[#daf4aa] ring-offset-2 ring-offset-[#0f0f11] scale-110'
                                                      : 'border-zinc-700 hover:scale-105'
                                                }`}
                                                style={{
                                                   backgroundColor: col.value,
                                                }}
                                             />
                                          ))}
                                       </div>
                                    </div>
                                 </div>

                                 {/* Background */}
                                 <div className="space-y-3">
                                    <div className="flex items-center justify-between text-xs text-zinc-300">
                                       <span className="font-medium">
                                          Background Color
                                       </span>
                                       <span className="font-mono text-zinc-500 text-[11px] bg-black/40 px-1.5 py-0.5 rounded">
                                          {bgColor}
                                       </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       <input
                                          type="color"
                                          value={
                                             bgColor === 'transparent'
                                                ? '#ffffff'
                                                : bgColor
                                          }
                                          onChange={(e) =>
                                             setBgColor(e.target.value)
                                          }
                                          className="w-10 h-10 rounded-lg border border-zinc-700 cursor-pointer bg-transparent p-0"
                                       />
                                       <div className="flex flex-wrap gap-2 flex-1">
                                          {COLOR_PRESETS_BG.map((col) => (
                                             <button
                                                key={col.label}
                                                type="button"
                                                title={col.label}
                                                onClick={() =>
                                                   setBgColor(col.value)
                                                }
                                                className={`w-6 h-6 rounded-md border text-[9px] flex items-center justify-center font-bold shadow-sm transition-transform ${
                                                   bgColor === col.value
                                                      ? 'ring-2 ring-[#daf4aa] ring-offset-2 ring-offset-[#0f0f11] scale-110'
                                                      : 'border-zinc-700 hover:scale-105'
                                                } ${col.value === 'transparent' ? 'bg-zinc-800 text-zinc-400' : ''}`}
                                                style={
                                                   col.value !== 'transparent'
                                                      ? {
                                                           backgroundColor:
                                                              col.value,
                                                        }
                                                      : {}
                                                }>
                                                {col.value === 'transparent'
                                                   ? '✕'
                                                   : ''}
                                             </button>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* Layout Group (Correction & Margin) */}
                           <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                 <div>
                                    <label className="text-xs font-medium text-zinc-300 block mb-2.5">
                                       Error Correction Level
                                    </label>
                                    <div className="grid grid-cols-4 gap-2">
                                       {[
                                          { lvl: 'L', label: '7%' },
                                          { lvl: 'M', label: '15%' },
                                          { lvl: 'Q', label: '25%' },
                                          { lvl: 'H', label: '30%' },
                                       ].map((item) => (
                                          <button
                                             key={item.lvl}
                                             type="button"
                                             onClick={() =>
                                                setErrorLevel(item.lvl)
                                             }
                                             className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                                                errorLevel === item.lvl
                                                   ? 'bg-[#daf4aa]/20 border-[#daf4aa]/40 text-[#daf4aa] shadow-inner'
                                                   : 'bg-black/20 border-zinc-800 text-zinc-400 hover:text-white'
                                             }`}>
                                             {item.lvl}{' '}
                                             <span className="opacity-60 text-[10px] hidden xl:inline">
                                                ({item.label})
                                             </span>
                                          </button>
                                       ))}
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-2 flex items-center gap-1.5">
                                       <Info className="w-3 h-3" /> High (H) is
                                       required when placing center logos.
                                    </p>
                                 </div>

                                 <div>
                                    <div className="flex justify-between text-xs font-medium text-zinc-300 mb-3">
                                       <span>Quiet Zone (Margin)</span>
                                       <span className="text-zinc-400 bg-black/40 px-2 py-0.5 rounded text-[11px]">
                                          {qrMargin} modules
                                       </span>
                                    </div>
                                    <input
                                       type="range"
                                       min={0}
                                       max={4}
                                       step={1}
                                       value={qrMargin}
                                       onChange={(e) =>
                                          setQrMargin(Number(e.target.value))
                                       }
                                       className="w-full accent-[#daf4aa] h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[10px] text-zinc-500 mt-2 font-medium">
                                       <span>Flush (0)</span>
                                       <span>Standard (2)</span>
                                       <span>Padded (4)</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* Resolution Size Slider */}
                           <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
                              <div className="flex justify-between items-center text-xs text-zinc-300 mb-3">
                                 <span className="font-medium">
                                    Export Resolution (Canvas Size)
                                 </span>
                                 <span className="text-[#daf4aa] font-mono font-medium bg-[#daf4aa]/10 border border-[#daf4aa]/20 px-2 py-0.5 rounded-md">
                                    {qrSize} × {qrSize} px
                                 </span>
                              </div>
                              <input
                                 type="range"
                                 min={256}
                                 max={1024}
                                 step={32}
                                 value={qrSize}
                                 onChange={(e) =>
                                    setQrSize(Number(e.target.value))
                                 }
                                 className="w-full accent-[#daf4aa] h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                              />
                              <div className="flex justify-between text-[10px] text-zinc-500 mt-2 font-medium">
                                 <span>Compact (256px)</span>
                                 <span>Standard (384px)</span>
                                 <span>Ultra High-Res (1024px)</span>
                              </div>
                           </div>

                           {/* Center Logo Upload */}
                           <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/50">
                              <div className="flex items-center justify-between mb-3">
                                 <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                                    <ImageIcon className="w-4 h-4 text-[#daf4aa]" />
                                    Embed Custom Center Logo
                                 </label>
                                 {centerLogo && (
                                    <button
                                       type="button"
                                       onClick={() => setCenterLogo(null)}
                                       className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-1 rounded bg-rose-400/10 border border-rose-400/20 transition-colors">
                                       <Trash2 className="w-3 h-3" /> Remove
                                       Logo
                                    </button>
                                 )}
                              </div>

                              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                 <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-zinc-600 hover:border-[#daf4aa]/50 bg-black/20 hover:bg-black/40 text-xs font-medium text-zinc-300 cursor-pointer transition-all">
                                    <Upload className="w-4 h-4 text-zinc-400" />
                                    <span>Browse Image...</span>
                                    <input
                                       type="file"
                                       accept="image/*"
                                       onChange={handleLogoUpload}
                                       className="hidden"
                                    />
                                 </label>
                                 {centerLogo && (
                                    <div className="flex items-center gap-3 flex-1 bg-black/30 p-2.5 rounded-xl border border-zinc-800/50">
                                       <span className="text-[11px] font-medium text-zinc-400">
                                          Scale:
                                       </span>
                                       <input
                                          type="range"
                                          min={14}
                                          max={26}
                                          value={logoSizePercent}
                                          onChange={(e) =>
                                             setLogoSizePercent(
                                                Number(e.target.value),
                                             )
                                          }
                                          className="flex-1 accent-[#daf4aa] h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                                       />
                                       <span className="text-[11px] text-zinc-300 font-mono bg-zinc-800 px-2 py-0.5 rounded">
                                          {logoSizePercent}%
                                       </span>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Right Column: Live QR Preview & Export Hub */}
                     <div className="lg:col-span-5 sticky top-28 space-y-5">
                        <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0f0f11] backdrop-blur-xl shadow-2xl flex flex-col items-center">
                           <div className="flex items-center justify-between w-full mb-4">
                              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                 Live Interactive Preview
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                 Ready to Scan
                              </div>
                           </div>

                           {/* QR Canvas Display */}
                           <div
                              className="p-4 rounded-2xl border border-zinc-800 shadow-2xl transition-all relative group flex items-center justify-center max-w-[340px] max-h-[340px]"
                              style={{
                                 backgroundColor:
                                    bgColor === 'transparent'
                                       ? '#11111a'
                                       : bgColor,
                                 backgroundImage:
                                    bgColor === 'transparent'
                                       ? 'radial-gradient(circle, #222 10%, transparent 11%)'
                                       : 'none',
                                 backgroundSize: '12px 12px',
                              }}>
                              <canvas
                                 ref={canvasRef}
                                 width={384}
                                 height={384}
                                 aria-label="Live QR code preview"
                                 className="block w-full h-auto max-w-[300px] rounded-lg"
                              />
                           </div>

                           {/* Payload Meta Tag */}
                           <div className="w-full mt-4 p-2.5 rounded-xl bg-[#09090b] border border-zinc-800 text-[11px] text-zinc-400 break-all font-mono">
                              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-sans mb-1 flex items-center justify-between">
                                 <span>
                                    Payload Preview (
                                    {lastGeneratedPayload.length} chars)
                                 </span>
                                 <button
                                    onClick={() => {
                                       navigator.clipboard.writeText(
                                          lastGeneratedPayload,
                                       );
                                       showToast('Payload copied!');
                                    }}
                                    className="hover:text-white">
                                    Copy Text
                                 </button>
                              </div>
                              <span className="line-clamp-2 text-zinc-300">
                                 {lastGeneratedPayload}
                              </span>
                           </div>

                           {/* Export Actions Grid */}
                           <div className="w-full mt-5 grid grid-cols-2 gap-2.5">
                              <button
                                 onClick={downloadPNG}
                                 className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#daf4aa] hover:bg-[#cbe699] text-[#16161b] font-semibold text-xs transition-all shadow-lg shadow-[#daf4aa]/10">
                                 <Download className="w-4 h-4" />
                                 <span>Download PNG</span>
                              </button>

                              <button
                                 onClick={downloadSVG}
                                 className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-800 transition-all">
                                 <Download className="w-4 h-4 text-[#daf4aa]" />
                                 <span>Download SVG</span>
                              </button>

                              <button
                                 onClick={copyQRImageToClipboard}
                                 className="col-span-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181b] hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-all">
                                 <Copy className="w-3.5 h-3.5" />
                                 <span>Copy QR Image to Clipboard</span>
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* ---------------------------------------------------------------- */}
               {/* TAB 2: QR SCANNER / DECODER                                      */}
               {/* ---------------------------------------------------------------- */}
               {activeTab === 'qr-scanner' && (
                  <div className="max-w-4xl mx-auto space-y-4">
                     <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0f0f11] backdrop-blur-xl">
                        <div className="flex items-center justify-between mb-4">
                           <div>
                              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                                 <Scan className="w-5 h-5 text-[#daf4aa]" />
                                 Instant QR Code Reader & Decoder
                              </h2>
                              <p className="text-xs text-zinc-400 mt-0.5">
                                 Upload an image file, drag & drop, or simply
                                 press{' '}
                                 <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-[10px]">
                                    Ctrl+V
                                 </kbd>{' '}
                                 to paste a screenshot!
                              </p>
                           </div>
                        </div>

                        {/* Drop / Upload Zone */}
                        <label className="border-2 border-dashed border-zinc-700 hover:border-[#daf4aa]/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#09090b]/70 hover:bg-[#09090b] group">
                           <div className="w-14 h-14 rounded-2xl bg-[#daf4aa]/10 border border-[#daf4aa]/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                              <Upload className="w-6 h-6 text-[#daf4aa]" />
                           </div>
                           <span className="text-sm font-medium text-zinc-200 mb-1">
                              Click to browse or drop QR image here
                           </span>
                           <span className="text-xs text-zinc-500">
                              Supports PNG, JPG, JPEG, WebP, or paste directly
                              from clipboard
                           </span>
                           <input
                              type="file"
                              accept="image/*"
                              onChange={handleScanFileUpload}
                              className="hidden"
                           />
                        </label>

                        {/* Thumbnail Preview if loaded */}
                        {scannedImagePreview && (
                           <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-[#09090b] border border-zinc-800">
                              <img
                                 src={scannedImagePreview}
                                 alt="Scanned QR Thumbnail"
                                 className="w-14 h-14 object-contain rounded-lg border border-zinc-800 bg-black/50"
                              />
                              <div className="text-xs">
                                 <div className="text-zinc-200 font-medium">
                                    Image Loaded
                                 </div>
                                 <div className="text-[11px] text-zinc-500">
                                    {isScanning
                                       ? 'Decoding QR pattern...'
                                       : 'Analysis complete'}
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Scan Results View */}
                     {scannedResult && (
                        <motion.div
                           initial={{ opacity: 0, y: 15 }}
                           animate={{ opacity: 1, y: 0 }}
                           className="p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 backdrop-blur-xl space-y-5">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                 <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                 </div>
                                 <div>
                                    <h3 className="text-sm font-semibold text-white">
                                       Decoded Content (
                                       {scannedResult.parsedType?.type ||
                                          'Data'}
                                       )
                                    </h3>
                                    <span className="text-[11px] text-zinc-400">
                                       Scanned at {scannedResult.timestamp}
                                    </span>
                                 </div>
                              </div>

                              <button
                                 onClick={loadScannedIntoGenerator}
                                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#daf4aa] hover:bg-[#cbe699] text-[#16161b] text-xs font-medium transition-colors">
                                 <Sliders className="w-3.5 h-3.5" />
                                 <span>Customize in Generator</span>
                              </button>
                           </div>

                           {/* Detailed Breakdown */}
                           <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-3 font-mono text-xs">
                              {scannedResult.parsedType?.isWifi ? (
                                 <div className="space-y-1.5 font-sans">
                                    <div className="text-zinc-400 text-xs">
                                       <span className="font-semibold text-white">
                                          Network SSID:
                                       </span>{' '}
                                       {scannedResult.parsedType.ssid}
                                    </div>
                                    <div className="text-zinc-400 text-xs flex items-center gap-2">
                                       <span className="font-semibold text-white">
                                          Password:
                                       </span>{' '}
                                       <span className="font-mono bg-zinc-800 px-2 py-0.5 rounded text-[#daf4aa]">
                                          {scannedResult.parsedType.password}
                                       </span>
                                       <button
                                          onClick={() => {
                                             navigator.clipboard.writeText(
                                                scannedResult.parsedType
                                                   .password,
                                             );
                                             showToast('Password copied!');
                                          }}
                                          className="text-[11px] text-[#daf4aa] hover:underline">
                                          Copy
                                       </button>
                                    </div>
                                    <div className="text-zinc-400 text-xs">
                                       <span className="font-semibold text-white">
                                          Security:
                                       </span>{' '}
                                       {scannedResult.parsedType.enc}
                                    </div>
                                 </div>
                              ) : scannedResult.parsedType?.isVcard ? (
                                 <div className="space-y-1 font-sans text-xs text-zinc-300">
                                    <div>
                                       <span className="font-semibold text-white">
                                          Name:
                                       </span>{' '}
                                       {scannedResult.parsedType.name}
                                    </div>
                                    <div>
                                       <span className="font-semibold text-white">
                                          Phone:
                                       </span>{' '}
                                       {scannedResult.parsedType.phone}
                                    </div>
                                    <div>
                                       <span className="font-semibold text-white">
                                          Email:
                                       </span>{' '}
                                       {scannedResult.parsedType.email}
                                    </div>
                                    <div>
                                       <span className="font-semibold text-white">
                                          Org:
                                       </span>{' '}
                                       {scannedResult.parsedType.org}
                                    </div>
                                 </div>
                              ) : (
                                 <div className="text-zinc-200 break-all whitespace-pre-wrap select-all">
                                    {scannedResult.raw}
                                 </div>
                              )}
                           </div>

                           {/* Quick Action buttons */}
                           <div className="flex flex-wrap items-center gap-3">
                              <button
                                 onClick={() => {
                                    navigator.clipboard.writeText(
                                       scannedResult.raw,
                                    );
                                    showToast('Copied raw data to clipboard!');
                                 }}
                                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs border border-zinc-800">
                                 <Copy className="w-3.5 h-3.5" />
                                 <span>Copy Raw Data</span>
                              </button>

                              {scannedResult.parsedType?.isUrl && (
                                 <>
                                    <a
                                       href={scannedResult.raw}
                                       target="_blank"
                                       rel="noreferrer"
                                       className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 text-xs border border-emerald-500/30">
                                       <ExternalLink className="w-3.5 h-3.5" />
                                       <span>Open Link in New Tab</span>
                                    </a>

                                    <button
                                       onClick={() => {
                                          setParseInputUrl(scannedResult.raw);
                                          setActiveTab('url-parser');
                                          showToast('Sent to URL Parser!');
                                       }}
                                       className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#daf4aa]/10 hover:bg-[#daf4aa]/20 text-[#daf4aa] text-xs border border-[#daf4aa]/30">
                                       <Split className="w-3.5 h-3.5" />
                                       <span>Inspect in URL Parser</span>
                                    </button>
                                 </>
                              )}
                           </div>
                        </motion.div>
                     )}
                  </div>
               )}

               {/* ---------------------------------------------------------------- */}
               {/* TAB 3: UTM CAMPAIGN BUILDER                                      */}
               {/* ---------------------------------------------------------------- */}
               {activeTab === 'utm-builder' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
                     <div className="lg:col-span-7 space-y-4">
                        {/* Preset channels */}
                        <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11]">
                           <h2 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              Quick Channel Presets
                           </h2>
                           <div className="flex flex-wrap gap-2">
                              {UTM_PRESETS.map((p) => (
                                 <button
                                    key={p.name}
                                    type="button"
                                    onClick={() => applyUtmPreset(p)}
                                    className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-[#daf4aa]/50 text-xs text-zinc-300 hover:text-white transition-colors">
                                    {p.name}
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* UTM Input Fields */}
                        <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-4">
                           <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                              <Sliders className="w-4 h-4 text-[#daf4aa]" />
                              Campaign Parameters
                           </h2>

                           <div>
                              <label className="text-xs font-medium text-zinc-300">
                                 Website URL{' '}
                                 <span className="text-rose-400">*</span>
                              </label>
                              <input
                                 type="url"
                                 value={utmWebsite}
                                 onChange={(e) => setUtmWebsite(e.target.value)}
                                 placeholder="https://yourbrand.com/landing-page"
                                 className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                              />
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                 <label className="text-xs font-medium text-zinc-300">
                                    Campaign Source (
                                    <code className="text-[#daf4aa]">
                                       utm_source
                                    </code>
                                    ) <span className="text-rose-400">*</span>
                                 </label>
                                 <input
                                    type="text"
                                    value={utmSource}
                                    onChange={(e) =>
                                       setUtmSource(e.target.value)
                                    }
                                    placeholder="google, newsletter, meta"
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                 />
                                 <span className="text-[10px] text-zinc-500">
                                    The referrer (e.g. google, x.com, linkedin)
                                 </span>
                              </div>

                              <div>
                                 <label className="text-xs font-medium text-zinc-300">
                                    Campaign Medium (
                                    <code className="text-[#daf4aa]">
                                       utm_medium
                                    </code>
                                    ) <span className="text-rose-400">*</span>
                                 </label>
                                 <input
                                    type="text"
                                    value={utmMedium}
                                    onChange={(e) =>
                                       setUtmMedium(e.target.value)
                                    }
                                    placeholder="cpc, email, social, banner"
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                 />
                                 <span className="text-[10px] text-zinc-500">
                                    Marketing medium (e.g. cpc, email)
                                 </span>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                 <label className="text-xs font-medium text-zinc-300">
                                    Campaign Name (
                                    <code className="text-[#daf4aa]">
                                       utm_campaign
                                    </code>
                                    )
                                 </label>
                                 <input
                                    type="text"
                                    value={utmCampaign}
                                    onChange={(e) =>
                                       setUtmCampaign(e.target.value)
                                    }
                                    placeholder="spring_sale_2026"
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                 />
                              </div>

                              <div>
                                 <label className="text-xs font-medium text-zinc-300">
                                    Campaign Term (
                                    <code className="text-zinc-400">
                                       utm_term
                                    </code>
                                    )
                                 </label>
                                 <input
                                    type="text"
                                    value={utmTerm}
                                    onChange={(e) => setUtmTerm(e.target.value)}
                                    placeholder="paid keywords (optional)"
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                 />
                              </div>
                           </div>

                           <div>
                              <label className="text-xs font-medium text-zinc-300">
                                 Campaign Content (
                                 <code className="text-zinc-400">
                                    utm_content
                                 </code>
                                 )
                              </label>
                              <input
                                 type="text"
                                 value={utmContent}
                                 onChange={(e) => setUtmContent(e.target.value)}
                                 placeholder="header_cta, sidebar_banner (A/B testing variant)"
                                 className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                              />
                           </div>
                        </div>
                     </div>

                     {/* Right Column: Live Link Preview & Actions */}
                     <div className="lg:col-span-5 sticky top-28 space-y-4">
                        <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0f0f11] backdrop-blur-xl shadow-2xl">
                           <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                 Generated Trackable Link
                              </span>
                              <span className="text-[11px] text-[#daf4aa] font-mono">
                                 {generatedUtmUrl.length} chars
                              </span>
                           </div>

                           <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 text-xs font-mono break-all text-zinc-200 select-all leading-relaxed">
                              {generatedUtmUrl ||
                                 'Enter base URL and source above...'}
                           </div>

                           {/* Actions */}
                           <div className="mt-5 space-y-2.5">
                              <button
                                 onClick={() => {
                                    navigator.clipboard.writeText(
                                       generatedUtmUrl,
                                    );
                                    showToast(
                                       'Copied full UTM link to clipboard!',
                                    );
                                 }}
                                 className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#daf4aa] hover:bg-[#cbe699] text-[#16161b] font-semibold text-xs shadow-lg shadow-[#daf4aa]/10 transition-all">
                                 <Copy className="w-4 h-4" />
                                 <span>Copy Campaign Link</span>
                              </button>

                              <button
                                 onClick={sendUtmToQrGenerator}
                                 className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-800 transition-all">
                                 <QrCode className="w-4 h-4 text-[#daf4aa]" />
                                 <span>Generate QR Code for this UTM Link</span>
                              </button>

                              <a
                                 href={generatedUtmUrl}
                                 target="_blank"
                                 rel="noreferrer"
                                 className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-[#18181b] text-zinc-300 text-xs border border-zinc-800 transition-all">
                                 <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                                 <span>Test Link in New Tab</span>
                              </a>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* ---------------------------------------------------------------- */}
               {/* TAB 4: URL PARSER & QUERY PARAMETER EDITOR                       */}
               {/* ---------------------------------------------------------------- */}
               {activeTab === 'url-parser' && (
                  <div className="space-y-4">
                     <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-3">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                           <Split className="w-4 h-4 text-[#daf4aa]" />
                           Paste Any URL to Dissect
                        </label>
                        <div className="relative">
                           <input
                              type="text"
                              value={parseInputUrl}
                              onChange={(e) => setParseInputUrl(e.target.value)}
                              placeholder="https://example.com/path?foo=bar&user=1#section"
                              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#daf4aa]/60"
                           />
                        </div>
                     </div>

                     {parsedUrlParts && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                           {/* Anatomy Cards */}
                           <div className="lg:col-span-4 space-y-3">
                              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                 URL Anatomy
                              </h3>
                              <div className="p-4 rounded-xl border border-zinc-800 bg-[#0f0f11] space-y-3 text-xs font-mono">
                                 <div className="flex justify-between border-b border-zinc-800 pb-2">
                                    <span className="text-zinc-500">
                                       Protocol:
                                    </span>
                                    <span className="text-emerald-400 font-semibold">
                                       {parsedUrlParts.protocol}
                                    </span>
                                 </div>
                                 <div className="flex justify-between border-b border-zinc-800 pb-2">
                                    <span className="text-zinc-500">Host:</span>
                                    <span className="text-[#daf4aa]">
                                       {parsedUrlParts.hostname}
                                    </span>
                                 </div>
                                 <div className="flex justify-between border-b border-zinc-800 pb-2">
                                    <span className="text-zinc-500">Port:</span>
                                    <span className="text-zinc-400">
                                       {parsedUrlParts.port}
                                    </span>
                                 </div>
                                 <div className="flex justify-between border-b border-zinc-800 pb-2">
                                    <span className="text-zinc-500">Path:</span>
                                    <span className="text-[#daf4aa] break-all">
                                       {parsedUrlParts.pathname}
                                    </span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span className="text-zinc-500">
                                       Hash / Fragment:
                                    </span>
                                    <span className="text-[#daf4aa]">
                                       {parsedUrlParts.hash || '(none)'}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           {/* Interactive Query Table */}
                           <div className="lg:col-span-8 space-y-3">
                              <div className="flex items-center justify-between">
                                 <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                    Query Parameters ({parsedParamsList.length})
                                 </h3>
                                 <div className="flex items-center gap-2">
                                    <button
                                       type="button"
                                       onClick={copyParamsAsJson}
                                       className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800">
                                       Export JSON
                                    </button>
                                    <button
                                       type="button"
                                       onClick={handleAddQueryParam}
                                       className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-[#daf4aa]/30 text-[#daf4aa] hover:bg-[#daf4aa]/40 border border-[#daf4aa]/30">
                                       <Plus className="w-3 h-3" /> Add Param
                                    </button>
                                 </div>
                              </div>

                              <div className="p-4 rounded-xl border border-zinc-800 bg-[#0f0f11] space-y-2">
                                 {parsedParamsList.length === 0 ? (
                                    <p className="text-xs text-zinc-500 py-3 text-center">
                                       No query parameters found in this URL.
                                       Click &quot;Add Param&quot; above to
                                       create one.
                                    </p>
                                 ) : (
                                    parsedParamsList.map((item) => (
                                       <div
                                          key={item.id}
                                          className="flex items-center gap-2">
                                          <input
                                             type="text"
                                             value={item.key}
                                             onChange={(e) =>
                                                handleUpdateQueryParam(
                                                   item.id,
                                                   'key',
                                                   e.target.value,
                                                )
                                             }
                                             placeholder="Key"
                                             className="w-1/3 bg-[#18181b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#daf4aa]/60"
                                          />
                                          <span className="text-zinc-600 font-bold">
                                             =
                                          </span>
                                          <input
                                             type="text"
                                             value={item.value}
                                             onChange={(e) =>
                                                handleUpdateQueryParam(
                                                   item.id,
                                                   'value',
                                                   e.target.value,
                                                )
                                             }
                                             placeholder="Value"
                                             className="flex-1 bg-[#18181b] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#daf4aa]/60"
                                          />
                                          <button
                                             type="button"
                                             onClick={() =>
                                                handleDeleteQueryParam(item.id)
                                             }
                                             className="p-1.5 text-zinc-500 hover:text-rose-400 rounded-lg hover:bg-zinc-800">
                                             <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                       </div>
                                    ))
                                 )}
                              </div>

                              {/* Live Reconstructed URL */}
                              <div className="p-4 rounded-xl border border-zinc-800 bg-[#0f0f11] space-y-2">
                                 <div className="flex items-center justify-between text-xs text-zinc-400">
                                    <span className="font-semibold uppercase tracking-wider text-[11px]">
                                       Reconstructed URL
                                    </span>
                                    <button
                                       onClick={() => {
                                          navigator.clipboard.writeText(
                                             reconstructedUrl,
                                          );
                                          showToast(
                                             'Copied reconstructed URL!',
                                          );
                                       }}
                                       className="text-[11px] text-[#daf4aa] hover:underline flex items-center gap-1">
                                       <Copy className="w-3 h-3" /> Copy
                                    </button>
                                 </div>
                                 <p className="text-xs font-mono text-zinc-200 break-all bg-black/60 p-3 rounded-lg border border-zinc-800">
                                    {reconstructedUrl}
                                 </p>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               )}

               {/* ---------------------------------------------------------------- */}
               {/* TAB 5: URL ENCODER / DECODER                                     */}
               {/* ---------------------------------------------------------------- */}
               {activeTab === 'url-encoder' && (
                  <div className="max-w-4xl mx-auto space-y-4">
                     <div className="p-5 rounded-2xl border border-zinc-800 bg-[#0f0f11] space-y-4">
                        {/* Modes */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                           <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#09090b] border border-zinc-800">
                              {[
                                 {
                                    id: 'component',
                                    label: 'encodeURIComponent',
                                 },
                                 {
                                    id: 'fullUrl',
                                    label: 'encodeURI (Standard)',
                                 },
                                 { id: 'base64', label: 'Base64 Safe' },
                              ].map((m) => (
                                 <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => setEncodeMode(m.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                       encodeMode === m.id
                                          ? 'bg-[#daf4aa] text-white shadow'
                                          : 'text-zinc-400 hover:text-white'
                                    }`}>
                                    {m.label}
                                 </button>
                              ))}
                           </div>

                           <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#09090b] border border-zinc-800">
                              <button
                                 type="button"
                                 onClick={() => setEncodeAction('encode')}
                                 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    encodeAction === 'encode'
                                       ? 'bg-emerald-600 text-white shadow'
                                       : 'text-zinc-400 hover:text-white'
                                 }`}>
                                 Encode
                              </button>
                              <button
                                 type="button"
                                 onClick={() => setEncodeAction('decode')}
                                 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                    encodeAction === 'decode'
                                       ? 'bg-amber-600 text-white shadow'
                                       : 'text-zinc-400 hover:text-white'
                                 }`}>
                                 Decode
                              </button>
                           </div>
                        </div>

                        {/* Input Area */}
                        <div>
                           <label className="text-xs font-medium text-zinc-300 block mb-1">
                              Input String / URL
                           </label>
                           <textarea
                              rows={4}
                              value={encodeInput}
                              onChange={(e) => setEncodeInput(e.target.value)}
                              placeholder="Enter text or URL to transform..."
                              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#daf4aa]/60"
                           />
                        </div>

                        {/* Swap action */}
                        <div className="flex justify-center">
                           <button
                              type="button"
                              onClick={swapEncoderValues}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs border border-zinc-800 transition-colors">
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                              <span>Swap Input & Output</span>
                           </button>
                        </div>

                        {/* Output Area */}
                        <div>
                           <div className="flex items-center justify-between mb-1">
                              <label className="text-xs font-medium text-zinc-300">
                                 Transformed Output ({encodedResult.length}{' '}
                                 characters)
                              </label>
                              <button
                                 onClick={() => {
                                    navigator.clipboard.writeText(
                                       encodedResult,
                                    );
                                    showToast('Copied transformed output!');
                                 }}
                                 className="text-xs text-[#daf4aa] hover:underline flex items-center gap-1">
                                 <Copy className="w-3 h-3" /> Copy Result
                              </button>
                           </div>
                           <textarea
                              readOnly
                              rows={4}
                              value={encodedResult}
                              className="w-full bg-[#09090b] border border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-[#daf4aa] font-mono select-all focus:outline-none"
                           />
                        </div>
                     </div>
                  </div>
               )}

               {/* ---------------------------------------------------------------- */}
               {/* TAB 6: DIRECT LINKS HUB                                          */}
               {/* ---------------------------------------------------------------- */}
               {activeTab === 'direct-links' && (
                  <div className="max-w-4xl mx-auto space-y-4">
                     <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0f0f11] backdrop-blur-xl space-y-5">
                        <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
                           {[
                              {
                                 id: 'whatsapp',
                                 label: 'WhatsApp Link',
                                 icon: MessageSquare,
                              },
                              {
                                 id: 'email',
                                 label: 'Email (mailto:)',
                                 icon: Mail,
                              },
                              { id: 'sms', label: 'SMS Link', icon: Send },
                              {
                                 id: 'call',
                                 label: 'Direct Call (tel:)',
                                 icon: Phone,
                              },
                           ].map((item) => {
                              const Icon = item.icon;
                              const isSel = hubType === item.id;
                              return (
                                 <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setHubType(item.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                                       isSel
                                          ? 'bg-[#daf4aa]/10 text-white border border-[#daf4aa]/40/40'
                                          : 'text-zinc-400 hover:text-white'
                                    }`}>
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{item.label}</span>
                                 </button>
                              );
                           })}
                        </div>

                        {/* WhatsApp Form */}
                        {hubType === 'whatsapp' && (
                           <div className="space-y-4">
                              <div>
                                 <label className="text-xs font-medium text-zinc-300">
                                    WhatsApp Phone (with Country Code)
                                 </label>
                                 <input
                                    type="text"
                                    value={hubWa.phone}
                                    onChange={(e) =>
                                       setHubWa({
                                          ...hubWa,
                                          phone: e.target.value,
                                       })
                                    }
                                    placeholder="+1 415 555 2671"
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                 />
                              </div>
                              <div>
                                 <label className="text-xs font-medium text-zinc-300">
                                    Prefilled Message
                                 </label>
                                 <textarea
                                    rows={3}
                                    value={hubWa.text}
                                    onChange={(e) =>
                                       setHubWa({
                                          ...hubWa,
                                          text: e.target.value,
                                       })
                                    }
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                 />
                              </div>
                           </div>
                        )}

                        {/* Email Form */}
                        {hubType === 'email' && (
                           <div className="space-y-3">
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                 <div>
                                    <label className="text-xs font-medium text-zinc-300">
                                       To Email
                                    </label>
                                    <input
                                       type="email"
                                       value={hubMail.to}
                                       onChange={(e) =>
                                          setHubMail({
                                             ...hubMail,
                                             to: e.target.value,
                                          })
                                       }
                                       className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                    />
                                 </div>
                                 <div>
                                    <label className="text-xs font-medium text-zinc-300">
                                       CC
                                    </label>
                                    <input
                                       type="email"
                                       value={hubMail.cc}
                                       onChange={(e) =>
                                          setHubMail({
                                             ...hubMail,
                                             cc: e.target.value,
                                          })
                                       }
                                       className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                    />
                                 </div>
                                 <div>
                                    <label className="text-xs font-medium text-zinc-300">
                                       BCC
                                    </label>
                                    <input
                                       type="email"
                                       value={hubMail.bcc}
                                       onChange={(e) =>
                                          setHubMail({
                                             ...hubMail,
                                             bcc: e.target.value,
                                          })
                                       }
                                       className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                    />
                                 </div>
                              </div>
                              <div>
                                 <label className="text-xs font-medium text-zinc-300">
                                    Subject
                                 </label>
                                 <input
                                    type="text"
                                    value={hubMail.subject}
                                    onChange={(e) =>
                                       setHubMail({
                                          ...hubMail,
                                          subject: e.target.value,
                                       })
                                    }
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                 />
                              </div>
                              <div>
                                 <label className="text-xs font-medium text-zinc-300">
                                    Body
                                 </label>
                                 <textarea
                                    rows={2}
                                    value={hubMail.body}
                                    onChange={(e) =>
                                       setHubMail({
                                          ...hubMail,
                                          body: e.target.value,
                                       })
                                    }
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                 />
                              </div>
                           </div>
                        )}

                        {/* SMS Form */}
                        {hubType === 'sms' && (
                           <div className="space-y-3">
                              <div>
                                 <label className="text-xs font-medium text-zinc-300">
                                    Recipient Phone Number
                                 </label>
                                 <input
                                    type="tel"
                                    value={hubSms.phone}
                                    onChange={(e) =>
                                       setHubSms({
                                          ...hubSms,
                                          phone: e.target.value,
                                       })
                                    }
                                    placeholder="+1 415 555 2671"
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                 />
                              </div>
                              <div>
                                 <label className="text-xs font-medium text-zinc-300">
                                    Prefilled SMS Message
                                 </label>
                                 <textarea
                                    rows={2}
                                    value={hubSms.text}
                                    onChange={(e) =>
                                       setHubSms({
                                          ...hubSms,
                                          text: e.target.value,
                                       })
                                    }
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                 />
                              </div>
                           </div>
                        )}

                        {/* Phone Call Form */}
                        {hubType === 'call' && (
                           <div className="space-y-3">
                              <div>
                                 <label className="text-xs font-medium text-zinc-300">
                                    Phone Number to Call
                                 </label>
                                 <input
                                    type="tel"
                                    value={hubCall.phone}
                                    onChange={(e) =>
                                       setHubCall({
                                          ...hubCall,
                                          phone: e.target.value,
                                       })
                                    }
                                    placeholder="+1 415 555 2671"
                                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white mt-1 focus:outline-none focus:border-[#daf4aa]/60"
                                 />
                              </div>
                           </div>
                        )}

                        {/* Result & Actions */}
                        <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 space-y-3">
                           <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                              Generated Clickable Protocol URL
                           </div>
                           <p className="text-xs font-mono text-zinc-200 break-all select-all">
                              {directLinkResult}
                           </p>
                           <div className="flex flex-wrap items-center gap-3 pt-2">
                              <button
                                 onClick={() => {
                                    navigator.clipboard.writeText(
                                       directLinkResult,
                                    );
                                    showToast(
                                       'Copied direct link to clipboard!',
                                    );
                                 }}
                                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#daf4aa] hover:bg-[#cbe699] text-[#16161b] text-xs font-medium">
                                 <Copy className="w-3.5 h-3.5" />
                                 <span>Copy Link</span>
                              </button>
                              <button
                                 onClick={sendDirectLinkToQr}
                                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs border border-zinc-800">
                                 <QrCode className="w-3.5 h-3.5 text-[#daf4aa]" />
                                 <span>Create QR Code</span>
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* ---------------------------------------------------------------- */}
               {/* TAB 7: URL CLEANER & TRACKING STRIPPER                           */}
               {/* ---------------------------------------------------------------- */}
               {activeTab === 'url-cleaner' && (
                  <div className="max-w-4xl mx-auto space-y-4">
                     <div className="p-6 rounded-2xl border border-zinc-800 bg-[#0f0f11] backdrop-blur-xl space-y-5">
                        <div>
                           <h2 className="text-base font-semibold text-white flex items-center gap-2">
                              <ShieldCheck className="w-5 h-5 text-emerald-400" />
                              Privacy URL Cleaner & Tracking Remover
                           </h2>
                           <p className="text-xs text-zinc-400 mt-1">
                              Automatically strips invasive marketing trackers (
                              <code className="text-[#daf4aa]">fbclid</code>,{' '}
                              <code className="text-[#daf4aa]">gclid</code>,{' '}
                              <code className="text-[#daf4aa]">utm_*</code>,{' '}
                              <code className="text-[#daf4aa]">igshid</code>,
                              etc.) to produce clean, safe, canonical URLs.
                           </p>
                        </div>

                        <div>
                           <label className="text-xs font-medium text-zinc-300 block mb-1">
                              Paste Tracking-Heavy URL
                           </label>
                           <textarea
                              rows={3}
                              value={dirtyUrl}
                              onChange={(e) => setDirtyUrl(e.target.value)}
                              placeholder="https://example.com/?utm_source=...&fbclid=..."
                              className="w-full bg-[#18181b] border border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#daf4aa]/60"
                           />
                        </div>

                        {/* Clean Result */}
                        <div className="p-4 rounded-xl bg-[#09090b] border border-zinc-800 space-y-3">
                           <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                                 <Check className="w-3.5 h-3.5" />
                                 Sanitized Clean URL (
                                 {cleanedUrlData.removedCount} trackers removed)
                              </span>
                              <button
                                 onClick={() => {
                                    navigator.clipboard.writeText(
                                       cleanedUrlData.cleanUrl,
                                    );
                                    showToast('Copied clean URL to clipboard!');
                                 }}
                                 className="text-[#daf4aa] hover:underline flex items-center gap-1">
                                 <Copy className="w-3 h-3" /> Copy Clean Link
                              </button>
                           </div>

                           <p className="text-xs font-mono text-zinc-200 break-all select-all bg-black/60 p-3 rounded-lg border border-zinc-800">
                              {cleanedUrlData.cleanUrl ||
                                 'Paste a URL above...'}
                           </p>

                           {cleanedUrlData.removedList.length > 0 && (
                              <div className="pt-2">
                                 <span className="text-[11px] text-zinc-500 font-medium block mb-1.5">
                                    Trackers Detected & Stripped:
                                 </span>
                                 <div className="flex flex-wrap gap-1.5">
                                    {cleanedUrlData.removedList.map(
                                       (param, idx) => (
                                          <span
                                             key={idx}
                                             className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono">
                                             {param.key}
                                          </span>
                                       ),
                                    )}
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </main>
      </div>
   );
}
