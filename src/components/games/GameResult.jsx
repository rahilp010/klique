import React from 'react';
import { RotateCcw, Trophy, Award, Frown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GameResult({
   status = 'gameover', // 'win', 'lose', 'draw', 'gameover', 'completed'
   title,
   score,
   scoreLabel = 'Score',
   bestScore,
   isNewBest = false,
   onRestart,
   extraMessage,
}) {
   const isWin = status === 'win' || status === 'completed';
   const isDraw = status === 'draw';

   return (
      <motion.div
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
         className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-zinc-800/80 bg-[#101012]/95 p-6 text-center shadow-2xl backdrop-blur-xl">
         {/* Icon Container */}
         <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-[#18181b]">
            {isWin ? (
               <Trophy size={26} className="text-[#daf4aa]" />
            ) : isDraw ? (
               <Award size={26} className="text-cyan-400" />
            ) : (
               <Frown size={26} className="text-zinc-500" />
            )}
         </div>

         {/* Title */}
         <h3 className="text-lg font-medium tracking-tight text-zinc-100">
            {title || (isWin ? 'Victory!' : isDraw ? 'It’s a Draw!' : 'Game Over')}
         </h3>

         {extraMessage && (
            <p className="mt-1 text-xs text-zinc-400">
               {extraMessage}
            </p>
         )}

         {/* Score Block */}
         <div className="my-5 rounded-xl border border-zinc-800/80 bg-[#0f0f11] p-3.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
               {scoreLabel}
            </div>
            <div className="mt-1 text-2xl font-bold font-mono text-zinc-100">
               {score}
            </div>

            {isNewBest && (
               <div className="mt-2 inline-flex items-center gap-1 rounded-md border border-[#daf4aa]/30 bg-[#daf4aa]/10 px-2 py-0.5 text-[10px] font-mono font-medium text-[#daf4aa]">
                  <Sparkles size={11} /> New High Score!
               </div>
            )}

            {!isNewBest && bestScore !== undefined && bestScore !== null && (
               <div className="mt-1.5 text-[11px] text-zinc-400 font-mono">
                  Best: <span className="text-zinc-200 font-bold">{bestScore}</span>
               </div>
            )}
         </div>

         {/* Action Button matching Paraphrase.jsx */}
         <button
            type="button"
            onClick={onRestart}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] border border-zinc-700/60 py-2.5 text-xs font-medium text-zinc-200 shadow-md transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600">
            <RotateCcw size={14} className="text-[#daf4aa]" />
            <span>Play Again</span>
         </button>
      </motion.div>
   );
}
