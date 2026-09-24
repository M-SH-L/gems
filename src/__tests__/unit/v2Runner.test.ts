import { describe, it, expect } from 'vitest';
import { seededRandom } from '@/v2/core/env';
import {
  LANES,
  MAX_SPEED,
  START_SPEED,
  createRunner,
  jump,
  score,
  steer,
  stepRunner,
  type RunnerState,
} from '@/v2/games/runner/logic';

function run(s: RunnerState, seconds: number, dt = 1 / 60) {
  for (let t = 0; t < seconds; t += dt) stepRunner(s, dt);
}

describe('Gem Rush runner logic', () => {
  it('starts alive in the centre lane with track spawned ahead', () => {
    const s = createRunner(seededRandom(1));
    expect(s.alive).toBe(true);
    expect(s.lane).toBe(0);
    expect(s.obstacles.length).toBeGreaterThan(0);
  });

  it('never blocks all three lanes in a single row', () => {
    for (let seed = 1; seed < 40; seed++) {
      const s = createRunner(seededRandom(seed));
      const rows = new Map<number, Set<number>>();
      for (const o of s.obstacles) {
        if (!rows.has(o.s)) rows.set(o.s, new Set());
        rows.get(o.s)!.add(o.lane);
      }
      for (const lanes of rows.values()) expect(lanes.size).toBeLessThan(LANES.length);
    }
  });

  it('clamps steering to the outer lanes', () => {
    const s = createRunner(seededRandom(2));
    steer(s, -1);
    steer(s, -1);
    expect(s.lane).toBe(-1);
    steer(s, 1);
    steer(s, 1);
    steer(s, 1);
    expect(s.lane).toBe(1);
  });

  it('jumps only from the ground and lands again', () => {
    const s = createRunner(seededRandom(3));
    s.obstacles = [];
    s.nextSpawn = Infinity;
    expect(jump(s)).toBe(true);
    stepRunner(s, 0.05);
    expect(s.y).toBeGreaterThan(0);
    expect(jump(s)).toBe(false);
    run(s, 1.5);
    expect(s.y).toBe(0);
  });

  it('crashes into a wall in the same lane', () => {
    const s = createRunner(seededRandom(4));
    s.obstacles = [{ id: 999, lane: 0, s: 5, kind: 'wall' }];
    s.gems = [];
    s.nextSpawn = Infinity;
    run(s, 1);
    expect(s.alive).toBe(false);
  });

  it('dodges a wall by changing lane', () => {
    const s = createRunner(seededRandom(4));
    s.obstacles = [{ id: 999, lane: 0, s: 8, kind: 'wall' }];
    s.gems = [];
    s.nextSpawn = Infinity;
    steer(s, 1);
    run(s, 1);
    expect(s.alive).toBe(true);
  });

  it('clears a bar by jumping but not by running into it', () => {
    const hit = createRunner(seededRandom(5));
    hit.obstacles = [{ id: 1, lane: 0, s: 6, kind: 'bar' }];
    hit.nextSpawn = Infinity;
    run(hit, 1);
    expect(hit.alive).toBe(false);

    const hop = createRunner(seededRandom(5));
    hop.obstacles = [{ id: 1, lane: 0, s: 6, kind: 'bar' }];
    hop.nextSpawn = Infinity;
    // Jump so the apex lines up with the bar.
    run(hop, (6 - 3) / START_SPEED);
    jump(hop);
    run(hop, 1);
    expect(hop.alive).toBe(true);
  });

  it('collects gems and scores them', () => {
    const s = createRunner(seededRandom(6));
    s.obstacles = [];
    s.nextSpawn = Infinity;
    s.gems = [{ id: 1, lane: 0, s: 4, y: 0.6, taken: false }];
    run(s, 0.5);
    expect(s.gemsCollected).toBe(1);
    expect(score(s)).toBeGreaterThanOrEqual(25);
  });

  it('speeds up over time but caps at max speed', () => {
    const s = createRunner(seededRandom(7));
    s.obstacles = [];
    s.nextSpawn = Infinity;
    run(s, 5);
    expect(s.speed).toBeGreaterThan(START_SPEED);
    s.speed = MAX_SPEED;
    run(s, 1);
    expect(s.speed).toBe(MAX_SPEED);
  });
});
