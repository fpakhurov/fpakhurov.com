/**
 * Build-time experiments of the note "Deep Q-networks": the two-state example of the deadly triad (exact, no
 * randomness) and the maximization-bias example of Sutton and Barto (example 6.7), Q-learning against Double Q-learning.
 */
import { rng } from '../temporal-difference-learning/td';

/**
 * The two-state example: state 1 has feature 1 and state 2 feature 2, so a linear estimate with one weight w gives
 * v(1) = w and v(2) = 2w. The only transition is 1 -> 2 with reward 0, then 2 -> end with reward 0; all true values are 0.
 * Returns the estimate of state 1 after each update, for four variants that keep or drop one leg of the triad.
 */
export function triad(updates = 60, gamma = 0.9, alpha = 0.1, w0 = 1) {
  const out: Record<string, number[]> = { offTd: [w0], onTd: [w0], offMc: [w0], tabular: [w0] };
  // 1. function approximation + bootstrapping + off-policy: only the transition 1 -> 2 is ever updated
  let w = w0;
  for (let k = 0; k < updates; k += 1) { w += alpha * (gamma * 2 * w - w) * 1; out.offTd.push(w); }
  // 2. on-policy: the updates follow the episodes, 1 -> 2 and then 2 -> end, so state 2 is updated as often as it is visited
  w = w0;
  for (let k = 0; k < updates; k += 1) {
    if (k % 2 === 0) w += alpha * (gamma * 2 * w - w) * 1;      // from state 1, feature 1
    else w += alpha * (0 - 2 * w) * 2;                            // from state 2, feature 2, the episode ends
    out.onTd.push(w);
  }
  // 3. no bootstrapping: the Monte Carlo target of state 1 is its return, 0
  w = w0;
  for (let k = 0; k < updates; k += 1) { w += alpha * (0 - w) * 1; out.offMc.push(w); }
  // 4. no function approximation: separate values V1 = w0, V2 = 2 w0; only V1 is updated, towards γ V2
  let v1 = w0;
  const v2 = 2 * w0;
  for (let k = 0; k < updates; k += 1) { v1 += alpha * (gamma * v2 - v1); out.tabular.push(v1); }
  return out;
}

/**
 * The maximization-bias MDP: from A, "right" ends with reward 0 and "left" leads to B with reward 0; from B each of
 * `nB` actions ends with a reward drawn from N(-0.1, 1). γ = 1, ε = 0.1, α = 0.1. Returns the fraction of episodes in
 * which the agent went left from A, per episode, over `runs` runs.
 */
export function maxBias(method: 'q' | 'double', runs = 2000, episodes = 300, nB = 10, seed = 11) {
  const r = rng(seed + (method === 'double' ? 1 : 0));
  const left = new Float64Array(episodes);
  const eps = 0.1, alpha = 0.1;
  for (let run = 0; run < runs; run += 1) {
    // Q[0] = [left, right] in A; Q[1] = the nB actions in B. Two tables for Double Q-learning.
    const A1 = [0, 0], A2 = [0, 0], B1 = new Float64Array(nB), B2 = new Float64Array(nB);
    const greedy = (q: ArrayLike<number>) => {
      let best = -Infinity, arg = 0, ties = 0;
      for (let i = 0; i < q.length; i += 1) {
        if (q[i] > best) { best = q[i]; arg = i; ties = 1; } else if (q[i] === best) { ties += 1; if (r.u() * ties < 1) arg = i; }
      }
      return arg;
    };
    const maxOf = (q: ArrayLike<number>) => { let m = -Infinity; for (let i = 0; i < q.length; i += 1) m = Math.max(m, q[i]); return m; };
    for (let ep = 0; ep < episodes; ep += 1) {
      const qa = method === 'q' ? A1 : [A1[0] + A2[0], A1[1] + A2[1]];
      const a = r.u() < eps ? r.int(2) : greedy(qa);
      if (a === 1) {                                                   // right: the episode ends with reward 0
        if (method === 'q' || r.u() < 0.5) A1[1] += alpha * (0 - A1[1]); else A2[1] += alpha * (0 - A2[1]);
        continue;
      }
      left[ep] += 1 / runs;
      const qb = method === 'q' ? B1 : Float64Array.from(B1, (v, i) => v + B2[i]);
      const b = r.u() < eps ? r.int(nB) : greedy(qb);
      const reward = -0.1 + r.normal();
      if (method === 'q') {
        A1[0] += alpha * (0 + maxOf(B1) - A1[0]);                     // A -> B: bootstrap on max_b Q(B, b)
        B1[b] += alpha * (reward - B1[b]);
      } else if (r.u() < 0.5) {                                        // update table 1, evaluate its choice with table 2
        A1[0] += alpha * (0 + B2[greedy(B1)] - A1[0]);
        B1[b] += alpha * (reward - B1[b]);
      } else {
        A2[0] += alpha * (0 + B1[greedy(B2)] - A2[0]);
        B2[b] += alpha * (reward - B2[b]);
      }
    }
  }
  return left;
}

/** E[max of m independent standard normals], by numerical integration of m x φ(x) Φ(x)^(m-1). */
export function expectedMax(m: number) {
  const phi = (x: number) => Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  let s = 0, cdf = 0;
  const h = 1e-3;
  // integrate on [-8, 8], accumulating the cdf with the trapezoid rule as we go
  let prevPhi = phi(-8);
  for (let x = -8 + h; x <= 8; x += h) {
    const p = phi(x);
    cdf += 0.5 * h * (p + prevPhi);
    s += h * m * x * p * Math.pow(cdf, m - 1);
    prevPhi = p;
  }
  return s;
}
