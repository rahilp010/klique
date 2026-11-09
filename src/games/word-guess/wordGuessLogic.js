/**
 * Pure Game Logic for Word Guess (Wordle-Style)
 * Curated word dictionary, letter evaluation, and daily seed.
 */

export const WORD_LIST = [
   'REACT', 'BUILD', 'FOCUS', 'LIGHT', 'PIXEL', 'SMART', 'CLEAN', 'PRISM', 'SHIFT', 'SPARK',
   'CLOUD', 'SOUND', 'TIMER', 'SCALE', 'LOGIC', 'ROUTE', 'FRAME', 'STACK', 'SCOPE', 'TOKEN',
   'SPEED', 'SHINE', 'FLASH', 'SOLID', 'RAPID', 'CLICK', 'BOARD', 'SHARP', 'POWER', 'PULSE',
   'CYBER', 'DRIVE', 'FIBER', 'GRAVI', 'HYPER', 'INPUT', 'LASER', 'MICRO', 'NEOON', 'ORBIT',
   'PLUGN', 'QUERY', 'RADAR', 'SPACE', 'TRACK', 'UNITY', 'VIVID', 'WAVEZ', 'YIELD', 'ZONES',
   'BRAIN', 'CHAMP', 'DREAM', 'EAGLE', 'FLAME', 'GLORY', 'HEART', 'IDEAL', 'JEWEL', 'KNACK',
   'LEMON', 'MAGIC', 'NINJA', 'OCEAN', 'PEACE', 'QUEST', 'RIVER', 'SUNNY', 'TIGER', 'VOICE',
   'WATER', 'YOUTH', 'ZEBRA', 'ALERT', 'BEACH', 'CHARM', 'DAISY', 'EARTH', 'FAITH', 'GIANT',
   'HONEY', 'IMAGE', 'JOLLY', 'KAPPA', 'LUCKY', 'MUSIC', 'NOBLE', 'OPERA', 'PIANO', 'QUEEN',
   'RADIO', 'STORM', 'TRAIN', 'ULTRA', 'VALOR', 'WALTZ', 'XENON', 'YACHT', 'BLAZE', 'CRISP',
];

export const MAX_GUESSES = 6;
export const WORD_LENGTH = 5;

export const getRandomWord = () => {
   const index = Math.floor(Math.random() * WORD_LIST.length);
   return WORD_LIST[index].toUpperCase();
};

export const getDailyWord = () => {
   const now = new Date();
   const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
   let hash = 0;
   for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash |= 0;
   }
   const index = Math.abs(hash) % WORD_LIST.length;
   return WORD_LIST[index].toUpperCase();
};

/**
 * Evaluate guess against target with duplicate letter handling.
 * Returns array of 5 status strings: 'correct' | 'present' | 'absent'
 */
export const evaluateGuess = (guess, target) => {
   const guessArr = guess.toUpperCase().split('');
   const targetArr = target.toUpperCase().split('');
   const result = Array(WORD_LENGTH).fill('absent');
   const targetCounts = {};

   // First pass: mark correct positions and tally remaining target letters
   for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessArr[i] === targetArr[i]) {
         result[i] = 'correct';
      } else {
         const char = targetArr[i];
         targetCounts[char] = (targetCounts[char] || 0) + 1;
      }
   }

   // Second pass: mark present letters
   for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i] !== 'correct') {
         const char = guessArr[i];
         if (targetCounts[char] > 0) {
            result[i] = 'present';
            targetCounts[char]--;
         }
      }
   }

   return result;
};

