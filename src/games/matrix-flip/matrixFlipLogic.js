// Pure logic and solvable puzzle generator for Matrix Flip (Lights Out)

export const createEmptyGrid = (size = 4) => {
   return Array.from({ length: size }, () => Array(size).fill(false));
};

export const toggleCellAndNeighbors = (grid, r, c) => {
   const size = grid.length;
   const next = grid.map((row) => [...row]);

   // Self
   next[r][c] = !next[r][c];
   // Up
   if (r > 0) next[r - 1][c] = !next[r - 1][c];
   // Down
   if (r < size - 1) next[r + 1][c] = !next[r + 1][c];
   // Left
   if (c > 0) next[r][c - 1] = !next[r][c - 1];
   // Right
   if (c < size - 1) next[r][c + 1] = !next[r][c + 1];

   return next;
};

// Generates a guaranteed solvable puzzle by applying random clicks to a solved (all false) grid
export const generateSolvablePuzzle = (size = 4, shuffleMoves = 8) => {
   let grid = createEmptyGrid(size);
   const clicked = new Set();

   for (let i = 0; i < shuffleMoves; i++) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      grid = toggleCellAndNeighbors(grid, r, c);
      const key = `${r}-${c}`;
      if (clicked.has(key)) {
         clicked.delete(key);
      } else {
         clicked.add(key);
      }
   }

   // If by rare chance it ended up all false, flip one cell
   if (grid.every((row) => row.every((val) => !val))) {
      grid = toggleCellAndNeighbors(grid, 0, 0);
   }

   return grid;
};

export const checkAllLightsOut = (grid) => {
   return grid.every((row) => row.every((val) => !val));
};

