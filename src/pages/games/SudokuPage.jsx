import React from 'react';
import GameShell from '../../components/games/GameShell';
import SudokuGame from '../../games/sudoku/SudokuGame';

export default function SudokuPage() {
   const instructions = [
      'Fill in the matrix so that each row, column, and smaller block contains all the numbers with no duplicates.',
      'Choose between 6×6 Quick Mode (digits 1–6, 2×3 blocks) or 9×9 Classic Mode (digits 1–9, 3×3 blocks).',
      'Conflicting duplicate entries are highlighted in red to assist deduction.',
      'Use the on-screen numbers keypad or press digit keys on your computer keyboard.',
   ];

   const controlsHelp = [
      'Mouse / Touch: Tap a cell, then tap a digit from the number bar below.',
      'Keyboard: Navigate with Arrow Keys, press 1–9 to input numbers, Backspace/Delete to erase.',
   ];

   return (
      <GameShell
         gameId="sudoku"
         title="Mini Sudoku"
         category="Puzzle"
         description="Solve 6x6 quick puzzles and classic 9x9 logic grids with conflict detection and pencil notes."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <SudokuGame />
      </GameShell>
   );
}

