import { ParticularDriftOptions, ParticularDriftUserOptions } from './config';

export type ParticularDriftInstance = {
    loadImage: (image: TexImageSource) => Promise<void>;
    loadImageUrl: (url: string) => Promise<void>;
    resize: () => void;
    start: () => void;
    stop: () => void;
    destroy: () => void;
};
export declare const createParticularDrift: (canvas: HTMLCanvasElement, userOptions?: ParticularDriftUserOptions) => Promise<ParticularDriftInstance>;
export type { ParticularDriftOptions, ParticularDriftUserOptions };
