import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface SoundContextValue {
  volume: number;
  setVolume: (value: number) => void;
  playUrl: (url: string) => void;
  isReady: boolean;
}

const DEFAULT_VOLUME = 0.6;

export const SoundContext = createContext<SoundContextValue>({
  volume: DEFAULT_VOLUME,
  setVolume: () => {},
  playUrl: () => {},
  isReady: false,
});

function clampVolume(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [isReady, setIsReady] = useState(false);
  const volumeRef = useRef(volume);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const bufferCacheRef = useRef<Map<string, AudioBuffer>>(new Map());
  const pendingRef = useRef<Map<string, Promise<AudioBuffer>>>(new Map());

  const setVolume = useCallback((value: number) => {
    const clamped = clampVolume(value);
    volumeRef.current = clamped;
    setVolumeState(clamped);
    if (gainRef.current && audioContextRef.current) {
      gainRef.current.gain.setValueAtTime(
        clamped,
        audioContextRef.current.currentTime
      );
    }
  }, []);

  const ensureContext = useCallback(async () => {
    let context = audioContextRef.current;
    if (!context) {
      context = new AudioContext();
      audioContextRef.current = context;
      const gain = context.createGain();
      gain.gain.value = volumeRef.current;
      gain.connect(context.destination);
      gainRef.current = gain;
      setIsReady(true);
    }
    if (context.state === 'suspended') {
      await context.resume();
    }
    return context;
  }, []);

  const loadBuffer = useCallback(
    async (url: string) => {
      const cached = bufferCacheRef.current.get(url);
      if (cached) return cached;
      const pending = pendingRef.current.get(url);
      if (pending) return pending;

      const promise = (async () => {
        try {
          const context = await ensureContext();
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to load sound: ${url}`);
          }
          const arrayBuffer = await response.arrayBuffer();
          const buffer = await context.decodeAudioData(arrayBuffer);
          bufferCacheRef.current.set(url, buffer);
          return buffer;
        } finally {
          pendingRef.current.delete(url);
        }
      })();

      pendingRef.current.set(url, promise);
      return promise;
    },
    [ensureContext]
  );

  const playUrl = useCallback(
    (url: string) => {
      if (!url || volumeRef.current <= 0) return;
      void (async () => {
        try {
          const context = await ensureContext();
          const buffer = await loadBuffer(url);
          const source = context.createBufferSource();
          source.buffer = buffer;
          const gain = gainRef.current;
          if (gain) {
            source.connect(gain);
          } else {
            source.connect(context.destination);
          }
          source.start(0);
        } catch {
          // Swallow audio errors to avoid breaking UI interactions.
        }
      })();
    },
    [ensureContext, loadBuffer]
  );

  useEffect(() => {
    const prime = () => {
      void ensureContext();
    };
    window.addEventListener('pointerdown', prime, { once: true });
    window.addEventListener('keydown', prime, { once: true });
    return () => {
      window.removeEventListener('pointerdown', prime);
      window.removeEventListener('keydown', prime);
    };
  }, [ensureContext]);

  const value = useMemo(
    () => ({ volume, setVolume, playUrl, isReady }),
    [volume, setVolume, playUrl, isReady]
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSoundContext() {
  return useContext(SoundContext);
}
