/**
 * Data of the decision-tree figures: a two-class toy set whose classes swap with x₁ (an interaction), and
 * one-dimensional regression trees of growing depth fitted to two independent samples.
 */
import { growTree, steps1D, leaves, type TreeNode } from './cart';
import { mulberry32, normal } from '../random';

/** Points (x₁, x₂, class). Left of x₁ ≈ 0.44 class 1 sits low; right of it class 1 sits high. */
export const toy: [number, number, number][] = [
  [0.12, 0.18, 1], [0.30, 0.12, 1],
  [0.08, 0.55, 0], [0.22, 0.70, 0], [0.33, 0.45, 0], [0.15, 0.88, 0], [0.28, 0.92, 0], [0.36, 0.66, 0],
  [0.52, 0.72, 1], [0.63, 0.85, 1], [0.75, 0.62, 1], [0.86, 0.90, 1], [0.92, 0.70, 1], [0.58, 0.95, 1], [0.80, 0.78, 1],
  [0.55, 0.20, 0], [0.70, 0.35, 0], [0.88, 0.15, 0],
];
export const toyTree: TreeNode = growTree(toy.map(([a, b]) => [a, b]), toy.map((p) => p[2]));
/** Gini index of a node from the share p of class 1 (two classes). */
export const gini = (node: TreeNode) => 2 * node.value * (1 - node.value);
const L = toyTree.left!, R = toyTree.right!;
const ok = toyTree.feature === 0 && Math.abs(toyTree.threshold! - 0.44) < 1e-9
  && L.feature === 1 && Math.abs(L.threshold! - 0.315) < 1e-9 && R.feature === 1 && Math.abs(R.threshold! - 0.485) < 1e-9
  && leaves(toyTree).length === 4 && leaves(toyTree).every((v) => v.sse === 0);
if (!ok) throw new Error('decision-trees/data: the toy tree is not the one the figure draws');

/** y = sin 2πx + N(0, 0.3²), x uniform on [0, 1]. */
export const f = (x: number) => Math.sin(2 * Math.PI * x);
export const sigma = 0.3;
export const nTrain = 40;
export const sample = (rand: () => number, z: () => number, n = nTrain) => {
  const xs = Array.from({ length: n }, () => rand());
  return { xs, ys: xs.map((x) => f(x) + sigma * z()) };
};
const u = mulberry32(14), z = normal(u);
export const samples = [sample(u, z), sample(u, z)];
export const depths = [1, 3, Infinity];
const grid = Array.from({ length: 2001 }, (_, i) => i / 2000);
const valueAt = (st: [number, number, number][], x: number) => st.find(([a, b]) => x >= a && x <= b)![2];
export const depthFits = depths.map((depth) => {
  const trees = samples.map((s) => growTree(s.xs.map((x) => [x]), s.ys, { maxDepth: depth }));
  const st = trees.map((t) => steps1D(t, 0, 1));
  const train = samples[0].xs.reduce((acc, x, i) => acc + (valueAt(st[0], x) - samples[0].ys[i]) ** 2, 0) / nTrain;
  const test = sigma ** 2 + grid.reduce((acc, x) => acc + (valueAt(st[0], x) - f(x)) ** 2, 0) / grid.length;
  const gap = grid.reduce((acc, x) => acc + (valueAt(st[0], x) - valueAt(st[1], x)) ** 2, 0) / grid.length;
  return { depth, steps: st, leaves: leaves(trees[0]).length, train, test, gap };
});
