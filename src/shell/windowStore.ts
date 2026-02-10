import { create } from 'zustand';

export interface WindowState {
  id: string;
  gameId: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
}

interface WindowStore {
  windows: WindowState[];
  nextZ: number;
  open: (gameId: string, title: string) => void;
  close: (id: string) => void;
  minimize: (id: string) => void;
  restore: (id: string) => void;
  maximize: (id: string) => void;
  focus: (id: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  updateSize: (id: string, width: number, height: number) => void;
}

let windowCounter = 0;
const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;
const MENU_BAR_HEIGHT = 36;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getViewport = () => {
  if (typeof window === 'undefined') {
    return { width: 1280, height: 720 - MENU_BAR_HEIGHT };
  }
  return {
    width: Math.max(MIN_WIDTH, window.innerWidth),
    height: Math.max(MIN_HEIGHT, window.innerHeight - MENU_BAR_HEIGHT),
  };
};

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  nextZ: 1,

  open: (gameId, title) => {
    const { windows, nextZ } = get();
    const existing = windows.find((w) => w.gameId === gameId);
    if (existing) {
      set({
        windows: windows.map((w) =>
          w.id === existing.id
            ? { ...w, minimized: false, zIndex: nextZ }
            : w
        ),
        nextZ: nextZ + 1,
      });
      return;
    }
    const id = `win-${++windowCounter}`;
    const offset = (windows.length % 5) * 30;
    set({
      windows: [
        ...windows,
        {
          id,
          gameId,
          title,
          x: 100 + offset,
          y: 60 + offset,
          width: 800,
          height: 600,
          minimized: false,
          maximized: false,
          zIndex: nextZ,
        },
      ],
      nextZ: nextZ + 1,
    });
  },

  close: (id) => {
    set({ windows: get().windows.filter((w) => w.id !== id) });
  },

  minimize: (id) => {
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, minimized: true } : w
      ),
    });
  },

  restore: (id) => {
    const { nextZ } = get();
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, minimized: false, zIndex: nextZ } : w
      ),
      nextZ: nextZ + 1,
    });
  },

  maximize: (id) => {
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, maximized: !w.maximized } : w
      ),
    });
  },

  focus: (id) => {
    const { nextZ } = get();
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, zIndex: nextZ } : w
      ),
      nextZ: nextZ + 1,
    });
  },

  updatePosition: (id, x, y) => {
    const { width: viewportWidth, height: viewportHeight } = getViewport();
    set({
      windows: get().windows.map((w) =>
        w.id === id
          ? {
              ...w,
              x: clamp(x, 0, Math.max(0, viewportWidth - w.width)),
              y: clamp(y, 0, Math.max(0, viewportHeight - w.height)),
            }
          : w
      ),
    });
  },

  updateSize: (id, width, height) => {
    const { width: viewportWidth, height: viewportHeight } = getViewport();
    set({
      windows: get().windows.map((w) =>
        w.id === id
          ? {
              ...w,
              width: clamp(
                width,
                MIN_WIDTH,
                Math.max(MIN_WIDTH, viewportWidth - w.x)
              ),
              height: clamp(
                height,
                MIN_HEIGHT,
                Math.max(MIN_HEIGHT, viewportHeight - w.y)
              ),
            }
          : w
      ),
    });
  },
}));
