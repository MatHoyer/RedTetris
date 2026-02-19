import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
  },
  root: 'client',
  base: '/',
  server: {
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3004',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    root: process.cwd(),
    include: ['server/__tests__/**/*.test.ts'],
    coverage: {
      include: ['server/src/game/**', 'events/**'],
    },
  },
});
