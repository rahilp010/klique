/**
 * Pure Game Logic for Reaction Time
 * Delay calculation, auditory & visual modes, and percentile evaluations.
 */

export const MIN_DELAY_MS = 1500;
export const MAX_DELAY_MS = 4500;

export const getRandomDelay = () => {
   return Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)) + MIN_DELAY_MS;
};

export const evaluateReaction = (ms) => {
   if (ms < 180) {
      return {
         rating: 'Godlike Reflexes',
         percentile: 'Top 1% of humans',
         color: 'text-[#daf4aa]',
      };
   }
   if (ms < 220) {
      return {
         rating: 'Esports Pro Speed',
         percentile: 'Top 5% of humans',
         color: 'text-emerald-400',
      };
   }
   if (ms < 270) {
      return {
         rating: 'Sharp & Above Average',
         percentile: 'Top 25% of humans',
         color: 'text-cyan-400',
      };
   }
   if (ms < 350) {
      return {
         rating: 'Average Human Reflex',
         percentile: '~50th percentile',
         color: 'text-amber-400',
      };
   }
   return {
      rating: 'Sleepy / Delayed Reflex',
      percentile: 'Bottom 25%',
      color: 'text-rose-400',
   };
};
