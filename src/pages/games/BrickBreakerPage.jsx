import React from 'react';
import GameShell from '../../components/games/GameShell';
import BrickBreaker from '../../games/brick-breaker/BrickBreaker';

export default function BrickBreakerPage() {
   const instructions = [
      'Slide your paddle left and right to bounce the ball upwards into the brick rows.',
      'Angle your hits: hitting the edges of your paddle angles the ball sharply to reach hard-to-hit corners.',
      'Shatter bricks to score points and catch falling bonus orbs for wider paddles and multiballs.',
      'Keep the ball in play — if all balls drop below the bottom boundary, you lose 1 life.',
   ];

   const controlsHelp = [
      'Mouse / Touch: Move mouse or slide finger horizontally across the screen.',
      'Keyboard: Left/Right Arrow keys or A/D keys.',
   ];

   return (
      <GameShell
         gameId="brick-breaker"
         title="Brick Breaker"
         category="Action"
         description="Deflect the power ball with your paddle to shatter bricks and unlock bonus powerups."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <BrickBreaker />
      </GameShell>
   );
}

