/**
 * PDF & Text Comparison Engine
 * Line-by-line and token-level diff calculation with similarity scoring.
 */

/**
 * Computes line-by-line diff between two text documents
 */
export const computeTextDiff = (originalText = '', modifiedText = '') => {
   const originalLines = originalText.split('\n');
   const modifiedLines = modifiedText.split('\n');

   let additionsCount = 0;
   let deletionsCount = 0;
   let unchangedCount = 0;

   // Simple Myers-style LCS matrix approach for diffing lines
   const m = originalLines.length;
   const n = modifiedLines.length;

   // Matrix of LCS lengths
   const lcs = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

   for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
         if (originalLines[i] === modifiedLines[j]) {
            lcs[i + 1][j + 1] = lcs[i][j] + 1;
         } else {
            lcs[i + 1][j + 1] = Math.max(lcs[i + 1][j], lcs[i][j + 1]);
         }
      }
   }

   // Backtrack to find diff
   let i = m;
   let j = n;
   const tempResult = [];

   while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && originalLines[i - 1] === modifiedLines[j - 1]) {
         tempResult.push({
            type: 'unchanged',
            text: originalLines[i - 1],
            origLineNumber: i,
            modLineNumber: j,
         });
         unchangedCount++;
         i--;
         j--;
      } else if (j > 0 && (i === 0 || lcs[i][j - 1] >= lcs[i - 1][j])) {
         tempResult.push({
            type: 'added',
            text: modifiedLines[j - 1],
            modLineNumber: j,
         });
         additionsCount++;
         j--;
      } else if (i > 0 && (j === 0 || lcs[i][j - 1] < lcs[i - 1][j])) {
         tempResult.push({
            type: 'removed',
            text: originalLines[i - 1],
            origLineNumber: i,
         });
         deletionsCount++;
         i--;
      }
   }

   tempResult.reverse();

   // Compute Word Similarity Percentage
   const wordsA = originalText.trim() ? originalText.trim().split(/\s+/).length : 0;
   const wordsB = modifiedText.trim() ? modifiedText.trim().split(/\s+/).length : 0;
   const totalWords = wordsA + wordsB;

   let similarityScore = 100;
   if (totalWords > 0) {
      const matchWords = unchangedCount;
      const ratio = (2 * matchWords) / (originalLines.length + modifiedLines.length || 1);
      similarityScore = Math.max(0, Math.min(100, Math.round(ratio * 100)));
   }

   return {
      diffLines: tempResult,
      additionsCount,
      deletionsCount,
      unchangedCount,
      wordsDocA: wordsA,
      wordsDocB: wordsB,
      similarityScore,
   };
};
