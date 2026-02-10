import { useState, useEffect } from 'react';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { useWindowStore } from './windowStore';
import { useSound } from '../sound/useSound';

export function MenuBar() {
  const [time, setTime] = useState(new Date());
  const windows = useWindowStore((s) => s.windows);
  const { volume, setVolume } = useSound();
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '10px', color: 'var(--color-text)' }}>
            VOL
          </span>
          <input
            aria-label="Volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{
              width: 90,
              accentColor: 'var(--color-primary)',
              cursor: 'pointer',
            }}
          />
        </div>
        <ThemeSwitcher />
        <span>{time.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
