import type { BuilderItem } from './types';

export const GRID_SIZE = 12;
export const STARTING_BUDGET = 100;

export type BuilderGrid = (string | null)[][];

export interface BuilderState {
  grid: BuilderGrid;
  budget: number;
  selectedItemId: string | null;
  mode: 'place' | 'erase';
}

export type BuilderAction =
  | { type: 'select_item'; itemId: string }
  | { type: 'select_eraser' }
  | {
      type: 'place';
      row: number;
      col: number;
      itemId: string;
      itemsById: Record<string, BuilderItem>;
    }
  | {
      type: 'remove';
      row: number;
      col: number;
      itemsById: Record<string, BuilderItem>;
    }
  | {
      type: 'reset';
      size?: number;
      budget?: number;
      defaultItemId?: string | null;
    };

export function createEmptyGrid(size: number = GRID_SIZE): BuilderGrid {
  return Array.from({ length: size }, () => Array<string | null>(size).fill(null));
}

export function mapItemsById(items: BuilderItem[]): Record<string, BuilderItem> {
  return items.reduce<Record<string, BuilderItem>>((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});
}

export function createInitialState(
  defaultItemId: string | null,
  size: number = GRID_SIZE,
  budget: number = STARTING_BUDGET
): BuilderState {
  return {
    grid: createEmptyGrid(size),
    budget,
    selectedItemId: defaultItemId,
    mode: defaultItemId ? 'place' : 'erase',
  };
}

export function placeItemOnGrid(params: {
  grid: BuilderGrid;
  row: number;
  col: number;
  itemId: string;
  itemsById: Record<string, BuilderItem>;
  budget: number;
}): { grid: BuilderGrid; budget: number; changed: boolean } {
  const { grid, row, col, itemId, itemsById, budget } = params;
  if (!grid[row] || grid[row][col] === undefined) {
    return { grid, budget, changed: false };
  }

  const item = itemsById[itemId];
  if (!item) {
    return { grid, budget, changed: false };
  }

  const currentId = grid[row][col];
  if (currentId === itemId) {
    return { grid, budget, changed: false };
  }

  const currentItem = currentId ? itemsById[currentId] : null;
  const refund = currentItem?.cost ?? 0;
  const nextBudget = budget + refund - item.cost;

  if (nextBudget < 0) {
    return { grid, budget, changed: false };
  }

  const nextGrid = grid.map((rowCells) => rowCells.slice());
  nextGrid[row][col] = itemId;

  return { grid: nextGrid, budget: nextBudget, changed: true };
}

export function removeItemFromGrid(params: {
  grid: BuilderGrid;
  row: number;
  col: number;
  itemsById: Record<string, BuilderItem>;
  budget: number;
}): { grid: BuilderGrid; budget: number; changed: boolean } {
  const { grid, row, col, itemsById, budget } = params;
  if (!grid[row] || grid[row][col] === undefined) {
    return { grid, budget, changed: false };
  }

  const currentId = grid[row][col];
  if (!currentId) {
    return { grid, budget, changed: false };
  }

  const refund = itemsById[currentId]?.cost ?? 0;
  const nextGrid = grid.map((rowCells) => rowCells.slice());
  nextGrid[row][col] = null;

  return { grid: nextGrid, budget: budget + refund, changed: true };
}

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'select_item':
      return {
        ...state,
        selectedItemId: action.itemId,
        mode: 'place',
      };
    case 'select_eraser':
      return {
        ...state,
        selectedItemId: null,
        mode: 'erase',
      };
    case 'place': {
      const result = placeItemOnGrid({
        grid: state.grid,
        row: action.row,
        col: action.col,
        itemId: action.itemId,
        itemsById: action.itemsById,
        budget: state.budget,
      });
      if (!result.changed) return state;
      return {
        ...state,
        grid: result.grid,
        budget: result.budget,
      };
    }
    case 'remove': {
      const result = removeItemFromGrid({
        grid: state.grid,
        row: action.row,
        col: action.col,
        itemsById: action.itemsById,
        budget: state.budget,
      });
      if (!result.changed) return state;
      return {
        ...state,
        grid: result.grid,
        budget: result.budget,
      };
    }
    case 'reset':
      return createInitialState(
        action.defaultItemId ?? null,
        action.size ?? GRID_SIZE,
        action.budget ?? STARTING_BUDGET
      );
    default:
      return state;
  }
}
