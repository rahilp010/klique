import React from 'react';
import GameShell from '../../components/games/GameShell';
import CyberRunner from '../../games/cyber-runner/CyberRunner';

export default function CyberRunnerPage() {
   const instructions = [
      'Sprint across the scrolling cyber highway as speed and obstacle density progressively ramp up.',
      'Leap over low cyber spikes. Tap jump again in mid-air to execute a high-altitude Double Jump!',
      'Crouch and slide under hovering red laser surveillance drones.',
      'Test your reflexes to achieve the longest distance survival record in meters.',
   ];

   const controlsHelp = [
      'Keyboard: Press Spacebar or Up Arrow / W to Jump (press twice for Double Jump). Press Down Arrow / S to Slide.',
      'Touch / Mobile: Tap the arena or Jump button to leap, hold the Slide button to crouch.',
   ];

   return (
      <GameShell
         gameId="cyber-runner"
         title="Cyber Runner"
         category="Skill"
         description="High-speed endless arcade runner. Leap over obstacles and slide under laser drones with day/night color shifts."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <CyberRunner />
      </GameShell>
   );
}

