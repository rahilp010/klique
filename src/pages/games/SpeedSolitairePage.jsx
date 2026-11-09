import React from 'react';
import GameShell from '../../components/games/GameShell';
import SpeedSolitaire from '../../games/solitaire/SpeedSolitaire';

export default function SpeedSolitairePage() {
   const instructions = [
      'Build up the four Foundation piles in top-right from Ace to King by suit (♠, ♥, ♦, ♣).',
      'Build down the Tableau columns alternating red and black suits (e.g., Red Queen on Black King).',
      'Click or tap any exposed card to automatically route it to the foundation or legal column.',
      'Tap the stock deck to draw fresh cards into the waste pile. Empty tableau spaces accept Kings.',
      'Clear all 52 cards to the foundations to trigger the cascade victory celebration!',
   ];

   const controlsHelp = [
      'Mouse / Touch: Click or tap any card to smart-move it, or drag cards between columns.',
      'Draw: Click the top-left Stock deck to reveal cards.',
      'Undo & Hint: Use the bottom toolbar buttons for hints or to revert mistakes.',
   ];

   return (
      <GameShell
         gameId="solitaire"
         title="Speed Solitaire"
         category="Strategy"
         description="Classic Klondike solitaire with smooth card interactions, auto-play foundation routing, and waterfall celebrations."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <SpeedSolitaire />
      </GameShell>
   );
}

