import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';

const reactBuildPlugins = react().map((plugin) => ({
  ...plugin,
  apply: 'build' as const,
}));

export default defineConfig(({ mode }) => {
  const isPagesBuild = mode === 'pages';

  return {
    base: isPagesBuild ? '/particular-drift/' : '/',
    plugins: isPagesBuild
      ? []
      : [
          ...reactBuildPlugins,
          dts({
            entryRoot: 'src',
            exclude: ['demo/**', 'src/**/*.test.ts', 'src/**/*.test.tsx', 'vite.config.ts'],
          }),
        ],
    build: isPagesBuild
      ? {}
      : {
          lib: {
            entry: {
              'particular-drift': new URL('src/index.ts', import.meta.url).pathname,
              react: new URL('src/react.tsx', import.meta.url).pathname,
            },
            formats: ['es'],
          },
          rollupOptions: {
            external: ['react', 'react/jsx-runtime'],
          },
        },
    test: {
      environment: 'node',
    },
  };
});
