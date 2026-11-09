/**
 * Pure Game Logic for Color Flood (Flood-It)
 * Matrix generation, recursive breadth-first flood fill, and win check.
 */

export const FLOOD_SIZE = 14;
export const MAX_STEPS = 25;

export const FLOOD_COLORS = [
   '#daf4aa', // 0: Neon Lime
   '#38bdf8', // 1: Sky Blue
   '#c084fc', // 2: Violet
   '#f472b6', // 3: Pink
   '#facc15', // 4: Yellow Amber
   '#34d399', // 5: Emerald
];

export const createRandomFloodGrid = (size = FLOOD_SIZE) => {
   const grid = [];
   for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) {
         row.push(Math.floor(Math.random() * FLOOD_COLORS.length));
      }
      grid.push(row);
   }
   return grid;
};

// Flood fill from (0,0)
export const performFlood = (grid, newColorIndex, size = FLOOD_SIZE) => {
   const oldColor = grid[0][0];
   if (oldColor === newColorIndex) return grid; // No change

   const newGrid = grid.map((r) => [...r]);
   const queue = [[0, 0]];
   const visited = new Set(['0,0']);
   newGrid[0][0] = newColorIndex;

   while (queue.length > 0) {
      const [r, c] = queue.shift();

      const dirs = [
         [r - 1, c],
         [r + 1, c],
         [r, c - 1],
         [r, c + 1],
      ];

      for (const [nr, nc] of dirs) {
         if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            const key = `${nr},${nc}`;
            if (!visited.has(key) && grid[nr][nc] === oldColor) {
               visited.add(key);
               newGrid[nr][nc] = newColorIndex;
               queue.push([nr, nc]);
            }
         }
      }
   }

   return newGrid;
};

export const isFloodComplete = (grid, size = FLOOD_SIZE) => {
   const target = grid[0][0];
   for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
         if (grid[r][c] !== target) return false;
      }
   }
   return true;
};

