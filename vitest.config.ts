import { defineConfig } from 'vitest/config';

// Unit tests cover the plain TypeScript in src/ (calculation, parsing, storage). Anything that needs
// React Native components is exercised in the browser build instead.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
