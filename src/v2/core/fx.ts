import * as THREE from 'three';

interface Shard {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  spin: THREE.Vector3;
  life: number;
  max: number;
}

/** Tiny pooled burst system for sparkles, shatters and dust. */
export class Bursts {
  readonly group = new THREE.Group();
  private geo = new THREE.TetrahedronGeometry(0.12, 0);
  private shards: Shard[] = [];
  private gravity: number;

  constructor(gravity = 14) {
    this.gravity = gravity;
  }

  emit(at: THREE.Vector3, color: string, count = 14, speed = 6) {
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true });
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(this.geo, mat);
      mesh.position.copy(at);
      const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.9 + 0.2, Math.random() - 0.5).normalize();
      const max = 0.5 + Math.random() * 0.5;
      this.shards.push({
        mesh,
        vel: dir.multiplyScalar(speed * (0.5 + Math.random() * 0.7)),
        spin: new THREE.Vector3(Math.random() * 10, Math.random() * 10, Math.random() * 10),
        life: max,
        max,
      });
      this.group.add(mesh);
    }
  }

  update(dt: number) {
    for (let i = this.shards.length - 1; i >= 0; i--) {
      const s = this.shards[i];
      s.life -= dt;
      if (s.life <= 0) {
        this.group.remove(s.mesh);
        // The material is shared per burst; dispose once all its shards are gone.
        const mat = s.mesh.material as THREE.Material;
        if (!this.shards.some((o) => o !== s && o.mesh.material === mat)) mat.dispose();
        this.shards.splice(i, 1);
        continue;
      }
      s.vel.y -= this.gravity * dt;
      s.mesh.position.addScaledVector(s.vel, dt);
      s.mesh.rotation.x += s.spin.x * dt;
      s.mesh.rotation.y += s.spin.y * dt;
      s.mesh.scale.setScalar(s.life / s.max);
    }
  }

  dispose() {
    for (const s of this.shards) (s.mesh.material as THREE.Material).dispose();
    this.shards = [];
    this.geo.dispose();
  }
}
