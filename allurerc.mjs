import { defineConfig } from 'allure';

export default defineConfig({
  name: 'MedClinic Portal - Test Automation Report',
  output: './allure-report',
  plugins: {
    awesome: { options: { reportName: 'MedClinic Portal', singleFile: false, reportLanguage: 'en' } },
  },
});
