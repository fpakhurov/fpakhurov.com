/**
 * Helpers for the generative-modeling note: the standard normal CDF and its inverse,
 * the sampling ladder (uniform → Box–Muller → affine → nonlinear) and a toy 2-D data set.
 */
import { seeded } from '../geometry';

export type Vec = [number, number];

/** Error function, Abramowitz and Stegun 7.1.26 (absolute error below 1.5e-7). */
export function erf(x: number): number {
  const s = Math.sign(x);
  const a = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * a);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-a * a);
  return s * y;
}

/** Standard normal CDF Φ. */
export const Phi = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));

/** Inverse of Φ by bisection, accurate to about 1e-9 on (0, 1). */
export function PhiInv(u: number): number {
  let lo = -9;
  let hi = 9;
  for (let i = 0; i < 60; i += 1) {
    const mid = (lo + hi) / 2;
    if (Phi(mid) < u) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Pairs of uniform numbers on (0, 1) from a seeded generator. */
export function uniformPairs(count: number, seed: number): Vec[] {
  const random = seeded(seed);
  return Array.from({ length: count }, () => [Math.max(random(), 1e-12), random()] as Vec);
}

/** Box–Muller: two independent uniforms give two independent standard normals. */
export const boxMuller = ([u1, u2]: Vec): Vec => {
  const r = Math.sqrt(-2 * Math.log(u1));
  return [r * Math.cos(2 * Math.PI * u2), r * Math.sin(2 * Math.PI * u2)];
};

/** The affine step of the ladder: x = μ + A z with A = diag(1.4, 0.45), μ = 0. */
export const affineStep = ([z1, z2]: Vec): Vec => [1.4 * z1, 0.45 * z2];

/** A fixed nonlinear map that bends the ellipse into an arch; in a model this would be a network g_θ. */
export const bend = ([y1, y2]: Vec): Vec => [y1, y2 - 0.45 * y1 * y1 + 0.9];

/** Two interleaved half-circles with Gaussian noise: a toy data set whose density we pretend not to know. */
export function moons(count: number, seed: number, noise = 0.09): Vec[] {
  const random = seeded(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(Math.max(random(), 1e-12))) * Math.cos(2 * Math.PI * random());
  const points: Vec[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = Math.PI * random();
    const upper = i % 2 === 0;
    const p: Vec = upper ? [Math.cos(t), Math.sin(t)] : [1 - Math.cos(t), 0.5 - Math.sin(t)];
    points.push([p[0] + noise * gauss(), p[1] + noise * gauss()]);
  }
  return points;
}

/** Component means of an illustrative mixture model placed along the two moons. */
export function mixtureMeans(perMoon: number): Vec[] {
  const means: Vec[] = [];
  for (let k = 0; k < perMoon; k += 1) {
    const t = (Math.PI * (k + 0.5)) / perMoon;
    means.push([Math.cos(t), Math.sin(t)], [1 - Math.cos(t), 0.5 - Math.sin(t)]);
  }
  return means;
}

/** Samples from the equal-weight isotropic mixture with the given means and standard deviation. */
export function mixtureSamples(means: Vec[], sd: number, count: number, seed: number): Vec[] {
  const random = seeded(seed);
  const gauss = () => Math.sqrt(-2 * Math.log(Math.max(random(), 1e-12))) * Math.cos(2 * Math.PI * random());
  return Array.from({ length: count }, () => {
    const m = means[Math.floor(random() * means.length)];
    return [m[0] + sd * gauss(), m[1] + sd * gauss()] as Vec;
  });
}

/** Split "p_θ(x | z)" or "p_{data}" into text runs, marking subscripts, for rendering with <tspan>. */
export function subParts(label: string): { t: string; sub: boolean }[] {
  const parts: { t: string; sub: boolean }[] = [];
  const re = /_(\{[^}]*\}|.)/g;
  let last = 0;
  for (const m of label.matchAll(re)) {
    if (m.index! > last) parts.push({ t: label.slice(last, m.index), sub: false });
    parts.push({ t: m[1].replace(/^\{|\}$/g, ''), sub: true });
    last = m.index! + m[0].length;
  }
  if (last < label.length) parts.push({ t: label.slice(last), sub: false });
  return parts;
}
