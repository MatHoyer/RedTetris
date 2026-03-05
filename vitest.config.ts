import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      include: [
        'server/src/game/**',
        'events/**',
        'client/src/components/**',
        'client/src/pages/**',
        'client/src/hooks/**',
        'client/src/redux.ts',
      ],
    },
    projects: [
      { test: { include: ['server/__tests__/**/*.test.ts'], name: 'server', environment: 'node' } },
      { test: { include: ['client/__test__/**/*.test.{ts,tsx}'], name: 'client', environment: 'jsdom' } },
    ],
  },
});
