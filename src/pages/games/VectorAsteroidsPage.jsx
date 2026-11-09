import React from 'react';
import GameShell from '../../components/games/GameShell';
import VectorAsteroids from '../../games/asteroids/VectorAsteroids';

export default function VectorAsteroidsPage() {
   const instructions = [
      'Pilot your vector starship through deep space using 360-degree rotational physics.',
      'Fire forward thrusters to drift with inertia. Screen boundaries wrap around continuously.',
      'Shatter large asteroids into medium fragments, then down into tiny particles.',
      'Avoid colliding with rocky space debris to preserve your 3 starship shields.',
   ];

   const controlsHelp = [
      'Keyboard: Left/Right Arrow or A/D to rotate. Up Arrow or W to thrust. Spacebar or J to fire lasers.',
      'Touch / Mobile: Use the bottom rotation arrows, engine thrust button, and neon Fire trigger.',
   ];

   return (
      <GameShell
         gameId="asteroids"
         title="Vector Asteroids"
         category="Action"
         description="Pilot an agile vector starship with 360-degree rotational inertia. Shatter splitting space asteroids and avoid collisions."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <VectorAsteroids />
      </GameShell>
   );
}

