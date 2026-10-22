/** The grid of the note's Code section: '#' is a wall, S the start, G the goal; moves go to the four neighbours at cost 1. */
export const MAP = [
  '................',
  '...........#....',
  '.....####..#....',
  '........#..#....',
  '........#..#....',
  '.S......#..#..G.',
  '........#..#....',
  '........#.......',
  '.....####.......',
  '................',
];

export function gridProblem() {
  const wall = MAP.map((row) => [...row].map((ch) => ch === '#'));
  const find = (ch: string) => { const r = MAP.findIndex((row) => row.includes(ch)); return [r, MAP[r].indexOf(ch)]; };
  const start = find('S'), goal = find('G');
  const key = (p: number[]) => `${p[0]},${p[1]}`;
  const nb = (p: number[]): [number[], number][] =>
    [[-1, 0], [1, 0], [0, -1], [0, 1]]
      .map(([dr, dc]) => [p[0] + dr, p[1] + dc])
      .filter(([r, c]) => r >= 0 && r < MAP.length && c >= 0 && c < MAP[0].length && !wall[r][c])
      .map((q) => [q, 1] as [number[], number]);
  const h = (p: number[]) => Math.abs(p[0] - goal[0]) + Math.abs(p[1] - goal[1]);
  return { start, goal, nb, h, wall, key };
}
