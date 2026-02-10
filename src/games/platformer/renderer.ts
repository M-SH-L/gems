import { clamp } from '@/utils/clamp';
import {
  TILE_SIZE,
  TileCode,
  type PlatformerPalette,
  type PlatformerState,
} from './entities';

interface Viewport {
  width: number;
  height: number;
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: PlatformerState,
  palette: PlatformerPalette,
  viewport?: Viewport
) {
  const width = viewport?.width ?? ctx.canvas.width;
  const height = viewport?.height ?? ctx.canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, width, height);

  const levelWidthPx = state.level.width * TILE_SIZE;
  const levelHeightPx = state.level.height * TILE_SIZE;
  const cameraX = clamp(
    state.player.x - width * 0.4,
    0,
    Math.max(0, levelWidthPx - width)
  );
  const cameraY = clamp(
    state.player.y - height * 0.5,
    0,
    Math.max(0, levelHeightPx - height)
  );

  ctx.save();
  ctx.translate(-cameraX, -cameraY);
  ctx.imageSmoothingEnabled = palette.style !== 'retro';

  drawTiles(ctx, state, palette, cameraX, cameraY, width, height);
  drawPlatforms(ctx, state, palette);
  drawPlayer(ctx, state, palette);

  ctx.restore();
}

function drawTiles(
  ctx: CanvasRenderingContext2D,
  state: PlatformerState,
  palette: PlatformerPalette,
  cameraX: number,
  cameraY: number,
  viewWidth: number,
  viewHeight: number
) {
  const startX = Math.floor(cameraX / TILE_SIZE);
  const endX = Math.ceil((cameraX + viewWidth) / TILE_SIZE);
  const startY = Math.floor(cameraY / TILE_SIZE);
  const endY = Math.ceil((cameraY + viewHeight) / TILE_SIZE);

  for (let y = startY; y < endY; y++) {
    if (y < 0 || y >= state.level.height) continue;
    for (let x = startX; x < endX; x++) {
      if (x < 0 || x >= state.level.width) continue;
      const tile = state.level.tiles[y][x];
      if (tile === TileCode.Air) continue;
      const px = x * TILE_SIZE;
      const py = y * TILE_SIZE;
      if (tile === TileCode.Ground || tile === TileCode.Platform) {
        drawGround(ctx, px, py, palette, tile === TileCode.Platform);
      } else if (tile === TileCode.Collectible) {
        drawCollectible(ctx, px, py, palette);
      } else if (tile === TileCode.Hazard) {
        drawHazard(ctx, px, py, palette);
      } else if (tile === TileCode.Goal) {
        drawGoal(ctx, px, py, palette);
      }
    }
  }
}

function drawGround(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  palette: PlatformerPalette,
  isPlatform: boolean
) {
  const fill = isPlatform ? palette.platform : palette.ground;
  ctx.fillStyle = fill;
  ctx.strokeStyle = palette.groundAlt;
  if (palette.style === 'futuristic') {
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = palette.glow;
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    ctx.restore();
    ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    return;
  }

  if (palette.style === 'organic') {
    drawRoundedRect(ctx, x, y, TILE_SIZE, TILE_SIZE, 8);
    ctx.fill();
    ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    return;
  }

  ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
  ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
}

function drawCollectible(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  palette: PlatformerPalette
) {
  const cx = x + TILE_SIZE / 2;
  const cy = y + TILE_SIZE / 2;
  ctx.fillStyle = palette.collectible;
  ctx.beginPath();
  ctx.arc(cx, cy, TILE_SIZE * 0.28, 0, Math.PI * 2);
  ctx.fill();

  if (palette.style === 'futuristic') {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = palette.collectible;
    ctx.beginPath();
    ctx.arc(cx, cy, TILE_SIZE * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawHazard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  palette: PlatformerPalette
) {
  ctx.fillStyle = palette.hazard;
  if (palette.style === 'futuristic') {
    ctx.fillRect(x + 4, y + TILE_SIZE / 2 - 4, TILE_SIZE - 8, 8);
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = palette.hazard;
    ctx.fillRect(x + 6, y + TILE_SIZE / 2 - 2, TILE_SIZE - 12, 4);
    ctx.restore();
    return;
  }

  ctx.beginPath();
  ctx.moveTo(x + TILE_SIZE / 2, y + 4);
  ctx.lineTo(x + TILE_SIZE - 4, y + TILE_SIZE - 4);
  ctx.lineTo(x + 4, y + TILE_SIZE - 4);
  ctx.closePath();
  ctx.fill();
}

function drawGoal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  palette: PlatformerPalette
) {
  ctx.fillStyle = palette.goal;
  if (palette.style === 'organic') {
    drawRoundedRect(ctx, x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8, 6);
    ctx.fill();
    return;
  }
  ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
}

function drawPlatforms(
  ctx: CanvasRenderingContext2D,
  state: PlatformerState,
  palette: PlatformerPalette
) {
  for (const platform of state.level.movingPlatforms) {
    ctx.fillStyle = palette.platform;
    if (palette.style === 'futuristic') {
      ctx.save();
      ctx.shadowBlur = 12;
      ctx.shadowColor = palette.glow;
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      ctx.restore();
      continue;
    }
    drawRoundedRect(
      ctx,
      platform.x,
      platform.y,
      platform.width,
      platform.height,
      palette.style === 'organic' ? 10 : 2
    );
    ctx.fill();
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  state: PlatformerState,
  palette: PlatformerPalette
) {
  const player = state.player;
  ctx.fillStyle = palette.player;

  if (palette.style === 'futuristic') {
    const centerX = player.x + player.w / 2;
    const centerY = player.y + player.h / 2;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.PI / 4);
    ctx.shadowBlur = 12;
    ctx.shadowColor = palette.glow;
    ctx.fillRect(-player.w / 3, -player.w / 3, player.w * 0.66, player.w * 0.66);
    ctx.restore();
    return;
  }

  if (palette.style === 'organic') {
    drawRoundedRect(ctx, player.x, player.y, player.w, player.h, 10);
    ctx.fill();
    return;
  }

  ctx.fillRect(player.x, player.y, player.w, player.h);
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if ('roundRect' in ctx) {
    ctx.beginPath();
    (ctx as CanvasRenderingContext2D & { roundRect: Function }).roundRect(
      x,
      y,
      width,
      height,
      radius
    );
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  );
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}
