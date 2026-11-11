import * as allure from 'allure-js-commons';
import { test, expect } from '../fixtures.js';
import { AuthApi } from '../../src/api/AuthApi.js';
import { config } from '../../src/core/config.js';

test.describe('Auth API', () => {
  test.beforeEach(async () => {
    await allure.epic('MedClinic Portal');
    await allure.feature('Авторизація');
  });

  test('TC-API-01 Реєстратор входить з валідними даними @smoke @api', async ({ api }) => {
    await allure.severity('blocker');
    const res = await new AuthApi(api).login(config.credentials.registrar.login, config.credentials.registrar.password);
    expect(res.status).toBe(200);
    expect(res.body.role).toBe('registrar');
    expect(res.body.token).toMatch(/^[0-9a-f-]{36}$/);
    expect(res.timeMs, 'response time').toBeLessThan(2000);
  });

  test('TC-API-02 Вхід з неправильним паролем відхиляється @api @security', async ({ api }) => {
    await allure.severity('critical');
    const res = await new AuthApi(api).login('registrar', 'wrong-password');
    expect(res.status).toBe(401);
    expect(res.body).not.toHaveProperty('token');
  });
});
