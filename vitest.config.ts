import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'app',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'lint',
          environment: 'node',
          include: ['lint/**/*.test.ts'],
          testTimeout: 20_000,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/core/**/*.ts', 'src/adapters/**/*.ts'],
      exclude: ['**/*.test.ts'],
      thresholds: { statements: 90, branches: 90, functions: 90, lines: 90 },
    },
  },
});
