/**
 * Pure calculation utilities for Quotation & Cost Estimate Generator.
 */

export function calculateQuotation(data = {}) {
   const {
      items = [],
      discountType = 'percent',
      discountValue = 0,
      taxRate = 18,
      validityDays = 30,
   } = data;

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

   const subtotal = Number(
      processedItems.reduce((acc, it) => acc + it.amount, 0).toFixed(2)
   );

   const numDiscountVal = Math.max(0, Number(discountValue) || 0);
   let discountAmount = 0;
   if (discountType === 'percent') {
      discountAmount = Number(((subtotal * Math.min(100, numDiscountVal)) / 100).toFixed(2));
   } else {
      discountAmount = Number(Math.min(subtotal, numDiscountVal).toFixed(2));
   }

   const taxableAmount = Math.max(0, Number((subtotal - discountAmount).toFixed(2)));
   const numTaxRate = Math.max(0, Number(taxRate) || 0);
   const taxAmount = Number(((taxableAmount * numTaxRate) / 100).toFixed(2));
   const grandTotal = Number((taxableAmount + taxAmount).toFixed(2));

   // Calculate expiry date
   const quoteDate = new Date();
   const expiryDate = new Date(quoteDate);
   expiryDate.setDate(expiryDate.getDate() + (Number(validityDays) || 30));

   return {
      items: processedItems,
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      grandTotal,
      validityDays: Number(validityDays) || 30,
      expiryDateFormatted: expiryDate.toLocaleDateString('en-IN', {
         day: 'numeric',
         month: 'short',
         year: 'numeric',
      }),
   };
}

