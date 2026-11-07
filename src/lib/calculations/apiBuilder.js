/**
 * API Request Builder Engine
 * Client-side HTTP request execution, cURL generation, and latency benchmarking.
 */

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export const SAMPLE_API_PRESETS = [
   {
      id: 'get-users',
      name: 'GET Sample Users List',
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/users',
      headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
      queryParams: [{ key: 'limit', value: '5', enabled: true }],
      body: '',
   },
   {
      id: 'post-post',
      name: 'POST Create Post',
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/posts',
      headers: [
         { key: 'Content-Type', value: 'application/json; charset=UTF-8', enabled: true },
         { key: 'Accept', value: 'application/json', enabled: true },
      ],
      queryParams: [],
      body: JSON.stringify(
         {
            title: 'Klique API Request Test',
            body: 'Testing client-side HTTP request builder.',
            userId: 1,
         },
         null,
         2
      ),
   },
   {
      id: 'get-ip',
      name: 'GET IP & Headers Echo',
      method: 'GET',
      url: 'https://httpbin.org/get',
      headers: [{ key: 'User-Agent', value: 'Klique-API-Client/1.0', enabled: true }],
      queryParams: [{ key: 'format', value: 'json', enabled: true }],
      body: '',
   },
];

/**
 * Builds a query string and appends to URL
 */
export const buildUrlWithParams = (baseUrl, queryParams = []) => {
   if (!baseUrl) return '';
   try {
      const url = new URL(baseUrl);
      queryParams.forEach(({ key, value, enabled }) => {
         if (enabled && key.trim()) {
            url.searchParams.append(key.trim(), value.trim());
         }
      });
      return url.toString();
   } catch {
      // If relative or invalid URL syntax, fallback to raw concat
      const enabledParams = queryParams.filter((p) => p.enabled && p.key.trim());
      if (enabledParams.length === 0) return baseUrl;
      const qs = enabledParams
         .map((p) => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value.trim())}`)
         .join('&');
      return baseUrl.includes('?') ? `${baseUrl}&${qs}` : `${baseUrl}?${qs}`;
   }
};

/**
 * Generates an executable cURL snippet from request config
 */
export const generateCurlCommand = ({ url, method = 'GET', headers = [], queryParams = [], body = '' }) => {
   const finalUrl = buildUrlWithParams(url, queryParams);
   const lines = [`curl -X ${method} "${finalUrl}"`];

   headers.forEach(({ key, value, enabled }) => {
      if (enabled && key.trim()) {
         lines.push(`  -H "${key.trim()}: ${value.trim()}"`);
      }
   });

   if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && body && body.trim()) {
      // Escape inner quotes
      const escapedBody = body.replace(/"/g, '\\"');
      lines.push(`  -d "${escapedBody}"`);
   }

   return lines.join(' \\\n');
};

/**
 * Executes HTTP fetch request and measures latency, size, and status
 */
export const executeApiRequest = async ({
   url,
   method = 'GET',
   headers = [],
   queryParams = [],
   body = '',
   timeoutMs = 15000,
}) => {
   const finalUrl = buildUrlWithParams(url, queryParams);

   const requestHeaders = new Headers();
   headers.forEach(({ key, value, enabled }) => {
      if (enabled && key.trim()) {
         requestHeaders.append(key.trim(), value.trim());
      }
   });

   const options = {
      method,
      headers: requestHeaders,
   };

   if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && body && body.trim()) {
      options.body = body;
   }

   const controller = new AbortController();
   const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
   options.signal = controller.signal;

   const startTime = performance.now();

   try {
      const response = await fetch(finalUrl, options);
      clearTimeout(timeoutId);
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      const rawText = await response.text();
      let parsedJson = null;
      try {
         parsedJson = JSON.parse(rawText);
      } catch {
         // Not JSON
      }

      const responseHeaders = {};
      response.headers.forEach((val, key) => {
         responseHeaders[key] = val;
      });

      const bodySizeBytes = new Blob([rawText]).size;

      return {
         success: response.ok,
         status: response.status,
         statusText: response.statusText,
         latencyMs,
         bodySizeBytes,
         headers: responseHeaders,
         data: parsedJson ? JSON.stringify(parsedJson, null, 2) : rawText,
         isJson: Boolean(parsedJson),
      };
   } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
         throw new Error(`Request timed out after ${timeoutMs}ms.`);
      }

      // Check for common CORS failure
      throw new Error(
         `Request failed: ${err.message}. (Note: Browser CORS policy blocks requests if the target origin does not allow Access-Control-Allow-Origin).`
      );
   }
};
