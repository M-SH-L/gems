import { clamp } from '@/utils/clamp';
import {
  TILE_SIZE,
  TileCode,
  type LevelState,
  type PlatformerContent,
  type Player,
  type Vec2,
} from './entities';
import { buildLevel } from './levels';

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
}

export interface PlatformerState {
  content: PlatformerContent;
  levelIndex: number;
  level: LevelState;
  player: Player;
  score: number;
  lives: number;
  time: number;
  status: 'playing' | 'level-complete' | 'game-over';
  statusTimer: number;
}

const GRAVITY = 2000;
const MOVE_SPEED = 240;
const JUMP_VELOCITY = 680;
const PLAYER_WIDTH = 22;
const PLAYER_HEIGHT = 28;
const STATUS_DELAY = 1.0;

export function createInitialState(
  content: PlatformerContent,
  levelIndex = 0
): PlatformerState {
  const level = buildLevel(content.levels[levelIndex]);
  const player = createPlayer(level.spawn);
  return {
    content,
    levelIndex,
    level,
    player,
    score: 0,
    lives: 3,
    time: 0,
    status: 'playing',
    statusTimer: 0,
  };
}

export function inputFromKeys(keys: Set<string>): InputState {
  const left = keys.has('ArrowLeft') || keys.has('KeyA');
  const right = keys.has('ArrowRight') || keys.has('KeyD');
  const jump =
    keys.has('ArrowUp') || keys.has('KeyW') || keys.has('Space');
  return { left, right, jump };
}

export function updateState(
  state: PlatformerState,
  input: InputState,
  dt: number
) {
  if (state.status !== 'playing') {
    state.statusTimer += dt;
    if (state.statusTimer >= STATUS_DELAY) {
      if (state.status === 'level-complete') {
        advanceLevel(state);
      } else {
        resetLevel(state, state.levelIndex, true);
      }
    }
    return;
  }

  state.time += dt;
  updatePlatforms(state.level, dt);

  if (state.player.onPlatformId) {
    const platform = state.level.movingPlatforms.find(
      (p) => p.id === state.player.onPlatformId
    );
    if (platform) {
      state.player.x += platform.dx;
      state.player.y += platform.dy;
    }
  }

  applyInput(state.player, input);
  applyPhysics(state.player, dt);
  movePlayer(state, dt);
  clampPlayerToLevel(state);
  handleTileInteractions(state);
}

function createPlayer(spawn: Vec2): Player {
  const x = spawn.x * TILE_SIZE + (TILE_SIZE - PLAYER_WIDTH) / 2;
  const y = spawn.y * TILE_SIZE + (TILE_SIZE - PLAYER_HEIGHT);
  return {
    x,
    y,
    w: PLAYER_WIDTH,
    h: PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    onGround: false,
    onPlatformId: null,
  };
}

function resetLevel(
  state: PlatformerState,
  levelIndex: number,
  resetScore: boolean
) {
  const level = buildLevel(state.content.levels[levelIndex]);
  state.levelIndex = levelIndex;
  state.level = level;
  state.player = createPlayer(level.spawn);
  state.lives = 3;
  state.time = 0;
  if (resetScore) state.score = 0;
  state.status = 'playing';
  state.statusTimer = 0;
}

function advanceLevel(state: PlatformerState) {
  const nextIndex = state.levelIndex + 1;
  if (nextIndex >= state.content.levels.length) {
    resetLevel(state, 0, true);
    return;
  }
  resetLevel(state, nextIndex, false);
}

function updatePlatforms(level: LevelState, dt: number) {
  for (const platform of level.movingPlatforms) {
    const prevX = platform.x;
    const prevY = platform.y;
    if (platform.axis === 'x') {
      platform.x += platform.vx * dt;
      if (platform.x < platform.min || platform.x > platform.max) {
        platform.vx *= -1;
        platform.x = clamp(platform.x, platform.min, platform.max);
      }
    } else {
      platform.y += platform.vy * dt;
      if (platform.y < platform.min || platform.y > platform.max) {
        platform.vy *= -1;
        platform.y = clamp(platform.y, platform.min, platform.max);
      }
    }
    platform.dx = platform.x - prevX;
    platform.dy = platform.y - prevY;
  }
}

function applyInput(player: Player, input: InputState) {
  if (input.left === input.right) {
    player.vx = 0;
  } else if (input.left) {
    player.vx = -MOVE_SPEED;
  } else if (input.right) {
    player.vx = MOVE_SPEED;
  }

  if (input.jump && player.onGround) {
    player.vy = -JUMP_VELOCITY;
    player.onGround = false;
    player.onPlatformId = null;
  }
}

function applyPhysics(player: Player, dt: number) {
  player.vy += GRAVITY * dt;
}

function movePlayer(state: PlatformerState, dt: number) {
  const player = state.player;
  const prevX = player.x;
  const prevY = player.y;

  let newX = player.x + player.vx * dt;
  newX = resolveHorizontalTiles(state.level, player, newX);
  newX = resolveHorizontalPlatforms(state.level, player, newX, prevX);
  player.x = newX;

  let newY = player.y + player.vy * dt;
  player.onGround = false;
  player.onPlatformId = null;
  newY = resolveVerticalTiles(state.level, player, newY);
  const platformHit = resolveVerticalPlatforms(
    state.level,
    player,
    newY,
    prevY
  );
  player.y = platformHit.y;
  if (platformHit.onGround) {
    player.onGround = true;
    player.onPlatformId = platformHit.platformId;
  }
}

function clampPlayerToLevel(state: PlatformerState) {
  const levelWidth = state.level.width * TILE_SIZE;
  const levelHeight = state.level.height * TILE_SIZE;
  state.player.x = clamp(state.player.x, 0, levelWidth - state.player.w);
  state.player.y = Math.min(state.player.y, levelHeight + TILE_SIZE);
}

