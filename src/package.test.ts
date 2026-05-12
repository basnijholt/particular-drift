import { describe, expect, it } from 'vitest';

import packageJson from '../package.json';

describe('package scripts', () => {
  it('starts the browser demo through bun run dev', () => {
    expect(packageJson.scripts?.dev).toBe('vite --host 0.0.0.0 --open');
  });
});
