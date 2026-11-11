// Business Logic Layer: базовий Page Object. Спільна логіка для всіх сторінок.
// Ніяких sleep: тільки очікування стану елемента (auto-wait Playwright + explicit expect).
import { expect } from '@playwright/test';
import { CommonLocators } from './locators/common.locators.js';

export class BasePage {
  path = '/';

  constructor(page, logger) {
    this.page = page;
    this.logger = logger;
  }

  async open() {
    this.logger.info(`Open page ${this.path}`);
    await this.page.goto(this.path);
    await this.waitForLoaded();
  }

  async waitForLoaded() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async fill(selector, value) {
    const field = this.page.locator(selector);
    await expect(field).toBeEditable();
    await field.fill(value ?? '');
  }

  // Повідомлення про результат з'являється після відповіді API (100-600 мс),
  // тому чекаємо саме на нього, а не фіксований час.
  async alertText() {
    const alert = this.page.locator(CommonLocators.alert);
    await expect(alert).toBeVisible({ timeout: 7000 });
    return alert.innerText();
  }

  fieldError(field) {
    return this.page.locator(CommonLocators.fieldError(field));
  }
}
