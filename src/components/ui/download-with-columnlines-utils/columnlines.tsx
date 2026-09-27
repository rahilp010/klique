import React from 'react';

export interface ColumnLinesProps {
   columnWidth?: number;
   columnCount?: number;
   radialFadeStart?: number;
   radialFadeEnd?: number;
   className?: string;
   children?: React.ReactNode;
}

export function ColumnLines({
   columnWidth = 80,
   columnCount = 14,
   radialFadeStart = 15,
   radialFadeEnd = 90,
   className = '',
   children,
}: ColumnLinesProps) {
   const totalWidth = columnWidth * columnCount;

   return (
      <div className={`relative overflow-hidden ${className}`}>
         {/* =========================================
          COLUMN GRID
      ========================================= */}
         <div
            className="pointer-events-none absolute inset-0 z-0 flex justify-center"
            style={{
               maskImage: `radial-gradient(
            ellipse at center,
            black ${radialFadeStart}%,
            rgba(0, 0, 0, 0.85) 45%,
            transparent ${radialFadeEnd}%
          )`,
               WebkitMaskImage: `radial-gradient(
            ellipse at center,
            black ${radialFadeStart}%,
            rgba(0, 0, 0, 0.85) 45%,
            transparent ${radialFadeEnd}%
          )`,
            }}>
            <div
               className="relative h-full"
               style={{
                  width: `${totalWidth}px`,
                  maxWidth: '100%',
               }}>
               {/* =========================================
              ALL 14 LINES
          ========================================= */}
               {Array.from({ length: columnCount }).map((_, index) => {
                  // Different timing for every line
                  const duration = 4.5 + ((index * 1.17) % 3);
                  const delay = -((index * 1.83) % 7);

                  return (
                     <div
                        key={index}
                        className="
                  absolute
                  top-0
                  bottom-0
                  w-px
                  border-l
                  border-dashed
                  border-zinc-300/65
                  dark:border-zinc-700/65
                "
                        style={{
                           left: `${index * columnWidth}px`,
                        }}>
                        {/* =========================================
                    MOVING GLOW
                ========================================= */}
                        <span
                           className="column-line-glow"
                           style={{
                              animationDuration: `${duration}s`,
                              animationDelay: `${delay}s`,
                           }}
                        />
                     </div>
                  );
               })}
            </div>
         </div>

         {/* =========================================
          PAGE CONTENT
      ========================================= */}
         <div className="relative z-10">{children}</div>
      </div>
   );
}
