import { createContext } from 'react';
import { themes, type Theme } from './themes';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (id: Theme['id']) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: themes[0],
  setTheme: () => {},
});
