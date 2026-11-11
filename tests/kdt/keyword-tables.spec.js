// Класичний Keyword-Driven тест: сценарій описаний не кодом, а таблицею ключових слів у JSON.
import * as allure from 'allure-js-commons';
import { test } from '../fixtures.js';
import { DataProvider } from '../../src/data/DataProvider.js';
import { KeywordRunner } from '../../src/keywords/KeywordRunner.js';

const table = DataProvider.load('keyword-tables/register-and-book.json');

test(`TC-KDT-01 ${table.name} @smoke @gui @kdt`, async ({ keywords }) => {
  await allure.epic('MedClinic Portal');
  await allure.feature('Наскрізний сценарій (KDT)');
  await allure.severity('critical');
  await new KeywordRunner(keywords).run(table);
});
