import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PARTICULAR_DRIFT_OPTIONS,
  getResolvedOptions,
  hexToRgbUnit,
  resolveCanvasSize,
} from './config';

describe('particular drift config', () => {
  it('provides a no-controls renderer default suitable for embedding', () => {
    expect(DEFAULT_PARTICULAR_DRIFT_OPTIONS.particleCount).toBeLessThan(300000);
    expect(DEFAULT_PARTICULAR_DRIFT_OPTIONS.autoStart).toBe(true);
    expect(DEFAULT_PARTICULAR_DRIFT_OPTIONS.backgroundColor).toMatch(/^#[0-9a-f]{6}$/i);
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
});
