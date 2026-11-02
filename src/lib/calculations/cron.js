/**
 * Pure calculation and parsing utilities for Cron Expression Generator & Explainer.
 * Supports standard 5-part POSIX cron: [minute] [hour] [day-of-month] [month] [day-of-week]
 */

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
   'January', 'February', 'March', 'April', 'May', 'June',
   'July', 'August', 'September', 'October', 'November', 'December'
];

export function explainCron(cronExpression = '* * * * *') {
   const parts = cronExpression.trim().split(/\s+/);
   if (parts.length !== 5) {
      return {
         isValid: false,
         description: 'Invalid cron format. A standard cron expression must contain exactly 5 space-separated parts.',
         parts: null,
      };
   }

   const [min, hour, dom, mon, dow] = parts;

   let desc = '';

   // Simple common expressions
   if (cronExpression === '* * * * *') {
      return { isValid: true, description: 'Every minute', parts: { min, hour, dom, mon, dow } };
   }
   if (cronExpression === '0 * * * *') {
      return { isValid: true, description: 'Every hour, on the hour', parts: { min, hour, dom, mon, dow } };
   }
   if (cronExpression === '0 0 * * *') {
      return { isValid: true, description: 'Every day at midnight (00:00)', parts: { min, hour, dom, mon, dow } };
   }
   if (cronExpression === '0 0 * * 0') {
      return { isValid: true, description: 'Every Sunday at midnight', parts: { min, hour, dom, mon, dow } };
   }
   if (cronExpression === '0 0 1 * *') {
      return { isValid: true, description: 'At midnight on the 1st day of every month', parts: { min, hour, dom, mon, dow } };
   }

   // Dynamic builder description
   const timeDesc = formatTime(min, hour);
   const dateDesc = formatDate(dom, mon, dow);

   desc = `${timeDesc} ${dateDesc}`.trim();

   return {
      isValid: true,
      description: desc.charAt(0).toUpperCase() + desc.slice(1),
      parts: { min, hour, dom, mon, dow },
   };
}

function formatTime(min, hour) {
   if (min === '*' && hour === '*') return 'every minute';
   if (min.startsWith('*/') && hour === '*') {
      const step = min.replace('*/', '');
      return `every ${step} minutes`;
   }
   if (hour === '*' && min !== '*') {
      return `at minute ${min} of every hour`;
   }
   if (hour.startsWith('*/')) {
      const step = hour.replace('*/', '');
      return `every ${step} hours at minute ${min === '*' ? '0' : min}`;
   }
   if (hour !== '*' && min !== '*') {
      const h = Number(hour);
      const m = Number(min);
      if (!isNaN(h) && !isNaN(m)) {
         const ampm = h >= 12 ? 'PM' : 'AM';
         const h12 = h % 12 === 0 ? 12 : h % 12;
         const mStr = m < 10 ? `0${m}` : `${m}`;
         return `at ${h12}:${mStr} ${ampm}`;
      }
      return `at ${hour}:${min}`;
   }
   return `at ${hour}:${min}`;
}

function formatDate(dom, mon, dow) {
   let parts = [];

   if (dom !== '*' && dom !== '?') {
      parts.push(`on day ${dom} of the month`);
   }
   if (mon !== '*') {
      const mNum = Number(mon);
      if (!isNaN(mNum) && mNum >= 1 && mNum <= 12) {
         parts.push(`in ${MONTHS[mNum - 1]}`);
      } else {
         parts.push(`in month ${mon}`);
      }
   }
   if (dow !== '*' && dow !== '?') {
      if (dow === '1-5') {
         parts.push('Monday through Friday');
      } else if (dow === '0,6' || dow === '6,0') {
         parts.push('on Saturday and Sunday');
      } else {
         const dNum = Number(dow);
         if (!isNaN(dNum) && dNum >= 0 && dNum <= 6) {
            parts.push(`on ${DAYS[dNum]}`);
         } else {
            parts.push(`on day-of-week ${dow}`);
         }
      }
   }

   if (parts.length === 0) return 'every day';
   return parts.join(', ');
}

/**
 * Approximate next 5 execution dates
 */
export function getNextRuns(cronExpression = '0 0 * * *', count = 5) {
   const runs = [];
   const parts = cronExpression.trim().split(/\s+/);
   if (parts.length !== 5) return [];

   const now = new Date();
   let current = new Date(now.getTime() + 60000); // start 1 min in future

   // Simple forward scanner (capped at 50,000 minutes ~ 34 days)
   let iterations = 0;
   while (runs.length < count && iterations < 50000) {
      iterations++;
      const min = current.getMinutes();
      const hour = current.getHours();
      const dom = current.getDate();
      const mon = current.getMonth() + 1;
      const dow = current.getDay();

      if (
         matchCronPart(parts[0], min) &&
         matchCronPart(parts[1], hour) &&
         matchCronPart(parts[2], dom) &&
         matchCronPart(parts[3], mon) &&
         matchCronPart(parts[4], dow)
      ) {
         runs.push(new Date(current));
         // jump to next minute
         current = new Date(current.getTime() + 60000);
      } else {
         // step forward
         current = new Date(current.getTime() + 60000);
      }
   }

   return runs;
}

function matchCronPart(pattern, val) {
   if (pattern === '*' || pattern === '?') return true;
   if (pattern.startsWith('*/')) {
      const step = Number(pattern.replace('*/', ''));
      return val % step === 0;
   }
   if (pattern.includes(',')) {
      const list = pattern.split(',').map(Number);
      return list.includes(val);
   }
   if (pattern.includes('-')) {
      const [start, end] = pattern.split('-').map(Number);
      return val >= start && val <= end;
   }
   return Number(pattern) === val;
}

