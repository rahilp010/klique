/**
 * Pomodoro Timer Utilities & Web Audio Synthesizer
 * 100% Client-side sound synthesis and timer calculation routines.
 */

export const POMODORO_MODES = {
   WORK: 'work',
   SHORT_BREAK: 'short_break',
   LONG_BREAK: 'long_break',
};

export const POMODORO_PRESETS = [
   {
      id: 'classic',
      name: 'Classic 25 / 5',
      description: 'Standard Pomodoro technique for balanced focus and quick refresh.',
      work: 25,
      shortBreak: 5,
      longBreak: 15,
      longInterval: 4,
   },
   {
      id: 'deep-work',
      name: 'Deep Work 50 / 10',
      description: 'Extended uninterrupted flow sessions for complex problem solving.',
      work: 50,
      shortBreak: 10,
      longBreak: 25,
      longInterval: 4,
   },
   {
      id: 'ultradian',
      name: 'Ultradian 90 / 20',
      description: 'Matches the human body natural 90-minute ultradian rhythm cycle.',
      work: 90,
      shortBreak: 20,
      longBreak: 30,
      longInterval: 3,
   },
   {
      id: 'quick-sprint',
      name: 'Sprint 15 / 3',
      description: 'Rapid focused bursts to tackle quick tasks and overcome procrastination.',
      work: 15,
      shortBreak: 3,
      longBreak: 10,
      longInterval: 4,
   },
];

/**
 * Format total seconds into MM:SS string
 */
export const formatPomodoroTime = (totalSeconds) => {
   const safe = Math.max(0, Math.floor(totalSeconds));
   const mins = Math.floor(safe / 60);
   const secs = safe % 60;
   return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Synthesizes pure Web Audio sine wave melodic chimes without any external audio assets.
 */
export const playPomodoroChime = (type = 'work') => {
   try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      if (type === 'work') {
         // Work session complete chime: Ascending cheerful triad (C5 -> E5 -> G5)
         const freqs = [523.25, 659.25, 783.99, 1046.5];
         freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            gain.gain.setValueAtTime(0, now + idx * 0.12);
            gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.12 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.45);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.5);
         });
      } else if (type === 'break') {
         // Break finished chime: Returning gentle descending tone (G5 -> E5 -> C5)
         const freqs = [783.99, 659.25, 523.25];
         freqs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.14);
            gain.gain.setValueAtTime(0, now + idx * 0.14);
            gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.14 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + idx * 0.14);
            osc.stop(now + idx * 0.14 + 0.55);
         });
      } else {
         // Soft UI click
         const osc = ctx.createOscillator();
         const gain = ctx.createGain();
         osc.type = 'sine';
         osc.frequency.setValueAtTime(800, now);
         gain.gain.setValueAtTime(0.08, now);
         gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
         osc.connect(gain);
         gain.connect(ctx.destination);
         osc.start(now);
         osc.stop(now + 0.06);
      }
   } catch {
      // AudioContext could be blocked by browser policy until user gesture
   }
};

/**
 * Triggers native system browser notification with graceful fallback
 */
export const sendBrowserNotification = (title, options = {}) => {
   if (!('Notification' in window)) return;
   if (Notification.permission === 'granted') {
      try {
         new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            silent: false,
            ...options,
         });
      } catch {
         // Ignore notification instantiation errors
      }
   }
};

