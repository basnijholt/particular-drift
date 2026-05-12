import { ParticularDriftOptions } from './config';
import { GlState } from './gl-state';

export type ParticleSystemPrograms = {
    edge: WebGLProgram;
    particle: WebGLProgram;
    update: WebGLProgram;
};
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
    private currentIndex;
    private time;
    private readonly noiseSeed;
    constructor(gl: WebGL2RenderingContext, glState: GlState, programs: ParticleSystemPrograms, options: ParticularDriftOptions);
    processImage(image: TexImageSource): void;
    update(deltaTimeMs: number): void;
    render(): void;
    dispose(): void;
    private configureEdgeFramebuffer;
    private configureEdgeVao;
    private createParticleVao;
    private bindParticleAttribute;
}
