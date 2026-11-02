/**
 * WhatsApp Link Generation Utilities
 * Formats international phone numbers and generates wa.me links with custom encoded messages.
 */

export function sanitizePhoneNumber(phone = '', defaultCountryCode = '91') {
   if (!phone) return '';
   // Remove all non-digits except a leading +
   let cleaned = String(phone).trim().replace(/[^\d+]/g, '');

   if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
   } else if (cleaned.length === 10 && defaultCountryCode) {
      // Common convenience for 10-digit mobile numbers without country code
      cleaned = `${defaultCountryCode}${cleaned}`;
   }

   return cleaned;
}

export function generateWhatsAppLink({
   phone = '',
   message = '',
   defaultCountryCode = '91',
}) {
   const cleanPhone = sanitizePhoneNumber(phone, defaultCountryCode);
   const trimmedMessage = String(message || '').trim();

   let link = '';
   if (cleanPhone) {
      link = `https://wa.me/${cleanPhone}`;
      if (trimmedMessage) {
         link += `?text=${encodeURIComponent(trimmedMessage)}`;
      }
   } else if (trimmedMessage) {
      // General share link without predefined recipient
      link = `https://wa.me/?text=${encodeURIComponent(trimmedMessage)}`;
   }

   const isValidPhone = cleanPhone.length >= 7 && cleanPhone.length <= 15;

   return {
      phone: cleanPhone,
      message: trimmedMessage,
      link,
      isValidPhone,
   };
}

