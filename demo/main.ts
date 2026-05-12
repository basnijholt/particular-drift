import { ParticularDriftInstance, ParticularDriftUserOptions, createParticularDrift } from '../src';

import '../demo/styles.css';

type PresetName = 'ribbon' | 'halo' | 'signal';

type DemoPreset = {
  countLabel: string;
  imageKind: PresetName;
  modeLabel: string;
  options: ParticularDriftUserOptions;
  snippet: string;
};

const canvas = document.querySelector<HTMLCanvasElement>('#drift-canvas');
const status = document.querySelector<HTMLDivElement>('#status');
const modeValue = document.querySelector<HTMLElement>('#mode-value');
const countValue = document.querySelector<HTMLElement>('#count-value');
const fitValue = document.querySelector<HTMLElement>('#fit-value');
const snippetCode = document.querySelector<HTMLElement>('#snippet-code');
const presetButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('.preset-button'));

const setText = (element: Element | null, value: string): void => {
  if (element) element.textContent = value;
};

const setStatus = (message: string): void => {
  setText(status, message);
};

const drawRibbon = (context: CanvasRenderingContext2D, width: number, height: number): void => {
  context.strokeStyle = '#ffffff';
  context.lineCap = 'round';
  context.lineJoin = 'round';

  context.lineWidth = 42;
  context.beginPath();
  context.moveTo(width * 0.2, height * 0.64);
  context.bezierCurveTo(width * 0.31, height * 0.22, width * 0.42, height * 0.22, width * 0.52, height * 0.64);
  context.bezierCurveTo(width * 0.62, height * 1.06, width * 0.73, height * 1.06, width * 0.84, height * 0.64);
  context.stroke();

  context.globalAlpha = 0.86;
  context.lineWidth = 34;
  context.beginPath();
  context.moveTo(width * 0.21, height * 0.38);
  context.bezierCurveTo(width * 0.31, height * 0.61, width * 0.4, height * 0.61, width * 0.5, height * 0.38);
  context.bezierCurveTo(width * 0.6, height * 0.15, width * 0.7, height * 0.15, width * 0.81, height * 0.38);
  context.stroke();

  context.globalAlpha = 1;
  context.lineWidth = 30;
  context.beginPath();
  context.arc(width * 0.5, height * 0.5, height * 0.11, 0, Math.PI * 2);
  context.stroke();
};

const drawHalo = (context: CanvasRenderingContext2D, width: number, height: number): void => {
  context.strokeStyle = '#ffffff';
  context.lineCap = 'round';
  context.lineJoin = 'round';

  for (let i = 0; i < 4; i += 1) {
    context.globalAlpha = 1 - i * 0.14;
    context.lineWidth = 28 - i * 3;
    context.beginPath();
    context.ellipse(
      width * 0.5,
      height * 0.5,
      width * (0.17 + i * 0.07),
      height * (0.13 + i * 0.05),
      i * 0.62,
      0,
      Math.PI * 2
    );
    context.stroke();
  }

  context.globalAlpha = 0.95;
  context.lineWidth = 24;
  context.beginPath();
  context.moveTo(width * 0.24, height * 0.5);
  context.lineTo(width * 0.76, height * 0.5);
  context.stroke();
};

const drawSignal = (context: CanvasRenderingContext2D, width: number, height: number): void => {
  context.strokeStyle = '#ffffff';
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.lineWidth = 30;

  for (let i = 0; i < 5; i += 1) {
    const x = width * (0.2 + i * 0.15);
    context.globalAlpha = 0.9 - i * 0.08;
    context.beginPath();
    context.moveTo(x, height * 0.73);
    context.bezierCurveTo(x + width * 0.03, height * 0.26, x + width * 0.08, height * 0.26, x + width * 0.11, height * 0.73);
    context.stroke();
  }

  context.globalAlpha = 1;
  context.lineWidth = 38;
  context.beginPath();
  context.moveTo(width * 0.18, height * 0.73);
  context.lineTo(width * 0.84, height * 0.73);
  context.stroke();
};

