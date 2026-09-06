/** Small deterministic string hash → used so "simulated" values (tide phase, etc.)
 * are stable across renders instead of re-randomizing every render. */
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296; // 0..1
}

export function seededRange(seed: string, min: number, max: number): number {
  return min + hashString(seed) * (max - min);
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/** Gaussian-ish preference curve: 100 at `center`, decaying with `width`. */
export function bellScore(x: number, center: number, width: number): number {
  const z = (x - center) / width;
  return clamp(100 * Math.exp(-0.5 * z * z), 0, 100);
}
