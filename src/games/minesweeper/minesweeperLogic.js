/**
 * Pure Game Logic for Minesweeper
 * Grid generation, safe first-click, cascade expansion, and win detection.
 */

export const DIFFICULTIES = {
   easy: { rows: 9, cols: 9, mines: 10, label: 'Easy (9×9)' },
   medium: { rows: 12, cols: 12, mines: 20, label: 'Medium (12×12)' },
   hard: { rows: 16, cols: 16, mines: 40, label: 'Hard (16×16)' },
};

export const createEmptyGrid = (rows, cols) => {
   const grid = [];
   for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
         row.push({
            r,
            c,
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborCount: 0,
         });
      }
      grid.push(row);
   }
   return grid;
};

// Populate mines with first-click safety guarantee
export const populateMines = (grid, rows, cols, totalMines, safeR, safeC) => {
   const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
   let placed = 0;

   while (placed < totalMines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      // Safe zone: safeR, safeC and its immediate neighbors are protected
      const isSafe = Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1;

      if (!newGrid[r][c].isMine && !isSafe) {
         newGrid[r][c].isMine = true;
         placed++;
      }
   }

   // Calculate neighbor mine numbers
   for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
         if (!newGrid[r][c].isMine) {
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
               for (let dc = -1; dc <= 1; dc++) {
                  const nr = r + dr;
                  const nc = c + dc;
                  if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                     if (newGrid[nr][nc].isMine) count++;
                  }
               }
            }
            newGrid[r][c].neighborCount = count;
         }
      }
   }

   return newGrid;
};

// Cascade reveal zeroes
export const revealCell = (grid, r, c, rows, cols) => {
   const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));
   const target = newGrid[r][c];

   if (target.isRevealed || target.isFlagged) {
      return { grid: newGrid, hitMine: false };
   }

   if (target.isMine) {
      target.isRevealed = true;
      return { grid: newGrid, hitMine: true };
   }

   // Breadth-first flood fill
   const queue = [[r, c]];
   target.isRevealed = true;

   while (queue.length > 0) {
      const [cr, cc] = queue.shift();
      const current = newGrid[cr][cc];

      if (current.neighborCount === 0) {
         for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
               const nr = cr + dr;
               const nc = cc + dc;
               if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                  const neighbor = newGrid[nr][nc];
                  if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
                     neighbor.isRevealed = true;
                     if (neighbor.neighborCount === 0) {
                        queue.push([nr, nc]);
                     }
                  }
               }
            }
         }
      }
   }

   return { grid: newGrid, hitMine: false };
};

export const checkMinesweeperWin = (grid, rows, cols, totalMines) => {
   let revealedCount = 0;
   for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
         if (grid[r][c].isRevealed && !grid[r][c].isMine) {
            revealedCount++;
         }
      }
   }
   return revealedCount === rows * cols - totalMines;
};

