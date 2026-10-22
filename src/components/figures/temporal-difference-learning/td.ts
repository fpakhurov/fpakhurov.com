/**
 * Tabular experiments of the note "Q-learning and temporal-difference learning", run at build time with a seeded
 * generator: the 10-armed bandit, the five-state random walk and cliff walking. The Code section of the note runs the
 * same experiments with NumPy's generator; the averages agree to the precision quoted in the text.
 */
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
type Rng = ReturnType<typeof rng>;

/** Index of the largest entry; ties are broken uniformly at random (reservoir sampling, no allocation). */
const argmaxRandom = (q: ArrayLike<number>, r: Rng) => {
  let best = -Infinity, arg = 0, ties = 0;
  for (let i = 0; i < q.length; i += 1) {
    if (q[i] > best) { best = q[i]; arg = i; ties = 1; }
    else if (q[i] === best) { ties += 1; if (r.u() * ties < 1) arg = i; }
  }
  return arg;
};

/* ---------- 1. the 10-armed testbed ---------- */
export type BanditMethod = { key: string; eps: number; ucb?: number };
/** Average reward and fraction of optimal actions at each step, over `runs` testbeds. */
export function bandit(methods: BanditMethod[], runs = 2000, steps = 1000, k = 10, seed = 1) {
  const out = methods.map(() => ({ reward: new Float64Array(steps), optimal: new Float64Array(steps) }));
  methods.forEach((m, mi) => {
    const r = rng(seed + 7919 * mi);
    for (let run = 0; run < runs; run += 1) {
      const q = Array.from({ length: k }, () => r.normal());
      const best = q.indexOf(Math.max(...q));
      const Q = new Float64Array(k), N = new Float64Array(k), score = new Float64Array(k);
      for (let t = 0; t < steps; t += 1) {
        let a: number;
        if (m.ucb !== undefined) {
          // an untried arm counts as maximizing (its bonus is infinite); otherwise Q + c sqrt(ln t / N)
          const lt = Math.log(t + 1);
          for (let i = 0; i < k; i += 1) score[i] = N[i] === 0 ? 1e9 : Q[i] + m.ucb * Math.sqrt(lt / N[i]);
          a = argmaxRandom(score, r);
        } else a = r.u() < m.eps ? r.int(k) : argmaxRandom(Q, r);
        const R = q[a] + r.normal();
        N[a] += 1; Q[a] += (R - Q[a]) / N[a];
        out[mi].reward[t] += R / runs;
        if (a === best) out[mi].optimal[t] += 1 / runs;
      }
    }
  });
  return out;
}

/* ---------- 2. the random walk: five states A..E, start in C, reward 1 on the right exit ---------- */
export const walkTrue = [1, 2, 3, 4, 5].map((i) => i / 6);
/** RMS error over the five states after each episode, averaged over runs, for TD(0) or constant-α Monte Carlo. */
export function randomWalk(method: 'td' | 'mc', alpha: number, runs = 100, episodes = 100, seed = 3) {
  const r = rng(seed + (method === 'td' ? 0 : 1000) + Math.round(alpha * 1e4));
  const rms = new Float64Array(episodes + 1);
  for (let run = 0; run < runs; run += 1) {
    const V = [0.5, 0.5, 0.5, 0.5, 0.5];
    const err = () => Math.sqrt(V.reduce((s, v, i) => s + (v - walkTrue[i]) ** 2, 0) / 5);
    rms[0] += err() / runs;
    for (let ep = 1; ep <= episodes; ep += 1) {
      let s = 2;
      const visited: number[] = [s];
      let G = 0;
      while (true) {
        const s2 = s + (r.u() < 0.5 ? -1 : 1);
        const reward = s2 === 5 ? 1 : 0;
        const terminal = s2 < 0 || s2 > 4;
        if (method === 'td') V[s] += alpha * (reward + (terminal ? 0 : V[s2]) - V[s]);
        if (terminal) { G = reward; break; }
        s = s2; visited.push(s);
      }
      if (method === 'mc') for (const x of visited) V[x] += alpha * (G - V[x]);   // every visit, γ = 1
      rms[ep] += err() / runs;
    }
  }
  return rms;
}

