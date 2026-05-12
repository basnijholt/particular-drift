export declare const isWebGL2Supported: () => boolean;
export declare const createShader: (gl: WebGL2RenderingContext, type: number, source: string) => WebGLShader;
export declare const createProgram: (gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string, transformFeedbackVaryings?: string[]) => WebGLProgram;
export declare const createBuffer: (gl: WebGL2RenderingContext, data: BufferSource, usage?: number) => WebGLBuffer;
export declare const createTexture: (gl: WebGL2RenderingContext, { width, height, data, internalFormat, format, type, minFilter, magFilter, wrap, }: {
    width?: number;
    height?: number;
    data?: TexImageSource | null;
    internalFormat?: number;
    format?: number;
    type?: number;
    minFilter?: number;
    magFilter?: number;
    wrap?: number;
}) => WebGLTexture;
export declare const loadImage: (url: string) => Promise<HTMLImageElement>;
