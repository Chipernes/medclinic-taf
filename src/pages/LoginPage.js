import { expect } from '@playwright/test';
import { BasePage } from './BasePage.js';
import { LoginLocators as L } from './locators/login.locators.js';
import { CommonLocators } from './locators/common.locators.js';

export class LoginPage extends BasePage {
  path = '/login.html';

  async login(login, password) {
    this.logger.info(`Login as "${login}"`);
    await this.fill(L.login, login);
    await this.fill(L.password, password);
    await this.page.locator(L.submit).click();
  }

  // Після успішного входу система переадресовує на робочу сторінку і показує ім'я користувача
  async expectLoggedIn() {
    await expect(this.page.locator(CommonLocators.currentUser)).not.toBeEmpty({ timeout: 7000 });
  }
}
