import { describe, it, expect } from 'vitest';
import { createInitialState, updateState } from '@/games/platformer/engine';
import { buildLevel } from '@/games/platformer/levels';
import type { PlatformerContent } from '@/games/platformer/entities';

const content: PlatformerContent = {
  theme: 'retro',
  palette: {
    style: 'retro',
    background: '#000',
    ground: '#333',
    groundAlt: '#222',
    collectible: '#ff0',
    hazard: '#f00',
    goal: '#0f0',
    player: '#0f0',
    platform: '#444',
    glow: '#0f0',
  },
  levels: [
    {
      id: 'test',
      spawn: { x: 1, y: 1 },
      tiles: [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 2, 0, 3, 4],
        [1, 1, 1, 1, 1],
      ],
    },
  ],
};

describe('platformer engine', () => {
  it('applies gravity', () => {
    const state = createInitialState(content);
    const initialVy = state.player.vy;
    updateState(state, { left: false, right: false, jump: false }, 0.1);
    expect(state.player.vy).toBeGreaterThan(initialVy);
  });

  it('jumps when on ground', () => {
    const state = createInitialState(content);
    state.player.onGround = true;
    updateState(state, { left: false, right: false, jump: true }, 0.016);
    expect(state.player.vy).toBeLessThan(0);
  });

  it('does not jump in air', () => {
    const state = createInitialState(content);
    state.player.onGround = false;
    const vy = state.player.vy;
    updateState(state, { left: false, right: false, jump: true }, 0.016);
    expect(state.player.vy).toBeGreaterThanOrEqual(vy);
  });

  it('moves horizontally with input', () => {
    const state = createInitialState(content);
    updateState(state, { left: true, right: false, jump: false }, 0.1);
    expect(state.player.x).toBeLessThan(32);
    updateState(state, { left: false, right: true, jump: false }, 0.1);
    expect(state.player.x).toBeGreaterThan(0);
  });

  it('collides with ground', () => {
    const state = createInitialState(content);
    state.player.y = 64;
    state.player.vy = 0;
    updateState(state, { left: false, right: false, jump: false }, 0.1);
    expect(state.player.onGround).toBe(true);
  });

  it('collects collectibles', () => {
    const state = createInitialState(content);
    state.player.x = 32;
    state.player.y = 64;
    updateState(state, { left: false, right: false, jump: false }, 0.016);
    expect(state.score).toBe(10);
  });

  it('hits hazards', () => {
    const state = createInitialState(content);
    state.player.x = 96;
    state.player.y = 64;
    updateState(state, { left: false, right: false, jump: false }, 0.016);
    expect(state.lives).toBe(2);
  });

  it('reaches goal', () => {
    const state = createInitialState(content);
    state.player.x = 128;
    state.player.y = 64;
    updateState(state, { left: false, right: false, jump: false }, 0.016);
    expect(state.status).toBe('level-complete');
  });

  it('parses levels into state', () => {
    const level = buildLevel(content.levels[0]);
    expect(level.width).toBe(5);
    expect(level.height).toBe(4);
  });
});
