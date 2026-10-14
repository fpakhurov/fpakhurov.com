/**
 * The mixture example of the score matching note: p(x) = 0.8 N(−4, 1) + 0.2 N(4, 1), its noised versions
 * q_σ = p * N(0, σ²), and Langevin chains run with the exact scores, plain and annealed. Seeded, so the
 * note, the figures and their captions share their numbers.
 */
import { mulberry32, normal } from '../random';

export const weight = 0.8, centre = 4;
const gauss = (x: number, m: number, v: number) => Math.exp(-((x - m) ** 2) / (2 * v)) / Math.sqrt(2 * Math.PI * v);
/** Density of the mixture after adding N(0, σ²) noise; σ = 0 is the data distribution. */
export const density = (x: number, sigma: number) => weight * gauss(x, -centre, 1 + sigma * sigma) + (1 - weight) * gauss(x, centre, 1 + sigma * sigma);
/** Its score d/dx log q_σ(x), computed stably through the responsibilities of the two components. */
export const score = (x: number, sigma: number) => {
  const v = 1 + sigma * sigma;
  const l1 = Math.log(weight) - (x + centre) ** 2 / (2 * v), l2 = Math.log(1 - weight) - (x - centre) ** 2 / (2 * v);
  const w1 = 1 / (1 + Math.exp(l2 - l1));
  return (w1 * -(x + centre) + (1 - w1) * -(x - centre)) / v;
};

const chains = 4000;
const rand = mulberry32(7), z = normal(rand);
const start = Array.from({ length: chains }, () => -8 + 16 * rand());

/** Plain Langevin: 2000 steps of size 0.05 with the score of the data itself. */
const plain = start.slice();
for (let k = 0; k < 2000; k++) for (let i = 0; i < chains; i++) plain[i] += 0.025 * score(plain[i], 0) + Math.sqrt(0.05) * z();

/** Annealed Langevin: ten noise levels from 5 down to 0.1, 100 steps each, step 0.002 · (σ / 0.1)². */
export const sigmas = Array.from({ length: 10 }, (_, i) => 5 * (0.1 / 5) ** (i / 9));
const annealed = start.slice();
for (const s of sigmas) {
  const step = 0.002 * (s / 0.1) ** 2;
  for (let k = 0; k < 100; k++) for (let i = 0; i < chains; i++) annealed[i] += (step / 2) * score(annealed[i], s) + Math.sqrt(step) * z();
}

const leftShare = (xs: number[]) => xs.filter((x) => x < 0).length / xs.length;
export const result = { chains, plain, annealed, plainLeft: leftShare(plain), annealedLeft: leftShare(annealed) };
