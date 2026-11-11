import * as allure from 'allure-js-commons';
import { test, expect } from '../fixtures.js';
import { PatientFactory } from '../../src/data/PatientFactory.js';

test.describe('Appointments API', () => {
  test('TC-API-05 Один слот лікаря не можна забронувати двічі @api @regression', async ({ patientApi, appointmentApi, cleanup }) => {
    await allure.epic('MedClinic Portal');
    await allure.feature('Запис на прийом');
    await allure.severity('critical');
    // Pre-conditions: два різні пацієнти
    const p1 = await patientApi.create(PatientFactory.valid({ fullName: 'Литвин Оксана' }));
    const p2 = await patientApi.create(PatientFactory.valid({ fullName: 'Литвин Тарас' }));
    cleanup.patients.push(p1.body.id, p2.body.id);
    const in30days = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    const slot = { doctorId: 3, date: in30days, time: '12:00' };

    const first = await appointmentApi.book({ ...slot, patientId: p1.body.id });
    expect(first.status).toBe(201);
    cleanup.appointments.push(first.body.id);

    const second = await appointmentApi.book({ ...slot, patientId: p2.body.id });
    expect(second.status).toBe(409);
    expect(second.body.error).toBe('Цей час у лікаря вже зайнятий');
  });
});
