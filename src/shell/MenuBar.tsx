import { useState, useEffect } from 'react';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { useWindowStore } from './windowStore';

export function MenuBar() {
  const [time, setTime] = useState(new Date());
  const windows = useWindowStore((s) => s.windows);
  const topWindow = [...windows]
    .filter((w) => !w.minimized)
    .sort((a, b) => b.zIndex - a.zIndex)[0];

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        height: 36,
        background: 'var(--color-surface)',
        borderBottom: 'var(--border-theme)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        fontFamily: 'var(--font-theme)',
        fontSize: '11px',
        color: 'var(--color-text)',
        zIndex: 9999,
        position: 'relative',
      }}
    >
      <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
        {topWindow ? topWindow.title : 'Desktop'}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          type="button"
          aria-label="Volume"
          title="Volume"
          style={{
            background: 'var(--color-bg)',
            border: 'var(--border-theme)',
            borderRadius: 'var(--radius-theme)',
            fontFamily: 'var(--font-theme)',
            fontSize: '10px',
            color: 'var(--color-text)',
            padding: '2px 8px',
            cursor: 'pointer',
          }}
        >
          VOL
        </button>
        <ThemeSwitcher />
        <span>{time.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
