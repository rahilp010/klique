// ==========================================
// Klique Arcade - Neon Pinball Physics Engine
// Pure mathematical 2D pinball simulation with
// continuous sub-stepping and moving flipper collision
// ==========================================

export const TABLE_WIDTH = 420;
export const TABLE_HEIGHT = 640;

export const BUMPERS = [
   { id: 'b1', x: 150, y: 170, radius: 24, score: 100, color: '#f43f5e' },
   { id: 'b2', x: 270, y: 170, radius: 24, score: 100, color: '#06b6d4' },
   { id: 'b3', x: 210, y: 245, radius: 26, score: 250, color: '#daf4aa' },
];

export const ROLLOVER_LANES = [
   { id: 'r1', x: 140, y: 80, width: 28, height: 16, lit: false, label: 'N' },
   { id: 'r2', x: 210, y: 70, width: 28, height: 16, lit: false, label: 'E' },
   { id: 'r3', x: 280, y: 80, width: 28, height: 16, lit: false, label: 'O' },
];

export const SLINGSHOTS = [
   // Left slingshot triangular barrier
   {
      p1: { x: 90, y: 410 },
      p2: { x: 130, y: 475 },
      p3: { x: 90, y: 475 },
      impulse: 7.5,
      score: 50,
   },
   // Right slingshot triangular barrier
   {
      p1: { x: 330, y: 410 },
      p2: { x: 290, y: 475 },
      p3: { x: 330, y: 475 },
      impulse: 7.5,
      score: 50,
   },
];

// Static boundary walls (line segments)
export const STATIC_WALLS = [
   // Plunger launch channel outer wall (right)
   { x1: 410, y1: 150, x2: 410, y2: 630 },
   // Plunger lane separator
   { x1: 375, y1: 170, x2: 375, y2: 630 },
   // Top arch approximation
   { x1: 410, y1: 150, x2: 395, y2: 90 },
   { x1: 395, y1: 90, x2: 350, y2: 40 },
   { x1: 350, y1: 40, x2: 280, y2: 18 },
   { x1: 280, y1: 18, x2: 140, y2: 18 },
   { x1: 140, y1: 18, x2: 70, y2: 40 },
   { x1: 70, y1: 40, x2: 25, y2: 90 },
   { x1: 25, y1: 90, x2: 10, y2: 150 },
   // Left outer wall
   { x1: 10, y1: 150, x2: 10, y2: 430 },
   // Left drain guide angled wall
   { x1: 10, y1: 430, x2: 70, y2: 505 },
   { x1: 70, y1: 505, x2: 70, y2: 540 },
   { x1: 70, y1: 540, x2: 125, y2: 575 },
   // Right drain guide angled wall
   { x1: 375, y1: 430, x2: 350, y2: 505 },
   { x1: 350, y1: 505, x2: 350, y2: 540 },
   { x1: 350, y1: 540, x2: 295, y2: 575 },
];

export const FLIPPER_CONFIG = {
   left: {
      pivotX: 130,
      pivotY: 575,
      length: 68,
      restAngle: 0.55, // radians (~31 deg down)
      activeAngle: -0.48, // radians (~-27 deg up)
      speed: 0.32,
      thickness: 6,
   },
   right: {
      pivotX: 290,
      pivotY: 575,
      length: 68,
      restAngle: Math.PI - 0.55, // (~149 deg)
      activeAngle: Math.PI + 0.48, // (~207 deg)
      speed: 0.32,
      thickness: 6,
   },
};

export function createInitialPinballState() {
   return {
      ball: {
         x: 392,
         y: 580,
         vx: 0,
         vy: 0,
         radius: 7.5,
         inPlungerLane: true,
         active: true,
      },
      plungerCharge: 0, // 0 to 1
      isChargingPlunger: false,
      leftFlipper: {
         angle: FLIPPER_CONFIG.left.restAngle,
         targetAngle: FLIPPER_CONFIG.left.restAngle,
         angularVelocity: 0,
      },
      rightFlipper: {
         angle: FLIPPER_CONFIG.right.restAngle,
         targetAngle: FLIPPER_CONFIG.right.restAngle,
         angularVelocity: 0,
      },
      score: 0,
      multiplier: 1,
      ballsRemaining: 3,
      gameOver: false,
      rollovers: ROLLOVER_LANES.map((r) => ({ ...r, lit: false })),
      bumperFlashes: {},
      slingshotFlashes: {},
      particles: [],
      combos: 0,
   };
}

