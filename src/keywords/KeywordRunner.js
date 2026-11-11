// Виконує тест, описаний таблицею ключових слів у JSON (класичний KDT).
// Значення "$name" підставляються з контексту: так результат одного кроку передається в наступний.
import { KEYWORDS } from './Keywords.js';

export class KeywordRunner {
  constructor(keywords) {
    this.keywords = keywords;
    this.context = {};
  }

  #resolve(value) {
    if (typeof value === 'string' && value.startsWith('$')) return this.context[value.slice(1)];
    if (Array.isArray(value)) return value.map(v => this.#resolve(v));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, this.#resolve(v)]));
    return value;
  }

  async run(table) {
    for (const [i, row] of table.steps.entries()) {
      if (!KEYWORDS.includes(row.keyword)) throw new Error(`Row ${i + 1}: unknown keyword "${row.keyword}"`);
      const args = this.#resolve(row.args || []);
      const result = await this.keywords[row.keyword](...args);
      if (row.saveAs) this.context[row.saveAs] = result;
    }
  }
}
