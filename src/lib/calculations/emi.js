/**
 * EMI (Equated Monthly Installment) Calculation Utilities
 * Handles standard reducing balance EMI calculations and generates full amortization schedules.
 */

export function calculateEMI({
   principal = 0,
   annualRate = 0,
   tenure = 1,
   tenureUnit = 'years', // 'years' | 'months'
}) {
   const p = Number(principal) || 0;
   const rAnnual = Number(annualRate) || 0;
   const totalMonths = tenureUnit === 'years' ? Math.round(tenure * 12) : Math.round(tenure);

   if (p <= 0 || totalMonths <= 0) {
      return {
         emi: 0,
         totalInterest: 0,
         totalPayment: 0,
         principal: p,
         totalMonths: 0,
         schedule: [],
         yearlySummary: [],
      };
   }

   const monthlyRate = rAnnual / 12 / 100;
   let emi = 0;

   if (monthlyRate === 0) {
      emi = p / totalMonths;
   } else {
      const pow = Math.pow(1 + monthlyRate, totalMonths);
      emi = (p * monthlyRate * pow) / (pow - 1);
   }

   const totalPayment = emi * totalMonths;
   const totalInterest = totalPayment - p;

   // Generate Amortization Schedule
   let balance = p;
   const schedule = [];
   const yearlyMap = {};

   for (let month = 1; month <= totalMonths; month++) {
      const interestPaid = balance * monthlyRate;
      let principalPaid = emi - interestPaid;

      if (month === totalMonths || principalPaid > balance) {
         principalPaid = balance;
         balance = 0;
      } else {
         balance -= principalPaid;
      }

      const year = Math.ceil(month / 12);

      schedule.push({
         month,
         year,
         emi: Number(emi.toFixed(2)),
         principalPaid: Number(principalPaid.toFixed(2)),
         interestPaid: Number(interestPaid.toFixed(2)),
         balance: Number(Math.max(0, balance).toFixed(2)),
      });

      if (!yearlyMap[year]) {
         yearlyMap[year] = {
            year,
            principalPaid: 0,
            interestPaid: 0,
            totalPayment: 0,
            closingBalance: balance,
         };
      }
      yearlyMap[year].principalPaid += principalPaid;
      yearlyMap[year].interestPaid += interestPaid;
      yearlyMap[year].totalPayment += emi;
      yearlyMap[year].closingBalance = Number(Math.max(0, balance).toFixed(2));
   }

   const yearlySummary = Object.values(yearlyMap).map((y) => ({
      year: y.year,
      principalPaid: Number(y.principalPaid.toFixed(2)),
      interestPaid: Number(y.interestPaid.toFixed(2)),
      totalPayment: Number(y.totalPayment.toFixed(2)),
      closingBalance: y.closingBalance,
   }));

   return {
      emi: Number(emi.toFixed(2)),
      totalInterest: Number(Math.max(0, totalInterest).toFixed(2)),
      totalPayment: Number(totalPayment.toFixed(2)),
      principal: p,
      totalMonths,
      schedule,
      yearlySummary,
   };
}

