# MedClinic TAF

Фреймворк автоматизації тестування для вебпорталу клініки MedClinic Portal (ЛР5, напрям MedTech / Healthcare).

Стек: Playwright Test (JavaScript), playwright-bdd, Allure Report 3, GitHub Actions.

## Запуск

```bash
npm ci
npx playwright install chromium
npm test                 # усі тести (стенд app/server.js піднімається автоматично)
npm run test:smoke       # тільки @smoke
npm run test:api         # тільки API
npm run test:stability   # кожен тест 3 рази - перевірка на flaky
npm run report           # згенерувати Allure-звіт у ./allure-report
```

Параметри: `ENV=dev|staging|prod`, `WORKERS=4`, `LOG_LEVEL=debug`, `LOG_CONSOLE=1`.

## Шари (gTAA)

| Шар | Папка |
|---|---|
| Test Scripts | `tests/`, `features/` |
| Business Logic | `src/pages/`, `src/api/`, `src/keywords/` |
| Core / Adaptation | `src/core/`, `playwright.config.js` |
| Test Data | `data/`, `src/data/`, `config/` |

Навчальний стенд `app/` містить два навмисні дефекти (BUG-01, BUG-02), які знаходять тести TC-API-03 [B4] і TC-GUI-03 [A4].
