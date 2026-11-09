import React from 'react';
import GameShell from '../../components/games/GameShell';
import NeonHopper from '../../games/neon-hopper/NeonHopper';

export default function NeonHopperPage() {
   const instructions = [
      'Navigate your neon hopper across multi-lane highways filled with high-speed cyber hover-cars.',
      'Hop onto floating river logs to safely cross rapid electronic currents.',
      'Avoid standing in open water or colliding with oncoming vehicles.',
      'Every forward step advances your distance record. How many hops can you survive?',
   ];

   const controlsHelp = [
      'Keyboard: Use Arrow Keys or W/A/S/D to hop forward, back, left, or right. Spacebar hops forward.',
      'Touch / Mobile: Tap the game screen to hop forward, or use the on-screen directional arrow buttons.',
   ];

   return (
      <GameShell
         gameId="neon-hopper"
         title="Neon Hopper"
         category="Arcade"
         description="Navigate a glowing hopper across busy cyber highways with speeding cars and rushing rivers on floating logs."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <NeonHopper />
      </GameShell>
   );
}

