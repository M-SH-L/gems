import { describe, it, expect } from 'vitest';
import { createInitialState, updateState, type PlatformerState } from '@/games/platformer/engine';
import { platformerContent } from '@/games/platformer/content';
import { TILE_SIZE, TileCode } from '@/games/platformer/entities';

const noopInput = { left: false, right: false, jump: false };

function placePlayerAtTile(state: PlatformerState, x: number, y: number) {
  state.player.x = x * TILE_SIZE + 2;
  state.player.y = y * TILE_SIZE + 2;
}

describe('platformer scenarios', () => {
  for (const theme of Object.keys(platformerContent) as Array<keyof typeof platformerContent>) {
    const content = platformerContent[theme];
    describe(theme, () => {
      content.levels.forEach((level, idx) => {
        it(`level ${idx + 1} hazards, collectibles, goal, gravity`, () => {
          let collectibles = 0;
          let hazards = 0;
          let goalFound = false;

          for (let y = 0; y < level.tiles.length; y++) {
            for (let x = 0; x < level.tiles[y].length; x++) {
              const tile = level.tiles[y][x];
              if (tile === TileCode.Collectible) collectibles++;
              if (tile === TileCode.Hazard) hazards++;
              if (tile === TileCode.Goal) goalFound = true;

              if (tile === TileCode.Collectible) {
                const state = createInitialState(content, idx);
                placePlayerAtTile(state, x, y);
                const prevScore = state.score;
                updateState(state, noopInput, 0.016);
                expect(state.score).toBe(prevScore + 10);
              }

              if (tile === TileCode.Hazard) {
                const state = createInitialState(content, idx);
                placePlayerAtTile(state, x, y);
                const prevLives = state.lives;
                updateState(state, noopInput, 0.016);
                expect(state.lives).toBe(prevLives - 1);
              }

              if (tile === TileCode.Goal) {
                const state = createInitialState(content, idx);
                placePlayerAtTile(state, x, y);
                updateState(state, noopInput, 0.016);
                expect(state.status).toBe('level-complete');
              }
            }
          }

          expect(goalFound).toBe(true);
          expect(collectibles).toBeGreaterThan(0);
          expect(hazards).toBeGreaterThan(0);

          const fallState = createInitialState(content, idx);
          fallState.player.y = 0;
          fallState.player.vy = 0;
          updateState(fallState, noopInput, 0.1);
          expect(fallState.player.y).toBeGreaterThan(0);
        });
      });
    });
  }
});
