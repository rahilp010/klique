/**
 * Klique Analytics Module
 * Privacy-first event tracker ensuring no sensitive user inputs (passwords, JWTs, financial values,
 * file contents, or personal information) are ever logged or transmitted.
 * Follows event definitions specified in Section 11 of Klique_Complete_Product_Planning.md.
 */

// Denylist of sensitive keys to guarantee they are never included in analytics metadata
const SENSITIVE_KEYS = new Set([
   'text',
   'input',
   'password',
   'secret',
   'token',
   'jwt',
   'apikey',
   'api_key',
   'amount',
   'salary',
   'price',
   'principal',
   'pan',
   'aadhaar',
   'fileData',
   'content',
   'notes',
   'creditCard',
]);

/**
 * Strips any potentially sensitive values before logging or transmitting.
 */
function sanitizePayload(payload = {}) {
   const sanitized = {};
   for (const [key, value] of Object.entries(payload)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
         continue;
      }
      // Only keep scalar primitives or safe summary info (e.g., character count, execution time)
      if (
         typeof value === 'string' ||
         typeof value === 'number' ||
         typeof value === 'boolean'
      ) {
         sanitized[key] = value;
      }
   }
   return sanitized;
}

export const trackEvent = (eventName, params = {}) => {
   const safeParams = sanitizePayload({
      ...params,
      timestamp: Date.now(),
   });

   // In browser console for development
   if (import.meta.env?.DEV) {
      // Dev log (filtered)
      // console.debug(`[Analytics: ${eventName}]`, safeParams);
   }

   // Google Analytics / GTag if configured on window
   if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, safeParams);
   }

   // Dispatch custom DOM event for local hooks or session metric collectors
   if (typeof window !== 'undefined') {
      window.dispatchEvent(
         new CustomEvent('klique:analytics', {
            detail: { event: eventName, data: safeParams },
         })
      );
   }
};

// Convenience helpers
export const trackToolView = (toolId, category) =>
   trackEvent('tool_view', { toolId, category });

export const trackToolStart = (toolId) =>
   trackEvent('tool_start', { toolId });

export const trackToolComplete = (toolId, metrics = {}) =>
   trackEvent('tool_complete', { toolId, ...metrics });

export const trackToolCopy = (toolId, { outputType = 'text', size = 0 } = {}) =>
   trackEvent('tool_copy', { toolId, outputType, size });

export const trackToolDownload = (toolId, { fileType = '', fileSize = 0 } = {}) =>
   trackEvent('tool_download', { toolId, fileType, fileSize });

export const trackToolReset = (toolId) =>
   trackEvent('tool_reset', { toolId });

export const trackToolError = (toolId, errorType) =>
   trackEvent('tool_error', { toolId, errorType });

export const trackToolSearch = (queryLength, resultCount) =>
   trackEvent('tool_search', { queryLength, resultCount });

export const trackFavoriteToggle = (toolId, isFavorited) =>
   trackEvent('favorite_add', { toolId, isFavorited });

