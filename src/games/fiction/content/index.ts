import retroContent from './retro';
import futuristicContent from './futuristic';
import organicContent from './organic';

export const fictionContentByTheme = {
  retro: retroContent,
  futuristic: futuristicContent,
  organic: organicContent,
} as const;

export { retroContent, futuristicContent, organicContent };
