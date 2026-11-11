export class PatientApi {
  constructor(client) { this.client = client; }
  create(patient, opts) { return this.client.post('/api/patients', patient, opts); }
  get(id) { return this.client.get(`/api/patients/${id}`); }
  remove(id) { return this.client.delete(`/api/patients/${id}`); }
}
