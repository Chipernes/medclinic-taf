// Test Data Layer: Data Provider. Зчитує набори даних із зовнішніх JSON-файлів
// і підставляє динамічні значення, щоб дані не "старіли" (дата народження, дата прийому).
import fs from 'node:fs';
import path from 'node:path';

const iso = (d) => d.toISOString().slice(0, 10);

function macro(expr) {
  const now = new Date();
  const m = /^today(?:([+-])(\d+)([dy]))?$/.exec(expr);
  if (m) {
    const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    if (m[1]) {
      const n = Number(m[2]) * (m[1] === '-' ? -1 : 1);
      if (m[3] === 'd') d.setUTCDate(d.getUTCDate() + n);
      else d.setUTCFullYear(d.getUTCFullYear() + n);
    }
    return iso(d);
  }
  if (expr === 'uniq') return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  if (expr.startsWith('repeat:')) { const [, ch, n] = expr.split(':'); return ch.repeat(Number(n)); }
  throw new Error(`Unknown data macro {{${expr}}}`);
}

function resolve(value) {
  if (typeof value === 'string') return value.replace(/\{\{([^}]+)\}\}/g, (_, e) => macro(e.trim()));
  if (Array.isArray(value)) return value.map(resolve);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v)]));
  return value;
}

export class DataProvider {
  static load(file) {
    const raw = JSON.parse(fs.readFileSync(path.resolve('data', file), 'utf-8'));
    return resolve(raw);
  }

  static sets(file, ...categories) {
    const data = DataProvider.load(file);
    const cats = categories.length ? categories : Object.keys(data.sets);
    return cats.flatMap(c => (data.sets[c] || []).map(s => ({ category: c, ...s })));
  }

  static byId(file, id) {
    const found = DataProvider.sets(file).find(s => s.id === id);
    if (!found) throw new Error(`Data set "${id}" not found in ${file}`);
    return found;
  }
}
