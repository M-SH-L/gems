import * as THREE from 'three';

/** Deterministic PRNG (mulberry32) so game logic is testable. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Large inverted sphere with a vertical gradient — cheap, pretty sky. */
export function createSky(top: string, bottom: string, radius = 400, low = -0.25, high = 0.7): THREE.Mesh {
  const geo = new THREE.SphereGeometry(radius, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: new THREE.Color(top) },
      bottom: { value: new THREE.Color(bottom) },
      low: { value: low },
      high: { value: high },
    },
    vertexShader: /* glsl */ `
      varying vec3 vPos;
      void main() {
        vPos = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 top;
      uniform vec3 bottom;
      uniform float low;
      uniform float high;
      varying vec3 vPos;
      void main() {
        float h = smoothstep(low, high, vPos.y);
        gl_FragColor = vec4(mix(bottom, top, h), 1.0);
      }
    `,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = -1;
  mesh.frustumCulled = false;
  return mesh;
}

export function createStars(count: number, radius: number, color = '#ffffff', seed = 7): THREE.Points {
  const rand = seededRandom(seed);
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = rand() * 2 - 1;
    const theta = rand() * Math.PI * 2;
    const r = radius * (0.85 + rand() * 0.15);
    const s = Math.sqrt(1 - u * u);
    pos[i * 3] = r * s * Math.cos(theta);
    pos[i * 3 + 1] = Math.abs(r * u) * 0.9 + 5;
    pos[i * 3 + 2] = r * s * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color,
    size: 1.4,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.85,
    fog: false,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

/** Standard key + fill + rim lighting rig used by every V2 scene. */
export function addLights(scene: THREE.Scene, opts: { key?: string; fill?: string; rim?: string; shadowSize?: number } = {}) {
  const hemi = new THREE.HemisphereLight(opts.fill ?? '#8fa4ff', '#1a1030', 1.1);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(opts.key ?? '#fff1e0', 2.2);
  key.position.set(8, 16, 10);
  key.castShadow = true;
  const s = opts.shadowSize ?? 14;
  key.shadow.camera.left = -s;
  key.shadow.camera.right = s;
  key.shadow.camera.top = s;
  key.shadow.camera.bottom = -s;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 60;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.bias = -0.0005;
  scene.add(key);
  scene.add(key.target);
  const rim = new THREE.DirectionalLight(opts.rim ?? '#c77dff', 1.2);
  rim.position.set(-10, 6, -12);
  scene.add(rim);
  return { hemi, key, rim };
}

export function gemGeometry(kind: 'octa' | 'ico' | 'dodeca', size: number) {
  switch (kind) {
    case 'octa':
      return new THREE.OctahedronGeometry(size, 0);
    case 'ico':
      return new THREE.IcosahedronGeometry(size, 0);
    case 'dodeca':
      return new THREE.DodecahedronGeometry(size, 0);
  }
}

export function gemMaterial(color: string, emissive = 0.35) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: emissive,
    metalness: 0.2,
    roughness: 0.15,
    flatShading: true,
  });
}

export const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));

/** Free GPU resources held by everything under `root`. */
export function disposeTree(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else mat?.dispose();
  });
}
