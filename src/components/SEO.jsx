import { useEffect } from 'react';

/**
 * Reusable SEO Component to dynamically update page titles, descriptions,
 * keywords, robots directives, Open Graph metadata, Twitter Cards, canonical links, and JSON-LD schemas.
 */
export default function SEO({
   title,
   description,
   keywords,
   canonicalUrl,
   robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
   ogType = 'website',
   ogImage = 'https://klique.netlify.app/assets/klique.png',
   jsonLd,
}) {
   const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : null;

   useEffect(() => {
      const currentUrl = canonicalUrl || window.location.href;

      // 1. Update Title
      if (title) {
         document.title = title.includes('Klique') ? title : `${title} | Klique - Creator Toolbox`;
      }

      // Helper to update/create meta tag
      const updateMeta = (name, value, isProperty = false) => {
         if (value === undefined || value === null) return;
         const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
         let meta = document.querySelector(selector);
         if (!meta) {
            meta = document.createElement('meta');
            if (isProperty) {
               meta.setAttribute('property', name);
            } else {
               meta.setAttribute('name', name);
            }
            document.head.appendChild(meta);
         }
         meta.setAttribute('content', value);
      };

      // Helper to update/create link tag
      const updateLink = (rel, href) => {
         if (!href) return;
         let link = document.querySelector(`link[rel="${rel}"]`);
         if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', rel);
            document.head.appendChild(link);
         }
         link.setAttribute('href', href);
      };

      // 2. Update Core Meta Tags
      if (description) updateMeta('description', description);
      if (keywords) updateMeta('keywords', keywords);
      if (robots) updateMeta('robots', robots);

      // Open Graph Tags
      if (title) updateMeta('og:title', title, true);
      if (description) updateMeta('og:description', description, true);
      updateMeta('og:type', ogType, true);
      updateMeta('og:url', currentUrl, true);
      if (ogImage) updateMeta('og:image', ogImage, true);
      updateMeta('og:site_name', 'Klique', true);
      updateMeta('og:locale', 'en_US', true);

      // Twitter Cards
      updateMeta('twitter:card', 'summary_large_image');
      if (title) updateMeta('twitter:title', title);
      if (description) updateMeta('twitter:description', description);
      if (ogImage) updateMeta('twitter:image', ogImage);

      // Canonical URL
      updateLink('canonical', currentUrl);

      // 3. Update Structured Data (JSON-LD)
      const existingScript = document.getElementById('jsonLd-seo');
      if (existingScript) {
         existingScript.remove();
      }

      if (jsonLdString) {
         const script = document.createElement('script');
         script.id = 'jsonLd-seo';
         script.type = 'application/ld+json';
         script.innerHTML = jsonLdString;
         document.head.appendChild(script);
      }

      // Cleanup function to remove route-specific JSON-LD
      return () => {
         const script = document.getElementById('jsonLd-seo');
         if (script) {
            script.remove();
         }
      };
   }, [title, description, keywords, canonicalUrl, robots, ogType, ogImage, jsonLdString]);

   return null;
}

