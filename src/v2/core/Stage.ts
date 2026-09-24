import * as THREE from 'three';
import type { StageScene } from './types';

const MAX_DT = 1 / 20;

/**
 * Owns the single WebGL renderer for V2. Screens swap scenes in and out
 * instead of creating their own contexts.
 */
export class Stage {
  readonly renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private current: StageScene | null = null;
  private frame = 0;
  private last = 0;
  private elapsed = 0;
  private observer: ResizeObserver;

  constructor(container: HTMLElement) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    const canvas = this.renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.touchAction = 'none';
    container.appendChild(canvas);

    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(container);
    this.resize();

    this.last = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  get canvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  /** Show `next`. Scenes are owned (and disposed) by whoever created them. */
  setScene(next: StageScene | null) {
    this.current = next;
    this.resize();
  }

  /** Remove `scene` (if it is still showing) and dispose it. */
  release(scene: StageScene) {
    if (this.current === scene) this.current = null;
    scene.dispose();
  }

  private resize() {
    const w = Math.max(1, this.container.clientWidth);
    const h = Math.max(1, this.container.clientHeight);
    this.renderer.setSize(w, h, false);
    if (this.current) {
      this.current.camera.aspect = w / h;
      this.current.camera.updateProjectionMatrix();
      this.current.resize?.(w, h);
    }
  }

  private tick = (now: number) => {
    this.frame = requestAnimationFrame(this.tick);
    const dt = Math.min(MAX_DT, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    this.elapsed += dt;
    const s = this.current;
    if (!s) return;
    s.update(dt, this.elapsed);
    this.renderer.render(s.scene, s.camera);
  };

  dispose() {
    cancelAnimationFrame(this.frame);
    this.observer.disconnect();
    this.current = null;
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.renderer.domElement.remove();
  }
}
