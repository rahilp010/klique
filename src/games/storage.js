/**
 * Klique Arcade Storage Helper
 * Provides namespaced, schema-versioned, and validated storage for Arcade.
 * Gracefully falls back to memory if localStorage is blocked, full, or malformed.
 */

const STORAGE_KEYS = {
   SETTINGS: 'klique:arcade:settings',
   HIGH_SCORES: 'klique:arcade:high-scores',
   RECENTLY_PLAYED: 'klique:arcade:recently-played',
};

const CURRENT_VERSION = 1;

// In-memory fallback if localStorage is disabled or throws
const memoryStorage = {
   settings: { soundEnabled: true },
   highScores: {
      version: CURRENT_VERSION,
      scores: {},
   },
   recentlyPlayed: [],
};

const safeGetItem = (key) => {
   if (typeof window === 'undefined') return null;
   try {
      return window.localStorage.getItem(key);
   } catch (e) {
      console.warn(`[Arcade Storage] Read error for ${key}:`, e);
      return null;
   }
};

const safeSetItem = (key, value) => {
   if (typeof window === 'undefined') return;
   try {
      window.localStorage.setItem(key, value);
   } catch (e) {
      console.warn(`[Arcade Storage] Write error for ${key}:`, e);
   }
};

/* -------------------------------------------------------------------------- */
/* Settings                                                                   */
/* -------------------------------------------------------------------------- */

export const getArcadeSettings = () => {
   const raw = safeGetItem(STORAGE_KEYS.SETTINGS);
   if (!raw) return memoryStorage.settings;
   try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
         return {
            soundEnabled: parsed.soundEnabled ?? true,
         };
      }
   } catch (e) {
      console.warn('[Arcade Storage] Malformed settings JSON, using defaults', e);
   }
   return memoryStorage.settings;
};

export const saveArcadeSettings = (settings) => {
   memoryStorage.settings = { ...memoryStorage.settings, ...settings };
   safeSetItem(STORAGE_KEYS.SETTINGS, JSON.stringify(memoryStorage.settings));

   if (typeof window !== 'undefined') {
      window.dispatchEvent(
         new CustomEvent('klique:arcade:settings_updated', {
            detail: memoryStorage.settings,
         })
      );
   }
};

/* -------------------------------------------------------------------------- */
/* High Scores                                                                */
/* -------------------------------------------------------------------------- */

export const getHighScores = () => {
   const raw = safeGetItem(STORAGE_KEYS.HIGH_SCORES);
   if (!raw) return memoryStorage.highScores.scores;
   try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.scores) {
         return parsed.scores;
      }
   } catch (e) {
      console.warn('[Arcade Storage] Malformed high scores JSON, using fallback', e);
   }
   return memoryStorage.highScores.scores;
};

export const getGameHighScore = (gameId) => {
   const scores = getHighScores();
   return scores[gameId] ?? null;
};

export const saveGameHighScore = (gameId, scoreData) => {
   const currentScores = getHighScores();
   const updated = {
      version: CURRENT_VERSION,
      scores: {
         ...currentScores,
         [gameId]: scoreData,
      },
   };
   memoryStorage.highScores = updated;
   safeSetItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(updated));

   if (typeof window !== 'undefined') {
      window.dispatchEvent(
         new CustomEvent('klique:arcade:highscore_updated', {
            detail: { gameId, scoreData },
         })
      );
   }
};

/* -------------------------------------------------------------------------- */
/* Recently Played                                                            */
/* -------------------------------------------------------------------------- */

export const getRecentlyPlayed = () => {
   const raw = safeGetItem(STORAGE_KEYS.RECENTLY_PLAYED);
   if (!raw) return memoryStorage.recentlyPlayed;
   try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
         return parsed.slice(0, 5);
      }
   } catch (e) {
      console.warn('[Arcade Storage] Malformed recently played JSON', e);
   }
   return memoryStorage.recentlyPlayed;
};

export const recordRecentlyPlayed = (gameId) => {
   if (!gameId) return;
   const recents = getRecentlyPlayed();
   const filtered = recents.filter((id) => id !== gameId);
   const updated = [gameId, ...filtered].slice(0, 5);
   memoryStorage.recentlyPlayed = updated;
   safeSetItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(updated));

   if (typeof window !== 'undefined') {
      window.dispatchEvent(
         new CustomEvent('klique:arcade:recent_updated', {
            detail: { recentlyPlayed: updated },
         })
      );
   }
};

