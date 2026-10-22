/**
 * Best-first search with f = g + w·h, as in the Code section of the note: w = 0 is uniform-cost search, w = 1 is A*,
 * w > 1 is weighted A*. Ties in f go to the larger g, then to the earlier insertion. The frontier is a plain array:
 * the problems of the figures are small.
 */
export interface SearchStep<S> { node: S; g: number; f: number; frontier: { node: S; f: number }[] }
export interface SearchResult<S> { path: S[]; cost: number; steps: SearchStep<S>[] }

export function bestFirst<S>(
  start: S, goal: S, neighbours: (s: S) => [S, number][], h: (s: S) => number, w: number, key: (s: S) => string = String,
): SearchResult<S> {
  type Entry = { node: S; g: number; f: number; order: number };
  let order = 0;
  const frontier: Entry[] = [{ node: start, g: 0, f: w * h(start), order: order++ }];
  const g = new Map<string, number>([[key(start), 0]]);
  const parent = new Map<string, S | null>([[key(start), null]]);
  const closed = new Set<string>();
  const steps: SearchStep<S>[] = [];
  while (frontier.length) {
    let bi = 0;
    for (let i = 1; i < frontier.length; i++) {
      const a = frontier[i], b = frontier[bi];
      if (a.f < b.f || (a.f === b.f && (a.g > b.g || (a.g === b.g && a.order < b.order)))) bi = i;
    }
    const [e] = frontier.splice(bi, 1);
    const k = key(e.node);
    if (closed.has(k)) continue;
    closed.add(k);
    if (k !== key(goal)) {
      for (const [m, c] of neighbours(e.node)) {
        const km = key(m);
        if (closed.has(km)) continue;
        if (e.g + c < (g.get(km) ?? Infinity)) {
          g.set(km, e.g + c);
          parent.set(km, e.node);
          frontier.push({ node: m, g: e.g + c, f: e.g + c + w * h(m), order: order++ });
        }
      }
    }
    // the frontier as the search sees it next: the best live entry of every node not yet expanded
    const live = new Map<string, Entry>();
    for (const x of frontier) {
      const kx = key(x.node);
      if (closed.has(kx) || x.g !== g.get(kx)) continue;
      live.set(kx, x);
    }
    steps.push({ node: e.node, g: e.g, f: e.f, frontier: [...live.values()].sort((a, b) => a.f - b.f || b.g - a.g || a.order - b.order).map((x) => ({ node: x.node, f: x.f })) });
    if (k === key(goal)) {
      const path = [e.node];
      while (parent.get(key(path[path.length - 1]))) path.push(parent.get(key(path[path.length - 1]))!);
      return { path: path.reverse(), cost: e.g, steps };
    }
  }
  return { path: [], cost: Infinity, steps };
}
