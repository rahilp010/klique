import React, { useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, X } from 'lucide-react';

export default function VirtualGamepad({ onAction, onClose, className = '' }) {
   const triggerKey = useCallback((key, code, isDown) => {
      try {
         if (isDown && navigator.vibrate) {
            navigator.vibrate(8);
         }
      } catch (e) {
         // Ignore
      }

      const eventType = isDown ? 'keydown' : 'keyup';
      const event = new KeyboardEvent(eventType, {
         key,
         code,
         bubbles: true,
         cancelable: true,
      });

      window.dispatchEvent(event);
      if (isDown && onAction) onAction(key);
   }, [onAction]);

   const createButtonHandler = (key, code) => ({
      onPointerDown: (e) => {
         e.preventDefault();
         triggerKey(key, code, true);
      },
      onPointerUp: (e) => {
         e.preventDefault();
         triggerKey(key, code, false);
      },
      onPointerLeave: (e) => {
         e.preventDefault();
         triggerKey(key, code, false);
      },
      onTouchStart: (e) => {
         e.preventDefault();
         triggerKey(key, code, true);
      },
      onTouchEnd: (e) => {
         e.preventDefault();
         triggerKey(key, code, false);
      },
   });

   return (
      <>
         {/* Standard / Portrait / Desktop Layout */}
         <div
            className={`w-full max-w-lg mx-auto flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#101012]/95 border border-zinc-800/80 backdrop-blur-xl shadow-2xl select-none touch-none overscroll-contain landscape:max-h-[500px]:hidden ${className}`}>
            {/* D-Pad Controller */}
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
               <div className="absolute w-24 h-24 rounded-2xl bg-[#18181b] border border-zinc-800/80 pointer-events-none" />

               {/* UP */}
               <button
                  {...createButtonHandler('ArrowUp', 'ArrowUp')}
                  aria-label="Up Arrow"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] border border-zinc-700/60 flex items-center justify-center text-zinc-300 active:bg-[#daf4aa] active:text-zinc-950 active:scale-95 transition-all shadow-md">
                  <ArrowUp size={18} />
               </button>

               {/* DOWN */}
               <button
                  {...createButtonHandler('ArrowDown', 'ArrowDown')}
                  aria-label="Down Arrow"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] border border-zinc-700/60 flex items-center justify-center text-zinc-300 active:bg-[#daf4aa] active:text-zinc-950 active:scale-95 transition-all shadow-md">
                  <ArrowDown size={18} />
               </button>

               {/* LEFT */}
               <button
                  {...createButtonHandler('ArrowLeft', 'ArrowLeft')}
                  aria-label="Left Arrow"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] border border-zinc-700/60 flex items-center justify-center text-zinc-300 active:bg-[#daf4aa] active:text-zinc-950 active:scale-95 transition-all shadow-md">
                  <ArrowLeft size={18} />
               </button>

               {/* RIGHT */}
               <button
                  {...createButtonHandler('ArrowRight', 'ArrowRight')}
                  aria-label="Right Arrow"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] border border-zinc-700/60 flex items-center justify-center text-zinc-300 active:bg-[#daf4aa] active:text-zinc-950 active:scale-95 transition-all shadow-md">
                  <ArrowRight size={18} />
               </button>

               {/* Center Pivot Nub */}
               <div className="w-5 h-5 rounded-full bg-[#0f0f11] border border-zinc-800 pointer-events-none" />
            </div>

            {/* Center Utility Buttons */}
            <div className="flex flex-col items-center gap-1.5 px-2">
               <button
                  {...createButtonHandler(' ', 'Space')}
                  aria-label="Space or Jump"
                  className="px-3 py-1.5 rounded-lg bg-[#18181b] border border-zinc-800 text-[10px] font-mono font-bold text-zinc-400 active:bg-zinc-800 active:text-white uppercase tracking-wider flex items-center gap-1">
                  <Play size={9} className="fill-current text-[#daf4aa]" />
                  <span>SPACE</span>
               </button>
               <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">
                  TOUCH PAD
               </span>
               {onClose && (
                  <button
                     type="button"
                     onClick={onClose}
                     className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors">
                     Hide Pad
                  </button>
               )}
            </div>

            {/* Right Action Buttons: B & A */}
            <div className="flex items-center gap-2.5 shrink-0">
               <div className="flex flex-col items-center gap-1">
                  <button
                     {...createButtonHandler('Enter', 'Enter')}
                     aria-label="Action Button B"
                     className="w-11 h-11 rounded-full bg-[#18181b] border border-cyan-500/40 text-cyan-400 font-extrabold text-xs active:bg-cyan-400 active:text-zinc-950 active:scale-90 transition-all shadow-[0_0_12px_rgba(34,211,238,0.15)] flex items-center justify-center">
                     B
                  </button>
                  <span className="text-[9px] font-mono text-zinc-500">ENTER</span>
               </div>

               <div className="flex flex-col items-center gap-1">
                  <button
                     {...createButtonHandler(' ', 'Space')}
                     aria-label="Action Button A"
                     className="w-12 h-12 rounded-full bg-[#daf4aa]/15 border border-[#daf4aa]/60 text-[#daf4aa] font-black text-sm active:bg-[#daf4aa] active:text-zinc-950 active:scale-90 transition-all shadow-[0_0_16px_rgba(218,244,170,0.25)] flex items-center justify-center">
                     A
                  </button>
                  <span className="text-[9px] font-mono text-zinc-400 font-bold">FIRE</span>
               </div>
            </div>
         </div>

         {/* Mobile Landscape Wing Layout */}
         <div className="hidden landscape:max-h-[500px]:block select-none touch-none pointer-events-none">
            {/* Left D-pad wing */}
            <div className="fixed bottom-3 left-3 z-[10002] pointer-events-auto p-2 rounded-2xl bg-[#101012]/90 border border-zinc-800/80 backdrop-blur-md shadow-2xl">
               <div className="relative w-24 h-24 flex items-center justify-center">
                  <button
                     {...createButtonHandler('ArrowUp', 'ArrowUp')}
                     aria-label="Up"
                     className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg bg-[#27272a] border border-zinc-700/60 flex items-center justify-center text-zinc-200 active:bg-[#daf4aa] active:text-zinc-950">
                     <ArrowUp size={16} />
                  </button>
                  <button
                     {...createButtonHandler('ArrowDown', 'ArrowDown')}
                     aria-label="Down"
                     className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg bg-[#27272a] border border-zinc-700/60 flex items-center justify-center text-zinc-200 active:bg-[#daf4aa] active:text-zinc-950">
                     <ArrowDown size={16} />
                  </button>
                  <button
                     {...createButtonHandler('ArrowLeft', 'ArrowLeft')}
                     aria-label="Left"
                     className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#27272a] border border-zinc-700/60 flex items-center justify-center text-zinc-200 active:bg-[#daf4aa] active:text-zinc-950">
                     <ArrowLeft size={16} />
                  </button>
                  <button
                     {...createButtonHandler('ArrowRight', 'ArrowRight')}
                     aria-label="Right"
                     className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#27272a] border border-zinc-700/60 flex items-center justify-center text-zinc-200 active:bg-[#daf4aa] active:text-zinc-950">
                     <ArrowRight size={16} />
                  </button>
                  <div className="w-4 h-4 rounded-full bg-[#0f0f11] border border-zinc-800" />
               </div>
            </div>

            {/* Right Action buttons wing */}
            <div className="fixed bottom-3 right-3 z-[10002] pointer-events-auto p-2 rounded-2xl bg-[#101012]/90 border border-zinc-800/80 backdrop-blur-md shadow-2xl flex items-center gap-3">
               <button
                  {...createButtonHandler('Enter', 'Enter')}
                  aria-label="Action B"
                  className="w-11 h-11 rounded-full bg-[#18181b] border border-cyan-500/40 text-cyan-400 font-bold active:bg-cyan-400 active:text-zinc-950 flex items-center justify-center">
                  B
               </button>
               <button
                  {...createButtonHandler(' ', 'Space')}
                  aria-label="Action A"
                  className="w-12 h-12 rounded-full bg-[#daf4aa]/15 border border-[#daf4aa]/60 text-[#daf4aa] font-black active:bg-[#daf4aa] active:text-zinc-950 flex items-center justify-center">
                  A
               </button>
            </div>
         </div>
      </>
   );
}
