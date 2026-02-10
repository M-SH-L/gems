import type { AdjacencyRule, BuilderItem } from './types';
import type { BuilderGrid } from './state';

export interface RuleBreakdown {
  rule: AdjacencyRule;
  count: number;
  total: number;
}

export interface ScoreBreakdown {
  total: number;
  base: number;
  bonus: number;
  ruleBreakdown: RuleBreakdown[];
}

const directions: Array<[number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function calculateScore(
  grid: BuilderGrid,
  itemsById: Record<string, BuilderItem>,
  rules: AdjacencyRule[]
): ScoreBreakdown {
  let base = 0;

  const ruleBreakdown: RuleBreakdown[] = rules.map((rule) => ({
    rule,
    count: 0,
    total: 0,
  }));

  const rulesByItem = new Map<string, number[]>();
  rules.forEach((rule, index) => {
    const list = rulesByItem.get(rule.item) ?? [];
    list.push(index);
    rulesByItem.set(rule.item, list);
  });

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const itemId = grid[row][col];
      if (!itemId) continue;

      const item = itemsById[itemId];
      base += item?.baseScore ?? item?.cost ?? 0;

      const ruleIndexes = rulesByItem.get(itemId);
      if (!ruleIndexes) continue;

      for (const [dr, dc] of directions) {
        const nextRow = row + dr;
        const nextCol = col + dc;
        if (!grid[nextRow] || grid[nextRow][nextCol] === undefined) continue;
        const neighborId = grid[nextRow][nextCol];
        if (!neighborId) continue;

        for (const ruleIndex of ruleIndexes) {
          const rule = ruleBreakdown[ruleIndex].rule;
          if (neighborId === rule.neighbor) {
            ruleBreakdown[ruleIndex].count += 1;
          }
        }
      }
    }
  }

  let bonus = 0;
  for (const entry of ruleBreakdown) {
    entry.total = entry.count * entry.rule.bonus;
    bonus += entry.total;
  }

  return {
    total: base + bonus,
    base,
    bonus,
    ruleBreakdown,
  };
}
