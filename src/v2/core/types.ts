import type * as THREE from 'three';

/** A self-contained 3D scene that the shared Stage renders each frame. */
export interface StageScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  /** Advance the simulation. `dt` is in seconds and already clamped. */
  update(dt: number, elapsed: number): void;
  /** Optional hook for aspect-dependent camera framing. */
  resize?(width: number, height: number): void;
  dispose(): void;
}

export type V2GameId = 'runner' | 'stacker' | 'maze';

export interface V2GameMeta {
  id: V2GameId;
  name: string;
  tagline: string;
  genre: string;
  color: string;
  controls: string[];
}
