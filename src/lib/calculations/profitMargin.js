/**
 * Profit Margin & Markup Calculation Utilities
 * Calculates gross profit, profit margin %, markup %, and target selling prices.
 */

export function calculateProfit({
   costPrice = 0,
   sellingPrice = 0,
}) {
   const cp = Math.max(0, Number(costPrice) || 0);
   const sp = Math.max(0, Number(sellingPrice) || 0);

   const profit = sp - cp;
   const margin = sp > 0 ? (profit / sp) * 100 : 0;
   const markup = cp > 0 ? (profit / cp) * 100 : 0;

   return {
      costPrice: cp,
      sellingPrice: sp,
      grossProfit: Number(profit.toFixed(2)),
      marginPercent: Number(margin.toFixed(2)),
      markupPercent: Number(markup.toFixed(2)),
      isLoss: profit < 0,
      breakEvenPrice: cp,
   };
}

export function calculateSellingPriceFromMargin({ costPrice = 0, marginPercent = 0 }) {
   const cp = Math.max(0, Number(costPrice) || 0);
   const margin = Number(marginPercent) || 0;

   if (margin >= 100) {
      return { sellingPrice: 0, grossProfit: 0, error: 'Margin cannot be 100% or higher' };
   }

   const sp = cp / (1 - margin / 100);
   const profit = sp - cp;
   const markup = cp > 0 ? (profit / cp) * 100 : 0;

   return {
      costPrice: cp,
      sellingPrice: Number(sp.toFixed(2)),
      grossProfit: Number(profit.toFixed(2)),
      marginPercent: margin,
      markupPercent: Number(markup.toFixed(2)),
   };
}

export function calculateSellingPriceFromMarkup({ costPrice = 0, markupPercent = 0 }) {
   const cp = Math.max(0, Number(costPrice) || 0);
   const markup = Number(markupPercent) || 0;

   const sp = cp * (1 + markup / 100);
   const profit = sp - cp;
   const margin = sp > 0 ? (profit / sp) * 100 : 0;

   return {
      costPrice: cp,
      sellingPrice: Number(sp.toFixed(2)),
      grossProfit: Number(profit.toFixed(2)),
      markupPercent: markup,
      marginPercent: Number(margin.toFixed(2)),
   };
}

