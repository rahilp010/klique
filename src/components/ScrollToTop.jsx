import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop ensures that whenever a route navigation occurs,
 * the window scroll position is immediately and cleanly reset to the top (0, 0).
 */
const ScrollToTop = () => {
   const { pathname, search } = useLocation();

   useEffect(() => {
      // Disable browser's automatic scroll restoration to prevent it from jumping to previous positions
      if ('scrollRestoration' in window.history) {
         window.history.scrollRestoration = 'manual';
      }

      const resetScroll = () => {
         try {
            window.scrollTo({
               top: 0,
               left: 0,
               behavior: 'instant',
            });
         } catch {
            window.scrollTo(0, 0);
         }
         if (document.documentElement) {
            document.documentElement.scrollTop = 0;
         }
         if (document.body) {
            document.body.scrollTop = 0;
         }
      };

      // Reset scroll immediately
      resetScroll();

      // Extra frames to handle any microtask / lazy chunk layout shifts
      const rafId = requestAnimationFrame(resetScroll);
      const timerId = setTimeout(resetScroll, 30);

      return () => {
         cancelAnimationFrame(rafId);
         clearTimeout(timerId);
      };
   }, [pathname, search]);

   return null;
};

export default ScrollToTop;
