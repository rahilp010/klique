// Pure card deck generator, Klondike rules, and auto-move solver

export const SUITS = {
   HEARTS: { name: 'hearts', symbol: '♥', color: '#f43f5e' },
   DIAMONDS: { name: 'diamonds', symbol: '♦', color: '#f43f5e' },
   CLUBS: { name: 'clubs', symbol: '♣', color: '#38bdf8' },
   SPADES: { name: 'spades', symbol: '♠', color: '#38bdf8' },
};

export const RANKS = [
   { val: 1, label: 'A' },
   { val: 2, label: '2' },
   { val: 3, label: '3' },
   { val: 4, label: '4' },
   { val: 5, label: '5' },
   { val: 6, label: '6' },
   { val: 7, label: '7' },
   { val: 8, label: '8' },
   { val: 9, label: '9' },
   { val: 10, label: '10' },
   { val: 11, label: 'J' },
   { val: 12, label: 'Q' },
   { val: 13, label: 'K' },
];

export const createDeck = () => {
   const deck = [];
   Object.values(SUITS).forEach((suit) => {
      RANKS.forEach((rank) => {
         deck.push({
            id: `${rank.label}-${suit.name}`,
            rank: rank.val,
            label: rank.label,
            suit: suit.name,
            symbol: suit.symbol,
            color: suit.color,
            faceUp: false,
         });
      });
   });

   // Shuffle Deck (Fisher-Yates)
   for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
   }

   return deck;
};

export const createInitialSolitaireState = () => {
   const deck = createDeck();
   const tableau = [[], [], [], [], [], [], []];

   // Deal 7 tableau columns
   for (let col = 0; col < 7; col++) {
      for (let i = 0; i <= col; i++) {
         const card = deck.pop();
         if (i === col) card.faceUp = true;
         tableau[col].push(card);
      }
   }

   return {
      stock: deck, // Remaining 24 cards
      waste: [],
      foundations: [[], [], [], []], // 4 piles
      tableau,
      history: [],
      moves: 0,
      startTime: Date.now(),
      isWon: false,
   };
};

