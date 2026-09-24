import { useEffect, useMemo, useReducer, useState } from 'react';
import { useTheme } from '@/theme/useTheme';
import { useSound } from '@/sound/useSound';
import { THEME_RESET_MESSAGE, useThemeReset } from '@/hooks/useThemeReset';
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

function readBestScore(themeId: string): number {
  try {
    const stored = Number(localStorage.getItem(`${BEST_SCORE_PREFIX}-${themeId}`) ?? 0);
    return Number.isFinite(stored) ? stored : 0;
  } catch {
    return 0;
  }
}

function writeBestScore(themeId: string, value: number) {
  try {
    localStorage.setItem(`${BEST_SCORE_PREFIX}-${themeId}`, String(value));
  } catch {
    // Ignore storage errors in restricted environments
  }
}

export default function BuilderGame() {
  const { theme } = useTheme();
  const { play } = useSound();
  const content = builderContentByTheme[theme.id] ?? builderContentByTheme.retro;
  const itemsById = useMemo(() => mapItemsById(content.items), [content.items]);

  const [state, dispatch] = useReducer(
    builderReducer,
    content.items[0]?.id ?? null,
    (defaultItemId) => createInitialState(defaultItemId)
  );

  const showNotice = useThemeReset(() =>
    dispatch({
      type: 'reset',
      size: GRID_SIZE,
      budget: STARTING_BUDGET,
      defaultItemId: content.items[0]?.id ?? null,
    })
  );

  const score = useMemo(
    () => calculateScore(state.grid, itemsById, content.adjacencyRules),
    [state.grid, itemsById, content.adjacencyRules]
  );

  const [best, setBest] = useState(() => ({
    themeId: theme.id,
    value: readBestScore(theme.id),
  }));
  if (best.themeId !== theme.id) {
    setBest({ themeId: theme.id, value: readBestScore(theme.id) });
  } else if (score.total > best.value) {
    setBest({ themeId: theme.id, value: score.total });
  }

  useEffect(() => {
    writeBestScore(best.themeId, best.value);
  }, [best]);

  const handlePlace = (row: number, col: number, itemId: string) => {
    const current = state.grid[row]?.[col];
    const item = itemsById[itemId];
    const refund = current ? (itemsById[current]?.cost ?? 0) : 0;
    if (item && current !== itemId && state.budget + refund - item.cost >= 0) {
      play('place');
    }
    dispatch({ type: 'place', row, col, itemId, itemsById });
  };

  const handleRemove = (row: number, col: number) => {
    if (state.grid[row]?.[col]) play('click');
    dispatch({ type: 'remove', row, col, itemsById });
  };

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

        {showNotice && (
          <div role="status" style={{ fontSize: 11, color: 'var(--color-primary)' }}>
            {THEME_RESET_MESSAGE}
          </div>
        )}

        <ScorePanel
          scoreLabel={content.scoreLabel}
          budget={state.budget}
          score={score}
          bestScore={best.value}
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
            onPlace={handlePlace}
            onRemove={handleRemove}
          />
        </div>
      </div>
    </div>
  );
}
