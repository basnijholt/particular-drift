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
  cursorReturnStrength: number;
  cursorReturnDamping: number;
  backgroundColor: string;
  particleColor: string;
  autoStart: boolean;
  maxDevicePixelRatio: number;
};

export type ParticularDriftUserOptions = Partial<ParticularDriftOptions>;

export const DEFAULT_PARTICULAR_DRIFT_OPTIONS: ParticularDriftOptions = {
  imageFit: 'contain',
  particleCount: 120000,
  particleSpeed: 12,
  attractionStrength: 85,
  particleOpacity: 0.22,
  particleSize: 0.85,
  edgeThreshold: 0.4,
  flowFieldScale: 4,
  searchRadius: 0.02,
  noiseType: '2D',
  interactive: true,
  cursorMode: 'repel',
  cursorRadius: 0.12,
  cursorStrength: 1.4,
  cursorReturnStrength: 0.55,
  cursorReturnDamping: 0.82,
  backgroundColor: '#0f0d2e',
  particleColor: '#dda290',
  autoStart: true,
  maxDevicePixelRatio: 2,
};

export const getResolvedOptions = (
  options: ParticularDriftUserOptions = {}
): ParticularDriftOptions => ({
  ...DEFAULT_PARTICULAR_DRIFT_OPTIONS,
  ...options,
});

export const hexToRgbUnit = (hex: string): [number, number, number] => {
  const normalized = hex.trim().replace(/^#/, '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;

  if (!/^[0-9a-f]{6}$/i.test(expanded)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  return [
    Number.parseInt(expanded.slice(0, 2), 16) / 255,
    Number.parseInt(expanded.slice(2, 4), 16) / 255,
    Number.parseInt(expanded.slice(4, 6), 16) / 255,
  ];
};

export type ResolveCanvasSizeInput = {
  cssWidth: number;
  cssHeight: number;
  devicePixelRatio?: number;
  maxDevicePixelRatio?: number;
};

export const resolveCanvasSize = ({
  cssWidth,
  cssHeight,
  devicePixelRatio = globalThis.devicePixelRatio ?? 1,
  maxDevicePixelRatio = DEFAULT_PARTICULAR_DRIFT_OPTIONS.maxDevicePixelRatio,
}: ResolveCanvasSizeInput): { width: number; height: number } => {
  const ratio = Math.max(1, Math.min(devicePixelRatio, maxDevicePixelRatio));

  return {
    width: Math.max(1, Math.floor(cssWidth * ratio)),
    height: Math.max(1, Math.floor(cssHeight * ratio)),
  };
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

export const resolveCursorPosition = ({
  clientX,
  clientY,
  rect,
}: ResolveCursorPositionInput): ResolvedCursorPosition => {
  if (rect.width <= 0 || rect.height <= 0) {
    return { x: 0, y: 0, active: false };
  }

  const x = (clientX - rect.left) / rect.width;
  const clientYUnit = (clientY - rect.top) / rect.height;
  const y = 1 - clientYUnit;

  return {
    x: Math.min(1, Math.max(0, x)),
    y: Math.min(1, Math.max(0, y)),
    active: x >= 0 && x <= 1 && clientYUnit >= 0 && clientYUnit <= 1,
  };
};

export const resolveImageFit = ({
  fit,
  canvasWidth,
  canvasHeight,
  imageWidth,
  imageHeight,
}: ResolveImageFitInput): ResolvedImageFit => {
  if (fit === 'stretch' || canvasWidth <= 0 || canvasHeight <= 0 || imageWidth <= 0 || imageHeight <= 0) {
    return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };
  }

  const canvasAspect = canvasWidth / canvasHeight;
  const imageAspect = imageWidth / imageHeight;

  if (canvasAspect > imageAspect) {
    const scaleX = imageAspect / canvasAspect;
    return {
      scaleX,
      scaleY: 1,
      offsetX: (1 - scaleX) / 2,
      offsetY: 0,
    };
  }

  const scaleY = canvasAspect / imageAspect;
  return {
    scaleX: 1,
    scaleY,
    offsetX: 0,
    offsetY: (1 - scaleY) / 2,
  };
};
