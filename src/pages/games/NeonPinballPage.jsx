import React from 'react';
import GameShell from '../../components/games/GameShell';
import NeonPinball from '../../games/pinball/NeonPinball';

export default function NeonPinballPage() {
   const instructions = [
      'Press and hold Spacebar (or the center PULL button) to charge the spring plunger, then release to launch the ball.',
      'Control the Left Flipper (Arrow Left / A / Left Shift) and Right Flipper (Arrow Right / D / Right Shift) to keep the ball in play.',
      'Hit the pop bumpers (+100 and +250 pts) and angled slingshots (+50 pts) to bounce into high-score trajectories.',
      'Roll through all three top N-E-O-N rollover lanes to level up your score multiplier up to 5x!',
      'You have 3 balls per match. Prevent balls from draining between the flippers to achieve the highest score.',
   ];

   const controlsHelp = [
      'Left Flipper: Left Arrow, A key, Z key, or Left Shift.',
      'Right Flipper: Right Arrow, D key, Slash (/), or Right Shift.',
      'Plunger Launch: Spacebar, Down Arrow, or S key (hold to pull back, release to fire).',
      'Touch / Mobile: Tap left or right half of table, or use the dedicated FLIP L, PULL, and FLIP R bottom buttons.',
   ];

   return (
      <GameShell
         gameId="pinball"
         title="Neon Pinball"
         category="Action"
         description="Kinetic 2D neon pinball table with dual flippers, spring plunger, pop bumpers, ramp loops, and multiball jackpots."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <NeonPinball />
      </GameShell>
   );
}

