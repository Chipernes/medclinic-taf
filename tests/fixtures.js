// Фікстури Playwright = Pre-conditions (setup) і Post-conditions (teardown) для всіх тестів.
// Тут збираються всі шари: Core (logger, ApiClient) -> Business Logic (API, Keywords) -> Test Scripts.
import { expect } from '@playwright/test';
import { test as base } from 'playwright-bdd';
import { Logger } from '../src/core/logger.js';
import { ApiClient } from '../src/core/ApiClient.js';
import { config } from '../src/core/config.js';
import { AuthApi } from '../src/api/AuthApi.js';
import { PatientApi } from '../src/api/PatientApi.js';
import { AppointmentApi } from '../src/api/AppointmentApi.js';
import { Keywords } from '../src/keywords/Keywords.js';

export const test = base.extend({
  // Логер на кожен тест. Після тесту весь лог прикріплюється до Allure.
  logger: async ({}, use, testInfo) => {
    // у кожному рядку лога - короткий ID тесту, наприклад "TC-GUI-03 [A4]"
    const shortId = (testInfo.title.match(/^TC-[A-Z]+-\d+(?: \[[A-Z0-9]+\])?/) || [testInfo.title.slice(0, 30)])[0];
    const logger = new Logger(shortId);
    logger.info(`=== START ${testInfo.titlePath.slice(1).join(' > ')} (env=${config.env}, worker=${testInfo.workerIndex})`);
    await use(logger);
    logger.info(`=== END status=${testInfo.status} duration=${testInfo.duration} ms`);
    await testInfo.attach('test-log.txt', { body: logger.toString(), contentType: 'text/plain' });
  },

  api: async ({ request, logger }, use) => {
    await use(new ApiClient(request, logger));
  },

  // Setup: отримуємо токен реєстратора через API (швидше і стабільніше, ніж через GUI)
  registrarApi: async ({ api }, use) => {
    const res = await new AuthApi(api).login(config.credentials.registrar.login, config.credentials.registrar.password);
    expect(res.status, 'registrar login in setup').toBe(200);
    api.setToken(res.body.token);
    await use(api);
  },

  patientApi: async ({ registrarApi }, use) => use(new PatientApi(registrarApi)),
  appointmentApi: async ({ registrarApi }, use) => use(new AppointmentApi(registrarApi)),

  // Teardown: видаляємо все, що тест створив, навіть якщо він упав
  cleanup: async ({ patientApi, appointmentApi, logger }, use) => {
    const created = { patients: [], appointments: [] };
    await use(created);
    for (const id of created.appointments) await appointmentApi.cancel(id).catch(e => logger.warn(`cleanup appointment ${id}: ${e.message}`));
    for (const id of created.patients) await patientApi.remove(id).catch(e => logger.warn(`cleanup patient ${id}: ${e.message}`));
    logger.info(`Cleanup: removed ${created.patients.length} patients, ${created.appointments.length} appointments`);
  },

  keywords: async ({ page, patientApi, logger, cleanup }, use) => {
    await use(new Keywords({ page, patientApi, logger, cleanup }));
  },

  // Failure Recovery: якщо GUI-тест упав - скріншот, URL і HTML сторінки йдуть у звіт
  page: async ({ page, logger }, use, testInfo) => {
    page.on('console', msg => { if (msg.type() === 'error') logger.warn(`Browser console error: ${msg.text()}`); });
    page.on('pageerror', err => logger.error(`Page JS error: ${err.message}`));
    await use(page);
    if (testInfo.status !== testInfo.expectedStatus) {
      logger.error(`Test failed on ${page.url()}, capturing screenshot`);
      try {
        await testInfo.attach('screenshot-on-failure.png', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' });
        await testInfo.attach('page.html', { body: await page.content(), contentType: 'text/html' });
      } catch (e) {
        logger.warn(`Could not capture failure artifacts: ${e.message}`);
      }
    }
  },
});

export { expect };
