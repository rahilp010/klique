import React, { useState, useEffect } from 'react';
import GameShell from '../../components/games/GameShell';
import MemoryMatch from '../../games/memory-match/MemoryMatch';
import { getGameHighScore } from '../../games/storage';

export default function MemoryMatchPage() {
   const [bestRecord, setBestRecord] = useState(null);

   useEffect(() => {
      const stored = getGameHighScore('memory-match');
      setBestRecord(stored);

      const handleUpdate = () => {
         const s = getGameHighScore('memory-match');
         setBestRecord(s);
      };

      window.addEventListener('klique:arcade:highscore_updated', handleUpdate);
      return () => window.removeEventListener('klique:arcade:highscore_updated', handleUpdate);
   }, []);

   const instructions = [
      'Click or tap any covered card on the 4x4 board to reveal its icon.',
      'Tap a second card to find its matching twin.',
      'If the two revealed cards match, they lock in place as discovered.',
      'If they mismatch, they will flip back over after a moment. Remember their positions!',
      'Complete the board in the fewest moves and fastest time possible.',
   ];

   const controlsHelp = [
      'Click or tap on cards to flip and match pairs.',
      'Restart anytime using the reset icon above the board.',
   ];

   const formattedBest = bestRecord?.bestMoves ? `${bestRecord.bestMoves} moves` : null;

   return (
      <GameShell
         gameId="memory-match"
         title="Memory Match"
         category="Brain"
         description="Exercise visual recall by uncovering matched icon pairs across a 4x4 card grid."
         instructions={instructions}
         controlsHelp={controlsHelp}
         bestScore={formattedBest}
         bestScoreLabel="Fewest Moves">
         <MemoryMatch />
      </GameShell>
   );
}

