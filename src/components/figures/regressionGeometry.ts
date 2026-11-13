/** Original SVG arithmetic for the reviewed regression examples; composed with Codex assistance. */
export type RegressionPoint = readonly [number, number];

export function scale(domain: RegressionPoint, screen: RegressionPoint) {
  const slope = (screen[1] - screen[0]) / (domain[1] - domain[0]);
  return (value: number) => screen[0] + slope * (value - domain[0]);
}

export function polyline(points: readonly RegressionPoint[]): string {
  const commands: string[] = [];
  for (let index = 0; index < points.length; index += 1) {
    const [x, y] = points[index];
    commands.push(`${index ? 'L' : 'M'} ${Number(x.toFixed(2))} ${Number(y.toFixed(2))}`);
  }
  return commands.join(' ');
}

export function plot(
  fn: (x: number) => number,
  start: number,
  end: number,
  screenX: (x: number) => number,
  screenY: (y: number) => number,
  intervals = 160,
): string {
  const segments: string[] = [];
  let points: RegressionPoint[] = [];
  for (let index = 0; index <= intervals; index += 1) {
    const x = start + (end - start) * index / intervals;
    const y = fn(x);
    if (Number.isFinite(y)) points.push([screenX(x), screenY(y)]);
    else { segments.push(polyline(points)); points = []; }
  }
  segments.push(polyline(points));
  return segments.filter(Boolean).join(' ');
}
