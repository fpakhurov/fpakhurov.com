/**
 * The token budget of the Code section of the context-and-memory note: an append-only agent loop and the same loop
 * with compaction. At step t the model reads the prefix s, the summary (if any) and the stored steps; each step adds d.
 * Above the high-water mark H everything but the prefix and the last `keep` steps becomes one summary of sigma tokens.
 */
export const S = 3000, D = 1500, WINDOW = 128000, RESERVE = 4000, HIGH = WINDOW / 2, KEEP = 8, SIGMA = 2000;

export function run(T: number, H: number | null) {
  const reads: number[] = [], summarizer: number[] = [];
  let history: number[] = [], summary = 0;
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  for (let t = 1; t <= T; t++) {
    reads.push(S + summary + sum(history));
    history.push(D);
    if (H !== null && S + summary + sum(history) > H) {
      summarizer.push(S + summary + sum(history.slice(0, history.length - KEEP)));
      summary = SIGMA;
      history = history.slice(history.length - KEEP);
    }
  }
  return { reads, summarizer };
}

/** The last step whose context still fits in the window with room for the reply. */
export const lastStep = () => {
  let t = 1;
  while (S + t * D <= WINDOW - RESERVE) t++;
  return t;
};
