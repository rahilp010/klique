/**
 * Attendance Calculation Utilities
 * Calculates current attendance %, allowable bunks, or classes required to hit target threshold (e.g. 75%).
 */

export function calculateAttendance({
   attended = 0,
   total = 0,
   target = 75,
}) {
   const a = Math.max(0, parseInt(attended, 10) || 0);
   const t = Math.max(0, parseInt(total, 10) || 0);
   const req = Math.min(100, Math.max(1, Number(target) || 75));

   if (t === 0) {
      return {
         currentPercentage: 0,
         attended: 0,
         total: 0,
         target: req,
         status: 'neutral', // 'on-track' | 'short' | 'neutral'
         allowableBunks: 0,
         classesNeeded: 0,
         summary: 'Enter held lectures to calculate attendance.',
      };
   }

   const clampedAttended = Math.min(a, t);
   const currentPercentage = Number(((clampedAttended / t) * 100).toFixed(2));

   if (currentPercentage >= req) {
      // Student is at or above target: how many classes can they miss without dropping below target?
      // A / (T + X) >= req / 100  =>  X <= (100 * A - req * T) / req
      const allowableBunks = Math.floor((100 * clampedAttended - req * t) / req);

      return {
         currentPercentage,
         attended: clampedAttended,
         total: t,
         target: req,
         status: 'on-track',
         allowableBunks: Math.max(0, allowableBunks),
         classesNeeded: 0,
         summary:
            allowableBunks > 0
               ? `You can safely miss the next ${allowableBunks} class${
                    allowableBunks === 1 ? '' : 'es'
                 } and still maintain ${req}% attendance.`
               : `You are exactly at ${currentPercentage}%. Do not miss your next class to stay above ${req}%.`,
      };
   } else {
      // Student is below target: how many consecutive classes must they attend?
      // (A + Y) / (T + Y) >= req / 100  =>  Y >= (req * T - 100 * A) / (100 - req)
      if (req >= 100) {
         return {
            currentPercentage,
            attended: clampedAttended,
            total: t,
            target: req,
            status: 'short',
            allowableBunks: 0,
            classesNeeded: Infinity,
            summary: `Since a class was missed, 100% attendance is mathematically impossible this semester.`,
         };
      }

      const classesNeeded = Math.ceil((req * t - 100 * clampedAttended) / (100 - req));

      return {
         currentPercentage,
         attended: clampedAttended,
         total: t,
         target: req,
         status: 'short',
         allowableBunks: 0,
         classesNeeded: Math.max(1, classesNeeded),
         summary: `You need to attend the next ${classesNeeded} consecutive class${
            classesNeeded === 1 ? '' : 'es'
         } to reach ${req}% attendance.`,
      };
   }
}