/* ---------- 3. cliff walking: 4 x 12 grid, start (3, 0), goal (3, 11), cliff (3, 1..10) ---------- */
export const CW = { rows: 4, cols: 12, start: 36, goal: 47 };
const MOVES = [[-1, 0], [0, 1], [1, 0], [0, -1]];            // up, right, down, left
/** One environment step: the next state and the reward. Falling off the cliff costs 100 and returns to the start. */
export function cliffStep(s: number, a: number): [number, number] {
  const r0 = Math.floor(s / CW.cols), c0 = s % CW.cols;
  const r1 = Math.min(CW.rows - 1, Math.max(0, r0 + MOVES[a][0])), c1 = Math.min(CW.cols - 1, Math.max(0, c0 + MOVES[a][1]));
  if (r1 === 3 && c1 >= 1 && c1 <= 10) return [CW.start, -100];
  return [r1 * CW.cols + c1, -1];
}
const max4 = (Q: Float64Array, s: number) => Math.max(Q[4 * s], Q[4 * s + 1], Q[4 * s + 2], Q[4 * s + 3]);
/** Sum of rewards per episode, averaged over runs, for SARSA or Q-learning with ε-greedy behaviour. Also the greedy path of the last run. */
export function cliff(method: 'sarsa' | 'q', runs = 200, episodes = 500, alpha = 0.5, eps = 0.1, seed = 5) {
  const r = rng(seed + (method === 'q' ? 100 : 0));
  const ret = new Float64Array(episodes);
  const nS = CW.rows * CW.cols;
  let Q = new Float64Array(nS * 4);
  const act = (s: number) => (r.u() < eps ? r.int(4) : argmaxRandom(Q.subarray(4 * s, 4 * s + 4), r));
  for (let run = 0; run < runs; run += 1) {
    Q = new Float64Array(nS * 4);
    for (let ep = 0; ep < episodes; ep += 1) {
      let s = CW.start, a = act(s), total = 0;
      while (s !== CW.goal) {
        const [s2, R] = cliffStep(s, a);
        total += R;
        const a2 = act(s2);
        const next = s2 === CW.goal ? 0 : method === 'sarsa' ? Q[4 * s2 + a2] : max4(Q, s2);
        Q[4 * s + a] += alpha * (R + next - Q[4 * s + a]);
        s = s2; a = a2;
      }
      ret[ep] += total / runs;
    }
  }
  // the greedy path of the last run's Q
  const path = [CW.start];
  for (let s = CW.start, i = 0; s !== CW.goal && i < 60; i += 1) {
    const q = Q.subarray(4 * s, 4 * s + 4);
    s = cliffStep(s, q.indexOf(Math.max(...q)))[0];
    path.push(s);
  }
  return { ret, path };
}

/** Exact expected return from the start of the ε-greedy policy built on the action values Q (policy evaluation, γ = 1). */
export function epsGreedyValue(Q: Float64Array, eps = 0.1) {
  const nS = CW.rows * CW.cols;
  let V = new Float64Array(nS);
  for (let it = 0; it < 20000; it += 1) {
    const W = new Float64Array(nS);
    let delta = 0;
    for (let s = 0; s < nS; s += 1) {
      if (s === CW.goal) continue;
      const q = Q.subarray(4 * s, 4 * s + 4), g = q.indexOf(Math.max(...q));
      let v = 0;
      for (let a = 0; a < 4; a += 1) {
        const p = eps / 4 + (a === g ? 1 - eps : 0), [s2, R] = cliffStep(s, a);
        v += p * (R + V[s2]);
      }
      W[s] = v; delta = Math.max(delta, Math.abs(v - V[s]));
    }
    V = W;
    if (delta < 1e-10) break;
  }
  return V[CW.start];
}
/** Q* by value iteration, and the action values of the best ε-greedy policy (ε-soft policy iteration), γ = 1. */
export function cliffExact(eps = 0.1) {
  const nS = CW.rows * CW.cols;
  const backup = (V: Float64Array) => {
    const Q = new Float64Array(nS * 4);
    for (let s = 0; s < nS; s += 1) for (let a = 0; a < 4; a += 1) {
      if (s === CW.goal) continue;
      const [s2, R] = cliffStep(s, a);
      Q[4 * s + a] = R + V[s2];
    }
    return Q;
  };
  // Q*: value iteration
  let V = new Float64Array(nS);
  for (let it = 0; it < 1000; it += 1) {
    const Q = backup(V);
    V = Float64Array.from({ length: nS }, (_, s) => (s === CW.goal ? 0 : Math.max(...Q.subarray(4 * s, 4 * s + 4))));
  }
  const Qstar = backup(V);
  // the optimal ε-soft policy: iterate V(s) = Σ_a π_ε(a|s) Q(s, a), π_ε greedy in Q with prob. 1 - ε
  let U = new Float64Array(nS);
  for (let it = 0; it < 20000; it += 1) {
    const Q = backup(U);
    const W = Float64Array.from({ length: nS }, (_, s) => {
      if (s === CW.goal) return 0;
      const q = Q.subarray(4 * s, 4 * s + 4), m = Math.max(...q);
      return (1 - eps) * m + (eps / 4) * (q[0] + q[1] + q[2] + q[3]);
    });
    let delta = 0;
    for (let s = 0; s < nS; s += 1) delta = Math.max(delta, Math.abs(W[s] - U[s]));
    U = W;
    if (delta < 1e-10) break;
  }
  const Qsoft = backup(U);
  return { Qstar, Qsoft, qGreedy: epsGreedyValue(Qstar, eps), soft: U[CW.start], optimal: V[CW.start] };
}
/** Greedy path through action values Q from the start. */
export function greedyPath(Q: Float64Array) {
  const path = [CW.start];
  for (let s = CW.start, i = 0; s !== CW.goal && i < 60; i += 1) {
    const q = Q.subarray(4 * s, 4 * s + 4);
    s = cliffStep(s, q.indexOf(Math.max(...q)))[0];
    path.push(s);
  }
  return path;
}

/* ---------- helpers for the plots ---------- */
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
