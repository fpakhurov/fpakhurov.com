/**
 * Build-time computations of the note "Policy gradients and actor-critic": the short corridor with switched actions
 * (Sutton and Barto, example 13.1), REINFORCE with and without a baseline on it, and PPO's clipped objective.
 */
import { rng } from '../temporal-difference-learning/td';

/** Expected return from the start of the short corridor when every state goes right with probability p: −2(2 − p)/(p(1 − p)). */
export const corridorValue = (p: number) => (-2 * (2 - p)) / (p * (1 - p));
export const pStar = 2 - Math.SQRT2;

/**
 * REINFORCE on the logit h of P(right) = σ(h), starting from P(right) = 0.05, with an extra reward `bonus` at the goal
 * (which leaves the optimal policy unchanged). Returns the number of steps per episode, averaged over runs.
 */
export function reinforce(alpha: number, baseline: boolean, { bonus = 100, alphaW = 2 ** -10, runs = 100, episodes = 1000, seed = 21 } = {}) {
  const r = rng(seed + (baseline ? 1 : 0) + Math.round(-Math.log2(alpha)) * 10);
  const steps = new Float64Array(episodes);
  const acts = new Uint8Array(1000);
  for (let run = 0; run < runs; run += 1) {
    let h = Math.log(0.05 / 0.95), w = 0;
    for (let ep = 0; ep < episodes; ep += 1) {
      const p = 1 / (1 + Math.exp(-h));
      let s = 0, T = 0;
      while (s !== 3 && T < 1000) {
        const a = r.u() < p ? 1 : 0;
        acts[T] = a; T += 1;
        const right = s === 1 ? a === 0 : a === 1;              // in the middle state the actions are swapped
        s = Math.max(0, s + (right ? 1 : -1));
      }
      let g = 0, gw = 0;
      for (let t = 0; t < T; t += 1) {
        const G = bonus - (T - t);                             // reward-to-go: -1 per remaining step, plus the bonus
        g += (G - (baseline ? w : 0)) * (acts[t] - p);         // (G_t - b) ∂ log π(a_t) / ∂h
        gw += G - w;
      }
      h = Math.min(20, Math.max(-20, h + alpha * g));
      if (baseline) w += alphaW * gw;
      steps[ep] += T / runs;
    }
  }
  return steps;
}

/** PPO's clipped objective for one sample, and its derivative with respect to the ratio. */
export function clipObjective(ratio: number, adv: number, eps = 0.2) {
  const clipped = Math.min(Math.max(ratio, 1 - eps), 1 + eps);
  const L = Math.min(ratio * adv, clipped * adv);
  return { L, slope: ratio * adv <= clipped * adv ? adv : 0 };
}

/** GAE on a short trajectory: TD errors and advantages Â_t = δ_t + γλ Â_{t+1}. */
export function gae(rewards: number[], values: number[], gamma: number, lam: number) {
  const delta = rewards.map((rw, t) => rw + gamma * values[t + 1] - values[t]);
  const adv = new Array<number>(rewards.length);
  let g = 0;
  for (let t = rewards.length - 1; t >= 0; t -= 1) { g = delta[t] + gamma * lam * g; adv[t] = g; }
  return { delta, adv };
}
