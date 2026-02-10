import { useEffect, useMemo, useReducer, useState } from 'react';
import { useTheme } from '@/theme/useTheme';
import { builderContentByTheme } from './content';
import { Grid } from './Grid';
import { Palette } from './Palette';
import { ScorePanel } from './ScorePanel';
import {
  GRID_SIZE,
  STARTING_BUDGET,
  builderReducer,
  createInitialState,
  mapItemsById,
} from './state';
import { calculateScore } from './scoring';

const BEST_SCORE_PREFIX = 'builder-best';

export default function BuilderGame() {
  const { theme } = useTheme();
  const content = builderContentByTheme[theme.id] ?? builderContentByTheme.retro;
  const itemsById = useMemo(() => mapItemsById(content.items), [content.items]);

  const [state, dispatch] = useReducer(
    builderReducer,
    content.items[0]?.id ?? null,
    (defaultItemId) => createInitialState(defaultItemId)
  );

  const score = useMemo(
    () => calculateScore(state.grid, itemsById, content.adjacencyRules),
    [state.grid, itemsById, content.adjacencyRules]
  );

  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    dispatch({
      type: 'reset',
      size: GRID_SIZE,
      budget: STARTING_BUDGET,
      defaultItemId: content.items[0]?.id ?? null,
    });
  }, [theme.id, content.items]);

  useEffect(() => {
    const key = `${BEST_SCORE_PREFIX}-${theme.id}`;
    try {
      const stored = Number(localStorage.getItem(key) ?? 0);
      setBestScore(Number.isFinite(stored) ? stored : 0);
    } catch {
      setBestScore(0);
    }
  }, [theme.id]);

  useEffect(() => {
    const key = `${BEST_SCORE_PREFIX}-${theme.id}`;
    if (score.total > bestScore) {
      setBestScore(score.total);
      try {
        localStorage.setItem(key, String(score.total));
      } catch {
        // Ignore storage errors in restricted environments
      }
    }
  }, [score.total, bestScore, theme.id]);

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-theme)',
      }}
    >
      <Palette
        items={content.items}
        selectedItemId={state.selectedItemId}
        mode={state.mode}
        onSelectItem={(id) => dispatch({ type: 'select_item', itemId: id })}
        onSelectEraser={() => dispatch({ type: 'select_eraser' })}
      />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          padding: 16,
          minWidth: 0,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 16, color: 'var(--color-primary)' }}>
            {content.title}
          </h2>
          <p style={{ margin: '6px 0 0', fontSize: 12, opacity: 0.75 }}>
            {content.description} Right-click to remove items.
          </p>
        </div>

        <ScorePanel
          scoreLabel={content.scoreLabel}
          budget={state.budget}
          score={score}
          bestScore={bestScore}
          itemsById={itemsById}
        />

        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingBottom: 16,
          }}
        >
          <Grid
            grid={state.grid}
            itemsById={itemsById}
            selectedItemId={state.selectedItemId}
            mode={state.mode}
            background={content.gridBackground}
            onPlace={(row, col, itemId) =>
              dispatch({
                type: 'place',
                row,
                col,
                itemId,
                itemsById,
              })
            }
            onRemove={(row, col) =>
              dispatch({
                type: 'remove',
                row,
                col,
                itemsById,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
