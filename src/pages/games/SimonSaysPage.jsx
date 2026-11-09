import React from 'react';
import GameShell from '../../components/games/GameShell';
import SimonSays from '../../games/simon-says/SimonSays';

export default function SimonSaysPage() {
   const instructions = [
      'Watch and listen carefully as the circular pad illuminates a colored sequence with musical notes.',
      'When it is your turn, tap the quadrants in the exact sequence shown.',
      'With each successful round, the sequence extends by 1 step and the playback speed accelerates.',
      'One wrong tap breaks the sequence and concludes the round. Test your visual and auditory memory!',
   ];

   const controlsHelp = [
      'Mouse / Touch: Click or tap the four colored quadrants directly.',
      'Keyboard: Press 1, 2, 3, 4 or Q, W, A, S on your keyboard.',
   ];

   return (
      <GameShell
         gameId="simon-says"
         title="Simon Says"
         category="Brain"
         description="Memorize and replicate expanding sequences of luminous colors and harmonic tones."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <SimonSays />
      </GameShell>
   );
}

