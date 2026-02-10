import type { BuilderContent } from '../types';

export const organicContent: BuilderContent = {
  id: 'organic',
  title: 'Garden of Life',
  description: 'Arrange habitats to help plants and pollinators thrive.',
  scoreLabel: 'Biodiversity Score',
  gridBackground: {
    color: '#f3e7d0',
    image:
      'linear-gradient(45deg, rgba(212,163,115,0.25) 25%, transparent 25%), linear-gradient(-45deg, rgba(212,163,115,0.25) 25%, transparent 25%)',
    size: '28px 28px',
  },
  items: [
    { id: 'flower-bed', name: 'Flower Bed', icon: '🌸', cost: 9, color: '#f472b6' },
    { id: 'tree', name: 'Tree', icon: '🌲', cost: 12, color: '#4d7c0f' },
    { id: 'pond', name: 'Pond', icon: '💧', cost: 11, color: '#38bdf8' },
    { id: 'path', name: 'Path', icon: '🪵', cost: 5, color: '#c4a484' },
    { id: 'bench', name: 'Bench', icon: '🪑', cost: 7, color: '#a16207' },
    { id: 'beehive', name: 'Beehive', icon: '🐝', cost: 10, color: '#facc15' },
    { id: 'herb-garden', name: 'Herb Garden', icon: '🌿', cost: 8, color: '#22c55e' },
    { id: 'bird-bath', name: 'Bird Bath', icon: '🕊️', cost: 9, color: '#94a3b8' },
    { id: 'trellis', name: 'Trellis', icon: '🧵', cost: 6, color: '#b45309' },
    { id: 'compost', name: 'Compost', icon: '🍂', cost: 6, color: '#92400e' },
  ],
  adjacencyRules: [
    { item: 'tree', neighbor: 'pond', bonus: 6 },
    { item: 'beehive', neighbor: 'flower-bed', bonus: 5 },
    { item: 'path', neighbor: 'bench', bonus: 2 },
    { item: 'path', neighbor: 'trellis', bonus: 2 },
    { item: 'path', neighbor: 'herb-garden', bonus: 2 },
  ],
};
