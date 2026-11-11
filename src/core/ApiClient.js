// Core / Adaptation Layer: обгортка над Playwright APIRequestContext.
// Логує кожен запит і відповідь (метод, URL, тіло, статус, час) і прикріплює їх до звіту Allure.
import { test } from '@playwright/test';
import { ApiError } from './errors.js';

const MASK = ['password', 'token'];
const mask = (obj) => (obj && typeof obj === 'object'
  ? Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, MASK.includes(k) ? '***' : v]))
  : obj);

export class ApiClient {
  constructor(request, logger) {
    this.request = request;
    this.logger = logger;
    this.token = null;
  }

  setToken(token) { this.token = token; }

  async send(method, url, { data, token } = {}) {
    const headers = {};
    const auth = token === undefined ? this.token : token;
    if (auth) headers.Authorization = `Bearer ${auth}`;

    this.logger.info(`→ ${method} ${url} ${data ? JSON.stringify(mask(data)) : ''}`);
    const started = Date.now();
    let response;
    try {
      response = await this.request.fetch(url, { method, data, headers });
    } catch (e) {
      this.logger.error(`✗ ${method} ${url} network error: ${e.message}`);
      throw new ApiError(method, url, e);
    }
    const ms = Date.now() - started;
    const text = await response.text();
    let body;
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    this.logger.info(`← ${response.status()} ${method} ${url} (${ms} ms) ${JSON.stringify(mask(body))}`);

    await test.info().attach(`HTTP ${method} ${url} → ${response.status()}`, {
      contentType: 'application/json',
      body: JSON.stringify({ request: { method, url, body: mask(data) }, response: { status: response.status(), timeMs: ms, body: mask(body) } }, null, 2),
    });
    return { status: response.status(), body, timeMs: ms };
  }

  get(url, opts) { return this.send('GET', url, opts); }
  post(url, data, opts = {}) { return this.send('POST', url, { ...opts, data }); }
  delete(url, opts) { return this.send('DELETE', url, opts); }
}
