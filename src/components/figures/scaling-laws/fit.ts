/**
 * The parametric loss fit of Hoffmann et al. (2022), Approach 3, with the constants printed in the paper (eq. 10):
 *   L(N, D) = E + A / N^alpha + B / D^beta,   loss in nats per token on their training distribution.
 * Shared by the figures of the scaling-laws note so that every figure uses the same numbers.
 */
export const E = 1.69;
export const A = 406.4;
export const B = 410.7;
export const alpha = 0.34;
export const beta = 0.28;

/** Training budget of Gopher and Chinchilla as counted by Hoffmann et al. (FLOPs). */
export const GOPHER_C = 5.76e23;

export const paramTerm = (N: number) => A / N ** alpha;
export const dataTerm = (D: number) => B / D ** beta;
export const loss = (N: number, D: number) => E + paramTerm(N) + dataTerm(D);

/** Loss along the iso-FLOP curve C = 6 N D. */
export const isoLoss = (C: number, N: number) => loss(N, C / (6 * N));

/** Closed-form compute-optimal split under C = 6 N D: N = G (C/6)^a, D = (C/6) / N. */
export const aExp = beta / (alpha + beta);
export const G = ((alpha * A) / (beta * B)) ** (1 / (alpha + beta));
export function optimum(C: number) {
  const N = G * (C / 6) ** aExp;
  return { N, D: C / (6 * N), L: isoLoss(C, N) };
}

/** Tokens needed for a model of N parameters to reach loss `target` (Infinity if it never does). */
export function tokensFor(N: number, target: number) {
  const gap = target - E - paramTerm(N);
  return gap > 0 ? (B / gap) ** (1 / beta) : Infinity;
}

/** Throws at build time when a number quoted in a caption or in the note drifts. */
export function check(figure: string, name: string, got: number, want: number, relTol: number) {
  if (!(Math.abs(got - want) <= relTol * Math.abs(want))) {
    throw new Error(`${figure}: ${name} = ${got}, expected ${want}`);
  }
}

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
/** 10 with a superscript exponent, e.g. pow10(21) = '10²¹'. */
export const pow10 = (k: number) => `10${String(k).split('').map((c) => SUP[c]).join('')}`;
