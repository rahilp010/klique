import { useEffect, useRef } from 'react';
import { motion, useAnimate } from 'framer-motion';

const LETTERS = [
   {
      id: 'k',
      paths: [
         'M 566 361 L 566 966 C 566 990.3 585.7 1010 610 1010 C 634.3 1010 654 990.3 654 966 L 654 361 C 654 336.7 634.3 317 610 317 C 585.7 317 566 336.7 566 361 z',
         'M 1076.16 324.03 L 606.16 627.03 C 585.74 640.19 579.87 667.42 593.03 687.84 C 606.19 708.26 633.42 714.13 653.84 700.97 L 1123.84 397.97 C 1144.26 384.81 1150.13 357.58 1136.97 337.16 C 1123.81 316.74 1096.58 310.87 1076.16 324.03 z',
         'M 755.06 587.74 L 1065.06 992.74 C 1079.83 1012.04 1107.44 1015.71 1126.74 1000.94 C 1146.04 986.17 1149.71 958.56 1134.94 939.26 L 825.06 534.26 C 810.29 514.96 782.56 511.29 763.26 526.06 C 743.96 540.83 740.29 568.44 755.06 587.74 z',
      ],
   },
   {
      id: 'l',
      paths: ['M 205 20 L 205 180', 'M 205 180 L 250 180'],
   },
   {
      id: 'i',
      paths: ['M 305 70 L 305 180', 'M 305 25 L 305 25'],
   },
   {
      id: 'q',
      paths: [
         'M 425 75 C 425 42 450 25 480 25 C 515 25 535 50 535 90 L 535 125 C 535 160 515 180 480 180 C 445 180 425 160 425 125 Z',
         'M 505 145 L 555 190',
      ],
   },
   {
      id: 'u',
      paths: [
         'M 605 70 L 605 130 C 605 165 625 180 655 180 C 685 180 705 165 705 130 L 705 70',
      ],
   },
   {
      id: 'e',
      paths: [
         'M 780 125 L 890 125 C 890 92 875 70 840 70 C 805 70 780 95 780 130 C 780 165 805 180 840 180 C 865 180 882 172 895 158',
      ],
   },
];

const DRAW_DURATION = 0.28;
const FILL_DURATION = 0.12;
const LETTER_PAUSE = 0.03;
const RESET_PAUSE = 0.35;

const wait = (seconds) =>
   new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const Loader = () => {
   const [scope, animate] = useAnimate();
   const mounted = useRef(false);

   useEffect(() => {
      mounted.current = true;
      let cancelled = false;

      const runAnimation = async () => {
         try {
            while (!cancelled && mounted.current && scope.current) {
               // Reset every Klique path.
               for (const letter of LETTERS) {
                  if (cancelled || !mounted.current || !scope.current) return;

                  await animate(
                     `[data-letter="${letter.id}"]`,
                     {
                        pathLength: 0,
                        fillOpacity: 0,
                        strokeOpacity: 1,
                        opacity: 1,
                     },
                     { duration: 0 },
                  );
               }

               await wait(RESET_PAUSE);

               // Draw K -> L -> I -> Q -> U -> E.
               for (const letter of LETTERS) {
                  if (cancelled || !mounted.current || !scope.current) return;

                  const selector = `[data-letter="${letter.id}"]`;

                  await animate(
                     selector,
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

                  if (cancelled || !mounted.current || !scope.current) return;

                  await animate(
                     selector,
                     {
                        fillOpacity: 1,
                        strokeOpacity: 0,
                     },
                     {
                        duration: FILL_DURATION,
                        ease: 'easeOut',
                     },
                  );

                  await wait(LETTER_PAUSE);
               }

               await wait(0.8);
            }
         } catch {
            // Ignore animation errors caused by component unmount.
         }
      };

      runAnimation();

      return () => {
         cancelled = true;
         mounted.current = false;
      };
   }, [animate]);

   return (
      <div className="fixed inset-0 z-[99999] flex min-h-[100dvh] w-screen items-center justify-center overflow-hidden bg-[#16161b]">
         {/* Soft background glow */}
         <div className="absolute left-[-15%] top-[-15%] h-[70%] w-[60%] rounded-full bg-[#24242d] opacity-80 blur-[150px]" />

         <div
            ref={scope}
            className="relative w-[250px] sm:w-[300px] md:w-[390px]">
            <svg
               viewBox="0 0 940 210"
               xmlns="http://www.w3.org/2000/svg"
               className="h-auto w-full overflow-visible">
               {LETTERS.map((letter) => (
                  <g key={letter.id}>
                     {letter.paths.map((d, index) => (
                        <motion.path
                           key={`${letter.id}-${index}`}
                           data-letter={letter.id}
                           d={d}
                           fill="none"
                           stroke="#daf4aa"
                           strokeWidth="9"
                           strokeLinejoin="round"
                           strokeLinecap="round"
                           vectorEffect="non-scaling-stroke"
                           initial={{
                              pathLength: 0,
                              fillOpacity: 0,
                              strokeOpacity: 1,
                              opacity: 1,
                           }}
                        />
                     ))}
                  </g>
               ))}
            </svg>
         </div>
      </div>
   );
};

export default Loader;
