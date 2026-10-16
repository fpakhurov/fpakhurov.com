/**
 * Bias and variance of regression trees by depth, over many training sets of the decision-tree note's problem:
 * 40 points of y = sin 2πx + N(0, 0.3²). Squared bias and variance are averaged over a grid of x in [0, 1].
 */
import { growTree, steps1D } from '../decision-trees/cart';
import { f, sigma, sample } from '../decision-trees/data';
import { mulberry32, normal } from '../random';

export const sets = 200;
/** Depths 1–8 and a fully grown tree (Infinity). */
export const depths = [1, 2, 3, 4, 5, 6, 7, 8, Infinity];
export const grid = Array.from({ length: 201 }, (_, i) => i / 200);
const u = mulberry32(2024), z = normal(u);
const data = Array.from({ length: sets }, () => sample(u, z));
const evalSteps = (st: [number, number, number][]) => {
  let k = 0;
  return grid.map((x) => { while (x > st[k][1] && k < st.length - 1) k++; return st[k][2]; });
};
/** For each depth: the fits (on the grid) of every training set, their mean, squared bias, variance, total error. */
export const byDepth = depths.map((depth) => {
  const fits = data.map((s) => evalSteps(steps1D(growTree(s.xs.map((x) => [x]), s.ys, { maxDepth: depth }), 0, 1)));
  const meanFit = grid.map((_, j) => fits.reduce((a, r) => a + r[j], 0) / sets);
  const bias2 = grid.reduce((a, x, j) => a + (meanFit[j] - f(x)) ** 2, 0) / grid.length;
  const variance = grid.reduce((a, _, j) => a + fits.reduce((b, r) => b + (r[j] - meanFit[j]) ** 2, 0) / sets, 0) / grid.length;
  return { depth, fits, meanFit, bias2, variance, total: sigma ** 2 + bias2 + variance };
});
export const noise = sigma ** 2;
export const best = byDepth.reduce((a, b) => (b.total < a.total ? b : a));
