export class GlState {
  private currentProgram: WebGLProgram | null = null;

  private currentVao: WebGLVertexArrayObject | null = null;

  private currentFramebuffer: WebGLFramebuffer | null = null;

  constructor(private readonly gl: WebGL2RenderingContext) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  }

  useProgram(program: WebGLProgram): void {
    if (this.currentProgram !== program) {
      this.gl.useProgram(program);
      this.currentProgram = program;
    }
  }

  bindVao(vao: WebGLVertexArrayObject | null): void {
    if (this.currentVao !== vao) {
      this.gl.bindVertexArray(vao);
      this.currentVao = vao;
    }
  }

  bindFramebuffer(framebuffer: WebGLFramebuffer | null): void {
    if (this.currentFramebuffer !== framebuffer) {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
      this.currentFramebuffer = framebuffer;
    }
  }

  setViewport(width: number, height: number): void {
    this.gl.viewport(0, 0, width, height);
  }

  setClearColor(color: [number, number, number]): void {
    this.gl.clearColor(color[0], color[1], color[2], 1);
  }

  clear(): void {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }
}
