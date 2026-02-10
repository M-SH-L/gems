import { useEffect, useRef } from 'react';

interface GameLoopOptions {
  isRunning: boolean;
  onUpdate: (dt: number) => void;
  onRender?: () => void;
}

export function useGameLoop({ isRunning, onUpdate, onRender }: GameLoopOptions) {
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const loop = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const dt = Math.min(0.05, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;
      onUpdate(dt);
      onRender?.();
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      lastTimeRef.current = null;
    };
  }, [isRunning, onUpdate, onRender]);
}
