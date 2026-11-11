// Спільні функції для сторінок стенду
const api = async (url, method = 'GET', body) => {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (sessionStorage.getItem('token') || '') },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch (e) { /* 204 */ }
  return { status: res.status, data };
};
const showErrors = (errors = {}) => {
  document.querySelectorAll('.error').forEach(e => (e.textContent = ''));
  Object.entries(errors).forEach(([field, msg]) => {
    const el = document.querySelector(`[data-testid="error-${field}"]`);
    if (el) el.textContent = msg;
  });
};
const alertBox = (text, ok) => {
  const el = document.querySelector('[data-testid="alert"]');
  el.className = 'alert ' + (ok ? 'ok' : 'fail');
  el.textContent = text;
  el.hidden = false;
};
const header = () => {
  const name = sessionStorage.getItem('name');
  document.body.insertAdjacentHTML('afterbegin',
    `<header><b>MedClinic Portal</b><nav><span data-testid="current-user">${name || ''}</span>
     <a href="/patients.html">Пацієнти</a><a href="/appointment.html">Запис на прийом</a></nav></header>`);
};
