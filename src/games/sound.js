/**
 * Klique Arcade Web Audio Synthesizer
 * Generates lightweight, crisp audio cues using the browser's native Web Audio API.
 * Zero external MP3/WAV file downloads, zero network latency.
 */

import { getArcadeSettings } from './storage';

let audioCtx = null;

const getAudioContext = () => {
   if (typeof window === 'undefined') return null;
   if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
         audioCtx = new AudioContextClass();
      }
   }
   if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
   }
   return audioCtx;
};

export const playTone = (freq = 440, type = 'sine', duration = 0.1, gainVal = 0.1) => {
   const settings = getArcadeSettings();
   if (!settings.soundEnabled) return;

   const ctx = getAudioContext();
   if (!ctx) return;

   try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
   } catch (e) {
      // Audio autoplay policy or device audio disabled
   }
};

export const arcadeSounds = {
   move: () => playTone(320, 'triangle', 0.05, 0.04),
   eat: () => {
      playTone(587.33, 'sine', 0.08, 0.08);
      setTimeout(() => playTone(880, 'sine', 0.1, 0.08), 50);
   },
   merge: () => {
      playTone(440, 'triangle', 0.08, 0.07);
      setTimeout(() => playTone(659.25, 'triangle', 0.12, 0.07), 60);
   },
   flip: () => playTone(480, 'sine', 0.04, 0.05),
   match: () => {
      playTone(523.25, 'sine', 0.09, 0.08); // C5
      setTimeout(() => playTone(659.25, 'sine', 0.09, 0.08), 80); // E5
      setTimeout(() => playTone(783.99, 'sine', 0.14, 0.08), 160); // G5
   },
   wrong: () => {
      playTone(280, 'sawtooth', 0.12, 0.05);
      setTimeout(() => playTone(220, 'sawtooth', 0.18, 0.05), 100);
   },
   win: () => {
      playTone(523.25, 'triangle', 0.1, 0.1);
      setTimeout(() => playTone(659.25, 'triangle', 0.1, 0.1), 100);
      setTimeout(() => playTone(783.99, 'triangle', 0.1, 0.1), 200);
      setTimeout(() => playTone(1046.5, 'triangle', 0.25, 0.12), 300);
   },
   gameOver: () => {
      playTone(392, 'sawtooth', 0.15, 0.06);
      setTimeout(() => playTone(311.13, 'sawtooth', 0.15, 0.06), 150);
      setTimeout(() => playTone(246.94, 'sawtooth', 0.25, 0.06), 300);
   },
   click: () => playTone(600, 'sine', 0.03, 0.04),
   go: () => playTone(880, 'sine', 0.12, 0.1),
};

