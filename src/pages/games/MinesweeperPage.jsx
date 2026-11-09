import React from 'react';
import GameShell from '../../components/games/GameShell';
import Minesweeper from '../../games/minesweeper/Minesweeper';

export default function MinesweeperPage() {
   const instructions = [
      'Uncover all non-mine tiles across the grid without detonating any hidden bombs.',
      'Numbers on revealed tiles indicate how many mines reside in the 8 adjacent neighboring cells.',
      'Use the Flag tool or right-click to place hazard flags over suspected mine locations.',
      'Tiles with zero neighboring mines will automatically cascade reveal their empty surrounding region.',
      'First click is guaranteed to be 100% safe!',
   ];

   const controlsHelp = [
      'Desktop: Left-click to reveal. Right-click to toggle flag.',
      'Mobile: Tap the Dig / Flag toggle button to alternate actions.',
   ];

   return (
      <GameShell
         gameId="minesweeper"
         title="Minesweeper"
         category="Puzzle"
         description="Clear the minefield using logic, numbered proximity clues, and tactical flag markers."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <Minesweeper />
      </GameShell>
   );
}

