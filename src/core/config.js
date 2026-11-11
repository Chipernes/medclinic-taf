// Core Layer: єдина точка доступу до конфігурації середовища.
// Середовище обирається змінною ENV (dev | staging | prod), за замовчуванням dev.
import fs from 'node:fs';
import path from 'node:path';

const envs = JSON.parse(fs.readFileSync(path.resolve('config/environments.json'), 'utf-8'));
const name = process.env.ENV || 'dev';
if (!envs[name]) throw new Error(`Невідоме середовище ENV=${name}. Доступні: ${Object.keys(envs).join(', ')}`);

export const config = {
  env: name,
  ...envs[name],
  baseURL: process.env.BASE_URL || envs[name].baseURL,
  // Облікові дані не зберігаються в коді: у CI вони приходять із GitHub Secrets
  credentials: {
    registrar: { login: process.env.REGISTRAR_LOGIN || 'registrar', password: process.env.REGISTRAR_PASSWORD || 'Registrar#2026' },
    doctor: { login: process.env.DOCTOR_LOGIN || 'doctor', password: process.env.DOCTOR_PASSWORD || 'Doctor#2026' },
    patient: { login: process.env.PATIENT_LOGIN || 'patient', password: process.env.PATIENT_PASSWORD || 'Patient#2026' },
  },
};
