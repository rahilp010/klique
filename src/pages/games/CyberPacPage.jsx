import React from 'react';
import GameShell from '../../components/games/GameShell';
import CyberPac from '../../games/cyber-pac/CyberPac';

export default function CyberPacPage() {
   const instructions = [
      'Guide Cyber Pac through the glowing corridors to collect every energy pellet in the maze.',
      'Dodge the four autonomous ghosts (Blinky, Pinky, Inky, and Clyde) who patrol the maze.',
      'Devour yellow Power Orbs in the four corners to temporarily invert ghosts into edible blue targets!',
      'Use the side escape tunnels to wrap across the screen and outmaneuver ghost pursuit.',
   ];

   const controlsHelp = [
      'Keyboard: Use Arrow Keys or W/A/S/D to change Cyber Pac direction.',
      'Touch / Mobile: Use the on-screen directional pad or swipe to steer.',
   ];

   return (
      <GameShell
         gameId="cyber-pac"
         title="Cyber Pac"
         category="Arcade"
         description="Navigate a dark neon labyrinth, consume glowing energy pellets, and outsmart 4 autonomous cyber ghosts."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <CyberPac />
      </GameShell>
   );
}

