import type { ThemeId } from '../types';
import { retroContent } from './retro';
import { futuristicContent } from './futuristic';
import { organicContent } from './organic';
import type { CircuitContent } from '../types';

export const circuitContent: Record<ThemeId, CircuitContent> = {
  retro: retroContent,
  futuristic: futuristicContent,
  organic: organicContent,
};
