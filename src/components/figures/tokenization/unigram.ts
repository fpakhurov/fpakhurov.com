/**
 * Viterbi segmentation under a unigram tokenizer, on one word of the toy corpus.
 * The probabilities are toy values chosen for illustration, not trained ones.
 */

/** Toy token probabilities p(t) for the pieces of "singer". */
export const unigramVocab: ReadonlyArray<readonly [string, number]> = [
  ['s', 0.04],
  ['i', 0.03],
  ['n', 0.04],
  ['g', 0.03],
  ['e', 0.05],
  ['r', 0.04],
  ['in', 0.02],
  ['ng', 0.02],
  ['ge', 0.005],
  ['er', 0.05],
  ['sin', 0.004],
  ['ing', 0.04],
  ['ger', 0.003],
  ['sing', 0.03],
  ['singe', 0.002],
];

export interface Arc {
  from: number;
  to: number;
  token: string;
  /** −ln p(token), in nats. */
  cost: number;
}

export function viterbi(word: string, vocab: ReadonlyArray<readonly [string, number]> = unigramVocab) {
  const p = new Map(vocab);
  const n = word.length;
  const arcs: Arc[] = [];
  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j <= n; j += 1) {
      const t = word.slice(i, j);
      const q = p.get(t);
      if (q !== undefined) arcs.push({ from: i, to: j, token: t, cost: -Math.log(q) });
    }
  }
  // best[j]: lowest total cost of a segmentation of word[0:j]; back[j]: the last arc of that segmentation.
  const best: number[] = [0];
  const back: (Arc | null)[] = [null];
  // ways[j]: number of segmentations of word[0:j] over the vocabulary.
  const ways: number[] = [1];
  for (let j = 1; j <= n; j += 1) {
    best[j] = Infinity;
    back[j] = null;
    ways[j] = 0;
    for (const a of arcs.filter((x) => x.to === j)) {
      ways[j] += ways[a.from];
      const c = best[a.from] + a.cost;
      if (c < best[j]) {
        best[j] = c;
        back[j] = a;
      }
    }
  }
  const path: Arc[] = [];
  for (let j = n; j > 0; ) {
    const a = back[j]!;
    path.unshift(a);
    j = a.from;
  }
  // Greedy longest match from the left over the same vocabulary, for contrast.
  const longest: Arc[] = [];
  for (let i = 0; i < n; ) {
    const a = arcs.filter((x) => x.from === i).sort((x, y) => y.to - x.to)[0];
    longest.push(a);
    i = a.to;
  }
  const total = (as: Arc[]) => as.reduce((s, a) => s + a.cost, 0);
  return { word, arcs, best, back, ways: ways[n], path, pathCost: total(path), longest, longestCost: total(longest) };
}

export const lattice = viterbi('singer');
