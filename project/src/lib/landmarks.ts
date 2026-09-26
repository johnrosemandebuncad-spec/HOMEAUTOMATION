export interface Landmark {
  x: number;
  y: number;
  z: number;
}

export const HAND_CONNECTIONS: Array<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [5, 9],
  [9, 13],
  [13, 17],
];

export function dist(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.hypot(dx, dy, dz);
}

export function dist2(a: Landmark, b: Landmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Wrist-relative, palm-scaled 63-d vector (MediaPipe × Random Forest pipeline). */
export function extractFeatures(lm: Landmark[]): number[] {
  const wrist = lm[0];
  const scale = dist(wrist, lm[9]) || 1;
  const out: number[] = [];
  for (const p of lm) {
    out.push((p.x - wrist.x) / scale, (p.y - wrist.y) / scale, (p.z - wrist.z) / scale);
  }
  return out;
}

export function euclid(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    s += d * d;
  }
  return Math.sqrt(s);
}

export function lerpLandmarks(a: Landmark[], b: Landmark[], t: number): Landmark[] {
  const n = Math.min(a.length, b.length);
  const out: Landmark[] = [];
  const u = Math.max(0, Math.min(1, t));
  for (let i = 0; i < n; i++) {
    const p = a[i]!;
    const q = b[i]!;
    out.push({
      x: p.x + (q.x - p.x) * u,
      y: p.y + (q.y - p.y) * u,
      z: p.z + (q.z - p.z) * u,
    });
  }
  return out;
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