const createDemoImageUrl = (kind: PresetName): string => {
  const imageCanvas = document.createElement('canvas');
  imageCanvas.width = 900;
  imageCanvas.height = 560;

  const context = imageCanvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D is required to prepare the demo image.');
  }

  context.fillStyle = '#050509';
  context.fillRect(0, 0, imageCanvas.width, imageCanvas.height);

  if (kind === 'halo') drawHalo(context, imageCanvas.width, imageCanvas.height);
  if (kind === 'ribbon') drawRibbon(context, imageCanvas.width, imageCanvas.height);
  if (kind === 'signal') drawSignal(context, imageCanvas.width, imageCanvas.height);

  return imageCanvas.toDataURL('image/png');
};

const presets: Record<PresetName, DemoPreset> = {
  ribbon: {
    countLabel: '90k',
    imageKind: 'ribbon',
    modeLabel: 'Repel',
    options: {
      backgroundColor: '#0f0d2e',
      cursorMode: 'repel',
      cursorRadius: 0.13,
      cursorReturnDamping: 0.82,
      cursorReturnStrength: 0.55,
      imageFit: 'contain',
      particleColor: '#dda290',
      particleCount: 90000,
      particleOpacity: 0.26,
      particleSize: 0.9,
    },
    snippet: `createParticularDrift(canvas, {
  imageUrl,
  cursorMode: 'repel',
  particleCount: 90000,
});`,
  },
  halo: {
    countLabel: '70k',
    imageKind: 'halo',
    modeLabel: 'Attract',
    options: {
      attractionStrength: 92,
      backgroundColor: '#081417',
      cursorMode: 'attract',
      cursorRadius: 0.2,
      cursorStrength: 0.9,
      flowFieldScale: 3.2,
      imageFit: 'contain',
      particleColor: '#8fdad2',
      particleCount: 70000,
      particleOpacity: 0.3,
      particleSize: 1,
    },
    snippet: `createParticularDrift(canvas, {
  imageUrl,
  cursorMode: 'attract',
  cursorRadius: 0.2,
});`,
  },
  signal: {
    countLabel: '115k',
    imageKind: 'signal',
    modeLabel: 'Repel',
    options: {
      attractionStrength: 78,
      backgroundColor: '#120915',
      cursorMode: 'repel',
      cursorRadius: 0.1,
      cursorStrength: 1.8,
      flowFieldScale: 5,
      imageFit: 'stretch',
      particleColor: '#f0c66d',
      particleCount: 115000,
      particleOpacity: 0.22,
      particleSize: 0.78,
    },
    snippet: `createParticularDrift(canvas, {
  imageUrl,
  imageFit: 'stretch',
  particleCount: 115000,
});`,
  },
};

let drift: ParticularDriftInstance | undefined;
let currentPresetName: PresetName = 'ribbon';

const updateActiveButton = (name: PresetName): void => {
  presetButtons.forEach((button) => {
    const isSelected = button.dataset.preset === name;
    button.setAttribute('aria-pressed', String(isSelected));
  });
};

const loadPreset = async (name: PresetName): Promise<void> => {
  if (!canvas) {
    setStatus('Missing canvas element.');
    return;
  }

  currentPresetName = name;
  const preset = presets[name];
  setStatus('');
  setText(modeValue, preset.modeLabel);
  setText(countValue, preset.countLabel);
  setText(fitValue, preset.options.imageFit === 'stretch' ? 'Stretch' : 'Contain');
  setText(snippetCode, preset.snippet);
  updateActiveButton(name);

  const imageUrl = createDemoImageUrl(preset.imageKind);

  if (!drift) {
    drift = await createParticularDrift(canvas, {
      ...preset.options,
      imageUrl,
    });
    return;
  }

  drift.destroy();
  drift = await createParticularDrift(canvas, {
    ...preset.options,
    imageUrl,
  });
};

presetButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const presetName = button.dataset.preset as PresetName | undefined;
    if (!presetName || presetName === currentPresetName) return;
    loadPreset(presetName).catch((error: unknown) => {
      setStatus(error instanceof Error ? error.message : 'Unable to load example.');
    });
  });
});

window.addEventListener('resize', () => drift?.resize());
window.addEventListener('pagehide', () => {
  drift?.destroy();
  drift = undefined;
});

loadPreset(currentPresetName).catch((error: unknown) => {
  setStatus(error instanceof Error ? error.message : 'Unable to start animation.');
});