// Distance from point to line segment
function closestPointOnSegment(px, py, x1, y1, x2, y2) {
   const dx = x2 - x1;
   const dy = y2 - y1;
   const lenSq = dx * dx + dy * dy;
   if (lenSq === 0) return { x: x1, y: y1, t: 0 };
   let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
   t = Math.max(0, Math.min(1, t));
   return { x: x1 + t * dx, y: y1 + t * dy, t };
}

export function updatePinball(state, inputs, eventsOut) {
   if (state.gameOver) return state;

   let next = { ...state };
   const ball = { ...next.ball };

   // 1. Plunger input handling
   if (inputs.plungerDown && ball.inPlungerLane) {
      next.isChargingPlunger = true;
      next.plungerCharge = Math.min(1, next.plungerCharge + 0.04);
   } else if (next.isChargingPlunger && !inputs.plungerDown && ball.inPlungerLane) {
      // Launch ball
      const launchSpeed = 13 + next.plungerCharge * 12; // 13 - 25 velocity
      ball.vy = -launchSpeed;
      ball.vx = (Math.random() - 0.5) * 0.8;
      next.isChargingPlunger = false;
      next.plungerCharge = 0;
      eventsOut.push({ type: 'launch', speed: launchSpeed });
   }

   // 2. Flipper controls & angular velocities
   const lf = { ...next.leftFlipper };
   const rf = { ...next.rightFlipper };

   lf.targetAngle = inputs.leftFlipper ? FLIPPER_CONFIG.left.activeAngle : FLIPPER_CONFIG.left.restAngle;
   rf.targetAngle = inputs.rightFlipper ? FLIPPER_CONFIG.right.activeAngle : FLIPPER_CONFIG.right.restAngle;

   const prevLeftAngle = lf.angle;
   const prevRightAngle = rf.angle;

   // Move left flipper toward target
   const leftDiff = lf.targetAngle - lf.angle;
   if (Math.abs(leftDiff) < FLIPPER_CONFIG.left.speed) {
      lf.angle = lf.targetAngle;
   } else {
      lf.angle += Math.sign(leftDiff) * FLIPPER_CONFIG.left.speed;
   }
   lf.angularVelocity = lf.angle - prevLeftAngle;

   // Move right flipper toward target
   const rightDiff = rf.targetAngle - rf.angle;
   if (Math.abs(rightDiff) < FLIPPER_CONFIG.right.speed) {
      rf.angle = rf.targetAngle;
   } else {
      rf.angle += Math.sign(rightDiff) * FLIPPER_CONFIG.right.speed;
   }
   rf.angularVelocity = rf.angle - prevRightAngle;

   if (Math.abs(lf.angularVelocity) > 0.05 && inputs.leftFlipper && prevLeftAngle === FLIPPER_CONFIG.left.restAngle) {
      eventsOut.push({ type: 'flipper_up' });
   }
   if (Math.abs(rf.angularVelocity) > 0.05 && inputs.rightFlipper && prevRightAngle === FLIPPER_CONFIG.right.restAngle) {
      eventsOut.push({ type: 'flipper_up' });
   }

   next.leftFlipper = lf;
   next.rightFlipper = rf;

   // 3. Sub-step physics (4 sub-steps for solid collision without tunneling)
   const SUB_STEPS = 4;
   const gravity = 0.16 / SUB_STEPS;
   const friction = Math.pow(0.998, 1 / SUB_STEPS);

   for (let step = 0; step < SUB_STEPS; step++) {
      // Plunger lane check
      if (ball.inPlungerLane) {
         if (ball.y < 120) {
            ball.inPlungerLane = false; // exited plunger lane into top arch!
            ball.vx = -4.5;
         }
      }

      // Gravity & air resistance
      ball.vy += gravity;
      ball.vx *= friction;
      ball.vy *= friction;

      // Limit max terminal velocity
      const maxSpd = 20;
      const curSpd = Math.hypot(ball.vx, ball.vy);
      if (curSpd > maxSpd) {
         ball.vx = (ball.vx / curSpd) * maxSpd;
         ball.vy = (ball.vy / curSpd) * maxSpd;
      }

      // Position update
      ball.x += ball.vx / SUB_STEPS;
      ball.y += ball.vy / SUB_STEPS;

      // Check collision with static walls
      for (const w of STATIC_WALLS) {
         const cp = closestPointOnSegment(ball.x, ball.y, w.x1, w.y1, w.x2, w.y2);
         const dist = Math.hypot(ball.x - cp.x, ball.y - cp.y);
         if (dist < ball.radius) {
            const nx = dist === 0 ? 0 : (ball.x - cp.x) / dist;
            const ny = dist === 0 ? -1 : (ball.y - cp.y) / dist;
            // Push out
            const overlap = ball.radius - dist;
            ball.x += nx * overlap;
            ball.y += ny * overlap;

            // Reflect velocity with restitution
            const dot = ball.vx * nx + ball.vy * ny;
            if (dot < 0) {
               const restitution = 0.65;
               ball.vx -= (1 + restitution) * dot * nx;
               ball.vy -= (1 + restitution) * dot * ny;
               if (Math.abs(dot) > 1.5) {
                  eventsOut.push({ type: 'wall_hit' });
               }
            }
         }
      }

      // Check collision with bumpers
      for (const b of BUMPERS) {
         const dist = Math.hypot(ball.x - b.x, ball.y - b.y);
         const minD = ball.radius + b.radius;
         if (dist < minD) {
            const nx = (ball.x - b.x) / dist;
            const ny = (ball.y - b.y) / dist;
            const overlap = minD - dist;
            ball.x += nx * overlap;
            ball.y += ny * overlap;

            // Powerful bumper bounce
            const bounceSpd = 12.5;
            ball.vx = nx * bounceSpd + (Math.random() - 0.5) * 1.5;
            ball.vy = ny * bounceSpd;

            next.score += b.score * next.multiplier;
            next.bumperFlashes[b.id] = 12; // frame flash countdown
            eventsOut.push({ type: 'bumper_hit', bumper: b });
         }
      }

      // Check collision with slingshots
      SLINGSHOTS.forEach((sling, idx) => {
         // Segment p1 to p2 is the active rubber bounce face
         const cp = closestPointOnSegment(ball.x, ball.y, sling.p1.x, sling.p1.y, sling.p2.x, sling.p2.y);
         const dist = Math.hypot(ball.x - cp.x, ball.y - cp.y);
         if (dist < ball.radius + 3) {
            const dx = sling.p2.x - sling.p1.x;
            const dy = sling.p2.y - sling.p1.y;
            const segLen = Math.hypot(dx, dy);
            // Inward normal
            const nx = (idx === 0 ? dy : -dy) / segLen;
            const ny = (idx === 0 ? -dx : dx) / segLen;

            ball.x = cp.x + nx * (ball.radius + 4);
            ball.y = cp.y + ny * (ball.radius + 4);

            ball.vx = nx * sling.impulse * 1.5;
            ball.vy = ny * sling.impulse * 1.5;

            next.score += sling.score * next.multiplier;
            next.slingshotFlashes[idx] = 10;
            eventsOut.push({ type: 'slingshot_hit' });
         }
      });

      // Check collision with Left Flipper
      collideFlipper(ball, FLIPPER_CONFIG.left, lf, eventsOut);

      // Check collision with Right Flipper
      collideFlipper(ball, FLIPPER_CONFIG.right, rf, eventsOut);
   }

   // 4. Check Rollover Lanes
   const rollovers = next.rollovers.map((lane) => {
      if (
         !lane.lit &&
         ball.x >= lane.x - lane.width / 2 &&
         ball.x <= lane.x + lane.width / 2 &&
         ball.y >= lane.y - lane.height / 2 &&
         ball.y <= lane.y + lane.height / 2
      ) {
         next.score += 500 * next.multiplier;
         eventsOut.push({ type: 'rollover', lane: lane.label });
         return { ...lane, lit: true };
      }
      return lane;
   });

   // If all 3 rollovers lit, increase multiplier!
   if (rollovers.every((r) => r.lit)) {
      next.multiplier = Math.min(5, next.multiplier + 1);
      eventsOut.push({ type: 'multiplier_up', multiplier: next.multiplier });
      next.rollovers = rollovers.map((r) => ({ ...r, lit: false }));
   } else {
      next.rollovers = rollovers;
   }

   // 5. Decrement visual flashes
   const bFlashes = {};
   for (const k in next.bumperFlashes) {
      if (next.bumperFlashes[k] > 1) bFlashes[k] = next.bumperFlashes[k] - 1;
   }
   next.bumperFlashes = bFlashes;

   const sFlashes = {};
   for (const k in next.slingshotFlashes) {
      if (next.slingshotFlashes[k] > 1) sFlashes[k] = next.slingshotFlashes[k] - 1;
   }
   next.slingshotFlashes = sFlashes;

   // 6. Check Ball Drain (bottom edge)
   if (ball.y > TABLE_HEIGHT + 20) {
      next.ballsRemaining -= 1;
      eventsOut.push({ type: 'drain', ballsRemaining: next.ballsRemaining });
      if (next.ballsRemaining <= 0) {
         next.gameOver = true;
         eventsOut.push({ type: 'game_over', finalScore: next.score });
      } else {
         // Reset ball in plunger lane
         ball.x = 392;
         ball.y = 580;
         ball.vx = 0;
         ball.vy = 0;
         ball.inPlungerLane = true;
      }
   }

   next.ball = ball;
   return next;
}

