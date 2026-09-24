import { useEffect, type ReactNode } from 'react';
import type { Input } from '../core/input';
import type { V2GameMeta } from '../core/types';
import { HudButton } from './common';
import { accentStyle } from './style';

/** Shared top bar + Esc-to-hub handling around each game's HUD. */
export function GameFrame({
  game,
  input,
  onExit,
  stats,
  children,
}: {
  game: V2GameMeta;
  input: Input;
  onExit(): void;
  stats?: ReactNode;
  children?: ReactNode;
}) {
  useEffect(() => {
    const off = input.onPress((a) => {
      if (a === 'back') onExit();
    });
    return () => {
      off();
    };
  }, [input, onExit]);

  return (
    <div className="v2-hud" style={accentStyle(game.color)}>
      <div className="v2-topbar" style={{ alignItems: 'flex-start' }}>
        <HudButton onClick={onExit} title="Back to the hub (Esc)">
          <span aria-hidden>◂</span> Hub
        </HudButton>
        <div className="v2-spacer" />
        <div className="v2-stats">{stats}</div>
      </div>
      {children}
    </div>
  );
}
