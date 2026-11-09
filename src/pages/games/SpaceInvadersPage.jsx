import React from 'react';
import GameShell from '../../components/games/GameShell';
import SpaceInvaders from '../../games/space-invaders/SpaceInvaders';

export default function SpaceInvadersPage() {
   const instructions = [
      'Defend your starship against the descending alien armada and neutralize the high-value mystery UFOs.',
      'Take cover behind 3 protective energy bunkers to block incoming enemy plasma missiles.',
      'Bunkers erode as they absorb projectile impacts from both alien weaponry and your own fire.',
      'Clearing all alien invaders advances your ship to higher waves with faster alien march tempos.',
   ];

   const controlsHelp = [
      'Keyboard: Left/Right Arrow or A/D to steer, Spacebar or W to fire laser cannons, P to pause.',
      'Touch / Mobile: Use the left and right steer buttons and the center neon Fire button.',
   ];

   return (
      <GameShell
         gameId="space-invaders"
         title="Space Defend"
         category="Action"
         description="Defend your starship from descending alien fleets with laser volleys and defensive shields."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <SpaceInvaders />
      </GameShell>
   );
}

