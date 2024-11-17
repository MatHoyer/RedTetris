import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  },
  publicDir: 'public',
  root: 'client',
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: 'client/src/main.jsx',
      },

    },
    lib: {
      entry: 'public/index.html',
      name: 'red-tetris',
    },
    outDir: 'dist',
    emptyOutDir: true,
    cssMinify: true,
    watch: {
      include: 'client/src/**',
      exclude: 'node_modules/**',
    },
  },
});
