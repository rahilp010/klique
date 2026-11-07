/**
 * Subscription Tracker Calculations & Analytics
 * 100% Client-side recurring expenses analytics.
 */

export const BILLING_CYCLES = {
   MONTHLY: 'monthly',
   YEARLY: 'yearly',
   QUARTERLY: 'quarterly',
   WEEKLY: 'weekly',
};

export const SUBSCRIPTION_CATEGORIES = [
   'Entertainment & Streaming',
   'Software & SaaS',
   'Cloud & Hosting',
   'Productivity & AI',
   'Health & Fitness',
   'Utilities & Internet',
   'Gaming',
   'Other',
];

export const POPULAR_TEMPLATES = [
   {
      name: 'Netflix',
      category: 'Entertainment & Streaming',
      cost: 15.49,
      cycle: 'monthly',
      currency: '$',
      color: '#e50914',
   },
   {
      name: 'Spotify Premium',
      category: 'Entertainment & Streaming',
      cost: 10.99,
      cycle: 'monthly',
      currency: '$',
      color: '#1db954',
   },
   {
      name: 'ChatGPT Plus',
      category: 'Productivity & AI',
      cost: 20.0,
      cycle: 'monthly',
      currency: '$',
      color: '#10a37f',
   },
   {
      name: 'GitHub Copilot',
      category: 'Software & SaaS',
      cost: 10.0,
      cycle: 'monthly',
      currency: '$',
      color: '#ffffff',
   },
   {
      name: 'Amazon Prime',
      category: 'Entertainment & Streaming',
      cost: 139.0,
      cycle: 'yearly',
      currency: '$',
      color: '#ff9900',
   },
   {
      name: 'Google One (100GB)',
      category: 'Cloud & Hosting',
      cost: 1.99,
      cycle: 'monthly',
      currency: '$',
      color: '#4285f4',
   },
];

/**
 * Normalizes any billing cycle cost to its monthly equivalent
 */
export const toMonthlyCost = (cost, cycle) => {
   const val = parseFloat(cost) || 0;
   switch (cycle) {
      case 'yearly':
         return val / 12;
      case 'quarterly':
         return val / 3;
      case 'weekly':
         return (val * 52) / 12;
      case 'monthly':
      default:
         return val;
   }
};

/**
 * Normalizes any billing cycle cost to its yearly equivalent
 */
export const toYearlyCost = (cost, cycle) => {
   return toMonthlyCost(cost, cycle) * 12;
};

/**
 * Calculate totals, category distributions, and upcoming renewals from a list of subscriptions
 */
export const analyzeSubscriptions = (subscriptions = []) => {
   const active = subscriptions.filter((s) => s.status !== 'cancelled');

   let totalMonthly = 0;
   const categoryTotals = {};
   const now = new Date();
   const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
   const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

   const upcoming7Days = [];
   const upcoming30Days = [];
   let highestExpense = null;

   active.forEach((sub) => {
      const monthly = toMonthlyCost(sub.cost, sub.cycle);
      totalMonthly += monthly;

      // Category breakdown
      const cat = sub.category || 'Other';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + monthly;

      // Highest cost item
      if (!highestExpense || monthly > toMonthlyCost(highestExpense.cost, highestExpense.cycle)) {
         highestExpense = sub;
      }

      // Renewal check
      if (sub.renewalDate) {
         const renewal = new Date(sub.renewalDate);
         if (!Number.isNaN(renewal.getTime())) {
            if (renewal >= now && renewal <= sevenDaysFromNow) {
               upcoming7Days.push(sub);
            }
            if (renewal >= now && renewal <= thirtyDaysFromNow) {
               upcoming30Days.push(sub);
            }
         }
      }
   });

   const totalYearly = totalMonthly * 12;

   // Category percentages
   const categories = Object.keys(categoryTotals).map((cat) => ({
      name: cat,
      amount: categoryTotals[cat],
      percentage: totalMonthly > 0 ? (categoryTotals[cat] / totalMonthly) * 100 : 0,
   })).sort((a, b) => b.amount - a.amount);

   return {
      activeCount: active.length,
      pausedCount: subscriptions.filter((s) => s.status === 'paused').length,
      totalMonthly: parseFloat(totalMonthly.toFixed(2)),
      totalYearly: parseFloat(totalYearly.toFixed(2)),
      categories,
      upcoming7Days,
      upcoming30Days,
      highestExpense,
   };
};

/**
 * Format currency amount with symbol
 */
export const formatCurrency = (amount, symbol = '$') => {
   const val = parseFloat(amount) || 0;
   return `${symbol}${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

