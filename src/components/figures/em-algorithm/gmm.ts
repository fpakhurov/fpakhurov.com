/** Gaussian mixtures for the EM figures: a seeded 2-D sample, EM in closed form, and the 1-D lower bound. */
import { mulberry32, normal } from '../random';

export type P = [number, number];
/** A symmetric 2 × 2 matrix [a, b; b, c] stored as [a, b, c]. */
export type S2 = [number, number, number];
export interface Comp { pi: number; mu: P; S: S2 }

/** Draw n[k] points from N(mu[k], S[k]) with a Cholesky factor of each covariance. */
export function sample(seed: number, mus: P[], Ss: S2[], n: number[]) {
  const z = normal(mulberry32(seed));
  const pts: P[] = [], lab: number[] = [];
  mus.forEach((m, k) => {
    const [a, b, c] = Ss[k], l11 = Math.sqrt(a), l21 = b / l11, l22 = Math.sqrt(c - l21 * l21);
    for (let i = 0; i < n[k]; i++) { const u = z(), v = z(); pts.push([m[0] + l11 * u, m[1] + l21 * u + l22 * v]); lab.push(k); }
  });
  return { pts, lab };
}

/** log N(x | mu, S) in two dimensions. */
export function logN(x: P, mu: P, S: S2) {
  const [a, b, c] = S, det = a * c - b * b, dx = x[0] - mu[0], dy = x[1] - mu[1];
  const q = (c * dx * dx - 2 * b * dx * dy + a * dy * dy) / det;
  return -Math.log(2 * Math.PI) - 0.5 * Math.log(det) - 0.5 * q;
}

/** E-step: responsibilities r[i][k] and the log-likelihood of the data under the current parameters. */
export function estep(pts: P[], comps: Comp[]) {
  let ll = 0;
  const r = pts.map((x) => {
    const lw = comps.map((c) => Math.log(c.pi) + logN(x, c.mu, c.S));
    const m = Math.max(...lw), s = lw.reduce((t, v) => t + Math.exp(v - m), 0);
    ll += m + Math.log(s);
    return lw.map((v) => Math.exp(v - m) / s);
  });
  return { r, ll };
}

/** M-step: weights, means and covariances from the responsibilities, in closed form. */
export function mstep(pts: P[], r: number[][]): Comp[] {
  const K = r[0].length, n = pts.length;
  return Array.from({ length: K }, (_, k) => {
    const Nk = r.reduce((s, ri) => s + ri[k], 0);
    const mu: P = [0, 0];
    pts.forEach((x, i) => { mu[0] += r[i][k] * x[0] / Nk; mu[1] += r[i][k] * x[1] / Nk; });
    const S: S2 = [0, 0, 0];
    pts.forEach((x, i) => { const dx = x[0] - mu[0], dy = x[1] - mu[1], w = r[i][k] / Nk; S[0] += w * dx * dx; S[1] += w * dx * dy; S[2] += w * dy * dy; });
    return { pi: Nk / n, mu, S };
  });
}

/** Run EM for `iters` iterations; record t holds the parameters after t M-steps and their log-likelihood. */
export function em(pts: P[], init: Comp[], iters: number) {
  const hist: { comps: Comp[]; ll: number; r: number[][] }[] = [];
  let comps = init;
  for (let t = 0; t <= iters; t++) {
    const { r, ll } = estep(pts, comps);
    hist.push({ comps, ll, r });
    comps = mstep(pts, r);
  }
  return hist;
}

/** Points on the ellipse of Mahalanobis distance k around mu for covariance S. */
export function ellipse(mu: P, S: S2, k: number, steps = 72): P[] {
  const [a, b, c] = S, tr = a + c, det = a * c - b * b;
  const l1 = tr / 2 + Math.sqrt(tr * tr / 4 - det), l2 = tr / 2 - Math.sqrt(tr * tr / 4 - det);
  const ang = Math.abs(b) < 1e-12 ? (a >= c ? 0 : Math.PI / 2) : Math.atan2(l1 - a, b);
  const [ca, sa] = [Math.cos(ang), Math.sin(ang)];
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = (2 * Math.PI * i) / steps, u = k * Math.sqrt(l1) * Math.cos(t), v = k * Math.sqrt(l2) * Math.sin(t);
    return [mu[0] + ca * u - sa * v, mu[1] + sa * u + ca * v] as P;
  });
}

// The 1-D toy of the bound figure: a mixture ½ N(0, 1) + ½ N(θ, 1) with only θ unknown, and seven points.
export const xs = [-0.8, -0.2, 0.3, 0.9, 2.1, 2.8, 3.4];
const phi = (v: number) => Math.exp(-v * v / 2) / Math.sqrt(2 * Math.PI);
/** The log-likelihood ℓ(θ). */
export const loglik = (th: number) => xs.reduce((s, x) => s + Math.log(0.5 * phi(x) + 0.5 * phi(x - th)), 0);
/** Responsibilities of the second component at θ. */
export const resp = (th: number) => xs.map((x) => phi(x - th) / (phi(x) + phi(x - th)));
/** The lower bound L(q, θ) for q given by the responsibilities r: equal to ℓ at the θ that produced r. */
export const bound = (th: number, r: number[]) =>
  xs.reduce((s, x, i) => s + (1 - r[i]) * Math.log((0.5 * phi(x)) / (1 - r[i])) + r[i] * Math.log((0.5 * phi(x - th)) / r[i]), 0);
/** One EM step for θ: the responsibility-weighted mean. */
export const emStep = (th: number) => { const r = resp(th); return r.reduce((s, ri, i) => s + ri * xs[i], 0) / r.reduce((s, ri) => s + ri, 0); };
