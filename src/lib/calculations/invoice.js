/**
 * Pure calculation and formatting utilities for Invoice Generator.
 * Handles subtotal, line items, multi-tier GST / tax rates, discounts,
 * shipping fees, round-off, and number-to-words currency formatting.
 */

export function calculateInvoice(data = {}) {
   const {
      items = [],
      discountType = 'percent', // 'percent' | 'fixed'
      discountValue = 0,
      taxType = 'gst', // 'gst' (CGST+SGST or IGST) | 'flat' | 'none'
      taxRate = 18,
      supplyType = 'intra', // 'intra' (CGST+SGST) | 'inter' (IGST)
      shippingFee = 0,
      enableRoundOff = true,
   } = data;

   // 1. Calculate each item line total
   const processedItems = items.map((item, idx) => {
      const qty = Math.max(0, Number(item.qty) || 0);
      const rate = Math.max(0, Number(item.rate) || 0);
      const amount = Number((qty * rate).toFixed(2));
      return {
         ...item,
         id: item.id || String(idx + 1),
         qty,
         rate,
         amount,
      };
   });

   // 2. Subtotal
   const subtotal = Number(
      processedItems.reduce((acc, it) => acc + it.amount, 0).toFixed(2)
   );

   // 3. Discount
   const numDiscountVal = Math.max(0, Number(discountValue) || 0);
   let discountAmount = 0;
   if (discountType === 'percent') {
      discountAmount = Number(((subtotal * Math.min(100, numDiscountVal)) / 100).toFixed(2));
   } else {
      discountAmount = Number(Math.min(subtotal, numDiscountVal).toFixed(2));
   }

   const taxableAmount = Math.max(0, Number((subtotal - discountAmount).toFixed(2)));

   // 4. Tax Calculation
   const numTaxRate = Math.max(0, Number(taxRate) || 0);
   let cgstAmount = 0;
   let sgstAmount = 0;
   let igstAmount = 0;
   let totalTaxAmount = 0;

   if (taxType === 'gst') {
      if (supplyType === 'intra') {
         const halfRate = numTaxRate / 2;
         cgstAmount = Number(((taxableAmount * halfRate) / 100).toFixed(2));
         sgstAmount = Number(((taxableAmount * halfRate) / 100).toFixed(2));
         totalTaxAmount = Number((cgstAmount + sgstAmount).toFixed(2));
      } else {
         igstAmount = Number(((taxableAmount * numTaxRate) / 100).toFixed(2));
         totalTaxAmount = igstAmount;
      }
   } else if (taxType === 'flat') {
      totalTaxAmount = Number(((taxableAmount * numTaxRate) / 100).toFixed(2));
   } else {
      totalTaxAmount = 0;
   }

   // 5. Shipping & Raw Total
   const numShipping = Math.max(0, Number(shippingFee) || 0);
   const rawTotal = taxableAmount + totalTaxAmount + numShipping;

   // 6. Round Off & Final Total
   let roundOff = 0;
   let grandTotal = rawTotal;
   if (enableRoundOff) {
      grandTotal = Math.round(rawTotal);
      roundOff = Number((grandTotal - rawTotal).toFixed(2));
   } else {
      grandTotal = Number(rawTotal.toFixed(2));
   }

   return {
      items: processedItems,
      subtotal,
      discountAmount,
      taxableAmount,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalTaxAmount,
      shippingFee: numShipping,
      roundOff,
      grandTotal,
      itemCount: processedItems.length,
   };
}

/**
 * Converts a number to Indian Rupee Words (e.g. 15400 -> Fifteen Thousand Four Hundred Rupees Only)
 */
export function numberToWordsINR(amount) {
   const num = Math.round(Number(amount) || 0);
   if (num === 0) return 'Zero Rupees Only';
   if (num < 0) return 'Negative ' + numberToWordsINR(Math.abs(num));

   const singleDigits = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen'
   ];
   const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
   ];

   function convertTwoDigits(n) {
      if (n < 20) return singleDigits[n];
      const ten = Math.floor(n / 10);
      const rest = n % 10;
      return tens[ten] + (rest > 0 ? ' ' + singleDigits[rest] : '');
   }

   function convertThreeDigits(n) {
      const hundred = Math.floor(n / 100);
      const rest = n % 100;
      let str = '';
      if (hundred > 0) {
         str += singleDigits[hundred] + ' Hundred';
      }
      if (rest > 0) {
         if (str !== '') str += ' and ';
         str += convertTwoDigits(rest);
      }
      return str;
   }

   let str = '';
   const crore = Math.floor(num / 10000000);
   let remainder = num % 10000000;

   const lakh = Math.floor(remainder / 100000);
   remainder = remainder % 100000;

   const thousand = Math.floor(remainder / 1000);
   remainder = remainder % 1000;

   if (crore > 0) {
      str += convertTwoDigits(crore) + ' Crore ';
   }
   if (lakh > 0) {
      str += convertTwoDigits(lakh) + ' Lakh ';
   }
   if (thousand > 0) {
      str += convertTwoDigits(thousand) + ' Thousand ';
   }
   if (remainder > 0) {
      str += convertThreeDigits(remainder);
   }

   return (str.trim() + ' Rupees Only');
}

