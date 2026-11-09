import React from 'react';
import GameShell from '../../components/games/GameShell';
import BlockDrop from '../../games/block-drop/BlockDrop';

export default function BlockDropPage() {
   const instructions = [
      'Control descending tetromino shapes to assemble solid horizontal lines with zero gaps.',
      'Completed lines vanish immediately, awarding points and lowering the stack height.',
      'Clearing 4 lines at once (a Tetris) grants a colossal bonus multiplier!',
      'Store a tricky piece for later using the Hold slot (press C or tap HOLD).',
      'Use the Ghost Guide projection to aim with pinpoint accuracy. Spacebar activates instant Hard Drop.',
   ];

   const controlsHelp = [
      'Desktop: Left/Right to shift, Up to rotate, Down for soft drop, Space for hard drop, C to hold.',
      'Mobile: Tap the dedicated on-screen directional buttons and DROP trigger.',
   ];

   return (
      <GameShell
         gameId="block-drop"
         title="Block Drop"
         category="Arcade"
         description="Arrange falling tetromino blocks to complete horizontal lines and score combo clears."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <BlockDrop />
      </GameShell>
   );
}

