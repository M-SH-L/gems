import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { useTheme } from '@/theme/useTheme';
import { useGameLoop } from '@/hooks/useGameLoop';
import { THEME_RESET_MESSAGE, useThemeReset } from '@/hooks/useThemeReset';
import { useSound } from '@/sound/useSound';
import { useWindowVisible } from '@/shell/windowVisibility';
import { platformerContent } from './content';
import { createInitialState, inputFromKeys, updateState, type PlatformerState } from './engine';
import type { PlatformerContent } from './entities';
import { renderGame } from './renderer';

export interface PlatformerGameProps {
  debugStateRef?: MutableRefObject<PlatformerState | null>;
}

interface Hud {
  score: number;
  lives: number;
  level: number;
  status: PlatformerState['status'];
}

export default function PlatformerGame({ debugStateRef }: PlatformerGameProps) {
  const { theme } = useTheme();
  const showNotice = useThemeReset(() => {});

  // Keying on the theme remounts the game, which rebuilds engine state,
  // the input set, and the HUD for the new content in one step.
  return (
    <PlatformerView
      key={theme.id}
      content={platformerContent[theme.id]}
      debugStateRef={debugStateRef}
      showNotice={showNotice}
    />
  );
}

interface PlatformerViewProps extends PlatformerGameProps {
  content: PlatformerContent;
  showNotice: boolean;
}

function PlatformerView({ content, debugStateRef, showNotice }: PlatformerViewProps) {
  const visible = useWindowVisible();
  const { play } = useSound();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<PlatformerState | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const [hud, setHud] = useState<Hud>({ score: 0, lives: 3, level: 1, status: 'playing' });

  const getState = useCallback(() => {
    if (!stateRef.current) {
      stateRef.current = createInitialState(content);
    }
    return stateRef.current;
  }, [content]);

  useEffect(() => {
    if (!debugStateRef) return undefined;
    debugStateRef.current = getState();
    return () => {
      debugStateRef.current = null;
    };
  }, [debugStateRef, getState]);

  useEffect(() => {
    const keys = keysRef.current;
    const handleKeyDown = (event: KeyboardEvent) => {
      keys.add(event.code);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      keys.delete(event.code);
    };
    // Without this, a key held while focus leaves the page stays "pressed".
    const handleBlur = () => keys.clear();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    if (!visible) keysRef.current.clear();
  }, [visible]);

  const update = useCallback(
    (dt: number) => {
      updateState(getState(), inputFromKeys(keysRef.current), dt);
    },
    [getState]
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const state = getState();
    renderGame(ctx, state, state.content.palette, {
      width: canvas.width,
      height: canvas.height,
    });
  }, [getState]);

  // Pause while the window is minimized so input and time don't leak into a
  // game the player can't see.
  useGameLoop({ isRunning: visible, onUpdate: update, onRender: render });

  useEffect(() => {
    let prev: Hud | null = null;
    const interval = window.setInterval(() => {
      const state = getState();
      const next: Hud = {
        score: state.score,
        lives: state.lives,
        level: state.levelIndex + 1,
        status: state.status,
      };
      if (prev) {
        if (next.status !== prev.status) {
          if (next.status === 'level-complete') play('win');
          else if (next.status === 'game-over') play('lose');
        } else if (next.lives < prev.lives && next.level === prev.level) {
          play('lose');
        } else if (next.score > prev.score) {
          play('collect');
        }
      }
      prev = next;
      setHud(next);
    }, 200);
    return () => window.clearInterval(interval);
  }, [getState, play]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return undefined;

    const resizeCanvas = () => {
      const nextWidth = Math.max(1, Math.floor(parent.clientWidth));
      const nextHeight = Math.max(1, Math.floor(parent.clientHeight));
      if (canvas.width !== nextWidth) canvas.width = nextWidth;
      if (canvas.height !== nextHeight) canvas.height = nextHeight;
    };

    resizeCanvas();
    // The game window can be resized independently of the browser window.
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(resizeCanvas);
      observer.observe(parent);
      return () => observer.disconnect();
    }
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
      {showNotice ? (
        <div style={overlayStyle} role="status">
          {THEME_RESET_MESSAGE}
        </div>
      ) : (
        hud.status !== 'playing' && (
          <div style={overlayStyle} data-testid="platformer-overlay">
            {hud.status === 'level-complete' ? 'Level Complete' : 'Game Over'}
          </div>
        )
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
