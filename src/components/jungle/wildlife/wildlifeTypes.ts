/**
 * Procedural Biomechanical Wildlife Types & Kinematic Math Helpers
 */

export interface WildlifeProximitySignal {
  proximityFactor: number; // 0 (far) to 1 (close)
  phase: 'idle' | 'alert' | 'settle';
  distancePx: number;
  velocity: number;
  lookAngleDeg?: number;
  isStopped?: boolean;
  isAtStop?: boolean;
}

export interface WildlifeCanvasController {
  onJeepUpdate: (signal: WildlifeProximitySignal) => void;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

export function quinticEase(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export interface IKSolution {
  jx: number; // Joint position X
  jy: number; // Joint position Y
  ex: number; // End effector X
  ey: number; // End effector Y
}

/**
 * Exact 2-Bone Analytical Inverse Kinematics Solver (right-facing space: +X forward, +Y down)
 * bendDir = -1 -> bends backward (-X) e.g. front elbow, carpal knee
 * bendDir = +1 -> bends forward (+X) e.g. hind stifle / knee
 */
export function solveTwoBoneIK(
  ax: number,
  ay: number,
  tx: number,
  ty: number,
  len1: number,
  len2: number,
  bendDir: number,
): IKSolution {
  const dx = tx - ax;
  const dy = ty - ay;
  const maxReach = (len1 + len2) * 0.985;
  const minReach = Math.abs(len1 - len2) + 2;
  const dist = clamp(Math.hypot(dx, dy), minReach, maxReach);

  const baseAngle = Math.atan2(dy, dx);
  const cosAlpha = clamp((len1 * len1 + dist * dist - len2 * len2) / (2 * len1 * dist), -1, 1);
  const alpha = Math.acos(cosAlpha);
  const jointAngle = baseAngle + bendDir * alpha;

  return {
    jx: ax + Math.cos(jointAngle) * len1,
    jy: ay + Math.sin(jointAngle) * len1,
    ex: ax + Math.cos(baseAngle) * dist,
    ey: ay + Math.sin(baseAngle) * dist,
  };
}