// Helper: Flipper-ball physics calculation
function collideFlipper(ball, config, flipper, eventsOut) {
   const tipX = config.pivotX + Math.cos(flipper.angle) * config.length;
   const tipY = config.pivotY + Math.sin(flipper.angle) * config.length;

   const cp = closestPointOnSegment(ball.x, ball.y, config.pivotX, config.pivotY, tipX, tipY);
   const dist = Math.hypot(ball.x - cp.x, ball.y - cp.y);
   const minDist = ball.radius + config.thickness;

   if (dist < minDist) {
      const nx = dist === 0 ? 0 : (ball.x - cp.x) / dist;
      const ny = dist === 0 ? -1 : (ball.y - cp.y) / dist;

      // Push ball out of flipper surface
      const overlap = minDist - dist;
      ball.x += nx * overlap;
      ball.y += ny * overlap;

      // Linear velocity of flipper at impact point: v = omega * r
      const rx = cp.x - config.pivotX;
      const ry = cp.y - config.pivotY;
      const fvx = -flipper.angularVelocity * ry * 40;
      const fvy = flipper.angularVelocity * rx * 40;

      // Relative velocity
      const rvx = ball.vx - fvx;
      const rvy = ball.vy - fvy;
      const dot = rvx * nx + rvy * ny;

      if (dot < 0) {
         const restitution = 0.55;
         let newRvx = rvx - (1 + restitution) * dot * nx;
         let newRvy = rvy - (1 + restitution) * dot * ny;

         // Impart flipper motion
         ball.vx = newRvx + fvx;
         ball.vy = newRvy + fvy;

         // Add upward kick if flipper was swinging up
         if (Math.abs(flipper.angularVelocity) > 0.05) {
            ball.vy -= Math.abs(flipper.angularVelocity) * 35;
            eventsOut.push({ type: 'flipper_hit' });
         }
      }
   }
}

