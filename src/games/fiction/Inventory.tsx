import { useTheme } from '@/theme/useTheme';
import { MAX_INVENTORY } from './FictionEngine';

interface InventoryProps {
  items: string[];
}

const panelBackgrounds: Record<string, string> = {
  retro: 'rgba(8, 8, 8, 0.85)',
  futuristic: 'rgba(8, 12, 24, 0.85)',
  organic: 'rgba(245, 240, 224, 0.85)',
};

export function Inventory({ items }: InventoryProps) {
  const { theme } = useTheme();

  return (
    <aside
      style={{
        width: 200,
        minWidth: 200,
        padding: 16,
        border: 'var(--border-theme)',
        borderRadius: 'var(--radius-theme)',
        background: panelBackgrounds[theme.id] ?? 'var(--color-surface)',
        boxShadow: 'var(--shadow-theme)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontFamily: 'var(--font-theme)',
      }}
    >
      <div style={{ fontSize: 12, color: 'var(--color-primary)' }}>
        Inventory ({items.length}/{MAX_INVENTORY})
      </div>
      {items.length === 0 ? (
        <div style={{ fontSize: 11, opacity: 0.7 }}>
          Empty
        </div>
      ) : (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            fontSize: 11,
          }}
        >
          {items.map((item) => (
            <li
              key={item}
              style={{
                padding: '6px 8px',
                border: 'var(--border-theme)',
                borderRadius: 'var(--radius-theme)',
                background: 'rgba(0, 0, 0, 0.15)',
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
