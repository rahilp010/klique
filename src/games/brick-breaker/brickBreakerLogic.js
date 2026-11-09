/**
 * Pure Game Logic for Brick Breaker
 * Brick matrices, angle physics, powerup drops, and collision mathematics.
 */

export const CANVAS_WIDTH = 420;
export const CANVAS_HEIGHT = 480;

export const PADDLE_WIDTH = 76;
export const PADDLE_HEIGHT = 10;
export const BALL_RADIUS = 5;

export const BRICK_ROWS = 5;
export const BRICK_COLS = 8;
export const BRICK_PADDING = 5;
export const BRICK_OFFSET_TOP = 40;
export const BRICK_OFFSET_LEFT = 16;

const ROW_COLORS = [
   '#daf4aa', // Row 0 (Lime)
   '#38bdf8', // Row 1 (Sky)
   '#a78bfa', // Row 2 (Purple)
   '#f472b6', // Row 3 (Pink)
   '#fbbf24', // Row 4 (Amber)
];

export const createBricks = () => {
   const bricks = [];
   const brickWidth =
      (CANVAS_WIDTH - BRICK_OFFSET_LEFT * 2 - (BRICK_COLS - 1) * BRICK_PADDING) /
      BRICK_COLS;
   const brickHeight = 16;

   for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
         const x = c * (brickWidth + BRICK_PADDING) + BRICK_OFFSET_LEFT;
         const y = r * (brickHeight + BRICK_PADDING) + BRICK_OFFSET_TOP;
         bricks.push({
            x,
            y,
            width: brickWidth,
            height: brickHeight,
            status: 1, // 1 = intact, 0 = broken
            color: ROW_COLORS[r],
            points: (BRICK_ROWS - r) * 10,
         });
      }
   }
   return bricks;
};

