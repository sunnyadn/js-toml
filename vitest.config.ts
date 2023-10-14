import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.?(c|m)[jt]s'],
    globals: true,
    watch: false,
    setupFiles: ['test.setup.ts'],
  },
});
