import { BasePage } from './BasePage.js';
import { PatientLocators as L } from './locators/patient.locators.js';

export class PatientRegistrationPage extends BasePage {
  path = '/patients.html';

  async fillForm(patient) {
    this.logger.info(`Fill patient form: ${JSON.stringify(patient)}`);
    await this.fill(L.fullName, patient.fullName);
    await this.fill(L.birthDate, patient.birthDate);
    await this.fill(L.phone, patient.phone);
    await this.fill(L.email, patient.email);
    if (patient.allergies) await this.fill(L.allergies, patient.allergies);
  }

  async submit() {
    await this.page.locator(L.submit).click();
  }

  async createdPatientId() {
    await this.alertText();
    const id = await this.page.locator('[data-testid="alert"]').getAttribute('data-patient-id');
    return id ? Number(id) : null;
  }
}
