/**
 * Pure calculation utilities for Regex Tester & Debugger.
 * Safe evaluation, group extraction, flag handling, and substitution.
 */

export function testRegex(pattern = '', flags = 'g', testString = '') {
   if (!pattern) {
      return {
         isValid: true,
         matches: [],
         matchCount: 0,
         error: null,
      };
   }

   try {
      // Validate flags
      const cleanFlags = flags.replace(/[^gimsuy]/g, '');
      // Ensure 'd' flag isn't crashing older engines, stick to standard gimsuy
      const regex = new RegExp(pattern, cleanFlags);

      const matches = [];
      let match;
      const startTime = performance.now();
      const MAX_EXECUTION_TIME_MS = 250; // ReDoS safeguard

      if (cleanFlags.includes('g')) {
         let iteration = 0;
         while ((match = regex.exec(testString)) !== null && iteration < 1000) {
            iteration++;
            if (performance.now() - startTime > MAX_EXECUTION_TIME_MS) {
               return {
                  isValid: false,
                  matches: [],
                  matchCount: 0,
                  error: 'Execution timed out (possible catastrophic backtracking / ReDoS).',
               };
            }

            matches.push({
               index: match.index,
               length: match[0].length,
               text: match[0],
               groups: match.slice(1),
               namedGroups: match.groups ? { ...match.groups } : null,
            });

            // Prevent infinite loop on zero-length matches (e.g. /^/g)
            if (match[0].length === 0) {
               regex.lastIndex++;
            }
         }
      } else {
         match = regex.exec(testString);
         if (match) {
            matches.push({
               index: match.index,
               length: match[0].length,
               text: match[0],
               groups: match.slice(1),
               namedGroups: match.groups ? { ...match.groups } : null,
            });
         }
      }

      return {
         isValid: true,
         matches,
         matchCount: matches.length,
         error: null,
      };
   } catch (err) {
      return {
         isValid: false,
         matches: [],
         matchCount: 0,
         error: err.message || 'Invalid regular expression syntax',
      };
   }
}

export function replaceRegex(pattern = '', flags = 'g', testString = '', replacement = '') {
   if (!pattern) return testString;
   try {
      const cleanFlags = flags.replace(/[^gimsuy]/g, '');
      const regex = new RegExp(pattern, cleanFlags);
      return testString.replace(regex, replacement);
   } catch {
      return testString;
   }
}
