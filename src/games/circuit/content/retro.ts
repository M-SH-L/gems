import type { CircuitContent } from '../types';
import { baseLevels } from './levels';

export const retroContent: CircuitContent = {
  id: 'retro',
  name: 'Chip Fix',
  colors: {
    red: '#ff4d4d',
    blue: '#4da6ff',
    yellow: '#ffd24d',
    green: '#39ff14',
  },
  style: {
    board: {
      background:
        'linear-gradient(145deg, rgba(7, 40, 20, 0.95), rgba(5, 30, 15, 0.9))',
      border: '2px solid #39ff14',
      glow: '0 0 12px rgba(57, 255, 20, 0.35)',
    },
    grid: {
      line: 'rgba(57, 255, 20, 0.18)',
      dot: 'rgba(57, 255, 20, 0.25)',
      cellFill: 'rgba(5, 20, 10, 0.65)',
      blockedFill: 'rgba(2, 12, 6, 0.85)',
    },
    node: {
      shape: 'square',
      stroke: '#0b0b0b',
      strokeWidth: 2,
    },
    path: {
      width: 8,
      lineCap: 'square',
      lineJoin: 'bevel',
      glow: 'drop-shadow(0 0 6px rgba(255, 194, 102, 0.7))',
    },
  },
  levels: baseLevels,
};
