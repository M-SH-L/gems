import { useCallback, useRef } from 'react';

interface DragCallbacks {
  onDragStart?: (startX: number, startY: number) => void;
  onDrag: (dx: number, dy: number, startX: number, startY: number) => void;
  onDragEnd?: () => void;
}

export function useDrag({ onDragStart, onDrag, onDragEnd }: DragCallbacks) {
  const startPos = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      startPos.current = { x: e.clientX, y: e.clientY };
      onDragStart?.(e.clientX, e.clientY);

      const handleMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startPos.current.x;
        const dy = ev.clientY - startPos.current.y;
        onDrag(dx, dy, startPos.current.x, startPos.current.y);
      };

      const handleUp = () => {
        document.removeEventListener('pointermove', handleMove);
        document.removeEventListener('pointerup', handleUp);
        onDragEnd?.();
      };

      document.addEventListener('pointermove', handleMove);
      document.addEventListener('pointerup', handleUp);
    },
    [onDragStart, onDrag, onDragEnd]
  );

  return { onPointerDown: handlePointerDown };
}
