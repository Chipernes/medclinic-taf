import * as allure from 'allure-js-commons';
import { test, expect } from '../fixtures.js';
import { DataProvider } from '../../src/data/DataProvider.js';
import { PatientFactory } from '../../src/data/PatientFactory.js';
import { AuthApi } from '../../src/api/AuthApi.js';
import { PatientApi } from '../../src/api/PatientApi.js';
import { config } from '../../src/core/config.js';

test.describe('Patients API', () => {
  test.beforeEach(async () => {
    await allure.epic('MedClinic Portal');
    await allure.feature('Реєстрація пацієнта');
  });

  for (const set of DataProvider.sets('patients.json', 'valid', 'boundary', 'invalid')) {
    test(`API-03 [${set.id}] ${set.category}: ${set.description} @api @regression`, async ({ patientApi, cleanup }) => {
      await allure.story(`Валідація форми: ${set.category}`);
      await allure.parameter('dataSet', set.id);
      const res = await patientApi.create(set.patient);
      if (res.status === 201) cleanup.patients.push(res.body.id);

      expect(res.status, `status for ${set.id}`).toBe(set.expected.status);
      if (set.expected.status === 201) {
        expect(res.body.fullName).toBe(set.patient.fullName.trim());
        expect(res.body.id).toBeGreaterThan(0);
      } else {
        expect(res.body.errors[set.expected.field]).toBe(set.expected.message);
      }
    });
  }

  test('API-04 Пацієнт не може реєструвати інших пацієнтів @api @security', async ({ api }) => {
    await allure.severity('critical');
    await allure.story('Рольова модель');
    const login = await new AuthApi(api).login(config.credentials.patient.login, config.credentials.patient.password);
    api.setToken(login.body.token);
    const res = await new PatientApi(api).create(PatientFactory.valid());
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Недостатньо прав');
  });
});
