import { useState, useEffect, useCallback } from 'react';
import { isFavorite, toggleFavorite } from '../lib/storage';
import { trackFavoriteToggle } from '../lib/analytics';

export const useFavorites = (toolId) => {
   const [favorited, setFavorited] = useState(() => (toolId ? isFavorite(toolId) : false));

   useEffect(() => {
      if (!toolId) return;
      setFavorited(isFavorite(toolId));

      const handleStorageUpdate = (e) => {
         if (e.detail?.toolId === toolId) {
            setFavorited(e.detail.isFavorited);
         }
      };

      window.addEventListener('klique:favorites_updated', handleStorageUpdate);
      return () => {
         window.removeEventListener('klique:favorites_updated', handleStorageUpdate);
      };
   }, [toolId]);

   const toggle = useCallback(() => {
      if (!toolId) return false;
      const nextState = toggleFavorite(toolId);
      setFavorited(nextState);
      trackFavoriteToggle(toolId, nextState);
      return nextState;
   }, [toolId]);

   return { favorited, toggle };
};

