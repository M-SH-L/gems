import { useCallback, useState } from 'react';
import './v2.css';
import { Stage } from './core/Stage';
import { Input } from './core/input';
import type { V2GameId } from './core/types';
import { v2Games } from './registry';
import { HubScreen } from './ui/HubScreen';
import { RunnerScreen } from './ui/RunnerScreen';
import { StackerScreen } from './ui/StackerScreen';
import { MazeScreen } from './ui/MazeScreen';
import { HudButton } from './ui/common';

type Screen = 'hub' | V2GameId;

interface Engine {
  stage: Stage;
  input: Input;
}

export default function V2App({ onExit }: { onExit(): void }) {
  const [engine, setEngine] = useState<Engine | null>(null);
  const [failed, setFailed] = useState(false);
  const [screen, setScreen] = useState<Screen>('hub');
  const [selected, setSelected] = useState(0);

  // A ref callback (rather than an effect) owns the WebGL stage so it is
  // created exactly when the host element exists and torn down with it.
  const host = useCallback((el: HTMLDivElement | null) => {
    if (!el) return;
    document.documentElement.dataset.world = 'v2';
    let stage: Stage;
    try {
      stage = new Stage(el);
    } catch {
      setFailed(true);
      return () => {
        delete document.documentElement.dataset.world;
      };
    }
    const input = new Input();
    setEngine({ stage, input });
    return () => {
      input.dispose();
      stage.dispose();
      setEngine(null);
      delete document.documentElement.dataset.world;
    };
  }, []);

  const toHub = useCallback(() => setScreen('hub'), []);
  const play = useCallback((id: V2GameId) => {
    setSelected(v2Games.findIndex((g) => g.id === id));
    setScreen(id);
  }, []);

  return (
    <div className="v2-root" data-testid="v2-root">
      <div className="v2-canvas-host" ref={host} />
      {failed && (
        <div className="v2-error">
          <div className="v2-glass v2-panel">
            <h3>3D unavailable</h3>
            <p>Gems V2 needs WebGL, which this browser or device has turned off.</p>
            <HudButton variant="primary" onClick={onExit}>
              Back to V1
            </HudButton>
          </div>
        </div>
      )}
      {engine && screen === 'hub' && (
        <HubScreen
          stage={engine.stage}
          input={engine.input}
          initial={selected}
          onSelect={setSelected}
          onPlay={play}
          onExit={onExit}
        />
      )}
      {engine && screen === 'runner' && <RunnerScreen stage={engine.stage} input={engine.input} onExit={toHub} />}
      {engine && screen === 'stacker' && <StackerScreen stage={engine.stage} input={engine.input} onExit={toHub} />}
      {engine && screen === 'maze' && <MazeScreen stage={engine.stage} input={engine.input} onExit={toHub} />}
      <div className="v2-fade" key={screen} />
    </div>
  );
}
