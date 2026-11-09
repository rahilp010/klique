// Pure logic, state factories, and helpers for Space Defend / Invaders

export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 560;

export const ALIEN_TYPES = [
   { type: 'commander', score: 40, color: '#f43f5e' }, // Top row (Red/Pink)
   { type: 'crush', score: 20, color: '#06b6d4' },     // Middle row 1 (Cyan)
   { type: 'crush', score: 20, color: '#06b6d4' },     // Middle row 2 (Cyan)
   { type: 'grunt', score: 10, color: '#a855f7' },     // Bottom row (Purple)
];

export const createBunkers = () => {
   const bunkers = [];
   const bunkerCount = 3;
   const bunkerWidth = 48;
   const bunkerHeight = 24;
   const spacing = (CANVAS_WIDTH - bunkerCount * bunkerWidth) / (bunkerCount + 1);

   for (let i = 0; i < bunkerCount; i++) {
      const bx = spacing + i * (bunkerWidth + spacing);
      const by = 430;
      // 4 sub-blocks per bunker (2x2)
      const parts = [];
      const pw = bunkerWidth / 3;
      const ph = bunkerHeight / 2;
      for (let r = 0; r < 2; r++) {
         for (let c = 0; c < 3; c++) {
            // Cutout top center or bottom center for arcade arch shape
            if (r === 1 && c === 1) continue; // bottom arch opening
            parts.push({
               x: bx + c * pw,
               y: by + r * ph,
               width: pw,
               height: ph,
               hp: 4, // 4 hits to destroy
            });
         }
      }
      bunkers.push({ parts });
   }
   return bunkers;
};

export const createAliens = (wave = 1) => {
   const aliens = [];
   const rows = 4;
   const cols = 8;
   const alienW = 26;
   const alienH = 18;
   const spacingX = 18;
   const spacingY = 16;
   const totalWidth = cols * alienW + (cols - 1) * spacingX;
   const startX = (CANVAS_WIDTH - totalWidth) / 2;
   const startY = 70 + Math.min(wave * 5, 40);

   for (let r = 0; r < rows; r++) {
      const def = ALIEN_TYPES[r] || ALIEN_TYPES[3];
      for (let c = 0; c < cols; c++) {
         aliens.push({
            id: `${r}-${c}`,
            row: r,
            col: c,
            x: startX + c * (alienW + spacingX),
            y: startY + r * (alienH + spacingY),
            width: alienW,
            height: alienH,
            type: def.type,
            score: def.score,
            color: def.color,
            alive: true,
         });
      }
   }
   return aliens;
};

export const createInitialGameState = (wave = 1, currentScore = 0, lives = 3) => {
   return {
      state: 'ready', // 'ready' | 'playing' | 'paused' | 'wave_cleared' | 'gameover'
      score: currentScore,
      wave,
      lives,
      player: {
         x: CANVAS_WIDTH / 2 - 18,
         y: CANVAS_HEIGHT - 45,
         width: 36,
         height: 20,
         speed: 5.5,
      },
      playerBullets: [],
      alienBullets: [],
      aliens: createAliens(wave),
      bunkers: createBunkers(),
      particles: [],
      stars: Array.from({ length: 45 }, () => ({
         x: Math.random() * CANVAS_WIDTH,
         y: Math.random() * CANVAS_HEIGHT,
         speed: 0.3 + Math.random() * 0.9,
         size: Math.random() * 1.5 + 0.5,
         opacity: Math.random() * 0.7 + 0.3,
      })),
      alienDir: 1, // 1 for right, -1 for left
      alienStepTimer: 0,
      alienStepInterval: Math.max(16, 48 - (wave - 1) * 4), // frames between steps
      ufo: null,
      ufoTimer: 600 + Math.floor(Math.random() * 600), // frames until next UFO
      lastFireTime: 0,
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

export const createExplosion = (x, y, color = '#daf4aa', count = 12) => {
   const particles = [];
   for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 1.2 + Math.random() * 2.5;
      particles.push({
         x,
         y,
         vx: Math.cos(angle) * speed,
         vy: Math.sin(angle) * speed,
         life: 20 + Math.floor(Math.random() * 15),
         maxLife: 35,
         color,
         size: Math.random() * 2.5 + 1.5,
      });
   }
   return particles;
};

