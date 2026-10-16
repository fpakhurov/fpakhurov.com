/**
 * Gradient boosting with squared loss in one dimension, on the decision-tree note's problem y = sin 2πx + N(0, 0.3²).
 * Stages: 50 training points, stumps (depth-1 trees), learning rate 0.5. Loss curves: 50 training and 50 validation
 * points, depth-3 trees, learning rates 1 and 0.1, 300 rounds.
 */
import { growTree, predict, steps1D, type TreeNode } from '../decision-trees/cart';
import { f, sample } from '../decision-trees/data';
import { mulberry32, normal } from '../random';

const u = mulberry32(7), z = normal(u);
export const train = sample(u, z, 50);
export const valid = sample(u, z, 50);
const X = train.xs.map((x) => [x]);
const boost = (nu: number, depth: number, rounds: number, onRound?: (m: number, tree: TreeNode, resid: number[], F: number[]) => void) => {
  const f0 = train.ys.reduce((a, b) => a + b, 0) / train.ys.length;
  const F = train.ys.map(() => f0), Fv = valid.xs.map(() => f0), trees: TreeNode[] = [];
  const trainLoss: number[] = [], validLoss: number[] = [];
  for (let m = 1; m <= rounds; m++) {
    const resid = train.ys.map((y, i) => y - F[i]);
    const tree = growTree(X, resid, { maxDepth: depth });
    trees.push(tree);
    train.xs.forEach((x, i) => (F[i] += nu * predict(tree, [x])));
    valid.xs.forEach((x, i) => (Fv[i] += nu * predict(tree, [x])));
    onRound?.(m, tree, resid, F);
    trainLoss.push(train.ys.reduce((a, y, i) => a + (y - F[i]) ** 2, 0) / train.ys.length);
    validLoss.push(valid.ys.reduce((a, y, i) => a + (y - Fv[i]) ** 2, 0) / valid.ys.length);
  }
  return { f0, trees, trainLoss, validLoss };
};

/** The fit F_m(x) as a step function on [0, 1], from the initial constant and the shrunken trees. */
const fitSteps = (f0: number, trees: TreeNode[], nu: number) => {
  const cuts = [...new Set(trees.flatMap((t) => steps1D(t, 0, 1).map((s) => s[1])))].sort((a, b) => a - b);
  let a = 0;
  return cuts.map((b) => { const mid = (a + b) / 2, s: [number, number, number] = [a, b, f0 + nu * trees.reduce((acc, t) => acc + predict(t, [mid]), 0)]; a = b; return s; });
};
export const stageNu = 0.5;
export const shown = [1, 2, 5, 40];
export const stages: { m: number; resid: number[]; tree: [number, number, number][]; fit: [number, number, number][]; loss: number }[] = [];
const run = boost(stageNu, 1, 40, (m, tree, resid) => {
  if (shown.includes(m)) stages.push({ m, resid, tree: steps1D(tree, 0, 1), fit: [], loss: 0 });
});
for (const s of stages) { s.fit = fitSteps(run.f0, run.trees.slice(0, s.m), stageNu); s.loss = run.trainLoss[s.m - 1]; }
export const truth = f;

export const rounds = 300;
export const curves = [1, 0.1].map((nu) => {
  const r = boost(nu, 3, rounds);
  const bestRound = r.validLoss.indexOf(Math.min(...r.validLoss)) + 1;
  return { nu, trainLoss: r.trainLoss, validLoss: r.validLoss, bestRound, bestLoss: r.validLoss[bestRound - 1] };
});
