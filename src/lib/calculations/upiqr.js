/**
 * Pure calculation and URI formatting utilities for UPI Payment QR Generator.
 * Complies with NPCI (National Payments Corporation of India) UPI specifications.
 */

const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9]{2,64}$/;

export function generateUPIURI(data = {}) {
   const {
      vpa = '', // Virtual Payment Address e.g. merchant@upi
      payeeName = '',
      amount = '', // optional, can be empty for static QR
      note = '', // transaction note e.g. "Invoice 104"
      refUrl = '',
   } = data;

   const cleanVPA = String(vpa || '').trim();
   const cleanName = String(payeeName || '').trim();
   const cleanAmount = Number(amount) > 0 ? Number(amount).toFixed(2) : '';
   const cleanNote = String(note || '').trim();

   const isValidVPA = UPI_REGEX.test(cleanVPA);

   if (!cleanVPA) {
      return {
         uri: '',
         isValid: false,
         error: 'UPI ID is required.',
      };
   }

   if (!isValidVPA) {
      return {
         uri: '',
         isValid: false,
         error: 'Invalid UPI ID format (must be username@bank/handle).',
      };
   }

   const params = new URLSearchParams();
   params.append('pa', cleanVPA);
   if (cleanName) params.append('pn', cleanName);
   if (cleanAmount) {
      params.append('am', cleanAmount);
      params.append('cu', 'INR');
   }
   if (cleanNote) params.append('tn', cleanNote);
   if (refUrl) params.append('url', refUrl);

   const uri = `upi://pay?${params.toString()}`;

   return {
      uri,
      cleanVPA,
      cleanName,
      cleanAmount,
      cleanNote,
      isValid: true,
      error: null,
   };
}

