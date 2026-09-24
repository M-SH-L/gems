export const LANE_WIDTH = 2.2;
export const LANES = [-1, 0, 1] as const;
export type Lane = (typeof LANES)[number];

export const START_SPEED = 14;
export const MAX_SPEED = 34;
export const ACCEL = 0.35; // units/s gained per second
export const GRAVITY = 38;
export const JUMP_VELOCITY = 13;
export const BAR_HEIGHT = 0.9; // player must be above this to clear a bar
export const HIT_DEPTH = 0.9;
export const SPAWN_AHEAD = 90;
export const GEM_POINTS = 25;

export type ObstacleKind = 'wall' | 'bar';

export interface Obstacle {
  id: number;
  lane: Lane;
  s: number; // distance along the track
  kind: ObstacleKind;
}

export interface Gem {
  id: number;
  lane: Lane;
  s: number;
  y: number;
  taken: boolean;
}

export interface RunnerState {
  lane: Lane;
  x: number; // smoothed lateral position
  y: number;
  vy: number;
  distance: number;
  speed: number;
  obstacles: Obstacle[];
  gems: Gem[];
  gemsCollected: number;
  nextSpawn: number;
  nextId: number;
  alive: boolean;
  rand: () => number;
}

export interface RunnerEvents {
  collected: Gem[];
  crashed: Obstacle | null;
  jumped: boolean;
}

export function createRunner(rand: () => number): RunnerState {
  const s: RunnerState = {
    lane: 0,
    x: 0,
    y: 0,
    vy: 0,
    distance: 0,
    speed: START_SPEED,
    obstacles: [],
    gems: [],
    gemsCollected: 0,
    nextSpawn: 30,
    nextId: 1,
    alive: true,
    rand,
  };
  spawnAhead(s);
  return s;
}

export function score(s: RunnerState) {
  return Math.floor(s.distance) + s.gemsCollected * GEM_POINTS;
}

export function steer(s: RunnerState, dir: -1 | 1) {
  if (!s.alive) return;
  s.lane = Math.max(-1, Math.min(1, s.lane + dir)) as Lane;
}

export function jump(s: RunnerState): boolean {
  if (!s.alive || s.y > 0.001) return false;
  s.vy = JUMP_VELOCITY;
  return true;
}

/** Fill the track ahead with rows. Every row leaves at least one lane free. */
export function spawnAhead(s: RunnerState) {
  while (s.nextSpawn < s.distance + SPAWN_AHEAD) {
    const row = s.nextSpawn;
    const r = s.rand;
    const blocked = r() < 0.35 ? 2 : 1;
    const lanes = shuffle([...LANES], r);
    const hit = lanes.slice(0, blocked);
    const free = lanes.slice(blocked);
    for (const lane of hit) {
      // Bars only appear once the player has had time to learn to jump.
      const kind: ObstacleKind = s.distance > 40 && r() < 0.4 ? 'bar' : 'wall';
      s.obstacles.push({ id: s.nextId++, lane, s: row, kind });
      if (kind === 'bar' && r() < 0.5) {
        s.gems.push({ id: s.nextId++, lane, s: row, y: 2.2, taken: false });
      }
    }
    // A short trail of gems in a free lane leading up to the row.
    if (r() < 0.75) {
      const lane = free[Math.floor(r() * free.length)];
      const count = 3 + Math.floor(r() * 2);
      for (let i = 0; i < count; i++) {
        s.gems.push({ id: s.nextId++, lane, s: row - 2 - i * 2, y: 0.6, taken: false });
      }
    }
    const gap = 16 - Math.min(6, (s.speed - START_SPEED) * 0.3);
    s.nextSpawn += gap + r() * 6;
  }
}

function shuffle<T>(arr: T[], r: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function stepRunner(s: RunnerState, dt: number): RunnerEvents {
  const ev: RunnerEvents = { collected: [], crashed: null, jumped: false };
  if (!s.alive) return ev;

  s.speed = Math.min(MAX_SPEED, s.speed + ACCEL * dt);
  const prev = s.distance;
  s.distance += s.speed * dt;

  const targetX = s.lane * LANE_WIDTH;
  s.x += (targetX - s.x) * (1 - Math.exp(-18 * dt));

  s.vy -= GRAVITY * dt;
  s.y = Math.max(0, s.y + s.vy * dt);
  if (s.y === 0) s.vy = 0;

  // Lane is "occupied" once the player is mostly across.
  const lanePos = s.x / LANE_WIDTH;

  for (const o of s.obstacles) {
    // Swept test so fast frames can't tunnel through a thin obstacle.
    if (o.s + HIT_DEPTH < prev || o.s - HIT_DEPTH > s.distance) continue;
    if (Math.abs(lanePos - o.lane) > 0.45) continue;
    if (o.kind === 'bar' && s.y > BAR_HEIGHT) continue;
    s.alive = false;
    ev.crashed = o;
    return ev;
  }

  for (const g of s.gems) {
    if (g.taken) continue;
    if (g.s + 0.8 < prev || g.s - 0.8 > s.distance) continue;
    if (Math.abs(lanePos - g.lane) > 0.5) continue;
    if (Math.abs(s.y + 0.5 - g.y) > 1.3) continue;
    g.taken = true;
    s.gemsCollected++;
    ev.collected.push(g);
  }

  // Cull what's behind the camera.
  const behind = s.distance - 12;
  s.obstacles = s.obstacles.filter((o) => o.s > behind);
  s.gems = s.gems.filter((g) => g.s > behind && !g.taken);

  spawnAhead(s);
  return ev;
}
