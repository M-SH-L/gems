import { useEffect, useRef, type RefObject } from 'react';
import { createVortex } from './vortex';
import './portal.css';

export type PortalDirection = 'in' | 'out';

export interface PortalRequest {
  direction: PortalDirection;
  origin: { x: number; y: number };
}

interface Props extends PortalRequest {
  /** Element holding the world we're leaving; it gets sucked into the portal. */
  worldRef: RefObject<HTMLElement | null>;
  /** Resolves once the destination world is loaded. */
  ready: Promise<unknown>;
  onSwap(): void;
  onDone(): void;
}

const PALETTES: Record<PortalDirection, [string, string, string]> = {
  in: ['#2a0a5e', '#ff4fd8', '#7ef9ff'],
  out: ['#0d2b1d', '#39ff14', '#fff6c2'],
};

const easeInCubic = (t: number) => t * t * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export function PortalTransition({ direction, origin, worldRef, ready, onSwap, onDone }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const holeRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cbs = useRef({ onSwap, onDone });

  useEffect(() => {
    cbs.current = { onSwap, onDone };
  });

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const OPEN = reduce ? 200 : 1150;
    const CLOSE = reduce ? 250 : 850;

    const canvas = canvasRef.current!;
    const vortex = reduce ? null : createVortex(canvas, PALETTES[direction]);
    if (!vortex) canvas.style.display = 'none';
    const onResize = () => vortex?.resize();
    window.addEventListener('resize', onResize);

    let loaded = false;
    ready.then(
      () => (loaded = true),
      () => (loaded = true),
    );

    const start = performance.now();
    let swapAt = 0;
    let frame = 0;
    let finished = false;
    let cancelled = false;

    const setWorld = (e: number) => {
      const w = worldRef.current;
      if (!w) return;
      w.style.transformOrigin = `${origin.x}px ${origin.y}px`;
      w.style.transform = `scale(${1 - 0.35 * e}) rotate(${(direction === 'in' ? -1 : 1) * 14 * e}deg)`;
      w.style.filter = `blur(${e * 6}px) brightness(${1 - e * 0.4})`;
    };
    const clearWorld = () => {
      const w = worldRef.current;
      if (!w) return;
      w.style.transform = '';
      w.style.filter = '';
      w.style.transformOrigin = '';
    };

    const tick = (now: number) => {
      if (cancelled) return;
      const el = now - start;
      const maxR = Math.hypot(
        Math.max(origin.x, window.innerWidth - origin.x),
        Math.max(origin.y, window.innerHeight - origin.y),
      );
      const hole = holeRef.current!;
      const ring = ringRef.current!;
      const flash = flashRef.current!;
      const root = rootRef.current!;

      if (!swapAt) {
        const t = Math.min(1, el / OPEN);
        const r = maxR * 1.05 * easeInCubic(t) + 18 * Math.sin(t * Math.PI);
        hole.style.clipPath = `circle(${r}px at ${origin.x}px ${origin.y}px)`;
        ring.style.transform = `translate(${origin.x - r}px, ${origin.y - r}px)`;
        ring.style.width = ring.style.height = `${r * 2}px`;
        ring.style.opacity = String(1 - t * 0.6);
        setWorld(easeOutCubic(t));
        vortex?.render(el / 1000, t, origin);
        if (t >= 1 && loaded) {
          swapAt = now;
          clearWorld();
          cbs.current.onSwap();
        }
      } else {
        const t = Math.min(1, (now - swapAt) / CLOSE);
        const e = easeOutCubic(t);
        hole.style.clipPath = 'none';
        ring.style.opacity = '0';
        flash.style.opacity = String(Math.max(0, 1 - t * 2.2));
        root.style.opacity = String(1 - e);
        hole.style.transform = `scale(${1 + e * 1.8})`;
        vortex?.render((now - start) / 1000, 1 + e * 2, { x: window.innerWidth / 2, y: window.innerHeight / 2 });
        if (t >= 1) {
          finished = true;
          cbs.current.onDone();
          return;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      vortex?.dispose();
      if (!finished) clearWorld();
    };
  }, [direction, origin, ready, worldRef]);

  return (
    <div ref={rootRef} className={`portal-overlay portal-${direction}`} aria-hidden data-testid="portal-transition">
      <div ref={holeRef} className="portal-hole">
        <canvas ref={canvasRef} className="portal-canvas" />
      </div>
      <div ref={ringRef} className="portal-ring" />
      <div ref={flashRef} className="portal-flash" />
    </div>
  );
}
