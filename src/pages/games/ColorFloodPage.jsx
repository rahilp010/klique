import React from 'react';
import GameShell from '../../components/games/GameShell';
import ColorFlood from '../../games/color-flood/ColorFlood';

export default function ColorFloodPage() {
   const instructions = [
      'Start from the top-left tile and flood neighboring connected tiles of the same color.',
      'Tap any of the 6 color buttons to change the active flooded cluster to that color.',
      'Grow your captured territory until the entire board is converted into one solid uniform color.',
      'Complete the flood within the allocated move allowance (22–35 moves depending on board size) to win!',
   ];

   const controlsHelp = [
      'Mouse / Touch: Click any color swatch below the board to initiate a flood transition.',
      'Keyboard: Press number keys 1 through 6 to pick color swatches quickly.',
   ];

   return (
      <GameShell
         gameId="color-flood"
         title="Color Flood"
         category="Strategy"
         description="Flood-fill the matrix starting from the top-left to unify all tiles in 25 moves or fewer."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <ColorFlood />
      </GameShell>
   );
}

