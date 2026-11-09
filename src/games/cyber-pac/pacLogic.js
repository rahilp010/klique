// Pure maze grid layout and ghost AI navigation for Cyber Pac

export const COLS = 19;
export const ROWS = 21;
export const TILE_SIZE = 22;
export const CANVAS_WIDTH = COLS * TILE_SIZE; // 418
export const CANVAS_HEIGHT = ROWS * TILE_SIZE; // 462

// 0: Empty, 1: Wall, 2: Pellet, 3: Power Orb, 4: Ghost Gate
export const MAZE_MAP = [
   [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
   [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
   [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
   [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
   [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
   [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
   [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
   [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
   [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
   [1,1,1,1,2,1,0,1,1,4,1,1,0,1,2,1,1,1,1],
   [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0], // Side wrapping tunnel
   [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
   [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
   [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
   [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
   [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
   [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
   [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
   [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
   [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
   [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

export const createInitialPacState = () => {
   // Deep copy maze grid
   const grid = MAZE_MAP.map((row) => [...row]);

   return {
      state: 'ready', // 'ready' | 'playing' | 'gameover' | 'victory'
      score: 0,
      lives: 3,
      frightenedTimer: 0,
      pacman: {
         x: 9 * TILE_SIZE + TILE_SIZE / 2,
         y: 16 * TILE_SIZE + TILE_SIZE / 2,
         dirX: 0,
         dirY: 0,
         nextDirX: 0,
         nextDirY: 0,
         speed: 2.2,
         mouthAngle: 0.2,
         mouthOpening: true,
      },
      ghosts: [
         { id: 'blinky', x: 9 * TILE_SIZE + TILE_SIZE / 2, y: 7 * TILE_SIZE + TILE_SIZE / 2, dirX: 1, dirY: 0, color: '#f43f5e', speed: 1.8 },
         { id: 'pinky', x: 9 * TILE_SIZE + TILE_SIZE / 2, y: 9 * TILE_SIZE + TILE_SIZE / 2, dirX: -1, dirY: 0, color: '#ec4899', speed: 1.8 },
         { id: 'inky', x: 8 * TILE_SIZE + TILE_SIZE / 2, y: 9 * TILE_SIZE + TILE_SIZE / 2, dirX: 0, dirY: -1, color: '#38bdf8', speed: 1.8 },
         { id: 'clyde', x: 10 * TILE_SIZE + TILE_SIZE / 2, y: 9 * TILE_SIZE + TILE_SIZE / 2, dirX: 0, dirY: 1, color: '#fbbf24', speed: 1.8 },
      ],
      grid,
   };
};

export const canMoveTo = (grid, x, y) => {
   const margin = 8;
   const corners = [
      { x: x - margin, y: y - margin },
      { x: x + margin, y: y - margin },
      { x: x - margin, y: y + margin },
      { x: x + margin, y: y + margin },
   ];

   for (const pt of corners) {
      let col = Math.floor(pt.x / TILE_SIZE);
      let row = Math.floor(pt.y / TILE_SIZE);

      // Tunnel wrapping row
      if (row === 10 && (col < 0 || col >= COLS)) continue;

      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return false;
      if (grid[row][col] === 1) return false; // Wall
   }
   return true;
};

