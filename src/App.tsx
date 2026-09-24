import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ThemeProvider } from './theme/ThemeContext';
import { SoundProvider } from './sound/SoundContext';
import { Desktop } from './desktop/Desktop';
import { PortalContext, type PortalControls } from './portal/PortalContext';
import { PortalTransition, type PortalRequest } from './portal/PortalTransition';

type World = 'v1' | 'v2';

// V2 (and three.js with it) only loads once someone steps through the portal.
const loadV2 = () => import('./v2/V2App');
const V2App = lazy(loadV2);

const worldFromHash = (): World => (window.location.hash === '#v2' ? 'v2' : 'v1');

/** If the V2 bundle fails to load, fall back to V1 instead of a blank page. */
class V2Boundary extends Component<{ children: ReactNode; onFail(): void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const center = () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

function App() {
  const [world, setWorld] = useState<World>(worldFromHash);
  const [portal, setPortal] = useState<(PortalRequest & { ready: Promise<unknown> }) | null>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  const travel = useCallback((to: World, origin = center()) => {
    setPortal((current) => {
      if (current) return current;
      return {
        direction: to === 'v2' ? 'in' : 'out',
        origin,
        ready: to === 'v2' ? loadV2() : Promise.resolve(),
      };
    });
  }, []);

  const swap = useCallback(() => {
    if (!portal) return;
    const to: World = portal.direction === 'in' ? 'v2' : 'v1';
    setWorld(to);
    const url = new URL(window.location.href);
    url.hash = to === 'v2' ? 'v2' : '';
    window.history.replaceState(null, '', url.hash ? url : url.pathname + url.search);
  }, [portal]);

  const done = useCallback(() => setPortal(null), []);

  // Let the browser's address bar drive it too (e.g. pasting a #v2 link).
  useEffect(() => {
    const onHash = () => {
      const target = worldFromHash();
      if (target !== world) travel(target);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [world, travel]);

  const controls = useMemo<PortalControls>(() => ({ enterV2: (origin) => travel('v2', origin) }), [travel]);
  const exitV2 = useCallback(() => travel('v1'), [travel]);

  return (
    <ThemeProvider>
      <SoundProvider>
        <PortalContext.Provider value={controls}>
          <div ref={worldRef} style={{ width: '100%', height: '100%' }}>
            {world === 'v1' ? (
              <Desktop />
            ) : (
              <V2Boundary onFail={() => setWorld('v1')}>
                <Suspense fallback={<div className="v2-loading" />}>
                  <V2App onExit={exitV2} />
                </Suspense>
              </V2Boundary>
            )}
          </div>
          {portal && (
            <PortalTransition
              direction={portal.direction}
              origin={portal.origin}
              ready={portal.ready}
              worldRef={worldRef}
              onSwap={swap}
              onDone={done}
            />
          )}
        </PortalContext.Provider>
      </SoundProvider>
    </ThemeProvider>
  );
}

export default App;
