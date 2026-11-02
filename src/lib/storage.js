/**
 * Klique Storage Utilities
 * Safe browser localStorage management for favorites, recently used tools, and user preferences.
 */

const STORAGE_KEYS = {
   FAVORITES: 'klique:favorites',
   RECENT: 'klique:recent_tools',
   PREFERENCES: 'klique:preferences',
};

const safeGetJSON = (key, fallback = null) => {
   if (typeof window === 'undefined') return fallback;
   try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
   } catch (e) {
      console.warn(`[Storage] Failed to read ${key}:`, e);
      return fallback;
   }
};

const safeSetJSON = (key, data) => {
   if (typeof window === 'undefined') return;
   try {
      localStorage.setItem(key, JSON.stringify(data));
   } catch (e) {
      console.warn(`[Storage] Failed to save ${key}:`, e);
   }
};

// ==========================================
// FAVORITES
// ==========================================

export const getFavorites = () => safeGetJSON(STORAGE_KEYS.FAVORITES, []);

export const isFavorite = (toolId) => {
   const favs = getFavorites();
   return favs.includes(toolId);
};

export const toggleFavorite = (toolId) => {
   const favs = getFavorites();
   let updated;
   let isFavorited = false;
   if (favs.includes(toolId)) {
      updated = favs.filter((id) => id !== toolId);
      isFavorited = false;
   } else {
      updated = [...favs, toolId];
      isFavorited = true;
   }
   safeSetJSON(STORAGE_KEYS.FAVORITES, updated);
   if (typeof window !== 'undefined') {
      window.dispatchEvent(
         new CustomEvent('klique:favorites_updated', {
            detail: { favorites: updated, toolId, isFavorited },
         })
      );
   }
   return isFavorited;
};

// ==========================================
// RECENT TOOLS
// ==========================================

export const getRecentTools = (limit = 6) => {
   const recent = safeGetJSON(STORAGE_KEYS.RECENT, []);
   return recent.slice(0, limit);
};

export const addRecentTool = (toolId) => {
   if (!toolId) return;
   const recent = safeGetJSON(STORAGE_KEYS.RECENT, []);
   const filtered = recent.filter((id) => id !== toolId);
   const updated = [toolId, ...filtered].slice(0, 10);
   safeSetJSON(STORAGE_KEYS.RECENT, updated);
   if (typeof window !== 'undefined') {
      window.dispatchEvent(
         new CustomEvent('klique:recent_updated', { detail: { recent: updated } })
      );
   }
};

export const clearRecentTools = () => {
   safeSetJSON(STORAGE_KEYS.RECENT, []);
};

// ==========================================
// USER PREFERENCES
// ==========================================

export const getPreference = (key, defaultValue = null) => {
   const prefs = safeGetJSON(STORAGE_KEYS.PREFERENCES, {});
   return prefs[key] !== undefined ? prefs[key] : defaultValue;
};

export const setPreference = (key, value) => {
   const prefs = safeGetJSON(STORAGE_KEYS.PREFERENCES, {});
   prefs[key] = value;
   safeSetJSON(STORAGE_KEYS.PREFERENCES, prefs);
};

