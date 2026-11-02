/**
 * GST (Goods and Services Tax) Calculation Utilities
 * Handles inclusive and exclusive GST, intra-state (CGST/SGST) and inter-state (IGST) split,
 * and reverse GST calculations with proper rounding.
 */

export const GST_RATES = [0, 5, 12, 18, 28];

export function calculateGST({
   amount = 0,
   rate = 18,
   isInclusive = false,
   supplyType = 'intra', // 'intra' (CGST + SGST) | 'inter' (IGST)
}) {
   const baseAmount = Number(amount) || 0;
   const gstRate = Number(rate) || 0;

   if (baseAmount < 0 || gstRate < 0) {
      return {
         netAmount: 0,
         gstAmount: 0,
         totalAmount: 0,
         cgst: 0,
         sgst: 0,
         igst: 0,
         cgstRate: 0,
         sgstRate: 0,
         igstRate: 0,
      };
   }

   let netAmount = 0;
   let gstAmount = 0;
   let totalAmount = 0;

   if (isInclusive) {
      // Amount entered already includes GST
      totalAmount = baseAmount;
      netAmount = baseAmount / (1 + gstRate / 100);
      gstAmount = totalAmount - netAmount;
   } else {
      // Amount entered is net (exclusive of GST)
      netAmount = baseAmount;
      gstAmount = (baseAmount * gstRate) / 100;
      totalAmount = baseAmount + gstAmount;
   }

   const isIntra = supplyType === 'intra';
   const cgstRate = isIntra ? gstRate / 2 : 0;
   const sgstRate = isIntra ? gstRate / 2 : 0;
   const igstRate = isIntra ? 0 : gstRate;

   const cgst = isIntra ? gstAmount / 2 : 0;
   const sgst = isIntra ? gstAmount / 2 : 0;
   const igst = isIntra ? 0 : gstAmount;

   return {
      netAmount: Number(netAmount.toFixed(2)),
      gstAmount: Number(gstAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      cgst: Number(cgst.toFixed(2)),
      sgst: Number(sgst.toFixed(2)),
      igst: Number(igst.toFixed(2)),
      cgstRate,
      sgstRate,
      igstRate,
      isInclusive,
      supplyType,
      rate: gstRate,
   };
}

