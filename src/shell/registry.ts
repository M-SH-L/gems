import { lazy, type ComponentType } from 'react';

export interface GameEntry {
  id: string;
  title: string;
  description: string;
  icon: string;
  component: React.LazyExoticComponent<ComponentType>;
}

export const games: GameEntry[] = [
  {
    id: 'fiction',
    title: 'Interactive Fiction',
    description: 'Explore branching stories',
    icon: '📖',
    component: lazy(() => import('../games/fiction/FictionGame')),
  },
  {
    id: 'geography',
    title: 'Geography',
    description: 'Pin & Discover landmarks',
    icon: '🌍',
    component: lazy(() => import('../games/geography/GeographyGame')),
  },
  {
    id: 'platformer',
    title: 'Platformer',
    description: 'Run, jump, collect',
    icon: '🏃',
    component: lazy(() => import('../games/platformer/PlatformerGame')),
  },
  {
    id: 'builder',
    title: 'Building Sim',
    description: 'Build your world',
    icon: '🏗️',
    component: lazy(() => import('../games/builder/BuilderGame')),
  },
  {
    id: 'circuit',
    title: 'Circuit Puzzle',
    description: 'Connect the nodes',
    icon: '🔌',
    component: lazy(() => import('../games/circuit/CircuitGame')),
  },
];
