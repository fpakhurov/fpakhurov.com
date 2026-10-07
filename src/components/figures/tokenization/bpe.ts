/**
 * Byte-pair encoding on the toy corpus of the tokenization note, computed at build time
 * so that every figure agrees with the worked example in the text.
 */

export type Pair = readonly [string, string];

/** Word types and their counts after normalization and pre-tokenization. */
export const corpus: ReadonlyArray<readonly [string, number]> = [
  ['sing', 6],
  ['singer', 3],
  ['sings', 4],
  ['ring', 5],
  ['rings', 2],
  ['song', 3],
];

export interface Step {
  /** Merge number k, from 1. */
  k: number;
  pair: Pair;
  token: string;
  /** Frequency-weighted count c_k(a, b) of the merged pair. */
  count: number;
  /** All pairs that shared the top count (ties), alphabetical; the first one is merged. */
  ties: Pair[];
  /** Vocabulary size and corpus length in tokens after the merge. */
  vocab: number;
  length: number;
  splits: string[][];
}

/** Merge every non-overlapping adjacent occurrence of (a, b), working from left to right. */
export function mergePair(units: readonly string[], [a, b]: Pair): string[] {
  const out: string[] = [];
  for (let i = 0; i < units.length; i += 1) {
    if (i + 1 < units.length && units[i] === a && units[i + 1] === b) {
      out.push(a + b);
      i += 1;
    } else out.push(units[i]);
  }
  return out;
}

/** Frequency-weighted counts of adjacent pairs. */
export function pairCounts(splits: readonly (readonly string[])[], counts: readonly number[]) {
  const m = new Map<string, { pair: Pair; count: number }>();
  splits.forEach((s, w) => {
    for (let i = 0; i + 1 < s.length; i += 1) {
      const key = `${s[i]}\u0000${s[i + 1]}`;
      const e = m.get(key) ?? { pair: [s[i], s[i + 1]] as Pair, count: 0 };
      e.count += counts[w];
      m.set(key, e);
    }
  });
  return [...m.values()];
}

const cmpPair = (p: Pair, q: Pair) => (p[0] === q[0] ? (p[1] < q[1] ? -1 : p[1] > q[1] ? 1 : 0) : p[0] < q[0] ? -1 : 1);

/** Train BPE for n merges; ties are broken by the alphabetical order of the pair. */
export function train(n: number) {
  const counts = corpus.map(([, c]) => c);
  let splits = corpus.map(([w]) => [...w]);
  const alphabet = [...new Set(corpus.flatMap(([w]) => [...w]))].sort();
  const lengthOf = (s: string[][]) => s.reduce((acc, u, w) => acc + u.length * counts[w], 0);
  const initial = { vocab: alphabet.length, length: lengthOf(splits), splits };
  const steps: Step[] = [];
  for (let k = 1; k <= n; k += 1) {
    const pc = pairCounts(splits, counts);
    if (pc.length === 0) break;
    const best = Math.max(...pc.map((p) => p.count));
    const ties = pc.filter((p) => p.count === best).map((p) => p.pair).sort(cmpPair);
    const pair = ties[0];
    splits = splits.map((s) => mergePair(s, pair));
    steps.push({ k, pair, token: pair[0] + pair[1], count: best, ties, vocab: alphabet.length + k, length: lengthOf(splits), splits });
  }
  const vocabulary = [...alphabet, ...steps.map((s) => s.token)];
  return { alphabet, initial, steps, merges: steps.map((s) => s.pair), vocabulary, words: corpus.map(([w]) => w), counts };
}

export const toy = train(8);

/** Encode a word by replaying the merges in the order they were learned; records which rules fired. */
export function encodeByMerges(word: string, merges: readonly Pair[] = toy.merges) {
  let units = [...word];
  const trace = merges.map((pair, i) => {
    const next = mergePair(units, pair);
    const fired = next.length !== units.length;
    units = next;
    return { rule: i + 1, pair, fired, units: [...units] };
  });
  return { units, trace };
}

