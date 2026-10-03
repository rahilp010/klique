/* ============================================================
   Klique Unified AI Service
   Supports OpenRouter / Nara Router & Gemini API with Auto-Fallback
============================================================ */

const OPENROUTER_API_KEY =
   import.meta.env.VITE_OPENROUTER_API_KEY ||
   import.meta.env.VITE_NARA_ROUTER_API_KEY ||
   import.meta.env.VITE_NARA_API_KEY ||
   import.meta.env.VITE_OPEN_ROUTER_KEY ||
   import.meta.env.VITE_NARA_KEY ||
   '';

let rawBaseUrl =
   import.meta.env.VITE_OPENROUTER_BASE_URL ||
   import.meta.env.VITE_NARA_BASE_URL ||
   'https://router.bynara.id/v1/chat/completions';

rawBaseUrl = rawBaseUrl.trim().replace(/\/+$/, '');
if (!rawBaseUrl.endsWith('/chat/completions')) {
   rawBaseUrl += '/chat/completions';
}

// Convert direct Nara Router URL to local Vite proxy path in browser environment to prevent CORS issue
let PROXY_BASE_URL = rawBaseUrl;
if (typeof window !== 'undefined' && rawBaseUrl.includes('router.bynara.id')) {
   PROXY_BASE_URL = rawBaseUrl.replace('https://router.bynara.id', '/api/nara');
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

export async function callAiApi(promptText, options = {}) {
   // const { model = 'agnes-2.5-flash' } = options;
   const { model = 'agnes-2.5-flash' } = options;

   // 1. Try OpenRouter / Nara Router via Proxy or Direct URL
   if (OPENROUTER_API_KEY) {
      const endpointsToTry = PROXY_BASE_URL !== rawBaseUrl ? [PROXY_BASE_URL, rawBaseUrl] : [PROXY_BASE_URL];

      for (const endpoint of endpointsToTry) {
         try {
            const res = await fetch(endpoint, {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                  'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
                  'X-Title': 'Klique AI',
               },
               body: JSON.stringify({
                  model: model,
                  messages: [{ role: 'user', content: promptText }],
               }),
            });

            const data = await res.json();
            if (data.error) {
               throw new Error(data.error.message || 'OpenRouter / Nara Router API error');
            }

            const text = data?.choices?.[0]?.message?.content;
            if (text) return text.trim();
         } catch (err) {
            console.warn(`OpenRouter / Nara Router request to ${endpoint} failed:`, err);
         }
      }
   }

   // 2. Fallback to Gemini Direct API
   if (GEMINI_API_KEY) {
      try {
         const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  contents: [{ role: 'user', parts: [{ text: promptText }] }],
               }),
            },
         );

         const data = await res.json();
         if (data.error) {
            throw new Error(data.error.message);
         }

         const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
         if (text) return text.trim();
      } catch (err) {
         console.error('Gemini API Error:', err);
         throw new Error('AI Service Error: ' + err.message);
      }
   }

   throw new Error(
      'No active AI API Key found. Please set VITE_OPENROUTER_API_KEY or VITE_NARA_ROUTER_API_KEY or VITE_GEMINI_API_KEY in your .env file.',
   );
}

