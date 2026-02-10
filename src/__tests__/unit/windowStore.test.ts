import { describe, it, expect, beforeEach } from 'vitest';
import { useWindowStore } from '@/shell/windowStore';

const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
};

describe('windowStore', () => {
  beforeEach(() => {
    useWindowStore.setState({ windows: [], nextZ: 1 });
    setViewport(1000, 800);
  });

  it('opens a window with defaults', () => {
    useWindowStore.getState().open('fiction', 'Interactive Fiction');
    const [win] = useWindowStore.getState().windows;

    expect(win).toBeDefined();
    expect(win.gameId).toBe('fiction');
    expect(win.title).toBe('Interactive Fiction');
    expect(win.width).toBe(800);
    expect(win.height).toBe(600);
    expect(win.minimized).toBe(false);
    expect(win.maximized).toBe(false);
    expect(win.zIndex).toBe(1);
  });

  it('focuses existing window when opening same game', () => {
    useWindowStore.getState().open('fiction', 'Interactive Fiction');
    useWindowStore.getState().minimize(useWindowStore.getState().windows[0].id);
    useWindowStore.getState().open('fiction', 'Interactive Fiction');

    const windows = useWindowStore.getState().windows;
    expect(windows).toHaveLength(1);
    expect(windows[0].minimized).toBe(false);
    expect(windows[0].zIndex).toBe(2);
  });

  it('closes windows', () => {
    useWindowStore.getState().open('fiction', 'Interactive Fiction');
    const id = useWindowStore.getState().windows[0].id;

    useWindowStore.getState().close(id);
    expect(useWindowStore.getState().windows).toHaveLength(0);
  });

  it('minimizes and maximizes windows', () => {
    useWindowStore.getState().open('fiction', 'Interactive Fiction');
    const id = useWindowStore.getState().windows[0].id;

    useWindowStore.getState().minimize(id);
    expect(useWindowStore.getState().windows[0].minimized).toBe(true);

    useWindowStore.getState().maximize(id);
    expect(useWindowStore.getState().windows[0].maximized).toBe(true);

    useWindowStore.getState().maximize(id);
    expect(useWindowStore.getState().windows[0].maximized).toBe(false);
  });

  it('focus increments z-index', () => {
    useWindowStore.getState().open('fiction', 'Interactive Fiction');
    useWindowStore.getState().open('geography', 'Geography');

    const [first, second] = useWindowStore.getState().windows;
    expect(second.zIndex).toBeGreaterThan(first.zIndex);

    useWindowStore.getState().focus(first.id);
    const updated = useWindowStore
      .getState()
      .windows.find((w) => w.id === first.id);
    const other = useWindowStore
      .getState()
      .windows.find((w) => w.id === second.id);

    expect(updated?.zIndex).toBeGreaterThan(other?.zIndex ?? 0);
  });

  it('clamps position to viewport', () => {
    useWindowStore.getState().open('fiction', 'Interactive Fiction');
    const id = useWindowStore.getState().windows[0].id;

    useWindowStore.getState().updatePosition(id, 2000, 2000);
    let win = useWindowStore.getState().windows[0];
    expect(win.x).toBe(200);
    expect(win.y).toBe(164);

    useWindowStore.getState().updatePosition(id, -200, -50);
    win = useWindowStore.getState().windows[0];
    expect(win.x).toBe(0);
    expect(win.y).toBe(0);
  });

  it('clamps size to min and viewport', () => {
    useWindowStore.getState().open('fiction', 'Interactive Fiction');
    const id = useWindowStore.getState().windows[0].id;

    useWindowStore.getState().updateSize(id, 200, 100);
    let win = useWindowStore.getState().windows[0];
    expect(win.width).toBe(400);
    expect(win.height).toBe(300);

    useWindowStore.getState().updateSize(id, 2000, 2000);
    win = useWindowStore.getState().windows[0];
    expect(win.width).toBe(900);
    expect(win.height).toBe(704);
  });
});
