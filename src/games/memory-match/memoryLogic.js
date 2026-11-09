/**
 * Pure Game Logic for Memory Match
 * Multi-theme icon sets, dynamic board sizing (12, 16, 20 cards), and star rating.
 */

export const THEMES = {
   cosmic: {
      id: 'cosmic',
      name: 'Cosmic & Tech',
      icons: ['Sparkles', 'Zap', 'Flame', 'Heart', 'Compass', 'Shield', 'Rocket', 'Key', 'Moon', 'Sun'],
   },
   tools: {
      id: 'tools',
      name: 'Dev & Creative',
      icons: ['Code2', 'Database', 'Terminal', 'Cpu', 'Bug', 'Globe', 'Braces', 'Lock', 'Wifi', 'GitBranch'],
   },
};

export const SIZES = {
   quick: { id: 'quick', label: 'Quick (12)', pairs: 6, cols: 4, rows: 3 },
   standard: { id: 'standard', label: 'Standard (16)', pairs: 8, cols: 4, rows: 4 },
   master: { id: 'master', label: 'Master (20)', pairs: 10, cols: 5, rows: 4 },
};

export const createShuffledCards = (sizeKey = 'standard', themeKey = 'cosmic') => {
   const sizeConfig = SIZES[sizeKey] || SIZES.standard;
   const themeConfig = THEMES[themeKey] || THEMES.cosmic;
   const iconsToUse = themeConfig.icons.slice(0, sizeConfig.pairs);

   const pairs = [];
   iconsToUse.forEach((iconName, index) => {
      pairs.push({ id: `${index}-a`, icon: iconName, matched: false });
      pairs.push({ id: `${index}-b`, icon: iconName, matched: false });
   });

   // Fisher-Yates shuffle
   for (let i = pairs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
   }

   return pairs;
};

export const checkCardsMatch = (cardA, cardB) => {
   return cardA.icon === cardB.icon;
};

export const isGameCompleted = (cards) => {
   return cards.every((card) => card.matched);
};

export const calculateStarRating = (moves, totalPairs) => {
   const optimal = totalPairs;
   if (moves <= optimal + 3) return 3;
   if (moves <= optimal + 7) return 2;
   return 1;
};
