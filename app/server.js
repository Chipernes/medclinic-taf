// MedClinic Portal - навчальний тестовий стенд (System Under Test) для ЛР5.
// Містить два навмисні дефекти (BUG-01, BUG-02), які мають знайти автотести.
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- in-memory "база даних" ----------
const users = [
  { login: 'registrar', password: 'Registrar#2026', role: 'registrar', name: 'Олена Коваль' },
  { login: 'doctor', password: 'Doctor#2026', role: 'doctor', name: 'Ігор Мельник' },
  { login: 'patient', password: 'Patient#2026', role: 'patient', name: 'Андрій Бондар' },
];
const doctors = [
  { id: 1, name: 'Ігор Мельник', specialty: 'Терапевт' },
  { id: 2, name: 'Марія Шевченко', specialty: 'Кардіолог' },
  { id: 3, name: 'Олег Ткаченко', specialty: 'Педіатр' },
];
const sessions = new Map();
let patients = [];
let appointments = [];
let seq = 1;

// Імітація реальної мережі: випадкова затримка 100-600 мс.
// Саме через неї тести з Thread.sleep() були б нестабільними (flaky).
app.use('/api', (req, res, next) => setTimeout(next, 100 + Math.floor(Math.random() * 500)));

// ---------- auth ----------
app.post('/api/auth/login', (req, res) => {
  const { login, password } = req.body || {};
  const user = users.find(u => u.login === login && u.password === password);
  if (!user) return res.status(401).json({ error: 'Невірний логін або пароль' });
  const token = crypto.randomUUID();
  sessions.set(token, user);
  res.json({ token, role: user.role, name: user.name });
});

function auth(roles) {
  return (req, res, next) => {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const user = sessions.get(token);
    if (!user) return res.status(401).json({ error: 'Потрібна авторизація' });
    if (roles && !roles.includes(user.role)) return res.status(403).json({ error: 'Недостатньо прав' });
    req.user = user;
    next();
  };
}

// ---------- validation ----------
const NAME_RE = /^[A-Za-zА-Яа-яІіЇїЄєҐґ' -]+$/;
const PHONE_RE = /^\+380\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function ageOn(birth, now = new Date()) {
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function validatePatient(p) {
  const errors = {};
  const name = (p.fullName || '').trim();
  if (name.length < 2 || name.length > 50) errors.fullName = 'ПІБ має містити від 2 до 50 символів';
  else if (!NAME_RE.test(name)) errors.fullName = 'ПІБ може містити тільки літери, пробіл, дефіс і апостроф';

  const birth = new Date(p.birthDate);
  if (!p.birthDate || Number.isNaN(birth.getTime())) errors.birthDate = 'Вкажіть коректну дату народження';
  else if (birth > new Date()) errors.birthDate = 'Дата народження не може бути в майбутньому';
  // BUG-01: за вимогою вік від 0 до 120 включно, але стоїть ">= 120" замість "> 120"
  else if (ageOn(birth) >= 120) errors.birthDate = 'Вік має бути від 0 до 120 років';

  if (!PHONE_RE.test(p.phone || '')) errors.phone = 'Телефон у форматі +380XXXXXXXXX';
  if (!EMAIL_RE.test(p.email || '')) errors.email = 'Некоректний email';
  return errors;
}

function validateAppointment(a) {
  const errors = {};
  if (!patients.find(p => p.id === Number(a.patientId))) errors.patientId = 'Пацієнта не знайдено';
  if (!doctors.find(d => d.id === Number(a.doctorId))) errors.doctorId = 'Лікаря не знайдено';
  const today = new Date().toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date || '')) errors.date = 'Вкажіть дату прийому';
  else if (a.date < today) errors.date = 'Дата прийому не може бути в минулому';
  const m = /^(\d{2}):(\d{2})$/.exec(a.time || '');
  if (!m) errors.time = 'Вкажіть час прийому';
  else {
    const h = Number(m[1]); const min = Number(m[2]);
    // BUG-02: останній слот має бути 17:30, але перевірка пропускає 18:00
    if (h < 8 || h > 18 || (h === 18 && min > 0) || ![0, 30].includes(min)) errors.time = 'Прийом можливий з 08:00 до 17:30 кожні 30 хв';
  }
  return errors;
}

// ---------- patients ----------
app.get('/api/patients', auth(['registrar', 'doctor']), (req, res) => res.json(patients));
app.post('/api/patients', auth(['registrar']), (req, res) => {
  const errors = validatePatient(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  const patient = { id: seq++, ...req.body, fullName: req.body.fullName.trim(), createdAt: new Date().toISOString() };
  patients.push(patient);
  res.status(201).json(patient);
});
app.get('/api/patients/:id', auth(['registrar', 'doctor']), (req, res) => {
  const p = patients.find(x => x.id === Number(req.params.id));
  return p ? res.json(p) : res.status(404).json({ error: 'Пацієнта не знайдено' });
});
app.delete('/api/patients/:id', auth(['registrar']), (req, res) => {
  const id = Number(req.params.id);
  patients = patients.filter(p => p.id !== id);
  appointments = appointments.filter(a => a.patientId !== id);
  res.status(204).end();
});

// ---------- doctors & appointments ----------
app.get('/api/doctors', (req, res) => res.json(doctors));
app.post('/api/appointments', auth(['registrar', 'patient']), (req, res) => {
  const errors = validateAppointment(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ errors });
  const { patientId, doctorId, date, time } = req.body;
  if (appointments.find(a => a.doctorId === Number(doctorId) && a.date === date && a.time === time))
    return res.status(409).json({ error: 'Цей час у лікаря вже зайнятий' });
  const appt = { id: seq++, patientId: Number(patientId), doctorId: Number(doctorId), date, time };
  appointments.push(appt);
  res.status(201).json(appt);
});
app.delete('/api/appointments/:id', auth(['registrar']), (req, res) => {
  appointments = appointments.filter(a => a.id !== Number(req.params.id));
  res.status(204).end();
});

app.get('/', (req, res) => res.redirect('/login.html'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`MedClinic Portal: http://localhost:${port}`));
