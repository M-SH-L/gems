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
  maximize: (id: string) => void;
  focus: (id: string) => void;
  updatePosition: (id: string, x: number, y: number) => void;
  updateSize: (id: string, width: number, height: number) => void;
}

let windowCounter = 0;

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
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, x, y } : w
      ),
    });
  },

  updateSize: (id, width, height) => {
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, width, height } : w
      ),
    });
  },
}));
