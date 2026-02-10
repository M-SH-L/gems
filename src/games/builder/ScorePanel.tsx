import type { BuilderItem } from './types';
import type { ScoreBreakdown } from './scoring';

interface ScorePanelProps {
  scoreLabel: string;
  budget: number;
  score: ScoreBreakdown;
  bestScore: number;
  itemsById: Record<string, BuilderItem>;
}

export function ScorePanel({
  scoreLabel,
  budget,
  score,
  bestScore,
  itemsById,
}: ScorePanelProps) {
  const bonusEntries = score.ruleBreakdown.filter((entry) => entry.count > 0);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
        padding: 12,
        border: 'var(--border-theme)',
        borderRadius: 'var(--radius-theme)',
        background: 'var(--color-surface)',
        fontFamily: 'var(--font-theme)',
        fontSize: 11,
      }}
    >
      <div>
        <div style={{ opacity: 0.7 }}>Budget</div>
        <div style={{ fontSize: 16, color: 'var(--color-primary)' }}>{budget}</div>
      </div>
      <div>
        <div style={{ opacity: 0.7 }}>{scoreLabel}</div>
        <div style={{ fontSize: 16, color: 'var(--color-primary)' }}>{score.total}</div>
        <div style={{ fontSize: 10, opacity: 0.6 }}>
          Base {score.base} + Bonus {score.bonus}
        </div>
      </div>
      <div>
        <div style={{ opacity: 0.7 }}>Best Score</div>
        <div style={{ fontSize: 16, color: 'var(--color-secondary)' }}>{bestScore}</div>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <div style={{ opacity: 0.7, marginBottom: 4 }}>Adjacency Bonuses</div>
        {bonusEntries.length === 0 ? (
          <div style={{ opacity: 0.6 }}>No bonuses yet. Try placing items next to each other.</div>
        ) : (
          <div style={{ display: 'grid', gap: 4 }}>
            {bonusEntries.map((entry, index) => {
              const itemName = itemsById[entry.rule.item]?.name ?? entry.rule.item;
              const neighborName = itemsById[entry.rule.neighbor]?.name ?? entry.rule.neighbor;
              return (
                <div key={`${entry.rule.item}-${entry.rule.neighbor}-${index}`}>
                  {itemName} near {neighborName}: +{entry.rule.bonus} × {entry.count} = {entry.total}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
