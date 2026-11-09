import React, { useState, useEffect } from 'react';
import GameShell from '../../components/games/GameShell';
import TicTacToe from '../../games/tic-tac-toe/TicTacToe';
import { getGameHighScore } from '../../games/storage';

export default function TicTacToePage() {
   const [record, setRecord] = useState({ wins: 0, losses: 0, draws: 0 });

   useEffect(() => {
      const stored = getGameHighScore('tic-tac-toe') || { wins: 0, losses: 0, draws: 0 };
      setRecord(stored);

      const handleUpdate = () => {
         const s = getGameHighScore('tic-tac-toe') || { wins: 0, losses: 0, draws: 0 };
         setRecord(s);
      };

      window.addEventListener('klique:arcade:highscore_updated', handleUpdate);
      return () => window.removeEventListener('klique:arcade:highscore_updated', handleUpdate);
   }, []);

   const instructions = [
      'Choose between Single Player (vs Computer) or 2 Players pass-and-play mode.',
      'Player 1 places X, Player 2 or Computer places O.',
      'Take turns claiming cells on the 3x3 grid.',
      'The first player to line up three marks in a horizontal row, vertical column, or diagonal wins!',
      'If all 9 cells are filled with no trio, the match ends in a draw.',
   ];

   const controlsHelp = [
      'Click or tap on any vacant cell to mark it.',
      'Switch game modes at any time using the mode pill at the top.',
   ];

   const formattedRecord = `${record.wins || 0}W - ${record.losses || 0}L`;

   return (
      <GameShell
         gameId="tic-tac-toe"
         title="Tic Tac Toe"
         category="Strategy"
         description="Classic 3x3 strategy. Challenge a smart local AI or play head-to-head with a friend in pass-and-play."
         instructions={instructions}
         controlsHelp={controlsHelp}
         bestScore={formattedRecord}
         bestScoreLabel="AI Record">
         <TicTacToe />
      </GameShell>
   );
}

