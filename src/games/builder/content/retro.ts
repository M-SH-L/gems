import type { BuilderContent } from '../types';

export const retroContent: BuilderContent = {
  id: 'retro',
  title: 'Pixel Town',
  description: 'Grow a pixel village by balancing homes, shops, and parks.',
  scoreLabel: 'Happiness Score',
  gridBackground: {
    color: '#153b1e',
    image:
      'linear-gradient(90deg, rgba(0,0,0,0.2) 1px, transparent 1px), linear-gradient(0deg, rgba(0,0,0,0.2) 1px, transparent 1px)',
    size: '24px 24px',
  },
  items: [
    { id: 'house', name: 'House', icon: '🏠', cost: 10, color: '#b85c38' },
    { id: 'shop', name: 'Shop', icon: '🏪', cost: 12, color: '#f6c85f' },
    { id: 'road', name: 'Road', icon: '🛣️', cost: 6, color: '#4d4d4d' },
    { id: 'park', name: 'Park', icon: '🌳', cost: 8, color: '#2a9d3f' },
    { id: 'well', name: 'Well', icon: '⛲', cost: 7, color: '#6c757d' },
    { id: 'tavern', name: 'Tavern', icon: '🍺', cost: 12, color: '#8d5524' },
    { id: 'wall', name: 'Wall', icon: '🧱', cost: 5, color: '#a17f5a' },
    { id: 'farm', name: 'Farm', icon: '🌾', cost: 9, color: '#9acd32' },
    { id: 'tower', name: 'Tower', icon: '🗼', cost: 11, color: '#c07c3d' },
    { id: 'bridge', name: 'Bridge', icon: '🌉', cost: 10, color: '#8c5a3c' },
  ],
  adjacencyRules: [
    { item: 'house', neighbor: 'park', bonus: 6 },
    { item: 'shop', neighbor: 'road', bonus: 4 },
    { item: 'tavern', neighbor: 'house', bonus: 5 },
  ],
};
