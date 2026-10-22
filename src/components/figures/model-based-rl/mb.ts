/**
 * Build-time computations of the note "Model-based reinforcement learning": Dyna-Q on the maze of Sutton and Barto
 * (example 8.1), and the compounding error of a linear model of the pendulum fitted by least squares.
 */
import { rng } from '../temporal-difference-learning/td';

/* ---------- 1. Dyna-Q on the 6 x 9 maze ---------- */
export const MAZE = { rows: 6, cols: 9, start: [2, 0], goal: [0, 8], walls: [[1, 2], [2, 2], [3, 2], [4, 5], [0, 7], [1, 7], [2, 7]] };
const MOVES = [[-1, 0], [1, 0], [0, -1], [0, 1]];                // up, down, left, right
const isWall = (r: number, c: number) => MAZE.walls.some(([wr, wc]) => wr === r && wc === c);
export function mazeStep(s: number, a: number): [number, number] {
  const r = Math.floor(s / MAZE.cols), c = s % MAZE.cols;
  let r2 = Math.min(MAZE.rows - 1, Math.max(0, r + MOVES[a][0])), c2 = Math.min(MAZE.cols - 1, Math.max(0, c + MOVES[a][1]));
  if (isWall(r2, c2)) { r2 = r; c2 = c; }
  const s2 = r2 * MAZE.cols + c2;
  return [s2, s2 === MAZE.goal[0] * MAZE.cols + MAZE.goal[1] ? 1 : 0];
}
/** Steps per episode of Dyna-Q with n planning updates per real step, averaged over runs. γ = 0.95, α = 0.1, ε = 0.1. */
export function dynaQ(n: number, runs = 30, episodes = 50, seed = 31) {
  const r = rng(seed + n);
  const nS = MAZE.rows * MAZE.cols, start = MAZE.start[0] * MAZE.cols + MAZE.start[1], goal = MAZE.goal[0] * MAZE.cols + MAZE.goal[1];
  const steps = new Float64Array(episodes);
  const gamma = 0.95, alpha = 0.1, eps = 0.1;
  for (let run = 0; run < runs; run += 1) {
    const Q = new Float64Array(nS * 4);
    const modelS = new Int32Array(nS * 4).fill(-1), modelR = new Float64Array(nS * 4);
    const seen: number[] = [];                                   // state-action pairs observed so far
    const greedy = (s: number) => {
      let best = -Infinity, arg = 0, ties = 0;
      for (let a = 0; a < 4; a += 1) {
        const q = Q[4 * s + a];
        if (q > best) { best = q; arg = a; ties = 1; } else if (q === best) { ties += 1; if (r.u() * ties < 1) arg = a; }
      }
      return arg;
    };
    const maxQ = (s: number) => Math.max(Q[4 * s], Q[4 * s + 1], Q[4 * s + 2], Q[4 * s + 3]);
    for (let ep = 0; ep < episodes; ep += 1) {
      let s = start, t = 0;
      while (s !== goal) {
        const a = r.u() < eps ? r.int(4) : greedy(s);
        const [s2, R] = mazeStep(s, a);
        const k = 4 * s + a;
        Q[k] += alpha * (R + (s2 === goal ? 0 : gamma * maxQ(s2)) - Q[k]);    // direct RL: one Q-learning update
        if (modelS[k] < 0) seen.push(k);
        modelS[k] = s2; modelR[k] = R;                                        // model learning: remember the outcome
        for (let i = 0; i < n; i += 1) {                                      // planning: n updates from the model
          const kk = seen[r.int(seen.length)], ss2 = modelS[kk];
          Q[kk] += alpha * (modelR[kk] + (ss2 === goal ? 0 : gamma * maxQ(ss2)) - Q[kk]);
        }
        s = s2; t += 1;
      }
      steps[ep] += t / runs;
    }
  }
  return steps;
}

