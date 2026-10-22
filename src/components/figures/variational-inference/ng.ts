/**
 * The normal model with unknown mean μ and precision λ under a normal–gamma prior, shared by the
 * variational-inference and Gibbs-sampling figures: the data, the exact posterior, the mean-field (CAVI)
 * updates, contours of both in the (μ, λ) plane, and a seeded gamma sampler for the Gibbs chains.
 * Self-contained (no imports), so that the numbers can be checked outside the build.
 */

/** Eight observations; the posterior depends on them only through N, their mean and their sum of squares. */
export const xs = [3.0, -1.6, 1.4, 0.4, 0.5, 0.8, -1.0, 0.8];
export const N = xs.length;
export const xbar = xs.reduce((s, v) => s + v, 0) / N;
/** The prior: μ | λ ~ N(μ0, 1/(λ0 λ)), λ ~ Gamma(a0, b0) with rate b0. */
export const prior = { mu0: 0, l0: 1, a0: 2, b0: 2 };

const { mu0, l0, a0, b0 } = prior;
const ss = (m: number) => xs.reduce((s, v) => s + (v - m) ** 2, 0);

/** The exact posterior, normal–gamma: μ | λ ~ N(m, 1/(l λ)), λ ~ Gamma(a, b). */
export const exact = (() => {
  const l = l0 + N, m = (l0 * mu0 + N * xbar) / l, a = a0 + N / 2;
  const b = b0 + ss(xbar) / 2 + (l0 * N * (xbar - mu0) ** 2) / (2 * l);
  return { m, l, a, b, Etau: a / b, sdMu: Math.sqrt(b / ((a - 1) * l)) };
})();

/** ln Γ(z) for z > 0 (Lanczos, g = 7, nine coefficients). */
export function lgamma(z: number): number {
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lgamma(1 - z);
  z -= 1;
  let x = c[0];
  for (let i = 1; i < 9; i++) x += c[i] / (z + i);
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

/** log of the gamma density with shape a and rate b. */
export const logGam = (t: number, a: number, b: number) => a * Math.log(b) - lgamma(a) + (a - 1) * Math.log(t) - b * t;

/** A mean-field factorization q(μ) q(λ) = N(μ | m, 1/lam) · Gamma(λ | a, b). */
export interface MF { m: number; lam: number; a: number; b: number }

/** The CAVI update of q(μ) given q(λ): its mean does not depend on q(λ), its precision is (λ0 + N) E[λ]. */
export const updMu = (q: MF): MF => ({ ...q, m: exact.m, lam: (l0 + N) * (q.a / q.b) });
/** The CAVI update of q(λ) given q(μ): shape a0 + (N + 1)/2, rate b0 + ½ E_μ[Σ (x − μ)² + λ0 (μ − μ0)²]. */
export const updTau = (q: MF): MF => ({
  ...q,
  a: a0 + (N + 1) / 2,
  b: b0 + 0.5 * (ss(q.m) + N / q.lam + l0 * ((q.m - mu0) ** 2 + 1 / q.lam)),
});

/** CAVI from a starting factorization; record 0 is the start, then one record after each factor update. */
export function cavi(start: MF, sweeps: number): MF[] {
  const out = [start];
  let q = start;
  for (let i = 0; i < sweeps; i++) { q = updMu(q); out.push(q); q = updTau(q); out.push(q); }
  return out;
}

/** The converged factorization (from any start: the fixed point is unique). */
export const vi = cavi({ m: 0, lam: 1, a: 1, b: 1 }, 200).at(-1)!;

type Pt = [number, number];

/** Find t in (lo, hi) with f(t) = 0 by bisection, given a sign change. */
function bisect(f: (t: number) => number, lo: number, hi: number) {
  const flo = f(lo);
  for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (f(mid) * flo > 0) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

/**
 * A closed contour {(μ, λ): density = max · e^(−k)} of a density of the form G(λ) · N(μ | m, 1/prec(λ)).
 * For each λ the level set in μ is m ± sqrt(2 ln(g(λ)/c) / prec(λ)), with g(λ) = G(λ) sqrt(prec(λ)/2π),
 * so the contour is traced exactly: the right branch upwards in λ, the left branch downwards.
 */
function contour(logG: (t: number) => number, m: number, prec: (t: number) => number, k: number, steps = 90): Pt[] {
  const lg = (t: number) => logG(t) + 0.5 * Math.log(prec(t) / (2 * Math.PI));
  let tmax = 1e-3, best = -Infinity;
  for (let t = 1e-3; t < 20; t += 1e-3) { const v = lg(t); if (v > best) { best = v; tmax = t; } }
  const f = (t: number) => lg(t) - (best - k);
  const t0 = bisect(f, 1e-6, tmax), t1 = bisect(f, tmax, 50);
  const ts = Array.from({ length: steps + 1 }, (_, i) => t0 + (t1 - t0) * (1 - Math.cos((Math.PI * i) / steps)) / 2);
  const half = (t: number) => Math.sqrt(Math.max(0, 2 * f(t)) / prec(t));
  return [...ts.map((t) => [m + half(t), t] as Pt), ...ts.slice().reverse().map((t) => [m - half(t), t] as Pt)];
}

/** Contour of the exact posterior at relative level e^(−k). */
export const exactContour = (k: number) => contour((t) => logGam(t, exact.a, exact.b), exact.m, (t) => exact.l * t, k);
/** Contour of a factorization q(μ) q(λ) at relative level e^(−k). */
export const mfContour = (q: MF, k: number) => contour((t) => logGam(t, q.a, q.b), q.m, () => q.lam, k);

/** Seeded uniforms (mulberry32), standard normals (Box–Muller) and gamma draws (Marsaglia–Tsang, shape ≥ 1, rate b). */
export function rng(seed: number) {
  let s = seed >>> 0;
  const u = () => {
    s = (s + 0x6d2b79f5) | 0;
    let a = s;
    a = Math.imul(a ^ (a >>> 15), 1 | a);
    a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a;
    return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
  };
  const n = () => Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u());
  const gam = (shape: number, rate: number) => {
    const d = shape - 1 / 3, c = 1 / Math.sqrt(9 * d);
    for (;;) {
      const z = n(), v = (1 + c * z) ** 3;
      if (v <= 0) continue;
      if (Math.log(1 - u()) < 0.5 * z * z + d - d * v + d * Math.log(v)) return (d * v) / rate;
    }
  };
  return { u, n, gam };
}

/** The Gibbs conditionals of the model: μ | λ ~ N(m, 1/((λ0 + N) λ)) and λ | μ ~ Gamma(a0 + (N + 1)/2, b0 + ½[Σ (x − μ)² + λ0 (μ − μ0)²]). */
export const condMu = (tau: number) => ({ m: exact.m, sd: 1 / Math.sqrt((l0 + N) * tau) });
export const condTau = (mu: number) => ({ a: a0 + (N + 1) / 2, b: b0 + 0.5 * (ss(mu) + l0 * (mu - mu0) ** 2) });

/** A Gibbs chain from (μ, λ) = start; returns the states after each half-step (μ update, then λ update). */
export function gibbs(seed: number, start: Pt, sweeps: number): Pt[] {
  const r = rng(seed);
  let [mu, tau] = start;
  const out: Pt[] = [[mu, tau]];
  for (let i = 0; i < sweeps; i++) {
    const cm = condMu(tau); mu = cm.m + cm.sd * r.n(); out.push([mu, tau]);
    const ct = condTau(mu); tau = r.gam(ct.a, ct.b); out.push([mu, tau]);
  }
  return out;
}
