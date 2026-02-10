import type { Theme } from '@/theme/themes';

export type ThemeId = Theme['id'];

export type CircuitColor = 'red' | 'blue' | 'yellow' | 'green';

export interface NodePair {
  color: CircuitColor;
  source: [number, number];
  target: [number, number];
}

export interface PuzzleLevel {
  gridSize: number;
  nodes: NodePair[];
  blockedCells?: [number, number][];
  requiresFullCoverage?: boolean;
}

export interface CircuitThemeStyle {
  board: {
    background: string;
    border: string;
    glow?: string;
  };
  grid: {
    line: string;
    dot?: string;
    cellFill: string;
    blockedFill: string;
  };
  node: {
    shape: 'square' | 'circle';
    stroke: string;
    strokeWidth: number;
  };
  path: {
    width: number;
    lineCap: 'round' | 'square';
    lineJoin: 'round' | 'bevel';
    glow?: string;
    dash?: string;
  };
}

export interface CircuitContent {
  id: ThemeId;
  name: string;
  colors: Record<CircuitColor, string>;
  style: CircuitThemeStyle;
  levels: PuzzleLevel[];
}

export interface Cell {
  r: number;
  c: number;
}

export type PathMap = Record<string, Cell[]>;
