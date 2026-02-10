import { Suspense, useRef } from 'react';
import { useWindowStore, type WindowState } from './windowStore';
import { useDrag } from './useDrag';
import { games } from './registry';

export function WindowFrame({ win }: { win: WindowState }) {
  const { close, minimize, maximize, focus, updatePosition, updateSize } =
    useWindowStore();
  const posRef = useRef({ x: win.x, y: win.y });
  const sizeRef = useRef({ w: win.width, h: win.height });

  const dragHandlers = useDrag({
    onDragStart: () => {
      posRef.current = { x: win.x, y: win.y };
      focus(win.id);
    },
    onDrag: (dx, dy) => {
      updatePosition(win.id, posRef.current.x + dx, posRef.current.y + dy);
    },
  });

  const resizeHandlers = useDrag({
    onDragStart: () => {
      sizeRef.current = { w: win.width, h: win.height };
      focus(win.id);
    },
    onDrag: (dx, dy) => {
      updateSize(
        win.id,
        Math.max(400, sizeRef.current.w + dx),
        Math.max(300, sizeRef.current.h + dy)
      );
    },
  });

  const game = games.find((g) => g.id === win.gameId);
  if (!game) return null;

  const GameComponent = game.component;

  const style: React.CSSProperties = win.maximized
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: win.zIndex,
      }
    : {
        position: 'absolute',
        top: win.y,
        left: win.x,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
      };

  if (win.minimized) return null;

  return (
    <div
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-surface)',
        border: 'var(--border-theme)',
        borderRadius: 'var(--radius-theme)',
        boxShadow: 'var(--shadow-theme)',
        overflow: 'hidden',
      }}
      onPointerDown={() => focus(win.id)}
    >
      {/* Title bar */}
      <div
        {...dragHandlers}
        style={{
          height: 32,
          background: 'var(--color-bg)',
          borderBottom: 'var(--border-theme)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          cursor: 'grab',
          userSelect: 'none',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-theme)',
            fontSize: '10px',
            color: 'var(--color-primary)',
          }}
        >
          {win.title}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={(e) => { e.stopPropagation(); minimize(win.id); }}
            style={btnStyle}
            title="Minimize"
          >
            _
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); maximize(win.id); }}
            style={btnStyle}
            title="Maximize"
          >
            □
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); close(win.id); }}
            style={{ ...btnStyle, color: '#ff4444' }}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                fontFamily: 'var(--font-theme)',
                color: 'var(--color-primary)',
                fontSize: '12px',
              }}
            >
              Loading...
            </div>
          }
        >
          <GameComponent />
        </Suspense>
      </div>

      {/* Resize handle */}
      {!win.maximized && (
        <div
          {...resizeHandlers}
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 16,
            height: 16,
            cursor: 'nwse-resize',
          }}
        />
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-theme)',
  fontSize: '14px',
  cursor: 'pointer',
  padding: '0 4px',
  lineHeight: 1,
};
