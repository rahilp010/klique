/**
 * Klique Central Tool Registry
 * Single source of truth for tool metadata, categorization, search, and navigation.
 * Formatted and classified according to Klique_Complete_Product_Planning.md.
 */

export const tools = [
   // ==========================================
   // EXISTING ACTIVE TOOLS (19)
   // ==========================================
   {
      id: 'ai-writer',
      name: 'AI Writer',
      slug: '/aiwriter',
      category: 'AI Tools',
      description: 'Paraphrase sentences, rewrite articles, and generate creative copy with AI.',
      tags: ['ai', 'paraphrase', 'rewrite', 'writing', 'copywriting', 'sentence rewritter'],
      problemPhrases: ['rephrase sentence', 'rewrite text', 'ai writing assistant', 'paraphrase article'],
      status: 'active',
      featured: true,
      complexity: 'medium',
      privacy: 'cloud',
      icon: 'Sparkles',
   },
   {
      id: 'fancy-fonts',
      name: 'Fancy Fonts',
      slug: '/fontgenerator',
      category: 'Text & Writing',
      description: 'Generate stylish text fonts and unicode typography for social media.',
      tags: ['fonts', 'stylish', 'text', 'writing', 'unicode', 'fancy text', 'instagram fonts'],
      problemPhrases: ['stylish font for bio', 'fancy text generator', 'cool fonts copy paste'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'Type',
   },
   {
      id: 'username-generator',
      name: 'Username Generator',
      slug: '/username',
      category: 'Text & Writing',
      description: 'Create unique, aesthetic usernames and handles for your social profiles.',
      tags: ['username', 'generator', 'social', 'handles', 'gamertag', 'ideas'],
      problemPhrases: ['find good username', 'unique handle generator', 'instagram username ideas'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'UserRound',
   },
   {
      id: 'word-counter',
      name: 'Word Counter',
      slug: '/wordcounter',
      category: 'Text & Writing',
      description: 'Count words, characters, sentences, paragraphs, and estimate reading time.',
      tags: ['word', 'count', 'text', 'writing', 'characters', 'reading time', 'density'],
      problemPhrases: ['how many words', 'character counter without spaces', 'reading time estimate'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'AlignLeft',
   },
   {
      id: 'hashtag-generator',
      name: 'Hashtag Generator',
      slug: '/hashtaggenerator',
      category: 'Text & Writing',
      description: 'Generate high-reach hashtags and captions for Instagram, TikTok, and X.',
      tags: ['hashtag', 'social', 'marketing', 'instagram', 'tags', 'growth'],
      problemPhrases: ['best hashtags for post', 'instagram hashtag generator', 'viral tags'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'cloud',
      icon: 'Hash',
   },
   {
      id: 'cool-symbol',
      name: 'Cool Symbol',
      slug: '/symbol',
      category: 'Text & Writing',
      description: 'Browse, search, and copy special characters, symbols, and aesthetic marks.',
      tags: ['symbol', 'special-characters', 'text', 'copy', 'aesthetic', 'arrows'],
      problemPhrases: ['special characters copy paste', 'cool symbols for name', 'unicode symbols'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'Command',
   },
   {
      id: 'emoji-generator',
      name: 'Emoji Generator',
      slug: '/emojigenerator',
      category: 'Text & Writing',
      description: 'Search, mix, match, and copy emojis easily with complete Unicode support.',
      tags: ['emoji', 'copy', 'text', 'emoticons', 'kitchen', 'mixer'],
      problemPhrases: ['search emoji', 'emoji combinations', 'copy emoji to clipboard'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'Smile',
   },
   {
      id: 'bio-generator',
      name: 'Bio Generator',
      slug: '/bio',
      category: 'Text & Writing',
      description: 'Generate compelling, personalized bios for Instagram, LinkedIn, and Twitter.',
      tags: ['bio', 'social', 'profile', 'linkedin', 'instagram', 'about me'],
      problemPhrases: ['write instagram bio', 'short bio for linkedin', 'profile intro generator'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'cloud',
      icon: 'Sparkle',
   },
   {
      id: 'time-zone-converter',
      name: 'Time Zone Converter',
      slug: '/timezone',
      category: 'Productivity',
      description: 'Convert time across global cities and plan remote meetings without confusion.',
      tags: ['time', 'zone', 'converter', 'productivity', 'world clock', 'meeting planner'],
      problemPhrases: ['convert pst to ist', 'what time is it in london', 'plan cross-timezone meeting'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'Clock',
   },
   {
      id: 'json-formatter',
      name: 'JSON Formatter & Diff',
      slug: '/jsonformatter',
      category: 'Developer Tools',
      description: 'Format, validate, minify, inspect, and compare JSON structures locally.',
      tags: ['json', 'format', 'developer', 'validation', 'beautify', 'minify', 'diff'],
      problemPhrases: ['prettify json', 'validate json syntax', 'compare two json files', 'fix broken json'],
      status: 'active',
      featured: true,
      complexity: 'small',
      privacy: 'local',
      icon: 'Braces',
   },
   {
      id: 'secret-scanner',
      name: 'Secret Scanner',
      slug: '/secretscanner',
      category: 'Developer Tools',
      description: 'Scan code and text client-side for exposed API keys, tokens, and credentials.',
      tags: ['secret', 'scan', 'security', 'developer', 'token', 'credentials', 'redact'],
      problemPhrases: ['check code for secrets', 'scan api keys before commit', 'redact exposed credentials'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'ShieldCheck',
   },
   {
      id: 'code-to-image',
      name: 'Code to Image',
      slug: '/codeimage',
      category: 'Developer Tools',
      description: 'Turn code snippets into gorgeous, shareable screenshots with themes and gradients.',
      tags: ['code', 'image', 'developer', 'screenshot', 'carbon', 'snippet'],
      problemPhrases: ['pretty code screenshot', 'share code snippet as image', 'code to png'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'Code2',
   },
   {
      id: 'pdf-tools',
      name: 'PDF Tools',
      slug: '/convert',
      category: 'Image & PDF',
      description: 'Convert documents to PDF, merge, split, and manipulate files in the browser.',
      tags: ['pdf', 'convert', 'file', 'word to pdf', 'documents'],
      problemPhrases: ['word to pdf converter', 'convert docx to pdf free', 'pdf utilities'],
      status: 'active',
      featured: false,
      complexity: 'medium',
      privacy: 'local',
      icon: 'FileText',
   },
   {
      id: 'svg-converter',
      name: 'SVG Converter',
      slug: '/svgconverter',
      category: 'Image & PDF',
      description: 'Convert SVG vector files to PNG, JPEG, WebP, and optimize SVG code.',
      tags: ['svg', 'convert', 'image', 'vector', 'optimize', 'png'],
      problemPhrases: ['convert svg to png high resolution', 'optimize svg size', 'export svg as jpg'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'GalleryHorizontalEnd',
   },
   {
      id: 'favicon-generator',
      name: 'Favicon Generator',
      slug: '/favicongenerator',
      category: 'Image & PDF',
      description: 'Generate multi-size favicon packages, Apple touch icons, and site.webmanifest.',
      tags: ['favicon', 'icon', 'image', 'manifest', 'app icon', 'web development'],
      problemPhrases: ['make favicon from png', 'generate apple-touch-icon', 'create site manifest'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'Package',
   },
   {
      id: 'image-tools',
      name: 'Image Tools',
      slug: '/imageoptimizer',
      category: 'Image & PDF',
      description: 'Compress, resize, crop, convert, watermark, and enhance images locally.',
      tags: ['image', 'compress', 'optimize', 'resize', 'crop', 'webp', 'watermark'],
      problemPhrases: ['compress image without losing quality', 'resize photo for web', 'convert image to webp'],
      status: 'active',
      featured: true,
      complexity: 'medium',
      privacy: 'local',
      icon: 'ImageIcon',
   },
   {
      id: 'qr-link-tools',
      name: 'QR & Link Tools',
      slug: '/qrlinktools',
      category: 'QR & Web',
      description: 'Generate customizable QR codes, build UTM campaign links, and decode URLs.',
      tags: ['qr', 'code', 'link', 'web', 'utm', 'url builder', 'generator'],
      problemPhrases: ['create qr code with logo', 'generate utm tracking link', 'read qr code from image'],
      status: 'active',
      featured: false,
      complexity: 'medium',
      privacy: 'local',
      icon: 'QrCode',
   },
   {
      id: 'og-previewer',
      name: 'Social OG Previewer',
      slug: '/ogpreviewer',
      category: 'QR & Web',
      description: 'Preview Open Graph social media cards for Twitter, LinkedIn, and Discord.',
      tags: ['og', 'preview', 'social', 'web', 'meta tags', 'twitter card', 'seo'],
      problemPhrases: ['check link preview', 'how does my link look on twitter', 'debug og image'],
      status: 'active',
      featured: false,
      complexity: 'medium',
      privacy: 'cloud',
      icon: 'Share2',
   },
   {
      id: 'file-encryption',
      name: 'File Encryption',
      slug: '/fileencryption',
      category: 'File Utilities',
      description: 'Encrypt and decrypt files client-side using strong AES-GCM encryption.',
      tags: ['file', 'encryption', 'security', 'utility', 'aes-gcm', 'password protect'],
      problemPhrases: ['encrypt file with password', 'decrypt aes file', 'secure file locally in browser'],
      status: 'active',
      featured: false,
      complexity: 'medium',
      privacy: 'local',
      icon: 'FileKey2',
   },

   // ==========================================
   // PHASE 1 RELEASED TOOLS (7)
   // ==========================================
   {
      id: 'gst-calculator',
      name: 'GST Calculator (India)',
      slug: '/tools/gst-calculator',
      category: 'Business & Finance',
      description: 'Calculate GST-inclusive and exclusive amounts, split CGST/SGST/IGST, and reverse GST.',
      tags: ['gst', 'tax', 'india', 'business', 'cgst', 'sgst', 'igst', 'invoice tax', 'calculator'],
      problemPhrases: ['calculate tax', 'gst inclusive exclusive', 'reverse gst calculation', '18 percent gst on amount'],
      status: 'active',
      featured: true,
      complexity: 'small',
      privacy: 'local',
      icon: 'Calculator',
   },
   {
      id: 'emi-calculator',
      name: 'EMI Calculator',
      slug: '/tools/emi-calculator',
      category: 'Business & Finance',
      description: 'Calculate loan EMI, total interest payable, repayment schedule, and amortization.',
      tags: ['emi', 'loan', 'interest', 'finance', 'home loan', 'car loan', 'repayment schedule'],
      problemPhrases: ['loan monthly payment', 'calculate home loan emi', 'total interest on loan', 'car loan installment'],
      status: 'active',
      featured: true,
      complexity: 'small',
      privacy: 'local',
      icon: 'DollarSign',
   },
   {
      id: 'attendance-calculator',
      name: 'Attendance Calculator',
      slug: '/tools/attendance-calculator',
      category: 'Student Tools',
      description: 'Check attendance percentage, required classes to hit 75%, and safe bunk limits.',
      tags: ['attendance', 'student', 'college', 'bunk', 'target percentage', 'classes'],
      problemPhrases: ['how many classes can I miss', '75 percent attendance calculator', 'how many lectures to attend'],
      status: 'active',
      featured: true,
      complexity: 'small',
      privacy: 'local',
      icon: 'GraduationCap',
   },
   {
      id: 'cgpa-calculator',
      name: 'CGPA / GPA Calculator',
      slug: '/tools/cgpa-calculator',
      category: 'Student Tools',
      description: 'Calculate semester SGPA, overall CGPA, percentage conversion, and grade estimation.',
      tags: ['cgpa', 'gpa', 'student', 'college', 'grades', 'percentage conversion', 'sgpa'],
      problemPhrases: ['convert cgpa to percentage', 'calculate semester gpa', 'credit point calculator'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'Award',
   },
   {
      id: 'split-bill-calculator',
      name: 'Split Bill Calculator',
      slug: '/tools/split-bill-calculator',
      category: 'Productivity',
      description: 'Split restaurant bills, calculate tips, divide shared expenses, and settle up easily.',
      tags: ['split bill', 'tip', 'restaurant', 'friends', 'expenses', 'group expense'],
      problemPhrases: ['split restaurant bill', 'divide bill between friends', 'tip calculator split'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'Receipt',
   },
   {
      id: 'whatsapp-link-generator',
      name: 'WhatsApp Link Generator',
      slug: '/tools/whatsapp-link-generator',
      category: 'QR & Web',
      description: 'Create direct click-to-chat WhatsApp links and QR codes with prefilled messages.',
      tags: ['whatsapp', 'wa.me', 'link', 'chat', 'qr', 'prefilled message', 'click to chat'],
      problemPhrases: ['send message without saving number', 'whatsapp click to chat link', 'whatsapp qr code message'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'MessageSquare',
   },
   {
      id: 'profit-margin-calculator',
      name: 'Profit Margin Calculator',
      slug: '/tools/profit-margin-calculator',
      category: 'Business & Finance',
      description: 'Calculate gross profit, margin percentage, markup percentage, and break-even revenue.',
      tags: ['profit', 'margin', 'markup', 'selling price', 'cost', 'ecommerce', 'business'],
      problemPhrases: ['calculate profit margin', 'markup percentage formula', 'selling price from cost and margin'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'TrendingUp',
   },
   {
      id: 'upi-qr-generator',
      name: 'UPI QR Generator',
      slug: '/tools/upi-qr-generator',
      category: 'Business & Finance',
      description: 'Generate static or dynamic UPI payment QR codes with custom amounts and merchant names.',
      tags: ['upi', 'qr', 'payment', 'india', 'gpay', 'phonepe', 'paytm', 'merchant'],
      problemPhrases: ['create upi payment qr code', 'generate qr with amount', 'accept upi payments qr'],
      status: 'active',
      featured: true,
      complexity: 'small',
      privacy: 'local',
      icon: 'QrCode',
   },
   {
      id: 'regex-tester',
      name: 'Regex Tester & Debugger',
      slug: '/tools/regex-tester',
      category: 'Developer Tools',
      description: 'Test regular expressions in real-time with syntax highlighting, capture groups, and cheatsheet.',
      tags: ['regex', 'regular expression', 'tester', 'developer', 'match', 'flags', 'groups'],
      problemPhrases: ['test regex online', 'match regular expression', 'regex tester with groups'],
      status: 'active',
      featured: true,
      complexity: 'small',
      privacy: 'local',
      icon: 'Binary',
   },
   {
      id: 'json-to-typescript',
      name: 'JSON to TypeScript',
      slug: '/tools/json-to-typescript',
      category: 'Developer Tools',
      description: 'Generate clean TypeScript interfaces and types from nested JSON data instantly.',
      tags: ['json', 'typescript', 'interface', 'type', 'developer', 'converter'],
      problemPhrases: ['convert json to interface', 'json to ts types', 'auto generate typescript interface'],
      status: 'active',
      featured: true,
      complexity: 'small',
      privacy: 'local',
      icon: 'FileCode2',
   },
   {
      id: 'jwt-decoder',
      name: 'JWT Decoder',
      slug: '/tools/jwt-decoder',
      category: 'Developer Tools',
      description: 'Decode JSON Web Token headers, payloads, and inspect token expiration client-side.',
      tags: ['jwt', 'decode', 'token', 'auth', 'developer', 'bearer', 'expiration'],
      problemPhrases: ['decode jwt token', 'inspect jwt payload', 'check jwt expiry time'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'KeyRound',
   },
   {
      id: 'sql-formatter',
      name: 'SQL Formatter & Beautifier',
      slug: '/tools/sql-formatter',
      category: 'Developer Tools',
      description: 'Format, indent, beautify, and minify SQL queries in real-time with keyword capitalization.',
      tags: ['sql', 'format', 'beautify', 'minify', 'postgres', 'mysql', 'database'],
      problemPhrases: ['format sql query online', 'sql beautifier', 'clean sql query'],
      status: 'active',
      featured: false,
      complexity: 'medium',
      privacy: 'local',
      icon: 'Database',
   },
   {
      id: 'cron-generator',
      name: 'Cron Generator & Explainer',
      slug: '/tools/cron-generator',
      category: 'Developer Tools',
      description: 'Build, test, and translate standard 5-part cron expressions into human-readable English.',
      tags: ['cron', 'crontab', 'schedule', 'cron generator', 'cronjob', 'explainer'],
      problemPhrases: ['cron expression generator', 'translate cron to english', 'crontab schedule builder'],
      status: 'active',
      featured: false,
      complexity: 'small',
      privacy: 'local',
      icon: 'Clock',
   },
   {
      id: 'invoice-generator',
      name: 'Invoice Generator',
      slug: '/tools/invoice-generator',
      category: 'Business & Finance',
      description: 'Create professional PDF invoices with business details, tax calculations, discounts, and print layouts.',
      tags: ['invoice', 'pdf', 'billing', 'freelancer', 'business', 'receipt', 'tax invoice'],
      problemPhrases: ['free invoice generator', 'create pdf invoice online', 'gst invoice maker'],
      status: 'active',
      featured: true,
      complexity: 'large',
      privacy: 'local',
      icon: 'FileSpreadsheet',
   },
   {
      id: 'quotation-generator',
      name: 'Quotation Generator',
      slug: '/tools/quotation-generator',
      category: 'Business & Finance',
      description: 'Create commercial price estimates and proposals with milestones, validity, and print PDF download.',
      tags: ['quotation', 'estimate', 'proposal', 'pricing', 'client quote', 'freelancer quote'],
      problemPhrases: ['quotation maker online', 'price estimate generator', 'freelance proposal quote'],
      status: 'active',
      featured: false,
      complexity: 'medium',
      privacy: 'local',
      icon: 'FileText',
   },
   {
      id: 'salary-calculator',
      name: 'Salary Calculator (CTC to In-Hand)',
      slug: '/tools/salary-calculator',
      category: 'Business & Finance',
      description: 'Calculate exact monthly take-home pay from annual CTC with EPF, Professional Tax, and New Tax Regime.',
      tags: ['salary', 'ctc', 'in-hand', 'take home', 'epf', 'tax regime', 'income tax'],
      problemPhrases: ['ctc to in hand calculator', 'take home salary calculator india', 'salary payslip breakdown'],
      status: 'active',
      featured: true,
      complexity: 'medium',
      privacy: 'local',
      icon: 'IndianRupee',
   },
   {
      id: 'email-signature-generator',
      name: 'Email Signature Generator',
      slug: '/tools/email-signature-generator',
      category: 'Business & Finance',
      description: 'Create clean, mobile-responsive HTML email signatures compatible with Gmail, Outlook, and Apple Mail.',
      tags: ['email signature', 'html signature', 'gmail signature', 'outlook signature', 'business signature'],
      problemPhrases: ['free email signature generator', 'create html signature for gmail', 'email footer generator'],
      status: 'active',
      featured: false,
      complexity: 'medium',
      privacy: 'local',
      icon: 'Mail',
   },
];

// ==========================================
// QUERY & SEARCH HELPERS
// ==========================================

export const getAllTools = () => tools;

export const getActiveTools = () => tools.filter((t) => t.status === 'active');

export const getPlannedTools = () => tools.filter((t) => t.status === 'planned');

export const getFeaturedTools = () => tools.filter((t) => t.featured);

export const getToolById = (id) => tools.find((t) => t.id === id);

export const getToolBySlug = (slug) => tools.find((t) => t.slug === slug);

export const getToolsByCategory = (categoryName) =>
   tools.filter(
      (t) => t.category.toLowerCase() === categoryName?.toLowerCase()
   );

/**
 * Intelligent tool search matching query against name, category, description,
 * tags, and problem phrases.
 */
export const searchTools = (query, { includePlanned = true } = {}) => {
   if (!query || !query.trim()) {
      return includePlanned ? tools : getActiveTools();
   }

   const cleanQuery = query.toLowerCase().trim();
   const queryWords = cleanQuery.split(/\s+/).filter(Boolean);

   return tools
      .filter((t) => (includePlanned ? true : t.status === 'active'))
      .map((tool) => {
         let score = 0;
         const nameLower = tool.name.toLowerCase();
         const categoryLower = tool.category.toLowerCase();
         const descLower = tool.description.toLowerCase();

         // Exact match on name
         if (nameLower === cleanQuery) score += 100;
         else if (nameLower.startsWith(cleanQuery)) score += 60;
         else if (nameLower.includes(cleanQuery)) score += 40;

         // Category match
         if (categoryLower.includes(cleanQuery)) score += 30;

         // Problem phrases match
         if (tool.problemPhrases?.some((phrase) => phrase.toLowerCase().includes(cleanQuery))) {
            score += 50;
         }

         // Tags match
         tool.tags?.forEach((tag) => {
            if (tag.toLowerCase() === cleanQuery) score += 45;
            else if (tag.toLowerCase().includes(cleanQuery)) score += 20;
         });

         // Multi-word matches
         queryWords.forEach((word) => {
            if (nameLower.includes(word)) score += 15;
            if (descLower.includes(word)) score += 8;
            if (tool.tags?.some((tag) => tag.toLowerCase().includes(word))) score += 10;
            if (tool.problemPhrases?.some((phrase) => phrase.toLowerCase().includes(word))) score += 12;
         });

         return { ...tool, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);
};

/**
 * Get related tools based on category and tags, excluding the current tool.
 */
export const getRelatedTools = (currentToolId, limit = 4) => {
   const current = getToolById(currentToolId);
   if (!current) return tools.slice(0, limit);

   const currentTags = new Set(current.tags || []);

   return tools
      .filter((t) => t.id !== currentToolId)
      .map((tool) => {
         let similarity = 0;
         if (tool.category === current.category) similarity += 5;
         (tool.tags || []).forEach((tag) => {
            if (currentTags.has(tag)) similarity += 2;
         });
         return { ...tool, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
};

