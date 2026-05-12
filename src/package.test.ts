import { describe, expect, it } from 'vitest';

import publishWorkflow from '../.github/workflows/publish.yml?raw';
import pagesWorkflow from '../.github/workflows/pages.yml?raw';
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

  it('deploys the examples site to GitHub Pages', () => {
    expect(packageJson.scripts?.['build:pages']).toBe('vite build --mode pages --outDir pages-dist');
    expect(packageJson.scripts?.['preview:pages']).toBe(
      'vite preview --outDir pages-dist --base /particular-drift/'
    );
    expect(pagesWorkflow).toContain('pages: write');
    expect(pagesWorkflow).toContain('id-token: write');
    expect(pagesWorkflow).toContain('bun run build:pages');
    expect(pagesWorkflow).toContain('actions/configure-pages@v5');
    expect(pagesWorkflow).toContain('actions/upload-pages-artifact@v3');
    expect(pagesWorkflow).toContain('actions/deploy-pages@v4');
  });
});
