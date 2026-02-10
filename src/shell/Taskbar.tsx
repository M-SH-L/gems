import { useWindowStore } from './windowStore';
import { useSound } from '../sound/useSound';

export function Taskbar() {
  const windows = useWindowStore((s) => s.windows);
  const minimized = windows.filter((w) => w.minimized);
  const { play } = useSound();

  if (minimized.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 36,
        background: 'var(--color-surface)',
        borderTop: 'var(--border-theme)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        gap: 8,
        zIndex: 9998,
      }}
    >
      {minimized.map((w) => (
        <button
          key={w.id}
          onClick={() => {
            play('open');
            useWindowStore.setState((s) => ({
              windows: s.windows.map((win) =>
                win.id === w.id
                  ? { ...win, minimized: false, zIndex: s.nextZ }
                  : win
              ),
              nextZ: s.nextZ + 1,
            }));
          }}
          style={{
            background: 'var(--color-bg)',
            border: 'var(--border-theme)',
            borderRadius: 'var(--radius-theme)',
            padding: '4px 12px',
            fontFamily: 'var(--font-theme)',
            fontSize: '10px',
            color: 'var(--color-text)',
            cursor: 'pointer',
          }}
        >
          {w.title}
        </button>
      ))}
    </div>
  );
}
