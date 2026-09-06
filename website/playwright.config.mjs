import { defineConfig } from '@playwright/test';
import { root } from './scripts/toolchain.mjs';

const port = Number(process.env.SITE_TEST_PORT || 4173);
export default defineConfig({
  testDir: './tests/browser',
  outputDir: './test-results/browser',
  timeout: 30000,
  expect: { timeout: 10000 },
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: [['list'], ['html', { outputFolder: `${root}/website/playwright-report`, open: 'never' }]],
  use: { baseURL: `http://127.0.0.1:${port}/cc4pm/`, trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { browserName: 'chromium', viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: { command: 'node website/scripts/serve.mjs', cwd: root, url: `http://127.0.0.1:${port}/cc4pm/`, reuseExistingServer: false, timeout: 15000 },
});
