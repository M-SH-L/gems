import { cellCenter, type ParsedLevel } from './levels';

export const MARBLE_RADIUS = 0.28;
export const MAX_TILT = 0.32; // radians
export const TILT_RATE = 6;
export const GRAVITY = 16;
export const FRICTION = 0.9;
export const RESTITUTION = 0.35;
export const HOLE_RADIUS = 0.36;
export const GOAL_RADIUS = 0.36;
export const GEM_RADIUS = 0.45;
export const FALL_TIME = 0.8;

export type MazeStatus = 'playing' | 'falling' | 'won';

export interface MazeState {
  level: ParsedLevel;
  x: number;
  z: number;
  vx: number;
  vz: number;
  tiltX: number;
  tiltZ: number;
  status: MazeStatus;
  fallT: number;
  time: number;
  falls: number;
  gemsTaken: Set<string>;
}

export interface MazeEvents {
  collected: string[];
  fell: boolean;
  respawned: boolean;
  won: boolean;
  bumped: number; // impact speed of the hardest wall hit this step
}

export function createMaze(level: ParsedLevel): MazeState {
  return {
    level,
    x: level.start.x,
    z: level.start.z,
    vx: 0,
    vz: 0,
    tiltX: 0,
    tiltZ: 0,
    status: 'playing',
    fallT: 0,
    time: 0,
    falls: 0,
    gemsTaken: new Set(),
  };
}

function cellAt(level: ParsedLevel, x: number, z: number) {
  const col = Math.round(x + (level.cols - 1) / 2);
  const row = Math.round(z + (level.rows - 1) / 2);
  if (row < 0 || row >= level.rows || col < 0 || col >= level.cols) return { cell: '#' as const, col, row };
  return { cell: level.grid[row][col], col, row };
}

/** Push the marble out of any wall cells it overlaps. Returns impact speed. */
function resolveWalls(s: MazeState): number {
  const L = s.level;
  const baseCol = Math.round(s.x + (L.cols - 1) / 2);
  const baseRow = Math.round(s.z + (L.rows - 1) / 2);
  let impact = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const col = baseCol + dc;
      const row = baseRow + dr;
      const wall = row < 0 || row >= L.rows || col < 0 || col >= L.cols || L.grid[row][col] === '#';
      if (!wall) continue;
      const c = cellCenter(L, col, row);
      const px = Math.max(c.x - 0.5, Math.min(s.x, c.x + 0.5));
      const pz = Math.max(c.z - 0.5, Math.min(s.z, c.z + 0.5));
      let nx = s.x - px;
      let nz = s.z - pz;
      const d2 = nx * nx + nz * nz;
      if (d2 >= MARBLE_RADIUS * MARBLE_RADIUS) continue;
      let d = Math.sqrt(d2);
      if (d < 1e-6) {
        // Centre inside the wall: push out along the shallowest axis.
        const ox = s.x - c.x;
        const oz = s.z - c.z;
        if (Math.abs(ox) > Math.abs(oz)) {
          nx = Math.sign(ox) || 1;
          nz = 0;
        } else {
          nx = 0;
          nz = Math.sign(oz) || 1;
        }
        d = 0;
      } else {
        nx /= d;
        nz /= d;
      }
      const push = MARBLE_RADIUS - d;
      s.x += nx * push;
      s.z += nz * push;
      const vn = s.vx * nx + s.vz * nz;
      if (vn < 0) {
        impact = Math.max(impact, -vn);
        s.vx -= (1 + RESTITUTION) * vn * nx;
        s.vz -= (1 + RESTITUTION) * vn * nz;
      }
    }
  }
  return impact;
}

export function resetMarble(s: MazeState) {
  s.x = s.level.start.x;
  s.z = s.level.start.z;
  s.vx = 0;
  s.vz = 0;
  s.status = 'playing';
  s.fallT = 0;
}

/**
 * Advance one frame. `dirX`/`dirZ` are the requested tilt directions in [-1, 1]
 * (positive X rolls right, positive Z rolls toward the camera).
 */
export function stepMaze(s: MazeState, dirX: number, dirZ: number, dt: number): MazeEvents {
  const ev: MazeEvents = { collected: [], fell: false, respawned: false, won: false, bumped: 0 };
  const k = 1 - Math.exp(-TILT_RATE * dt);
  const active = s.status === 'playing';
  s.tiltX += ((active ? dirX : 0) * MAX_TILT - s.tiltX) * k;
  s.tiltZ += ((active ? dirZ : 0) * MAX_TILT - s.tiltZ) * k;

  if (s.status === 'won') return ev;
  if (s.status === 'falling') {
    s.fallT += dt;
    if (s.fallT >= FALL_TIME) {
      resetMarble(s);
      ev.respawned = true;
    }
    return ev;
  }

  s.time += dt;
  s.vx += GRAVITY * Math.sin(s.tiltX) * dt;
  s.vz += GRAVITY * Math.sin(s.tiltZ) * dt;
  const f = Math.exp(-FRICTION * dt);
  s.vx *= f;
  s.vz *= f;

  const dist = Math.hypot(s.vx, s.vz) * dt;
  const steps = Math.max(1, Math.ceil(dist / 0.08));
  const sub = dt / steps;
  for (let i = 0; i < steps; i++) {
    s.x += s.vx * sub;
    s.z += s.vz * sub;
    ev.bumped = Math.max(ev.bumped, resolveWalls(s));
  }

  const L = s.level;
  const here = cellAt(L, s.x, s.z);
  if (here.cell === 'O') {
    const c = cellCenter(L, here.col, here.row);
    if (Math.hypot(s.x - c.x, s.z - c.z) < HOLE_RADIUS) {
      s.status = 'falling';
      s.fallT = 0;
      s.falls++;
      ev.fell = true;
      return ev;
    }
  }

  for (const g of L.gems) {
    if (s.gemsTaken.has(g.id)) continue;
    if (Math.hypot(s.x - g.x, s.z - g.z) < GEM_RADIUS) {
      s.gemsTaken.add(g.id);
      ev.collected.push(g.id);
    }
  }

  if (Math.hypot(s.x - L.goal.x, s.z - L.goal.z) < GOAL_RADIUS) {
    s.status = 'won';
    ev.won = true;
  }
  return ev;
}
