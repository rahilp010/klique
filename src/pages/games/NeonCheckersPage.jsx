import React from 'react';
import GameShell from '../../components/games/GameShell';
import NeonCheckers from '../../games/checkers/NeonCheckers';

export default function NeonCheckersPage() {
   const instructions = [
      'Pieces move diagonally forward 1 step along the dark squares of the 8×8 board.',
      'Jump over an adjacent opposing piece to capture and remove it from play.',
      'If an additional jump is possible after landing, continue leaping along the capture chain.',
      'Advance a piece to the opposite far rank to crown it into a King (👑), granting bidirectional diagonal movement.',
   ];

   const controlsHelp = [
      'Mouse / Touch: Click or tap your piece to reveal valid moves (green target dots), then tap the destination.',
   ];

   return (
      <GameShell
         gameId="checkers"
         title="Neon Checkers"
         category="Strategy"
         description="Classic 8x8 draughts with diagonal hops, multi-jump chains, and king crownings. Play solo vs AI or local 2-player friend."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <NeonCheckers />
      </GameShell>
   );
}

