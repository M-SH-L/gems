import { describe, it, expect } from 'vitest';
import { builderContentByTheme } from '@/games/builder/content';
import { calculateScore } from '@/games/builder/scoring';
import {
  STARTING_BUDGET,
  createEmptyGrid,
  mapItemsById,
  placeItemOnGrid,
  removeItemFromGrid,
} from '@/games/builder/state';

const applyPlace = (
  grid: ReturnType<typeof createEmptyGrid>,
  itemsById: Record<string, { cost: number }>,
  budget: number,
  row: number,
  col: number,
  itemId: string
) => {
  const result = placeItemOnGrid({
    grid,
    row,
    col,
    itemId,
    itemsById,
    budget,
  });
  return { grid: result.grid, budget: result.budget };
};

const mulberry32 = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

describe('builder scenarios', () => {
  it('max score layouts produce expected bonuses', () => {
    const layouts = {
      retro: {
        placements: [
          ['house', 0, 0],
          ['park', 0, 1],
          ['tavern', 1, 0],
          ['shop', 0, 3],
          ['road', 0, 4],
          ['well', 2, 0],
          ['wall', 2, 2],
          ['farm', 2, 4],
          ['tower', 2, 6],
          ['bridge', 2, 8],
        ],
        expectedBonus: 15,
      },
      futuristic: {
        placements: [
          ['quarters', 0, 0],
          ['medbay', 0, 1],
          ['lab', 1, 0],
          ['power-core', 1, 1],
          ['corridor', 2, 0],
          ['airlock', 2, 2],
          ['storage', 2, 4],
          ['comms', 2, 6],
          ['reactor', 2, 8],
          ['garden-dome', 2, 10],
        ],
        expectedBonus: 13,
      },
      organic: {
        placements: [
          ['tree', 0, 0],
          ['pond', 0, 1],
          ['beehive', 1, 0],
          ['flower-bed', 1, 1],
          ['path', 2, 0],
          ['bench', 2, 1],
          ['path', 2, 3],
          ['trellis', 2, 4],
          ['path', 2, 6],
          ['herb-garden', 2, 7],
          ['bird-bath', 3, 0],
          ['compost', 3, 2],
        ],
        expectedBonus: 17,
      },
    } as const;

    for (const [themeId, layout] of Object.entries(layouts)) {
      const content = builderContentByTheme[themeId];
      const itemsById = mapItemsById(content.items);
      let grid = createEmptyGrid();
      let budget = 999;

      for (const [itemId, row, col] of layout.placements) {
        const result = applyPlace(grid, itemsById, budget, row, col, itemId);
        grid = result.grid;
        budget = result.budget;
      }

      const score = calculateScore(grid, itemsById, content.adjacencyRules);
      expect(score.bonus).toBe(layout.expectedBonus);
      expect(score.total).toBe(score.base + layout.expectedBonus);
    }
  });

  it('budget exhaustion prevents further placement', () => {
    for (const content of Object.values(builderContentByTheme)) {
      const itemsById = mapItemsById(content.items);
      const cheapest = [...content.items].sort((a, b) => a.cost - b.cost)[0];
      let grid = createEmptyGrid();
      let budget = STARTING_BUDGET;

      let placed = 0;
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          const result = placeItemOnGrid({
            grid,
            row,
            col,
            itemId: cheapest.id,
            itemsById,
            budget,
          });
          if (!result.changed) {
            break;
          }
          grid = result.grid;
          budget = result.budget;
          placed += 1;
        }
        if (budget < cheapest.cost) break;
      }

      let targetRow = 0;
      let targetCol = 0;
      outer: for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          if (!grid[row][col]) {
            targetRow = row;
            targetCol = col;
            break outer;
          }
        }
      }

      const attempt = placeItemOnGrid({
        grid,
        row: targetRow,
        col: targetCol,
        itemId: cheapest.id,
        itemsById,
        budget,
      });

      expect(attempt.changed).toBe(false);
      expect(attempt.budget).toBe(budget);
      expect(placed).toBeGreaterThan(0);
    }
  });

  it('remove and replace restores budget and score', () => {
    const content = builderContentByTheme.retro;
    const itemsById = mapItemsById(content.items);
    const grid = createEmptyGrid();

    const placed = placeItemOnGrid({
      grid,
      row: 0,
      col: 0,
      itemId: 'house',
      itemsById,
      budget: STARTING_BUDGET,
    });

    const removed = removeItemFromGrid({
      grid: placed.grid,
      row: 0,
      col: 0,
      itemsById,
      budget: placed.budget,
    });

    const replaced = placeItemOnGrid({
      grid: removed.grid,
      row: 0,
      col: 0,
      itemId: 'house',
      itemsById,
      budget: removed.budget,
    });

    expect(replaced.budget).toBe(STARTING_BUDGET - itemsById.house.cost);
    const score = calculateScore(replaced.grid, itemsById, content.adjacencyRules);
    expect(score.total).toBeGreaterThan(0);
  });

  it('random placement does not crash and yields non-negative score', () => {
    const content = builderContentByTheme.organic;
    const itemsById = mapItemsById(content.items);
    let grid = createEmptyGrid();
    let budget = STARTING_BUDGET;
    const rng = mulberry32(1234);

    for (let i = 0; i < 20; i++) {
      const item = content.items[Math.floor(rng() * content.items.length)];
      const row = Math.floor(rng() * grid.length);
      const col = Math.floor(rng() * grid.length);

      const result = placeItemOnGrid({
        grid,
        row,
        col,
        itemId: item.id,
        itemsById,
        budget,
      });

      grid = result.grid;
      budget = result.budget;
      if (budget < 0) break;
    }

    const score = calculateScore(grid, itemsById, content.adjacencyRules);
    expect(score.total).toBeGreaterThanOrEqual(0);
  });
});
