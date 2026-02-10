import { useEffect, useMemo, useReducer, useRef, useState, type CSSProperties } from 'react';
import { useTheme } from '@/theme/useTheme';
import { fictionContentByTheme } from './content';
import {
  createInitialState,
  isChoiceAvailable,
  makeChoice,
  type FictionState,
} from './FictionEngine';
import type { FictionContent } from './types';
import { Inventory } from './Inventory';

interface Action {
  type: 'choose' | 'reset';
  index?: number;
  content: FictionContent;
}

function reducer(state: FictionState, action: Action): FictionState {
  switch (action.type) {
    case 'choose':
      return typeof action.index === 'number'
        ? makeChoice(action.content, state, action.index)
        : state;
    case 'reset':
      return createInitialState(action.content);
    default:
      return state;
  }
}

const scenePanels: Record<string, CSSProperties> = {
  retro: {
    background: 'rgba(8, 8, 8, 0.9)',
    boxShadow: '0 0 12px rgba(57, 255, 20, 0.3)',
  },
  futuristic: {
    background:
      'linear-gradient(135deg, rgba(0, 229, 255, 0.12), rgba(224, 64, 251, 0.1))',
    boxShadow: '0 0 18px rgba(0, 229, 255, 0.25)',
  },
  organic: {
    background: 'rgba(245, 236, 220, 0.92)',
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.08)',
  },
};

const noticeStyles: Record<string, CSSProperties> = {
  retro: { border: '1px solid var(--color-primary)' },
  futuristic: { border: '1px solid rgba(0, 229, 255, 0.6)' },
  organic: { border: '1px dashed var(--color-primary)' },
};

export default function FictionGame() {
  const { theme } = useTheme();
  const content = useMemo(() => fictionContentByTheme[theme.id], [theme.id]);
  const [state, dispatch] = useReducer(reducer, content, createInitialState);
  const [notice, setNotice] = useState<string | null>(null);
  const previousTheme = useRef(theme.id);

  useEffect(() => {
    if (previousTheme.current !== theme.id) {
      dispatch({ type: 'reset', content });
      setNotice('Theme changed — restarting');
      previousTheme.current = theme.id;
      const timer = window.setTimeout(() => setNotice(null), 2000);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [theme.id, content]);

  const scene =
    content.scenes.find((entry) => entry.id === state.currentScene) ??
    content.scenes.find((entry) => entry.id === content.startScene) ??
    content.scenes[0];

  useEffect(() => {
    const exists = content.scenes.some((entry) => entry.id === state.currentScene);
    if (!exists) {
      dispatch({ type: 'reset', content });
    }
  }, [content, state.currentScene]);
  const inventoryItems = Array.from(state.inventory);

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        padding: 24,
        height: '100%',
        boxSizing: 'border-box',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-theme)',
      }}
    >
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 14, color: 'var(--color-primary)' }}>
            {content.title}
          </h2>
          <span style={{ fontSize: 11, opacity: 0.7 }}>{content.intro}</span>
        </div>

        {notice && (
          <div
            style={{
              padding: '6px 10px',
              fontSize: 11,
              borderRadius: 'var(--radius-theme)',
              background: 'rgba(0, 0, 0, 0.2)',
              ...noticeStyles[theme.id],
            }}
          >
            {notice}
          </div>
        )}

        <div
          style={{
            ...scenePanels[theme.id],
            border: 'var(--border-theme)',
            borderRadius: 'var(--radius-theme)',
            padding: 16,
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          {scene.text.split('\n').map((line, index) => (
            <p key={`${scene.id}-line-${index}`} style={{ margin: 0 }}>
              {line}
            </p>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {scene.choices.map((choice, index) => {
            const available = isChoiceAvailable(choice, state);
            return (
              <button
                key={`${scene.id}-choice-${choice.label}`}
                type="button"
                disabled={!available || state.status !== 'playing'}
                onClick={() =>
                  dispatch({ type: 'choose', index, content })
                }
                style={{
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-theme)',
                  border: 'var(--border-theme)',
                  background: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-theme)',
                  fontSize: 11,
                  cursor: available ? 'pointer' : 'not-allowed',
                  opacity: available ? 1 : 0.5,
                  boxShadow:
                    theme.id === 'futuristic'
                      ? '0 0 12px rgba(0, 229, 255, 0.2)'
                      : undefined,
                }}
              >
                {choice.label}
                {!available && choice.requiredItem && (
                  <span style={{ marginLeft: 8, fontSize: 10, opacity: 0.7 }}>
                    Requires {choice.requiredItem}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {state.lastEvent && (
          <div style={{ fontSize: 11, opacity: 0.7 }}>{state.lastEvent}</div>
        )}

        {scene.ending && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-theme)',
              border: 'var(--border-theme)',
              background: 'rgba(0, 0, 0, 0.2)',
              fontSize: 12,
            }}
          >
            {scene.ending === 'win'
              ? 'Victory! The story ends in triumph.'
              : 'Defeat. The story fades to static.'}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => dispatch({ type: 'reset', content })}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-theme)',
              border: 'var(--border-theme)',
              background: 'var(--color-secondary)',
              color:
                theme.id === 'organic'
                  ? 'var(--color-bg)'
                  : 'var(--color-text)',
              fontFamily: 'var(--font-theme)',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Restart Story
          </button>
        </div>
      </div>

      <Inventory items={inventoryItems} />
    </div>
  );
}
