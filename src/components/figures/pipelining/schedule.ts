/**
 * Timing model of the five-stage pipeline IF ID EX MEM WB, the same model as the Code section of the
 * pipelining note. One instruction enters per cycle; the register file is written in the first half of a
 * cycle and read in the second; a load's value exists after MEM, an ALU result after EX; branches are
 * predicted not taken and resolved in EX.
 */
export interface Instr { text: string; dest?: string; srcs: string[]; load?: boolean; taken?: boolean }
export type Stage = 'IF' | 'ID' | 'EX' | 'MEM' | 'WB';
export interface Cell { cycle: number; stage: Stage; repeat: boolean }
export interface Forward { from: number; fromCycle: number; to: number; toCycle: number; path: 'EX/MEM' | 'MEM/WB' }

/** EX cycle of every instruction (cycles count from 1). */
export function schedule(prog: Instr[], forwarding: boolean): number[] {
  const ex: number[] = [];
  prog.forEach((ins, i) => {
    let t = i ? ex[i - 1] + 1 : 3;
    if (i && prog[i - 1].taken) t = Math.max(t, ex[i - 1] + 3);
    for (const s of ins.srcs) {
      let p = -1;
      for (let j = 0; j < i; j++) if (prog[j].dest === s) p = j;
      if (p === -1) continue;
      if (!forwarding) t = Math.max(t, ex[p] + 3);
      else if (prog[p].load) t = Math.max(t, ex[p] + 2);
      else t = Math.max(t, ex[p] + 1);
    }
    ex.push(t);
  });
  return ex;
}

/** Total cycles until the last instruction leaves WB. */
export const totalCycles = (prog: Instr[], forwarding: boolean) => schedule(prog, forwarding)[prog.length - 1] + 2;

/** The cells of the instructions × cycles diagram; a repeated IF or ID is a stall. */
export function cells(prog: Instr[], forwarding: boolean): Cell[][] {
  const ex = schedule(prog, forwarding);
  const f: number[] = [], d: number[] = [];
  return prog.map((_, i) => {
    if (i && prog[i - 1].taken) { f.push(ex[i] - 2); d.push(ex[i] - 1); }
    else { f.push(i ? d[i - 1] : 1); d.push(i ? ex[i - 1] : 2); }
    const row: Cell[] = [];
    for (let c = f[i]; c < d[i]; c++) row.push({ cycle: c, stage: 'IF', repeat: c > f[i] });
    for (let c = d[i]; c < ex[i]; c++) row.push({ cycle: c, stage: 'ID', repeat: c > d[i] });
    row.push({ cycle: ex[i], stage: 'EX', repeat: false }, { cycle: ex[i] + 1, stage: 'MEM', repeat: false }, { cycle: ex[i] + 2, stage: 'WB', repeat: false });
    return row;
  });
}

/** Values that reach an EX stage through a forwarding path rather than the register file. */
export function forwards(prog: Instr[]): Forward[] {
  const ex = schedule(prog, true);
  const out: Forward[] = [];
  prog.forEach((ins, i) => {
    for (const s of ins.srcs) {
      let p = -1;
      for (let j = 0; j < i; j++) if (prog[j].dest === s) p = j;
      if (p === -1) continue;
      const ready = prog[p].load ? ex[p] + 1 : ex[p];      // the cycle at whose end the value exists
      // the register file has it from the producer's WB (ex + 2) on; anything earlier is forwarded
      if (ex[i] - 1 < ex[p] + 2) out.push({ from: p, fromCycle: ready, to: i, toCycle: ex[i], path: ex[i] - ready === 1 && !prog[p].load ? 'EX/MEM' : 'MEM/WB' });
    }
  });
  return out;
}
