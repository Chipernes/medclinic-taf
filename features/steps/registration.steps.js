// BDD-кроки: кожен крок Given/When/Then - це виклик одного або кількох keywords.
import { createBdd } from 'playwright-bdd';
import { test } from '../../tests/fixtures.js';
import { DataProvider } from '../../src/data/DataProvider.js';
import { PatientFactory } from '../../src/data/PatientFactory.js';

const { Given, When, Then } = createBdd(test);

Given('реєстратор увійшов у систему', async ({ keywords }) => {
  await keywords.LoginAs('registrar');
});

Given('відкрита форма реєстрації пацієнта', async ({ keywords }) => {
  await keywords.OpenApplication('patients');
});

When('реєстратор заповнює форму валідними даними пацієнта', async ({ keywords }) => {
  await keywords.FillPatientForm(PatientFactory.valid());
});

When('реєстратор заповнює форму даними з набору {string}', async ({ keywords }, id) => {
  await keywords.FillPatientForm(DataProvider.byId('patients.json', id).patient);
});

When('натискає кнопку відправки форми', async ({ keywords }) => {
  await keywords.SubmitForm();
});

Then('з\'являється повідомлення {string}', async ({ keywords }, text) => {
  await keywords.VerifySuccessMessage(text);
});

Then('результат відповідає очікуванню для набору {string}', async ({ keywords }, id) => {
  const { expected } = DataProvider.byId('patients.json', id);
  if (expected.status === 201) await keywords.VerifySuccessMessage('Пацієнта зареєстровано');
  else await keywords.VerifyValidationError(expected.field, expected.message);
});
