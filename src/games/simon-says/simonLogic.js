/**
 * Pure Game Logic for Simon Says
 * Quadrants, frequency mappings, sequence generation, and input verification.
 */

export const QUADRANTS = [
   { id: 0, name: 'green', label: '1', key: 'q', color: '#daf4aa', freq: 415, activeClass: 'bg-[#daf4aa] shadow-[0_0_35px_#daf4aa]' },
   { id: 1, name: 'red', label: '2', key: 'w', color: '#f87171', freq: 310, activeClass: 'bg-red-400 shadow-[0_0_35px_#f87171]' },
   { id: 2, name: 'yellow', label: '3', key: 'a', color: '#facc15', freq: 252, activeClass: 'bg-amber-400 shadow-[0_0_35px_#facc15]' },
   { id: 3, name: 'blue', label: '4', key: 's', color: '#38bdf8', freq: 209, activeClass: 'bg-sky-400 shadow-[0_0_35px_#38bdf8]' },
];

export const getNextStep = () => Math.floor(Math.random() * 4);

export const getStepSpeed = (round) => {
   if (round < 5) return 480;
   if (round < 10) return 380;
   if (round < 15) return 290;
   return 220;
};

