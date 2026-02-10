import type { BuilderContent } from '../types';
import { retroContent } from './retro';
import { futuristicContent } from './futuristic';
import { organicContent } from './organic';

export const builderContentByTheme: Record<string, BuilderContent> = {
  retro: retroContent,
  futuristic: futuristicContent,
  organic: organicContent,
};

export { retroContent, futuristicContent, organicContent };
