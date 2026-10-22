/** Seeded draws from a symmetric Dirichlet distribution, by normalized gamma variables (Marsaglia and Tsang, 2000). */
import { mulberry32, normal } from '../random';

export function dirichletDraws(alpha: number, k: number, count: number, seed: number) {
  const rand = mulberry32(seed), z = normal(rand);
  const gamma = (a: number): number => {
    if (a < 1) return gamma(a + 1) * Math.pow(rand(), 1 / a);       // boost a shape below one
    const d = a - 1 / 3, c = 1 / Math.sqrt(9 * d);
    for (;;) {
      const x = z(), v = (1 + c * x) ** 3;
      if (v <= 0) continue;
      if (Math.log(1 - rand()) < 0.5 * x * x + d - d * v + d * Math.log(v)) return d * v;
    }
  };
  return Array.from({ length: count }, () => {
    const g = Array.from({ length: k }, () => gamma(alpha));
    const s = g.reduce((a, b) => a + b, 0);
    return g.map((v) => v / s);
  });
}
