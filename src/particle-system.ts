import { ParticularDriftOptions, hexToRgbUnit } from './config';
import { GlState } from './gl-state';
import { createBuffer, createTexture } from './webgl';

export type ParticleSystemPrograms = {
  edge: WebGLProgram;
  particle: WebGLProgram;
  update: WebGLProgram;
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
  }

  processImage(image: TexImageSource): void {
    const texture = createTexture(this.gl, { data: image });
    const resolution = this.gl.getUniformLocation(this.programs.edge, 'uResolution');
    const threshold = this.gl.getUniformLocation(this.programs.edge, 'threshold');
    const imageUniform = this.gl.getUniformLocation(this.programs.edge, 'uImage');

    this.glState.bindFramebuffer(this.edgeFramebuffer);
    this.glState.setViewport(this.gl.canvas.width, this.gl.canvas.height);
    this.glState.useProgram(this.programs.edge);
    this.gl.uniform2f(resolution, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.uniform1f(threshold, this.options.edgeThreshold);
    this.gl.activeTexture(this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    this.gl.uniform1i(imageUniform, 0);
    this.glState.bindVao(this.edgeVao);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.gl.deleteTexture(texture);
    this.glState.bindFramebuffer(null);
  }

  update(deltaTimeMs: number): void {
    this.time += deltaTimeMs * 0.001;
    const gl = this.gl;

    this.glState.useProgram(this.programs.update);
    gl.uniform1f(gl.getUniformLocation(this.programs.update, 'deltaTime'), deltaTimeMs * 0.001);
    gl.uniform2f(
      gl.getUniformLocation(this.programs.update, 'resolution'),
      gl.canvas.width,
      gl.canvas.height
    );
    gl.uniform1f(gl.getUniformLocation(this.programs.update, 'particleSpeed'), this.options.particleSpeed);
    gl.uniform1f(
      gl.getUniformLocation(this.programs.update, 'attractionStrength'),
      this.options.attractionStrength
    );
    gl.uniform1f(gl.getUniformLocation(this.programs.update, 'searchRadius'), this.options.searchRadius);
    gl.uniform1f(gl.getUniformLocation(this.programs.update, 'time'), this.time);
    gl.uniform1f(gl.getUniformLocation(this.programs.update, 'noiseSeed'), this.noiseSeed);
    gl.uniform1f(
      gl.getUniformLocation(this.programs.update, 'flowFieldScale'),
      this.options.flowFieldScale
    );
    gl.uniform1i(
      gl.getUniformLocation(this.programs.update, 'use3DNoise'),
      this.options.noiseType === '3D' ? 1 : 0
    );
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.edgeTexture);
    gl.uniform1i(gl.getUniformLocation(this.programs.update, 'edgeTexture'), 0);

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
    const [r, g, b] = hexToRgbUnit(this.options.particleColor);
    const gl = this.gl;

    this.glState.useProgram(this.programs.particle);
    this.glState.bindVao(this.vaos[this.currentIndex]);
    gl.uniform3f(gl.getUniformLocation(this.programs.particle, 'uParticleColor'), r, g, b);
    gl.uniform1f(
      gl.getUniformLocation(this.programs.particle, 'uParticleOpacity'),
      this.options.particleOpacity
    );
    gl.uniform1f(gl.getUniformLocation(this.programs.particle, 'particleSize'), this.options.particleSize);
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