/* ---------- 2. the pendulum and a linear model of it ---------- */
// Gym's Pendulum-v1: θ = 0 upright, g = 10, m = l = 1, dt = 0.05, torque in [-2, 2], angular speed clipped to [-8, 8].
const G = 10, DT = 0.05;
export function pendulum(th: number, om: number, u: number): [number, number] {
  const uu = Math.min(2, Math.max(-2, u));
  const om2 = Math.min(8, Math.max(-8, om + ((3 * G) / 2 * Math.sin(th) + 3 * uu) * DT));
  return [th + om2 * DT, om2];
}
const wrap = (x: number) => ((((x + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) - Math.PI;

/** Least squares: argmin_W ||X W - Y||^2 through the normal equations (X has few columns). */
function lstsq(X: number[][], Y: number[][]) {
  const p = X[0].length, q = Y[0].length;
  const A = Array.from({ length: p }, (_, i) => Array.from({ length: p }, (_, j) => X.reduce((s, x) => s + x[i] * x[j], 0)));
  const B = Array.from({ length: p }, (_, i) => Array.from({ length: q }, (_, j) => X.reduce((s, x, n) => s + x[i] * Y[n][j], 0)));
  // Gauss–Jordan on [A | B]
  const M = A.map((row, i) => [...row, ...B[i]]);
  for (let c = 0; c < p; c += 1) {
    let piv = c;
    for (let rr = c + 1; rr < p; rr += 1) if (Math.abs(M[rr][c]) > Math.abs(M[piv][c])) piv = rr;
    [M[c], M[piv]] = [M[piv], M[c]];
    for (let rr = 0; rr < p; rr += 1) {
      if (rr === c) continue;
      const f = M[rr][c] / M[c][c];
      for (let k = c; k < p + q; k += 1) M[rr][k] -= f * M[c][k];
    }
  }
  return Array.from({ length: p }, (_, i) => Array.from({ length: q }, (_, j) => M[i][p + j] / M[i][i]));
}

/** The grid of 25 angles x 17 speeds x 3 torques on which the models are fitted, with the true next states. */
function grid() {
  const X: number[][] = [];
  for (let i = 0; i < 25; i += 1) for (let j = 0; j < 17; j += 1) for (const u of [-2, 0, 2]) X.push([-Math.PI + (2 * Math.PI * i) / 24, -8 + j, u]);
  return X.map(([th, om, u]) => ({ th, om, u, next: pendulum(th, om, u) }));
}
/** A linear model (θ', ω') = W [θ, ω, u, 1] and a feature model (θ' − θ, ω') = W [sin θ, ω, u, 1], both fitted on the grid. */
export function fitModels() {
  const D = grid();
  const Wl = lstsq(D.map((d) => [d.th, d.om, d.u, 1]), D.map((d) => [d.next[0], d.next[1]]));
  const Wf = lstsq(D.map((d) => [Math.sin(d.th), d.om, d.u, 1]), D.map((d) => [d.next[0] - d.th, d.next[1]]));
  const linear = (th: number, om: number, u: number): [number, number] => {
    const x = [th, om, Math.min(2, Math.max(-2, u)), 1];
    return [x.reduce((s, v, i) => s + v * Wl[i][0], 0), x.reduce((s, v, i) => s + v * Wl[i][1], 0)];
  };
  const features = (th: number, om: number, u: number): [number, number] => {
    const x = [Math.sin(th), om, Math.min(2, Math.max(-2, u)), 1];
    return [th + x.reduce((s, v, i) => s + v * Wf[i][0], 0), x.reduce((s, v, i) => s + v * Wf[i][1], 0)];
  };
  // one-step RMS error of the angle over the grid
  const oneStep = (m: typeof linear) => Math.sqrt(D.reduce((s, d) => s + (m(d.th, d.om, d.u)[0] - d.next[0]) ** 2, 0) / D.length);
  return { linear, features, oneLinear: oneStep(linear), oneFeatures: oneStep(features) };
}
/** RMS angle error of free-swinging rollouts (no torque) from 12 start angles, for horizons 1..H. */
export function rolloutError(model: (th: number, om: number, u: number) => [number, number], H = 40) {
  const starts = Array.from({ length: 12 }, (_, i) => -Math.PI + (2 * Math.PI * i) / 12 + 0.1);
  let truth = starts.map((th) => [th, 0] as [number, number]), pred = truth.map((x) => [...x] as [number, number]);
  const out: number[] = [];
  for (let h = 1; h <= H; h += 1) {
    truth = truth.map(([th, om]) => pendulum(th, om, 0));
    pred = pred.map(([th, om]) => model(th, om, 0));
    out.push(Math.sqrt(truth.reduce((s, x, i) => s + wrap(x[0] - pred[i][0]) ** 2, 0) / truth.length));
  }
  return out;
}
