// Конфігурація запуску: середовище, паралелізація, репортери, таймаути, проєкти (api / gui / bdd).
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { config } from './src/core/config.js';

const bddTestDir = defineBddConfig({
  features: 'features/*.feature',
  steps: ['features/steps/*.js', 'tests/fixtures.js'],
  outputDir: '.features-gen',
});

export default defineConfig({
  fullyParallel: true,
  workers: Number(process.env.WORKERS || config.workers),
  retries: process.env.CI ? 1 : 0,          // у CI один перезапуск, щоб Allure позначив flaky-тести
  timeout: 30_000,
  expect: { timeout: 7_000 },
  forbidOnly: !!process.env.CI,
  reporter: [
    ['list'],
    ['allure-playwright', {
      resultsDir: 'allure-results',
      environmentInfo: { ENV: config.env, BASE_URL: config.baseURL, NODE: process.version },
    }],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: config.baseURL,
    headless: true,
    locale: 'uk-UA',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    trace: 'retain-on-failure',
    screenshot: 'off',                      // скріншот при падінні робить власна фікстура (tests/fixtures.js)
    ...(process.env.CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.CHROMIUM_PATH } } : {}),
  },
  projects: [
    { name: 'api', testDir: 'tests/api' },
    { name: 'gui', testDir: 'tests', testMatch: ['gui/**/*.spec.js', 'kdt/**/*.spec.js'] },
    { name: 'bdd', testDir: bddTestDir },
  ],
  // Для dev-середовища навчальний стенд піднімається автоматично
  webServer: config.startLocalApp ? {
    command: 'node app/server.js',
    url: `${config.baseURL}/login.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 20_000,
  } : undefined,
});
