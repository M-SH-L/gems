import type { GameEntry } from './registry';
import { useWindowStore } from './windowStore';
import { useSound } from '../sound/useSound';

export function GameCard({ game }: { game: GameEntry }) {
  const open = useWindowStore((s) => s.open);
  const { play } = useSound();

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: 'var(--border-theme)',
        borderRadius: 'var(--radius-theme)',
        boxShadow: 'var(--shadow-theme)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        fontFamily: 'var(--font-theme)',
        color: 'var(--color-text)',
      }}
    >
      <span style={{ fontSize: 48 }}>{game.icon}</span>
      <span style={{ fontSize: 14, fontWeight: 'bold', color: 'var(--color-primary)' }}>
        {game.title}
      </span>
      <span style={{ fontSize: 12, opacity: 0.7, textAlign: 'center' }}>
        {game.description}
      </span>
      <button
        onClick={() => {
          play('open');
          open(game.id, game.title);
        }}
        style={{
          background: 'var(--color-primary)',
          color: 'var(--color-bg)',
          border: 'none',
          borderRadius: 'var(--radius-theme)',
          padding: '8px 20px',
          fontFamily: 'var(--font-theme)',
          fontSize: '11px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Play Now
      </button>
    </div>
  );
}
