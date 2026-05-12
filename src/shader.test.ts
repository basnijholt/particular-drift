import { describe, expect, it } from 'vitest';

import updateVertexShader from '../shaders/update.vert?raw';

describe('particle update shader', () => {
  it('preserves stored particle targets so disturbed particles can return home', () => {
    expect(updateVertexShader).not.toContain('tgt = vec2(-1.0)');
    expect(updateVertexShader).toContain('vTarget = tgt');
  });
});
