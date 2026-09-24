import { useState } from 'react';
import type { Stage } from '../core/Stage';
import type { Input } from '../core/input';
import { MazeScene, type MazeHud } from '../games/maze/MazeScene';
import { getV2Game } from '../registry';
import { useSceneOnStage } from './useSceneOnStage';
import { GameFrame } from './GameFrame';
import { HudButton, Stat } from './common';

const game = getV2Game('maze')!;

export function MazeScreen({ stage, input, onExit }: { stage: Stage; input: Input; onExit(): void }) {
  const [hud, setHud] = useState<MazeHud | null>(null);
  const scene = useSceneOnStage(stage, () => new MazeScene(input, stage.canvas, setHud));

  if (!hud) return null;
  const done = hud.status === 'won' || hud.status === 'complete';
  const newBest = done && hud.best > 0 && hud.time <= hud.best;

  return (
    <GameFrame
      game={game}
      input={input}
      onExit={onExit}
      stats={
        <>
          <Stat label={`Level ${hud.level}/${hud.levelCount}`} value={hud.levelName} />
          <Stat label="Time" value={hud.time.toFixed(1)} />
          {hud.gemsTotal > 0 && <Stat label="Gems" value={`${hud.gems}/${hud.gemsTotal}`} />}
        </>
      }
    >
      {done ? (
        <div className="v2-center">
          <div className="v2-glass v2-panel">
            <h3>{hud.status === 'complete' ? 'All boards cleared!' : 'Level clear!'}</h3>
            <p>
              {hud.time.toFixed(1)}s · {hud.falls} {hud.falls === 1 ? 'fall' : 'falls'} · {hud.gems}/{hud.gemsTotal} gems
              <br />
              {newBest ? 'New best time!' : hud.best > 0 ? `Best ${hud.best.toFixed(1)}s` : ''}
            </p>
            <div className="v2-panel-actions">
              <HudButton variant="primary" onClick={() => scene.current?.next()}>
                {hud.status === 'complete' ? 'Play again' : 'Next level'}
              </HudButton>
              <HudButton onClick={() => scene.current?.retry()}>Retry</HudButton>
            </div>
          </div>
        </div>
      ) : (
        <div className="v2-glass v2-bottom-hint" key={hud.level}>
          Arrows / <span className="v2-kbd">WASD</span> tilt · drag to tilt on touch · reach the glowing pad · <span className="v2-kbd">R</span> restart
        </div>
      )}
    </GameFrame>
  );
}
