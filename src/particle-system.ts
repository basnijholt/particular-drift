import { ParticularDriftOptions, hexToRgbUnit, resolveImageFit } from './config';
import { GlState } from './gl-state';
import { createBuffer, createTexture } from './webgl';

export type ParticleSystemPrograms = {
  edge: WebGLProgram;
  particle: WebGLProgram;
  update: WebGLProgram;
};

export type ParticleCursorState = {
  x: number;
  y: number;
  active: boolean;
};

type UniformLocations<T extends readonly string[]> = {
  [K in T[number]]: WebGLUniformLocation | null;
};

const edgeUniformNames = ['uResolution', 'uImageScale', 'uImageOffset', 'threshold', 'uImage'] as const;
const updateUniformNames = [
  'deltaTime',
  'resolution',
  'particleSpeed',
  'attractionStrength',
  'searchRadius',
  'edgeSearchSteps',
  'time',
  'noiseSeed',
  'flowFieldScale',
  'use3DNoise',
  'cursorPosition',
  'cursorActive',
  'cursorRadius',
  'cursorStrength',
  'cursorDirection',
  'cursorReturnStrength',
  'cursorReturnDamping',
  'edgeTexture',
] as const;
const particleUniformNames = ['uParticleColor', 'uParticleOpacity', 'particleSize'] as const;

type EdgeUniformLocations = UniformLocations<typeof edgeUniformNames>;
type UpdateUniformLocations = UniformLocations<typeof updateUniformNames>;
type ParticleUniformLocations = UniformLocations<typeof particleUniformNames>;

export const createUniformLocations = <const T extends readonly string[]>(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  names: T
): UniformLocations<T> =>
  Object.fromEntries(names.map((name) => [name, gl.getUniformLocation(program, name)])) as UniformLocations<T>;

const getTexImageSourceSize = (image: TexImageSource): { width: number; height: number } => {
  if ('displayWidth' in image && 'displayHeight' in image) {
    return { width: image.displayWidth, height: image.displayHeight };
  }

  if ('videoWidth' in image && 'videoHeight' in image) {
    return { width: image.videoWidth, height: image.videoHeight };
  }

  return { width: image.width, height: image.height };
};

export class ParticleSystem {
  private readonly transformFeedback: WebGLTransformFeedback;

  private readonly edgeFramebuffer: WebGLFramebuffer;

  private readonly edgeTexture: WebGLTexture;

  private readonly quadBuffer: WebGLBuffer;

  private readonly edgeVao: WebGLVertexArrayObject;

  private readonly positionBuffers: [WebGLBuffer, WebGLBuffer];

  private readonly velocityBuffers: [WebGLBuffer, WebGLBuffer];

  private readonly targetBuffers: [WebGLBuffer, WebGLBuffer];

  private readonly vaos: [WebGLVertexArrayObject, WebGLVertexArrayObject];

  private readonly edgeUniforms: EdgeUniformLocations;

  private readonly updateUniforms: UpdateUniformLocations;

  private readonly particleUniforms: ParticleUniformLocations;

  private readonly particleColor: [number, number, number];

  private currentIndex = 0;

  private time = 0;

  private readonly noiseSeed = Math.random() * 1000;

