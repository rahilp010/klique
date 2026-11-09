/**
 * Pure Game Logic for 2048
 * Flexible matrix slide, merge, spawn, win & game-over calculations.
 * Supports 3x3, 4x4, and 5x5 boards.
 */

export const createEmptyBoard = (size = 4) => {
   return Array(size)
      .fill(null)
      .map(() => Array(size).fill(0));
};

export const getEmptyCells = (board) => {
   const size = board.length;
   const empty = [];
   for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
         if (board[r][c] === 0) {
            empty.push({ r, c });
         }
      }
   }
   return empty;
};

export const spawnRandomTile = (board) => {
   const empty = getEmptyCells(board);
   if (empty.length === 0) return board;

   const { r, c } = empty[Math.floor(Math.random() * empty.length)];
   const value = Math.random() < 0.9 ? 2 : 4;

   const newBoard = board.map((row) => [...row]);
   newBoard[r][c] = value;
   return newBoard;
};

export const initializeBoard = (size = 4) => {
   let board = createEmptyBoard(size);
   board = spawnRandomTile(board);
   board = spawnRandomTile(board);
   return board;
};

/**
 * Slide and merge a single 1D row.
 * Strict rule: A tile can merge ONLY ONCE per move!
 */
export const slideRow = (row, size) => {
   const nonZero = row.filter((val) => val !== 0);
   const merged = [];
   let addedScore = 0;
   let skipNext = false;

   for (let i = 0; i < nonZero.length; i++) {
      if (skipNext) {
         skipNext = false;
         continue;
      }
      if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
         const mergedVal = nonZero[i] * 2;
         merged.push(mergedVal);
         addedScore += mergedVal;
         skipNext = true;
      } else {
         merged.push(nonZero[i]);
      }
   }

   while (merged.length < size) {
      merged.push(0);
   }

   return { newRow: merged, score: addedScore };
};

// Rotate board 90 degrees clockwise
export const rotateClockwise = (board) => {
   const size = board.length;
   const newBoard = createEmptyBoard(size);
   for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
         newBoard[c][size - 1 - r] = board[r][c];
      }
   }
   return newBoard;
};

// Move in any direction: 'LEFT', 'RIGHT', 'UP', 'DOWN'
export const moveBoard = (board, direction) => {
   const size = board.length;
   let rotations = 0;
   if (direction === 'UP') rotations = 3;
   else if (direction === 'RIGHT') rotations = 2;
   else if (direction === 'DOWN') rotations = 1;

   let rotated = board;
   for (let i = 0; i < rotations; i++) {
      rotated = rotateClockwise(rotated);
   }

   let totalAddedScore = 0;
   const newRotated = [];
   for (let r = 0; r < size; r++) {
      const { newRow, score } = slideRow(rotated[r], size);
      newRotated.push(newRow);
      totalAddedScore += score;
   }

   // Rotate back
   let result = newRotated;
   const reverseRotations = (4 - rotations) % 4;
   for (let i = 0; i < reverseRotations; i++) {
      result = rotateClockwise(result);
   }

   let changed = false;
   for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
         if (board[r][c] !== result[r][c]) {
            changed = true;
            break;
         }
      }
      if (changed) break;
   }

   return { newBoard: result, changed, addedScore: totalAddedScore };
};

export const hasWon = (board) => {
   const size = board.length;
   for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
         if (board[r][c] >= 2048) return true;
      }
   }
   return false;
};

export const getMaxTile = (board) => {
   let max = 0;
   const size = board.length;
   for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
         if (board[r][c] > max) max = board[r][c];
      }
   }
   return max;
};

export const isGameOver = (board) => {
   const size = board.length;
   if (getEmptyCells(board).length > 0) return false;

   for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
         const val = board[r][c];
         if (c + 1 < size && val === board[r][c + 1]) return false;
         if (r + 1 < size && val === board[r + 1][c]) return false;
      }
   }
   return true;
};
