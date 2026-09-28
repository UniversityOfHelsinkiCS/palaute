import { defineConfig, devices } from '@playwright/test'

import type { ManualOptions } from './e2e/manual/fixtures'

const viewport = { width: 1360, height: 860 }

// Records user manual videos, see e2e/manual/README.md
export default defineConfig<ManualOptions>({
  testDir: 'e2e/manual/scenarios',
  testMatch: '*.manual.ts',
  outputDir: 'test-results/manual',
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    actionTimeout: 15_000,
    navigationTimeout: 60_000,
    video: { mode: 'retain-on-failure', size: viewport },
    launchOptions: { slowMo: 80 },
  },
  projects: [
    {
      name: 'fi',
      use: { ...devices['Desktop Chrome'], viewport, lang: 'fi', locale: 'fi-FI' },
    },
  ],
})
