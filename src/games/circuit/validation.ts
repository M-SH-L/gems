import type { Cell, PathMap, PuzzleLevel } from './types';

export function cellKey(cell: Cell): string {
  return `${cell.r},${cell.c}`;
}

export function tupleKey(tuple: [number, number]): string {
  return `${tuple[0]},${tuple[1]}`;
}

export function isAdjacent(a: Cell, b: Cell): boolean {
  return Math.abs(a.r - b.r) + Math.abs(a.c - b.c) === 1;
}

export function buildNodeMap(level: PuzzleLevel): Map<string, { color: string; role: 'source' | 'target' }> {
  const map = new Map<string, { color: string; role: 'source' | 'target' }>();
  for (const node of level.nodes) {
    map.set(`${node.source[0]},${node.source[1]}`, { color: node.color, role: 'source' });
    map.set(`${node.target[0]},${node.target[1]}`, { color: node.color, role: 'target' });
  }
  return map;
}

export function isPathComplete(path: Cell[], level: PuzzleLevel, color: string): boolean {
  const pair = level.nodes.find((node) => node.color === color);
  if (!pair || path.length < 2) return false;
  const start = path[0];
  const end = path[path.length - 1];
  const sourceKey = `${pair.source[0]},${pair.source[1]}`;
  const targetKey = `${pair.target[0]},${pair.target[1]}`;
  const startKey = cellKey(start);
  const endKey = cellKey(end);
  return (
    (startKey === sourceKey && endKey === targetKey) ||
    (startKey === targetKey && endKey === sourceKey)
  );
}

export function isPathContiguous(path: Cell[]): boolean {
  if (path.length === 0) return false;
  for (let i = 1; i < path.length; i += 1) {
    if (!isAdjacent(path[i - 1], path[i])) return false;
  }
  return true;
}

export function validatePaths(level: PuzzleLevel, paths: PathMap): boolean {
  const nodeMap = buildNodeMap(level);
  const blocked = new Set((level.blockedCells ?? []).map(tupleKey));
  const occupied = new Map<string, string>();

  for (const [color, path] of Object.entries(paths)) {
    if (!isPathContiguous(path)) return false;

    for (const cell of path) {
      const key = cellKey(cell);
      if (cell.r < 0 || cell.c < 0 || cell.r >= level.gridSize || cell.c >= level.gridSize) {
        return false;
      }
      if (blocked.has(key)) return false;

      const node = nodeMap.get(key);
      if (node && node.color !== color) return false;

      const existing = occupied.get(key);
      if (existing && existing !== color) return false;
      occupied.set(key, color);
    }
  }

  return true;
}

export function isLevelComplete(level: PuzzleLevel, paths: PathMap): boolean {
  if (!validatePaths(level, paths)) return false;

  for (const pair of level.nodes) {
    const path = paths[pair.color];
    if (!path || !isPathComplete(path, level, pair.color)) return false;
  }

  if (level.requiresFullCoverage) {
    const blocked = new Set((level.blockedCells ?? []).map(tupleKey));
    const openCells = level.gridSize * level.gridSize - blocked.size;
    const occupied = new Set<string>();
    for (const path of Object.values(paths)) {
      for (const cell of path) {
        occupied.add(cellKey(cell));
      }
    }
    if (occupied.size !== openCells) return false;
  }

  return true;
}

export function cellFromTuple(tuple: [number, number]): Cell {
  return { r: tuple[0], c: tuple[1] };
}
