import edgeFragmentShader from '../shaders/edge.frag?raw';
import edgeVertexShader from '../shaders/edge.vert?raw';
import particleFragmentShader from '../shaders/particle.frag?raw';
import particleVertexShader from '../shaders/particle.vert?raw';
import updateFragmentShader from '../shaders/update.frag?raw';
import updateVertexShader from '../shaders/update.vert?raw';

export const SHADERS = {
  edge: {
    fragment: edgeFragmentShader,
    vertex: edgeVertexShader,
  },
  particle: {
    fragment: particleFragmentShader,
    vertex: particleVertexShader,
  },
  update: {
    fragment: updateFragmentShader,
    vertex: updateVertexShader,
  },
} as const;
