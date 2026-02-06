import { defineConfig } from 'vite';
import { resolve } from 'path';

/** UMD builds for CDN usage (core + icons as separate bundles) */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/glass-ripple.ts'),
      formats: ['umd'],
      name: 'GlassRipple',
      fileName: () => 'glass-ripple.umd.cjs',
    },
    rollupOptions: {
      external: ['three'],
      output: {
        globals: { three: 'THREE' },
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
});
