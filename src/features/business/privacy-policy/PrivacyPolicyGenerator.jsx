/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';
import {
   Shield,
   Copy,
   Download,
   Check,
   Sparkles,
   ChevronRight,
   HelpCircle,
   FileText,
   Code,
   Globe,
   Mail,
   Building,
   CheckSquare,
   RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import SEO from '../../../components/SEO';
import { trackToolCopy, trackToolDownload, trackToolReset } from '../../../lib/analytics';
import { getRelatedTools } from '../../../data/tools';
import { preloadRoute } from '../../../App';
import { Link } from 'react-router-dom';

const FAQS = [
   {
      question: 'Is this generated privacy policy legally binding?',
      answer:
         'This generator creates a comprehensive, standard starting draft compliant with typical GDPR, CCPA, and web requirements. However, since legal requirements vary across jurisdictions and industries, you should have qualified legal counsel review your final document before relying on it exclusively.',
   },
   {
      question: 'Do I need a privacy policy for my website or app?',
      answer:
         'Yes. If you collect email addresses, contact forms, analytics (e.g. Google Analytics), cookies, or process payments, laws like GDPR (EU), CCPA (California), and CalOPPA strictly require an accessible privacy policy on your website.',
   },
   {
      question: 'Can I export the privacy policy to HTML or Markdown?',
      answer:
         'Yes! You can instantly switch between Markdown (.md), clean semantic HTML, or plain text, and copy or download the file with a single click.',
   },
   {
      question: 'Is any of my company information stored remotely?',
      answer:
         'No. The policy generation happens 100% in your browser. None of your business names, URLs, or email addresses are sent to any remote server.',
   },
];

export default function PrivacyPolicyGenerator() {
   const [companyName, setCompanyName] = useState('Acme Technologies');
   const [websiteName, setWebsiteName] = useState('Acme App');
   const [websiteUrl, setWebsiteUrl] = useState('https://acme.example.com');
   const [contactEmail, setContactEmail] = useState('privacy@acme.example.com');
   const [effectiveDate, setEffectiveDate] = useState(
      new Date().toISOString().split('T')[0]
   );

   // Options
   const [collectNamesEmails, setCollectNamesEmails] = useState(true);
   const [useCookiesAnalytics, setUseCookiesAnalytics] = useState(true);
   const [processPayments, setProcessPayments] = useState(false);
   const [includeGDPR, setIncludeGDPR] = useState(true);
   const [includeCCPA, setIncludeCCPA] = useState(true);

   // Export View
   const [viewFormat, setViewFormat] = useState('preview'); // 'preview' | 'markdown' | 'html'
   const [copied, setCopied] = useState(false);
   const [toast, setToast] = useState({ visible: false, message: '' });

   const showToast = (message) => {
      setToast({ visible: true, message });
      setTimeout(() => setToast({ visible: false, message: '' }), 3000);
   };

   // Generate Markdown
   const markdownPolicy = useMemo(() => {
      return `# Privacy Policy for ${websiteName}

**Effective Date:** ${effectiveDate}

Welcome to **${websiteName}** ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy applies to all personal information collected through our website (${websiteUrl}) and related digital services.

---

### 1. Information We Collect

We only collect information necessary to provide and improve our services:

${collectNamesEmails ? `- **Personal Identifiers:** When you register, sign up for newsletters, or reach out to us, we may collect your name, email address, and communication preferences.\n` : ''}${useCookiesAnalytics ? `- **Log and Analytics Data:** We automatically log your browser type, operating system, referring URLs, device information, and pages viewed to monitor platform performance.\n- **Cookies and Tracking Technologies:** We use cookies and similar browser storage to keep you signed in, remember your preferences, and analyze site traffic.\n` : ''}${processPayments ? `- **Payment Information:** If you purchase goods or subscriptions, our third-party payment processors collect transaction and billing details. We do not store raw credit card numbers on our servers.\n` : ''}

---

### 2. How We Use Your Information

We process your data for legitimate business purposes:
- To operate, optimize, and maintain ${websiteName}.
- To respond to user inquiries and deliver customer support.
- To detect and prevent spam, fraud, and security vulnerabilities.
- To comply with statutory and legal obligations.

---

### 3. Sharing Your Information

We do not sell, rent, or trade your personal information. We only share information with:
- **Service Providers:** Trusted vendors who perform hosting, email delivery, analytics, and payment processing under strict confidentiality agreements.
- **Legal Compliance:** Authorities when strictly required by law, subpoena, or to protect the vital interests of our users.

---

${includeGDPR ? `### 4. Your Rights Under GDPR (European Union Users)

If you reside in the European Economic Area (EEA) or UK, you have the following data protection rights:
- **Right to Access:** Request copies of your personal data.
- **Right to Rectification:** Request correction of inaccurate information.
- **Right to Erasure ("Right to be Forgotten"):** Request deletion of your personal data.
- **Right to Restrict or Object:** Object to or restrict the processing of your data.
- **Right to Data Portability:** Request transfer of your data to another organization.

To exercise these rights, contact us at [${contactEmail}](mailto:${contactEmail}).\n\n---\n` : ''}

${includeCCPA ? `### 5. California Privacy Rights (CCPA / CPRA)

Under the California Consumer Privacy Act (CCPA), California residents have specific rights:
- **Right to Know:** The categories and specific pieces of personal information collected.
- **Right to Delete:** Request deletion of personal information collected from you.
- **Right to Non-Discrimination:** You will not receive discriminatory treatment for exercising your privacy rights.
- **Notice of No Sale:** We do not sell personal information as defined by California law.

To exercise your CCPA rights, email [${contactEmail}](mailto:${contactEmail}).\n\n---\n` : ''}

### 6. Data Security and Retention

We implement modern administrative, technical, and physical security measures to safeguard your data. We retain personal information only as long as necessary to fulfill the purposes outlined in this policy or satisfy legal requirements.

---

### 7. Children's Privacy

Our services are not directed to individuals under the age of 13. We do not knowingly collect personal data from children under 13. If you believe a child has provided us personal data, please contact us immediately.

---

### 8. Updates to This Policy

We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Effective Date" at the top of this policy.

---

### 9. Contact Us

If you have questions or comments regarding this Privacy Policy, please contact **${companyName}**:
- **Email:** ${contactEmail}
- **Website:** [${websiteUrl}](${websiteUrl})
`;
   }, [
      companyName,
      websiteName,
      websiteUrl,
      contactEmail,
      effectiveDate,
      collectNamesEmails,
      useCookiesAnalytics,
      processPayments,
      includeGDPR,
      includeCCPA,
   ]);

   // Generate HTML
   const htmlPolicy = useMemo(() => {
      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Privacy Policy - ${websiteName}</title>
</head>
<body>
  <article>
    <h1>Privacy Policy for ${websiteName}</h1>
    <p><strong>Effective Date:</strong> ${effectiveDate}</p>
    <p>Welcome to <strong>${websiteName}</strong>. We are committed to protecting your personal information and your right to privacy.</p>
    
    <h2>1. Information We Collect</h2>
    <ul>
      ${collectNamesEmails ? `<li><strong>Personal Identifiers:</strong> Name, email address, and communication preferences.</li>` : ''}
      ${useCookiesAnalytics ? `<li><strong>Analytics & Cookies:</strong> Browser type, logs, device metadata, and cookie storage for preferences.</li>` : ''}
      ${processPayments ? `<li><strong>Payment Information:</strong> Billing data processed securely by certified payment gateways.</li>` : ''}
    </ul>

    <h2>2. How We Use Your Information</h2>
    <p>We process your data to operate the service, troubleshoot bugs, prevent abuse, and deliver customer support.</p>

    ${includeGDPR ? `<h2>3. Your GDPR Rights</h2><p>EEA/UK users have rights of access, rectification, erasure, and portability. Contact ${contactEmail}.</p>` : ''}
    ${includeCCPA ? `<h2>4. California CCPA Notice</h2><p>California residents have the right to know, delete, and opt-out of data sales. We do not sell personal data.</p>` : ''}

    <h2>5. Contact Us</h2>
    <p>Questions? Contact <strong>${companyName}</strong> at <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>
  </article>
</body>
</html>`;
   }, [
      companyName,
      websiteName,
      contactEmail,
      effectiveDate,
      collectNamesEmails,
      useCookiesAnalytics,
      processPayments,
      includeGDPR,
      includeCCPA,
   ]);

   const handleCopy = () => {
      const textToCopy = viewFormat === 'html' ? htmlPolicy : markdownPolicy;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      trackToolCopy('privacy-policy-generator', { format: viewFormat });
      showToast(`Copied ${viewFormat.toUpperCase()} to clipboard!`);
   };

   const handleDownload = () => {
      const isHtml = viewFormat === 'html';
      const content = isHtml ? htmlPolicy : markdownPolicy;
      const ext = isHtml ? 'html' : 'md';
      const type = isHtml ? 'text/html;charset=utf-8;' : 'text/markdown;charset=utf-8;';

      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `privacy-policy.${ext}`;
      a.click();
      URL.revokeObjectURL(url);

      trackToolDownload('privacy-policy-generator', { fileType: ext });
      showToast(`Downloaded privacy-policy.${ext}!`);
   };

   const handleReset = () => {
      setCompanyName('Acme Technologies');
      setWebsiteName('Acme App');
      setWebsiteUrl('https://acme.example.com');
      setContactEmail('privacy@acme.example.com');
      setCollectNamesEmails(true);
      setUseCookiesAnalytics(true);
      setProcessPayments(false);
      setIncludeGDPR(true);
      setIncludeCCPA(true);
      trackToolReset('privacy-policy-generator');
      showToast('Reset fields to defaults.');
   };

   const relatedTools = useMemo(() => getRelatedTools('privacy-policy-generator', 3), []);

   return (
      <div
         className="relative min-h-[100dvh] w-full bg-[#09090b] text-zinc-100 font-sans customScrollbar overflow-x-hidden overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 overflow-hidden
            before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_45%)]
            after:absolute after:inset-0 after:bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,255,255,0.04),transparent_45%)]">
         <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.09),transparent_62%)]" />

         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[radial-gradient(ellipse_at_50%_0%,rgba(113,113,122,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.10),transparent_50%)]"
         />
         <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[900px] bg-[linear-gradient(to_right,rgba(113,113,122,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(113,113,122,0.10)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_20%,transparent_70%)]"
         />

         <SEO
            title="Privacy Policy Generator - Free GDPR & CCPA Compliant Policy | Klique"
            description="Generate a professional, custom privacy policy for your website, SaaS, or mobile app in seconds. Compliant with GDPR, CCPA, cookies, and payment processing regulations."
            keywords="privacy policy generator, free gdpr privacy policy, ccpa privacy policy generator, terms and privacy generator, website privacy policy free, klique"
            canonicalUrl="https://klique.netlify.app/tools/privacy-policy-generator"
            jsonLd={{
               '@context': 'https://schema.org',
               '@type': 'WebApplication',
               name: 'Privacy Policy Generator',
               applicationCategory: 'BusinessApplication',
               operatingSystem: 'Web',
               offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
               },
               description:
                  'Free, browser-based Privacy Policy generator customized for websites, apps, GDPR, CCPA, and modern analytics.',
            }}
         />

         <AnimatePresence>
            {toast.visible && (
               <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] flex items-center gap-2 rounded-full border border-emerald-500/30 bg-zinc-900/90 px-4 py-2 text-xs font-semibold text-emerald-400 shadow-2xl backdrop-blur-md">
                  <Sparkles size={14} className="animate-spin text-emerald-400" />
                  <span>{toast.message}</span>
               </motion.div>
            )}
         </AnimatePresence>

         <div className="relative z-[100] w-full mb-6">
            <Navbar />
         </div>

         <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col pb-28 pt-14 sm:pb-24 sm:pt-10 lg:pl-20">
            {/* Title Section */}
            <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-400 mb-3 backdrop-blur-md">
                     <Shield size={14} className="text-[#daf4aa]" />
                     <span>Legal & Compliance Suite</span>
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-4xl">
                     Privacy Policy Generator
                  </h1>
                  <p className="mt-1 text-sm text-zinc-400">
                     Generate a customized GDPR & CCPA compliant privacy policy for websites, mobile apps, and SaaS businesses.
                  </p>
               </motion.div>

               {/* Mode Switcher Tabs */}
               <div className="flex items-center gap-1 rounded-full backdrop-blur-xl py-1">
                  <button
                     onClick={() => setViewFormat('preview')}
                     className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                        viewFormat === 'preview'
                           ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                           : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                     }`}>
                     Preview
                  </button>
                  <button
                     onClick={() => setViewFormat('markdown')}
                     className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                        viewFormat === 'markdown'
                           ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                           : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                     }`}>
                     Markdown
                  </button>
                  <button
                     onClick={() => setViewFormat('html')}
                     className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                        viewFormat === 'html'
                           ? 'bg-[#daf4aa] text-zinc-950 shadow-[0_0_15px_rgba(218,244,170,0.3)]'
                           : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                     }`}>
                     HTML
                  </button>
               </div>
            </div>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
               <Link to="/" className="hover:text-zinc-300 transition-colors">Home</Link>
               <span>/</span>
               <Link to="/category/business-finance" className="hover:text-zinc-300 transition-colors">Business & Finance</Link>
               <span>/</span>
               <span className="text-zinc-300">Privacy Policy Generator</span>
            </div>

            {/* Main Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">
               {/* Parameters Config */}
               <div className="lg:col-span-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                     <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Building size={16} className="text-[#daf4aa]" />
                        Business & Entity Details
                     </h2>
                     <button
                        onClick={handleReset}
                        className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                        Reset
                     </button>
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1">
                     <label className="text-xs font-medium text-zinc-300">Company or Entity Name</label>
                     <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                     />
                  </div>

                  {/* Website Name & URL */}
                  <div className="grid grid-cols-2 gap-3">
                     <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-300">Website / App Name</label>
                        <input
                           type="text"
                           value={websiteName}
                           onChange={(e) => setWebsiteName(e.target.value)}
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs font-medium text-zinc-300">Website URL</label>
                        <input
                           type="text"
                           value={websiteUrl}
                           onChange={(e) => setWebsiteUrl(e.target.value)}
                           className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                        />
                     </div>
                  </div>

                  {/* Contact Email */}
                  <div className="space-y-1">
                     <label className="text-xs font-medium text-zinc-300">Privacy Contact Email</label>
                     <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-[#daf4aa]/60 focus:ring-1 focus:ring-[#daf4aa]/40"
                     />
                  </div>

                  {/* Data Collection Toggles */}
                  <div className="border-t border-zinc-800/80 pt-3 space-y-2.5">
                     <span className="text-xs font-semibold text-zinc-300">Data Practices & Clauses</span>

                     <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                        <input
                           type="checkbox"
                           checked={collectNamesEmails}
                           onChange={(e) => setCollectNamesEmails(e.target.checked)}
                           className="accent-[#daf4aa] rounded"
                        />
                        Collects names, accounts, or emails
                     </label>

                     <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                        <input
                           type="checkbox"
                           checked={useCookiesAnalytics}
                           onChange={(e) => setUseCookiesAnalytics(e.target.checked)}
                           className="accent-[#daf4aa] rounded"
                        />
                        Uses cookies & analytics (Google Analytics, etc.)
                     </label>

                     <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                        <input
                           type="checkbox"
                           checked={processPayments}
                           onChange={(e) => setProcessPayments(e.target.checked)}
                           className="accent-[#daf4aa] rounded"
                        />
                        Processes payments or subscriptions (Stripe/PayPal)
                     </label>

                     <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                        <input
                           type="checkbox"
                           checked={includeGDPR}
                           onChange={(e) => setIncludeGDPR(e.target.checked)}
                           className="accent-[#daf4aa] rounded"
                        />
                        Include European Union GDPR Rights
                     </label>

                     <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                        <input
                           type="checkbox"
                           checked={includeCCPA}
                           onChange={(e) => setIncludeCCPA(e.target.checked)}
                           className="accent-[#daf4aa] rounded"
                        />
                        Include California CCPA / CPRA Notice
                     </label>
                  </div>
               </div>

               {/* Policy Output & Actions */}
               <div className="lg:col-span-7 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                     <div className="text-xs text-zinc-400 font-medium">
                        Format: <span className="text-white uppercase font-bold">{viewFormat}</span>
                     </div>

                     <div className="flex items-center gap-2">
                        <button
                           onClick={handleCopy}
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer">
                           {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                           <span>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                           onClick={handleDownload}
                           className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#daf4aa] hover:bg-[#c8e692] text-zinc-950 font-bold text-xs shadow-[0_0_15px_rgba(218,244,170,0.25)] transition-all cursor-pointer">
                           <Download size={13} />
                           <span>Download</span>
                        </button>
                     </div>
                  </div>

                  {/* Document Display */}
                  <div className="max-h-[460px] overflow-y-auto customScrollbar p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 font-sans text-xs leading-relaxed text-zinc-300">
                     {viewFormat === 'preview' ? (
                        <div className="space-y-4 whitespace-pre-line text-zinc-200">
                           {markdownPolicy}
                        </div>
                     ) : viewFormat === 'markdown' ? (
                        <pre className="font-mono text-[11px] text-[#daf4aa] whitespace-pre-wrap">
                           {markdownPolicy}
                        </pre>
                     ) : (
                        <pre className="font-mono text-[11px] text-cyan-300/90 whitespace-pre-wrap">
                           {htmlPolicy}
                        </pre>
                     )}
                  </div>
               </div>
            </div>

            {/* FAQs Accordion */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 sm:p-8 backdrop-blur-md space-y-4 mb-8">
               <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle size={17} className="text-[#daf4aa]" />
                  Frequently Asked Questions
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {FAQS.map((faq, i) => (
                     <div key={i} className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50 space-y-1.5">
                        <h4 className="text-xs font-semibold text-zinc-200">{faq.question}</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{faq.answer}</p>
                     </div>
                  ))}
               </div>
            </div>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
               <div className="border-t border-zinc-800/80 pt-8 space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-sm font-semibold text-white">Related Tools</h3>
                     <Link
                        to="/category"
                        className="text-xs text-[#daf4aa] hover:underline flex items-center gap-1 transition-colors">
                        Browse all tools <ChevronRight size={13} />
                     </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     {relatedTools.map((tool) => (
                        <Link
                           key={tool.id}
                           to={tool.slug}
                           onMouseEnter={() => preloadRoute(tool.slug)}
                           className="group p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all">
                           <div className="text-xs font-semibold text-zinc-200 group-hover:text-[#daf4aa] transition-colors">
                              {tool.name}
                           </div>
                           <div className="text-[11px] text-zinc-500 line-clamp-2 mt-1">
                              {tool.description}
                           </div>
                        </Link>
                     ))}
                  </div>
               </div>
            )}
         </main>
      </div>
   );
}

