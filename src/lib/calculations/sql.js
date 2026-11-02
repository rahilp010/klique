/**
 * Client-side SQL Formatter & Beautifier.
 * Clean indentation, keyword capitalization, and minification.
 */

const SQL_KEYWORDS = [
   'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE', 'IS', 'NULL',
   'ORDER BY', 'GROUP BY', 'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
   'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'ON', 'AS', 'UNION', 'UNION ALL',
   'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE',
   'ALTER TABLE', 'ADD CONSTRAINT', 'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'DEFAULT',
   'CASCADE', 'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'EXISTS', 'COUNT', 'SUM',
   'AVG', 'MIN', 'MAX', 'COALESCE', 'WITH'
];

export function formatSQL(sql = '', options = {}) {
   const {
      indentSpaces = 2,
      uppercaseKeywords = true,
   } = options;

   const text = String(sql || '').trim();
   if (!text) return { formatted: '', error: null };

   try {
      const indent = ' '.repeat(indentSpaces);
      // Tokenize by string literals, comments, or standard words
      let formatted = text;

      // 1. Keyword capitalization
      if (uppercaseKeywords) {
         // Sort keywords by length descending so multi-word keywords match first
         const sorted = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length);
         sorted.forEach((kw) => {
            const regex = new RegExp(`\\b${kw}\\b`, 'gi');
            formatted = formatted.replace(regex, kw);
         });
      }

      // 2. Structural line breaks on primary clauses
      const majorClauses = [
         'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'LEFT JOIN', 'RIGHT JOIN',
         'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN',
         'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION',
         'UNION ALL', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'
      ];

      majorClauses.forEach((kw) => {
         const regex = new RegExp(`\\s*\\b(${kw})\\b\\s*`, 'g');
         formatted = formatted.replace(regex, `\n$1 `);
      });

      // 3. Format lines and indent
      const lines = formatted.split('\n').map((l) => l.trim()).filter(Boolean);
      const formattedLines = [];

      for (let i = 0; i < lines.length; i++) {
         let line = lines[i];

         // Check if line starts with major clause
         const startsWithMajor = majorClauses.some((kw) => line.startsWith(kw));

         if (startsWithMajor) {
            formattedLines.push(line);
         } else {
            formattedLines.push(indent + line);
         }
      }

      return {
         formatted: formattedLines.join('\n').trim(),
         error: null,
      };
   } catch (err) {
      return {
         formatted: text,
         error: err.message,
      };
   }
}

export function minifySQL(sql = '') {
   const text = String(sql || '').trim();
   if (!text) return '';
   return text
      .replace(/--.*$/gm, '') // single line comments
      .replace(/\/\*[\s\S]*?\*\//g, '') // multi line comments
      .replace(/\s+/g, ' ') // collapse whitespaces
      .replace(/\s*([,()=<>])\s*/g, '$1') // remove spaces around punctuation
      .trim();
}
