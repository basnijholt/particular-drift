export type NoiseType = '2D' | '3D';
export type ImageFit = 'contain' | 'stretch';
export type CursorMode = 'repel' | 'attract';
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
    interactive: boolean;
    cursorMode: CursorMode;
    cursorRadius: number;
    cursorStrength: number;
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
export type ResolveCursorPositionInput = {
    clientX: number;
    clientY: number;
    rect: Pick<DOMRectReadOnly, 'left' | 'top' | 'width' | 'height'>;
};
export type ResolvedCursorPosition = {
    x: number;
    y: number;
    active: boolean;
};
export declare const resolveCursorPosition: ({ clientX, clientY, rect, }: ResolveCursorPositionInput) => ResolvedCursorPosition;
export declare const resolveImageFit: ({ fit, canvasWidth, canvasHeight, imageWidth, imageHeight, }: ResolveImageFitInput) => ResolvedImageFit;
