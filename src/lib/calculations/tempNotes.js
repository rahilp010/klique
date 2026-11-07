/**
 * Temporary Notes & Ephemeral Crypto Routines
 * In-browser Web Crypto encryption, expiry calculation, and self-destruction.
 */

export const EXPIRATION_OPTIONS = [
   { label: '10 Minutes', value: 10 * 60 },
   { label: '1 Hour', value: 60 * 60 },
   { label: '24 Hours', value: 24 * 60 * 60 },
   { label: '7 Days', value: 7 * 24 * 60 * 60 },
   { label: 'Burn on First Read', value: 0 },
];

/**
 * Format remaining seconds into human readable countdown (e.g. "59m 40s")
 */
export const formatExpiryTime = (seconds) => {
   if (seconds <= 0) return 'Expired / Destroyed';
   const h = Math.floor(seconds / 3600);
   const m = Math.floor((seconds % 3600) / 60);
   const s = seconds % 60;

   if (h > 0) return `${h}h ${m}m ${s}s`;
   if (m > 0) return `${m}m ${s}s`;
   return `${s}s`;
};

/**
 * Encodes note content with optional password using Web Crypto AES-GCM
 */
export const encryptNote = async (plaintext, password = '') => {
   if (!password) {
      // Return URL-safe UTF-8 Base64
      return btoa(encodeURIComponent(plaintext));
   }

   const enc = new TextEncoder();
   const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
   );

   const salt = crypto.getRandomValues(new Uint8Array(16));
   const iv = crypto.getRandomValues(new Uint8Array(12));

   const key = await crypto.subtle.deriveKey(
      {
         name: 'PBKDF2',
         salt,
         iterations: 100000,
         hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
   );

   const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plaintext)
   );

   // Pack salt + iv + ciphertext
   const combined = new Uint8Array(salt.byteLength + iv.byteLength + ciphertext.byteLength);
   combined.set(salt, 0);
   combined.set(iv, salt.byteLength);
   combined.set(new Uint8Array(ciphertext), salt.byteLength + iv.byteLength);

   return btoa(String.fromCharCode(...combined));
};

/**
 * Decodes note content
 */
export const decryptNote = async (encodedData, password = '') => {
   if (!password) {
      try {
         return decodeURIComponent(atob(encodedData));
      } catch {
         return atob(encodedData);
      }
   }

   try {
      const binaryString = atob(encodedData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
         bytes[i] = binaryString.charCodeAt(i);
      }

      const salt = bytes.slice(0, 16);
      const iv = bytes.slice(16, 28);
      const ciphertext = bytes.slice(28);

      const enc = new TextEncoder();
      const keyMaterial = await crypto.subtle.importKey(
         'raw',
         enc.encode(password),
         { name: 'PBKDF2' },
         false,
         ['deriveKey']
      );

      const key = await crypto.subtle.deriveKey(
         {
            name: 'PBKDF2',
            salt,
            iterations: 100000,
            hash: 'SHA-256',
         },
         keyMaterial,
         { name: 'AES-GCM', length: 256 },
         false,
         ['decrypt']
      );

      const decrypted = await crypto.subtle.decrypt(
         { name: 'AES-GCM', iv },
         key,
         ciphertext
      );

      const dec = new TextDecoder();
      return dec.decode(decrypted);
   } catch {
      throw new Error('Incorrect password or corrupted note data.');
   }
};

