import {
  ParticularDriftOptions,
  ParticularDriftUserOptions,
  getResolvedOptions,
  hexToRgbUnit,
  resolveCanvasSize,
  resolveCursorPosition,
} from './config';
import { GlState } from './gl-state';
import { ParticleSystem, ParticleSystemPrograms } from './particle-system';
import { SHADERS } from './shaders';
import { createProgram, loadImage } from './webgl';

export type ParticularDriftInstance = {
  loadImage: (image: TexImageSource) => Promise<void>;
  loadImageUrl: (url: string) => Promise<void>;
  resize: () => void;
  start: () => void;
  stop: () => void;
  destroy: () => void;
};

export const createParticularDrift = async (
  canvas: HTMLCanvasElement,
  userOptions: ParticularDriftUserOptions = {}
): Promise<ParticularDriftInstance> => {
  const options = getResolvedOptions(userOptions);
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    depth: false,
    preserveDrawingBuffer: false,
  });

  if (!gl) {
    throw new Error('WebGL2 is required to run Particular Drift.');
  }

  const glState = new GlState(gl);
  const programs: ParticleSystemPrograms = {
    edge: createProgram(gl, SHADERS.edge.vertex, SHADERS.edge.fragment),
    particle: createProgram(gl, SHADERS.particle.vertex, SHADERS.particle.fragment),
    update: createProgram(gl, SHADERS.update.vertex, SHADERS.update.fragment, [
      'vPosition',
      'vVelocity',
      'vTarget',
    ]),
  };
  let particleSystem: ParticleSystem | undefined;
  let animationFrame: number | undefined;
  let lastFrameTime = 0;
  let destroyed = false;
  const cursor = { x: 0.5, y: 0.5, active: false };

  const resize = (): void => {
    const rect = canvas.getBoundingClientRect();
    const { width, height } = resolveCanvasSize({
      cssWidth: rect.width || canvas.clientWidth || 1,
      cssHeight: rect.height || canvas.clientHeight || 1,
      maxDevicePixelRatio: options.maxDevicePixelRatio,
    });

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    glState.setViewport(canvas.width, canvas.height);
  };

  const clear = (): void => {
    glState.setClearColor(hexToRgbUnit(options.backgroundColor));
    glState.clear();
  };

  const updateCursorFromPointerEvent = (event: PointerEvent): void => {
    const nextCursor = resolveCursorPosition({
      clientX: event.clientX,
      clientY: event.clientY,
      rect: canvas.getBoundingClientRect(),
    });

    cursor.x = nextCursor.x;
    cursor.y = nextCursor.y;
    cursor.active = nextCursor.active;
  };

  const deactivateCursor = (): void => {
    cursor.active = false;
  };

  const stop = (): void => {
    if (animationFrame !== undefined) {
      cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
    }
    lastFrameTime = 0;
  };

  const frame = (time: number): void => {
    if (!particleSystem || destroyed) return;

    const deltaTime = lastFrameTime ? time - lastFrameTime : 0;
    lastFrameTime = time;
    clear();
    particleSystem.update(deltaTime, cursor);
    particleSystem.render();
    animationFrame = requestAnimationFrame(frame);
  };

  const start = (): void => {
    if (animationFrame === undefined && particleSystem && !destroyed) {
      animationFrame = requestAnimationFrame(frame);
    }
  };

  const loadImageSource = async (image: TexImageSource): Promise<void> => {
    stop();
    particleSystem?.dispose();
    resize();
    clear();
    particleSystem = new ParticleSystem(gl, glState, programs, options);
    particleSystem.processImage(image);
    if (options.autoStart) start();
  };

  if (options.imageUrl) {
    await loadImageSource(await loadImage(options.imageUrl));
  } else {
    resize();
    clear();
  }

  if (options.interactive) {
    canvas.addEventListener('pointermove', updateCursorFromPointerEvent, { passive: true });
    canvas.addEventListener('pointerleave', deactivateCursor);
    canvas.addEventListener('pointercancel', deactivateCursor);
  }

  return {
    loadImage: loadImageSource,
    loadImageUrl: async (url: string) => loadImageSource(await loadImage(url)),
    resize,
    start,
    stop,
    destroy: () => {
      destroyed = true;
      stop();
      canvas.removeEventListener('pointermove', updateCursorFromPointerEvent);
      canvas.removeEventListener('pointerleave', deactivateCursor);
      canvas.removeEventListener('pointercancel', deactivateCursor);
      particleSystem?.dispose();
      Object.values(programs).forEach((program) => gl.deleteProgram(program));
    },
  };
};

export type { ParticularDriftOptions, ParticularDriftUserOptions };
