/**
 * GPA / CGPA Calculation Utilities
 * Handles course-level SGPA, multi-semester CGPA, and configurable percentage conversions.
 */

export const DEFAULT_GRADE_SCALE = [
   { label: 'O (Outstanding)', points: 10 },
   { label: 'A+ (Excellent)', points: 9 },
   { label: 'A (Very Good)', points: 8 },
   { label: 'B+ (Good)', points: 7 },
   { label: 'B (Above Average)', points: 6 },
   { label: 'C (Average)', points: 5 },
   { label: 'P (Pass)', points: 4 },
   { label: 'F (Fail)', points: 0 },
];

export function calculateSGPA(courses = []) {
   if (!courses || courses.length === 0) {
      return { sgpa: 0, totalCredits: 0, totalPoints: 0 };
   }

   let totalCredits = 0;
   let totalWeightedPoints = 0;

   courses.forEach((c) => {
      const credits = Number(c.credits) || 0;
      const points = Number(c.gradePoints ?? c.points) || 0;
      if (credits > 0) {
         totalCredits += credits;
         totalWeightedPoints += credits * points;
      }
   });

   const sgpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;

   return {
      sgpa: Number(sgpa.toFixed(2)),
      totalCredits,
      totalPoints: Number(totalWeightedPoints.toFixed(2)),
   };
}

export function calculateCGPA(semesters = []) {
   if (!semesters || semesters.length === 0) {
      return { cgpa: 0, totalCredits: 0 };
   }

   let totalCredits = 0;
   let totalWeightedPoints = 0;

   semesters.forEach((s) => {
      const credits = Number(s.credits) || 0;
      const gpa = Number(s.gpa ?? s.sgpa) || 0;
      if (credits > 0) {
         totalCredits += credits;
         totalWeightedPoints += credits * gpa;
      }
   });

   const cgpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;

   return {
      cgpa: Number(cgpa.toFixed(2)),
      totalCredits,
   };
}

export function cgpaToPercentage(cgpa = 0, multiplier = 9.5) {
   const val = Number(cgpa) || 0;
   const mult = Number(multiplier) || 9.5;
   return Number((val * mult).toFixed(2));
}

