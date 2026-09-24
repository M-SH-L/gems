import { useCallback, useContext } from 'react';
import { useTheme } from '../theme/useTheme';
import { SoundContext } from './soundContextValue';
import { soundMap, type SoundAction } from './soundMap';

export function useSound() {
  const { theme } = useTheme();
  const { playUrl, volume, setVolume, isReady } = useContext(SoundContext);

  const play = useCallback(
    (action: SoundAction) => {
      const url = soundMap[theme.id][action];
      if (url) playUrl(url);
    },
    [playUrl, theme.id]
  );

  return { play, volume, setVolume, isReady };
}
