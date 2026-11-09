// Pure procedural terrain generation and collision physics for Neon Hopper

export const CANVAS_WIDTH = 440;
export const CANVAS_HEIGHT = 560;
export const ROW_HEIGHT = 40;
export const TOTAL_VISIBLE_ROWS = 14;

export const ROW_TYPES = {
   GRASS: 'grass',
   ROAD: 'road',
   RIVER: 'river',
};

export const createRow = (rowIndex) => {
   if (rowIndex === 0 || rowIndex === 1) {
      return { index: rowIndex, type: ROW_TYPES.GRASS, items: [] };
   }

   // Pattern alternating roads and rivers
   const cycle = rowIndex % 10;
   if (cycle >= 2 && cycle <= 4) {
      // Highway with speeding cyber vehicles
      const speed = (rowIndex % 2 === 0 ? 1 : -1) * (1.8 + Math.random() * 1.5);
      const vehicleWidth = 44;
      const count = 3;
      const spacing = CANVAS_WIDTH / count;
      const items = Array.from({ length: count }, (_, i) => ({
         x: i * spacing + (Math.random() - 0.5) * 20,
         width: vehicleWidth,
         color: rowIndex % 2 === 0 ? '#f43f5e' : '#fbbf24',
         speed,
      }));
      return { index: rowIndex, type: ROW_TYPES.ROAD, speed, items };
   } else if (cycle >= 6 && cycle <= 8) {
      // River with floating pads
      const speed = (rowIndex % 2 === 0 ? 1 : -1) * (1.2 + Math.random() * 0.9);
      const logWidth = 72;
      const count = 3;
      const spacing = CANVAS_WIDTH / count;
      const items = Array.from({ length: count }, (_, i) => ({
         x: i * spacing,
         width: logWidth,
         color: '#38bdf8',
         speed,
      }));
      return { index: rowIndex, type: ROW_TYPES.RIVER, speed, items };
   }

   return { index: rowIndex, type: ROW_TYPES.GRASS, items: [] };
};

export const createInitialHopperState = () => {
   const rows = [];
   for (let i = 0; i < 25; i++) {
      rows.push(createRow(i));
   }

   return {
      state: 'ready', // 'ready' | 'playing' | 'gameover'
      score: 0,
      maxRow: 0,
      hopper: {
         x: CANVAS_WIDTH / 2 - 14,
         row: 0,
         width: 28,
         height: 28,
         onLogSpeed: 0,
      },
      rows,
      cameraY: 0,
   };
};

