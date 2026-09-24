import { useState } from 'react';
import type { Stage } from '../core/Stage';
import type { Input } from '../core/input';
import { HubScene } from '../hub/HubScene';
import { v2Games } from '../registry';
import type { V2GameId } from '../core/types';
import { useSceneOnStage } from './useSceneOnStage';
import { HudButton } from './common';
import { accentStyle } from './style';

interface Props {
  stage: Stage;
  input: Input;
  initial: number;
  onSelect(index: number): void;
  onPlay(id: V2GameId): void;
  onExit(): void;
}

export function HubScreen({ stage, input, initial, onSelect, onPlay, onExit }: Props) {
  const [selected, setSelected] = useState(initial);
  const [launching, setLaunching] = useState(false);

  const hub = useSceneOnStage(stage, () =>
    new HubScene(input, stage.canvas, v2Games, initial, {
      onSelect: (i) => {
        setSelected(i);
        onSelect(i);
      },
      onLaunch: () => setLaunching(true),
      onPlay: (i) => onPlay(v2Games[i].id),
      onBack: onExit,
    }),
  );

  const game = v2Games[selected];
  const play = () => hub.current?.play();

  return (
    <div className="v2-hud" style={accentStyle(game.color)}>
      <div className="v2-topbar">
        <HudButton onClick={onExit} title="Return to Gems V1 (Esc)">
          <span aria-hidden>◂</span> Back to V1
        </HudButton>
        <div className="v2-logo">
          GEMS <span className="v2-logo-badge">V2</span>
        </div>
        <div style={{ width: 120 }} className="v2-spacer" />
      </div>

      {!launching && (
        <>
          <div className="v2-hub-bottom">
            <HudButton variant="icon" aria-label="Previous game" onClick={() => hub.current?.select(selected - 1)}>
              ◀
            </HudButton>
            <div className="v2-glass v2-hub-card" key={game.id} aria-live="polite">
              <span className="v2-chip">{game.genre}</span>
              <h2>{game.name}</h2>
              <p>{game.tagline}</p>
              <ul className="v2-controls">
                {game.controls.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <div className="v2-card-row">
                <div className="v2-dots" role="tablist" aria-label="Games">
                  {v2Games.map((g, i) => (
                    <button
                      key={g.id}
                      type="button"
                      className="v2-dot"
                      role="tab"
                      aria-label={g.name}
                      aria-current={i === selected}
                      aria-selected={i === selected}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => hub.current?.select(i)}
                    />
                  ))}
                </div>
                <HudButton variant="primary" onClick={play}>
                  Play <span aria-hidden>▸</span>
                </HudButton>
              </div>
            </div>
            <HudButton variant="icon" aria-label="Next game" onClick={() => hub.current?.select(selected + 1)}>
              ▶
            </HudButton>
          </div>
          <div className="v2-hint">
            <span className="v2-kbd">←</span> <span className="v2-kbd">→</span> browse · <span className="v2-kbd">Enter</span> play ·
            click a gem · <span className="v2-kbd">Esc</span> back to V1
          </div>
        </>
      )}
    </div>
  );
}
