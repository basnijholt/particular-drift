import { createParticularDrift } from '../src';

import '../demo/styles.css';

const canvas = document.querySelector<HTMLCanvasElement>('#drift-canvas');
const status = document.querySelector<HTMLDivElement>('#status');

const setStatus = (message: string): void => {
  if (status) {
    status.textContent = message;
  }
};

const createDemoImageUrl = (): string => {
  const imageCanvas = document.createElement('canvas');
  imageCanvas.width = 800;
  imageCanvas.height = 520;

  const context = imageCanvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D is required to prepare the demo image.');
  }

  context.fillStyle = '#0f0d2e';
  context.fillRect(0, 0, imageCanvas.width, imageCanvas.height);
  context.strokeStyle = '#ffffff';
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.fillStyle = '#ffffff';

  context.globalAlpha = 1;
  context.lineWidth = 42;
  context.beginPath();
  context.moveTo(158, 332);
  context.bezierCurveTo(240, 176, 325, 176, 407, 332);
  context.bezierCurveTo(489, 488, 574, 488, 656, 332);
  context.stroke();

  context.globalAlpha = 0.86;
  context.lineWidth = 34;
  context.beginPath();
  context.moveTo(168, 197);
  context.bezierCurveTo(240, 315, 316, 315, 394, 197);
  context.bezierCurveTo(472, 79, 552, 79, 632, 197);
  context.stroke();

  context.globalAlpha = 1;
  context.lineWidth = 30;
  context.beginPath();
  context.arc(400, 260, 58, 0, Math.PI * 2);
  context.stroke();

  return imageCanvas.toDataURL('image/png');
};

let imageUrl: string;

try {
  imageUrl = createDemoImageUrl();
} catch (error: unknown) {
  imageUrl = '';
  const message = error instanceof Error ? error.message : 'Unable to prepare the demo image.';
  setStatus(message);
}

if (!canvas) {
  setStatus('Missing canvas element.');
} else if (imageUrl) {
  createParticularDrift(canvas, {
    imageUrl,
    imageFit: 'contain',
    backgroundColor: '#0f0d2e',
    particleColor: '#dda290',
    particleCount: 90000,
    particleOpacity: 0.26,
    particleSize: 0.9,
    cursorMode: 'repel',
  })
    .then((drift) => {
      const resize = (): void => drift.resize();

      window.addEventListener('resize', resize);
      window.addEventListener('pagehide', () => {
        window.removeEventListener('resize', resize);
        drift.destroy();
      });
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to start animation.';
      setStatus(message);
    });
}
