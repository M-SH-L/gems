import * as THREE from 'three';
import type { StageScene } from '../../core/types';
import type { Input, Action } from '../../core/input';
import { addLights, createSky, damp, disposeTree, seededRandom } from '../../core/env';
import { Bursts } from '../../core/fx';
import { loadNumber, saveNumber } from '../../core/storage';
import {
  BASE_SIZE,
  BLOCK_HEIGHT,
  createStacker,
  placeSlab,
  stackScore,
  stepStacker,
  type Slab,
  type StackerState,
} from './logic';

export interface StackerHud {
  score: number;
  best: number;
  combo: number;
  over: boolean;
  /** Increments on every perfect drop so the HUD can pulse. */
  perfectTick: number;
}

interface Falling {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  spin: THREE.Vector3;
}

interface Ripple {
  mesh: THREE.Mesh;
  life: number;
}

const HUE_START = 0.08;

function slabColor(i: number) {
  return new THREE.Color().setHSL((HUE_START + i * 0.045) % 1, 0.75, 0.6);
}

export class StackerScene implements StageScene {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, 1, 0.1, 600);

  private state!: StackerState;
  private best = loadNumber('stacker-best');
  private canvas: HTMLCanvasElement;
  private onHud: (h: StackerHud) => void;
  private unsub: () => void;
  private perfectTick = 0;
  private overTime = 0;
  private lastHud = '';

  private boxGeo = new THREE.BoxGeometry(1, 1, 1);
  private tower = new THREE.Group();
  private movingMesh!: THREE.Mesh;
  private falling: Falling[] = [];
  private ripples: Ripple[] = [];
  private ringGeo = new THREE.RingGeometry(0.96, 1, 4, 1, Math.PI / 4);
  private clouds: THREE.Group[] = [];
  private bursts = new Bursts(10);
  private camY = 0.5;
  private camDist = 11;
  private key: THREE.DirectionalLight;
  private skyMat: THREE.ShaderMaterial;
  private aspect = 1;

  constructor(input: Input, canvas: HTMLCanvasElement, onHud: (h: StackerHud) => void) {
    this.canvas = canvas;
    this.onHud = onHud;

    this.scene.fog = new THREE.Fog('#ffcf9e', 40, 140);
    const sky = createSky('#6a8dff', '#ffcf9e', 400, -0.5, 0.3);
    this.skyMat = sky.material as THREE.ShaderMaterial;
    this.scene.add(sky);
    const lights = addLights(this.scene, { key: '#fff4e0', fill: '#bcd0ff', rim: '#ff9f6b', shadowSize: 8 });
    this.key = lights.key;

    // Floating rock the tower is built on.
    const rock = new THREE.Mesh(
      new THREE.CylinderGeometry(BASE_SIZE * 1.05, 0.6, 7, 7, 3),
      new THREE.MeshStandardMaterial({ color: '#6b5a7a', flatShading: true, roughness: 0.9 }),
    );
    const pos = rock.geometry.attributes.position as THREE.BufferAttribute;
    const jitter = seededRandom(11);
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) < 3.4) {
        pos.setX(i, pos.getX(i) + (jitter() - 0.5) * 0.6);
        pos.setZ(i, pos.getZ(i) + (jitter() - 0.5) * 0.6);
      }
    }
    rock.geometry.computeVertexNormals();
    rock.position.y = -BLOCK_HEIGHT / 2 - 3.5;
    rock.receiveShadow = true;
    const grass = new THREE.Mesh(
      new THREE.CylinderGeometry(BASE_SIZE * 1.12, BASE_SIZE * 1.05, 0.35, 7),
      new THREE.MeshStandardMaterial({ color: '#7bd389', flatShading: true }),
    );
    grass.position.y = -BLOCK_HEIGHT / 2 - 0.12;
    grass.receiveShadow = true;
    this.scene.add(rock, grass);

    this.buildClouds();
    this.scene.add(this.tower, this.bursts.group);

    this.unsub = input.onPress(this.onAction);
    canvas.addEventListener('pointerdown', this.onPointer);
    this.restart();
  }

  private buildClouds() {
    const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', flatShading: true, roughness: 1, transparent: true, opacity: 0.92 });
    const geo = new THREE.IcosahedronGeometry(1, 0);
    const rand = seededRandom(21);
    for (let i = 0; i < 26; i++) {
      const g = new THREE.Group();
      const puffs = 3 + Math.floor(rand() * 3);
      for (let p = 0; p < puffs; p++) {
        const m = new THREE.Mesh(geo, mat);
        const s = 1 + rand() * 1.4;
        m.scale.set(s * 1.3, s * 0.8, s);
        m.position.set(p * 1.5 - puffs * 0.7, rand() * 0.6, rand() - 0.5);
        g.add(m);
      }
      const angle = rand() * Math.PI * 2;
      const r = 14 + rand() * 30;
      g.position.set(Math.cos(angle) * r, -6 + rand() * 70, Math.sin(angle) * r);
      g.userData.speed = 0.3 + rand() * 0.6;
      this.clouds.push(g);
      this.scene.add(g);
    }
  }

  restart = () => {
    for (const child of [...this.tower.children]) {
      this.tower.remove(child);
      ((child as THREE.Mesh).material as THREE.Material).dispose();
    }
    for (const f of this.falling) {
      this.scene.remove(f.mesh);
      (f.mesh.material as THREE.Material).dispose();
    }
    this.falling = [];
    this.state = createStacker();
    this.addTowerSlab(this.state.layers[0], 0);
    this.movingMesh = this.makeSlabMesh(this.state.moving, 1);
    this.tower.add(this.movingMesh);
    this.overTime = 0;
    this.emitHud(true);
  };

  private makeSlabMesh(slab: Slab, level: number) {
    const mesh = new THREE.Mesh(
      this.boxGeo,
      new THREE.MeshStandardMaterial({ color: slabColor(level), roughness: 0.45, metalness: 0.05 }),
    );
    mesh.scale.set(slab.w, BLOCK_HEIGHT, slab.d);
    mesh.position.set(slab.x, level * BLOCK_HEIGHT, slab.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private addTowerSlab(slab: Slab, level: number) {
    this.tower.add(this.makeSlabMesh(slab, level));
  }

  private onAction = (a: Action) => {
    if (this.state.over) {
      if ((a === 'confirm' || a === 'restart') && this.overTime > 0.6) this.restart();
      return;
    }
    if (a === 'confirm') this.drop();
    else if (a === 'restart') this.restart();
  };

  private onPointer = () => this.onAction(this.state.over ? 'restart' : 'confirm');

  private drop() {
    const res = placeSlab(this.state);
    if (!res) return;
    // The moving mesh becomes debris or is replaced by the trimmed slab.
    this.tower.remove(this.movingMesh);
    (this.movingMesh.material as THREE.Material).dispose();
    const level = this.state.layers.length - 1;

    if (res.kind === 'miss') {
      this.spawnFalling(res.debris, level + 1);
      const final = stackScore(this.state);
      if (final > this.best) {
        this.best = final;
        saveNumber('stacker-best', final);
      }
      this.emitHud();
      return;
    }

    this.addTowerSlab(res.placed, level);
    if (res.kind === 'cut') {
      this.spawnFalling(res.debris, level);
    } else {
      this.perfectTick++;
      this.spawnRipple(res.placed, level);
      this.bursts.emit(new THREE.Vector3(res.placed.x, level * BLOCK_HEIGHT, res.placed.z), '#ffffff', 16, 4);
    }
    this.movingMesh = this.makeSlabMesh(this.state.moving, level + 1);
    this.tower.add(this.movingMesh);
    this.emitHud();
  }

  private spawnFalling(slab: Slab, level: number) {
    const mesh = this.makeSlabMesh(slab, level);
    this.scene.add(mesh);
    const top = this.state.layers[this.state.layers.length - 1];
    const away = new THREE.Vector3(slab.x - top.x, 0, slab.z - top.z).normalize();
    this.falling.push({
      mesh,
      vel: away.multiplyScalar(1.5).setY(1),
      spin: new THREE.Vector3(away.z * 2.5, 0, -away.x * 2.5),
    });
  }

  private spawnRipple(slab: Slab, level: number) {
    const mesh = new THREE.Mesh(
      this.ringGeo,
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, side: THREE.DoubleSide }),
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(slab.x, level * BLOCK_HEIGHT - BLOCK_HEIGHT / 2 + 0.01, slab.z);
    mesh.scale.set((slab.w / 2) * Math.SQRT2, (slab.d / 2) * Math.SQRT2, 1);
    this.scene.add(mesh);
    this.ripples.push({ mesh, life: 0.6 });
  }

  private emitHud(force = false) {
    const s = this.state;
    const hud: StackerHud = {
      score: stackScore(s),
      best: this.best,
      combo: s.combo,
      over: s.over,
      perfectTick: this.perfectTick,
    };
    const key = JSON.stringify(hud);
    if (force || key !== this.lastHud) {
      this.lastHud = key;
      this.onHud(hud);
    }
  }

  resize(w: number, h: number) {
    this.aspect = w / h;
  }

  update(dt: number, elapsed: number) {
    const s = this.state;
    stepStacker(s, dt);
    if (s.over) this.overTime += dt;

    const level = s.layers.length;
    if (!s.over) {
      const m = s.moving;
      this.movingMesh.position.set(m.x, level * BLOCK_HEIGHT, m.z);
    }

    for (let i = this.falling.length - 1; i >= 0; i--) {
      const f = this.falling[i];
      f.vel.y -= 22 * dt;
      f.mesh.position.addScaledVector(f.vel, dt);
      f.mesh.rotation.x += f.spin.x * dt;
      f.mesh.rotation.z += f.spin.z * dt;
      if (f.mesh.position.y < this.camY - 40) {
        this.scene.remove(f.mesh);
        (f.mesh.material as THREE.Material).dispose();
        this.falling.splice(i, 1);
      }
    }

    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.life -= dt;
      r.mesh.scale.x *= 1 + dt * 1.2;
      r.mesh.scale.y *= 1 + dt * 1.2;
      (r.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, r.life / 0.6);
      if (r.life <= 0) {
        this.scene.remove(r.mesh);
        (r.mesh.material as THREE.Material).dispose();
        this.ripples.splice(i, 1);
      }
    }

    for (const c of this.clouds) {
      c.position.x += (c.userData.speed as number) * dt;
      if (c.position.x > 50) c.position.x = -50;
    }

    // Camera rides up with the tower; on game over, pull back to show it all.
    const topY = level * BLOCK_HEIGHT;
    const narrow = this.aspect < 0.8 ? 1.6 : 1;
    const targetY = s.over ? topY * 0.5 : topY + 0.5;
    const targetDist = (s.over ? Math.max(12, topY * 1.3 + 6) : 11) * narrow;
    this.camY = damp(this.camY, targetY, 3, dt);
    this.camDist = damp(this.camDist, targetDist, 2, dt);
    const orbit = s.over ? Math.PI / 4 + elapsed * 0.25 : Math.PI / 4;
    this.camera.position.set(
      Math.cos(orbit) * this.camDist,
      this.camY + this.camDist * 0.55,
      Math.sin(orbit) * this.camDist,
    );
    this.camera.lookAt(0, this.camY, 0);

    // Keep the shadow frustum centred on the action.
    this.key.position.set(8, this.camY + 14, 10);
    this.key.target.position.set(0, this.camY - 1, 0);

    // Sky drifts from warm dusk toward deep space as you climb.
    const h = Math.min(1, topY / 60);
    this.skyMat.uniforms.top.value.set('#6a8dff').lerp(new THREE.Color('#0b0633'), h);
    this.skyMat.uniforms.bottom.value.set('#ffcf9e').lerp(new THREE.Color('#ff6fa8'), h);
    (this.scene.fog as THREE.Fog).color.copy(this.skyMat.uniforms.bottom.value);

    this.bursts.update(dt);
  }

  dispose() {
    this.unsub();
    this.canvas.removeEventListener('pointerdown', this.onPointer);
    this.bursts.dispose();
    disposeTree(this.scene);
    this.boxGeo.dispose();
    this.ringGeo.dispose();
  }
}
