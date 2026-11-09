import React from 'react';
import { RotateCcw, Play, Pause, Volume2, VolumeX, HelpCircle } from 'lucide-react';

export default function GameControls({
   isPlaying = false,
   isPaused = false,
   onStart,
   onPause,
   onResume,
   onRestart,
   soundEnabled = true,
   onToggleSound,
   onShowHelp,
   canPause = true,
   canRestart = true,
}) {
   return (
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-zinc-800/80 bg-[#121214] p-2 sm:p-2.5 shadow-lg">
         <div className="flex items-center gap-2">
            {!isPlaying ? (
               <button
                  type="button"
                  onClick={onStart}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] border border-zinc-700/60 px-4 py-2 text-xs font-medium text-zinc-200 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600">
                  <Play size={13} className="fill-current text-[#daf4aa]" />
                  <span>Start Game</span>
               </button>
            ) : (
               <>
                  {canPause && (
                     <button
                        type="button"
                        onClick={isPaused ? onResume : onPause}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#18181b] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600">
                        {isPaused ? <Play size={13} className="fill-current text-[#daf4aa]" /> : <Pause size={13} />}
                        <span>{isPaused ? 'Resume' : 'Pause'}</span>
                     </button>
                  )}

                  {canRestart && (
                     <button
                        type="button"
                        onClick={onRestart}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-[#18181b] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600">
                        <RotateCcw size={13} />
                        <span>Restart</span>
                     </button>
                  )}
               </>
            )}
         </div>

         <div className="flex items-center gap-1.5">
            {onToggleSound && (
               <button
                  type="button"
                  onClick={onToggleSound}
                  aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 ${
                     soundEnabled
                        ? 'border-zinc-800 bg-[#18181b] text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        : 'border-zinc-800 bg-[#18181b]/50 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                  }`}>
                  {soundEnabled ? <Volume2 size={14} className="text-[#daf4aa]" /> : <VolumeX size={14} className="text-rose-400" />}
               </button>
            )}

            {onShowHelp && (
               <button
                  type="button"
                  onClick={onShowHelp}
                  aria-label="Game Instructions"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-[#18181b] text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600">
                  <HelpCircle size={14} />
               </button>
            )}
         </div>
      </div>
   );
}
