/**
 * The calibration figure of the logistic regression note. A seeded simulation: true log-odds z ~ N(0, 1.5²),
 * labels y ~ Bernoulli(σ(z)), and an overconfident model whose score is s = σ(2.5 z), the right ranking with
 * log-odds 2.5 times too large. Platt scaling (σ(a·logit s + b), fitted by Newton's method) and isotonic
 * regression (pool adjacent violators) are fitted on 2,000 calibration examples; the reliability diagram and
 * the expected calibration error use 4,000 other test examples. Quoted numbers are asserted.
 */
import { mulberry32, normal } from '../random';

const sigmoid = (t: number) => 1 / (1 + Math.exp(-t));
const logit = (p: number) => Math.log(p / (1 - p));

const rand = mulberry32(2024);
const gauss = normal(mulberry32(17));
const draw = (n: number) =>
  Array.from({ length: n }, () => {
    const z = 1.5 * gauss();
    const y = rand() < sigmoid(z) ? 1 : 0;
    return { s: sigmoid(2.5 * z), y };
  });
const cal = draw(2000);
const test = draw(4000);

/** Platt scaling: logistic regression of y on logit(s), two parameters, Newton's method. */
function platt(obs: { s: number; y: number }[]) {
  let a = 0, b = 0;
  for (let it = 0; it < 50; it++) {
    let ga = 0, gb = 0, haa = 0, hab = 0, hbb = 0;
    for (const o of obs) {
      const u = logit(o.s), p = sigmoid(a * u + b), r = p - o.y, v = p * (1 - p);
      ga += r * u; gb += r; haa += v * u * u; hab += v * u; hbb += v;
    }
    const det = haa * hbb - hab * hab;
    a -= (hbb * ga - hab * gb) / det;
    b -= (haa * gb - hab * ga) / det;
  }
  return { a, b };
}

/** Isotonic regression by pool adjacent violators: a non-decreasing step function of s. */
function isotonic(obs: { s: number; y: number }[]) {
  const sorted = [...obs].sort((p, q) => p.s - q.s);
  const blocks: { lo: number; hi: number; sum: number; n: number }[] = [];
  for (const o of sorted) {
    blocks.push({ lo: o.s, hi: o.s, sum: o.y, n: 1 });
    while (blocks.length > 1 && blocks[blocks.length - 2].sum / blocks[blocks.length - 2].n >= blocks[blocks.length - 1].sum / blocks[blocks.length - 1].n) {
      const last = blocks.pop()!, prev = blocks[blocks.length - 1];
      prev.hi = last.hi; prev.sum += last.sum; prev.n += last.n;
    }
  }
  const steps = blocks.map((k) => ({ lo: k.lo, hi: k.hi, v: k.sum / k.n }));
  // predict: the value of the block containing s; between blocks, the lower block (a step function); clipped at the ends
  const predict = (s: number) => {
    let v = steps[0].v;
    for (const k of steps) if (k.lo <= s) v = k.v;
    return v;
  };
  return { steps, predict };
}

export const P = platt(cal);
export const iso = isotonic(cal);

/** Ten equal-width bins: mean prediction, observed share of positives, count; ECE = Σ (n_b/n) |mean − share|. */
function reliability(pred: number[], ys: number[]) {
  const bins = Array.from({ length: 10 }, () => ({ sp: 0, sy: 0, n: 0 }));
  pred.forEach((p, i) => { const k = Math.min(9, Math.floor(p * 10)); bins[k].sp += p; bins[k].sy += ys[i]; bins[k].n += 1; });
  const pts = bins.filter((b) => b.n > 0).map((b) => ({ conf: b.sp / b.n, freq: b.sy / b.n, n: b.n }));
  const ece = pts.reduce((e, b) => e + (b.n / pred.length) * Math.abs(b.conf - b.freq), 0);
  return { pts, ece };
}
const ys = test.map((o) => o.y);
export const raw = reliability(test.map((o) => o.s), ys);
export const scaled = reliability(test.map((o) => sigmoid(P.a * logit(o.s) + P.b)), ys);
export const isoRel = reliability(test.map((o) => iso.predict(o.s)), ys);
/** Share of test scores below 0.1 or above 0.9: the pile-up at the ends that overconfidence produces. */
export const extremeRaw = test.filter((o) => o.s < 0.1 || o.s > 0.9).length / test.length;
export const extremeTrue = test.filter((o) => { const z = logit(o.s) / 2.5; return sigmoid(z) < 0.1 || sigmoid(z) > 0.9; }).length / test.length;

const r2 = (v: number) => v.toFixed(2), r3 = (v: number) => v.toFixed(3);
export const quoted = { a: r2(P.a), b: r2(P.b), eceRaw: r3(raw.ece), ecePlatt: r3(scaled.ece), eceIso: r3(isoRel.ece), extremeRaw: Math.round(extremeRaw * 100), extremeTrue: Math.round(extremeTrue * 100) };
