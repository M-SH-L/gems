import { createContext, useContext } from 'react';

export interface PortalControls {
  /** Jump to V2, opening the portal at the given screen point. */
  enterV2(origin?: { x: number; y: number }): void;
}

export const PortalContext = createContext<PortalControls>({ enterV2: () => {} });

export const usePortal = () => useContext(PortalContext);
