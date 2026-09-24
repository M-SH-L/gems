import { configDefaults, defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    passWithNoTests: true,
    // Playwright specs run via `npm run test:e2e`, not Vitest.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
