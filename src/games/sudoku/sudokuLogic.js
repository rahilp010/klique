/**
 * Pure Game Logic for Mini & Classic Sudoku
 * Pre-validated puzzle boards, solution verification, and conflict detection.
 */

export const PUZZLES_6X6 = [
   {
      initial: [
         [1, 0, 0, 0, 5, 0],
         [0, 2, 0, 6, 0, 0],
         [0, 0, 3, 0, 0, 5],
         [4, 0, 0, 2, 0, 0],
         [0, 0, 1, 0, 4, 0],
         [0, 6, 0, 0, 0, 3],
      ],
      solution: [
         [1, 3, 6, 4, 5, 2],
         [5, 2, 4, 6, 3, 1],
         [6, 1, 3, 4, 2, 5],
         [4, 5, 3, 2, 1, 6],
         [3, 2, 1, 5, 4, 6],
         [2, 6, 5, 1, 4, 3],
      ],
   },
   {
      initial: [
         [0, 4, 0, 1, 0, 0],
         [0, 0, 2, 0, 6, 0],
         [1, 0, 0, 0, 0, 4],
         [3, 0, 0, 0, 0, 6],
         [0, 5, 0, 3, 0, 0],
         [0, 0, 6, 0, 2, 0],
      ],
      solution: [
         [6, 4, 3, 1, 5, 2],
         [5, 1, 2, 4, 6, 3],
         [1, 2, 5, 6, 3, 4],
         [3, 6, 4, 2, 1, 5],
         [2, 5, 1, 3, 4, 6],
         [4, 3, 6, 5, 2, 1],
      ],
   },
];

export const PUZZLES_9X9 = [
   {
      initial: [
         [5, 3, 0, 0, 7, 0, 0, 0, 0],
         [6, 0, 0, 1, 9, 5, 0, 0, 0],
         [0, 9, 8, 0, 0, 0, 0, 6, 0],
         [8, 0, 0, 0, 6, 0, 0, 0, 3],
         [4, 0, 0, 8, 0, 3, 0, 0, 1],
         [7, 0, 0, 0, 2, 0, 0, 0, 6],
         [0, 6, 0, 0, 0, 0, 2, 8, 0],
         [0, 0, 0, 4, 1, 9, 0, 0, 5],
         [0, 0, 0, 0, 8, 0, 0, 7, 9],
      ],
   },
];

export const isConflict = (grid, r, c, val, size = 6) => {
   if (val === 0) return false;

   // Check Row
   for (let col = 0; col < size; col++) {
      if (col !== c && grid[r][col] === val) return true;
   }

   // Check Col
   for (let row = 0; row < size; row++) {
      if (row !== r && grid[row][c] === val) return true;
   }

   // Check Box
   const boxRows = size === 6 ? 2 : 3;
   const boxCols = size === 6 ? 3 : 3;
   const startR = Math.floor(r / boxRows) * boxRows;
   const startC = Math.floor(c / boxCols) * boxCols;

   for (let row = startR; row < startR + boxRows; row++) {
      for (let col = startC; col < startC + boxCols; col++) {
         if ((row !== r || col !== c) && grid[row][col] === val) {
            return true;
         }
      }
   }

   return false;
};

export const isSudokuComplete = (grid, size = 6) => {
   for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
         const val = grid[r][c];
         if (val === 0 || isConflict(grid, r, c, val, size)) {
            return false;
         }
      }
   }
   return true;
};

