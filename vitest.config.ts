import { defineConfig } from 'vitest/config'

// Unit tests. Separate from vite.config.ts, which builds the client and injects node-config into it.
// End-to-end tests are Playwright specs in e2e/.
export default defineConfig({
  test: {
    include: ['src/server/**/*.test.ts', 'src/client/**/*.test.ts'],
    environment: 'node',
  },
})
