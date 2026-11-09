// Pure physics and obstacle generation for Cyber Runner

export const CANVAS_WIDTH = 580;
export const CANVAS_HEIGHT = 280;
export const GROUND_Y = 220;
export const GRAVITY = 0.65;
export const JUMP_VELOCITY = -11.5;

export const createInitialRunnerState = () => {
   return {
      state: 'ready', // 'ready' | 'running' | 'gameover'
      distance: 0,
      speed: 5.5,
      runner: {
         x: 60,
         y: GROUND_Y - 36,
         width: 26,
         height: 36,
         vy: 0,
         isGrounded: true,
         isDucking: false,
         jumpsLeft: 2, // Double jump!
      },
      obstacles: [],
      particles: [],
      nextSpawnDistance: 30,
      gridOffset: 0,
   };
};

export const checkAABB = (r1, r2) => {
   return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
   );
};

