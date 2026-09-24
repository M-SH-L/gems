import * as THREE from 'three';
import type { StageScene } from '../../core/types';
import type { Input, Action } from '../../core/input';
import { addLights, createSky, createStars, damp, disposeTree, gemGeometry, gemMaterial, seededRandom } from '../../core/env';
import { Bursts } from '../../core/fx';
import { loadNumber, saveNumber } from '../../core/storage';
import {
  LANE_WIDTH,
  MAX_SPEED,
  START_SPEED,
  createRunner,
  jump,
  score,
  steer,
  stepRunner,
  type RunnerState,
} from './logic';

export interface RunnerHud {
  score: number;
  gems: number;
  speed: number;
  best: number;
  alive: boolean;
}

const PINK = '#ff4fd8';
const CYAN = '#4fe3ff';
const GOLD = '#ffd35c';
const PILLAR_SPACING = 12;
const PILLAR_COUNT = 14;

export class RunnerScene implements StageScene {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(62, 1, 0.1, 500);

  private state!: RunnerState;
  private best = loadNumber('runner-best');
  private canvas: HTMLCanvasElement;
  private onHud: (h: RunnerHud) => void;
  private lastHud = '';
  private unsub: () => void;
  private shake = 0;
  private deadTime = 0;
  private portrait = false;

  private player: THREE.Mesh;
  private playerGlow: THREE.PointLight;
  private groundMat: THREE.ShaderMaterial;
  private pillars: THREE.Group[] = [];
  private obstacleMeshes = new Map<number, THREE.Object3D>();
  private gemMeshes = new Map<number, THREE.Mesh>();
  private world = new THREE.Group();
  private bursts = new Bursts(18);

