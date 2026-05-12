# Particular Drift

Reusable WebGL2 particle drift renderer for turning a fixed image into a flowing particle animation.

This fork is packaged as an embeddable library. It intentionally removes the original demo UI, upload controls, and MP4 export stack so applications can hardcode their own image and own the surrounding interface.

## Install

```bash
bun add github:basnijholt/particular-drift
```

After publishing to npm, install with:

```bash
bun add @basnijholt/particular-drift
```

## Vanilla Usage

```ts
import { createParticularDrift } from '@basnijholt/particular-drift';

const canvas = document.querySelector<HTMLCanvasElement>('#background');

if (canvas) {
  const drift = await createParticularDrift(canvas, {
    imageUrl: '/res/branding/mindroom-logo.png',
    backgroundColor: '#0f0d2e',
    particleColor: '#dda290',
    particleCount: 120000,
  });

  window.addEventListener('resize', drift.resize);
}
```

## React Usage

```tsx
import { ParticularDriftCanvas } from '@basnijholt/particular-drift/react';

export function AuthBackground() {
  return (
    <ParticularDriftCanvas
      imageUrl="/res/branding/mindroom-logo.png"
      options={{
        backgroundColor: '#0f0d2e',
        particleColor: '#dda290',
        particleCount: 120000,
      }}
    />
  );
}
```

## API

`createParticularDrift(canvas, options)` returns:

- `loadImage(image)` to load an existing `TexImageSource`.
- `loadImageUrl(url)` to load an image URL.
- `resize()` to resize the backing canvas to its rendered CSS size.
- `start()` and `stop()` to control animation.
- `destroy()` to cancel animation and release WebGL resources.

Main options:

- `imageUrl`
- `particleCount`
- `particleSpeed`
- `attractionStrength`
- `particleOpacity`
- `particleSize`
- `edgeThreshold`
- `flowFieldScale`
- `searchRadius`
- `noiseType`: `'2D'` or `'3D'`
- `backgroundColor`
- `particleColor`
- `autoStart`
- `maxDevicePixelRatio`

## Development

```bash
bun install
bun test
bun run typecheck
bun run build
```

## Browser Requirements

- WebGL2
- Canvas image loading must satisfy browser CORS rules when using remote image URLs.

## License

MIT. See [LICENSE.txt](LICENSE.txt).
