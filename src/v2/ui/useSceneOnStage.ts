import { useEffect, useRef } from 'react';
import type { Stage } from '../core/Stage';
import type { StageScene } from '../core/types';

/**
 * Mount a scene on the shared stage for the lifetime of the calling component.
 * `create` runs once; the scene is disposed when the component unmounts.
 */
export function useSceneOnStage<T extends StageScene>(stage: Stage, create: () => T) {
  const ref = useRef<T | null>(null);
  const createRef = useRef(create);

  useEffect(() => {
    const scene = createRef.current();
    ref.current = scene;
    stage.setScene(scene);
    return () => {
      ref.current = null;
      stage.release(scene);
    };
  }, [stage]);

  return ref;
}
