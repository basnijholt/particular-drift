import { ParticularDriftOptions } from './config';
import { GlState } from './gl-state';

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
export declare const createUniformLocations: <const T extends readonly string[]>(gl: WebGL2RenderingContext, program: WebGLProgram, names: T) => UniformLocations<T>;
export declare class ParticleSystem {
    private readonly gl;
    private readonly glState;
    private readonly programs;
    private readonly options;
    private readonly transformFeedback;
    private readonly edgeFramebuffer;
    private readonly edgeTexture;
    private readonly quadBuffer;
    private readonly edgeVao;
    private readonly positionBuffers;
    private readonly velocityBuffers;
    private readonly targetBuffers;
    private readonly vaos;
    private readonly edgeUniforms;
    private readonly updateUniforms;
    private readonly particleUniforms;
    private readonly particleColor;
    private currentIndex;
    private time;
    private readonly noiseSeed;
    constructor(gl: WebGL2RenderingContext, glState: GlState, programs: ParticleSystemPrograms, options: ParticularDriftOptions);
    processImage(image: TexImageSource): void;
    update(deltaTimeMs: number, cursor: ParticleCursorState): void;
    render(): void;
    dispose(): void;
    private configureEdgeFramebuffer;
    private configureStaticUniforms;
    private configureEdgeVao;
    private createParticleVao;
    private bindParticleAttribute;
}
export {};
