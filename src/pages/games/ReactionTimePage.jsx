import React, { useState, useEffect } from 'react';
import GameShell from '../../components/games/GameShell';
import ReactionTime from '../../games/reaction-time/ReactionTime';
import { getGameHighScore } from '../../games/storage';

export default function ReactionTimePage() {
   const [bestMs, setBestMs] = useState(null);

   useEffect(() => {
      const stored = getGameHighScore('reaction-time');
      setBestMs(stored?.bestMs || null);

      const handleUpdate = () => {
         const s = getGameHighScore('reaction-time');
         setBestMs(s?.bestMs || null);
      };

      window.addEventListener('klique:arcade:highscore_updated', handleUpdate);
      return () => window.removeEventListener('klique:arcade:highscore_updated', handleUpdate);
   }, []);

   const instructions = [
      'Click or press Spacebar to start the benchmark round.',
      'The screen turns dark red with the message "Wait for Green...".',
      'At an unpredictable moment between 1.5 and 4.5 seconds, the screen will flash bright lime green.',
      'Click or tap instantly as soon as you perceive the color change.',
      'If you click before the green signal, a false start will be triggered.',
   ];

   const controlsHelp = [
      'Click / Tap on the reaction area, or press Spacebar on your keyboard.',
      'The test tracks your best reaction and your running 5-round average.',
   ];

   const formattedBest = bestMs ? `${bestMs} ms` : null;

   return (
      <GameShell
         gameId="reaction-time"
         title="Reaction Time"
         category="Skill"
         description="Test your reflexes down to the millisecond. Wait for the green signal and click instantly."
         instructions={instructions}
         controlsHelp={controlsHelp}
         bestScore={formattedBest}
         bestScoreLabel="Fastest Time">
         <ReactionTime />
      </GameShell>
   );
}

