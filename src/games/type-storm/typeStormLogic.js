// Pure logic, dictionary, and state generator for Type Storm

export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 540;
export const BASE_LINE_Y = 470;

export const WORD_LIST = [
   // 3-4 letters (Tier 1)
   'code', 'byte', 'data', 'loop', 'node', 'sync', 'neon', 'core', 'grid', 'chip',
   'fast', 'wave', 'glow', 'fire', 'bolt', 'beam', 'ping', 'scan', 'zero', 'flux',
   // 5-6 letters (Tier 2)
   'cyber', 'react', 'array', 'pixel', 'logic', 'stack', 'async', 'parse', 'pulse',
   'laser', 'shield', 'matrix', 'stream', 'socket', 'crypto', 'router', 'binary',
   // 7-8 letters (Tier 3)
   'terminal', 'compiler', 'function', 'variable', 'protocol', 'database', 'frontend',
   'backend', 'network', 'quantum', 'algorithm', 'hardware', 'interface', 'download'
];

export const getRandomWord = (tier = 1) => {
   let subset;
   if (tier === 1) {
      subset = WORD_LIST.slice(0, 20);
   } else if (tier === 2) {
      subset = WORD_LIST.slice(20, 37);
   } else {
      subset = WORD_LIST.slice(37);
   }
   return subset[Math.floor(Math.random() * subset.length)];
};

export const createInitialStormState = () => {
   return {
      state: 'ready', // 'ready' | 'playing' | 'gameover'
      score: 0,
      shields: 3,
      words: [],
      targetWordId: null,
      typedCount: 0,
      totalKeysPressed: 0,
      correctKeysPressed: 0,
      startTime: Date.now(),
      spawnTimer: 0,
      spawnInterval: 120, // frames
      particles: [],
   };
};

