import { defineConfig } from 'vite';
import { resolve } from 'path';

/** UMD build for icons barrel — exposes window.GlassRippleIcons */
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/icons/index.ts'),
      formats: ['umd'],
      name: 'GlassRippleIcons',
      fileName: () => 'icons/index.umd.cjs',
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
