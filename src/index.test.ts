import { describe, expect, it } from 'vitest';

import { createParticularDrift, isWebGL2Supported, resolveCursorPosition } from './index';

describe('package entrypoint', () => {
  it('exports the embeddable renderer API without touching the DOM at import time', () => {
    expect(createParticularDrift).toBeTypeOf('function');
    expect(isWebGL2Supported).toBeTypeOf('function');
    expect(resolveCursorPosition).toBeTypeOf('function');
  });
});
