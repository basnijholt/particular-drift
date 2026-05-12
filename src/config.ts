export type NoiseType = '2D' | '3D';

export type ParticularDriftOptions = {
  imageUrl?: string;
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

export const DEFAULT_PARTICULAR_DRIFT_OPTIONS: ParticularDriftOptions = {
  particleCount: 120000,
  particleSpeed: 12,
  attractionStrength: 85,
  particleOpacity: 0.22,
  particleSize: 0.85,
  edgeThreshold: 0.4,
  flowFieldScale: 4,
  searchRadius: 0.02,
  noiseType: '2D',
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
