export type ThemeId = 'retro' | 'futuristic' | 'organic';

export const TILE_SIZE = 32;

export enum TileCode {
  Air = 0,
  Ground = 1,
  Collectible = 2,
  Hazard = 3,
  Goal = 4,
  Platform = 5,
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Player extends Rect {
  vx: number;
  vy: number;
  onGround: boolean;
  onPlatformId: string | null;
}

export interface MovingPlatformDef {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  axis: 'x' | 'y';
  min: number;
  max: number;
  speed: number;
}

export interface MovingPlatform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  axis: 'x' | 'y';
  min: number;
  max: number;
  speed: number;
  vx: number;
  vy: number;
  dx: number;
  dy: number;
}

export interface LevelDefinition {
  id: string;
  tiles: number[][];
  spawn: Vec2;
  movingPlatforms?: MovingPlatformDef[];
}

export interface LevelState {
  tiles: number[][];
  width: number;
  height: number;
  spawn: Vec2;
  movingPlatforms: MovingPlatform[];
}

export interface PlatformerPalette {
  style: 'retro' | 'futuristic' | 'organic';
  background: string;
  ground: string;
  groundAlt: string;
  collectible: string;
  hazard: string;
  goal: string;
  player: string;
  platform: string;
  glow: string;
}

export interface PlatformerContent {
  theme: ThemeId;
  palette: PlatformerPalette;
  levels: LevelDefinition[];
}
