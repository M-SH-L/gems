import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { themes, type Theme } from './themes';
import { ThemeContext } from './themeContextValue';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(themes[0]);

  const setTheme = useCallback((id: Theme['id']) => {
    const found = themes.find((t) => t.id === id);
    if (found) setThemeState(found);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme.id);
    for (const [key, value] of Object.entries(theme.vars)) {
      root.style.setProperty(key, value);
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
