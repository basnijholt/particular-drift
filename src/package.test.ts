import { describe, expect, it } from 'vitest';

import publishWorkflow from '../.github/workflows/publish.yml?raw';
import packageJson from '../package.json';

describe('package scripts', () => {
  it('starts the browser demo through bun run dev', () => {
    expect(packageJson.scripts?.dev).toBe('vite --host 0.0.0.0 --open');
  });

  it('publishes the scoped package publicly by default', () => {
    expect(packageJson.name).toBe('@basnijholt/particular-drift');
    expect(packageJson.publishConfig).toEqual({ access: 'public' });
  });

  it('publishes releases through npm trusted publishing', () => {
    expect(publishWorkflow).toContain("release:");
    expect(publishWorkflow).toContain("types: [published]");
    expect(publishWorkflow).toContain("id-token: write");
    expect(publishWorkflow).toContain("node-version: '24'");
    expect(publishWorkflow).toContain('github.event.release.tag_name');
    expect(publishWorkflow).toContain('npm version "$VERSION" --no-git-tag-version --allow-same-version');
    expect(publishWorkflow).toContain('npm publish');
    expect(publishWorkflow).not.toContain('NPM_TOKEN');
  });
});
