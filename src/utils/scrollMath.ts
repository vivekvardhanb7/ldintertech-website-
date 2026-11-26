export interface CameraWaypoint {
  camX: number;
  camY: number;
  camZ: number;
  rotY: number;
  glowIntensity: number;
}

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function lerpNumber(a: number, b: number, t: number): number {
  const clamped = clamp01(t);
  return a + (b - a) * clamped;
}

export function smoothstep01(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/**
 * Computes deterministic 3D hero machine camera & chassis state from scroll progress [0..1].
 * Keeps camera approach, machine rotation, and internal shelf glow smooth and bounded.
 */
export function computeHeroScrollPose(progress: number): CameraWaypoint {
  const p = smoothstep01(progress);
  return {
    camX: lerpNumber(0.35, -0.15, p),
    camY: lerpNumber(1.38, 1.24, p),
    camZ: lerpNumber(4.4, 3.05, p),
    rotY: lerpNumber(-0.34, 0.36, p),
    glowIntensity: lerpNumber(0.85, 1.85, p),
  };
}

/**
 * Converts geographic coordinates (lat, lon in degrees) to 3D Cartesian coordinates
 * on a sphere of given radius (matching Three.js Y-up right-handed convention).
 */
export function latLonToCartesian(
  latDeg: number,
  lonDeg: number,
  radius: number
): { x: number; y: number; z: number } {
  const phi = (90 - latDeg) * (Math.PI / 180);
  const theta = (lonDeg + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return { x, y, z };
}
