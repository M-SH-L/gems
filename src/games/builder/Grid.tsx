import type { BuilderItem, GridBackground } from './types';
import type { BuilderGrid } from './state';

interface GridProps {
  grid: BuilderGrid;
  itemsById: Record<string, BuilderItem>;
  selectedItemId: string | null;
  mode: 'place' | 'erase';
  background: GridBackground;
  onPlace: (row: number, col: number, itemId: string) => void;
  onRemove: (row: number, col: number) => void;
}

export function Grid({
  grid,
  itemsById,
  selectedItemId,
  mode,
  background,
  onPlace,
  onRemove,
}: GridProps) {
  const size = grid.length;

  return (
    <div
      role="grid"
      aria-label="Builder grid"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        width: '100%',
        maxWidth: 420,
        aspectRatio: '1 / 1',
        backgroundColor: background.color,
        backgroundImage: background.image,
        backgroundSize: background.size ?? 'auto',
        border: 'var(--border-theme)',
        borderRadius: 'var(--radius-theme)',
        overflow: 'hidden',
      }}
    >
      {grid.map((rowCells, row) =>
        rowCells.map((cell, col) => {
          const item = cell ? itemsById[cell] : null;
          return (
            <button
              key={`${row}-${col}`}
              type="button"
              data-testid={`builder-cell-${row}-${col}`}
              aria-label={`Cell ${row + 1}, ${col + 1}`}
              onClick={() => {
                if (mode === 'erase') {
                  onRemove(row, col);
                  return;
                }
                if (!selectedItemId) return;
                onPlace(row, col, selectedItemId);
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                onRemove(row, col);
              }}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={(event) => {
                event.preventDefault();
                const dropped = event.dataTransfer.getData('text/plain');
                if (!dropped) return;
                onPlace(row, col, dropped);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0,0,0,0.15)',
                background: item ? item.color : 'rgba(255,255,255,0.04)',
                color: 'var(--color-text)',
                fontSize: 18,
                cursor: mode === 'erase' ? 'not-allowed' : 'pointer',
                padding: 0,
                userSelect: 'none',
              }}
            >
              {item ? item.icon : ''}
            </button>
          );
        })
      )}
    </div>
  );
}
