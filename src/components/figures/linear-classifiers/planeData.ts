/**
 * The geometry figure of the linear classifiers note: two seeded Gaussian clouds in the plane and the fixed
 * hyperplane 3x₁ + 4x₂ − 5 = 0 of the worked example (w = (3, 4), b = −5, ‖w‖ = 5). Margins, distances and
 * the number of misclassified points are computed here and asserted, so the text, the figure and its caption agree.
 */
import { mulberry32, normal } from '../random';

export type Pt = { x: [number, number]; y: 1 | -1; score: number; margin: number };

export const w: [number, number] = [3, 4];
export const b = -5;
export const norm = Math.hypot(w[0], w[1]);
const score = (x: [number, number]) => w[0] * x[0] + w[1] * x[1] + b;

const z = normal(mulberry32(78));
const cloud = (n: number, mean: [number, number], sd: number, y: 1 | -1): Pt[] =>
  Array.from({ length: n }, () => {
    const x: [number, number] = [mean[0] + sd * z(), mean[1] + sd * z()];
    const s = score(x);
    return { x, y, score: s, margin: y * s };
  });

export const points: Pt[] = [...cloud(22, [2.3, 1.7], 0.75, 1), ...cloud(22, [-0.3, -0.7], 0.75, -1)];
export const wrong = points.filter((p) => p.margin < 0);

/** The worked example of the text: x = (3, 1), score 8, distance 8/5 = 1.6, foot of the perpendicular (2.04, −0.28). */
export const example = { x: [3, 1] as [number, number], score: score([3, 1]) };
export const exampleDist = example.score / norm;
export const foot: [number, number] = [3 - (example.score / (norm * norm)) * w[0], 1 - (example.score / (norm * norm)) * w[1]];

/** The point closest to the boundary among the correctly classified ones, and the worst misclassified one. */
export const nearest = points.filter((p) => p.margin > 0).reduce((a, p) => (p.margin < a.margin ? p : a));
export const worst = wrong.reduce((a, p) => (p.margin < a.margin ? p : a), wrong[0]);

if (example.score !== 8 || Math.abs(exampleDist - 1.6) > 1e-12) throw new Error('planeData: worked example drifted');
if (Math.abs(foot[0] - 2.04) > 1e-9 || Math.abs(foot[1] + 0.28) > 1e-9) throw new Error('planeData: foot of the perpendicular drifted');
if (wrong.length !== 2) throw new Error(`planeData: expected 2 misclassified points, got ${wrong.length}`);
for (const p of points) {
  if (p.x[0] < -2.4 || p.x[0] > 4.9 || p.x[1] < -2.4 || p.x[1] > 3.9) throw new Error('planeData: a point left the plot box');
}
