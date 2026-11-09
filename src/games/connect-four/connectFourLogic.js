// Pure logic, minimax AI, and win checkers for Connect Four

export const ROWS = 6;
export const COLS = 7;
export const EMPTY = 0;
export const PLAYER_1 = 1; // Lime
export const PLAYER_2 = 2; // Amber (or AI)

export const createEmptyBoard = () => {
   return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
};

export const getLowestEmptyRow = (board, col) => {
   for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === EMPTY) {
         return r;
      }
   }
   return -1;
};

export const checkWin = (board) => {
   // Horizontal check
   for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
         const p = board[r][c];
         if (p !== EMPTY && p === board[r][c + 1] && p === board[r][c + 2] && p === board[r][c + 3]) {
            return {
               winner: p,
               cells: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]],
            };
         }
      }
   }

   // Vertical check
   for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS; c++) {
         const p = board[r][c];
         if (p !== EMPTY && p === board[r + 1][c] && p === board[r + 2][c] && p === board[r + 3][c]) {
            return {
               winner: p,
               cells: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]],
            };
         }
      }
   }

   // Diagonal (down-right \)
   for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
         const p = board[r][c];
         if (p !== EMPTY && p === board[r + 1][c + 1] && p === board[r + 2][c + 2] && p === board[r + 3][c + 3]) {
            return {
               winner: p,
               cells: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]],
            };
         }
      }
   }

   // Diagonal (up-right /)
   for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
         const p = board[r][c];
         if (p !== EMPTY && p === board[r - 1][c + 1] && p === board[r - 2][c + 2] && p === board[r - 3][c + 3]) {
            return {
               winner: p,
               cells: [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]],
            };
         }
      }
   }

   // Check Draw
   const isFull = board[0].every((cell) => cell !== EMPTY);
   if (isFull) {
      return { winner: 'draw', cells: [] };
   }

   return null;
};

// Tactical AI Move Finder
export const getBestAiMove = (board, difficulty = 'medium') => {
   const validCols = [];
   for (let c = 0; c < COLS; c++) {
      if (board[0][c] === EMPTY) validCols.push(c);
   }
   if (validCols.length === 0) return 0;

   // Easy: random moves with occasional win/block
   if (difficulty === 'easy') {
      // 30% chance to check winning move, else random
      if (Math.random() < 0.5) {
         for (const c of validCols) {
            const r = getLowestEmptyRow(board, c);
            board[r][c] = PLAYER_2;
            const win = checkWin(board);
            board[r][c] = EMPTY;
            if (win && win.winner === PLAYER_2) return c;
         }
      }
      return validCols[Math.floor(Math.random() * validCols.length)];
   }

   // 1. Can AI win immediately?
   for (const c of validCols) {
      const r = getLowestEmptyRow(board, c);
      board[r][c] = PLAYER_2;
      const win = checkWin(board);
      board[r][c] = EMPTY;
      if (win && win.winner === PLAYER_2) return c;
   }

   // 2. Can Player 1 win on their next turn? (Block them!)
   for (const c of validCols) {
      const r = getLowestEmptyRow(board, c);
      board[r][c] = PLAYER_1;
      const win = checkWin(board);
      board[r][c] = EMPTY;
      if (win && win.winner === PLAYER_1) return c;
   }

   // 3. Prefer Center columns (3, then 2 & 4, then 1 & 5)
   const preferredOrder = [3, 2, 4, 1, 5, 0, 6];
   for (const c of preferredOrder) {
      if (validCols.includes(c)) {
         // Avoid giving the opponent an immediate win on top of our move!
         const r = getLowestEmptyRow(board, c);
         if (r > 0) {
            board[r - 1][c] = PLAYER_1;
            const oppWin = checkWin(board);
            board[r - 1][c] = EMPTY;
            if (oppWin && oppWin.winner === PLAYER_1 && difficulty === 'hard') {
               continue; // Don't give them a free win
            }
         }
         return c;
      }
   }

   return validCols[0];
};

