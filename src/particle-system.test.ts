import { describe, expect, it } from 'vitest';

import { createUniformLocations } from './particle-system';

describe('particle system uniform helpers', () => {
  it('resolves each requested uniform location once', () => {
    const calls: string[] = [];
    const gl = {
      getUniformLocation: (_program: WebGLProgram, name: string) => {
        calls.push(name);
        return `${name}-location` as unknown as WebGLUniformLocation;
      },
    } as WebGL2RenderingContext;
    const program = {} as WebGLProgram;

    const locations = createUniformLocations(gl, program, ['deltaTime', 'particleSpeed']);

    expect(calls).toEqual(['deltaTime', 'particleSpeed']);
    expect(locations).toEqual({
      deltaTime: 'deltaTime-location',
      particleSpeed: 'particleSpeed-location',
    });
  });
});
