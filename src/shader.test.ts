import { describe, expect, it } from 'vitest';

import updateVertexShader from '../shaders/update.vert?raw';

describe('particle update shader', () => {
  it('preserves stored particle targets so disturbed particles can return home', () => {
    expect(updateVertexShader).not.toContain('tgt = vec2(-1.0)');
    expect(updateVertexShader).toContain('vTarget = tgt');
  });

  it('uses a configurable bounded edge search grid', () => {
    expect(updateVertexShader).toContain('uniform int edgeSearchSteps');
    expect(updateVertexShader).toContain('MAX_EDGE_SEARCH_STEPS');
    expect(updateVertexShader).not.toContain('for (float y = -3.0; y <= 3.0; y += 1.0)');
  });
});
