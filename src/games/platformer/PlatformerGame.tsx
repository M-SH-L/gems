import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { useTheme } from '@/theme/useTheme';
import { useGameLoop } from '@/hooks/useGameLoop';
import { platformerContent } from './content';
import { createInitialState, inputFromKeys, updateState, type PlatformerState } from './engine';
import { renderGame } from './renderer';

export interface PlatformerGameProps {
  debugStateRef?: MutableRefObject<PlatformerState | null>;
}

export default function PlatformerGame({ debugStateRef }: PlatformerGameProps) {
  const { theme } = useTheme();
  const content = useMemo(() => platformerContent[theme.id], [theme.id]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<PlatformerState>(createInitialState(content));
  const keysRef = useRef<Set<string>>(new Set());
  const [hud, setHud] = useState(() => ({
    score: 0,
    lives: 3,
    level: 1,
    status: 'playing' as PlatformerState['status'],
  }));

  if (debugStateRef) {
    debugStateRef.current = stateRef.current;
  }

  useEffect(() => {
    stateRef.current = createInitialState(content);
    setHud({ score: 0, lives: 3, level: 1, status: 'playing' });
  }, [content]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysRef.current.add(event.code);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      keysRef.current.delete(event.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const update = useCallback((dt: number) => {
    updateState(stateRef.current, inputFromKeys(keysRef.current), dt);
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderGame(ctx, stateRef.current, stateRef.current.content.palette, {
      width: canvas.width,
      height: canvas.height,
    });
  }, []);

  useGameLoop({ isRunning: true, onUpdate: update, onRender: render });

  useEffect(() => {
    const interval = window.setInterval(() => {
      const state = stateRef.current;
      setHud({
        score: state.score,
        lives: state.lives,
        level: state.levelIndex + 1,
        status: state.status,
      });
    }, 200);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const nextWidth = Math.max(1, Math.floor(parent.clientWidth));
      const nextHeight = Math.max(1, Math.floor(parent.clientHeight));
      if (canvas.width !== nextWidth) canvas.width = nextWidth;
      if (canvas.height !== nextHeight) canvas.height = nextHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: 'var(--color-bg)',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        data-testid="platformer-canvas"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      <div style={hudStyle} data-testid="platformer-hud">
        <span data-testid="platformer-score">Score: {hud.score}</span>
        <span data-testid="platformer-lives">Lives: {hud.lives}</span>
        <span data-testid="platformer-level">Level: {hud.level}</span>
      </div>
      {hud.status !== 'playing' && (
        <div style={overlayStyle} data-testid="platformer-overlay">
          {hud.status === 'level-complete' ? 'Level Complete' : 'Game Over'}
        </div>
      )}
    </div>
  );
}

const hudStyle: React.CSSProperties = {
  position: 'absolute',
  top: 12,
  left: 12,
  display: 'flex',
  gap: 16,
  fontFamily: 'var(--font-theme)',
  fontSize: 12,
  color: 'var(--color-text)',
  background: 'rgba(0, 0, 0, 0.4)',
  padding: '6px 10px',
  borderRadius: 8,
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-theme)',
  fontSize: 18,
  color: 'var(--color-primary)',
  background: 'rgba(0, 0, 0, 0.55)',
};