/** Encode a word by greedy longest match from the left; unmatched characters become [UNK]. */
export function encodeLongestMatch(word: string, vocabulary: readonly string[] = toy.vocabulary) {
  const vocab = new Set(vocabulary);
  const out: string[] = [];
  let i = 0;
  while (i < word.length) {
    let j = word.length;
    while (j > i && !vocab.has(word.slice(i, j))) j -= 1;
    if (j === i) {
      out.push('[UNK]');
      i += 1;
    } else {
      out.push(word.slice(i, j));
      i = j;
    }
  }
  return out;
}

/** Map characters outside the training alphabet to [UNK] before replaying merges. */
export function encodeCharBase(word: string) {
  const known = new Set(toy.alphabet);
  const { units } = encodeByMerges(word);
  return units.map((u) => ([...u].every((c) => known.has(c)) ? u : '[UNK]'));
}

/**
 * First WordPiece step on the same corpus. Non-initial characters carry the ## prefix,
 * so s at the start of a word and ##s inside it are different units.
 */
export function wordpieceFirstStep() {
  const counts = corpus.map(([, c]) => c);
  const splits = corpus.map(([w]) => [...w].map((c, i) => (i === 0 ? c : `##${c}`)));
  const unit = new Map<string, number>();
  splits.forEach((s, w) => s.forEach((u) => unit.set(u, (unit.get(u) ?? 0) + counts[w])));
  const pairs = pairCounts(splits, counts).map(({ pair, count }) => ({
    pair,
    count,
    score: count / ((unit.get(pair[0]) ?? 1) * (unit.get(pair[1]) ?? 1)),
  }));
  return { unit, pairs };
}

/**
 * Tokens per word against vocabulary size for BPE trained on our own English text: the prose of
 * 11 of the 15 Generative Models notes on this site (lowercased, letters a–z only, 26,990 running
 * words, 2,790 types), evaluated on the other four (DDPM forward process, DDPM training objective,
 * FID, LPIPS; 8,908 running words). Merges as in `train`, ties broken by first occurrence;
 * encoding replays merges by rank. Prose = MDX body without frontmatter, import lines, fenced code,
 * $$…$$ and $…$ math and HTML/JSX tags; words = /[a-z]+/ on lowercased text. Frozen here in
 * October 2026 because the notes keep changing.
 * Columns: merges, |V|, tokens per word on the training text, tokens per word on held-out text.
 */
export const fertility: ReadonlyArray<readonly [number, number, number, number]> = [
  [0, 26, 4.995, 4.924],
  [3, 29, 4.679, 4.627],
  [10, 36, 4.193, 4.176],
  [20, 46, 3.823, 3.801],
  [30, 56, 3.584, 3.589],
  [50, 76, 3.269, 3.268],
  [100, 126, 2.832, 2.839],
  [200, 226, 2.38, 2.43],
  [300, 326, 2.119, 2.172],
  [500, 526, 1.807, 1.904],
  [700, 726, 1.614, 1.737],
  [1000, 1026, 1.43, 1.567],
  [1500, 1526, 1.261, 1.414],
  [2000, 2026, 1.168, 1.318],
];

/** Word-level vocabulary of the same training text, and the share of held-out running words outside it. */
export const wordLevel = { vocab: 2790, heldOutUnk: 841 / 8908 };

/** The phrase of the granularity figure, segmented by the same BPE after 0, 100 and 2,000 merges. */
export const phrase = {
  chars: ['t h e', 'd e c o d e r', 'l e a r n s', 't o k e n i z a t i o n'],
  bpe100: ['the', 'de co der', 'le ar n s', 'to k en iz ation'],
  bpe2000: ['the', 'decoder', 'learns', 'to k en ization'],
  // "tokenization" does not occur in the training text, so a word vocabulary has no entry for it.
  words: ['the', 'decoder', 'learns', '[UNK]'],
};
