/**
 * Pure Game Logic for Neon Dash (Flappy Jump)
 * Orb physics, obstacle pillar generation, and collision detection.
 */

export const CANVAS_WIDTH = 380;
export const CANVAS_HEIGHT = 460;

export const ORB_RADIUS = 9;
export const GRAVITY = 0.28;
export const JUMP_VELOCITY = -5.4;

export const PILLAR_WIDTH = 52;
export const PILLAR_GAP = 118;
export const PILLAR_SPEED = 2.4;

export const checkOrbCollision = (orb, pillars) => {
   // Top / Bottom floor collision
   if (orb.y - ORB_RADIUS <= 0 || orb.y + ORB_RADIUS >= CANVAS_HEIGHT) {
      return true;
   }

   // Pillar box collision
   for (const p of pillars) {
      if (
         orb.x + ORB_RADIUS >= p.x &&
         orb.x - ORB_RADIUS <= p.x + PILLAR_WIDTH
      ) {
         // Check upper pillar
         if (orb.y - ORB_RADIUS <= p.topHeight) {
            return true;
         }
         // Check lower pillar
         if (orb.y + ORB_RADIUS >= p.topHeight + PILLAR_GAP) {
            return true;
         }
      }
   }
   return false;
};

