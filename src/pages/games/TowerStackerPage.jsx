import React from 'react';
import GameShell from '../../components/games/GameShell';
import TowerStacker from '../../games/tower-stacker/TowerStacker';

export default function TowerStackerPage() {
   const instructions = [
      'Moving slabs sweep left and right across the top of your tower foundation.',
      'Tap the screen or press Spacebar at the exact instant the slab aligns with the block below.',
      'Any portion of the slab that overhangs the edge is sliced off and falls away, shrinking your base.',
      'Lining up a "PERFECT" drop triggers harmonic chime chords, and 3 consecutive perfect drops re-expand your slab!',
   ];

   const controlsHelp = [
      'Mouse / Touch: Click or tap anywhere in the arena to drop the active slab.',
      'Keyboard: Press Spacebar, Enter, or the Up Arrow to lock the slab in place.',
   ];

   return (
      <GameShell
         gameId="tower-stacker"
         title="Tower Stacker"
         category="Skill"
         description="Stack moving neon slabs with millisecond precision. Slices punish overhangs while perfect hits grow slabs."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <TowerStacker />
      </GameShell>
   );
}

