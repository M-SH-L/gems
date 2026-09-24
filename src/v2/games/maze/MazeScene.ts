import * as THREE from 'three';
import type { StageScene } from '../../core/types';
import type { Input, Action } from '../../core/input';
import { addLights, createSky, createStars, damp, disposeTree, gemGeometry, gemMaterial, seededRandom } from '../../core/env';
import { Bursts } from '../../core/fx';
import { loadNumber, saveNumber } from '../../core/storage';
import { cellCenter, mazeLevels, parseLevel } from './levels';
import { FALL_TIME, MARBLE_RADIUS, createMaze, stepMaze, type MazeState } from './logic';

export interface MazeHud {
  level: number;
  levelCount: number;
  levelName: string;
  time: number;
  best: number; // 0 when no best yet
  falls: number;
  gems: number;
  gemsTotal: number;
  status: 'playing' | 'falling' | 'won' | 'complete';
}

const TEAL = '#3ee6c1';
const WALL_H = 0.55;
const DRAG_RANGE = 90; // px of drag for full tilt

export class MazeScene implements StageScene {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 600);

  private input: Input;
  private canvas: HTMLCanvasElement;
  private onHud: (h: MazeHud) => void;
  private unsub: () => void;
  private lastHud = '';
  private levelIndex = 0;
  private state!: MazeState;
  private aspect = 1;
  private best = 0;

  private board = new THREE.Group();
  private boardContent = new THREE.Group();
  private marble: THREE.Mesh;
  private marbleShadow: THREE.Mesh;
  private goalBeam!: THREE.Mesh;
  private gemMeshes = new Map<string, THREE.Mesh>();
  private bursts = new Bursts(12);
  private rocks: THREE.Mesh[] = [];

  private drag: { id: number; x: number; y: number; dx: number; dy: number } | null = null;

  private floorGeo = new THREE.BoxGeometry(1, 0.3, 1);
  private wallGeo = new THREE.BoxGeometry(1, WALL_H, 1);
  private floorMatA = new THREE.MeshStandardMaterial({ color: '#e6f7f2', roughness: 0.7 });
  private floorMatB = new THREE.MeshStandardMaterial({ color: '#c9ece2', roughness: 0.7 });
  private wallMat = new THREE.MeshStandardMaterial({ color: '#1f7a6b', roughness: 0.4, emissive: '#0c3b33', emissiveIntensity: 0.4 });
  private holeMat = new THREE.MeshBasicMaterial({ color: '#05060f' });
  private rimMat = new THREE.MeshStandardMaterial({ color: '#ff6b8b', emissive: '#ff6b8b', emissiveIntensity: 0.5 });
  private gemGeo = gemGeometry('octa', 0.2);
  private gemMat = gemMaterial('#ffd35c', 0.7);

  constructor(input: Input, canvas: HTMLCanvasElement, onHud: (h: MazeHud) => void) {
    this.input = input;
    this.canvas = canvas;
    this.onHud = onHud;

    this.scene.fog = new THREE.Fog('#2a1b5c', 40, 160);
    this.scene.add(createSky('#0d1b4a', '#6b3fa0'));
    this.scene.add(createStars(500, 300, '#d9fff6', 13));
    addLights(this.scene, { key: '#fff8ea', fill: '#9fe8ff', rim: TEAL, shadowSize: 10 });

    const rand = seededRandom(5);
    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: '#4b3b7a', flatShading: true, roughness: 0.9 });
    for (let i = 0; i < 14; i++) {
      const r = new THREE.Mesh(rockGeo, rockMat);
      const a = rand() * Math.PI * 2;
      const d = 14 + rand() * 20;
      r.position.set(Math.cos(a) * d, -6 - rand() * 10, Math.sin(a) * d - 6);
      r.scale.setScalar(0.8 + rand() * 2.2);
      r.userData.phase = rand() * 10;
      this.rocks.push(r);
      this.scene.add(r);
    }

    this.marble = new THREE.Mesh(
      new THREE.SphereGeometry(MARBLE_RADIUS, 32, 16),
      new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.6, roughness: 0.12, emissive: TEAL, emissiveIntensity: 0.25 }),
    );
    this.marble.castShadow = true;
    // Blob shadow keeps the marble readable even at steep tilts.
    this.marbleShadow = new THREE.Mesh(
      new THREE.CircleGeometry(MARBLE_RADIUS * 1.1, 24),
      new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.25, depthWrite: false }),
    );
    this.marbleShadow.rotation.x = -Math.PI / 2;
    this.board.add(this.boardContent, this.marble, this.marbleShadow);
    this.scene.add(this.board, this.bursts.group);

    this.unsub = input.onPress(this.onAction);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    this.loadLevel(0);
  }

  private loadLevel(index: number) {
    this.levelIndex = index;
    const level = parseLevel(mazeLevels[index]);
    this.state = createMaze(level);
    this.best = loadNumber(`maze-best-${index}`);
    this.board.remove(this.boardContent);
    this.disposeLevel();
    this.boardContent = new THREE.Group();
    this.board.add(this.boardContent);
    this.gemMeshes.clear();

    const floors: THREE.Vector3[][] = [[], []];
    const walls: THREE.Vector3[] = [];
    for (let r = 0; r < level.rows; r++) {
      for (let c = 0; c < level.cols; c++) {
        const cell = level.grid[r][c];
        const p = cellCenter(level, c, r);
        if (cell === '#') {
          walls.push(new THREE.Vector3(p.x, WALL_H / 2, p.z));
          floors[(r + c) % 2].push(new THREE.Vector3(p.x, -0.15, p.z));
        } else if (cell === 'O') {
          const pit = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.31, 24), this.holeMat);
          pit.position.set(p.x, -0.15, p.z);
          const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.04, 8, 24), this.rimMat);
          rim.rotation.x = Math.PI / 2;
          rim.position.set(p.x, 0.01, p.z);
          // Fill the square corners around the round hole.
          const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.4, 0.71, 24, 1),
            (r + c) % 2 ? this.floorMatB : this.floorMatA,
          );
          ring.rotation.x = -Math.PI / 2;
          ring.position.set(p.x, 0.001, p.z);
          ring.receiveShadow = true;
          this.boardContent.add(pit, rim, ring);
        } else {
          floors[(r + c) % 2].push(new THREE.Vector3(p.x, -0.15, p.z));
        }
      }
    }

    const m = new THREE.Matrix4();
    floors.forEach((list, i) => {
      const inst = new THREE.InstancedMesh(this.floorGeo, i ? this.floorMatB : this.floorMatA, list.length);
      list.forEach((v, j) => inst.setMatrixAt(j, m.makeTranslation(v.x, v.y, v.z)));
      inst.receiveShadow = true;
      this.boardContent.add(inst);
    });
    const wallInst = new THREE.InstancedMesh(this.wallGeo, this.wallMat, walls.length);
    walls.forEach((v, j) => wallInst.setMatrixAt(j, m.makeTranslation(v.x, v.y, v.z)));
    wallInst.castShadow = true;
    wallInst.receiveShadow = true;
    this.boardContent.add(wallInst);

    // Underside slab gives the board some heft.
    const under = new THREE.Mesh(
      new THREE.BoxGeometry(level.cols + 0.4, 0.5, level.rows + 0.4),
      new THREE.MeshStandardMaterial({ color: '#16324a', roughness: 0.6 }),
    );
    under.position.y = -0.56;
    this.boardContent.add(under);

    // Goal: glowing pad + light beam.
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.42, 0.06, 32),
      new THREE.MeshStandardMaterial({ color: TEAL, emissive: TEAL, emissiveIntensity: 1.4 }),
    );
    pad.position.set(level.goal.x, 0.03, level.goal.z);
    this.goalBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.36, 1.6, 24, 1, true),
      new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    );
    this.goalBeam.position.set(level.goal.x, 0.8, level.goal.z);
    this.boardContent.add(pad, this.goalBeam);

    for (const g of level.gems) {
      const mesh = new THREE.Mesh(this.gemGeo, this.gemMat);
      mesh.position.set(g.x, 0.35, g.z);
      mesh.castShadow = true;
      this.gemMeshes.set(g.id, mesh);
      this.boardContent.add(mesh);
    }

    this.marble.visible = true;
    this.frameCamera(true);
    this.emitHud(true);
  }

  /** Free per-level geometry/materials but keep the shared ones for reuse. */
  private disposeLevel() {
    const shared = new Set<unknown>([
      this.floorGeo, this.wallGeo, this.gemGeo,
      this.floorMatA, this.floorMatB, this.wallMat, this.holeMat, this.rimMat, this.gemMat,
    ]);
    this.boardContent.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry && !shared.has(mesh.geometry)) mesh.geometry.dispose();
      const mat = mesh.material as THREE.Material | undefined;
      if (mat && !shared.has(mat)) mat.dispose();
      if (obj instanceof THREE.InstancedMesh) obj.dispose();
    });
  }

  private get finished() {
    return this.state.status === 'won' && this.levelIndex === mazeLevels.length - 1;
  }

  private onAction = (a: Action) => {
    const s = this.state;
    if (s.status === 'won') {
      if (a === 'confirm') this.loadLevel(this.finished ? 0 : this.levelIndex + 1);
      else if (a === 'restart') this.loadLevel(this.levelIndex);
      return;
    }
    if (a === 'restart') this.loadLevel(this.levelIndex);
  };

  /** Called by the HUD's buttons. */
  next = () => this.onAction('confirm');
  retry = () => this.loadLevel(this.levelIndex);

  private onPointerDown = (e: PointerEvent) => {
    if (this.state.status === 'won') return;
    this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0 };
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.drag || e.pointerId !== this.drag.id) return;
    this.drag.dx = Math.max(-1, Math.min(1, (e.clientX - this.drag.x) / DRAG_RANGE));
    this.drag.dy = Math.max(-1, Math.min(1, (e.clientY - this.drag.y) / DRAG_RANGE));
  };

  private onPointerUp = (e: PointerEvent) => {
    if (this.drag && e.pointerId === this.drag.id) this.drag = null;
  };

  private emitHud(force = false) {
    const s = this.state;
    const hud: MazeHud = {
      level: this.levelIndex + 1,
      levelCount: mazeLevels.length,
      levelName: s.level.name,
      time: Math.floor(s.time * 10) / 10,
      best: this.best,
      falls: s.falls,
      gems: s.gemsTaken.size,
      gemsTotal: s.level.gems.length,
      status: this.finished ? 'complete' : s.status,
    };
    const key = JSON.stringify(hud);
    if (force || key !== this.lastHud) {
      this.lastHud = key;
      this.onHud(hud);
    }
  }

  resize(w: number, h: number) {
    this.aspect = w / h;
    this.frameCamera(true);
  }

  private frameCamera(snap: boolean) {
    const L = this.state?.level;
    if (!L) return;
    // Fit the board to the view whatever the aspect ratio.
    const vFov = THREE.MathUtils.degToRad(this.camera.fov);
    const needH = L.rows + 2;
    const needW = L.cols + 2;
    const distH = needH / 2 / Math.tan(vFov / 2);
    const distW = needW / 2 / (Math.tan(vFov / 2) * this.aspect);
    const dist = Math.max(distH, distW) * 1.05;
    const target = new THREE.Vector3(0, dist * 0.93, dist * 0.55);
    if (snap) this.camera.position.copy(target);
    else this.camera.position.lerp(target, 0.05);
    this.camera.lookAt(0, 0, 0.4);
  }

  update(dt: number, elapsed: number) {
    const s = this.state;
    let dirX = (this.input.isHeld('right') ? 1 : 0) - (this.input.isHeld('left') ? 1 : 0);
    let dirZ = (this.input.isHeld('down') ? 1 : 0) - (this.input.isHeld('up') ? 1 : 0);
    if (this.drag) {
      dirX = this.drag.dx;
      dirZ = this.drag.dy;
    }
    const ev = stepMaze(s, dirX, dirZ, dt);

    for (const id of ev.collected) {
      const mesh = this.gemMeshes.get(id);
      if (!mesh) continue;
      mesh.visible = false;
      this.bursts.emit(mesh.getWorldPosition(new THREE.Vector3()), '#ffd35c', 12, 3.5);
    }
    if (ev.fell) this.bursts.emit(this.marble.getWorldPosition(new THREE.Vector3()), '#ff6b8b', 10, 2.5);
    if (ev.respawned) this.marble.visible = true;
    if (ev.won) {
      this.bursts.emit(this.marble.getWorldPosition(new THREE.Vector3()), TEAL, 40, 6);
      const time = Math.floor(s.time * 10) / 10;
      if (this.best === 0 || time < this.best) {
        this.best = time;
        saveNumber(`maze-best-${this.levelIndex}`, time);
      }
    }

    this.board.rotation.z = -s.tiltX;
    this.board.rotation.x = s.tiltZ;

    // Roll the marble: rotate about the axis perpendicular to travel.
    const speed = Math.hypot(s.vx, s.vz);
    if (s.status === 'playing' && speed > 1e-4) {
      const axis = new THREE.Vector3(s.vz, 0, -s.vx).normalize();
      const q = new THREE.Quaternion().setFromAxisAngle(axis, (speed * dt) / MARBLE_RADIUS);
      this.marble.quaternion.premultiply(q);
    }
    let y = MARBLE_RADIUS;
    if (s.status === 'falling') {
      const t = s.fallT / FALL_TIME;
      y = MARBLE_RADIUS - t * t * 3;
      if (t > 0.9) this.marble.visible = false;
    } else if (s.status === 'won') {
      y = damp(this.marble.position.y, 1.2 + Math.sin(elapsed * 3) * 0.15, 4, dt);
    }
    this.marble.position.set(s.x, y, s.z);
    this.marbleShadow.position.set(s.x, 0.005, s.z);
    this.marbleShadow.visible = s.status !== 'falling';

    this.goalBeam.rotation.y = elapsed;
    (this.goalBeam.material as THREE.MeshBasicMaterial).opacity = 0.16 + Math.sin(elapsed * 4) * 0.06;
    for (const g of this.gemMeshes.values()) {
      g.rotation.y = elapsed * 2.5;
      g.position.y = 0.35 + Math.sin(elapsed * 3 + g.position.x) * 0.06;
    }
    for (const r of this.rocks) {
      r.position.y += Math.sin(elapsed * 0.6 + (r.userData.phase as number)) * dt * 0.3;
      r.rotation.y += dt * 0.1;
    }

    this.bursts.update(dt);
    this.emitHud();
  }

  dispose() {
    this.unsub();
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.bursts.dispose();
    disposeTree(this.scene);
    for (const r of [this.floorGeo, this.wallGeo, this.gemGeo]) r.dispose();
    for (const m of [this.floorMatA, this.floorMatB, this.wallMat, this.holeMat, this.rimMat, this.gemMat]) m.dispose();
  }
}