function resolveHorizontalTiles(
  level: LevelState,
  player: Player,
  newX: number
) {
  const dir = Math.sign(player.vx);
  if (dir === 0) return newX;

  const yTop = Math.floor(player.y / TILE_SIZE);
  const yBottom = Math.floor((player.y + player.h - 1) / TILE_SIZE);

  if (dir > 0) {
    const xRight = Math.floor((newX + player.w) / TILE_SIZE);
    for (let ty = yTop; ty <= yBottom; ty++) {
      if (isSolidTile(tileAt(level, xRight, ty))) {
        player.vx = 0;
        return xRight * TILE_SIZE - player.w - 0.01;
      }
    }
  } else {
    const xLeft = Math.floor(newX / TILE_SIZE);
    for (let ty = yTop; ty <= yBottom; ty++) {
      if (isSolidTile(tileAt(level, xLeft, ty))) {
        player.vx = 0;
        return (xLeft + 1) * TILE_SIZE + 0.01;
      }
    }
  }

  return newX;
}

function resolveHorizontalPlatforms(
  level: LevelState,
  player: Player,
  newX: number,
  prevX: number
) {
  if (player.vx === 0) return newX;
  for (const platform of level.movingPlatforms) {
    const rect = {
      x: newX,
      y: player.y,
      w: player.w,
      h: player.h,
    };
    if (!rectsOverlap(rect, platform)) continue;

    if (player.vx > 0 && prevX + player.w <= platform.x) {
      player.vx = 0;
      return platform.x - player.w - 0.01;
    }
    if (
      player.vx < 0 &&
      prevX >= platform.x + platform.width - 0.01
    ) {
      player.vx = 0;
      return platform.x + platform.width + 0.01;
    }
  }
  return newX;
}

function resolveVerticalTiles(
  level: LevelState,
  player: Player,
  newY: number
) {
  if (player.vy === 0) return newY;
  const xLeft = Math.floor(player.x / TILE_SIZE);
  const xRight = Math.floor((player.x + player.w - 1) / TILE_SIZE);

  if (player.vy > 0) {
    const yBottom = Math.floor((newY + player.h) / TILE_SIZE);
    for (let tx = xLeft; tx <= xRight; tx++) {
      if (isSolidTile(tileAt(level, tx, yBottom))) {
        player.vy = 0;
        player.onGround = true;
        return yBottom * TILE_SIZE - player.h - 0.01;
      }
    }
  } else {
    const yTop = Math.floor(newY / TILE_SIZE);
    for (let tx = xLeft; tx <= xRight; tx++) {
      if (isSolidTile(tileAt(level, tx, yTop))) {
        player.vy = 0;
        return (yTop + 1) * TILE_SIZE + 0.01;
      }
    }
  }

  return newY;
}

function resolveVerticalPlatforms(
  level: LevelState,
  player: Player,
  newY: number,
  prevY: number
) {
  let resolvedY = newY;
  let onGround = player.onGround;
  let platformId: string | null = player.onPlatformId;

  for (const platform of level.movingPlatforms) {
    const rect = {
      x: player.x,
      y: resolvedY,
      w: player.w,
      h: player.h,
    };
    if (!rectsOverlap(rect, platform)) continue;

    if (player.vy > 0 && prevY + player.h <= platform.y) {
      player.vy = 0;
      resolvedY = platform.y - player.h - 0.01;
      onGround = true;
      platformId = platform.id;
    } else if (player.vy < 0 && prevY >= platform.y + platform.height) {
      player.vy = 0;
      resolvedY = platform.y + platform.height + 0.01;
    }
  }

  return { y: resolvedY, onGround, platformId };
}

function handleTileInteractions(state: PlatformerState) {
  const player = state.player;
  const level = state.level;
  const xLeft = Math.floor(player.x / TILE_SIZE);
  const xRight = Math.floor((player.x + player.w - 1) / TILE_SIZE);
  const yTop = Math.floor(player.y / TILE_SIZE);
  const yBottom = Math.floor((player.y + player.h - 1) / TILE_SIZE);

  for (let ty = yTop; ty <= yBottom; ty++) {
    for (let tx = xLeft; tx <= xRight; tx++) {
      const tile = tileAt(level, tx, ty);
      if (tile === TileCode.Collectible) {
        level.tiles[ty][tx] = TileCode.Air;
        state.score += 10;
      } else if (tile === TileCode.Hazard) {
        applyDamage(state);
        return;
      } else if (tile === TileCode.Goal) {
        state.status = 'level-complete';
        state.statusTimer = 0;
        return;
      }
    }
  }

  const levelHeightPx = level.height * TILE_SIZE;
  if (player.y > levelHeightPx + TILE_SIZE / 2) {
    applyDamage(state);
  }
}

function applyDamage(state: PlatformerState) {
  state.lives -= 1;
  if (state.lives <= 0) {
    state.status = 'game-over';
    state.statusTimer = 0;
    return;
  }
  state.player = createPlayer(state.level.spawn);
}

function tileAt(level: LevelState, tx: number, ty: number) {
  if (tx < 0 || tx >= level.width || ty < 0) {
    return TileCode.Ground;
  }
  if (ty >= level.height) {
    return TileCode.Air;
  }
  return level.tiles[ty][tx];
}

function isSolidTile(tile: TileCode) {
  return tile === TileCode.Ground || tile === TileCode.Platform;
}

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; width: number; height: number }
) {
  return !(
    a.x + a.w <= b.x ||
    a.x >= b.x + b.width ||
    a.y + a.h <= b.y ||
    a.y >= b.y + b.height
  );
}
