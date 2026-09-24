export const BASE_SIZE = 3;
export const BLOCK_HEIGHT = 0.5;
export const TRAVEL = 4.2; // how far past the tower a slab slides
export const START_SPEED = 3.2;
export const SPEED_STEP = 0.09;
export const MAX_SPEED = 7.5;
export const PERFECT_TOLERANCE = 0.1;
export const GROW_AFTER = 3; // perfect streak length before slabs start growing back
export const GROW_AMOUNT = 0.15;

export type Axis = 'x' | 'z';

export interface Slab {
  x: number;
  z: number;
  w: number; // size along x
  d: number; // size along z
}

export interface Moving extends Slab {
  axis: Axis;
  dir: 1 | -1;
  speed: number;
}

export interface StackerState {
  layers: Slab[];
  moving: Moving;
  combo: number;
  bestCombo: number;
  over: boolean;
}

export type PlaceResult =
  | { kind: 'perfect'; placed: Slab; grew: boolean }
  | { kind: 'cut'; placed: Slab; debris: Slab }
  | { kind: 'miss'; debris: Slab };

export function createStacker(): StackerState {
  const base: Slab = { x: 0, z: 0, w: BASE_SIZE, d: BASE_SIZE };
  return {
    layers: [base],
    moving: spawnMoving(base, 'x', START_SPEED),
    combo: 0,
    bestCombo: 0,
    over: false,
  };
}

export function stackScore(s: StackerState) {
  return s.layers.length - 1;
}

export function topSlab(s: StackerState): Slab {
  return s.layers[s.layers.length - 1];
}

function spawnMoving(top: Slab, axis: Axis, speed: number): Moving {
  return {
    x: axis === 'x' ? top.x - TRAVEL : top.x,
    z: axis === 'z' ? top.z - TRAVEL : top.z,
    w: top.w,
    d: top.d,
    axis,
    dir: 1,
    speed,
  };
}

export function stepStacker(s: StackerState, dt: number) {
  if (s.over) return;
  const m = s.moving;
  const top = topSlab(s);
  const center = m.axis === 'x' ? top.x : top.z;
  let pos = (m.axis === 'x' ? m.x : m.z) + m.dir * m.speed * dt;
  // Ping-pong across the tower, reflecting any overshoot.
  if (pos > center + TRAVEL) {
    pos = 2 * (center + TRAVEL) - pos;
    m.dir = -1;
  } else if (pos < center - TRAVEL) {
    pos = 2 * (center - TRAVEL) - pos;
    m.dir = 1;
  }
  if (m.axis === 'x') m.x = pos;
  else m.z = pos;
}

export function placeSlab(s: StackerState): PlaceResult | null {
  if (s.over) return null;
  const m = s.moving;
  const top = topSlab(s);
  const axis = m.axis;
  const delta = axis === 'x' ? m.x - top.x : m.z - top.z;
  const size = axis === 'x' ? m.w : m.d;
  const overlap = size - Math.abs(delta);

  if (overlap <= 0) {
    s.over = true;
    s.combo = 0;
    return { kind: 'miss', debris: { x: m.x, z: m.z, w: m.w, d: m.d } };
  }

  let result: PlaceResult;
  if (Math.abs(delta) <= PERFECT_TOLERANCE) {
    s.combo++;
    s.bestCombo = Math.max(s.bestCombo, s.combo);
    const placed: Slab = { x: top.x, z: top.z, w: m.w, d: m.d };
    let grew = false;
    if (s.combo >= GROW_AFTER) {
      const before = placed.w + placed.d;
      placed.w = Math.min(BASE_SIZE, placed.w + GROW_AMOUNT);
      placed.d = Math.min(BASE_SIZE, placed.d + GROW_AMOUNT);
      grew = placed.w + placed.d > before;
    }
    result = { kind: 'perfect', placed, grew };
  } else {
    s.combo = 0;
    const sign = Math.sign(delta);
    const cutSize = Math.abs(delta);
    const placed: Slab = { ...top, w: m.w, d: m.d };
    const debris: Slab = { x: m.x, z: m.z, w: m.w, d: m.d };
    if (axis === 'x') {
      placed.w = overlap;
      placed.x = top.x + delta / 2;
      debris.w = cutSize;
      debris.x = placed.x + sign * (overlap / 2 + cutSize / 2);
    } else {
      placed.d = overlap;
      placed.z = top.z + delta / 2;
      debris.d = cutSize;
      debris.z = placed.z + sign * (overlap / 2 + cutSize / 2);
    }
    result = { kind: 'cut', placed, debris };
  }

  s.layers.push(result.placed);
  const nextAxis: Axis = axis === 'x' ? 'z' : 'x';
  s.moving = spawnMoving(result.placed, nextAxis, Math.min(MAX_SPEED, m.speed + SPEED_STEP));
  return result;
}
