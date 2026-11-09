/**
 * Pure Game Logic for Block Drop (Tetris-style Tetromino Stacker)
 * 10x20 board, 7 tetrominoes, rotation, ghost piece, line clearing, and level acceleration.
 */

export const BOARD_COLS = 10;
export const BOARD_ROWS = 20;

export const TETROMINOES = {
   I: {
      shape: [
         [0, 0, 0, 0],
         [1, 1, 1, 1],
         [0, 0, 0, 0],
         [0, 0, 0, 0],
      ],
      color: '#38bdf8', // Cyan
   },
   O: {
      shape: [
         [1, 1],
         [1, 1],
      ],
      color: '#facc15', // Yellow
   },
   T: {
      shape: [
         [0, 1, 0],
         [1, 1, 1],
         [0, 0, 0],
      ],
      color: '#c084fc', // Purple
   },
   S: {
      shape: [
         [0, 1, 1],
         [1, 1, 0],
         [0, 0, 0],
      ],
      color: '#daf4aa', // Lime
   },
   Z: {
      shape: [
         [1, 1, 0],
         [0, 1, 1],
         [0, 0, 0],
      ],
      color: '#f87171', // Red
   },
   J: {
      shape: [
         [1, 0, 0],
         [1, 1, 1],
         [0, 0, 0],
      ],
      color: '#60a5fa', // Blue
   },
   L: {
      shape: [
         [0, 0, 1],
         [1, 1, 1],
         [0, 0, 0],
      ],
      color: '#fb923c', // Orange
   },
};

export const TETROMINO_KEYS = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export const createEmptyBoard = () => {
   return Array(BOARD_ROWS)
      .fill(null)
      .map(() => Array(BOARD_COLS).fill(0));
};

export const getRandomPiece = () => {
   const key = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)];
   const tetromino = TETROMINOES[key];
   return {
      type: key,
      shape: tetromino.shape,
      color: tetromino.color,
      x: Math.floor((BOARD_COLS - tetromino.shape[0].length) / 2),
      y: 0,
   };
};

export const checkCollision = (board, piece, offsetX = 0, offsetY = 0, newShape = null) => {
   const shape = newShape || piece.shape;
   for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
         if (shape[r][c] !== 0) {
            const newX = piece.x + c + offsetX;
            const newY = piece.y + r + offsetY;

            if (newX < 0 || newX >= BOARD_COLS || newY >= BOARD_ROWS) {
               return true;
            }
            if (newY >= 0 && board[newY][newX] !== 0) {
               return true;
            }
         }
      }
   }
   return false;
};

// Rotate matrix 90 degrees clockwise
export const rotateShape = (shape) => {
   const rows = shape.length;
   const cols = shape[0].length;
   const rotated = [];
   for (let c = 0; c < cols; c++) {
      const newRow = [];
      for (let r = rows - 1; r >= 0; r--) {
         newRow.push(shape[r][c]);
      }
      rotated.push(newRow);
   }
   return rotated;
};

// Lock piece into board
export const lockPiece = (board, piece) => {
   const newBoard = board.map((row) => [...row]);
   for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
         if (piece.shape[r][c] !== 0) {
            const boardY = piece.y + r;
            const boardX = piece.x + c;
            if (boardY >= 0 && boardY < BOARD_ROWS && boardX >= 0 && boardX < BOARD_COLS) {
               newBoard[boardY][boardX] = piece.color;
            }
         }
      }
   }
   return newBoard;
};

// Clear full lines and return { newBoard, linesCleared }
export const clearFullLines = (board) => {
   const remainingRows = board.filter((row) => row.some((cell) => cell === 0));
   const linesCleared = BOARD_ROWS - remainingRows.length;
   const newEmptyRows = Array(linesCleared)
      .fill(null)
      .map(() => Array(BOARD_COLS).fill(0));
   const newBoard = [...newEmptyRows, ...remainingRows];
   return { newBoard, linesCleared };
};

// Calculate Ghost landing position
export const getGhostPosition = (board, piece) => {
   let dropOffset = 0;
   while (!checkCollision(board, piece, 0, dropOffset + 1)) {
      dropOffset++;
   }
   return piece.y + dropOffset;
};

