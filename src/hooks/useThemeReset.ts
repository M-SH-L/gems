import { useEffect, useState } from 'react';
import { useTheme } from '@/theme/useTheme';

export const THEME_RESET_MESSAGE = 'Theme changed — restarting';

/**
 * Runs `onReset` when the theme changes and reports whether the
 * "theme changed" notice should be shown. The reset happens during render
 * (React's "adjust state on prop change" pattern), so the game never paints
 * a frame of old-theme state against new-theme content.
 */
export function useThemeReset(onReset: () => void, noticeMs = 2000): boolean {
  const { theme } = useTheme();
  const [trackedThemeId, setTrackedThemeId] = useState(theme.id);
  const [notice, setNotice] = useState({ visible: false, token: 0 });

  if (trackedThemeId !== theme.id) {
    setTrackedThemeId(theme.id);
    setNotice((prev) => ({ visible: true, token: prev.token + 1 }));
    onReset();
  }

  useEffect(() => {
    if (!notice.visible) return undefined;
    const timer = window.setTimeout(
      () => setNotice((prev) => ({ ...prev, visible: false })),
      noticeMs
    );
    return () => window.clearTimeout(timer);
  }, [notice.visible, notice.token, noticeMs]);

  return notice.visible;
}
