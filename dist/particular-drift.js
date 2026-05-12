var B = Object.defineProperty;
var I = (e, n, o) => n in e ? B(e, n, { enumerable: !0, configurable: !0, writable: !0, value: o }) : e[n] = o;
var f = (e, n, o) => I(e, typeof n != "symbol" ? n + "" : n, o);
const C = {
  imageFit: "contain",
  particleCount: 12e4,
  particleSpeed: 12,
  attractionStrength: 85,
  particleOpacity: 0.22,
  particleSize: 0.85,
  edgeThreshold: 0.4,
  flowFieldScale: 4,
  searchRadius: 0.02,
  noiseType: "2D",
  interactive: !0,
  cursorMode: "repel",
  cursorRadius: 0.12,
  cursorStrength: 1.4,
  backgroundColor: "#0f0d2e",
  particleColor: "#dda290",
  autoStart: !0,
  maxDevicePixelRatio: 2
}, D = (e = {}) => ({
  ...C,
  ...e
}), U = (e) => {
  const n = e.trim().replace(/^#/, ""), o = n.length === 3 ? n.split("").map((t) => `${t}${t}`).join("") : n;
  if (!/^[0-9a-f]{6}$/i.test(o))
    throw new Error(`Invalid hex color: ${e}`);
  return [
    Number.parseInt(o.slice(0, 2), 16) / 255,
    Number.parseInt(o.slice(2, 4), 16) / 255,
    Number.parseInt(o.slice(4, 6), 16) / 255
  ];
}, _ = ({
  cssWidth: e,
  cssHeight: n,
  devicePixelRatio: o = globalThis.devicePixelRatio ?? 1,
  maxDevicePixelRatio: t = C.maxDevicePixelRatio
}) => {
  const r = Math.max(1, Math.min(o, t));
  return {
    width: Math.max(1, Math.floor(e * r)),
    height: Math.max(1, Math.floor(n * r))
  };
}, L = ({
  clientX: e,
  clientY: n,
  rect: o
}) => {
  if (o.width <= 0 || o.height <= 0)
    return { x: 0, y: 0, active: !1 };
  const t = (e - o.left) / o.width, r = (n - o.top) / o.height, a = 1 - r;
  return {
    x: Math.min(1, Math.max(0, t)),
    y: Math.min(1, Math.max(0, a)),
    active: t >= 0 && t <= 1 && r >= 0 && r <= 1
  };
}, z = ({
  fit: e,
  canvasWidth: n,
  canvasHeight: o,
  imageWidth: t,
  imageHeight: r
}) => {
  if (e === "stretch" || n <= 0 || o <= 0 || t <= 0 || r <= 0)
    return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };
  const a = n / o, i = t / r;
  if (a > i) {
    const c = i / a;
    return {
      scaleX: c,
      scaleY: 1,
      offsetX: (1 - c) / 2,
      offsetY: 0
    };
  }
  const s = a / i;
  return {
    scaleX: 1,
    scaleY: s,
    offsetX: 0,
    offsetY: (1 - s) / 2
  };
};
class N {
  constructor(n) {
    f(this, "currentProgram", null);
    f(this, "currentVao", null);
    f(this, "currentFramebuffer", null);
    this.gl = n, n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL, !0);
  }
  useProgram(n) {
    this.currentProgram !== n && (this.gl.useProgram(n), this.currentProgram = n);
  }
  bindVao(n) {
    this.currentVao !== n && (this.gl.bindVertexArray(n), this.currentVao = n);
  }
  bindFramebuffer(n) {
    this.currentFramebuffer !== n && (this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, n), this.currentFramebuffer = n);
  }
  setViewport(n, o) {
    this.gl.viewport(0, 0, n, o);
  }
  setClearColor(n) {
    this.gl.clearColor(n[0], n[1], n[2], 1);
  }
  clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
}
const q = () => {
  if (typeof document > "u") return !1;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return !1;
  }
}, w = (e, n, o) => {
  const t = e.createShader(n);
  if (!t)
    throw new Error("Unable to create WebGL shader.");
  if (e.shaderSource(t, o), e.compileShader(t), !e.getShaderParameter(t, e.COMPILE_STATUS)) {
    const r = e.getShaderInfoLog(t) ?? "Unknown shader compile error.";
    throw e.deleteShader(t), new Error(r);
  }
  return t;
}, E = (e, n, o, t) => {
  const r = w(e, e.VERTEX_SHADER, n), a = w(e, e.FRAGMENT_SHADER, o), i = e.createProgram();
  if (!i)
    throw new Error("Unable to create WebGL program.");
  if (e.attachShader(i, r), e.attachShader(i, a), t && e.transformFeedbackVaryings(i, t, e.SEPARATE_ATTRIBS), e.linkProgram(i), e.deleteShader(r), e.deleteShader(a), !e.getProgramParameter(i, e.LINK_STATUS)) {
    const s = e.getProgramInfoLog(i) ?? "Unknown program link error.";
    throw e.deleteProgram(i), new Error(s);
  }
  return i;
}, p = (e, n, o = e.DYNAMIC_COPY) => {
  const t = e.createBuffer();
  if (!t)
    throw new Error("Unable to create WebGL buffer.");
  return e.bindBuffer(e.ARRAY_BUFFER, t), e.bufferData(e.ARRAY_BUFFER, n, o), e.bindBuffer(e.ARRAY_BUFFER, null), t;
}, P = (e, {
  width: n,
  height: o,
  data: t = null,
  internalFormat: r = e.RGBA,
  format: a = e.RGBA,
  type: i = e.UNSIGNED_BYTE,
  minFilter: s = e.LINEAR,
  magFilter: c = e.LINEAR,
  wrap: l = e.CLAMP_TO_EDGE
}) => {
  const d = e.createTexture();
  if (!d)
    throw new Error("Unable to create WebGL texture.");
  return e.bindTexture(e.TEXTURE_2D, d), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, s), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, c), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, l), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, l), n && o ? e.texImage2D(e.TEXTURE_2D, 0, r, n, o, 0, a, i, null) : t && e.texImage2D(e.TEXTURE_2D, 0, r, a, i, t), e.bindTexture(e.TEXTURE_2D, null), d;
}, A = (e) => new Promise((n, o) => {
  const t = new Image();
  t.crossOrigin = "anonymous", t.onload = () => n(t), t.onerror = () => o(new Error(`Failed to load image: ${e}`)), t.src = e;
}), O = (e) => "displayWidth" in e && "displayHeight" in e ? { width: e.displayWidth, height: e.displayHeight } : "videoWidth" in e && "videoHeight" in e ? { width: e.videoWidth, height: e.videoHeight } : { width: e.width, height: e.height };
class V {
  constructor(n, o, t, r) {
    f(this, "transformFeedback");
    f(this, "edgeFramebuffer");
    f(this, "edgeTexture");
    f(this, "quadBuffer");
    f(this, "edgeVao");
    f(this, "positionBuffers");
    f(this, "velocityBuffers");
    f(this, "targetBuffers");
    f(this, "vaos");
    f(this, "currentIndex", 0);
    f(this, "time", 0);
    f(this, "noiseSeed", Math.random() * 1e3);
    this.gl = n, this.glState = o, this.programs = t, this.options = r;
    const a = n.createTransformFeedback(), i = n.createFramebuffer(), s = n.createVertexArray();
    if (!a || !i || !s)
      throw new Error("Unable to initialize WebGL particle resources.");
    this.transformFeedback = a, this.edgeFramebuffer = i, this.edgeVao = s, this.edgeTexture = P(n, {
      width: n.canvas.width,
      height: n.canvas.height
    }), this.quadBuffer = p(
      n,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      n.STATIC_DRAW
    );
    const c = new Float32Array(r.particleCount * 2), l = new Float32Array(r.particleCount * 2), d = new Float32Array(r.particleCount * 2);
    for (let g = 0; g < r.particleCount; g += 1) {
      const h = g * 2;
      c[h] = Math.random(), c[h + 1] = Math.random(), l[h] = (Math.random() - 0.5) * 1e-3, l[h + 1] = (Math.random() - 0.5) * 1e-3, d[h] = -1, d[h + 1] = -1;
    }
    this.positionBuffers = [p(n, c), p(n, c)], this.velocityBuffers = [p(n, l), p(n, l)], this.targetBuffers = [p(n, d), p(n, d)], this.vaos = [this.createParticleVao(0), this.createParticleVao(1)], this.configureEdgeVao(), this.configureEdgeFramebuffer();
  }
  processImage(n) {
    const o = P(this.gl, { data: n }), t = this.gl.getUniformLocation(this.programs.edge, "uResolution"), r = this.gl.getUniformLocation(this.programs.edge, "uImageScale"), a = this.gl.getUniformLocation(this.programs.edge, "uImageOffset"), i = this.gl.getUniformLocation(this.programs.edge, "threshold"), s = this.gl.getUniformLocation(this.programs.edge, "uImage"), c = O(n), l = z({
      fit: this.options.imageFit,
      canvasWidth: this.gl.canvas.width,
      canvasHeight: this.gl.canvas.height,
      imageWidth: c.width,
      imageHeight: c.height
    });
    this.glState.bindFramebuffer(this.edgeFramebuffer), this.glState.setViewport(this.gl.canvas.width, this.gl.canvas.height), this.glState.useProgram(this.programs.edge), this.gl.uniform2f(t, this.gl.canvas.width, this.gl.canvas.height), this.gl.uniform2f(r, l.scaleX, l.scaleY), this.gl.uniform2f(a, l.offsetX, l.offsetY), this.gl.uniform1f(i, this.options.edgeThreshold), this.gl.activeTexture(this.gl.TEXTURE0), this.gl.bindTexture(this.gl.TEXTURE_2D, o), this.gl.uniform1i(s, 0), this.glState.bindVao(this.edgeVao), this.gl.drawArrays(this.gl.TRIANGLES, 0, 6), this.gl.deleteTexture(o), this.glState.bindFramebuffer(null);
  }
  update(n, o) {
    this.time += n * 1e-3;
    const t = this.gl;
    this.glState.useProgram(this.programs.update), t.uniform1f(t.getUniformLocation(this.programs.update, "deltaTime"), n * 1e-3), t.uniform2f(
      t.getUniformLocation(this.programs.update, "resolution"),
      t.canvas.width,
      t.canvas.height
    ), t.uniform1f(t.getUniformLocation(this.programs.update, "particleSpeed"), this.options.particleSpeed), t.uniform1f(
      t.getUniformLocation(this.programs.update, "attractionStrength"),
      this.options.attractionStrength
    ), t.uniform1f(t.getUniformLocation(this.programs.update, "searchRadius"), this.options.searchRadius), t.uniform1f(t.getUniformLocation(this.programs.update, "time"), this.time), t.uniform1f(t.getUniformLocation(this.programs.update, "noiseSeed"), this.noiseSeed), t.uniform1f(
      t.getUniformLocation(this.programs.update, "flowFieldScale"),
      this.options.flowFieldScale
    ), t.uniform1i(
      t.getUniformLocation(this.programs.update, "use3DNoise"),
      this.options.noiseType === "3D" ? 1 : 0
    ), t.uniform2f(t.getUniformLocation(this.programs.update, "cursorPosition"), o.x, o.y), t.uniform1i(
      t.getUniformLocation(this.programs.update, "cursorActive"),
      this.options.interactive && o.active ? 1 : 0
    ), t.uniform1f(t.getUniformLocation(this.programs.update, "cursorRadius"), this.options.cursorRadius), t.uniform1f(
      t.getUniformLocation(this.programs.update, "cursorStrength"),
      this.options.cursorStrength
    ), t.uniform1f(
      t.getUniformLocation(this.programs.update, "cursorDirection"),
      this.options.cursorMode === "attract" ? 1 : -1
    ), t.activeTexture(t.TEXTURE0), t.bindTexture(t.TEXTURE_2D, this.edgeTexture), t.uniform1i(t.getUniformLocation(this.programs.update, "edgeTexture"), 0), this.glState.bindVao(this.vaos[this.currentIndex]), t.bindTransformFeedback(t.TRANSFORM_FEEDBACK, this.transformFeedback), t.bindBufferBase(t.TRANSFORM_FEEDBACK_BUFFER, 0, this.positionBuffers[1 - this.currentIndex]), t.bindBufferBase(t.TRANSFORM_FEEDBACK_BUFFER, 1, this.velocityBuffers[1 - this.currentIndex]), t.bindBufferBase(t.TRANSFORM_FEEDBACK_BUFFER, 2, this.targetBuffers[1 - this.currentIndex]), t.enable(t.RASTERIZER_DISCARD), t.beginTransformFeedback(t.POINTS), t.drawArrays(t.POINTS, 0, this.options.particleCount), t.endTransformFeedback(), t.disable(t.RASTERIZER_DISCARD), t.bindTransformFeedback(t.TRANSFORM_FEEDBACK, null), t.bindBufferBase(t.TRANSFORM_FEEDBACK_BUFFER, 0, null), t.bindBufferBase(t.TRANSFORM_FEEDBACK_BUFFER, 1, null), t.bindBufferBase(t.TRANSFORM_FEEDBACK_BUFFER, 2, null), this.currentIndex = 1 - this.currentIndex;
  }
  render() {
    const [n, o, t] = U(this.options.particleColor), r = this.gl;
    this.glState.useProgram(this.programs.particle), this.glState.bindVao(this.vaos[this.currentIndex]), r.uniform3f(r.getUniformLocation(this.programs.particle, "uParticleColor"), n, o, t), r.uniform1f(
      r.getUniformLocation(this.programs.particle, "uParticleOpacity"),
      this.options.particleOpacity
    ), r.uniform1f(r.getUniformLocation(this.programs.particle, "particleSize"), this.options.particleSize), r.enable(r.BLEND), r.blendFunc(r.SRC_ALPHA, r.ONE_MINUS_SRC_ALPHA), r.drawArrays(r.POINTS, 0, this.options.particleCount), r.disable(r.BLEND);
  }
  dispose() {
    const n = this.gl;
    n.deleteTransformFeedback(this.transformFeedback), n.deleteFramebuffer(this.edgeFramebuffer), n.deleteTexture(this.edgeTexture), n.deleteBuffer(this.quadBuffer), this.positionBuffers.forEach((o) => n.deleteBuffer(o)), this.velocityBuffers.forEach((o) => n.deleteBuffer(o)), this.targetBuffers.forEach((o) => n.deleteBuffer(o)), n.deleteVertexArray(this.edgeVao), this.vaos.forEach((o) => n.deleteVertexArray(o));
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
  configureEdgeVao() {
    this.glState.bindVao(this.edgeVao), this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadBuffer);
    const n = this.gl.getAttribLocation(this.programs.edge, "aPosition");
    this.gl.enableVertexAttribArray(n), this.gl.vertexAttribPointer(n, 2, this.gl.FLOAT, !1, 0, 0);
  }
  createParticleVao(n) {
    const o = this.gl.createVertexArray();
    if (!o)
      throw new Error("Unable to create particle VAO.");
    return this.glState.bindVao(o), this.bindParticleAttribute(this.positionBuffers[n], 0), this.bindParticleAttribute(this.velocityBuffers[n], 1), this.bindParticleAttribute(this.targetBuffers[n], 2), o;
  }
  bindParticleAttribute(n, o) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, n), this.gl.enableVertexAttribArray(o), this.gl.vertexAttribPointer(o, 2, this.gl.FLOAT, !1, 0, 0);
  }
}
const M = `#version 300 es
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
`, k = `#version 300 es
in vec2 aPosition;
out vec2 vTexCoord;

void main() {
    vTexCoord = vec2(aPosition.x * 0.5 + 0.5, (aPosition.y * 0.5 + 0.5));
    gl_Position = vec4(aPosition, 0.0, 1.0);
}`, X = `#version 300 es
precision highp float;

in vec2 vPosition;
uniform vec3 uParticleColor;
uniform float uParticleOpacity;

out vec4 fragColor;

void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    fragColor = vec4(uParticleColor, uParticleOpacity);
}`, G = `#version 300 es
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
`, Y = `#version 300 es
precision highp float;
out vec4 fragColor;
void main() {
    fragColor = vec4(0.0);
}`, W = `#version 300 es

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
            // Particle detaches: boost flow influence and reset target
            vel = mix(flow * 1.2, vel * 0.9, stickiness);
            tgt = vec2(-1.0);  // No target when detached
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
        
        // Grid search for nearby strong edges
        for (float y = -3.0; y <= 3.0; y += 1.0) {
            for (float x = -3.0; x <= 3.0; x += 1.0) {
                vec2 offset = vec2(x, y) / resolution;
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
            tgt = vec2(-1.0);
        }
        
        // Maintain partial velocity from previous frame for smoother motion
        vel = mix(vel, velocity, 0.3);
    }
    
    if (cursorActive && cursorRadius > 0.0 && cursorStrength > 0.0) {
        vec2 toCursor = cursorPosition - pos;
        float cursorDistance = length(toCursor);
        float cursorFalloff = smoothstep(cursorRadius, 0.0, cursorDistance);

        if (cursorFalloff > 0.0 && cursorDistance > 0.0001) {
            vec2 cursorForce = normalize(toCursor) *
                cursorDirection *
                cursorFalloff *
                cursorFalloff *
                cursorStrength *
                particleSpeed *
                0.004;
            vel += cursorForce;
            tgt = vec2(-1.0);
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
    fragment: M,
    vertex: k
  },
  particle: {
    fragment: X,
    vertex: G
  },
  update: {
    fragment: Y,
    vertex: W
  }
}, K = async (e, n = {}) => {
  const o = D(n), t = e.getContext("webgl2", {
    alpha: !1,
    antialias: !1,
    depth: !1,
    preserveDrawingBuffer: !1
  });
  if (!t)
    throw new Error("WebGL2 is required to run Particular Drift.");
  const r = new N(t), a = {
    edge: E(t, v.edge.vertex, v.edge.fragment),
    particle: E(t, v.particle.vertex, v.particle.fragment),
    update: E(t, v.update.vertex, v.update.fragment, [
      "vPosition",
      "vVelocity",
      "vTarget"
    ])
  };
  let i, s, c = 0, l = !1;
  const d = { x: 0.5, y: 0.5, active: !1 }, g = () => {
    const u = e.getBoundingClientRect(), { width: m, height: T } = _({
      cssWidth: u.width || e.clientWidth || 1,
      cssHeight: u.height || e.clientHeight || 1,
      maxDevicePixelRatio: o.maxDevicePixelRatio
    });
    (e.width !== m || e.height !== T) && (e.width = m, e.height = T), r.setViewport(e.width, e.height);
  }, h = () => {
    r.setClearColor(U(o.backgroundColor)), r.clear();
  }, S = (u) => {
    const m = L({
      clientX: u.clientX,
      clientY: u.clientY,
      rect: e.getBoundingClientRect()
    });
    d.x = m.x, d.y = m.y, d.active = m.active;
  }, x = () => {
    d.active = !1;
  }, b = () => {
    s !== void 0 && (cancelAnimationFrame(s), s = void 0), c = 0;
  }, F = (u) => {
    if (!i || l) return;
    const m = c ? u - c : 0;
    c = u, h(), i.update(m, d), i.render(), s = requestAnimationFrame(F);
  }, R = () => {
    s === void 0 && i && !l && (s = requestAnimationFrame(F));
  }, y = async (u) => {
    b(), i == null || i.dispose(), g(), h(), i = new V(t, r, a, o), i.processImage(u), o.autoStart && R();
  };
  return o.imageUrl ? await y(await A(o.imageUrl)) : (g(), h()), o.interactive && (e.addEventListener("pointermove", S, { passive: !0 }), e.addEventListener("pointerleave", x), e.addEventListener("pointercancel", x)), {
    loadImage: y,
    loadImageUrl: async (u) => y(await A(u)),
    resize: g,
    start: R,
    stop: b,
    destroy: () => {
      l = !0, b(), e.removeEventListener("pointermove", S), e.removeEventListener("pointerleave", x), e.removeEventListener("pointercancel", x), i == null || i.dispose(), Object.values(a).forEach((u) => t.deleteProgram(u));
    }
  };
};
export {
  C as DEFAULT_PARTICULAR_DRIFT_OPTIONS,
  K as createParticularDrift,
  D as getResolvedOptions,
  U as hexToRgbUnit,
  q as isWebGL2Supported,
  _ as resolveCanvasSize,
  L as resolveCursorPosition,
  z as resolveImageFit
};
