import { useRef, type ReactNode, type MouseEvent } from 'react';
import { clamp } from '@/utils/clamp';
import type { Point } from './types';

interface MapCanvasProps {
  map: ReactNode;
  background: string;
  onGuess?: (point: Point) => void;
  line?: { start: Point; end: Point };
  children?: React.ReactNode;
}

export function MapCanvas({ map, background, onGuess, line, children }: MapCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!onGuess || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    onGuess({ x, y });
  };

  return (
    <div
      ref={containerRef}
      data-testid="map-canvas"
      onClick={handleClick}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        border: 'var(--border-theme)',
        borderRadius: 'var(--radius-theme)',
        overflow: 'hidden',
        background,
        cursor: onGuess ? 'crosshair' : 'default',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      >
        {map}
      </div>
      {line && (
        <svg
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          <line
            x1={line.start.x}
            y1={line.start.y}
            x2={line.end.x}
            y2={line.end.y}
            stroke="var(--color-secondary)"
            strokeWidth={0.006}
            strokeDasharray="0.02 0.015"
          />
        </svg>
      )}
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    </div>
  );
}
