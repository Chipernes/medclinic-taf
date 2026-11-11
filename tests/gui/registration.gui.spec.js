import * as allure from 'allure-js-commons';
import { test } from '../fixtures.js';
import { DataProvider } from '../../src/data/DataProvider.js';
import { PatientFactory } from '../../src/data/PatientFactory.js';

test.describe('Patient Registration (GUI)', () => {
  test.beforeEach(async ({ keywords }) => {
    await allure.epic('MedClinic Portal');
    await allure.feature('Patient Registration');
    await keywords.LoginAs('registrar');
    await keywords.OpenApplication('patients');
  });

  test('GUI-01 Registrar successfully registers a new patient @smoke @gui', async ({ keywords }) => {
    await allure.severity('blocker');
    await keywords.FillPatientForm(PatientFactory.valid());
    await keywords.SubmitForm();
    await keywords.VerifySuccessMessage('Patient registered');
  });

  for (const set of DataProvider.sets('patients.json', 'invalid')) {
    test(`GUI-02 [${set.id}] Validation error: ${set.description} @gui @regression`, async ({ keywords }) => {
      await allure.parameter('dataSet', set.id);
      await keywords.FillPatientForm(set.patient);
      await keywords.SubmitForm();
      await keywords.VerifyValidationError(set.expected.field, set.expected.message);
    });
  }
});
