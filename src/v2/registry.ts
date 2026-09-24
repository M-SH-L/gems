import type { V2GameMeta } from './core/types';

export const v2Games: V2GameMeta[] = [
  {
    id: 'runner',
    name: 'Gem Rush',
    tagline: 'Race down an endless neon causeway, dodge crystal walls and scoop up gems.',
    genre: 'Endless runner',
    color: '#ff4fd8',
    controls: ['← → / A D  switch lane', 'Space / ↑  jump', 'R  restart'],
  },
  {
    id: 'stacker',
    name: 'Sky Stack',
    tagline: 'Drop sliding slabs to build a tower into the clouds. Miss the edge and it gets trimmed.',
    genre: 'Timing',
    color: '#ffb347',
    controls: ['Space / Click  drop slab', 'R  restart'],
  },
  {
    id: 'maze',
    name: 'Tilt Maze',
    tagline: 'Tilt a floating board to roll the marble home. Mind the holes.',
    genre: 'Physics puzzle',
    color: '#3ee6c1',
    controls: ['Arrows / WASD  tilt board', 'Drag  tilt (touch)', 'R  restart level'],
  },
];

export function getV2Game(id: string) {
  return v2Games.find((g) => g.id === id);
}
