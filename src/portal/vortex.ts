/**
 * Minimal raw-WebGL swirling vortex used by the V1 → V2 portal. Deliberately
 * independent of three.js so V1 doesn't load the 3D bundle until you jump.
 */
const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 res;
uniform vec2 origin;
uniform float t;
uniform float warp;
uniform vec3 c1;
uniform vec3 c2;
uniform vec3 c3;

float hash(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 43758.5453); }

void main() {
  vec2 uv = (gl_FragCoord.xy - origin) / min(res.x, res.y);
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float depth = 0.35 / (r + 0.04);
  float swirl = a * 3.0 + depth * (1.2 + warp * 2.0) - t * 3.0;
  float bands = sin(swirl * 2.0) * 0.5 + 0.5;
  float fine = sin(a * 12.0 + depth * 6.0 - t * 9.0) * 0.5 + 0.5;
  vec3 col = mix(c1, c2, bands);
  col = mix(col, c3, fine * 0.35);
  // Streaking star field rushing toward the centre.
  vec2 cell = vec2(floor(a * 24.0), floor(depth * 4.0 - t * (6.0 + warp * 20.0)));
  float star = step(0.93, hash(cell)) * smoothstep(0.0, 0.4, r);
  col += star * vec3(1.0);
  // Bright throat in the middle, dark rim at the edges.
  col += c3 * smoothstep(0.35, 0.0, r) * (1.2 + warp);
  col *= 0.55 + 0.6 * smoothstep(1.3, 0.1, r);
  gl_FragColor = vec4(col, 1.0);
}
`;

export interface Vortex {
  render(t: number, warp: number, originCss: { x: number; y: number }): void;
  resize(): void;
  dispose(): void;
}

function hex(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function createVortex(canvas: HTMLCanvasElement, colors: [string, string, string]): Vortex | null {
  const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = u('res');
  const uOrigin = u('origin');
  const uT = u('t');
  const uWarp = u('warp');
  gl.uniform3fv(u('c1'), hex(colors[0]));
  gl.uniform3fv(u('c2'), hex(colors[1]));
  gl.uniform3fv(u('c3'), hex(colors[2]));

  let dpr = 1;
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();

  return {
    render(t, warp, o) {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      // gl_FragCoord is bottom-up in device pixels.
      gl.uniform2f(uOrigin, o.x * dpr, canvas.height - o.y * dpr);
      gl.uniform1f(uT, t);
      gl.uniform1f(uWarp, warp);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    resize,
    dispose() {
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
