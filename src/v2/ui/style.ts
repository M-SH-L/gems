import type { CSSProperties } from 'react';

/** Sets the `--accent` custom property the V2 HUD styles key off. */
export function accentStyle(color: string): CSSProperties {
  return { ['--accent' as string]: color } as CSSProperties;
}
