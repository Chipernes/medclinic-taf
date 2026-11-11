import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { AppointmentLocators as L } from './locators/appointment.locators.js';

export class AppointmentPage extends BasePage {
  path = '/appointment.html';

  // Список лікарів підвантажується асинхронно - явно чекаємо, поки з'являться опції
  async waitForLoaded() {
    await super.waitForLoaded();
    await expect(this.page.locator(L.doctorOptions).first()).toBeAttached({ timeout: 7000 });
  }

  async book({ patientId, doctorId, date, time }) {
    this.logger.info(`Book appointment: patient=${patientId}, doctor=${doctorId}, ${date} ${time}`);
    await this.fill(L.patientId, String(patientId));
    await this.page.locator(L.doctor).selectOption(String(doctorId));
    await this.fill(L.date, date);
    await this.fill(L.time, time);
    await this.page.locator(L.submit).click();
  }
}
