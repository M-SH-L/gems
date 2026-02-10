import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useTheme } from '@/theme/useTheme';
import { circuitContent } from './content';
import { PathDrawer } from './PathDrawer';
import { isLevelComplete } from './validation';
import type { PathMap } from './types';

const STATUS_TIMEOUT = 1800;

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function CircuitGame() {
  const { theme } = useTheme();
  const content = circuitContent[theme.id];
  const levels = content.levels;

  const [levelIndex, setLevelIndex] = useState(0);
  const [paths, setPaths] = useState<PathMap>({});
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const statusTimeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef(Date.now());
  const hasMountedRef = useRef(false);

  const level = levels[levelIndex];
  const complete = useMemo(() => isLevelComplete(level, paths), [level, paths]);

  const clearStatus = () => {
    if (statusTimeoutRef.current) {
      window.clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = null;
    }
    setStatus(null);
  };

  const pushStatus = (message: string) => {
    clearStatus();
    setStatus(message);
    statusTimeoutRef.current = window.setTimeout(() => setStatus(null), STATUS_TIMEOUT);
  };

  const resetLevel = () => {
    setPaths({});
    startTimeRef.current = Date.now();
    setElapsed(0);
  };

  const resetGame = (message?: string) => {
    setLevelIndex(0);
    resetLevel();
    if (message) pushStatus(message);
  };

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    resetGame('Theme changed — restarting');
  }, [theme.id]);

  useEffect(() => {
    if (complete) {
      pushStatus(levelIndex === levels.length - 1 ? 'All circuits restored!' : 'Level complete');
    }
  }, [complete, levelIndex, levels.length]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const delta = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsed(delta);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [levelIndex, theme.id]);

  const handleNext = () => {
    if (levelIndex < levels.length - 1) {
      setLevelIndex((prev) => prev + 1);
      resetLevel();
    }
  };

  const handleReset = () => {
    resetLevel();
    clearStatus();
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 16,
        fontFamily: 'var(--font-theme)',
        color: 'var(--color-text)',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 16, color: 'var(--color-primary)' }}>{content.name}</div>
          <div style={{ fontSize: 10, opacity: 0.7 }}>Level {levelIndex + 1} of {levels.length}</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div data-testid="circuit-level" style={{ fontSize: 10, opacity: 0.7 }}>
            Grid {level.gridSize}x{level.gridSize}
          </div>
          <div data-testid="circuit-timer" style={{ fontSize: 12 }}>
            {formatTime(elapsed)}
          </div>
          <button
            type="button"
            onClick={handleReset}
            style={controlButtonStyle}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!complete || levelIndex === levels.length - 1}
            style={{
              ...controlButtonStyle,
              opacity: !complete || levelIndex === levels.length - 1 ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>
      </div>

      {status && (
        <div
          role="status"
          style={{
            padding: '6px 12px',
            borderRadius: '999px',
            background: 'rgba(0,0,0,0.35)',
            color: 'var(--color-primary)',
            fontSize: 10,
            alignSelf: 'flex-start',
          }}
        >
          {status}
        </div>
      )}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            maxWidth: 520,
            maxHeight: 520,
            padding: 12,
            borderRadius: 'var(--radius-theme)',
            background: content.style.board.background,
            border: content.style.board.border,
            boxShadow: content.style.board.glow,
          }}
        >
          <PathDrawer
            level={level}
            paths={paths}
            onPathsChange={setPaths}
            colors={content.colors}
            style={content.style}
          />
        </div>
      </div>

      <div style={{ fontSize: 10, opacity: 0.7 }}>
        Connect matching nodes without crossing paths.{level.requiresFullCoverage ? ' Fill every open cell.' : ''}
      </div>
    </div>
  );
}

const controlButtonStyle: CSSProperties = {
  background: 'none',
  border: 'var(--border-theme)',
  borderRadius: '999px',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-theme)',
  fontSize: '10px',
  padding: '4px 10px',
  cursor: 'pointer',
};
