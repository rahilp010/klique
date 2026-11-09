// Pure game logic and state factories for Tower Stacker

export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 560;
export const BLOCK_HEIGHT = 24;
export const INITIAL_BLOCK_WIDTH = 200;

export const PALETTES = [
   '#38bdf8', '#06b6d4', '#2dd4bf', '#34d399', '#4ade80', '#a3e635',
   '#daf4aa', '#facc15', '#fbbf24', '#f97316', '#f43f5e', '#ec4899',
   '#d946ef', '#a855f7', '#818cf8', '#60a5fa'
];

export const getFloorColor = (floor) => {
   return PALETTES[floor % PALETTES.length];
};

export const createInitialTowerState = () => {
   const baseFloor = {
      x: (CANVAS_WIDTH - INITIAL_BLOCK_WIDTH) / 2,
      y: CANVAS_HEIGHT - BLOCK_HEIGHT - 30,
      width: INITIAL_BLOCK_WIDTH,
      height: BLOCK_HEIGHT,
      color: PALETTES[0],
      floor: 1,
   };

   return {
      state: 'ready', // 'ready' | 'playing' | 'gameover'
      score: 0,
      combo: 0,
      tower: [baseFloor],
      activeBlock: {
         x: 0,
         y: baseFloor.y - BLOCK_HEIGHT,
         width: INITIAL_BLOCK_WIDTH,
         height: BLOCK_HEIGHT,
         speed: 3.5,
         dir: 1,
         color: PALETTES[1],
         floor: 2,
      },
      fallingSlices: [],
      particles: [],
      cameraY: 0,
   };
};

