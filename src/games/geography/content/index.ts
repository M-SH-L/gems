import type { ThemeId } from '../types';
import { retroContent } from './retro';
import { futuristicContent } from './futuristic';
import { organicContent } from './organic';

export const geoContentByTheme = {
  retro: retroContent,
  futuristic: futuristicContent,
  organic: organicContent,
} as const;

export function getGeoContent(themeId: ThemeId) {
  return geoContentByTheme[themeId];
}
