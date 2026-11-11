import { test, expect } from '@playwright/test';
import { config } from '../core/config.js';
import { KeywordError } from '../core/errors.js';
import { LoginPage } from '../pages/LoginPage.js';
import { PatientRegistrationPage } from '../pages/PatientRegistrationPage.js';
import { AppointmentPage } from '../pages/AppointmentPage.js';

export class Keywords {
  constructor({ page, patientApi, logger, cleanup }) {
    this.page = page;
    this.patientApi = patientApi;
    this.logger = logger;
    this.cleanup = cleanup;
    this.pages = {
      login: new LoginPage(page, logger),
      patients: new PatientRegistrationPage(page, logger),
      appointment: new AppointmentPage(page, logger),
    };
    this.current = this.pages.login;
  }

  async #run(name, args, action) {
    return test.step(`Keyword: ${name} ${args.length ? JSON.stringify(args) : ''}`, async () => {
      this.logger.info(`KEYWORD ${name} ${JSON.stringify(args)}`);
      try {
        return await action();
      } catch (e) {
        this.logger.error(`KEYWORD ${name} FAILED: ${e.message.split('\n')[0]}`);
        throw new KeywordError(name, args, e);
      }
    });
  }

  // 1
  OpenApplication(pageName = 'login') {
    return this.#run('OpenApplication', [pageName], async () => {
      this.current = this.pages[pageName];
      if (!this.current) throw new Error(`Unknown page "${pageName}"`);
      await this.current.open();
    });
  }

  // 2
  LoginAs(role) {
    return this.#run('LoginAs', [role], async () => {
      const creds = config.credentials[role];
      if (!creds) throw new Error(`No credentials for role "${role}"`);
      await this.pages.login.open();
      await this.pages.login.login(creds.login, creds.password);
      await this.pages.login.expectLoggedIn();
    });
  }

  // 3
  FillPatientForm(patient) {
    return this.#run('FillPatientForm', [patient.fullName], async () => {
      this.current = this.pages.patients;
      await this.pages.patients.fillForm(patient);
    });
  }

  // 4
  SubmitForm() {
    return this.#run('SubmitForm', [], async () => {
      await this.page.locator('button[type="submit"]').click();
    });
  }

  // 5
  VerifySuccessMessage(expectedText) {
    return this.#run('VerifySuccessMessage', [expectedText], async () => {
      const text = await this.current.alertText();
      expect(text).toContain(expectedText);
      const alert = this.page.locator('[data-testid="alert"]');
      const patientId = await alert.getAttribute('data-patient-id');
      const appointmentId = await alert.getAttribute('data-appointment-id');
      if (patientId) this.cleanup.patients.push(Number(patientId));
      if (appointmentId) this.cleanup.appointments.push(Number(appointmentId));
      return patientId ? Number(patientId) : (appointmentId ? Number(appointmentId) : null);
    });
  }

  // 6
  VerifyValidationError(field, expectedMessage) {
    return this.#run('VerifyValidationError', [field, expectedMessage], async () => {
      await expect(this.current.fieldError(field)).toHaveText(expectedMessage, { timeout: 7000 });
    });
  }

  // 7
  BookAppointment(appointment) {
    return this.#run('BookAppointment', [appointment], async () => {
      this.current = this.pages.appointment;
      await this.pages.appointment.open();
      await this.pages.appointment.book(appointment);
    });
  }

  // 8
  CreatePatientViaApi(patient) {
    return this.#run('CreatePatientViaApi', [patient.fullName], async () => {
      const res = await this.patientApi.create(patient);
      expect(res.status, 'patient must be created as precondition').toBe(201);
      this.cleanup.patients.push(res.body.id);
      return res.body.id;
    });
  }
}

export const KEYWORDS = ['OpenApplication', 'LoginAs', 'FillPatientForm', 'SubmitForm',
  'VerifySuccessMessage', 'VerifyValidationError', 'BookAppointment', 'CreatePatientViaApi'];
