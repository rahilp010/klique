// Pure 2D rotational physics and vector asteroid generation

export const CANVAS_WIDTH = 540;
export const CANVAS_HEIGHT = 540;
export const SHIP_RADIUS = 12;
export const ROT_SPEED = 0.075;
export const THRUST = 0.16;
export const FRICTION = 0.985;

export const createAsteroid = (x, y, tier = 3) => {
   const radius = tier === 3 ? 36 : tier === 2 ? 22 : 12;
   const speed = (4 - tier) * (0.8 + Math.random() * 0.9);
   const angle = Math.random() * Math.PI * 2;
   // Generate polygon offsets for craggy rock appearance
   const vertices = 8;
   const offsets = Array.from({ length: vertices }, () => 0.75 + Math.random() * 0.5);

   return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      tier,
      radius,
      angle: 0,
      vRot: (Math.random() - 0.5) * 0.04,
      offsets,
      color: tier === 3 ? '#22d3ee' : tier === 2 ? '#38bdf8' : '#67e8f9',
   };
};

export const createInitialAsteroidsState = () => {
   const asteroids = [];
   // Spawn 4 large asteroids away from center
   for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2 + Math.random() * 0.5;
      const dist = 160 + Math.random() * 80;
      asteroids.push(
         createAsteroid(
            CANVAS_WIDTH / 2 + Math.cos(angle) * dist,
            CANVAS_HEIGHT / 2 + Math.sin(angle) * dist,
            3
         )
      );
   }

   return {
      state: 'ready', // 'ready' | 'playing' | 'gameover'
      score: 0,
      lives: 3,
      ship: {
         x: CANVAS_WIDTH / 2,
         y: CANVAS_HEIGHT / 2,
         vx: 0,
         vy: 0,
         angle: -Math.PI / 2,
         thrusting: false,
         invincibleTimer: 60, // 1 sec spawn shield
      },
      bullets: [],
      asteroids,
      particles: [],
      lastFireTime: 0,
   };
};

export const wrapCoordinates = (obj, width = CANVAS_WIDTH, height = CANVAS_HEIGHT) => {
   if (obj.x < 0) obj.x += width;
   else if (obj.x > width) obj.x -= width;
   if (obj.y < 0) obj.y += height;
   else if (obj.y > height) obj.y -= height;
};

