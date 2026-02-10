import type { CircuitContent } from '../types';
import { baseLevels } from './levels';

export const futuristicContent: CircuitContent = {
  id: 'futuristic',
  name: 'Power Grid',
  colors: {
    red: '#00e5ff',
    blue: '#e040fb',
    yellow: '#f7b801',
    green: '#7cff6b',
  },
  style: {
    board: {
      background:
        'radial-gradient(circle at 20% 20%, rgba(0, 229, 255, 0.12), transparent 55%), radial-gradient(circle at 80% 70%, rgba(224, 64, 251, 0.12), transparent 60%), #0b0e1a',
      border: '1px solid rgba(0, 229, 255, 0.7)',
      glow: '0 0 20px rgba(0, 229, 255, 0.35)',
    },
    grid: {
      line: 'rgba(0, 229, 255, 0.2)',
      dot: 'rgba(224, 64, 251, 0.22)',
      cellFill: 'rgba(8, 14, 30, 0.75)',
      blockedFill: 'rgba(5, 8, 18, 0.9)',
    },
    node: {
      shape: 'circle',
      stroke: 'rgba(255, 255, 255, 0.6)',
      strokeWidth: 1.5,
    },
    path: {
      width: 7,
      lineCap: 'round',
      lineJoin: 'round',
      glow: 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.6))',
      dash: '0',
    },
  },
  levels: baseLevels,
};
