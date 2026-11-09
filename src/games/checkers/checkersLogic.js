// Pure rules and move generator for 8x8 Checkers / Draughts

export const BOARD_SIZE = 8;
export const EMPTY = 0;
export const P1_PIECE = 1; // Lime
export const P1_KING = 2;
export const P2_PIECE = 3; // Pink (or AI)
export const P2_KING = 4;

export const isP1 = (val) => val === P1_PIECE || val === P1_KING;
export const isP2 = (val) => val === P2_PIECE || val === P2_KING;
export const isKing = (val) => val === P1_KING || val === P2_KING;

export const createInitialCheckersBoard = () => {
   const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY));

   // P2 starts at rows 0, 1, 2 on dark squares (r+c is odd)
   for (let r = 0; r < 3; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
         if ((r + c) % 2 === 1) board[r][c] = P2_PIECE;
      }
   }

   // P1 starts at rows 5, 6, 7 on dark squares
   for (let r = 5; r < 8; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
         if ((r + c) % 2 === 1) board[r][c] = P1_PIECE;
      }
   }

   return board;
};

// Returns valid moves for a piece at (r, c): array of { toR, toC, isJump, jumpOver: [jr, jc] }
export const getValidMovesForPiece = (board, r, c) => {
   const piece = board[r][c];
   if (piece === EMPTY) return [];

   const p1 = isP1(piece);
   const king = isKing(piece);
   const moves = [];

   // Directions: P1 moves up (-1), P2 moves down (+1), Kings move both
   const forwardDirs = p1 ? [-1] : [1];
   const rowDirs = king ? [-1, 1] : forwardDirs;
   const colDirs = [-1, 1];

   // 1. Regular 1-step moves
   for (const dr of rowDirs) {
      for (const dc of colDirs) {
         const nr = r + dr;
         const nc = c + dc;
         if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
            if (board[nr][nc] === EMPTY) {
               moves.push({ toR: nr, toC: nc, isJump: false });
            }
         }
      }
   }

   // 2. Jump moves
   for (const dr of rowDirs) {
      for (const dc of colDirs) {
         const overR = r + dr;
         const overC = c + dc;
         const landR = r + dr * 2;
         const landC = c + dc * 2;

         if (landR >= 0 && landR < BOARD_SIZE && landC >= 0 && landC < BOARD_SIZE) {
            const overPiece = board[overR][overC];
            if (overPiece !== EMPTY && (p1 ? isP2(overPiece) : isP1(overPiece))) {
               if (board[landR][landC] === EMPTY) {
                  moves.push({
                     toR: landR,
                     toC: landC,
                     isJump: true,
                     jumpOver: [overR, overC],
                  });
               }
            }
         }
      }
   }

   return moves;
};

export const getAllMovesForPlayer = (board, isPlayer1) => {
   const allMoves = [];
   for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
         const piece = board[r][c];
         if (isPlayer1 ? isP1(piece) : isP2(piece)) {
            const moves = getValidMovesForPiece(board, r, c);
            if (moves.length > 0) {
               allMoves.push({ fromR: r, fromC: c, moves });
            }
         }
      }
   }
   return allMoves;
};

export const applyMove = (board, fromR, fromC, toR, toC, isJump, jumpOver) => {
   const next = board.map((row) => [...row]);
   let piece = next[fromR][fromC];
   next[fromR][fromC] = EMPTY;

   // Handle jump capture
   if (isJump && jumpOver) {
      next[jumpOver[0]][jumpOver[1]] = EMPTY;
   }

   // Check King crowning
   if (piece === P1_PIECE && toR === 0) {
      piece = P1_KING;
   } else if (piece === P2_PIECE && toR === BOARD_SIZE - 1) {
      piece = P2_KING;
   }

   next[toR][toC] = piece;
   return next;
};

