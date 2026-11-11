import * as allure from 'allure-js-commons';
import { test } from '../fixtures.js';
import { DataProvider } from '../../src/data/DataProvider.js';
import { PatientFactory } from '../../src/data/PatientFactory.js';

test.describe('Appointment Booking (GUI)', () => {
  for (const set of DataProvider.sets('appointments.json')) {
    test(`TC-GUI-03 [${set.id}] ${set.category}: ${set.description} @gui @regression`, async ({ keywords }) => {
      await allure.epic('MedClinic Portal');
      await allure.feature('Appointment Booking');
      await allure.parameter('dataSet', set.id);
      const patientId = await keywords.CreatePatientViaApi(PatientFactory.valid());
      await keywords.LoginAs('registrar');
      await keywords.BookAppointment({ ...set.appointment, patientId });
      if (set.expected.status === 201) await keywords.VerifySuccessMessage('Appointment created');
      else await keywords.VerifyValidationError(set.expected.field, set.expected.message);
    });
  }
});
