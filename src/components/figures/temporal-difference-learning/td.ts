/** Shared numerical helpers retained for DQN and model-based figures.
 * Source-specific TD experiments were retired; no experiment outputs remain here. */
import { seeded } from '../geometry';

/** A seeded source of uniforms and standard normals. */
export function rng(seed: number) {
  const u = seeded(seed);
  let spare: number | null = null;
  const normal = () => {
    if (spare !== null) { const s = spare; spare = null; return s; }
    const a = Math.max(u(), 1e-12), b = u(), r = Math.sqrt(-2 * Math.log(a));
    spare = r * Math.sin(2 * Math.PI * b);
    return r * Math.cos(2 * Math.PI * b);
  };
  return { u, normal, int: (n: number) => Math.min(n - 1, Math.floor(u() * n)) };
}
/** Mean of a[i0..i1). */
export const mean = (a: ArrayLike<number>, i0 = 0, i1 = a.length) => {
  let s = 0;
  for (let i = i0; i < i1; i += 1) s += a[i];
  return s / (i1 - i0);
};
/** Window averages: points (centre index + 1, mean of the window) for a curve indexed from step 1. */
export const bins = (a: ArrayLike<number>, w: number) => {
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i + w <= a.length; i += w) { xs.push(i + (w + 1) / 2); ys.push(mean(a, i, i + w)); }
  return { xs, ys };
};
/** Screen y positions of end labels, pushed apart to at least `gap` while keeping their order. */
export function spread(ys: number[], gap: number) {
  const order = ys.map((y, i) => [y, i] as [number, number]).sort((a, b) => a[0] - b[0]);
  const out = new Array<number>(ys.length);
  let last = -Infinity;
  for (const [y, i] of order) { const v = Math.max(y, last + gap); out[i] = v; last = v; }
  return out;
}
