import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/server/**/*.ts', 'src/lib/**/*.ts'],
      exclude: ['src/server/db/migrations/**', 'src/server/db/client.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // `server-only` is a Next.js build-time marker; stub it for tests.
      'server-only': path.resolve(__dirname, './tests/stubs/server-only.ts'),
    },
  },
});
