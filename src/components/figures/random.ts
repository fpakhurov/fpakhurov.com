/** Seeded random numbers for figures that run a small simulation at build time. */

/** Mulberry32: a small 32-bit generator; returns a function giving uniforms in [0, 1). */
export const mulberry32 = (seed: number) => () => {
  let a = (seed = (seed + 0x6d2b79f5) | 0);
  a = Math.imul(a ^ (a >>> 15), 1 | a);
  a = (a + Math.imul(a ^ (a >>> 7), 61 | a)) ^ a;
  return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
};

/** Standard normal draws by the Box–Muller transform (the cosine branch only). */
export const normal = (rand: () => number) => () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
