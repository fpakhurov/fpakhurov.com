/**
 * Shared visual language of the sequence-model figures (RNN → LSTM → seq2seq → attention → self-attention → Transformer).
 * Every figure in the series uses the same colour for the same role, so the reader can follow one idea as it is refined:
 * inputs are green, states that carry information are blue, gates and weights that scale something are amber,
 * outputs and predictions are red. Parts that a model adds to the previous one get an amber dashed "new" outline.
 */
export type Tone = 'x' | 'h' | 'g' | 'y' | 'n';
export const toneVar: Record<Tone, string> = {
  x: 'var(--fig-green)',
  h: 'var(--fig-blue)',
  g: 'var(--fig-amber)',
  y: 'var(--fig-red)',
  n: 'var(--muted)',
};
export const toneText: Record<Tone, string> = { x: 'f-t-green', h: 'f-t-blue', g: 'f-t-amber', y: 'f-t-red', n: 'f-t-muted' };
/** Fixed-point string without a trailing "-0". */
export const fmt = (v: number, digits = 3) => {
  const s = v.toFixed(digits);
  return /^-0\.?0*$/.test(s) ? s.slice(1) : s;
};