  constructor(
    private readonly gl: WebGL2RenderingContext,
    private readonly glState: GlState,
    private readonly programs: ParticleSystemPrograms,
    private readonly options: ParticularDriftOptions
  ) {
    const transformFeedback = gl.createTransformFeedback();
    const edgeFramebuffer = gl.createFramebuffer();
    const edgeVao = gl.createVertexArray();

    if (!transformFeedback || !edgeFramebuffer || !edgeVao) {
      throw new Error('Unable to initialize WebGL particle resources.');
    }

    this.transformFeedback = transformFeedback;
    this.edgeFramebuffer = edgeFramebuffer;
    this.edgeVao = edgeVao;
    this.edgeUniforms = createUniformLocations(gl, programs.edge, edgeUniformNames);
    this.updateUniforms = createUniformLocations(gl, programs.update, updateUniformNames);
    this.particleUniforms = createUniformLocations(gl, programs.particle, particleUniformNames);
    this.particleColor = hexToRgbUnit(options.particleColor);
    this.edgeTexture = createTexture(gl, {
      width: gl.canvas.width,
      height: gl.canvas.height,
    });
    this.quadBuffer = createBuffer(
      gl,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positions = new Float32Array(options.particleCount * 2);
    const velocities = new Float32Array(options.particleCount * 2);
    const targets = new Float32Array(options.particleCount * 2);

    for (let i = 0; i < options.particleCount; i += 1) {
      const offset = i * 2;
      positions[offset] = Math.random();
      positions[offset + 1] = Math.random();
      velocities[offset] = (Math.random() - 0.5) * 0.001;
      velocities[offset + 1] = (Math.random() - 0.5) * 0.001;
      targets[offset] = -1;
      targets[offset + 1] = -1;
    }

    this.positionBuffers = [createBuffer(gl, positions), createBuffer(gl, positions)];
    this.velocityBuffers = [createBuffer(gl, velocities), createBuffer(gl, velocities)];
    this.targetBuffers = [createBuffer(gl, targets), createBuffer(gl, targets)];
    this.vaos = [this.createParticleVao(0), this.createParticleVao(1)];
    this.configureEdgeVao();
    this.configureEdgeFramebuffer();
    this.configureStaticUniforms();
  }

  processImage(image: TexImageSource): void {
    const texture = createTexture(this.gl, { data: image });
    const imageSize = getTexImageSourceSize(image);
    const fit = resolveImageFit({
      fit: this.options.imageFit,
      canvasWidth: this.gl.canvas.width,
      canvasHeight: this.gl.canvas.height,
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
    });

    this.glState.bindFramebuffer(this.edgeFramebuffer);
    this.glState.setViewport(this.gl.canvas.width, this.gl.canvas.height);
    this.glState.useProgram(this.programs.edge);
    this.gl.uniform2f(this.edgeUniforms.uResolution, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.uniform2f(this.edgeUniforms.uImageScale, fit.scaleX, fit.scaleY);
    this.gl.uniform2f(this.edgeUniforms.uImageOffset, fit.offsetX, fit.offsetY);
    this.gl.uniform1f(this.edgeUniforms.threshold, this.options.edgeThreshold);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform1i(this.edgeUniforms.uImage, 0);
    this.glState.bindVao(this.edgeVao);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.gl.deleteTexture(texture);
    this.glState.bindFramebuffer(null);
  }

  update(deltaTimeMs: number, cursor: ParticleCursorState): void {
    this.time += deltaTimeMs * 0.001;
    const gl = this.gl;

    this.glState.useProgram(this.programs.update);
    gl.uniform1f(this.updateUniforms.deltaTime, deltaTimeMs * 0.001);
    gl.uniform2f(this.updateUniforms.resolution, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(this.updateUniforms.time, this.time);
    gl.uniform2f(this.updateUniforms.cursorPosition, cursor.x, cursor.y);
    gl.uniform1i(this.updateUniforms.cursorActive, this.options.interactive && cursor.active ? 1 : 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.edgeTexture);

    this.glState.bindVao(this.vaos[this.currentIndex]);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.transformFeedback);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.positionBuffers[1 - this.currentIndex]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, this.velocityBuffers[1 - this.currentIndex]);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, this.targetBuffers[1 - this.currentIndex]);
    gl.enable(gl.RASTERIZER_DISCARD);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, this.options.particleCount);
    gl.endTransformFeedback();
    gl.disable(gl.RASTERIZER_DISCARD);
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 2, null);

    this.currentIndex = 1 - this.currentIndex;
  }

  render(): void {
    const gl = this.gl;

    this.glState.useProgram(this.programs.particle);
    this.glState.bindVao(this.vaos[this.currentIndex]);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.POINTS, 0, this.options.particleCount);
    gl.disable(gl.BLEND);
  }

  dispose(): void {
    const gl = this.gl;
    gl.deleteTransformFeedback(this.transformFeedback);
    gl.deleteFramebuffer(this.edgeFramebuffer);
    gl.deleteTexture(this.edgeTexture);
    gl.deleteBuffer(this.quadBuffer);
    this.positionBuffers.forEach((buffer) => gl.deleteBuffer(buffer));
    this.velocityBuffers.forEach((buffer) => gl.deleteBuffer(buffer));
    this.targetBuffers.forEach((buffer) => gl.deleteBuffer(buffer));
    gl.deleteVertexArray(this.edgeVao);
    this.vaos.forEach((vao) => gl.deleteVertexArray(vao));
  }

  private configureEdgeFramebuffer(): void {
    this.glState.bindFramebuffer(this.edgeFramebuffer);
    this.gl.framebufferTexture2D(
      this.gl.FRAMEBUFFER,
      this.gl.COLOR_ATTACHMENT0,
      this.gl.TEXTURE_2D,
      this.edgeTexture,
      0
    );

    if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
      throw new Error('Edge framebuffer is not complete.');
    }

    this.glState.bindFramebuffer(null);
  }

  private configureStaticUniforms(): void {
    const gl = this.gl;
    const [r, g, b] = this.particleColor;

    this.glState.useProgram(this.programs.update);
    gl.uniform1f(this.updateUniforms.particleSpeed, this.options.particleSpeed);
    gl.uniform1f(this.updateUniforms.attractionStrength, this.options.attractionStrength);
    gl.uniform1f(this.updateUniforms.searchRadius, this.options.searchRadius);
    gl.uniform1i(this.updateUniforms.edgeSearchSteps, this.options.edgeSearchSteps);
    gl.uniform1f(this.updateUniforms.noiseSeed, this.noiseSeed);
    gl.uniform1f(this.updateUniforms.flowFieldScale, this.options.flowFieldScale);
    gl.uniform1i(this.updateUniforms.use3DNoise, this.options.noiseType === '3D' ? 1 : 0);
    gl.uniform1f(this.updateUniforms.cursorRadius, this.options.cursorRadius);
    gl.uniform1f(this.updateUniforms.cursorStrength, this.options.cursorStrength);
    gl.uniform1f(this.updateUniforms.cursorDirection, this.options.cursorMode === 'attract' ? 1 : -1);
    gl.uniform1f(this.updateUniforms.cursorReturnStrength, this.options.cursorReturnStrength);
    gl.uniform1f(this.updateUniforms.cursorReturnDamping, this.options.cursorReturnDamping);
    gl.uniform1i(this.updateUniforms.edgeTexture, 0);

    this.glState.useProgram(this.programs.particle);
    gl.uniform3f(this.particleUniforms.uParticleColor, r, g, b);
    gl.uniform1f(this.particleUniforms.uParticleOpacity, this.options.particleOpacity);
    gl.uniform1f(this.particleUniforms.particleSize, this.options.particleSize);
  }

  private configureEdgeVao(): void {
    this.glState.bindVao(this.edgeVao);
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadBuffer);
    const position = this.gl.getAttribLocation(this.programs.edge, 'aPosition');
    this.gl.enableVertexAttribArray(position);
    this.gl.vertexAttribPointer(position, 2, this.gl.FLOAT, false, 0, 0);
  }

  private createParticleVao(index: number): WebGLVertexArrayObject {
    const vao = this.gl.createVertexArray();
    if (!vao) {
      throw new Error('Unable to create particle VAO.');
    }

    this.glState.bindVao(vao);
    this.bindParticleAttribute(this.positionBuffers[index], 0);
    this.bindParticleAttribute(this.velocityBuffers[index], 1);
    this.bindParticleAttribute(this.targetBuffers[index], 2);
    return vao;
  }

  private bindParticleAttribute(buffer: WebGLBuffer, index: number): void {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.enableVertexAttribArray(index);
    this.gl.vertexAttribPointer(index, 2, this.gl.FLOAT, false, 0, 0);
  }
}
