// Core Layer: логер. Пише кожен рядок у консоль (за LOG_LEVEL), у спільний файл logs/test-run.log
// і в буфер поточного тесту, який фікстура після тесту прикріплює до звіту Allure.
import fs from 'node:fs';
import path from 'node:path';

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const threshold = LEVELS[process.env.LOG_LEVEL || 'info'];
const logFile = path.resolve('logs/test-run.log');
fs.mkdirSync(path.dirname(logFile), { recursive: true });

export class Logger {
  constructor(testName) {
    this.testName = testName;
    this.lines = [];
  }

  #write(level, message) {
    // ANSI-кольори з повідомлень Playwright прибираємо, щоб лог-файл був чистим
    const clean = String(message).replace(/\x1b\[[0-9;]*m/g, '');
    const line = `${new Date().toISOString()} [${level.toUpperCase().padEnd(5)}] [${this.testName}] ${clean}`;
    this.lines.push(line);
    fs.appendFileSync(logFile, line + '\n');
    if (LEVELS[level] >= threshold && process.env.LOG_CONSOLE === '1') console.log(line);
  }

  debug(m) { this.#write('debug', m); }
  info(m) { this.#write('info', m); }
  warn(m) { this.#write('warn', m); }
  error(m) { this.#write('error', m); }

  toString() { return this.lines.join('\n'); }
}
