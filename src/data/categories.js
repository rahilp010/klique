/**
 * Klique Official Category System
 * Mapped to the product architecture defined in Section 3 of Klique_Complete_Product_Planning.md
 */

export const CATEGORIES = [
   {
      id: 'ai',
      name: 'AI Tools',
      slug: 'ai-tools',
      description: 'AI-assisted generation, text paraphrasing, and intelligent utilities.',
      icon: 'Sparkles',
      badgeColor: 'emerald',
   },
   {
      id: 'text',
      name: 'Text & Writing',
      slug: 'text-writing',
      description: 'Fonts, word counts, symbols, and text transformation tools.',
      icon: 'Type',
      badgeColor: 'purple',
   },
   {
      id: 'business',
      name: 'Business & Finance',
      slug: 'business-finance',
      description: 'GST, EMI, invoices, quotations, and financial planning calculators.',
      icon: 'Calculator',
      badgeColor: 'amber',
   },
   {
      id: 'productivity',
      name: 'Productivity',
      slug: 'productivity',
      description: 'Time zone converters, split bills, habit trackers, and focus tools.',
      icon: 'Clock',
      badgeColor: 'blue',
   },
   {
      id: 'student',
      name: 'Student Tools',
      slug: 'student-tools',
      description: 'Attendance calculators, GPA trackers, and study planning aids.',
      icon: 'GraduationCap',
      badgeColor: 'cyan',
   },
   {
      id: 'developer',
      name: 'Developer Tools',
      slug: 'developer-tools',
      description: 'JSON formatters, regex testers, JWT decoders, and code utilities.',
      icon: 'Code2',
      badgeColor: 'emerald',
   },
   {
      id: 'image-pdf',
      name: 'Image & PDF',
      slug: 'image-pdf',
      description: 'Image compression, SVG conversion, and PDF document utilities.',
      icon: 'FileText',
      badgeColor: 'rose',
   },
   {
      id: 'qr-web',
      name: 'QR & Web',
      slug: 'qr-web',
      description: 'QR codes, WhatsApp links, Open Graph previewers, and web tools.',
      icon: 'QrCode',
      badgeColor: 'teal',
   },
   {
      id: 'file-utilities',
      name: 'File Utilities',
      slug: 'file-utilities',
      description: 'Client-side file encryption, privacy safeguards, and file helpers.',
      icon: 'FileKey2',
      badgeColor: 'indigo',
   },
];

export const getCategoryById = (id) =>
   CATEGORIES.find((c) => c.id === id || c.name.toLowerCase() === id?.toLowerCase());

export const getCategoryByName = (name) =>
   CATEGORIES.find((c) => c.name.toLowerCase() === name?.toLowerCase());

export const getCategoryBySlug = (slug) =>
   CATEGORIES.find((c) => c.slug === slug);

