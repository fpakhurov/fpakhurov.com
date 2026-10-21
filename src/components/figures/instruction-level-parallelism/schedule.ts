/**
 * The scheduling model of the instruction-level-parallelism note (the same as the Python of its Code section):
 * the loop x[i] = k * x[i], with latencies 3 (lw), 3 (mul) and 1 (everything else).
 */
export interface Ins { op: string; dst: string | null; srcs: string[]; lat: number }
export const BODY: Ins[] = [
  { op: 'lw', dst: 't0', srcs: ['a0'], lat: 3 },
  { op: 'mul', dst: 't0', srcs: ['t0', 'a2'], lat: 3 },
  { op: 'sw', dst: null, srcs: ['t0', 'a0'], lat: 1 },
  { op: 'addi', dst: 'a0', srcs: ['a0'], lat: 1 },
  { op: 'bne', dst: null, srcs: ['a0', 'a1'], lat: 1 },
];
const prog = (n: number) => Array.from({ length: n }, () => BODY).flat();

/** Start cycles when instructions start in program order, at most `width` per cycle. */
export function inOrder(n: number, width: number): number[] {
  const ready: Record<string, number> = {};
  let t = 0, used = 0;
  const start: number[] = [];
  for (const ins of prog(n)) {
    const s = Math.max(t, ...ins.srcs.map((r) => ready[r] ?? 0));
    if (s > t) { t = s; used = 0; }
    if (used === width) { t += 1; used = 0; }
    start.push(t); used += 1;
    if (ins.dst) ready[ins.dst] = t + ins.lat;
  }
  return start;
}

/** Out-of-order core with renaming and speculation: `width` enter per cycle, a window of `window` entries. */
export function outOfOrder(n: number, width: number, window: number) {
  const p = prog(n);
  const enter: number[] = [], start: number[] = [], done: number[] = [], retire: number[] = [];
  const writer: Record<string, number> = {};
  p.forEach((ins, i) => {
    let e = enter.length ? enter[enter.length - 1] : 0;
    if (i >= width && enter[i - width] === e) e += 1;
    if (i >= window) e = Math.max(e, retire[i - window] + 1);
    const t = Math.max(e, ...ins.srcs.filter((r) => r in writer).map((r) => done[writer[r]]));
    enter.push(e); start.push(t); done.push(t + ins.lat);
    retire.push(Math.max(t + ins.lat, retire.length ? retire[retire.length - 1] : 0));
    if (ins.dst) writer[ins.dst] = i;
  });
  return { enter, start, done, retire };
}

export const finish = (start: number[]) => Math.max(...start.map((s, i) => s + BODY[i % BODY.length].lat));
