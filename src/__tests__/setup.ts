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

// Mock requestAnimationFrame
let rafId = 0;
globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
  rafId++;
  setTimeout(() => cb(performance.now()), 0);
  return rafId;
};

globalThis.cancelAnimationFrame = (_id: number) => {};
