import { defineConfig, devices } from '@playwright/test';

/**
 * Relm E2E. BASE_URL points at the storefront of the target environment (staging by default).
 * Suites: @smoke gates releases; @relm-<n> per feature; @quarantine never gates (QA-4).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // QA-4: flakes are quarantined, not retried away
  reporter: [['list'], ['json', { outputFile: 'test-results/report.json' }]],
  grepInvert: process.env.INCLUDE_QUARANTINE ? undefined : /@quarantine/,
  use: {
    baseURL: process.env.BASE_URL ?? 'https://staging.storefront.relm.example',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
