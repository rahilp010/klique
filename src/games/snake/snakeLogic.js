/**
 * Pure Game Logic for Snake
 * Independent of React UI & rendering.
 */

export const GRID_SIZE = 20; // 20x20 grid

export const DIRECTIONS = {
   UP: { x: 0, y: -1 },
   DOWN: { x: 0, y: 1 },
   LEFT: { x: -1, y: 0 },
   RIGHT: { x: 1, y: 0 },
};

export const INITIAL_SNAKE = [
   { x: 10, y: 10 },
   { x: 10, y: 11 },
   { x: 10, y: 12 },
];

export const INITIAL_DIRECTION = DIRECTIONS.UP;

export const SPEEDS = {
   chill: { initial: 170, min: 100, step: 4, label: 'Chill' },
   normal: { initial: 130, min: 65, step: 5, label: 'Normal' },
   fast: { initial: 90, min: 45, step: 6, label: 'Turbo' },
};

export const isOppositeDirection = (dirA, dirB) => {
   return dirA.x + dirB.x === 0 && dirA.y + dirB.y === 0;
};

export const spawnFood = (snake, exclude = []) => {
   const occupied = new Set([
      ...snake.map((segment) => `${segment.x},${segment.y}`),
      ...exclude.map((item) => `${item.x},${item.y}`),
   ]);
   const emptyCells = [];

   for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
         if (!occupied.has(`${x},${y}`)) {
            emptyCells.push({ x, y });
         }
      }
   }

   if (emptyCells.length === 0) return null;
   const randomIndex = Math.floor(Math.random() * emptyCells.length);
   return emptyCells[randomIndex];
};

export const getNextHead = (currentHead, direction, wallMode = 'classic') => {
   let nx = currentHead.x + direction.x;
   let ny = currentHead.y + direction.y;

   if (wallMode === 'wrap') {
      if (nx < 0) nx = GRID_SIZE - 1;
      else if (nx >= GRID_SIZE) nx = 0;
      if (ny < 0) ny = GRID_SIZE - 1;
      else if (ny >= GRID_SIZE) ny = 0;
   }

   return { x: nx, y: ny };
};

export const checkCollision = (head, snake, wallMode = 'classic') => {
   // Wall collision (in classic mode)
   if (wallMode === 'classic') {
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
         return true;
      }
   }

   // Self collision (excluding tail tip which will move away unless eating)
   for (let i = 0; i < snake.length - 1; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
         return true;
      }
   }
   return false;
};

export const calculateSpeed = (score, difficulty = 'normal') => {
   const config = SPEEDS[difficulty] || SPEEDS.normal;
   const speed = config.initial - Math.floor(score / 3) * config.step;
   return Math.max(speed, config.min);
};
