import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
  },
  publicDir: 'public',
  root: 'client',
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: 'client/src/main.tsx',
      },
    },
    lib: {
      entry: 'public/index.html',
      name: 'red-tetris',
    },
    outDir: 'dist',
    emptyOutDir: true,
    // cssMinify: true,
    watch: {
      include: 'client/src/**',
      exclude: 'node_modules/**',
    },
  },
});
