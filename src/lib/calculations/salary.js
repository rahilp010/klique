/**
 * Pure calculation utilities for Indian Salary & Take-Home Pay (CTC to In-Hand).
 * Includes New Tax Regime (Budget 2024-25 with ₹75,000 standard deduction & Sec 87A rebate).
 */

export function calculateSalary(inputs = {}) {
   const {
      ctc = 1200000, // Annual CTC in INR
      basicPercent = 50, // % of Gross/CTC
      hraPercent = 50, // % of Basic (metro standard)
      epfMode = 'capped', // 'capped' (max ₹1,800/month) | 'actual' (12% of basic) | 'none'
      professionalTax = 200, // ₹200 per month standard PT
      includeGratuity = false,
      regime = 'new', // 'new' | 'old'
   } = inputs;

   const annualCTC = Math.max(0, Number(ctc) || 0);
   const monthlyCTC = annualCTC / 12;

   // 1. Basic Salary
   const annualBasic = (annualCTC * (Number(basicPercent) || 50)) / 100;
   const monthlyBasic = annualBasic / 12;

   // 2. HRA
   const annualHRA = (annualBasic * (Number(hraPercent) || 50)) / 100;
   const monthlyHRA = annualHRA / 12;

   // 3. EPF Calculation (Employee 12% + Employer 12% if in CTC)
   let monthlyEmployeeEPF = 0;
   let monthlyEmployerEPF = 0;

   if (epfMode === 'capped') {
      monthlyEmployeeEPF = Math.min(1800, monthlyBasic * 0.12);
      monthlyEmployerEPF = Math.min(1800, monthlyBasic * 0.12);
   } else if (epfMode === 'actual') {
      monthlyEmployeeEPF = monthlyBasic * 0.12;
      monthlyEmployerEPF = monthlyBasic * 0.12;
   } else {
      monthlyEmployeeEPF = 0;
      monthlyEmployerEPF = 0;
   }

   const annualEmployeeEPF = monthlyEmployeeEPF * 12;
   const annualEmployerEPF = monthlyEmployerEPF * 12;

   // 4. Gratuity (4.81% of basic, if included in CTC)
   const annualGratuity = includeGratuity ? (annualBasic * 4.81) / 100 : 0;
   const monthlyGratuity = annualGratuity / 12;

   // 5. Special Allowance = CTC - (Basic + HRA + Employer EPF + Gratuity)
   const annualFixedDeductionsFromCTC = annualBasic + annualHRA + annualEmployerEPF + annualGratuity;
   const annualSpecialAllowance = Math.max(0, annualCTC - annualFixedDeductionsFromCTC);
   const monthlySpecialAllowance = annualSpecialAllowance / 12;

   // 6. Gross Salary (what appears on payslip before deductions)
   const annualGross = annualBasic + annualHRA + annualSpecialAllowance;
   const monthlyGross = annualGross / 12;

   // 7. Professional Tax
   const monthlyPT = Math.max(0, Number(professionalTax) || 0);
   const annualPT = monthlyPT * 12;

   // 8. Income Tax Computation (New Tax Regime FY 2024-25 / AY 2025-26)
   // Standard Deduction in New Regime = ₹75,000 (Budget 2024)
   const standardDeduction = 75000;
   const netTaxableIncome = Math.max(0, annualGross - standardDeduction - annualPT);

   let annualTax = 0;

   if (regime === 'new') {
      // Slabs:
      // 0 - 3L: 0%
      // 3L - 7L: 5%
      // 7L - 10L: 10%
      // 10L - 12L: 15%
      // 12L - 15L: 20%
      // > 15L: 30%
      if (netTaxableIncome <= 700000) {
         // Section 87A rebate makes tax zero up to ₹7,00,000
         annualTax = 0;
      } else {
         let tax = 0;
         if (netTaxableIncome > 300000) {
            tax += Math.min(400000, netTaxableIncome - 300000) * 0.05;
         }
         if (netTaxableIncome > 700000) {
            tax += Math.min(300000, netTaxableIncome - 700000) * 0.10;
         }
         if (netTaxableIncome > 1000000) {
            tax += Math.min(200000, netTaxableIncome - 1000000) * 0.15;
         }
         if (netTaxableIncome > 1200000) {
            tax += Math.min(300000, netTaxableIncome - 1200000) * 0.20;
         }
         if (netTaxableIncome > 1500000) {
            tax += (netTaxableIncome - 1500000) * 0.30;
         }

         // 4% Health & Education Cess
         annualTax = tax * 1.04;
      }
   } else {
      // Old Regime approximate calculation with ₹50,000 standard deduction
      const oldTaxable = Math.max(0, annualGross - 50000 - annualPT);
      if (oldTaxable <= 500000) {
         annualTax = 0;
      } else {
         let tax = 0;
         if (oldTaxable > 250000) {
            tax += Math.min(250000, oldTaxable - 250000) * 0.05;
         }
         if (oldTaxable > 500000) {
            tax += Math.min(500000, oldTaxable - 500000) * 0.20;
         }
         if (oldTaxable > 1000000) {
            tax += (oldTaxable - 1000000) * 0.30;
         }
         annualTax = tax * 1.04;
      }
   }

   const monthlyTax = annualTax / 12;

   // 9. Total Monthly Deductions
   const monthlyTotalDeductions = monthlyEmployeeEPF + monthlyPT + monthlyTax;
   const annualTotalDeductions = annualEmployeeEPF + annualPT + annualTax;

   // 10. Net Take-Home (In-Hand) Pay
   const monthlyInHand = Math.max(0, monthlyGross - monthlyTotalDeductions);
   const annualInHand = Math.max(0, annualGross - annualTotalDeductions);

   return {
      annualCTC,
      monthlyCTC: Number(monthlyCTC.toFixed(2)),
      annualGross: Number(annualGross.toFixed(2)),
      monthlyGross: Number(monthlyGross.toFixed(2)),
      annualBasic: Number(annualBasic.toFixed(2)),
      monthlyBasic: Number(monthlyBasic.toFixed(2)),
      annualHRA: Number(annualHRA.toFixed(2)),
      monthlyHRA: Number(monthlyHRA.toFixed(2)),
      annualSpecialAllowance: Number(annualSpecialAllowance.toFixed(2)),
      monthlySpecialAllowance: Number(monthlySpecialAllowance.toFixed(2)),
      monthlyEmployeeEPF: Number(monthlyEmployeeEPF.toFixed(2)),
      annualEmployeeEPF: Number(annualEmployeeEPF.toFixed(2)),
      monthlyEmployerEPF: Number(monthlyEmployerEPF.toFixed(2)),
      annualEmployerEPF: Number(annualEmployerEPF.toFixed(2)),
      monthlyGratuity: Number(monthlyGratuity.toFixed(2)),
      annualGratuity: Number(annualGratuity.toFixed(2)),
      monthlyPT: Number(monthlyPT.toFixed(2)),
      annualPT: Number(annualPT.toFixed(2)),
      annualTax: Number(annualTax.toFixed(2)),
      monthlyTax: Number(monthlyTax.toFixed(2)),
      monthlyTotalDeductions: Number(monthlyTotalDeductions.toFixed(2)),
      annualTotalDeductions: Number(annualTotalDeductions.toFixed(2)),
      monthlyInHand: Number(monthlyInHand.toFixed(2)),
      annualInHand: Number(annualInHand.toFixed(2)),
      inHandPercentage: annualCTC > 0 ? Number(((annualInHand / annualCTC) * 100).toFixed(1)) : 0,
   };
}
