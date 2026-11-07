/**
 * Website SEO Analyzer Engine
 * Comprehensive client-side DOM & metadata auditor for SEO health.
 */

export const SAMPLE_HTML_SNIPPET = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Klique - Free Online Creator & Developer Tools</title>
  <meta name="description" content="Discover 30+ free client-side developer, productivity, and business tools. 100% private with no server uploads.">
  <link rel="canonical" href="https://klique.tools">
  <meta property="og:title" content="Klique - Free Creator Suite">
  <meta property="og:description" content="Productivity and developer utilities in your browser.">
  <meta property="og:image" content="https://klique.tools/og-preview.png">
  <meta name="twitter:card" content="summary_large_image">
</head>
<body>
  <h1>All-in-One Content Creator Toolbox</h1>
  <h2>Developer Tools</h2>
  <p>Format SQL, decode JWTs, and test Regex.</p>
  <img src="/logo.png" alt="Klique Brand Logo">
  <img src="/banner.jpg" alt="Developer Suite Banner">
</body>
</html>`;

/**
 * Analyzes HTML content and returns structured audit checks, scores, and warnings
 */
export const analyzeHtmlSEO = (htmlContent = '') => {
   if (!htmlContent || !htmlContent.trim()) {
      return null;
   }

   const parser = new DOMParser();
   const doc = parser.parseFromString(htmlContent, 'text/html');

   const checks = [];
   let passedCount = 0;
   let warningCount = 0;
   let criticalCount = 0;

   // 1. Page Title
   const titleEl = doc.querySelector('title');
   const titleText = titleEl ? titleEl.textContent.trim() : '';
   if (!titleText) {
      checks.push({
         category: 'Meta & Title',
         label: 'Page Title',
         status: 'critical',
         message: 'Missing <title> tag. Critical for search engine rankings.',
      });
      criticalCount++;
   } else if (titleText.length < 30) {
      checks.push({
         category: 'Meta & Title',
         label: 'Page Title Length',
         status: 'warning',
         message: `Title is ${titleText.length} characters (recommended: 40-60 characters). Consider making it more descriptive.`,
         value: `"${titleText}"`,
      });
      warningCount++;
   } else if (titleText.length > 65) {
      checks.push({
         category: 'Meta & Title',
         label: 'Page Title Length',
         status: 'warning',
         message: `Title is ${titleText.length} characters (may be truncated on search result pages).`,
         value: `"${titleText}"`,
      });
      warningCount++;
   } else {
      checks.push({
         category: 'Meta & Title',
         label: 'Page Title',
         status: 'passed',
         message: `Optimal length (${titleText.length} chars).`,
         value: `"${titleText}"`,
      });
      passedCount++;
   }

   // 2. Meta Description
   const descEl = doc.querySelector('meta[name="description"]');
   const descText = descEl ? descEl.getAttribute('content')?.trim() : '';
   if (!descText) {
      checks.push({
         category: 'Meta & Title',
         label: 'Meta Description',
         status: 'critical',
         message: 'Missing meta description. Search engines will generate automated snippets.',
      });
      criticalCount++;
   } else if (descText.length < 70) {
      checks.push({
         category: 'Meta & Title',
         label: 'Meta Description Length',
         status: 'warning',
         message: `Description is short (${descText.length} chars). Ideal range is 120-160 characters.`,
         value: `"${descText}"`,
      });
      warningCount++;
   } else if (descText.length > 165) {
      checks.push({
         category: 'Meta & Title',
         label: 'Meta Description Length',
         status: 'warning',
         message: `Description is ${descText.length} chars and may be cut off on Google mobile SERPs.`,
         value: `"${descText}"`,
      });
      warningCount++;
   } else {
      checks.push({
         category: 'Meta & Title',
         label: 'Meta Description',
         status: 'passed',
         message: `Optimal description length (${descText.length} chars).`,
         value: `"${descText}"`,
      });
      passedCount++;
   }

   // 3. Viewport Meta
   const viewportEl = doc.querySelector('meta[name="viewport"]');
   if (viewportEl) {
      checks.push({
         category: 'Mobile & Indexing',
         label: 'Mobile Viewport Tag',
         status: 'passed',
         message: 'Responsive viewport meta tag present.',
      });
      passedCount++;
   } else {
      checks.push({
         category: 'Mobile & Indexing',
         label: 'Mobile Viewport Tag',
         status: 'critical',
         message: 'Missing viewport meta tag. Essential for mobile-friendly ranking.',
      });
      criticalCount++;
   }

   // 4. Canonical Tag
   const canonicalEl = doc.querySelector('link[rel="canonical"]');
   if (canonicalEl && canonicalEl.getAttribute('href')) {
      checks.push({
         category: 'Mobile & Indexing',
         label: 'Canonical Link',
         status: 'passed',
         message: 'Canonical URL link configured to prevent duplicate content.',
         value: canonicalEl.getAttribute('href'),
      });
      passedCount++;
   } else {
      checks.push({
         category: 'Mobile & Indexing',
         label: 'Canonical Link',
         status: 'warning',
         message: 'No canonical URL tag found. Recommended to consolidate indexing signals.',
      });
      warningCount++;
   }

   // 5. OpenGraph Tags
   const ogTitle = doc.querySelector('meta[property="og:title"]')?.getAttribute('content');
   const ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
   const ogDesc = doc.querySelector('meta[property="og:description"]')?.getAttribute('content');

   if (ogTitle && ogImage && ogDesc) {
      checks.push({
         category: 'Social Media Cards',
         label: 'Open Graph (Social Sharing)',
         status: 'passed',
         message: 'Social preview meta tags (og:title, og:image, og:description) properly configured.',
      });
      passedCount++;
   } else {
      checks.push({
         category: 'Social Media Cards',
         label: 'Open Graph (Social Sharing)',
         status: 'warning',
         message: 'Missing og:title, og:image, or og:description tags for rich social media cards.',
      });
      warningCount++;
   }

   // 6. Heading 1 Structure
   const h1Els = doc.querySelectorAll('h1');
   if (h1Els.length === 1) {
      checks.push({
         category: 'Heading Architecture',
         label: 'H1 Heading Tag',
         status: 'passed',
         message: `Single main H1 heading found: "${h1Els[0].textContent.trim()}".`,
      });
      passedCount++;
   } else if (h1Els.length === 0) {
      checks.push({
         category: 'Heading Architecture',
         label: 'H1 Heading Tag',
         status: 'critical',
         message: 'No <h1> tag detected. Every page should have one primary H1 topic heading.',
      });
      criticalCount++;
   } else {
      checks.push({
         category: 'Heading Architecture',
         label: 'Multiple H1 Tags',
         status: 'warning',
         message: `Detected ${h1Els.length} H1 headings. Best practice is exactly one primary H1 per page.`,
      });
      warningCount++;
   }

   // 7. Image Alt Text
   const images = Array.from(doc.querySelectorAll('img'));
   const missingAlt = images.filter((img) => !img.hasAttribute('alt') || !img.getAttribute('alt').trim());
   if (images.length === 0) {
      checks.push({
         category: 'Media & Accessibility',
         label: 'Image Alt Attributes',
         status: 'passed',
         message: 'No images detected.',
      });
      passedCount++;
   } else if (missingAlt.length === 0) {
      checks.push({
         category: 'Media & Accessibility',
         label: 'Image Alt Attributes',
         status: 'passed',
         message: `All ${images.length} image(s) have descriptive alt attributes.`,
      });
      passedCount++;
   } else {
      checks.push({
         category: 'Media & Accessibility',
         label: 'Missing Alt Attributes',
         status: 'warning',
         message: `${missingAlt.length} of ${images.length} images are missing descriptive alt text for accessibility and image search.`,
      });
      warningCount++;
   }

   // Calculate Score (0-100)
   const totalChecks = passedCount + warningCount + criticalCount;
   const score = totalChecks > 0 ? Math.round(((passedCount + warningCount * 0.5) / totalChecks) * 100) : 0;

   return {
      score,
      passedCount,
      warningCount,
      criticalCount,
      totalChecks,
      checks,
      title: titleText,
      description: descText,
      h1Count: h1Els.length,
      imageCount: images.length,
   };
};
