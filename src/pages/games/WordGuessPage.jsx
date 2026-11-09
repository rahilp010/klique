import React from 'react';
import GameShell from '../../components/games/GameShell';
import WordGuess from '../../games/word-guess/WordGuess';

export default function WordGuessPage() {
   const instructions = [
      'Guess the mystery 5-letter word in 6 attempts or fewer.',
      'Each guess must be a valid 5-letter word. Hit Enter to submit your attempt.',
      'Lime Green: The letter is in the word and in the exact correct position.',
      'Amber / Yellow: The letter is in the word, but in a different position.',
      'Dark Zinc: The letter is not in the word at all.',
      'Play the official Daily Challenge or switch to Practice mode for unlimited rounds.',
   ];

   const controlsHelp = [
      'Desktop: Type on your computer keyboard. Press Enter to submit, Backspace to delete.',
      'Mobile: Tap the on-screen virtual keyboard letters.',
   ];

   return (
      <GameShell
         gameId="word-guess"
         title="Word Guess"
         category="Brain"
         description="Guess the hidden 5-letter word in 6 tries with letter position color hints."
         instructions={instructions}
         controlsHelp={controlsHelp}>
         <WordGuess />
      </GameShell>
   );
}

