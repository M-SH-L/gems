import { describe, expect, it } from 'vitest';
import { circuitContent } from '@/games/circuit/content';
import type { Cell, PathMap, PuzzleLevel } from '@/games/circuit/types';
import { buildNodeMap, isLevelComplete, validatePaths } from '@/games/circuit/validation';

function solveLevel(level: PuzzleLevel): PathMap | null {
  const occupied = new Set<string>();
  const nodeMap = buildNodeMap(level);
  const blocked = new Set((level.blockedCells ?? []).map(([r, c]) => `${r},${c}`));
  const paths: PathMap = {};

  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  const inBounds = (cell: Cell) =>
    cell.r >= 0 && cell.c >= 0 && cell.r < level.gridSize && cell.c < level.gridSize;

  const bfs = (start: Cell, target: Cell, color: string): Cell[] | null => {
    const queue: Cell[] = [start];
    const cameFrom = new Map<string, string>();
    const visited = new Set<string>([`${start.r},${start.c}`]);

    while (queue.length > 0) {
      const current = queue.shift() as Cell;
      if (current.r === target.r && current.c === target.c) {
        const path: Cell[] = [];
        let cursorKey = `${current.r},${current.c}`;
        while (cursorKey) {
          const [r, c] = cursorKey.split(',').map(Number);
          path.push({ r, c });
          const nextKey = cameFrom.get(cursorKey);
          if (!nextKey) break;
          cursorKey = nextKey;
        }
        return path.reverse();
      }

      for (const [dr, dc] of directions) {
        const next = { r: current.r + dr, c: current.c + dc };
        if (!inBounds(next)) continue;
        const key = `${next.r},${next.c}`;
        if (blocked.has(key)) continue;
        if (visited.has(key)) continue;
        const node = nodeMap.get(key);
        if (node && node.color !== color) continue;
        if (occupied.has(key) && !(next.r === target.r && next.c === target.c)) continue;

        visited.add(key);
        cameFrom.set(key, `${current.r},${current.c}`);
        queue.push(next);
      }
    }

    return null;
  };

  for (const pair of level.nodes) {
    const path = bfs(
      { r: pair.source[0], c: pair.source[1] },
      { r: pair.target[0], c: pair.target[1] },
      pair.color
    );
    if (!path) return null;
    paths[pair.color] = path;
    for (const cell of path) {
      occupied.add(`${cell.r},${cell.c}`);
    }
  }

  return paths;
}

describe('circuit scenarios', () => {
  it('auto-solves every circuit level for each theme', () => {
    for (const theme of Object.values(circuitContent)) {
      for (const level of theme.levels) {
        const solution = solveLevel(level);
        expect(solution).toBeTruthy();
        expect(isLevelComplete(level, solution as PathMap)).toBe(true);
      }
    }
  });

  it('rejects crossing paths scenario', () => {
    const level: PuzzleLevel = {
      gridSize: 3,
      nodes: [
        { color: 'red', source: [0, 1], target: [2, 1] },
        { color: 'blue', source: [1, 0], target: [1, 2] },
      ],
    };

    const paths: PathMap = {
      red: [
        { r: 0, c: 1 },
        { r: 1, c: 1 },
        { r: 2, c: 1 },
      ],
      blue: [
        { r: 1, c: 0 },
        { r: 1, c: 1 },
        { r: 1, c: 2 },
      ],
    };

    expect(validatePaths(level, paths)).toBe(false);
  });

  it('clears and retries a path cleanly', () => {
    const level = circuitContent.retro.levels[0];
    const solution = solveLevel(level) as PathMap;

    expect(isLevelComplete(level, solution)).toBe(true);

    const nextPaths = { ...solution };
    delete nextPaths.red;

    expect(isLevelComplete(level, nextPaths)).toBe(false);

    nextPaths.red = solution.red;
    expect(isLevelComplete(level, nextPaths)).toBe(true);
  });
});
