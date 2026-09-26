import { GESTURE_IDS, type GestureId } from "./gestures";
import { dist, dist2, euclid, extractFeatures, type Landmark } from "./landmarks";

export interface FingerState {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
  margins: {
    thumb: number;
    index: number;
    middle: number;
    ring: number;
    pinky: number;
  };
}

export interface Classification {
  gesture: GestureId | null;
  confidence: number;
  fingers: FingerState;
  source: "geometry" | "knn" | "none";
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function fingerOpen(lm: Landmark[], tip: number, pip: number, mcp: number): { open: boolean; margin: number } {
  const wrist = lm[0]!;
  const dTip = dist(lm[tip]!, wrist);
  const dPip = dist(lm[pip]!, wrist);
  const dMcp = dist(lm[mcp]!, wrist);
  const linear = dTip / (dPip + 1e-6);
  const radial = dTip / (dMcp + 1e-6);
  const image = (lm[pip]!.y - lm[tip]!.y) / (dist2(lm[mcp]!, lm[pip]!) + 1e-6);
  const score = 0.45 * (linear - 1) + 0.25 * (radial - 1.15) + 0.3 * image;
  return { open: score > 0.12, margin: score };
}

function thumbOpen(lm: Landmark[]): { open: boolean; margin: number } {
  const palm = dist(lm[0]!, lm[9]!) || 1;
  const tipFromIndex = dist(lm[4]!, lm[5]!);
  const tipFromPinky = dist(lm[4]!, lm[17]!);
  const folded = dist(lm[4]!, lm[8]!);
  const spread = tipFromIndex / palm;
  const away = tipFromPinky / palm;
  const notTucked = folded / palm;
  const score = 0.55 * (spread - 0.42) + 0.25 * (away - 0.7) + 0.2 * (notTucked - 0.55);
  return { open: score > 0.04, margin: score };
}

export function readFingers(lm: Landmark[]): FingerState {
  const thumb = thumbOpen(lm);
  const index = fingerOpen(lm, 8, 6, 5);
  const middle = fingerOpen(lm, 12, 10, 9);
  const ring = fingerOpen(lm, 16, 14, 13);
  const pinky = fingerOpen(lm, 20, 18, 17);
  return {
    thumb: thumb.open,
    index: index.open,
    middle: middle.open,
    ring: ring.open,
    pinky: pinky.open,
    margins: {
      thumb: thumb.margin,
      index: index.margin,
      middle: middle.margin,
      ring: ring.margin,
      pinky: pinky.margin,
    },
  };
}

function matchGeometry(f: FingerState): { gesture: GestureId; score: number } | null {
  const { thumb, index, middle, ring, pinky, margins } = f;

  const candidates: Array<{ id: GestureId; ok: boolean; score: number }> = [
    {
      id: "LIGHTS_ON",
      ok: index && middle && ring && pinky,
      score: (margins.index + margins.middle + margins.ring + margins.pinky) / 4,
    },
    {
      id: "LIGHTS_OFF",
      ok: !index && !middle && !ring && !pinky,
      score: (-margins.index - margins.middle - margins.ring - margins.pinky) / 4,
    },
    {
      id: "FAN_ON",
      ok: index && !middle && !ring && !pinky,
      score: (margins.index - margins.middle - margins.ring - margins.pinky) / 4,
    },
    {
      id: "FAN_OFF",
      ok: index && middle && !ring && !pinky,
      score: (margins.index + margins.middle - margins.ring - margins.pinky) / 4,
    },
    {
      id: "AUX",
      ok: thumb && index && !middle && !ring && !pinky,
      score: (margins.thumb + margins.index - margins.middle - margins.ring - margins.pinky) / 5,
    },
  ];

  const hits = candidates.filter((c) => c.ok);
  if (hits.length === 0) return null;
  hits.sort((a, b) => b.score - a.score);
  const best = hits[0]!;
  return { gesture: best.id, score: best.score };
}

function knn(
  features: number[],
  samples: Record<GestureId, number[][]>,
  k = 5,
): { gesture: GestureId; confidence: number } | null {
  const neighbors: Array<{ g: GestureId; d: number }> = [];
  for (const g of GESTURE_IDS) {
    for (const s of samples[g] ?? []) {
      neighbors.push({ g, d: euclid(features, s) });
    }
  }
  if (neighbors.length < 8) return null;
  neighbors.sort((a, b) => a.d - b.d);
  const top = neighbors.slice(0, Math.min(k, neighbors.length));
  const weights: Partial<Record<GestureId, number>> = {};
  let total = 0;
  for (const n of top) {
    const w = 1 / (n.d + 0.04);
    weights[n.g] = (weights[n.g] ?? 0) + w;
    total += w;
  }
  let best: GestureId = top[0]!.g;
  let bestW = 0;
  for (const g of GESTURE_IDS) {
    const w = weights[g] ?? 0;
    if (w > bestW) {
      bestW = w;
      best = g;
    }
  }
  const meanD = top.reduce((s, n) => s + n.d, 0) / top.length;
  const proximity = clamp01(1 - meanD / 1.8);
  const vote = total > 0 ? bestW / total : 0;
  return { gesture: best, confidence: clamp01(0.35 + 0.65 * vote * proximity) };
}

export function classifyHand(
  lm: Landmark[],
  samples: Record<GestureId, number[][]>,
  preferTrained: boolean,
): Classification {
  const fingers = readFingers(lm);
  const geo = matchGeometry(fingers);
  const geoConf = geo ? clamp01(0.52 + 0.9 * geo.score) : 0;

  if (preferTrained) {
    const knnHit = knn(extractFeatures(lm), samples);
    if (knnHit && knnHit.confidence >= 0.55) {
      return {
        gesture: knnHit.gesture,
        confidence: knnHit.confidence,
        fingers,
        source: "knn",
      };
    }
  }

  if (!geo) {
    return { gesture: null, confidence: 0, fingers, source: "none" };
  }

  return {
    gesture: geo.gesture,
    confidence: geoConf,
    fingers,
    source: "geometry",
  };
}

export function sampleCount(samples: Record<GestureId, number[][]>): number {
  return GESTURE_IDS.reduce((n, g) => n + (samples[g]?.length ?? 0), 0);
}

export function emptySamples(): Record<GestureId, number[][]> {
  return {
    LIGHTS_ON: [],
    LIGHTS_OFF: [],
    FAN_ON: [],
    FAN_OFF: [],
    AUX: [],
  };
}
