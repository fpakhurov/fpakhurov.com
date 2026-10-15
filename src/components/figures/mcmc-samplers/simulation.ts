/**
 * Simulations for the note on MALA, HMC and NUTS. Everything is seeded, so the note, the figures and their
 * captions share their numbers.
 *
 * 1. Three samplers on a bivariate normal with unit variances and correlation 0.95, each with the same budget of
 *    3000 evaluations of the target (a density for random-walk Metropolis, a gradient for MALA and HMC).
 * 2. Hamiltonian Monte Carlo on a standard normal in phase space (x, p): leapfrog against Euler, and three
 *    iterations of momentum refresh → leapfrog trajectory → accept/reject.
 */
import { mulberry32, normal } from '../random';

// ---------------------------------------------------------------------------------------------------------------
// 1. Correlated Gaussian: U(x) = ½ xᵀ Σ⁻¹ x with Σ = [[1, ρ], [ρ, 1]].

export type P2 = [number, number];
export const rho = 0.95;
const c = 1 / (1 - rho * rho);
/** Gradient of the potential, Σ⁻¹ x. */
const grad = ([a, b]: P2): P2 => [c * (a - rho * b), c * (b - rho * a)];
/** Potential energy U(x) = −log density + const. */
const pot = ([a, b]: P2) => 0.5 * c * (a * a - 2 * rho * a * b + b * b);

export const budget = 3000;
export const start: P2 = [-2, -2];
export const rwmStep = 1.0;
export const malaStep = 0.17;
export const hmcStep = 0.3, hmcL = 10;

/** Effective sample size: n / (1 + 2 Σ ρ_k), the autocorrelations summed until the first one below 0.05. */
export function ess(xs: number[]): number {
  const n = xs.length, m = xs.reduce((s, v) => s + v, 0) / n;
  const d = xs.map((v) => v - m);
  const c0 = d.reduce((s, v) => s + v * v, 0);
  let sum = 0;
  for (let k = 1; k < n; k++) {
    let ck = 0;
    for (let t = 0; t + k < n; t++) ck += d[t] * d[t + k];
    const r = ck / c0;
    if (r < 0.05) break;
    sum += r;
  }
  return n / (1 + 2 * sum);
}

function runRwm(seed: number) {
  const u = mulberry32(seed), z = normal(u);
  let x: P2 = [...start], ux = pot(x), acc = 0;
  const states: P2[] = [];
  for (let t = 0; t < budget; t++) {
    const y: P2 = [x[0] + rwmStep * z(), x[1] + rwmStep * z()];
    const uy = pot(y);
    if (Math.log(u()) < ux - uy) { x = y; ux = uy; acc++; }
    states.push(x);
  }
  return { states, acc: acc / budget, evals: budget };
}

function runMala(seed: number) {
  const u = mulberry32(seed), z = normal(u), s = Math.sqrt(malaStep), h = malaStep / 2;
  let x: P2 = [...start], gx = grad(x), ux = pot(x), acc = 0;
  const states: P2[] = [];
  // log q(b | a) up to a constant: proposal N(a − (ε/2)∇U(a), ε I).
  const logq = (b: P2, a: P2, ga: P2) => -((b[0] - a[0] + h * ga[0]) ** 2 + (b[1] - a[1] + h * ga[1]) ** 2) / (2 * malaStep);
  for (let t = 0; t < budget; t++) {
    const y: P2 = [x[0] - h * gx[0] + s * z(), x[1] - h * gx[1] + s * z()];
    const gy = grad(y), uy = pot(y);
    if (Math.log(u()) < ux - uy + logq(x, y, gy) - logq(y, x, gx)) { x = y; gx = gy; ux = uy; acc++; }
    states.push(x);
  }
  return { states, acc: acc / budget, evals: budget };
}

function runHmc(seed: number) {
  const u = mulberry32(seed), z = normal(u), e = hmcStep;
  let x: P2 = [...start], acc = 0;
  const states: P2[] = [], paths: P2[][] = [];
  for (let it = 0; it < budget / hmcL; it++) {
    const p0: P2 = [z(), z()];
    let q: P2 = [...x], p: P2 = [...p0], g = grad(q);
    const path: P2[] = [q];
    for (let l = 0; l < hmcL; l++) {
      p = [p[0] - (e / 2) * g[0], p[1] - (e / 2) * g[1]];
      q = [q[0] + e * p[0], q[1] + e * p[1]];
      g = grad(q);
      p = [p[0] - (e / 2) * g[0], p[1] - (e / 2) * g[1]];
      path.push(q);
    }
    const dH = pot(q) + (p[0] ** 2 + p[1] ** 2) / 2 - pot(x) - (p0[0] ** 2 + p0[1] ** 2) / 2;
    if (Math.log(u()) < -dH) { x = q; acc++; }
    states.push(x);
    paths.push(path);
  }
  return { states, paths, acc: acc / (budget / hmcL), evals: budget };
}

