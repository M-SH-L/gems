import type { BuilderItem } from './types';

interface PaletteProps {
  items: BuilderItem[];
  selectedItemId: string | null;
  mode: 'place' | 'erase';
  onSelectItem: (id: string) => void;
  onSelectEraser: () => void;
}

export function Palette({
  items,
  selectedItemId,
  mode,
  onSelectItem,
  onSelectEraser,
}: PaletteProps) {
  return (
    <div
      style={{
        width: 220,
        padding: 16,
        borderRight: 'var(--border-theme)',
        background: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        overflowY: 'auto',
        fontFamily: 'var(--font-theme)',
      }}
    >
      <div>
        <h3 style={{ margin: 0, fontSize: 13, color: 'var(--color-primary)' }}>
          Palette
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: 11, opacity: 0.7 }}>
          Drag or click to place.
        </p>
      </div>

      <button
        type="button"
        onClick={onSelectEraser}
        aria-pressed={mode === 'erase'}
        style={{
          padding: '6px 10px',
          border: 'var(--border-theme)',
          borderRadius: 'var(--radius-theme)',
          background: mode === 'erase' ? 'var(--color-primary)' : 'var(--color-bg)',
          color: mode === 'erase' ? 'var(--color-bg)' : 'var(--color-text)',
          fontSize: 11,
          cursor: 'pointer',
        }}
      >
        Eraser
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item) => {
          const selected = mode === 'place' && selectedItemId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              data-testid="palette-item"
              aria-pressed={selected}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('text/plain', item.id);
              }}
              onClick={() => onSelectItem(item.id)}
              style={{
                display: 'grid',
                gridTemplateColumns: '24px 1fr auto',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                border: 'var(--border-theme)',
                borderRadius: 'var(--radius-theme)',
                background: selected ? 'var(--color-primary)' : 'var(--color-bg)',
                color: selected ? 'var(--color-bg)' : 'var(--color-text)',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  background: item.color,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                }}
              >
                {item.icon}
              </span>
              <span>{item.name}</span>
              <span style={{ opacity: selected ? 0.8 : 0.6 }}>-{item.cost}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
