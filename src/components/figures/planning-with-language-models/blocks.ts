/** The blocks world of the planning note: a state is a sorted list of stacks, each listed from bottom to top. */
export type State = string[][];
export type Move = [string, string]; // block, destination ('T' is the table)

export const canon = (stacks: string[][]): State =>
  stacks.filter((s) => s.length).map((s) => [...s]).sort((a, b) => a.join('').localeCompare(b.join('')));
export const key = (s: State) => s.map((x) => x.join('')).join('|');

export function valid(state: State, [x, d]: Move): boolean {
  const tops = state.map((s) => s[s.length - 1]);
  const onTable = state.some((s) => s[0] === x);
  return tops.includes(x) && x !== d && (d === 'T' || tops.includes(d)) && !(d === 'T' && onTable);
}

export function apply(state: State, [x, d]: Move): State {
  if (!valid(state, [x, d])) throw new Error(`blocks: illegal move ${x} to ${d}`);
  const stacks = state.map((s) => [...s]);
  stacks.find((s) => s[s.length - 1] === x)!.pop();
  if (d === 'T') stacks.push([x]);
  else stacks.find((s) => s[s.length - 1] === d)!.push(x);
  return canon(stacks);
}

/** Block rectangles for drawing a state centred at cx with its table at y = base. */
export function glyph(state: State, cx: number, base: number, size: number, gap: number) {
  const width = state.length * size + (state.length - 1) * gap;
  const x0 = cx - width / 2;
  return state.flatMap((s, i) => s.map((b, j) => ({ b, x: x0 + i * (size + gap), y: base - (j + 1) * size })));
}
