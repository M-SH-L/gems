import * as THREE from 'three';
import type { StageScene, V2GameMeta } from '../core/types';
import type { Input, Action } from '../core/input';
import { addLights, createSky, createStars, damp, disposeTree, gemGeometry, gemMaterial, seededRandom } from '../core/env';

const RADIUS = 5.2;
const GEM_SHAPES = ['octa', 'dodeca', 'ico'] as const;
const LAUNCH_TIME = 0.75;

interface Pedestal {
  group: THREE.Group;
  gem: THREE.Mesh;
  halo: THREE.Mesh;
  light: THREE.PointLight;
  orbiters: THREE.Group;
  trim: THREE.MeshStandardMaterial;
}

export interface HubCallbacks {
  onSelect(index: number): void;
  /** The camera has started flying into a gem. */
  onLaunch(index: number): void;
  /** The fly-in finished; time to show the game. */
  onPlay(index: number): void;
  onBack(): void;
}

export class HubScene implements StageScene {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, 1, 0.1, 800);

  private canvas: HTMLCanvasElement;
  private cb: HubCallbacks;
  private unsub: () => void;
  private games: V2GameMeta[];
  private selected: number;
  private carousel = new THREE.Group();
  private carouselAngle = 0;
  private pedestals: Pedestal[] = [];
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2(0, 0);
  private hovered = -1;
  private launch: { index: number; t: number; from: THREE.Vector3 } | null = null;
  private motes: THREE.Points;
  private aspect = 1;
  private intro = 0;

  constructor(input: Input, canvas: HTMLCanvasElement, games: V2GameMeta[], selected: number, cb: HubCallbacks) {
    this.canvas = canvas;
    this.games = games;
    this.selected = selected;
    this.cb = cb;

    this.scene.fog = new THREE.FogExp2('#150a33', 0.018);
    this.scene.add(createSky('#05031a', '#3b1670'));
    this.scene.add(createStars(1400, 350, '#ffffff', 99));
    addLights(this.scene, { key: '#fff0f8', fill: '#8c7dff', rim: '#4fe3ff', shadowSize: 12 });

    this.buildIsland();
    this.buildPedestals();
    this.motes = this.buildMotes();
    this.scene.add(this.carousel, this.motes);

    this.carouselAngle = this.angleFor(selected);
    this.carousel.rotation.y = this.carouselAngle;

    this.unsub = input.onPress(this.onAction);
    canvas.addEventListener('pointermove', this.onPointerMove);
    canvas.addEventListener('click', this.onClick);
  }

  private buildIsland() {
    // Top deck
    const deck = new THREE.Mesh(
      new THREE.CylinderGeometry(9, 9.4, 0.6, 6),
      new THREE.MeshStandardMaterial({ color: '#2b1d5c', roughness: 0.55, metalness: 0.2, flatShading: true }),
    );
    deck.position.y = -0.3;
    deck.receiveShadow = true;
    this.scene.add(deck);

    // Glowing inlay rings
    for (const [r, c] of [[3.2, '#ff4fd8'], [6.6, '#4fe3ff'], [8.6, '#ffb347']] as const) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(r - 0.05, r + 0.05, 96),
        new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.55 }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.01;
      this.scene.add(ring);
    }

    // Jagged rock underside
    const under = new THREE.Mesh(
      new THREE.ConeGeometry(9.2, 11, 6, 4),
      new THREE.MeshStandardMaterial({ color: '#1c123d', flatShading: true, roughness: 1 }),
    );
    const pos = under.geometry.attributes.position as THREE.BufferAttribute;
    const rand = seededRandom(42);
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) < 5.4) {
        pos.setX(i, pos.getX(i) * (0.8 + rand() * 0.4));
        pos.setZ(i, pos.getZ(i) * (0.8 + rand() * 0.4));
      }
    }
    under.geometry.computeVertexNormals();
    under.rotation.x = Math.PI;
    under.position.y = -6.1;
    this.scene.add(under);

    // Central crystal cluster
    const core = new THREE.Group();
    const coreMat = gemMaterial('#b69cff', 0.5);
    for (let i = 0; i < 7; i++) {
      const h = 1 + rand() * 1.8;
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.28 + rand() * 0.2, h, 5), coreMat);
      const a = (i / 7) * Math.PI * 2;
      const off = i === 0 ? 0 : 0.5;
      m.position.set(Math.cos(a) * off, h / 2, Math.sin(a) * off);
      m.rotation.set((rand() - 0.5) * 0.6, rand(), (rand() - 0.5) * 0.6);
      m.castShadow = true;
      core.add(m);
    }
    this.scene.add(core);
    const coreLight = new THREE.PointLight('#b69cff', 20, 10, 2);
    coreLight.position.y = 2.4;
    this.scene.add(coreLight);

    // Distant floating islets
    const isletGeo = new THREE.ConeGeometry(1, 2, 5);
    const isletMat = new THREE.MeshStandardMaterial({ color: '#5a3fa8', emissive: '#2a1466', emissiveIntensity: 0.6, flatShading: true });
    for (let i = 0; i < 18; i++) {
      const m = new THREE.Mesh(isletGeo, isletMat);
      const a = rand() * Math.PI * 2;
      const d = 22 + rand() * 40;
      m.position.set(Math.cos(a) * d, -4 + rand() * 14, Math.sin(a) * d);
      m.rotation.x = Math.PI;
      m.scale.setScalar(0.6 + rand() * 2.5);
      m.userData.phase = rand() * 10;
      m.name = 'islet';
      this.scene.add(m);
    }
  }

  private buildPedestals() {
    const colGeo = new THREE.CylinderGeometry(0.9, 1.1, 1.6, 6);
    const colMat = new THREE.MeshStandardMaterial({ color: '#3a2a78', roughness: 0.4, metalness: 0.3, flatShading: true });
    const shardGeo = new THREE.TetrahedronGeometry(0.14, 0);

    this.games.forEach((game, i) => {
      const group = new THREE.Group();
      const a = -(i / this.games.length) * Math.PI * 2;
      group.position.set(Math.sin(a) * RADIUS, 0, Math.cos(a) * RADIUS);
      group.userData.index = i;

      const col = new THREE.Mesh(colGeo, colMat);
      col.position.y = 0.8;
      col.castShadow = true;
      col.receiveShadow = true;
      const trim = new THREE.MeshStandardMaterial({ color: game.color, emissive: game.color, emissiveIntensity: 0.8 });
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.12, 6), trim);
      band.position.y = 1.45;
      const baseBand = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.12, 0.08, 6), trim);
      baseBand.position.y = 0.06;

      const gem = new THREE.Mesh(gemGeometry(GEM_SHAPES[i % GEM_SHAPES.length], 0.85), gemMaterial(game.color, 0.45));
      gem.position.y = 2.9;
      gem.castShadow = true;
      gem.userData.index = i;

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(1.25, 0.03, 8, 64),
        new THREE.MeshBasicMaterial({ color: game.color, transparent: true, opacity: 0.8 }),
      );
      halo.position.y = 2.9;
      halo.rotation.x = Math.PI / 2;

      const orbiters = new THREE.Group();
      orbiters.position.y = 2.9;
      const shardMat = gemMaterial(game.color, 0.9);
      for (let k = 0; k < 6; k++) {
        const s = new THREE.Mesh(shardGeo, shardMat);
        const oa = (k / 6) * Math.PI * 2;
        s.position.set(Math.cos(oa) * 1.6, Math.sin(oa * 2) * 0.3, Math.sin(oa) * 1.6);
        orbiters.add(s);
      }

      const light = new THREE.PointLight(game.color, 10, 7, 2);
      light.position.y = 2.9;

      group.add(col, band, baseBand, gem, halo, orbiters, light);
      this.carousel.add(group);
      this.pedestals.push({ group, gem, halo, light, orbiters, trim });
    });
  }

  private buildMotes(): THREE.Points {
    const count = 300;
    const rand = seededRandom(8);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const r = 2 + rand() * 12;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = rand() * 8;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: '#ffd9ff', size: 0.06, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
  }

  /** Carousel rotation that brings pedestal `i` to the front (+z, toward camera). */
  private angleFor(i: number) {
    return (i / this.games.length) * Math.PI * 2;
  }

  select(i: number) {
    const n = this.games.length;
    const next = ((i % n) + n) % n;
    // Rotate the short way round by accumulating deltas instead of snapping.
    let delta = this.angleFor(next) - this.angleFor(this.selected);
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    this.carouselAngle += delta;
    this.selected = next;
    this.cb.onSelect(next);
  }

  play(i = this.selected) {
    if (this.launch) return;
    if (i !== this.selected) this.select(i);
    this.launch = { index: i, t: 0, from: this.camera.position.clone() };
    this.cb.onLaunch(i);
  }

  private onAction = (a: Action) => {
    if (this.launch) return;
    if (a === 'left') this.select(this.selected - 1);
    else if (a === 'right') this.select(this.selected + 1);
    else if (a === 'confirm') this.play();
    else if (a === 'back') this.cb.onBack();
  };

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    this.hovered = this.pick();
    this.canvas.style.cursor = this.hovered >= 0 ? 'pointer' : 'default';
  };

  private onClick = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    const hit = this.pick();
    if (hit < 0 || this.launch) return;
    if (hit === this.selected) this.play(hit);
    else this.select(hit);
  };

  private pick(): number {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hits = this.raycaster.intersectObjects(this.pedestals.map((p) => p.group), true);
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object;
      while (o && o.userData.index === undefined) o = o.parent;
      if (o) return o.userData.index as number;
    }
    return -1;
  }

  resize(w: number, h: number) {
    this.aspect = w / h;
  }

  update(dt: number, elapsed: number) {
    this.intro = Math.min(1, this.intro + dt * 0.8);
    this.carousel.rotation.y = damp(this.carousel.rotation.y, this.carouselAngle, 6, dt);

    this.pedestals.forEach((p, i) => {
      const active = i === this.selected;
      const hover = i === this.hovered;
      const s = damp(p.gem.scale.x, active ? 1.25 : hover ? 1.05 : 0.85, 8, dt);
      p.gem.scale.setScalar(s);
      p.gem.rotation.y += dt * (active ? 1.6 : 0.5);
      p.gem.rotation.x = Math.sin(elapsed * 0.7 + i) * 0.25;
      p.gem.position.y = 2.9 + Math.sin(elapsed * 1.6 + i * 2) * 0.15;
      p.halo.position.y = p.gem.position.y;
      p.halo.rotation.z = elapsed * 0.6;
      p.halo.scale.setScalar(damp(p.halo.scale.x, active ? 1 : 0.7, 6, dt));
      (p.halo.material as THREE.MeshBasicMaterial).opacity = active ? 0.85 : 0.25;
      p.orbiters.position.y = p.gem.position.y;
      p.orbiters.rotation.y = elapsed * (active ? 1.4 : 0.4);
      p.orbiters.visible = active || hover;
      p.light.intensity = damp(p.light.intensity, active ? 22 : 4, 6, dt);
      p.trim.emissiveIntensity = active ? 1.4 + Math.sin(elapsed * 4) * 0.3 : 0.5;
    });

    this.motes.rotation.y = elapsed * 0.03;
    this.scene.traverse((o) => {
      if (o.name === 'islet') o.position.y += Math.sin(elapsed * 0.5 + (o.userData.phase as number)) * dt * 0.25;
    });

    // Camera: gentle parallax, pulled back on narrow screens.
    const back = this.aspect < 0.8 ? 1.6 : this.aspect < 1.2 ? 1.25 : 1;
    const introEase = 1 - Math.pow(1 - this.intro, 3);
    const base = new THREE.Vector3(
      this.pointer.x * 0.8,
      5 + this.pointer.y * 0.4 + (1 - introEase) * 6,
      (13 + (1 - introEase) * 10) * back,
    );
    if (this.launch) {
      this.launch.t += dt;
      const t = Math.min(1, this.launch.t / LAUNCH_TIME);
      const ease = t * t * (3 - 2 * t);
      const gemWorld = this.pedestals[this.launch.index].gem.getWorldPosition(new THREE.Vector3());
      this.camera.position.lerpVectors(this.launch.from, gemWorld.clone().add(new THREE.Vector3(0, 0.2, 1.2)), ease);
      this.camera.lookAt(gemWorld);
      if (this.launch.t >= LAUNCH_TIME) {
        const idx = this.launch.index;
        this.launch = null;
        this.cb.onPlay(idx);
      }
      return;
    }
    this.camera.position.x = damp(this.camera.position.x, base.x, 3, dt);
    this.camera.position.y = damp(this.camera.position.y, base.y, 3, dt);
    this.camera.position.z = damp(this.camera.position.z, base.z, 3, dt);
    // Aim below the gems so they sit in the upper half, clear of the info card.
    this.camera.lookAt(0, -1, 0);
  }

  dispose() {
    this.unsub();
    this.canvas.removeEventListener('pointermove', this.onPointerMove);
    this.canvas.removeEventListener('click', this.onClick);
    this.canvas.style.cursor = 'default';
    disposeTree(this.scene);
  }
}
