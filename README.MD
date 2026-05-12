# Particular Drift

Reusable WebGL2 particle drift renderer for turning a fixed image into a flowing particle animation.

**Original project:** [collidingScopes/particular-drift](https://github.com/collidingScopes/particular-drift) by [Colliding Scopes](https://collidingScopes.github.io).

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
    cursorMode: 'repel',
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
- `imageFit`: `'contain'` preserves image aspect ratio inside the canvas; `'stretch'` uses the original full-canvas mapping.
- `particleCount`
- `particleSpeed`
- `attractionStrength`
- `particleOpacity`
- `particleSize`
- `edgeThreshold`
- `edgeSearchSteps`: `1`, `2`, or `3`; controls the bounded grid radius used when particles search for nearby edges.
- `flowFieldScale`
- `searchRadius`
- `noiseType`: `'2D'` or `'3D'`
- `interactive`: enables pointer interaction when `true`.
- `cursorMode`: `'repel'` pushes particles away from the cursor; `'attract'` pulls them toward it.
- `cursorRadius`: normalized cursor influence radius.
- `cursorStrength`: cursor force multiplier.
- `cursorReturnStrength`: force that pulls disturbed particles back toward their stored image target.
- `cursorReturnDamping`: damping applied while particles settle back after cursor disturbance.
- `backgroundColor`
- `particleColor`
- `autoStart`
- `maxDevicePixelRatio`

## Development

```bash
bun install
bun run dev
bun test
bun run typecheck
bun run build
```

## Publishing

CI publishes to npm from GitHub Actions when a GitHub Release is published, or when the `Publish` workflow is run manually.

Configure npm Trusted Publishing for this package with:

- Provider: GitHub Actions
- Owner: `basnijholt`
- Repository: `particular-drift`
- Workflow filename: `publish.yml`

Then release with a semver tag. The workflow strips the leading `v`, updates `package.json` in CI, and publishes that version to npm:

```bash
gh release create v0.1.1 --generate-notes
```

## Browser Requirements

- WebGL2
- Canvas image loading must satisfy browser CORS rules when using remote image URLs.

## License

MIT. See [LICENSE.txt](LICENSE.txt).

## Original Author

Particular Drift was created by Colliding Scopes. This package is a library-focused fork of that work.

- Original repository: [github.com/collidingScopes/particular-drift](https://github.com/collidingScopes/particular-drift)
- Original live demo: [collidingScopes.github.io/particular-drift](https://collidingScopes.github.io/particular-drift)
- Original author site: [collidingScopes.github.io](https://collidingScopes.github.io)
- Support the original author: [Buy Me a Coffee](https://www.buymeacoffee.com/stereoDrift)

<a href="https://www.buymeacoffee.com/stereoDrift" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/yellow_img.png" alt="Buy Me A Coffee"></a>
