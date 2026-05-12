import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'vite.config.ts'],
    }),
  ],
  build: {
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
});
