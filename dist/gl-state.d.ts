export declare class GlState {
    private readonly gl;
    private currentProgram;
    private currentVao;
    private currentFramebuffer;
    constructor(gl: WebGL2RenderingContext);
    useProgram(program: WebGLProgram): void;
    bindVao(vao: WebGLVertexArrayObject | null): void;
    bindFramebuffer(framebuffer: WebGLFramebuffer | null): void;
    setViewport(width: number, height: number): void;
    setClearColor(color: [number, number, number]): void;
    clear(): void;
}