const summarize = (states: P2[]) => ({ essX1: ess(states.map((s) => s[0])), essLong: ess(states.map((s) => (s[0] + s[1]) / Math.SQRT2)) });
const rwm = runRwm(11), mala = runMala(12), hmc = runHmc(13);
export const samplers = {
  rwm: { ...rwm, ...summarize(rwm.states) },
  mala: { ...mala, ...summarize(mala.states) },
  hmc: { ...hmc, ...summarize(hmc.states) },
};
/** How many target evaluations of each chain the trajectory figure draws. */
export const shownEvals = 300;

/** Sample autocorrelation of a chain at lags 0..K (the same normalization as in ess). */
export function acf(xs: number[], K: number): number[] {
  const n = xs.length, m = xs.reduce((s, v) => s + v, 0) / n;
  const d = xs.map((v) => v - m), c0 = d.reduce((s, v) => s + v * v, 0);
  return Array.from({ length: K + 1 }, (_, k) => {
    let ck = 0;
    for (let t = 0; t + k < n; t++) ck += d[t] * d[t + k];
    return ck / c0;
  });
}
/** Autocorrelation of x₁ against the lag in target evaluations, up to 200: one HMC iteration costs L evaluations. */
export const maxLagEvals = 200;
export const acfX1 = {
  rwm: acf(samplers.rwm.states.map((s) => s[0]), maxLagEvals).map((v, k) => [k, v] as P2),
  mala: acf(samplers.mala.states.map((s) => s[0]), maxLagEvals).map((v, k) => [k, v] as P2),
  hmc: acf(samplers.hmc.states.map((s) => s[0]), maxLagEvals / hmcL).map((v, k) => [k * hmcL, v] as P2),
};

// ---------------------------------------------------------------------------------------------------------------
// 2. Phase space of a standard normal: H(x, p) = x²/2 + p²/2, whose exact trajectories are circles.

export const lfStep = 0.3, lfL = 7;
export const H = (x: number, p: number) => (x * x + p * p) / 2;

/** L leapfrog steps from (x, p); returns all L + 1 states. */
export function leapfrog(x: number, p: number, e = lfStep, L = lfL): P2[] {
  const out: P2[] = [[x, p]];
  for (let l = 0; l < L; l++) {
    p -= (e / 2) * x;
    x += e * p;
    p -= (e / 2) * x;
    out.push([x, p]);
  }
  return out;
}
/** L Euler steps from (x, p): both updates use the old state. */
export function euler(x: number, p: number, e = lfStep, L = lfL): P2[] {
  const out: P2[] = [[x, p]];
  for (let l = 0; l < L; l++) {
    [x, p] = [x + e * p, p - e * x];
    out.push([x, p]);
  }
  return out;
}

/** Three HMC iterations from x = −1.5: fresh momentum, 7 leapfrog steps of size 0.3, accept/reject. */
export const hmcStart = -1.5;
const ph = mulberry32(12), pz = normal(ph);
let xCur = hmcStart;
export const iterations = Array.from({ length: 3 }, () => {
  const x0 = xCur, p0 = pz();
  const path = leapfrog(x0, p0);
  const [x1, p1] = path[path.length - 1];
  const dH = H(x1, p1) - H(x0, p0);
  const alpha = Math.min(1, Math.exp(-dH));
  const accepted = ph() < alpha;
  if (accepted) xCur = x1;
  return { x0, p0, path, dH, alpha, accepted, x1: xCur };
});
const first = iterations[0];
/** Energy error along the first trajectory, leapfrog and Euler with the same step. */
export const energyLeapfrog = first.path.map(([x, p]) => H(x, p) - H(first.x0, first.p0));
export const eulerPath = euler(first.x0, first.p0);
export const energyEuler = eulerPath.map(([x, p]) => H(x, p) - H(first.x0, first.p0));
