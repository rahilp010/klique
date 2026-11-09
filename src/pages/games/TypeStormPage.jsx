import React from 'react';
import GameShell from '../../components/games/GameShell';
import TypeStorm from '../../games/type-storm/TypeStorm';

export default function TypeStormPage() {
   const instructions = [
      'Words descend from the upper atmosphere toward your city perimeter shield.',
      'Type the first letter of any incoming word to acquire a lock-on targeting laser.',
      'Complete spelling the entire word to blast it into particles and score points.',
      'If words reach the lower perimeter barrier, one shield cell will be depleted. Defend as long as possible!',
   ];

   const controlsHelp = [
      'Keyboard: Type letters A through Z on your physical computer keyboard.',
      'Touch / Mobile: Tap the arena or the on-screen "Tap to Open Mobile Keyboard" prompt.',
   ];

   return (
      <GameShell
         gameId="type-storm"
         title="Type Storm"
         category="Brain"
         description="Type descending incoming words to lock laser railguns and blast them before they reach the city shield."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <TypeStorm />
      </GameShell>
   );
}

