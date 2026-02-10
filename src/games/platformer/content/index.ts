import type { PlatformerContent, ThemeId } from '../entities';
import retro from './retro';
import futuristic from './futuristic';
import organic from './organic';

export const platformerContent: Record<ThemeId, PlatformerContent> = {
  retro,
  futuristic,
  organic,
};
