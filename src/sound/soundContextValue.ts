import { createContext } from 'react';

export interface SoundContextValue {
  volume: number;
  setVolume: (value: number) => void;
  playUrl: (url: string) => void;
  isReady: boolean;
}

export const DEFAULT_VOLUME = 0.6;

export const SoundContext = createContext<SoundContextValue>({
  volume: DEFAULT_VOLUME,
  setVolume: () => {},
  playUrl: () => {},
  isReady: false,
});
