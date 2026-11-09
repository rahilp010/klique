/**
 * Pure Game Logic for Tic Tac Toe
 * Board state, win calculation, draw check, and multi-tier AI solver (Easy, Medium, Master Minimax).
 */

export const WINNING_COMBOS = [
   [0, 1, 2], // Row 1
   [3, 4, 5], // Row 2
   [6, 7, 8], // Row 3
   [0, 3, 6], // Col 1
   [1, 4, 7], // Col 2
   [2, 5, 8], // Col 3
   [0, 4, 8], // Diag 1
   [2, 4, 6], // Diag 2
];

export const createEmptyBoard = () => Array(9).fill(null);

export const checkWinner = (board) => {
   for (let i = 0; i < WINNING_COMBOS.length; i++) {
      const [a, b, c] = WINNING_COMBOS[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
         return {
            winner: board[a],
            line: [a, b, c],
         };
      }
   }
   return null;
};

export const isBoardFull = (board) => {
   return board.every((cell) => cell !== null);
};

export const getAvailableMoves = (board) => {
   const moves = [];
   for (let i = 0; i < board.length; i++) {
      if (board[i] === null) moves.push(i);
   }
   return moves;
};

// Easy AI: 70% random, 30% tactical
export const getEasyAiMove = (board) => {
   const available = getAvailableMoves(board);
   if (available.length === 0) return null;
   return available[Math.floor(Math.random() * available.length)];
};

// Medium AI: Tactical blocking & winning
export const getMediumAiMove = (board, aiMark = 'O', humanMark = 'X') => {
   const available = getAvailableMoves(board);
   if (available.length === 0) return null;

   // 1. Win if possible
   for (const move of available) {
      const test = [...board];
      test[move] = aiMark;
      if (checkWinner(test)?.winner === aiMark) return move;
   }

   // 2. Block human win
   for (const move of available) {
      const test = [...board];
      test[move] = humanMark;
      if (checkWinner(test)?.winner === humanMark) return move;
   }

   // 3. Center
   if (board[4] === null) return 4;

   // 4. Random available
   return available[Math.floor(Math.random() * available.length)];
};

// Master AI: Full Minimax Algorithm
const minimax = (board, depth, isMaximizing, aiMark, humanMark) => {
   const winResult = checkWinner(board);
   if (winResult?.winner === aiMark) return 10 - depth;
   if (winResult?.winner === humanMark) return depth - 10;
   if (isBoardFull(board)) return 0;

   const available = getAvailableMoves(board);

   if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of available) {
         board[move] = aiMark;
         const evaluation = minimax(board, depth + 1, false, aiMark, humanMark);
         board[move] = null;
         maxEval = Math.max(maxEval, evaluation);
      }
      return maxEval;
   } else {
      let minEval = Infinity;
      for (const move of available) {
         board[move] = humanMark;
         const evaluation = minimax(board, depth + 1, true, aiMark, humanMark);
         board[move] = null;
         minEval = Math.min(minEval, evaluation);
      }
      return minEval;
   }
};

export const getMasterAiMove = (board, aiMark = 'O', humanMark = 'X') => {
   const available = getAvailableMoves(board);
   if (available.length === 0) return null;

   // Center optimization for faster first move
   if (board[4] === null && Math.random() < 0.8) return 4;

   let bestScore = -Infinity;
   let bestMove = available[0];

   for (const move of available) {
      board[move] = aiMark;
      const score = minimax(board, 0, false, aiMark, humanMark);
      board[move] = null;

      if (score > bestScore) {
         bestScore = score;
         bestMove = move;
      }
   }

   return bestMove;
};

export const getAiMoveByDifficulty = (board, difficulty = 'medium', aiMark = 'O', humanMark = 'X') => {
   if (difficulty === 'easy') return getEasyAiMove(board);
   if (difficulty === 'master') return getMasterAiMove(board, aiMark, humanMark);
   return getMediumAiMove(board, aiMark, humanMark);
};
