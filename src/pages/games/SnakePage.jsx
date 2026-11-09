import React, { useState, useEffect } from 'react';
import GameShell from '../../components/games/GameShell';
import SnakeGame from '../../games/snake/SnakeGame';
import { getGameHighScore } from '../../games/storage';

export default function SnakePage() {
   const [highScore, setHighScore] = useState(0);

   useEffect(() => {
      setHighScore(getGameHighScore('snake') || 0);

      const handleUpdate = () => {
         setHighScore(getGameHighScore('snake') || 0);
      };

      window.addEventListener('klique:arcade:highscore_updated', handleUpdate);
      return () => window.removeEventListener('klique:arcade:highscore_updated', handleUpdate);
   }, []);

   const instructions = [
      'Use Arrow Keys or W/A/S/D on desktop, or the on-screen buttons on mobile to steer the snake.',
      'Devour the glowing food dots to grow longer and gain 1 point each.',
      'The snake accelerates slightly as your score increases.',
      'Avoid running into the outer perimeter wall or colliding with your own body.',
      'Press Spacebar to pause or resume at any time.',
   ];

   const controlsHelp = [
      'Desktop: Arrow Keys / W, A, S, D to steer. Space to pause.',
      'Mobile: Swipe in any direction or tap the on-screen D-pad.',
   ];

   return (
      <GameShell
         gameId="snake"
         title="Snake"
         category="Arcade"
         description="Navigate the snake, devour food, grow longer, and avoid running into walls or your own tail."
         instructions={instructions}
         controlsHelp={controlsHelp}
         bestScore={highScore}
         bestScoreLabel="High Score">
         <SnakeGame />
      </GameShell>
   );
}

