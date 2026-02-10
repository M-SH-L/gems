import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import type { Cell, CircuitThemeStyle, PathMap, PuzzleLevel } from './types';
import { buildNodeMap, cellKey, isAdjacent, isPathComplete } from './validation';
import { PuzzleGrid } from './PuzzleGrid';

interface PathDrawerProps {
  level: PuzzleLevel;
  paths: PathMap;
  onPathsChange: (paths: PathMap) => void;
  colors: Record<string, string>;
  style: CircuitThemeStyle;
}

type InputEvent = PointerEvent<SVGSVGElement> | MouseEvent<SVGSVGElement>;

function cellFromPointer(
  event: InputEvent,
  gridSize: number
): Cell | null {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  if (rect.width === 0 || rect.height === 0) return null;
  if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
  const col = Math.min(gridSize - 1, Math.max(0, Math.floor((x / rect.width) * gridSize)));
  const row = Math.min(gridSize - 1, Math.max(0, Math.floor((y / rect.height) * gridSize)));
  return { r: row, c: col };
}

export function PathDrawer({ level, paths, onPathsChange, colors, style }: PathDrawerProps) {
  const [activePath, setActivePath] = useState<Cell[]>([]);
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const pathsRef = useRef(paths);
  useEffect(() => {
    pathsRef.current = paths;
  }, [paths]);

  const activePathRef = useRef<Cell[]>([]);
  const activeColorRef = useRef<string | null>(null);

  const nodeMap = useMemo(() => buildNodeMap(level), [level]);
  const blocked = useMemo(
    () => new Set((level.blockedCells ?? []).map(([r, c]) => `${r},${c}`)),
    [level.blockedCells]
  );

  const pathByCell = useMemo(() => {
    const map = new Map<string, string>();
    for (const [color, path] of Object.entries(paths)) {
      for (const cell of path) {
        map.set(cellKey(cell), color);
      }
    }
    return map;
  }, [paths]);

  const commitPaths = (nextPaths: PathMap) => {
    pathsRef.current = nextPaths;
    onPathsChange(nextPaths);
  };

  const updateActive = (nextPath: Cell[], nextColor: string | null) => {
    activePathRef.current = nextPath;
    activeColorRef.current = nextColor;
    setActivePath(nextPath);
    setActiveColor(nextColor);
  };

  const handlePointerDown = (event: InputEvent) => {
    if (event.button !== 0) return;
    const cell = cellFromPointer(event, level.gridSize);
    if (!cell) return;

    const key = cellKey(cell);
    const node = nodeMap.get(key);
    let nextPaths = pathsRef.current;

    const existingColor = pathByCell.get(key);
    if (existingColor) {
      nextPaths = { ...nextPaths };
      delete nextPaths[existingColor];
      commitPaths(nextPaths);
    }

    if (node) {
      if (nextPaths[node.color]) {
        nextPaths = { ...nextPaths };
        delete nextPaths[node.color];
        commitPaths(nextPaths);
      }
      updateActive([cell], node.color);
      if ('pointerId' in event && event.currentTarget.setPointerCapture) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      return;
    }

    updateActive([], null);
  };

  const handlePointerMove = (event: InputEvent) => {
    if (!activeColorRef.current || activePathRef.current.length === 0) return;
    const cell = cellFromPointer(event, level.gridSize);
    if (!cell) return;

    const currentPath = activePathRef.current;
    const last = currentPath[currentPath.length - 1];
    const key = cellKey(cell);

    if (cellKey(last) === key) return;

    const previous = currentPath[currentPath.length - 2];
    if (previous && cellKey(previous) === key) {
      const nextPath = currentPath.slice(0, -1);
      updateActive(nextPath, activeColorRef.current);
      return;
    }

    if (!isAdjacent(last, cell)) return;
    if (blocked.has(key)) return;

    const node = nodeMap.get(key);
    if (node && node.color !== activeColorRef.current) return;

    const occupied = pathByCell.get(key);
    if (occupied && occupied !== activeColorRef.current) return;

    if (currentPath.some((entry) => cellKey(entry) === key)) return;

    updateActive([...currentPath, cell], activeColorRef.current);
  };

  const handlePointerUp = () => {
    if (!activeColorRef.current || activePathRef.current.length === 0) return;
    const color = activeColorRef.current;
    const path = activePathRef.current;
    const nextPaths = { ...pathsRef.current };

    if (isPathComplete(path, level, color)) {
      nextPaths[color] = path;
      commitPaths(nextPaths);
    }

    updateActive([], null);
  };

  return (
    <PuzzleGrid
      level={level}
      paths={paths}
      activePath={activePath}
      activeColor={activeColor}
      colors={colors}
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
    />
  );
}
