import '@testing-library/jest-dom/vitest';

// Mock AudioContext
class MockAudioContext {
  createGain() {
    return {
      connect: () => {},
      gain: { value: 1, setValueAtTime: () => {} },
    };
  }
  createBufferSource() {
    return {
      connect: () => {},
      start: () => {},
      stop: () => {},
      buffer: null,
    };
  }
  decodeAudioData() {
    return Promise.resolve(new ArrayBuffer(0));
  }
  get destination() {
    return {};
  }
}

Object.defineProperty(globalThis, 'AudioContext', {
  value: MockAudioContext,
  writable: true,
});

Object.defineProperty(globalThis, 'Audio', {
  value: class {
    play() { return Promise.resolve(); }
    pause() {}
    load() {}
    src = '';
    volume = 1;
  },
  writable: true,
});

// Mock requestAnimationFrame / cancelAnimationFrame so game loops stop on unmount
let rafId = 0;
const rafTimers = new Map<number, ReturnType<typeof setTimeout>>();
globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
  rafId++;
  const id = rafId;
  rafTimers.set(
    id,
    setTimeout(() => {
      rafTimers.delete(id);
      cb(performance.now());
    }, 16)
  );
  return id;
};

globalThis.cancelAnimationFrame = (id: number) => {
  clearTimeout(rafTimers.get(id));
  rafTimers.delete(id);
};
