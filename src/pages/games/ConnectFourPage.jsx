import React from 'react';
import GameShell from '../../components/games/GameShell';
import ConnectFour from '../../games/connect-four/ConnectFour';

export default function ConnectFourPage() {
   const instructions = [
      'Take turns dropping discs into any of the 7 vertical columns.',
      'The disc falls to the lowest available empty slot within that column.',
      'The first player to line up 4 matching discs in any direction (horizontal, vertical, or diagonal) wins!',
      'Play solo against a tactical computer AI with Easy, Medium, and Hard difficulties, or challenge a friend locally.',
   ];

   const controlsHelp = [
      'Mouse / Touch: Click or tap any column or top arrow button to drop a disc.',
      'Keyboard: Press number keys 1 through 7 on your keyboard to drop into columns 1 to 7.',
   ];

   return (
      <GameShell
         gameId="connect-four"
         title="Connect Four"
         category="Strategy"
         description="Drop colored tokens into the vertical 7x6 matrix to connect 4 in a row. Play vs Minimax AI or 2-player friend."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <ConnectFour />
      </GameShell>
   );
}

