export type NoiseType = '2D' | '3D';
export type ImageFit = 'contain' | 'stretch';
export type ParticularDriftOptions = {
    imageUrl?: string;
    imageFit: ImageFit;
    particleCount: number;
    particleSpeed: number;
    attractionStrength: number;
    particleOpacity: number;
    particleSize: number;
    edgeThreshold: number;
    flowFieldScale: number;
    searchRadius: number;
    noiseType: NoiseType;
    backgroundColor: string;
    particleColor: string;
    autoStart: boolean;
    maxDevicePixelRatio: number;
};
export type ParticularDriftUserOptions = Partial<ParticularDriftOptions>;
export declare const DEFAULT_PARTICULAR_DRIFT_OPTIONS: ParticularDriftOptions;
export declare const getResolvedOptions: (options?: ParticularDriftUserOptions) => ParticularDriftOptions;
export declare const hexToRgbUnit: (hex: string) => [number, number, number];
export type ResolveCanvasSizeInput = {
    cssWidth: number;
    cssHeight: number;
    devicePixelRatio?: number;
    maxDevicePixelRatio?: number;
};
export declare const resolveCanvasSize: ({ cssWidth, cssHeight, devicePixelRatio, maxDevicePixelRatio, }: ResolveCanvasSizeInput) => {
    width: number;
    height: number;
};
export type ResolveImageFitInput = {
    fit: ImageFit;
    canvasWidth: number;
    canvasHeight: number;
    imageWidth: number;
    imageHeight: number;
};
export type ResolvedImageFit = {
    scaleX: number;
    scaleY: number;
    offsetX: number;
    offsetY: number;
};
export declare const resolveImageFit: ({ fit, canvasWidth, canvasHeight, imageWidth, imageHeight, }: ResolveImageFitInput) => ResolvedImageFit;
