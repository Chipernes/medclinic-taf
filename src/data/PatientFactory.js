// Test Data Layer: фабрика сутностей. Створює унікального валідного пацієнта,
// щоб тести не залежали один від одного і могли йти паралельно.
import { DataProvider } from './DataProvider.js';

export class PatientFactory {
  static valid(overrides = {}) {
    const base = DataProvider.byId('patients.json', 'V1').patient;
    const uniq = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    return { ...base, email: `patient.${uniq}@medclinic.test`, ...overrides };
  }
}
