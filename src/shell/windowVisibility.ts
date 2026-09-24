import { createContext, useContext } from 'react';

/** False while the enclosing window is minimized. Defaults to visible. */
export const WindowVisibilityContext = createContext(true);

export function useWindowVisible() {
  return useContext(WindowVisibilityContext);
}
