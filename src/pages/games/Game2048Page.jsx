import React, { useState, useEffect } from 'react';
import GameShell from '../../components/games/GameShell';
import Game2048 from '../../games/2048/Game2048';
import { getGameHighScore } from '../../games/storage';

export default function Game2048Page() {
   const [highScore, setHighScore] = useState(0);

   useEffect(() => {
      const stored = getGameHighScore('2048') || {};
      setHighScore(stored.best || 0);

      const handleUpdate = () => {
         const s = getGameHighScore('2048') || {};
         setHighScore(s.best || 0);
      };

      window.addEventListener('klique:arcade:highscore_updated', handleUpdate);
      return () => window.removeEventListener('klique:arcade:highscore_updated', handleUpdate);
   }, []);

   const instructions = [
      'Use Arrow Keys or W/A/S/D on desktop, or swipe / on-screen arrows on mobile to slide all tiles.',
      'When two tiles with the same number collide during a move, they merge into one with double value.',
      'Every valid move spawns a new 2 or 4 tile in an empty cell.',
      'Strategize to reach the coveted 2048 tile and see how high your score can climb.',
      'Use the Undo button to roll back an accidental misstep.',
   ];

   const controlsHelp = [
      'Desktop: Arrow Keys or W, A, S, D to slide tiles. Ctrl+Z to undo.',
      'Mobile: Swipe across the board or tap the on-screen arrows.',
   ];

   return (
      <GameShell
         gameId="2048"
         title="2048"
         category="Puzzle"
         description="Slide and combine matching numbered tiles to reach the legendary 2048 tile."
         instructions={instructions}
         controlsHelp={controlsHelp}
         bestScore={highScore}
         bestScoreLabel="High Score">
         <Game2048 />
      </GameShell>
   );
}

