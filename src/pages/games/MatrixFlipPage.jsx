import React from 'react';
import GameShell from '../../components/games/GameShell';
import MatrixFlip from '../../games/matrix-flip/MatrixFlip';

export default function MatrixFlipPage() {
   const instructions = [
      'Each tile in the matrix represents a light that can be turned ON or OFF.',
      'Tapping any cell toggles its own state and inverts its four direct orthogonal neighbors (above, below, left, and right).',
      'The goal of the puzzle is to manipulate the grid until every single light is extinguished.',
      'Select between 3×3, 4×4, and 5×5 matrices to scale puzzle complexity.',
   ];

   const controlsHelp = [
      'Mouse / Touch: Click or tap any tile on the matrix grid to toggle it and its adjacent neighbors.',
   ];

   return (
      <GameShell
         gameId="matrix-flip"
         title="Matrix Flip"
         category="Puzzle"
         description="Classic Lights Out puzzle. Toggling any cell inverts its state and all four orthogonal neighbors. Turn all lights off!"
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <MatrixFlip />
      </GameShell>
   );
}

