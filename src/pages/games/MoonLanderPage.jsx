import React from 'react';
import GameShell from '../../components/games/GameShell';
import MoonLander from '../../games/moon-lander/MoonLander';

export default function MoonLanderPage() {
   const instructions = [
      'Pilot the Apollo lunar descent lander to a safe landing on designated flat terrain pads.',
      'Fire the main engine throttle burst to counter continuous downward lunar gravity.',
      'Rotate your module using left and right thrusters to counteract horizontal drift.',
      'Touchdown safely: Keep Vertical Speed under 1.8 m/s, Horizontal Speed under 1.2 m/s, and tilt upright.',
   ];

   const controlsHelp = [
      'Keyboard: Left/Right Arrow or A/D to tilt. Up Arrow / W or Spacebar to fire main throttle engine.',
      'Touch / Mobile: Use the bottom tilt directional buttons and the central throttle button.',
   ];

   return (
      <GameShell
         gameId="moon-lander"
         title="Moon Lander"
         category="Action"
         description="Real physics lunar descent. Fire rotational thrusters and throttle bursts to touchdown safely on landing pads with limited fuel."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <MoonLander />
      </GameShell>
   );
}

