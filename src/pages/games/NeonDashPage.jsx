import React from 'react';
import GameShell from '../../components/games/GameShell';
import NeonDash from '../../games/neon-dash/NeonDash';

export default function NeonDashPage() {
   const instructions = [
      'Tap anywhere on the screen or press Spacebar to flap upward and resist continuous gravity.',
      'Time your altitude carefully to navigate cleanly through the gaps between vertical neon gates.',
      'Each gate you successfully clear awards +1 point.',
      'Touching the floor, ceiling, or any obstacle surface causes an instant crash. Chase your distance record!',
   ];

   const controlsHelp = [
      'Mouse / Touch: Click or tap anywhere on the game arena to flap.',
      'Keyboard: Press Spacebar to jump.',
   ];

   return (
      <GameShell
         gameId="neon-dash"
         title="Neon Dash"
         category="Skill"
         description="Navigate a soaring neon orb through narrow obstacle gates with precision jump gravity."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <NeonDash />
      </GameShell>
   );
}

