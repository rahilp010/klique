/**
 * Split Bill Calculation Utilities
 * Calculates equal and custom bill shares, tips, taxes, and generates clear settlement summaries.
 */

export function calculateEqualSplit({
   billAmount = 0,
   tipPercent = 0,
   tipAmount = 0,
   useTipPercent = true,
   taxPercent = 0,
   taxAmount = 0,
   useTaxPercent = true,
   numPeople = 1,
   roundUp = false,
}) {
   const base = Math.max(0, Number(billAmount) || 0);
   const people = Math.max(1, parseInt(numPeople, 10) || 1);

   const tip = useTipPercent
      ? (base * (Math.max(0, Number(tipPercent)) || 0)) / 100
      : Math.max(0, Number(tipAmount) || 0);

   const tax = useTaxPercent
      ? (base * (Math.max(0, Number(taxPercent)) || 0)) / 100
      : Math.max(0, Number(taxAmount) || 0);

   const subtotal = base + tax;
   let grandTotal = base + tip + tax;

   let perPersonTotal = grandTotal / people;
   if (roundUp) {
      perPersonTotal = Math.ceil(perPersonTotal);
   }

   const perPersonBase = base / people;
   const perPersonTip = tip / people;
   const perPersonTax = tax / people;

   return {
      billAmount: Number(base.toFixed(2)),
      tip: Number(tip.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      subtotal: Number(subtotal.toFixed(2)),
      grandTotal: Number(grandTotal.toFixed(2)),
      numPeople: people,
      perPersonTotal: Number(perPersonTotal.toFixed(2)),
      perPersonBase: Number(perPersonBase.toFixed(2)),
      perPersonTip: Number(perPersonTip.toFixed(2)),
      perPersonTax: Number(perPersonTax.toFixed(2)),
   };
}

