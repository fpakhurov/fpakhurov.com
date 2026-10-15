/**
 * The Gaussian toy of the energy-based models note. Data N(0, 1); model energy E_v(x) = x²/(2v), so p_v = N(0, v).
 * Negative samples come from K steps of Langevin dynamics x ← x − (ε/2)·x/v + √ε·z started from U(−3, 3).
 * The update is linear, so the variance of the chain after K steps has a closed form, and contrastive divergence
 * stops where that variance equals the data variance 1. Everything here is deterministic.
 */

/** Langevin step size ε, variance of the start distribution U(−3, 3), share of fresh starts in the replay buffer. */
export const EPS = 0.01, START_VAR = 3, RHO = 0.05;

const contraction = (v: number) => 1 - EPS / (2 * v);

/** Variance of x after K Langevin steps from U(−3, 3) under the model N(0, v). */
export const varShort = (v: number, K: number) => {
  const a = contraction(v), b = a ** (2 * K), c = EPS / (1 - a * a);
  return b * START_VAR + c * (1 - b);
};

/**
 * The same with a replay buffer: a start is fresh noise with probability ρ and otherwise continues an earlier chain,
 * so a sample has run a Geometric(ρ) number n of K-step rounds and E[b^n] = ρb / (1 − (1 − ρ)b).
 */
export const varBuffer = (v: number, K: number) => {
  const a = contraction(v), b = a ** (2 * K), c = EPS / (1 - a * a);
  return c + (START_VAR - c) * (RHO * b) / (1 - (1 - RHO) * b);
};

/** Model variance at which CD stops: the sampler output has variance 1. Both variances increase with v; bisection. */
export const fixedPoint = (f: (v: number, K: number) => number, K: number) => {
  let lo = (EPS / 2) * (1 + 1e-9), hi = 100;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid, K) - 1 > 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
};

/** Long-run limit: unadjusted Langevin with step ε has stationary variance v / (1 − ε/(4v)); it equals 1 here. */
export const longRun = (1 + Math.sqrt(1 - EPS)) / 2;
