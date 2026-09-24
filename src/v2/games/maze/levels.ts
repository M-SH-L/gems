/**
 * Legend:
 *   #  wall      .  floor     O  hole
 *   S  start     G  goal      *  bonus gem (optional)
 */
export interface MazeLevel {
  name: string;
  rows: string[];
}

export const mazeLevels: MazeLevel[] = [
  {
    name: 'First Roll',
    rows: [
      '###########',
      '#S....#...#',
      '#.###.#.#.#',
      '#.#*....#.#',
      '#.#.###.#.#',
      '#...#...#G#',
      '###########',
    ],
  },
  {
    name: 'Pothole Lane',
    rows: [
      '#############',
      '#S..O.......#',
      '#.#####.###.#',
      '#.....#..*#.#',
      '###.#.#.#.#.#',
      '#G..O...#...#',
      '#############',
    ],
  },
  {
    name: 'Swiss Meadow',
    rows: [
      '#############',
      '#S....O.....#',
      '#..O.....O..#',
      '#.....O..*..#',
      '#.O.......O.#',
      '#*...O..O...#',
      '#..O.......G#',
      '#############',
    ],
  },
  {
    name: 'Switchbacks',
    rows: [
      '###############',
      '#S#.....O.....#',
      '#.#.###.#####.#',
      '#.O.#.*.#...#.#',
      '#.###.###.#.#.#',
      '#.....O...#...#',
      '#####.#####O#.#',
      '#G....O.......#',
      '###############',
    ],
  },
  {
    name: 'Cliff Walk',
    rows: [
      '#############',
      '#S.........O#',
      '#OOOOOOOO..O#',
      '#*.........O#',
      '#..OOOOOOOOO#',
      '#..........*#',
      '#OOOOOOOOO..#',
      '#G..........#',
      '#############',
    ],
  },
];

export type Cell = '#' | '.' | 'O' | 'S' | 'G' | '*';

export interface ParsedLevel {
  name: string;
  cols: number;
  rows: number;
  grid: Cell[][];
  start: { x: number; z: number };
  goal: { x: number; z: number };
  gems: { id: string; x: number; z: number }[];
}

/** Convert grid indices to board-local coordinates (board centred on origin). */
export function cellCenter(level: { cols: number; rows: number }, col: number, row: number) {
  return { x: col - (level.cols - 1) / 2, z: row - (level.rows - 1) / 2 };
}

export function parseLevel(level: MazeLevel): ParsedLevel {
  const rows = level.rows.length;
  const cols = level.rows[0].length;
  const grid = level.rows.map((r) => r.split('') as Cell[]);
  const parsed: ParsedLevel = { name: level.name, cols, rows, grid, start: { x: 0, z: 0 }, goal: { x: 0, z: 0 }, gems: [] };
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      const p = cellCenter(parsed, c, r);
      if (cell === 'S') parsed.start = p;
      else if (cell === 'G') parsed.goal = p;
      else if (cell === '*') parsed.gems.push({ id: `${c},${r}`, ...p });
    }
  }
  return parsed;
}
