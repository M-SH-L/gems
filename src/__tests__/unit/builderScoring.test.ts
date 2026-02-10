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

const retro = builderContentByTheme.retro;

describe('builder scoring', () => {
  it('empty grid = 0 score', () => {
    const grid = createEmptyGrid();
    const itemsById = mapItemsById(retro.items);
    const score = calculateScore(grid, itemsById, retro.adjacencyRules);

    expect(score.total).toBe(0);
    expect(score.base).toBe(0);
    expect(score.bonus).toBe(0);
  });

  it('single item = base score only', () => {
    const grid = createEmptyGrid();
    grid[0][0] = 'house';

    const itemsById = mapItemsById(retro.items);
    const score = calculateScore(grid, itemsById, retro.adjacencyRules);
    const base = itemsById.house.baseScore ?? itemsById.house.cost;

    expect(score.base).toBe(base);
    expect(score.bonus).toBe(0);
    expect(score.total).toBe(base);
  });

  it('adjacent matching bonus items award bonus', () => {
    const grid = createEmptyGrid();
    grid[0][0] = 'house';
    grid[0][1] = 'park';

    const itemsById = mapItemsById(retro.items);
    const score = calculateScore(grid, itemsById, retro.adjacencyRules);
    const base =
      (itemsById.house.baseScore ?? itemsById.house.cost) +
      (itemsById.park.baseScore ?? itemsById.park.cost);

    expect(score.base).toBe(base);
    expect(score.bonus).toBe(6);
    expect(score.total).toBe(base + 6);
  });

  it('non-adjacent items give no bonus', () => {
    const grid = createEmptyGrid();
    grid[0][0] = 'house';
    grid[0][3] = 'park';

    const itemsById = mapItemsById(retro.items);
    const score = calculateScore(grid, itemsById, retro.adjacencyRules);

    expect(score.bonus).toBe(0);
  });

  it('placing item deducts from budget', () => {
    const grid = createEmptyGrid();
    const itemsById = mapItemsById(retro.items);

    const result = placeItemOnGrid({
      grid,
      row: 0,
      col: 0,
      itemId: 'house',
      itemsById,
      budget: STARTING_BUDGET,
    });

    expect(result.changed).toBe(true);
    expect(result.budget).toBe(STARTING_BUDGET - itemsById.house.cost);
    expect(result.grid[0][0]).toBe('house');
  });

  it('removing item refunds its cost', () => {
    const grid = createEmptyGrid();
    const itemsById = mapItemsById(retro.items);
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

    expect(removed.changed).toBe(true);
    expect(removed.budget).toBe(STARTING_BUDGET);
    expect(removed.grid[0][0]).toBe(null);
  });

  it('prevents placement when budget is insufficient', () => {
    const grid = createEmptyGrid();
    const itemsById = mapItemsById(retro.items);

    const result = placeItemOnGrid({
      grid,
      row: 0,
      col: 0,
      itemId: 'tower',
      itemsById,
      budget: 1,
    });

    expect(result.changed).toBe(false);
    expect(result.budget).toBe(1);
    expect(result.grid[0][0]).toBe(null);
  });

  it('all adjacency rules reference valid items', () => {
    const themes = Object.values(builderContentByTheme);

    for (const theme of themes) {
      const itemsById = mapItemsById(theme.items);
      for (const rule of theme.adjacencyRules) {
        expect(itemsById[rule.item]).toBeDefined();
        expect(itemsById[rule.neighbor]).toBeDefined();
        expect(rule.bonus).toBeGreaterThan(0);
      }
    }
  });
});
