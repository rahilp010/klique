import { useEffect, useRef } from 'react';
import { useAnimate } from 'framer-motion';
import KliqueSvg from '../../../assets/klique.svg?raw';

const DRAW_DURATION = 0.55;
const FILL_DURATION = 0.2;
const PAUSE = 1.2;
const RESET_PAUSE = 0.08;

const wait = (seconds) =>
   new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const Loader = ({ text = '', fullscreen = true, className = '' }) => {
   const [scope, animate] = useAnimate();
   const mounted = useRef(false);

   useEffect(() => {
      mounted.current = true;
      let cancelled = false;

      const runAnimation = async () => {
         try {
            // Wait until the inline SVG has actually mounted
            await new Promise(requestAnimationFrame);

            const paths = scope.current?.querySelectorAll('svg path');

            if (!paths?.length) return;

            while (!cancelled && mounted.current && scope.current) {
               // =========================================
               // 1. RESET
               // =========================================
               for (const path of paths) {
                  if (cancelled || !mounted.current) return;

                  await animate(
                     path,
                     {
                        pathLength: 0,
                        fillOpacity: 0,
                        strokeOpacity: 1,
                        opacity: 1,
                     },
                     {
                        duration: 0,
                     },
                  );
               }

               await wait(RESET_PAUSE);

               // =========================================
               // 2. DRAW KLIQUE
               // =========================================
               for (const path of paths) {
                  if (cancelled || !mounted.current) return;

                  // Draw outline
                  await animate(
                     path,
                     {
                        pathLength: 1,
                        strokeOpacity: 1,
                        fillOpacity: 0,
                     },
                     {
                        duration: DRAW_DURATION,
                        ease: 'easeInOut',
                     },
                  );

                  if (cancelled || !mounted.current) return;

                  // Fill logo
                  await animate(
                     path,
                     {
                        fillOpacity: 1,
                        strokeOpacity: 0,
                     },
                     {
                        duration: FILL_DURATION,
                        ease: 'easeOut',
                     },
                  );
               }

               // =========================================
               // 3. HOLD COMPLETE LOGO
               // =========================================
               await wait(PAUSE);
            }
         } catch (error) {
            // Ignore animation errors caused by component unmount
         }
      };

      runAnimation();

      return () => {
         cancelled = true;
         mounted.current = false;
      };
   }, [animate]);

   const containerClasses = fullscreen
      ? 'fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden bg-[#16161b]/90 backdrop-blur-md pointer-events-auto'
      : 'relative flex flex-col items-center justify-center min-h-[220px] w-full overflow-hidden bg-[#16161b]/60 rounded-2xl p-6';

   return (
      <div className={`${containerClasses} ${className}`}>
         {/* Background ambient glow */}
         <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] sm:h-[450px] w-[350px] sm:w-[450px] rounded-full bg-[#24242d] opacity-80 blur-[130px]" />

         {/* Klique Logo */}
         <div
            ref={scope}
            className="relative flex items-center justify-center w-[220px] sm:w-[320px] md:w-[400px] lg:w-[460px]">
            <div
               className="klique-loader-svg w-full flex items-center justify-center"
               dangerouslySetInnerHTML={{
                  __html: KliqueSvg,
               }}
            />
         </div>

         {/* Soft logo glow */}
         <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] sm:w-[360px] md:w-[460px] h-[160px] sm:h-[200px] rounded-full bg-[#daf4aa]/10 blur-[70px]" />

         {/* Status / Loading text */}
         {text && (
            <p className="relative z-10 mt-6 text-sm sm:text-base font-medium text-zinc-300 animate-pulse tracking-wide text-center px-4">
               {text}
            </p>
         )}
      </div>
   );
};

export default Loader;
