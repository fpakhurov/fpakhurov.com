/**
 * Test error against the number of trees for bagging (every feature tried at every split) and a random forest
 * (√d features), on two Gaussian classes in d = 30 dimensions: x ~ N(μ_c, I), with class means drawn once as
 * N(0, 0.3² I). Every feature carries a little of the signal, as pixels do. Fully grown trees on 300 training
 * points; the ensemble averages the trees' class-1 shares and predicts class 1 above one half. Test error on
 * 2,000 fresh points; the forest's out-of-bag error on the training points uses only trees that did not see them.
 */
import { growTree, predict, bootstrap } from '../decision-trees/cart';
import { mulberry32, normal } from '../random';

export const d = 30, nTrain = 300, nTest = 2000, B = 150;
export const mForest = Math.round(Math.sqrt(d));
const u = mulberry32(2), z = normal(u);
const mu = [0, 1].map(() => Array.from({ length: d }, () => 0.3 * z()));
const gen = (m: number) => {
  const X: number[][] = [], y: number[] = [];
  for (let i = 0; i < m; i++) { const c = u() < 0.5 ? 0 : 1; y.push(c); X.push(mu[c].map((v) => v + z())); }
  return { X, y };
};
const train = gen(nTrain), test = gen(nTest);
const run = (mtry: number) => {
  const sum = new Array(nTest).fill(0), oobSum = new Array(nTrain).fill(0), oobCnt = new Array(nTrain).fill(0);
  const testErr: number[] = [], oobErr: number[] = [];
  for (let b = 0; b < B; b++) {
    const idx = bootstrap(nTrain, u);
    const tree = growTree(train.X, train.y, { mtry, rand: u }, idx);
    test.X.forEach((x, i) => (sum[i] += predict(tree, x)));
    testErr.push(test.y.reduce((s, y, i) => s + (Number(sum[i] / (b + 1) > 0.5) !== y ? 1 : 0), 0) / nTest);
    const inBag = new Set(idx);
    for (let i = 0; i < nTrain; i++) if (!inBag.has(i)) { oobSum[i] += predict(tree, train.X[i]); oobCnt[i]++; }
    let wrong = 0, seen = 0;
    for (let i = 0; i < nTrain; i++) if (oobCnt[i]) { seen++; if (Number(oobSum[i] / oobCnt[i] > 0.5) !== train.y[i]) wrong++; }
    oobErr.push(wrong / seen);
  }
  return { testErr, oobErr };
};
export const bagging = run(d);
export const forest = run(mForest);
