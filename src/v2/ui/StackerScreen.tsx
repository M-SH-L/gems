import { useState } from 'react';
import type { Stage } from '../core/Stage';
import type { Input } from '../core/input';
import { StackerScene, type StackerHud } from '../games/stacker/StackerScene';
import { getV2Game } from '../registry';
import { useSceneOnStage } from './useSceneOnStage';
import { GameFrame } from './GameFrame';
import { HudButton, Stat } from './common';

const game = getV2Game('stacker')!;

export function StackerScreen({ stage, input, onExit }: { stage: Stage; input: Input; onExit(): void }) {
  const [hud, setHud] = useState<StackerHud>({ score: 0, best: 0, combo: 0, over: false, perfectTick: 0 });
  const scene = useSceneOnStage(stage, () => new StackerScene(input, stage.canvas, setHud));

  return (
    <GameFrame game={game} input={input} onExit={onExit} stats={<Stat label="Best" value={hud.best} />}>
      <div className="v2-big-score" style={{ marginTop: 8 }}>
        {hud.score}
      </div>
      {hud.perfectTick > 0 && !hud.over && (
        <div className="v2-toast" key={hud.perfectTick}>
          PERFECT{hud.combo > 1 ? ` ×${hud.combo}` : ''}
        </div>
      )}
      {hud.over ? (
        <div className="v2-center">
          <div className="v2-glass v2-panel">
            <h3>Tower toppled</h3>
            <p>
              {hud.score} {hud.score === 1 ? 'floor' : 'floors'} high ·{' '}
              {hud.score >= hud.best && hud.score > 0 ? 'new best!' : `best ${hud.best}`}
            </p>
            <div className="v2-panel-actions">
              <HudButton variant="primary" onClick={() => scene.current?.restart()}>
                Build again
              </HudButton>
              <HudButton onClick={onExit}>Hub</HudButton>
            </div>
          </div>
        </div>
      ) : (
        hud.score === 0 && (
          <div className="v2-glass v2-bottom-hint">
            <span className="v2-kbd">Space</span> or tap to drop the slab · line it up perfectly to grow it back
          </div>
        )
      )}
    </GameFrame>
  );
}
