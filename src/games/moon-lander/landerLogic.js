// Pure physics and lunar terrain generator for Moon Lander

export const CANVAS_WIDTH = 500;
export const CANVAS_HEIGHT = 480;
export const GRAVITY = 0.042;
export const MAIN_THRUST = 0.098;
export const ROT_SPEED = 0.05;

export const generateLunarTerrain = () => {
   const points = [];
   const segments = 12;
   const segWidth = CANVAS_WIDTH / segments;

   // Flat landing pad in center-right
   const padIndex = 5;
   const padY = 400;

   for (let i = 0; i <= segments; i++) {
      const x = i * segWidth;
      let y;

      if (i === padIndex || i === padIndex + 1) {
         y = padY; // Flat landing pad
      } else {
         y = 350 + Math.random() * 85;
      }
      points.push({ x, y });
   }

   const landingPad = {
      x1: padIndex * segWidth,
      x2: (padIndex + 1) * segWidth,
      y: padY,
      multiplier: 3,
   };

   return { points, landingPad };
};

export const createInitialLanderState = () => {
   const { points, landingPad } = generateLunarTerrain();

   return {
      state: 'ready', // 'ready' | 'flying' | 'landed' | 'crashed'
      score: 0,
      fuel: 800,
      lander: {
         x: 80,
         y: 60,
         vx: 1.2,
         vy: 0,
         angle: 0, // radians
         width: 22,
         height: 22,
         thrusting: false,
      },
      terrain: points,
      pad: landingPad,
      particles: [],
   };
};