  private wallGeo = new THREE.BoxGeometry(LANE_WIDTH * 0.86, 1.8, 0.7);
  private wallMat = new THREE.MeshStandardMaterial({
    color: '#3b0a4f',
    emissive: PINK,
    emissiveIntensity: 0.55,
    roughness: 0.2,
    metalness: 0.4,
    transparent: true,
    opacity: 0.92,
  });
  private wallEdgeMat = new THREE.LineBasicMaterial({ color: '#ffd0f5' });
  private wallEdges = new THREE.EdgesGeometry(this.wallGeo);
  private barGeo = new THREE.BoxGeometry(LANE_WIDTH * 0.9, 0.28, 0.28);
  private barMat = new THREE.MeshStandardMaterial({ color: CYAN, emissive: CYAN, emissiveIntensity: 1.2 });
  private postGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8);
  private gemGeo = gemGeometry('octa', 0.32);
  private gemMat = gemMaterial(GOLD, 0.6);

  constructor(input: Input, canvas: HTMLCanvasElement, onHud: (h: RunnerHud) => void) {
    this.canvas = canvas;
    this.onHud = onHud;

    this.scene.fog = new THREE.Fog('#12052a', 30, 110);
    this.scene.add(createSky('#1a0638', '#ff5fa2'));
    this.scene.add(createStars(600, 300, '#ffe9ff'));
    addLights(this.scene, { key: '#ffe0f5', fill: '#7a6bff', rim: CYAN, shadowSize: 10 });

    // A giant setting sun on the horizon sells the synthwave depth.
    const sun = new THREE.Mesh(
      new THREE.CircleGeometry(60, 48),
      new THREE.MeshBasicMaterial({ color: '#ffb36b', fog: false }),
    );
    sun.position.set(0, 18, -320);
    this.scene.add(sun);

    this.groundMat = new THREE.ShaderMaterial({
      uniforms: {
        offset: { value: 0 },
        lane: { value: LANE_WIDTH },
        lineColor: { value: new THREE.Color(PINK) },
        edgeColor: { value: new THREE.Color(CYAN) },
      },
      vertexShader: /* glsl */ `
        varying vec2 vWorld;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vWorld = w.xz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float offset;
        uniform float lane;
        uniform vec3 lineColor;
        uniform vec3 edgeColor;
        varying vec2 vWorld;
        float line(float v, float w) {
          float d = abs(fract(v) - 0.5);
          return smoothstep(w, 0.0, d);
        }
        void main() {
          float z = vWorld.y - offset;
          float x = vWorld.x;
          float onTrack = step(abs(x), lane * 1.5);
          float grid = max(line(z / 3.0 + 0.5, 0.03), line(x / 3.0 + 0.5, 0.03));
          float laneDiv = smoothstep(0.06, 0.0, abs(abs(x) - lane * 0.5)) * onTrack;
          float edge = smoothstep(0.12, 0.0, abs(abs(x) - lane * 1.5));
          vec3 base = mix(vec3(0.03, 0.0, 0.08), vec3(0.08, 0.02, 0.16), onTrack);
          vec3 col = base + lineColor * grid * (0.25 + 0.5 * onTrack) + lineColor * laneDiv * 0.6 + edgeColor * edge * 1.5;
          float fade = smoothstep(-140.0, -20.0, vWorld.y);
          col = mix(vec3(0.07, 0.02, 0.16), col, fade);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 400), this.groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -150;
    this.scene.add(ground);

    // Shadow catcher so the player reads as grounded.
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(LANE_WIDTH * 3, 60),
      new THREE.ShadowMaterial({ opacity: 0.45 }),
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.set(0, 0.01, -20);
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);

    const pillarGeo = new THREE.CylinderGeometry(0.25, 0.4, 1, 6);
    const pillarMat = new THREE.MeshStandardMaterial({ color: '#2a0d44', emissive: '#7b2cff', emissiveIntensity: 0.4, flatShading: true });
    const capMat = gemMaterial(CYAN, 0.9);
    const capGeo = gemGeometry('octa', 0.5);
    const rand = seededRandom(3);
    for (let i = 0; i < PILLAR_COUNT * 2; i++) {
      const g = new THREE.Group();
      const h = 2 + rand() * 6;
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.scale.y = h;
      p.position.y = h / 2;
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = h + 0.7;
      g.add(p, cap);
      g.position.x = (i % 2 === 0 ? -1 : 1) * (LANE_WIDTH * 2.4 + rand() * 4);
      g.userData.baseZ = -Math.floor(i / 2) * PILLAR_SPACING - rand() * 4;
      this.pillars.push(g);
      this.scene.add(g);
    }

    this.player = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.5, 1),
      new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: CYAN, emissiveIntensity: 0.6, roughness: 0.1, metalness: 0.3, flatShading: true }),
    );
    this.player.castShadow = true;
    this.playerGlow = new THREE.PointLight(CYAN, 18, 8, 2);
    this.scene.add(this.player, this.playerGlow);

    this.scene.add(this.world, this.bursts.group);

    this.unsub = input.onPress(this.onAction);
    canvas.addEventListener('pointerdown', this.onPointer);
    this.restart();
  }

  restart = () => {
    for (const m of this.obstacleMeshes.values()) this.world.remove(m);
    for (const m of this.gemMeshes.values()) this.world.remove(m);
    this.obstacleMeshes.clear();
    this.gemMeshes.clear();
    this.state = createRunner(seededRandom(Date.now() & 0xffff));
    this.player.visible = true;
    this.deadTime = 0;
    this.emitHud(true);
  };

  private onAction = (a: Action) => {
    const s = this.state;
    if (!s.alive) {
      if ((a === 'restart' || a === 'confirm') && this.deadTime > 0.6) this.restart();
      return;
    }
    if (a === 'left') steer(s, -1);
    else if (a === 'right') steer(s, 1);
    else if (a === 'jump') jump(s);
    else if (a === 'restart') this.restart();
  };

  private onPointer = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const fx = (e.clientX - rect.left) / rect.width;
    if (!this.state.alive) return;
    if (fx < 0.33) this.onAction('left');
    else if (fx > 0.67) this.onAction('right');
    else this.onAction('jump');
  };

  resize(w: number, h: number) {
    this.portrait = w / h < 0.8;
  }

  private emitHud(force = false) {
    const s = this.state;
    const hud: RunnerHud = {
      score: score(s),
      gems: s.gemsCollected,
      speed: Math.round(((s.speed - START_SPEED) / (MAX_SPEED - START_SPEED)) * 100),
      best: this.best,
      alive: s.alive,
    };
    const key = `${hud.score}|${hud.gems}|${hud.speed}|${hud.best}|${hud.alive}`;
    if (force || key !== this.lastHud) {
      this.lastHud = key;
      this.onHud(hud);
    }
  }

  update(dt: number, elapsed: number) {
    const s = this.state;
    const ev = stepRunner(s, dt);

    for (const g of ev.collected) {
      const mesh = this.gemMeshes.get(g.id);
      if (mesh) this.bursts.emit(mesh.position.clone(), GOLD, 10, 5);
    }
    if (ev.crashed) {
      this.shake = 0.6;
      this.player.visible = false;
      this.bursts.emit(this.player.position.clone(), CYAN, 40, 9);
      this.bursts.emit(this.player.position.clone(), PINK, 20, 7);
      const final = score(s);
      if (final > this.best) {
        this.best = final;
        saveNumber('runner-best', final);
      }
    }
    if (!s.alive) this.deadTime += dt;

    this.syncObjects(elapsed);

    // Player
    this.player.position.set(s.x, 0.5 + s.y, 0);
    this.player.rotation.x -= (s.alive ? s.speed : 0) * dt * 1.4;
    this.player.rotation.z = damp(this.player.rotation.z, (s.lane * LANE_WIDTH - s.x) * -0.25, 10, dt);
    this.playerGlow.position.set(s.x, 1.2 + s.y, 0.5);
    this.playerGlow.intensity = s.alive ? 18 : damp(this.playerGlow.intensity, 0, 4, dt);

    this.groundMat.uniforms.offset.value = -s.distance;

    const total = PILLAR_COUNT * PILLAR_SPACING;
    for (const p of this.pillars) {
      const base = p.userData.baseZ as number;
      p.position.z = ((((base + s.distance) % total) + total) % total) - total + 10;
      p.children[1].rotation.y = elapsed * 1.5;
    }

    // Camera: trails the player, widens FOV with speed.
    const t = (s.speed - START_SPEED) / (MAX_SPEED - START_SPEED);
    this.camera.fov = damp(this.camera.fov, 60 + t * 16, 3, dt);
    this.camera.updateProjectionMatrix();
    const shakeX = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
    const shakeY = this.shake > 0 ? (Math.random() - 0.5) * this.shake : 0;
    this.shake = Math.max(0, this.shake - dt);
    // Portrait screens need a higher, further camera to fit all three lanes.
    const back = this.portrait ? 1.45 : 1;
    this.camera.position.set(s.x * 0.55 + shakeX, 3.3 * back + s.y * 0.3 + shakeY, 6.2 * back);
    this.camera.lookAt(s.x * 0.7, 1 + s.y * 0.2, -8);

    this.bursts.update(dt);
    this.emitHud();
  }

  private syncObjects(elapsed: number) {
    const s = this.state;
    const liveObs = new Set<number>();
    for (const o of s.obstacles) {
      liveObs.add(o.id);
      let mesh = this.obstacleMeshes.get(o.id);
      if (!mesh) {
        mesh = this.buildObstacle(o.kind);
        mesh.position.x = o.lane * LANE_WIDTH;
        this.obstacleMeshes.set(o.id, mesh);
        this.world.add(mesh);
      }
      mesh.position.z = -(o.s - s.distance);
    }
    for (const [id, mesh] of this.obstacleMeshes) {
      if (!liveObs.has(id)) {
        this.world.remove(mesh);
        this.obstacleMeshes.delete(id);
      }
    }

    const liveGems = new Set<number>();
    for (const g of s.gems) {
      liveGems.add(g.id);
      let mesh = this.gemMeshes.get(g.id);
      if (!mesh) {
        mesh = new THREE.Mesh(this.gemGeo, this.gemMat);
        mesh.castShadow = true;
        mesh.position.x = g.lane * LANE_WIDTH;
        this.gemMeshes.set(g.id, mesh);
        this.world.add(mesh);
      }
      mesh.position.z = -(g.s - s.distance);
      mesh.position.y = g.y + Math.sin(elapsed * 4 + g.id) * 0.12;
      mesh.rotation.y = elapsed * 3 + g.id;
    }
    for (const [id, mesh] of this.gemMeshes) {
      if (!liveGems.has(id)) {
        this.world.remove(mesh);
        this.gemMeshes.delete(id);
      }
    }
  }

  private buildObstacle(kind: 'wall' | 'bar'): THREE.Object3D {
    const g = new THREE.Group();
    if (kind === 'wall') {
      const m = new THREE.Mesh(this.wallGeo, this.wallMat);
      m.position.y = 0.9;
      m.castShadow = true;
      const edges = new THREE.LineSegments(this.wallEdges, this.wallEdgeMat);
      edges.position.y = 0.9;
      g.add(m, edges);
    } else {
      const bar = new THREE.Mesh(this.barGeo, this.barMat);
      bar.position.y = 0.62;
      bar.castShadow = true;
      const half = (LANE_WIDTH * 0.9) / 2;
      for (const side of [-1, 1]) {
        const post = new THREE.Mesh(this.postGeo, this.barMat);
        post.position.set(side * half, 0.4, 0);
        g.add(post);
      }
      g.add(bar);
    }
    return g;
  }

  dispose() {
    this.unsub();
    this.canvas.removeEventListener('pointerdown', this.onPointer);
    this.bursts.dispose();
    disposeTree(this.scene);
    this.wallGeo.dispose();
    this.wallEdges.dispose();
    this.barGeo.dispose();
    this.postGeo.dispose();
    this.gemGeo.dispose();
    this.wallMat.dispose();
    this.wallEdgeMat.dispose();
    this.barMat.dispose();
    this.gemMat.dispose();
  }
}
