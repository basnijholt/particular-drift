import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PARTICULAR_DRIFT_OPTIONS,
  getResolvedOptions,
  hexToRgbUnit,
  resolveCursorPosition,
  isFrameDue,
  resolveCanvasSize,
  resolveImageFit,
} from './config';

describe('particular drift config', () => {
  it('provides a no-controls renderer default suitable for embedding', () => {
    expect(DEFAULT_PARTICULAR_DRIFT_OPTIONS.particleCount).toBeLessThan(300000);
    expect(DEFAULT_PARTICULAR_DRIFT_OPTIONS.autoStart).toBe(true);
    expect(DEFAULT_PARTICULAR_DRIFT_OPTIONS.backgroundColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(DEFAULT_PARTICULAR_DRIFT_OPTIONS.imageFit).toBe('contain');
    expect(DEFAULT_PARTICULAR_DRIFT_OPTIONS.interactive).toBe(true);
    expect(DEFAULT_PARTICULAR_DRIFT_OPTIONS.cursorMode).toBe('repel');
    expect(DEFAULT_PARTICULAR_DRIFT_OPTIONS.cursorReturnStrength).toBeGreaterThan(0);
    expect(DEFAULT_PARTICULAR_DRIFT_OPTIONS.cursorReturnDamping).toBeGreaterThan(0);
    expect(DEFAULT_PARTICULAR_DRIFT_OPTIONS.edgeSearchSteps).toBe(2);
  });

  it('merges user options without mutating the default object', () => {
    const resolved = getResolvedOptions({
      particleCount: 50000,
      backgroundColor: '#101820',
    });

    expect(resolved.particleCount).toBe(50000);
    expect(resolved.backgroundColor).toBe('#101820');
    expect(DEFAULT_PARTICULAR_DRIFT_OPTIONS.particleCount).not.toBe(50000);
  });

  it('converts full and shorthand hex colors to unit RGB values', () => {
    expect(hexToRgbUnit('#336699')).toEqual([0.2, 0.4, 0.6]);
    expect(hexToRgbUnit('#fff')).toEqual([1, 1, 1]);
  });

  it('resolves canvas backing size with a capped device pixel ratio', () => {
    expect(
      resolveCanvasSize({
        cssWidth: 320,
        cssHeight: 180,
        devicePixelRatio: 3,
        maxDevicePixelRatio: 2,
      })
    ).toEqual({ width: 640, height: 360 });
  });

  it('renders below CSS resolution when the device pixel ratio cap is below 1', () => {
    expect(
      resolveCanvasSize({
        cssWidth: 320,
        cssHeight: 180,
        devicePixelRatio: 1,
        maxDevicePixelRatio: 0.5,
      })
    ).toEqual({ width: 160, height: 90 });
    // A zoomed-out page still renders at least at CSS resolution without a lower cap.
    expect(
      resolveCanvasSize({ cssWidth: 320, cssHeight: 180, devicePixelRatio: 0.8, maxDevicePixelRatio: 2 })
    ).toEqual({ width: 320, height: 180 });
  });

  it('skips frames inside a frame-rate cap', () => {
    expect(isFrameDue(1000, 0, 30)).toBe(true);
    expect(isFrameDue(1016.7, 1000, 30)).toBe(false);
    expect(isFrameDue(1033.3, 1000, 30)).toBe(true);
    expect(isFrameDue(1016.7, 1000, Infinity)).toBe(true);
    // A cap that is not a positive number must not freeze the animation.
    expect(isFrameDue(1016.7, 1000, 0)).toBe(true);
    expect(isFrameDue(1016.7, 1000, Number.NaN)).toBe(true);
    expect(isFrameDue(1016.7, 1000, undefined as unknown as number)).toBe(true);
  });

  it('preserves image aspect ratio when containing an image in a wider canvas', () => {
    const fit = resolveImageFit({
      fit: 'contain',
      canvasWidth: 1600,
      canvasHeight: 900,
      imageWidth: 690,
      imageHeight: 676,
    });

    expect(fit.scaleX).toBeCloseTo(0.574);
    expect(fit.scaleY).toBe(1);
    expect(fit.offsetX).toBeCloseTo(0.213);
    expect(fit.offsetY).toBe(0);
  });

  it('keeps stretch available for callers that want the original canvas mapping', () => {
    expect(
      resolveImageFit({
        fit: 'stretch',
        canvasWidth: 1600,
        canvasHeight: 900,
        imageWidth: 690,
        imageHeight: 676,
      })
    ).toEqual({
      scaleX: 1,
      scaleY: 1,
      offsetX: 0,
      offsetY: 0,
    });
  });

  it('resolves client pointer coordinates to normalized particle coordinates', () => {
    expect(
      resolveCursorPosition({
        clientX: 150,
        clientY: 75,
        rect: { left: 50, top: 25, width: 200, height: 100 },
      })
    ).toEqual({ x: 0.5, y: 0.5, active: true });
  });

  it('flips client y coordinates into WebGL particle coordinates', () => {
    expect(
      resolveCursorPosition({
        clientX: 50,
        clientY: 25,
        rect: { left: 50, top: 25, width: 200, height: 100 },
      })
    ).toEqual({ x: 0, y: 1, active: true });
  });

  it('marks pointer coordinates outside the canvas inactive', () => {
    expect(
      resolveCursorPosition({
        clientX: 20,
        clientY: 75,
        rect: { left: 50, top: 25, width: 200, height: 100 },
      })
    ).toEqual({ x: 0, y: 0.5, active: false });
  });
});
