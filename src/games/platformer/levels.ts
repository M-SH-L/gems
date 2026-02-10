import {
  TILE_SIZE,
  TileCode,
  type LevelDefinition,
  type LevelState,
  type MovingPlatformDef,
  type Vec2,
} from './entities';

const symbolMap: Record<string, TileCode> = {
  '.': TileCode.Air,
  '#': TileCode.Ground,
  'C': TileCode.Collectible,
  'H': TileCode.Hazard,
  'G': TileCode.Goal,
  'P': TileCode.Platform,
  'S': TileCode.Air,
};

interface LevelOptions {
  movingPlatforms?: MovingPlatformDef[];
  spawn?: Vec2;
}

export function levelFromAscii(
  id: string,
  lines: string[],
  options: LevelOptions = {}
): LevelDefinition {
  const maxLen = lines.reduce((max, line) => Math.max(max, line.length), 0);
  const tiles: number[][] = [];
  let spawn: Vec2 | null = options.spawn ?? null;

  for (let y = 0; y < lines.length; y++) {
    const line = lines[y].padEnd(maxLen, '.');
    const row: number[] = [];
    for (let x = 0; x < line.length; x++) {
      const ch = line[x];
      if (ch === 'S') {
        spawn = { x, y };
      }
      row.push(symbolMap[ch] ?? TileCode.Air);
    }
    tiles.push(row);
  }

  if (!spawn) {
    spawn = { x: 1, y: 1 };
  }

  return {
    id,
    tiles,
    spawn,
    movingPlatforms: options.movingPlatforms ?? [],
  };
}

export function buildLevel(def: LevelDefinition): LevelState {
  const tiles = def.tiles.map((row) => row.slice());
  const width = tiles[0]?.length ?? 0;
  const height = tiles.length;
  const movingPlatforms = (def.movingPlatforms ?? []).map((mp, index) => {
    const id = mp.id ?? `${def.id}-mp-${index}`;
    const speed = mp.speed * TILE_SIZE;
    return {
      id,
      x: mp.x * TILE_SIZE,
      y: mp.y * TILE_SIZE,
      width: mp.width * TILE_SIZE,
      height: mp.height * TILE_SIZE,
      axis: mp.axis,
      min: mp.min * TILE_SIZE,
      max: mp.max * TILE_SIZE,
      speed,
      vx: mp.axis === 'x' ? speed : 0,
      vy: mp.axis === 'y' ? speed : 0,
      dx: 0,
      dy: 0,
    };
  });

  return {
    tiles,
    width,
    height,
    spawn: { ...def.spawn },
    movingPlatforms,
  };
}

export function cloneLevel(def: LevelDefinition): LevelDefinition {
  return {
    id: def.id,
    tiles: def.tiles.map((row) => row.slice()),
    spawn: { ...def.spawn },
    movingPlatforms: def.movingPlatforms?.map((mp) => ({ ...mp })) ?? [],
  };
}

export function tileToPixels(tile: Vec2): Vec2 {
  return { x: tile.x * TILE_SIZE, y: tile.y * TILE_SIZE };
}
