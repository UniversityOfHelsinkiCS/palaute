import { defineConfig, devices } from '@playwright/test'

import type { ManualOptions } from './e2e/manual/fixtures'

const viewport = { width: 1360, height: 860 }
// record.ts first runs the scenarios without video to generate the narration, then records
const narrationPass = process.env.MANUAL_PASS === 'narrate'

// Records user manual videos, see e2e/manual/README.md
export default defineConfig<ManualOptions>({
  testDir: 'e2e/manual/scenarios',
  testMatch: '*.manual.ts',
  outputDir: 'test-results/manual',
  fullyParallel: false,
  workers: 1,
  timeout: narrationPass ? 0 : 180_000,
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:8000',
    actionTimeout: 15_000,
    navigationTimeout: 60_000,
    video: narrationPass ? 'off' : { mode: 'retain-on-failure', size: viewport },
    // Only without video, as tracing could make the recording stutter, and a failed recording keeps its video
    trace: narrationPass ? 'retain-on-failure' : 'off',
  },
  projects: [
    {
      name: 'fi',
      use: {
        ...devices['Desktop Chrome'],
        viewport,
        lang: 'fi',
        locale: 'fi-FI',
        timezoneId: 'Europe/Helsinki',
      },
    },
    {
      name: 'en',
      use: {
        ...devices['Desktop Chrome'],
        viewport,
        lang: 'en',
        locale: 'en-GB',
        timezoneId: 'Europe/Helsinki',
      },
    },
  ],
})
