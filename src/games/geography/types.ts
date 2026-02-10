import type { ReactNode } from 'react';
import type { Theme } from '@/theme/themes';

export type ThemeId = Theme['id'];

export interface Point {
  x: number;
  y: number;
}

export interface GeoLocation extends Point {
  id: string;
  name: string;
  description: string;
  funFact?: string;
}

export interface GeoContent {
  id: ThemeId;
  name: string;
  quest: string;
  map: ReactNode;
  locations: GeoLocation[];
  rounds: number;
  mapBackground: string;
}
