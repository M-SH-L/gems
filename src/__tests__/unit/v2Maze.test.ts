import { describe, it, expect } from 'vitest';
import { cellCenter, mazeLevels, parseLevel, type ParsedLevel } from '@/v2/games/maze/levels';
import { FALL_TIME, MAX_TILT, createMaze, stepMaze } from '@/v2/games/maze/logic';

function solvable(level: ParsedLevel) {
  const find = (ch: string) => {
    for (let r = 0; r < level.rows; r++) {
      const c = level.grid[r].indexOf(ch as never);
      if (c >= 0) return [c, r];
    }
    throw new Error(`missing ${ch}`);
  };
  const [sc, sr] = find('S');
  const [gc, gr] = find('G');
  const seen = new Set([`${sc},${sr}`]);
  const queue = [[sc, sr]];
  while (queue.length) {
    const [c, r] = queue.shift()!;
    if (c === gc && r === gr) return true;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc;
      const nr = r + dr;
      const cell = level.grid[nr]?.[nc];
      if (!cell || cell === '#' || cell === 'O' || seen.has(`${nc},${nr}`)) continue;
      seen.add(`${nc},${nr}`);
      queue.push([nc, nr]);
    }
  }
  return false;
}

function run(s: ReturnType<typeof createMaze>, dx: number, dz: number, seconds: number) {
  const events = [];
  for (let t = 0; t < seconds; t += 1 / 60) events.push(stepMaze(s, dx, dz, 1 / 60));
  return events;
}

const box = (rows: string[]) => parseLevel({ name: 't', rows });
// Physics fixtures park the goal in a sealed pocket so it can't be reached.
const sealed = (row: string) => box(['#'.repeat(row.length + 2), `${row}##`, `${'#'.repeat(row.length)}G#`, '#'.repeat(row.length + 2)]);

describe('Tilt Maze levels', () => {
  it.each(mazeLevels.map((l) => [l.name, l] as const))('%s is rectangular, walled and solvable', (_, raw) => {
    const level = parseLevel(raw);
    for (const row of raw.rows) expect(row).toHaveLength(level.cols);
    expect(raw.rows[0]).toMatch(/^#+$/);
    expect(raw.rows[raw.rows.length - 1]).toMatch(/^#+$/);
    for (const row of raw.rows) expect(row[0] + row[row.length - 1]).toBe('##');
    expect(solvable(level)).toBe(true);
  });

  it('centres the board on the origin', () => {
    const level = box(['###', '#S#', '###']);
    expect(cellCenter(level, 1, 1)).toEqual({ x: 0, z: 0 });
    expect(level.start).toEqual({ x: 0, z: 0 });
  });
});

describe('Tilt Maze physics', () => {
  it('eases the board toward the requested tilt', () => {
    const s = createMaze(sealed('#S..#'));
    run(s, 1, 0, 2);
    expect(s.tiltX).toBeCloseTo(MAX_TILT, 2);
  });

  it('rolls downhill and is stopped by walls', () => {
    const s = createMaze(sealed('#S...#'));
    run(s, 1, 0, 4);
    expect(s.vx).toBeGreaterThanOrEqual(-0.5);
    // Last open cell is column 4; its right wall face sits half a cell beyond.
    const faceX = s.level.start.x + 3 + 0.5;
    expect(s.x).toBeLessThan(faceX);
    expect(s.x).toBeGreaterThan(faceX - 0.6);
    expect(Math.abs(s.z - s.level.start.z)).toBeLessThan(0.05);
  });

  it('falls into a hole and respawns at the start', () => {
    const s = createMaze(sealed('#S.O#'));
    const events = run(s, 1, 0, 3);
    expect(events.some((e) => e.fell)).toBe(true);
    expect(events.some((e) => e.respawned)).toBe(true);
    expect(s.falls).toBeGreaterThanOrEqual(1);
    expect(FALL_TIME).toBeGreaterThan(0);
  });

  it('wins on reaching the goal and collects gems on the way', () => {
    const s = createMaze(box(['######', '#S*.G#', '######']));
    const events = run(s, 1, 0, 4);
    expect(events.some((e) => e.won)).toBe(true);
    expect(s.status).toBe('won');
    expect(s.gemsTaken.size).toBe(1);
  });
});
