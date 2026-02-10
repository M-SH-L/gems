import type { PuzzleLevel } from '../types';

function createBlockedCells(gridSize: number, openCells: [number, number][]): [number, number][] {
  const openSet = new Set(openCells.map(([r, c]) => `${r},${c}`));
  const blocked: [number, number][] = [];
  for (let r = 0; r < gridSize; r += 1) {
    for (let c = 0; c < gridSize; c += 1) {
      const key = `${r},${c}`;
      if (!openSet.has(key)) blocked.push([r, c]);
    }
  }
  return blocked;
}

function rowCells(row: number, gridSize: number): [number, number][] {
  const cells: [number, number][] = [];
  for (let c = 0; c < gridSize; c += 1) cells.push([row, c]);
  return cells;
}

function columnCells(col: number, gridSize: number): [number, number][] {
  const cells: [number, number][] = [];
  for (let r = 0; r < gridSize; r += 1) cells.push([r, col]);
  return cells;
}

const level4Open = [
  ...rowCells(1, 8),
  ...rowCells(6, 8),
];

const level5Open = [
  ...columnCells(2, 9),
  ...columnCells(6, 9),
];

export const baseLevels: PuzzleLevel[] = [
  {
    gridSize: 5,
    nodes: [
      { color: 'red', source: [0, 0], target: [0, 4] },
      { color: 'blue', source: [4, 0], target: [4, 4] },
    ],
  },
  {
    gridSize: 6,
    nodes: [
      { color: 'red', source: [0, 1], target: [0, 4] },
      { color: 'blue', source: [5, 1], target: [5, 4] },
      { color: 'yellow', source: [2, 0], target: [3, 0] },
    ],
  },
  {
    gridSize: 7,
    nodes: [
      { color: 'red', source: [0, 0], target: [0, 6] },
      { color: 'yellow', source: [3, 0], target: [3, 6] },
      { color: 'blue', source: [6, 0], target: [6, 6] },
    ],
  },
  {
    gridSize: 8,
    nodes: [
      { color: 'red', source: [1, 0], target: [1, 7] },
      { color: 'blue', source: [6, 0], target: [6, 7] },
    ],
    requiresFullCoverage: true,
    blockedCells: createBlockedCells(8, level4Open),
  },
  {
    gridSize: 9,
    nodes: [
      { color: 'red', source: [0, 2], target: [8, 2] },
      { color: 'blue', source: [0, 6], target: [8, 6] },
    ],
    requiresFullCoverage: true,
    blockedCells: createBlockedCells(9, level5Open),
  },
];
