import type { MouseEventHandler, PointerEventHandler } from 'react';
import type { Cell, CircuitThemeStyle, PathMap, PuzzleLevel } from './types';
import { cellKey } from './validation';

interface PuzzleGridProps {
  level: PuzzleLevel;
  paths: PathMap;
  activePath?: Cell[];
  activeColor?: string | null;
  colors: Record<string, string>;
  style: CircuitThemeStyle;
  onPointerDown?: PointerEventHandler<SVGSVGElement>;
  onPointerMove?: PointerEventHandler<SVGSVGElement>;
  onPointerUp?: PointerEventHandler<SVGSVGElement>;
  onMouseDown?: MouseEventHandler<SVGSVGElement>;
  onMouseMove?: MouseEventHandler<SVGSVGElement>;
  onMouseUp?: MouseEventHandler<SVGSVGElement>;
}

const CELL_SIZE = 48;

export function PuzzleGrid({
  level,
  paths,
  activePath,
  activeColor,
  colors,
  style,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: PuzzleGridProps) {
  const size = level.gridSize * CELL_SIZE;
  const blocked = new Set((level.blockedCells ?? []).map((tuple) => `${tuple[0]},${tuple[1]}`));

  const pathEntries = Object.entries(paths);
  const activePathEntries: Array<{ color: string; path: Cell[]; isActive?: boolean }> = [];
  if (activePath && activePath.length > 0 && activeColor) {
    activePathEntries.push({ color: activeColor, path: activePath, isActive: true });
  }

  const pathsToRender = [
    ...pathEntries.map(([color, path]) => ({ color, path })),
    ...activePathEntries,
  ];

  return (
    <svg
      data-testid="circuit-grid"
      width="100%"
      height="100%"
      viewBox={`0 0 ${size} ${size}`}
      preserveAspectRatio="xMidYMid meet"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <rect width={size} height={size} fill={style.grid.cellFill} />

      {Array.from({ length: level.gridSize }).map((_, r) =>
        Array.from({ length: level.gridSize }).map((_, c) => {
          const key = `${r},${c}`;
          const isBlocked = blocked.has(key);
          return (
            <rect
              key={key}
              x={c * CELL_SIZE}
              y={r * CELL_SIZE}
              width={CELL_SIZE}
              height={CELL_SIZE}
              fill={isBlocked ? style.grid.blockedFill : 'transparent'}
              stroke={style.grid.line}
              strokeWidth={1}
            />
          );
        })
      )}

      {style.grid.dot &&
        Array.from({ length: level.gridSize }).map((_, r) =>
          Array.from({ length: level.gridSize }).map((_, c) => (
            <circle
              key={`dot-${r}-${c}`}
              cx={c * CELL_SIZE + CELL_SIZE / 2}
              cy={r * CELL_SIZE + CELL_SIZE / 2}
              r={1.4}
              fill={style.grid.dot}
            />
          ))
        )}

      {pathsToRender.map(({ color, path, isActive }) => {
        if (path.length < 2) return null;
        const points = path
          .map((cell) => {
            const x = cell.c * CELL_SIZE + CELL_SIZE / 2;
            const y = cell.r * CELL_SIZE + CELL_SIZE / 2;
            return `${x},${y}`;
          })
          .join(' ');
        return (
          <polyline
            key={`path-${color}-${path.length}`}
            points={points}
            fill="none"
            stroke={colors[color] ?? 'var(--color-primary)'}
            strokeWidth={style.path.width}
            strokeLinecap={style.path.lineCap}
            strokeLinejoin={style.path.lineJoin}
            strokeDasharray={style.path.dash}
            opacity={isActive ? 0.65 : 1}
            style={style.path.glow ? { filter: style.path.glow } : undefined}
          />
        );
      })}

      {level.nodes.map((node) => {
        const sourceKey = `${node.source[0]},${node.source[1]}`;
        const targetKey = `${node.target[0]},${node.target[1]}`;
        const sizeFactor = style.node.shape === 'square' ? 0.52 : 0.46;
        const nodeSize = CELL_SIZE * sizeFactor;

        const renderNode = (cellKeyValue: string, role: 'source' | 'target') => {
          const [row, col] = cellKeyValue.split(',').map(Number);
          const x = col * CELL_SIZE + CELL_SIZE / 2;
          const y = row * CELL_SIZE + CELL_SIZE / 2;
          const fillColor = colors[node.color] ?? 'var(--color-primary)';

          if (style.node.shape === 'square') {
            return (
              <rect
                key={`${node.color}-${role}`}
                data-testid={`node-${node.color}-${role}`}
                x={x - nodeSize / 2}
                y={y - nodeSize / 2}
                width={nodeSize}
                height={nodeSize}
                rx={style.node.shape === 'square' ? 2 : nodeSize / 2}
                fill={fillColor}
                stroke={style.node.stroke}
                strokeWidth={style.node.strokeWidth}
              />
            );
          }

          return (
            <circle
              key={`${node.color}-${role}`}
              data-testid={`node-${node.color}-${role}`}
              cx={x}
              cy={y}
              r={nodeSize / 2}
              fill={fillColor}
              stroke={style.node.stroke}
              strokeWidth={style.node.strokeWidth}
            />
          );
        };

        return (
          <g key={`node-${node.color}`}>
            {renderNode(sourceKey, 'source')}
            {renderNode(targetKey, 'target')}
          </g>
        );
      })}

      {pathsToRender.length === 0 && (
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          fill="rgba(255, 255, 255, 0.4)"
          fontSize={10}
        >
          Draw a path between matching nodes
        </text>
      )}

      {pathsToRender.map(({ path }) =>
        path.map((cell) => {
          const key = cellKey(cell);
          return (
            <circle
              key={`solder-${key}`}
              cx={cell.c * CELL_SIZE + CELL_SIZE / 2}
              cy={cell.r * CELL_SIZE + CELL_SIZE / 2}
              r={2.2}
              fill="rgba(0, 0, 0, 0.25)"
            />
          );
        })
      )}
    </svg>
  );
}
