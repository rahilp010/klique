/**
 * Pure Game Logic for Retro Pong
 * Paddle speeds, ball angle deflection, and boundary bounces.
 */

export const COURT_WIDTH = 440;
export const COURT_HEIGHT = 320;

export const PADDLE_W = 10;
export const PADDLE_H = 64;
export const BALL_SIZE = 8;
export const WINNING_SCORE = 7;

export const createInitialState = () => ({
   p1: { y: (COURT_HEIGHT - PADDLE_H) / 2, score: 0 },
   p2: { y: (COURT_HEIGHT - PADDLE_H) / 2, score: 0 },
   ball: {
      x: COURT_WIDTH / 2,
      y: COURT_HEIGHT / 2,
      vx: (Math.random() > 0.5 ? 1 : -1) * 3.5,
      vy: (Math.random() * 2 - 1) * 2.5,
   },
});

