import { useState } from 'react';
import type { Stage } from '../core/Stage';
import type { Input } from '../core/input';
import { RunnerScene, type RunnerHud } from '../games/runner/RunnerScene';
import { getV2Game } from '../registry';
import { useSceneOnStage } from './useSceneOnStage';
import { GameFrame } from './GameFrame';
import { HudButton, Stat } from './common';

const game = getV2Game('runner')!;

export function RunnerScreen({ stage, input, onExit }: { stage: Stage; input: Input; onExit(): void }) {
  const [hud, setHud] = useState<RunnerHud>({ score: 0, gems: 0, speed: 0, best: 0, alive: true });
  const scene = useSceneOnStage(stage, () => new RunnerScene(input, stage.canvas, setHud));

  return (
    <GameFrame
      game={game}
      input={input}
      onExit={onExit}
      stats={
        <>
          <Stat label="Gems" value={hud.gems} />
          <Stat label="Score" value={hud.score}>
            <div className="v2-meter" aria-label="Speed">
              <div style={{ width: `${hud.speed}%` }} />
            </div>
          </Stat>
        </>
      }
    >
      {hud.alive ? (
        <div className="v2-glass v2-bottom-hint">
          <span className="v2-kbd">←</span> <span className="v2-kbd">→</span> switch lanes · <span className="v2-kbd">Space</span> jump
          · touch: tap sides / centre
        </div>
      ) : (
        <div className="v2-center">
          <div className="v2-glass v2-panel">
            <h3>Wiped out!</h3>
            <p>
              {hud.score} points · {hud.gems} gems
              <br />
              {hud.score >= hud.best && hud.score > 0 ? 'New best!' : `Best ${hud.best}`}
            </p>
            <div className="v2-panel-actions">
              <HudButton variant="primary" onClick={() => scene.current?.restart()}>
                Run again
              </HudButton>
              <HudButton onClick={onExit}>Hub</HudButton>
            </div>
          </div>
        </div>
      )}
    </GameFrame>
  );
}
