import { describe, it, expect } from 'vitest';
import {
  BASE_SIZE,
  GROW_AFTER,
  TRAVEL,
  createStacker,
  placeSlab,
  stackScore,
  stepStacker,
  topSlab,
} from '@/v2/games/stacker/logic';

describe('Sky Stack logic', () => {
  it('starts with a base slab and a slab sliding in on x', () => {
    const s = createStacker();
    expect(s.layers).toHaveLength(1);
    expect(s.moving.axis).toBe('x');
    expect(s.moving.x).toBeCloseTo(-TRAVEL);
  });

  it('ping-pongs the moving slab within range', () => {
    const s = createStacker();
    for (let i = 0; i < 600; i++) {
      stepStacker(s, 1 / 60);
      expect(Math.abs(s.moving.x)).toBeLessThanOrEqual(TRAVEL + 1e-9);
    }
  });

  it('snaps a near-aligned drop as perfect and keeps full size', () => {
    const s = createStacker();
    s.moving.x = 0.05;
    const res = placeSlab(s)!;
    expect(res.kind).toBe('perfect');
    expect(topSlab(s)).toMatchObject({ x: 0, w: BASE_SIZE });
    expect(s.combo).toBe(1);
    expect(s.moving.axis).toBe('z');
  });

  it('trims the overhang and drops it as debris', () => {
    const s = createStacker();
    s.moving.x = 1;
    const res = placeSlab(s)!;
    expect(res.kind).toBe('cut');
    if (res.kind !== 'cut') return;
    expect(res.placed.w).toBeCloseTo(BASE_SIZE - 1);
    expect(res.placed.x).toBeCloseTo(0.5);
    expect(res.debris.w).toBeCloseTo(1);
    expect(res.debris.x).toBeCloseTo(2);
    expect(s.combo).toBe(0);
    expect(stackScore(s)).toBe(1);
  });

  it('ends the game on a complete miss', () => {
    const s = createStacker();
    s.moving.x = BASE_SIZE + 0.5;
    const res = placeSlab(s)!;
    expect(res.kind).toBe('miss');
    expect(s.over).toBe(true);
    expect(placeSlab(s)).toBeNull();
  });

  it('grows slabs back after a streak of perfects', () => {
    const s = createStacker();
    s.moving.x = 1;
    placeSlab(s); // shrink first
    const shrunk = topSlab(s).w;
    for (let i = 0; i < GROW_AFTER; i++) {
      const top = topSlab(s);
      s.moving.x = top.x;
      s.moving.z = top.z;
      placeSlab(s);
    }
    expect(topSlab(s).w).toBeGreaterThan(shrunk);
    expect(topSlab(s).w).toBeLessThanOrEqual(BASE_SIZE);
  });
});
