import { defineConfig, devices } from '@playwright/test'

const inCI = !!process.env.CI
// Without BASE_URL the tests run against the Vite dev server, which serves hundreds of
// unbundled modules on every page load, so each navigation takes seconds
const againstDevServer = !process.env.BASE_URL

export default defineConfig({
  testDir: 'e2e/specs',
  timeout: againstDevServer ? 90_000 : 30_000,
  // Tests share one database
  fullyParallel: false,
  workers: 1,
  forbidOnly: inCI,
  retries: inCI ? 2 : 0,
  reporter: inCI ? [['html', { open: 'never' }], ['github']] : [['list'], ['html', { open: 'never' }]],
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    viewport: { width: 1800, height: 1200 },
    actionTimeout: 10_000,
    navigationTimeout: 60_000,
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1800, height: 1200 } },
    },
  ],
})
