import type { BuilderContent } from '../types';

export const futuristicContent: BuilderContent = {
  id: 'futuristic',
  title: 'Station Architect',
  description: 'Connect critical modules to keep the station humming.',
  scoreLabel: 'Efficiency Score',
  gridBackground: {
    color: '#0b0e1a',
    image:
      'radial-gradient(rgba(0,229,255,0.2) 1px, transparent 1px), radial-gradient(rgba(224,64,251,0.15) 1px, transparent 1px)',
    size: '20px 20px',
  },
  items: [
    { id: 'quarters', name: 'Crew Quarters', icon: '🛌', cost: 10, color: '#1f9cf0' },
    { id: 'lab', name: 'Lab', icon: '🧪', cost: 14, color: '#8a5cff' },
    { id: 'corridor', name: 'Corridor', icon: '🧭', cost: 5, color: '#354c7a' },
    { id: 'airlock', name: 'Airlock', icon: '🚪', cost: 8, color: '#f97316' },
    { id: 'power-core', name: 'Power Core', icon: '⚡', cost: 15, color: '#fbbf24' },
    { id: 'medbay', name: 'Medbay', icon: '💊', cost: 12, color: '#34d399' },
    { id: 'storage', name: 'Storage', icon: '📦', cost: 9, color: '#64748b' },
    { id: 'comms', name: 'Comms Array', icon: '📡', cost: 11, color: '#22d3ee' },
    { id: 'reactor', name: 'Reactor', icon: '☢️', cost: 13, color: '#fb7185' },
    { id: 'garden-dome', name: 'Garden Dome', icon: '🌿', cost: 10, color: '#2dd4bf' },
  ],
  adjacencyRules: [
    { item: 'quarters', neighbor: 'medbay', bonus: 6 },
    { item: 'lab', neighbor: 'power-core', bonus: 7 },
  ],
};
