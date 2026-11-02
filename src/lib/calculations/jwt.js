/**
 * Client-Side JWT (JSON Web Token) Decoder & Inspector.
 * Safe base64url decoding with zero network traffic.
 */

function base64UrlDecode(str) {
   let output = str.replace(/-/g, '+').replace(/_/g, '/');
   switch (output.length % 4) {
      case 0:
         break;
      case 2:
         output += '==';
         break;
      case 3:
         output += '=';
         break;
      default:
         throw new Error('Illegal base64url string!');
   }
   return decodeURIComponent(
      escape(window.atob(output))
   );
}

export function decodeJWT(tokenString = '') {
   const token = String(tokenString || '').trim();

   if (!token) {
      return {
         isValid: false,
         header: null,
         payload: null,
         signature: '',
         headerFormatted: '',
         payloadFormatted: '',
         isExpired: false,
         expiryDate: null,
         issuedDate: null,
         status: 'Empty Token',
         error: null,
      };
   }

   const parts = token.split('.');
   if (parts.length !== 3) {
      return {
         isValid: false,
         header: null,
         payload: null,
         signature: '',
         headerFormatted: '',
         payloadFormatted: '',
         isExpired: false,
         expiryDate: null,
         issuedDate: null,
         status: 'Malformed JWT',
         error: 'A valid JWT must have 3 parts separated by dots (header.payload.signature).',
      };
   }

   try {
      const headerStr = base64UrlDecode(parts[0]);
      const payloadStr = base64UrlDecode(parts[1]);
      const signature = parts[2];

      const header = JSON.parse(headerStr);
      const payload = JSON.parse(payloadStr);

      let isExpired = false;
      let expiryDate = null;
      let issuedDate = null;
      let status = 'Active Token';

      if (payload.exp) {
         expiryDate = new Date(payload.exp * 1000);
         isExpired = Date.now() > expiryDate.getTime();
         status = isExpired ? 'Expired' : 'Active & Valid';
      }

      if (payload.iat) {
         issuedDate = new Date(payload.iat * 1000);
      }

      return {
         isValid: true,
         header,
         payload,
         signature,
         headerFormatted: JSON.stringify(header, null, 2),
         payloadFormatted: JSON.stringify(payload, null, 2),
         isExpired,
         expiryDate,
         expiryFormatted: expiryDate ? expiryDate.toLocaleString() : 'No expiration set',
         issuedDate,
         issuedFormatted: issuedDate ? issuedDate.toLocaleString() : 'Not provided',
         status,
         algorithm: header.alg || 'Unknown',
         tokenType: header.typ || 'JWT',
         error: null,
      };
   } catch (err) {
      return {
         isValid: false,
         header: null,
         payload: null,
         signature: '',
         headerFormatted: '',
         payloadFormatted: '',
         isExpired: false,
         expiryDate: null,
         issuedDate: null,
         status: 'Invalid Base64 / JSON',
         error: `Failed to decode JWT: ${err.message}`,
      };
   }
}

