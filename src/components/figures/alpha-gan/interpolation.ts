/**
 * Lerp versus slerp between independent samples of the prior N(0, I_d), d = 128, as in the α-GAN note.
 * Seeded, so the note, the figure and its caption share their numbers.
 */
import { mulberry32, normal } from '../random';

export const dim = 128;
export const pairs = 400;
/** Interpolation parameters t = 0, 0.05, …, 1. */
export const ts = Array.from({ length: 21 }, (_, i) => i / 20);

const norm = (v: number[]) => Math.sqrt(v.reduce((s, x) => s + x * x, 0));
const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);

export const lerp = (a: number[], b: number[], t: number) => a.map((x, i) => (1 - t) * x + t * b[i]);
/** Slerp of the unnormalized vectors, with the angle taken from their directions (Shoemake's formula). */
export const slerp = (a: number[], b: number[], t: number) => {
  const omega = Math.acos(Math.min(1, Math.max(-1, dot(a, b) / (norm(a) * norm(b)))));
  const s = Math.sin(omega);
  if (s < 1e-6) return lerp(a, b, t);
  const ca = Math.sin((1 - t) * omega) / s, cb = Math.sin(t * omega) / s;
  return a.map((x, i) => ca * x + cb * b[i]);
};

const z = normal(mulberry32(128));
const draw = () => Array.from({ length: dim }, () => z());
const ends = Array.from({ length: pairs }, () => [draw(), draw()] as const);

/** Norms of the 2 · pairs endpoints: samples of the prior. */
export const priorNorms = ends.flatMap(([a, b]) => [norm(a), norm(b)]);
/** Angles between the two endpoints of each pair, in degrees. */
export const angles = ends.map(([a, b]) => (Math.acos(dot(a, b) / (norm(a) * norm(b))) * 180) / Math.PI);
/** Norm along each path: lerpPaths[k][j] is the norm of pair k at t = ts[j]. */
export const lerpPaths = ends.map(([a, b]) => ts.map((t) => norm(lerp(a, b, t))));
export const slerpPaths = ends.map(([a, b]) => ts.map((t) => norm(slerp(a, b, t))));
const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
export const lerpMean = ts.map((_, j) => mean(lerpPaths.map((p) => p[j])));
export const slerpMean = ts.map((_, j) => mean(slerpPaths.map((p) => p[j])));
/** Norms at the midpoint t = 1/2. */
export const lerpMid = lerpPaths.map((p) => p[10]);
export const slerpMid = slerpPaths.map((p) => p[10]);

const sorted = (xs: number[]) => xs.slice().sort((p, q) => p - q);
const quantile = (xs: number[], q: number) => { const s = sorted(xs); return s[Math.round(q * (s.length - 1))]; };
export const stats = {
  priorMean: mean(priorNorms),
  priorLo: quantile(priorNorms, 0.01),
  priorHi: quantile(priorNorms, 0.99),
  priorMin: Math.min(...priorNorms),
  lerpMidMean: mean(lerpMid),
  lerpMidMax: Math.max(...lerpMid),
  slerpMidMean: mean(slerpMid),
  angleMean: mean(angles),
  angleMin: Math.min(...angles),
  angleMax: Math.max(...angles),
  /** Share of lerp midpoints whose norm lies inside the central 98% range of the prior norms. */
  lerpInside: lerpMid.filter((r) => r >= quantile(priorNorms, 0.01)).length / pairs,
};
/** Theoretical mean norm of the lerp path between independent samples: √(d((1 − t)² + t²)). */
export const lerpTheory = (t: number) => Math.sqrt(dim * ((1 - t) ** 2 + t ** 2));
