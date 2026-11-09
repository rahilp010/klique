import React from 'react';
import GameShell from '../../components/games/GameShell';
import RetroPong from '../../games/pong/RetroPong';

export default function RetroPongPage() {
   const instructions = [
      'Control your paddle vertically along the court line to bounce the ball back.',
      'Angle your returns: striking near the edge of your paddle adds steep vertical deflection.',
      'Whichever player lets the ball pass behind their paddle grants a point to their rival.',
      'The first player to score 7 points wins the match.',
      'Supports solo play against the computer AI or 2-player shared keyboard duel.',
   ];

   const controlsHelp = [
      'Player 1: W (Up) and S (Down), or slide finger on mobile.',
      'Player 2 (in 2-Player mode): Up Arrow and Down Arrow.',
   ];

   return (
      <GameShell
         gameId="pong"
         title="Retro Pong"
         category="Action"
         description="Vintage table tennis battle against an adaptive computer paddle or local 2-player friend."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <RetroPong />
      </GameShell>
   );
}

