import type { CircuitContent } from '../types';
import { baseLevels } from './levels';

export const organicContent: CircuitContent = {
  id: 'organic',
  name: 'Root Network',
  colors: {
    red: '#d1495b',
    blue: '#3066be',
    yellow: '#f4d35e',
    green: '#2d6a4f',
  },
  style: {
    board: {
      background:
        'linear-gradient(160deg, rgba(244, 235, 221, 0.9), rgba(222, 206, 182, 0.95)), radial-gradient(circle at 30% 30%, rgba(45, 106, 79, 0.08), transparent 55%)',
      border: '2px dashed rgba(45, 106, 79, 0.7)',
      glow: '0 4px 10px rgba(45, 106, 79, 0.2)',
    },
    grid: {
      line: 'rgba(45, 106, 79, 0.18)',
      dot: 'rgba(212, 163, 115, 0.35)',
      cellFill: 'rgba(237, 228, 212, 0.75)',
      blockedFill: 'rgba(210, 196, 174, 0.7)',
    },
    node: {
      shape: 'circle',
      stroke: 'rgba(45, 106, 79, 0.6)',
      strokeWidth: 2,
    },
    path: {
      width: 8,
      lineCap: 'round',
      lineJoin: 'round',
      glow: 'drop-shadow(0 0 4px rgba(45, 106, 79, 0.4))',
    },
  },
  levels: baseLevels,
};
