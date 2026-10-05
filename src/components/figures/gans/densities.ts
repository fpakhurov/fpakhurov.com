import { gaussian } from '../geometry';

/** Weighted mixture of Gaussians, given as [weight, mean, sd] triples. */
export const mixture =
  (parts: ReadonlyArray<readonly [number, number, number]>) =>
  (x: number) =>
    parts.reduce((sum, [w, mu, sd]) => sum + w * gaussian(x, mu, sd), 0);

/** Largest value of f on [a, b] (dense sampling). */
export function maxOf(f: (x: number) => number, a: number, b: number, n = 400) {
  let best = -Infinity;
  for (let i = 0; i <= n; i += 1) best = Math.max(best, f(a + ((b - a) * i) / n));
  return best;
}

/** Roots of f on [a, b]: sign changes located by bisection. */
export function roots(f: (x: number) => number, a: number, b: number, n = 400) {
  const found: number[] = [];
  let x0 = a;
  let f0 = f(a);
  for (let i = 1; i <= n; i += 1) {
    const x1 = a + ((b - a) * i) / n;
    const f1 = f(x1);
    if (f0 === 0 || f0 * f1 < 0) {
      let lo = x0;
      let hi = x1;
      for (let k = 0; k < 60; k += 1) {
        const mid = (lo + hi) / 2;
        if (f(lo) * f(mid) <= 0) hi = mid;
        else lo = mid;
      }
      found.push((lo + hi) / 2);
    }
    x0 = x1;
    f0 = f1;
  }
  return found;
}
