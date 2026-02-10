import { createContext, useState, useEffect, type ReactNode } from 'react';
import { themes, type Theme } from './themes';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (id: Theme['id']) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: themes[0],
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(themes[0]);

  const setTheme = (id: Theme['id']) => {
    const found = themes.find((t) => t.id === id);
    if (found) setThemeState(found);
  };

  useEffect(() => {
    const root = document.documentElement;
    for (const [key, value] of Object.entries(theme.vars)) {
      root.style.setProperty(key, value);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
