// Original four-position experiment authored for this project with Codex assistance.
// No trained model, image, dataset, or upstream diagram is used.
export const feature = [-3, -1, 1, 3];
export const noise = [1, -1, -1, 1];
export const mean = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length;
export const variance = (v: number[]) => {
  const m = mean(v);
  return mean(v.map(x => (x - m) ** 2));
};
export const cases = [
  { noiseScale: 0.5, scale: 1, shift: 0 },
  { noiseScale: 0.5, scale: 2, shift: 1 },
  { noiseScale: -0.5, scale: 1, shift: 0 },
].map(c => {
  const input = feature.map((v, i) => v + c.noiseScale * noise[i]);
  const m = mean(input), sd = Math.sqrt(variance(input));
  const output = input.map(v => c.scale * (v - m) / sd + c.shift);
  return { ...c, input, output, mean: mean(output), std: Math.sqrt(variance(output)) };
});
