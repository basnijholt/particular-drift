var D = Object.defineProperty;
var I = (t, e, r) => e in t ? D(t, e, { enumerable: !0, configurable: !0, writable: !0, value: r }) : t[e] = r;
var s = (t, e, r) => I(t, typeof e != "symbol" ? e + "" : e, r);
const C = {
  imageFit: "contain",
  particleCount: 12e4,
  particleSpeed: 12,
  attractionStrength: 85,
  particleOpacity: 0.22,
  particleSize: 0.85,
  edgeThreshold: 0.4,
  edgeSearchSteps: 2,
  flowFieldScale: 4,
  searchRadius: 0.02,
  noiseType: "2D",
  interactive: !0,
  cursorMode: "repel",
  cursorRadius: 0.12,
  cursorStrength: 1.4,
  cursorReturnStrength: 0.55,
  cursorReturnDamping: 0.82,
  backgroundColor: "#0f0d2e",
  particleColor: "#dda290",
  autoStart: !0,
  maxDevicePixelRatio: 2
}, B = (t = {}) => ({
  ...C,
  ...t
}), _ = (t) => {
  const e = t.trim().replace(/^#/, ""), r = e.length === 3 ? e.split("").map((n) => `${n}${n}`).join("") : e;
  if (!/^[0-9a-f]{6}$/i.test(r))
    throw new Error(`Invalid hex color: ${t}`);
  return [
    Number.parseInt(r.slice(0, 2), 16) / 255,
    Number.parseInt(r.slice(2, 4), 16) / 255,
    Number.parseInt(r.slice(4, 6), 16) / 255
  ];
}, z = ({
  cssWidth: t,
  cssHeight: e,
  devicePixelRatio: r = globalThis.devicePixelRatio ?? 1,
  maxDevicePixelRatio: n = C.maxDevicePixelRatio
}) => {
  const i = Math.max(1, Math.min(r, n));
  return {
    width: Math.max(1, Math.floor(t * i)),
    height: Math.max(1, Math.floor(e * i))
  };
}, N = ({
  clientX: t,
  clientY: e,
  rect: r
}) => {
  if (r.width <= 0 || r.height <= 0)
    return { x: 0, y: 0, active: !1 };
  const n = (t - r.left) / r.width, i = (e - r.top) / r.height, a = 1 - i;
  return {
    x: Math.min(1, Math.max(0, n)),
    y: Math.min(1, Math.max(0, a)),
    active: n >= 0 && n <= 1 && i >= 0 && i <= 1
  };
}, M = ({
  fit: t,
  canvasWidth: e,
  canvasHeight: r,
  imageWidth: n,
  imageHeight: i
}) => {
  if (t === "stretch" || e <= 0 || r <= 0 || n <= 0 || i <= 0)
    return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };
  const a = e / r, o = n / i;
  if (a > o) {
    const l = o / a;
    return {
      scaleX: l,
      scaleY: 1,
      offsetX: (1 - l) / 2,
      offsetY: 0
    };
  }
  const c = a / o;
  return {
    scaleX: 1,
    scaleY: c,
    offsetX: 0,
    offsetY: (1 - c) / 2
  };
};
class O {
  constructor(e) {
    s(this, "currentProgram", null);
    s(this, "currentVao", null);
    s(this, "currentFramebuffer", null);
    this.gl = e, e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, !0);
  }
  useProgram(e) {
    this.currentProgram !== e && (this.gl.useProgram(e), this.currentProgram = e);
  }
  bindVao(e) {
    this.currentVao !== e && (this.gl.bindVertexArray(e), this.currentVao = e);
  }
  bindFramebuffer(e) {
    this.currentFramebuffer !== e && (this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, e), this.currentFramebuffer = e);
  }
  setViewport(e, r) {
    this.gl.viewport(0, 0, e, r);
  }
  setClearColor(e) {
    this.gl.clearColor(e[0], e[1], e[2], 1);
  }
  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
}
const Z = () => {
  if (typeof document > "u") return !1;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return !1;
  }
}, P = (t, e, r) => {
  const n = t.createShader(e);
  if (!n)
    throw new Error("Unable to create WebGL shader.");
  if (t.shaderSource(n, r), t.compileShader(n), !t.getShaderParameter(n, t.COMPILE_STATUS)) {
    const i = t.getShaderInfoLog(n) ?? "Unknown shader compile error.";
    throw t.deleteShader(n), new Error(i);
  }
  return n;
}, b = (t, e, r, n) => {
  const i = P(t, t.VERTEX_SHADER, e), a = P(t, t.FRAGMENT_SHADER, r), o = t.createProgram();
  if (!o)
    throw new Error("Unable to create WebGL program.");
  if (t.attachShader(o, i), t.attachShader(o, a), n && t.transformFeedbackVaryings(o, n, t.SEPARATE_ATTRIBS), t.linkProgram(o), t.deleteShader(i), t.deleteShader(a), !t.getProgramParameter(o, t.LINK_STATUS)) {
    const c = t.getProgramInfoLog(o) ?? "Unknown program link error.";
    throw t.deleteProgram(o), new Error(c);
  }
  return o;
}, g = (t, e, r = t.DYNAMIC_COPY) => {
  const n = t.createBuffer();
  if (!n)
    throw new Error("Unable to create WebGL buffer.");
  return t.bindBuffer(t.ARRAY_BUFFER, n), t.bufferData(t.ARRAY_BUFFER, e, r), t.bindBuffer(t.ARRAY_BUFFER, null), n;
}, A = (t, {
  width: e,
  height: r,
  data: n = null,
  internalFormat: i = t.RGBA,
  format: a = t.RGBA,
  type: o = t.UNSIGNED_BYTE,
  minFilter: c = t.LINEAR,
  magFilter: l = t.LINEAR,
  wrap: u = t.CLAMP_TO_EDGE
}) => {
  const f = t.createTexture();
  if (!f)
    throw new Error("Unable to create WebGL texture.");
  return t.bindTexture(t.TEXTURE_2D, f), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, c), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, l), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, u), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, u), e && r ? t.texImage2D(t.TEXTURE_2D, 0, i, e, r, 0, a, o, null) : n && t.texImage2D(t.TEXTURE_2D, 0, i, a, o, n), t.bindTexture(t.TEXTURE_2D, null), f;
}, U = (t) => new Promise((e, r) => {
  const n = new Image();
  n.crossOrigin = "anonymous", n.onload = () => e(n), n.onerror = () => r(new Error(`Failed to load image: ${t}`)), n.src = t;
}), L = ["uResolution", "uImageScale", "uImageOffset", "threshold", "uImage"], V = [
  "deltaTime",
  "resolution",
  "particleSpeed",
  "attractionStrength",
  "searchRadius",
  "edgeSearchSteps",
  "time",
  "noiseSeed",
  "flowFieldScale",
  "use3DNoise",
  "cursorPosition",
  "cursorActive",
  "cursorRadius",
  "cursorStrength",
  "cursorDirection",
  "cursorReturnStrength",
  "cursorReturnDamping",
  "edgeTexture"
], X = ["uParticleColor", "uParticleOpacity", "particleSize"], y = (t, e, r) => Object.fromEntries(r.map((n) => [n, t.getUniformLocation(e, n)])), k = (t) => "displayWidth" in t && "displayHeight" in t ? { width: t.displayWidth, height: t.displayHeight } : "videoWidth" in t && "videoHeight" in t ? { width: t.videoWidth, height: t.videoHeight } : { width: t.width, height: t.height };
class G {
  constructor(e, r, n, i) {
    s(this, "transformFeedback");
    s(this, "edgeFramebuffer");
    s(this, "edgeTexture");
    s(this, "quadBuffer");
    s(this, "edgeVao");
    s(this, "positionBuffers");
    s(this, "velocityBuffers");
    s(this, "targetBuffers");
    s(this, "vaos");
    s(this, "edgeUniforms");
    s(this, "updateUniforms");
    s(this, "particleUniforms");
    s(this, "particleColor");
    s(this, "currentIndex", 0);
    s(this, "time", 0);
    s(this, "noiseSeed", Math.random() * 1e3);
    this.gl = e, this.glState = r, this.programs = n, this.options = i;
    const a = e.createTransformFeedback(), o = e.createFramebuffer(), c = e.createVertexArray();
    if (!a || !o || !c)
      throw new Error("Unable to initialize WebGL particle resources.");
    this.transformFeedback = a, this.edgeFramebuffer = o, this.edgeVao = c, this.edgeUniforms = y(e, n.edge, L), this.updateUniforms = y(e, n.update, V), this.particleUniforms = y(e, n.particle, X), this.particleColor = _(i.particleColor), this.edgeTexture = A(e, {
      width: e.canvas.width,
      height: e.canvas.height
    }), this.quadBuffer = g(
      e,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      e.STATIC_DRAW
    );
    const l = new Float32Array(i.particleCount * 2), u = new Float32Array(i.particleCount * 2), f = new Float32Array(i.particleCount * 2);
    for (let p = 0; p < i.particleCount; p += 1) {
      const h = p * 2;
      l[h] = Math.random(), l[h + 1] = Math.random(), u[h] = (Math.random() - 0.5) * 1e-3, u[h + 1] = (Math.random() - 0.5) * 1e-3, f[h] = -1, f[h + 1] = -1;
    }
    this.positionBuffers = [g(e, l), g(e, l)], this.velocityBuffers = [g(e, u), g(e, u)], this.targetBuffers = [g(e, f), g(e, f)], this.vaos = [this.createParticleVao(0), this.createParticleVao(1)], this.configureEdgeVao(), this.configureEdgeFramebuffer(), this.configureStaticUniforms();
  }
  processImage(e) {
    const r = A(this.gl, { data: e }), n = k(e), i = M({
      fit: this.options.imageFit,
      canvasWidth: this.gl.canvas.width,
      canvasHeight: this.gl.canvas.height,
      imageWidth: n.width,
      imageHeight: n.height
    });
    this.glState.bindFramebuffer(this.edgeFramebuffer), this.glState.setViewport(this.gl.canvas.width, this.gl.canvas.height), this.glState.useProgram(this.programs.edge), this.gl.uniform2f(this.edgeUniforms.uResolution, this.gl.canvas.width, this.gl.canvas.height), this.gl.uniform2f(this.edgeUniforms.uImageScale, i.scaleX, i.scaleY), this.gl.uniform2f(this.edgeUniforms.uImageOffset, i.offsetX, i.offsetY), this.gl.uniform1f(this.edgeUniforms.threshold, this.options.edgeThreshold), this.gl.activeTexture(this.gl.TEXTURE0), this.gl.bindTexture(this.gl.TEXTURE_2D, r), this.gl.uniform1i(this.edgeUniforms.uImage, 0), this.glState.bindVao(this.edgeVao), this.gl.drawArrays(this.gl.TRIANGLES, 0, 6), this.gl.deleteTexture(r), this.glState.bindFramebuffer(null);
  }
  update(e, r) {
    this.time += e * 1e-3;
    const n = this.gl;
    this.glState.useProgram(this.programs.update), n.uniform1f(this.updateUniforms.deltaTime, e * 1e-3), n.uniform2f(this.updateUniforms.resolution, n.canvas.width, n.canvas.height), n.uniform1f(this.updateUniforms.time, this.time), n.uniform2f(this.updateUniforms.cursorPosition, r.x, r.y), n.uniform1i(this.updateUniforms.cursorActive, this.options.interactive && r.active ? 1 : 0), n.activeTexture(n.TEXTURE0), n.bindTexture(n.TEXTURE_2D, this.edgeTexture), this.glState.bindVao(this.vaos[this.currentIndex]), n.bindTransformFeedback(n.TRANSFORM_FEEDBACK, this.transformFeedback), n.bindBufferBase(n.TRANSFORM_FEEDBACK_BUFFER, 0, this.positionBuffers[1 - this.currentIndex]), n.bindBufferBase(n.TRANSFORM_FEEDBACK_BUFFER, 1, this.velocityBuffers[1 - this.currentIndex]), n.bindBufferBase(n.TRANSFORM_FEEDBACK_BUFFER, 2, this.targetBuffers[1 - this.currentIndex]), n.enable(n.RASTERIZER_DISCARD), n.beginTransformFeedback(n.POINTS), n.drawArrays(n.POINTS, 0, this.options.particleCount), n.endTransformFeedback(), n.disable(n.RASTERIZER_DISCARD), n.bindTransformFeedback(n.TRANSFORM_FEEDBACK, null), n.bindBufferBase(n.TRANSFORM_FEEDBACK_BUFFER, 0, null), n.bindBufferBase(n.TRANSFORM_FEEDBACK_BUFFER, 1, null), n.bindBufferBase(n.TRANSFORM_FEEDBACK_BUFFER, 2, null), this.currentIndex = 1 - this.currentIndex;
  }
  render() {
    const e = this.gl;
    this.glState.useProgram(this.programs.particle), this.glState.bindVao(this.vaos[this.currentIndex]), e.enable(e.BLEND), e.blendFunc(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA), e.drawArrays(e.POINTS, 0, this.options.particleCount), e.disable(e.BLEND);
  }
  dispose() {
    const e = this.gl;
    e.deleteTransformFeedback(this.transformFeedback), e.deleteFramebuffer(this.edgeFramebuffer), e.deleteTexture(this.edgeTexture), e.deleteBuffer(this.quadBuffer), this.positionBuffers.forEach((r) => e.deleteBuffer(r)), this.velocityBuffers.forEach((r) => e.deleteBuffer(r)), this.targetBuffers.forEach((r) => e.deleteBuffer(r)), e.deleteVertexArray(this.edgeVao), this.vaos.forEach((r) => e.deleteVertexArray(r));
  }
  configureEdgeFramebuffer() {
    if (this.glState.bindFramebuffer(this.edgeFramebuffer), this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      this.edgeTexture,
      0
    ), this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE)
      throw new Error("Edge framebuffer is not complete.");
    this.glState.bindFramebuffer(null);
  }
  configureStaticUniforms() {
    const e = this.gl, [r, n, i] = this.particleColor;
    this.glState.useProgram(this.programs.update), e.uniform1f(this.updateUniforms.particleSpeed, this.options.particleSpeed), e.uniform1f(this.updateUniforms.attractionStrength, this.options.attractionStrength), e.uniform1f(this.updateUniforms.searchRadius, this.options.searchRadius), e.uniform1i(this.updateUniforms.edgeSearchSteps, this.options.edgeSearchSteps), e.uniform1f(this.updateUniforms.noiseSeed, this.noiseSeed), e.uniform1f(this.updateUniforms.flowFieldScale, this.options.flowFieldScale), e.uniform1i(this.updateUniforms.use3DNoise, this.options.noiseType === "3D" ? 1 : 0), e.uniform1f(this.updateUniforms.cursorRadius, this.options.cursorRadius), e.uniform1f(this.updateUniforms.cursorStrength, this.options.cursorStrength), e.uniform1f(this.updateUniforms.cursorDirection, this.options.cursorMode === "attract" ? 1 : -1), e.uniform1f(this.updateUniforms.cursorReturnStrength, this.options.cursorReturnStrength), e.uniform1f(this.updateUniforms.cursorReturnDamping, this.options.cursorReturnDamping), e.uniform1i(this.updateUniforms.edgeTexture, 0), this.glState.useProgram(this.programs.particle), e.uniform3f(this.particleUniforms.uParticleColor, r, n, i), e.uniform1f(this.particleUniforms.uParticleOpacity, this.options.particleOpacity), e.uniform1f(this.particleUniforms.particleSize, this.options.particleSize);
  }
  configureEdgeVao() {
    this.glState.bindVao(this.edgeVao), this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadBuffer);
    const e = this.gl.getAttribLocation(this.programs.edge, "aPosition");
    this.gl.enableVertexAttribArray(e), this.gl.vertexAttribPointer(e, 2, this.gl.FLOAT, !1, 0, 0);
  }
  createParticleVao(e) {
    const r = this.gl.createVertexArray();
    if (!r)
      throw new Error("Unable to create particle VAO.");
    return this.glState.bindVao(r), this.bindParticleAttribute(this.positionBuffers[e], 0), this.bindParticleAttribute(this.velocityBuffers[e], 1), this.bindParticleAttribute(this.targetBuffers[e], 2), r;
  }
  bindParticleAttribute(e, r) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, e), this.gl.enableVertexAttribArray(r), this.gl.vertexAttribPointer(r, 2, this.gl.FLOAT, !1, 0, 0);
  }
}
const Y = `#version 300 es
precision highp float;

in vec2 vTexCoord;
uniform sampler2D uImage;
uniform vec2 uResolution;
uniform vec2 uImageScale;
uniform vec2 uImageOffset;
uniform float threshold;
out vec4 fragColor;

vec3 sampleImage(vec2 canvasCoord) {
    vec2 imageCoord = (canvasCoord - uImageOffset) / uImageScale;
    if (imageCoord.x < 0.0 || imageCoord.x > 1.0 || imageCoord.y < 0.0 || imageCoord.y > 1.0) {
        return vec3(0.0);
    }

    return texture(uImage, imageCoord).rgb;
}

void main() {
    vec2 texel = 1.0 / uResolution;
    vec2 tc = vTexCoord;
    
    vec3 tl = sampleImage(tc + texel * vec2(-1, -1));
    vec3 t  = sampleImage(tc + texel * vec2( 0, -1));
    vec3 tr = sampleImage(tc + texel * vec2( 1, -1));
    vec3 l  = sampleImage(tc + texel * vec2(-1,  0));
    vec3 c  = sampleImage(tc);
    vec3 r  = sampleImage(tc + texel * vec2( 1,  0));
    vec3 bl = sampleImage(tc + texel * vec2(-1,  1));
    vec3 b  = sampleImage(tc + texel * vec2( 0,  1));
    vec3 br = sampleImage(tc + texel * vec2( 1,  1));

    vec3 gx = -tl - 2.0 * l - bl + tr + 2.0 * r + br;
    vec3 gy = -tl - 2.0 * t - tr + bl + 2.0 * b + br;
    
    float edge = length(gx) + length(gy);
    edge = edge > threshold ? 1.0 : 0.0;
    
    fragColor = vec4(edge, edge, edge, 1.0);
}
`, H = `#version 300 es
in vec2 aPosition;
out vec2 vTexCoord;

void main() {
    vTexCoord = vec2(aPosition.x * 0.5 + 0.5, (aPosition.y * 0.5 + 0.5));
    gl_Position = vec4(aPosition, 0.0, 1.0);
}`, W = `#version 300 es
precision highp float;

in vec2 vPosition;
uniform vec3 uParticleColor;
uniform float uParticleOpacity;

out vec4 fragColor;

void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    fragColor = vec4(uParticleColor, uParticleOpacity);
}`, q = `#version 300 es
layout(location = 0) in vec2 position;
layout(location = 1) in vec2 velocity;
layout(location = 2) in vec2 target;

uniform float particleSize;

out vec2 vPosition;
out vec2 vVelocity;
out vec2 vTarget;

void main() {
    vPosition = position;
    vVelocity = velocity;
    vTarget = target;
    gl_Position = vec4(position * 2.0 - 1.0, 0, 1);
    gl_PointSize = 2.0 * particleSize;
}
`, K = `#version 300 es
precision highp float;
out vec4 fragColor;
void main() {
    fragColor = vec4(0.0);
}`, j = `#version 300 es

// Input attributes from vertex buffers
layout(location = 0) in vec2 position;    // Current particle position (normalized 0-1)
layout(location = 1) in vec2 velocity;    // Current particle velocity
layout(location = 2) in vec2 target;      // Target position for edge tracking

// Output varyings for transform feedback
out vec2 vPosition;  // Updated particle position
out vec2 vVelocity;  // Updated particle velocity
out vec2 vTarget;    // Updated target position

// Uniform inputs
uniform sampler2D edgeTexture;      // Edge detection result texture
uniform float deltaTime;            // Time since last frame in seconds
uniform vec2 resolution;            // Canvas resolution
uniform float particleSpeed;        // Base speed multiplier for particles
uniform float searchRadius;         // Radius for searching nearby edges
uniform int edgeSearchSteps;        // Number of texels to search in each grid direction
uniform float attractionStrength;   // Strength of edge attraction
uniform float time;                 // Global time for animation
uniform float noiseSeed;            // Random seed for Perlin noise
uniform float flowFieldScale;      // Scale factor for the flow field
uniform bool use3DNoise;        // Whether to use 3D noise instead of 2D
uniform vec2 cursorPosition;        // Cursor position in normalized particle coordinates
uniform bool cursorActive;          // Whether cursor force should be applied
uniform float cursorRadius;         // Cursor influence radius in normalized coordinates
uniform float cursorStrength;       // Cursor force multiplier
uniform float cursorDirection;      // -1 repels from cursor, 1 attracts toward cursor
uniform float cursorReturnStrength; // Strength of return force toward stored target
uniform float cursorReturnDamping;  // Velocity damping while particles settle back

const int MAX_EDGE_SEARCH_STEPS = 3;

/**
 * Generate a pseudo-random number in range [0,1] based on a 2D coordinate
 * Uses a common GLSL hash function based on sine and dot product
 */
float rand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// Hash function for Perlin noise
vec2 hash22(vec2 p) {
    // Add seed to input
    p += vec2(noiseSeed * 0.1234, noiseSeed * 0.5678);
    vec3 p3 = fract(vec3(p.xyx) * vec3(.1031, .1030, .0973));
    p3 += dot(p3, p3.yzx+33.33);
    return fract((p3.xx+p3.yz)*p3.zy);
}

// 2D Perlin noise implementation
float perlinNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    // Quintic interpolation
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    
    // Get random vectors at corners
    vec2 ga = hash22(i + vec2(0.0, 0.0)) * 2.0 - 1.0;
    vec2 gb = hash22(i + vec2(1.0, 0.0)) * 2.0 - 1.0;
    vec2 gc = hash22(i + vec2(0.0, 1.0)) * 2.0 - 1.0;
    vec2 gd = hash22(i + vec2(1.0, 1.0)) * 2.0 - 1.0;
    
    // Calculate dot products
    float va = dot(ga, f - vec2(0.0, 0.0));
    float vb = dot(gb, f - vec2(1.0, 0.0));
    float vc = dot(gc, f - vec2(0.0, 1.0));
    float vd = dot(gd, f - vec2(1.0, 1.0));
    
    // Interpolate
    return va + 
           u.x * (vb - va) + 
           u.y * (vc - va) + 
           u.x * u.y * (va - vb - vc + vd);
}

// 3D Simplex noise implementation
vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float simplexNoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    // Permutations
    i = mod289(i);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    // Gradients
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

/**
 * Generate a procedural flow field vector based on position and time using Perlin noise
 * Creates a more organic, natural-looking flow field for particle movement
 * @param position - Normalized position in [0,1] range
 * @param time - Global animation time
 * @return vec2 - Direction vector for the flow field
 */
vec2 flowField(vec2 position, float time) {
    float scale = flowFieldScale;  // Controls the spatial frequency of the field
    vec2 scaledPos = position * scale;
    
    vec2 flow;
    if (use3DNoise) {
        // Use 3D simplex noise with time as third dimension
        float noiseX = simplexNoise(vec3(scaledPos.x, scaledPos.y, time * 0.1));
        float noiseY = simplexNoise(vec3(scaledPos.x, scaledPos.y, time * 0.1 + 100.0));
        flow = vec2(noiseX, noiseY);
    } else {
        // Use original 2D Perlin noise
        float noiseX = perlinNoise(scaledPos + vec2(time * 0.1, 0.0));
        float noiseY = perlinNoise(scaledPos + vec2(0.0, time * 0.1));
        flow = vec2(noiseX, noiseY);
    }
    
    // Normalize the flow vector to ensure consistent speed
    return normalize(flow);
}

void main() {
    // Initialize working variables with current particle state
    vec2 pos = position;
    vec2 vel = velocity;
    vec2 tgt = target;
    
    // Sample edge detection texture and calculate flow field
    vec4 edge = texture(edgeTexture, pos);
    vec2 flow = flowField(pos, time) * particleSpeed * 0.001 * 2.0;
    
    // Edge interaction logic
    if (edge.r > 0.3) {  // Particle is on a significant edge
        float edgeStrength = smoothstep(0.3, 1.0, edge.r);
        float baseStickiness = attractionStrength * 0.01;
        
        // Calculate probability of sticking to edge based on strength
        float stickiness = mix(baseStickiness * 1.0, 0.98, edgeStrength * edgeStrength);
        
        // Determine if particle should detach from edge
        if (stickiness < 0.3 || edgeStrength < 0.3 || rand(pos * 1.0 + time * 1.0) > (stickiness*0.80)) {
            // Particle detaches: boost flow influence while keeping its last valid return target
            vel = mix(flow * 1.2, vel * 0.9, stickiness);
        } else {
            // Increase dampening range for stronger velocity reduction
            float dampening = mix(0.3, 0.97, edgeStrength);

            // Apply exponential dampening based on particle speed
            float speedFactor = length(vel) / (particleSpeed * 0.001);
            float adaptiveDampening = dampening * (1.0 - smoothstep(0.0, 2.0, speedFactor));
            vel *= mix(adaptiveDampening, 0.9, stickiness);

            // Reduce flow influence more aggressively
            float flowReduction = (1.0 - stickiness * 0.97) * (1.0 - pow(edgeStrength, 2.0));
            vel += flow * flowReduction * smoothstep(1.0, 0.0, speedFactor);
            tgt = pos;  // Current position becomes target
        }
    } else {  // Particle is in free space
        // Search for nearby edges within a limited radius
        float closestDist = searchRadius;
        vec2 closestEdge = pos;
        bool foundEdge = false;
        
        // Grid search for nearby strong edges. The loop remains bounded for predictable shader compilation,
        // while edgeSearchSteps controls how many texture samples are taken at runtime.
        int boundedEdgeSearchSteps = clamp(edgeSearchSteps, 1, MAX_EDGE_SEARCH_STEPS);
        for (int y = -MAX_EDGE_SEARCH_STEPS; y <= MAX_EDGE_SEARCH_STEPS; y += 1) {
            for (int x = -MAX_EDGE_SEARCH_STEPS; x <= MAX_EDGE_SEARCH_STEPS; x += 1) {
                if (abs(x) > boundedEdgeSearchSteps || abs(y) > boundedEdgeSearchSteps) continue;

                vec2 offset = vec2(float(x), float(y)) / resolution;
                vec2 samplePos = pos + offset;
                
                // Skip if sample position is outside texture bounds
                if (samplePos.x < 0.0 || samplePos.x > 1.0 || 
                    samplePos.y < 0.0 || samplePos.y > 1.0) continue;
                
                // Check for strong edges (threshold 0.85)
                vec4 sampleEdge = texture(edgeTexture, samplePos);
                if (sampleEdge.r > 0.85) {
                    float dist = length(offset);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestEdge = samplePos;
                        foundEdge = true;
                    }
                }
            }
        }
        
        // Update velocity based on nearest edge or flow field
        if (foundEdge) {
            vec2 toEdge = normalize(closestEdge - pos);
            vec2 edgeForce = toEdge * particleSpeed * 0.0005;
            float edgeInfluence = smoothstep(10.0, 35.0, attractionStrength) * 0.90;
            vel = mix(flow * 1.2, edgeForce, edgeInfluence);
            tgt = closestEdge;
        } else {
            vel = flow;
        }
        
        // Maintain partial velocity from previous frame for smoother motion
        vel = mix(vel, velocity, 0.3);
    }
    
    float cursorFalloff = 0.0;

    if (cursorActive && cursorRadius > 0.0 && cursorStrength > 0.0) {
        vec2 toCursor = cursorPosition - pos;
        float cursorDistance = length(toCursor);
        cursorFalloff = smoothstep(cursorRadius, 0.0, cursorDistance);

        if (cursorFalloff > 0.0 && cursorDistance > 0.0001) {
            vec2 cursorForce = normalize(toCursor) *
                cursorDirection *
                cursorFalloff *
                cursorFalloff *
                cursorStrength *
                particleSpeed *
                0.004;
            vel += cursorForce;
        }
    }

    if (tgt.x >= 0.0 && tgt.y >= 0.0 && cursorReturnStrength > 0.0) {
        vec2 toTarget = tgt - pos;
        float targetDistance = length(toTarget);
        float returnInfluence = (1.0 - cursorFalloff) * smoothstep(0.001, 0.08, targetDistance);

        if (returnInfluence > 0.0) {
            vec2 returnForce = normalize(toTarget) *
                returnInfluence *
                cursorReturnStrength *
                particleSpeed *
                0.0015;
            vel = mix(vel + returnForce, returnForce, clamp(cursorReturnDamping, 0.0, 0.98) * returnInfluence);
        }
    }

    // Update position using velocity and delta time
    pos += vel * deltaTime;
    
    // Handle particles that move outside bounds
    if (pos.x < -0.1 || pos.x > 1.1 || pos.y < -0.1 || pos.y > 1.1) {
        // Reposition particle at opposite edge with random offset
        if (abs(pos.x - 0.5) > abs(pos.y - 0.5)) {
            pos.x = pos.x < 0.0 ? 1.0 : 0.0;
            pos.y = rand(vec2(pos.y, time));
        } else {
            pos.x = rand(vec2(pos.x, time));
            pos.y = pos.y < 0.0 ? 1.0 : 0.0;
        }
        vel = vec2(0.0);  // Reset velocity for repositioned particles
    }
    
    // Output updated particle state
    vPosition = pos;
    vVelocity = vel;
    vTarget = tgt;
}
`, v = {
  edge: {
    fragment: Y,
    vertex: H
  },
  particle: {
    fragment: W,
    vertex: q
  },
  update: {
    fragment: K,
    vertex: j
  }
}, Q = async (t, e = {}) => {
  const r = B(e), n = t.getContext("webgl2", {
    alpha: !1,
    antialias: !1,
    depth: !1,
    preserveDrawingBuffer: !1
  });
  if (!n)
    throw new Error("WebGL2 is required to run Particular Drift.");
  const i = new O(n), a = {
    edge: b(n, v.edge.vertex, v.edge.fragment),
    particle: b(n, v.particle.vertex, v.particle.fragment),
    update: b(n, v.update.vertex, v.update.fragment, [
      "vPosition",
      "vVelocity",
      "vTarget"
    ])
  };
  let o, c, l = 0, u = !1;
  const f = { x: 0.5, y: 0.5, active: !1 }, p = () => {
    const d = t.getBoundingClientRect(), { width: m, height: w } = z({
      cssWidth: d.width || t.clientWidth || 1,
      cssHeight: d.height || t.clientHeight || 1,
      maxDevicePixelRatio: r.maxDevicePixelRatio
    });
    (t.width !== m || t.height !== w) && (t.width = m, t.height = w), i.setViewport(t.width, t.height);
  }, h = () => {
    i.setClearColor(_(r.backgroundColor)), i.clear();
  }, R = (d) => {
    const m = N({
      clientX: d.clientX,
      clientY: d.clientY,
      rect: t.getBoundingClientRect()
    });
    f.x = m.x, f.y = m.y, f.active = m.active;
  }, x = () => {
    f.active = !1;
  }, S = () => {
    c !== void 0 && (cancelAnimationFrame(c), c = void 0), l = 0;
  }, T = (d) => {
    if (!o || u) return;
    const m = l ? d - l : 0;
    l = d, h(), o.update(m, f), o.render(), c = requestAnimationFrame(T);
  }, F = () => {
    c === void 0 && o && !u && (c = requestAnimationFrame(T));
  }, E = async (d) => {
    S(), o == null || o.dispose(), p(), h(), o = new G(n, i, a, r), o.processImage(d), r.autoStart && F();
  };
  return r.imageUrl ? await E(await U(r.imageUrl)) : (p(), h()), r.interactive && (t.addEventListener("pointermove", R, { passive: !0 }), t.addEventListener("pointerleave", x), t.addEventListener("pointercancel", x)), {
    loadImage: E,
    loadImageUrl: async (d) => E(await U(d)),
    resize: p,
    start: F,
    stop: S,
    destroy: () => {
      u = !0, S(), t.removeEventListener("pointermove", R), t.removeEventListener("pointerleave", x), t.removeEventListener("pointercancel", x), o == null || o.dispose(), Object.values(a).forEach((d) => n.deleteProgram(d));
    }
  };
};
export {
  C as DEFAULT_PARTICULAR_DRIFT_OPTIONS,
  Q as createParticularDrift,
  B as getResolvedOptions,
  _ as hexToRgbUnit,
  Z as isWebGL2Supported,
  z as resolveCanvasSize,
  N as resolveCursorPosition,
  M as resolveImageFit
};
